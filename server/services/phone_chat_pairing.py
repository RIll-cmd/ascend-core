"""One-time Discord account pairing for the configured phone-chat owner."""
from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from schemas.phone_chat import CreateDiscordPairingResponse


PAIRING_TTL = timedelta(minutes=5)
MAX_ATTEMPTS = 5


class PhoneChatPairing:
    def __init__(self, database, *, owner_id: str | None, hmac_secret: str | None,
                 bridge_token: str | None = None):
        self.db = database
        self.owner_id = owner_id.strip() if owner_id else None
        self.hmac_secret = hmac_secret or ""
        self.bridge_token = bridge_token or ""

    def _configured(self) -> None:
        if (not self.owner_id or not self.hmac_secret or not self.bridge_token
                or secrets.compare_digest(self.hmac_secret, self.bridge_token)):
            raise PermissionError("Discord pairing is unavailable")

    def _require_owner(self, owner_id: str) -> None:
        self._configured()
        if not secrets.compare_digest(owner_id, self.owner_id):
            raise PermissionError("Phone chat is not available for this account")

    def _code_hash(self, code: str) -> str:
        return hmac.new(self.hmac_secret.encode(), code.encode(), hashlib.sha256).hexdigest()

    async def create_pairing(self, owner_id: str, now: datetime | None = None) -> CreateDiscordPairingResponse:
        self._require_owner(owner_id)
        now = now or datetime.now(timezone.utc)
        code = secrets.token_urlsafe(32)
        expires_at = now + PAIRING_TTL
        async with self.db.tx() as tx:
            if not await tx.query_raw('SELECT id FROM "User" WHERE id = $1 FOR UPDATE', owner_id):
                raise PermissionError("Phone chat is not available for this account")
            await tx.phonediscordpairing.update_many(
                where={"ownerId": owner_id, "consumedAt": None}, data={"consumedAt": now},
            )
            await tx.phonediscordpairing.create(data={
                "ownerId": owner_id, "codeHash": self._code_hash(code),
                "attempts": 0, "expiresAt": expires_at, "createdAt": now,
            })
        return CreateDiscordPairingResponse(code=code, expiresAt=expires_at)

    async def consume_pairing(self, code: str, discord_user_id: str,
                              now: datetime | None = None) -> bool:
        self._configured()
        now = now or datetime.now(timezone.utc)
        code_hash = self._code_hash(code)
        async with self.db.tx() as tx:
            if not await tx.query_raw('SELECT id FROM "User" WHERE id = $1 FOR UPDATE', self.owner_id):
                return False
            challenge = await tx.phonediscordpairing.find_unique(where={"codeHash": code_hash})
            if not challenge or not hmac.compare_digest(challenge.codeHash, code_hash):
                return False
            if challenge.ownerId != self.owner_id or challenge.attempts >= MAX_ATTEMPTS:
                return False
            claimed = await tx.phonediscordpairing.update_many(
                where={"id": challenge.id, "attempts": {"lt": MAX_ATTEMPTS}},
                data={"attempts": {"increment": 1}},
            )
            if not getattr(claimed, "count", claimed if isinstance(claimed, int) else 0):
                return False
            if challenge.consumedAt is not None or challenge.expiresAt <= now:
                return False
            owner_link = await tx.phonediscordlink.find_unique(where={"ownerId": self.owner_id})
            if owner_link and owner_link.revokedAt is None and owner_link.discordUserId:
                if owner_link.discordUserId != discord_user_id:
                    return False
            other_link = await tx.phonediscordlink.find_unique(where={"discordUserId": discord_user_id})
            if other_link and other_link.ownerId != self.owner_id:
                return False
            consumed = await tx.phonediscordpairing.update_many(
                where={"id": challenge.id, "consumedAt": None}, data={"consumedAt": now},
            )
            if not getattr(consumed, "count", consumed if isinstance(consumed, int) else 0):
                return False
            if not owner_link or owner_link.revokedAt is not None or not owner_link.discordUserId:
                await tx.phonediscordlink.upsert(
                    where={"ownerId": self.owner_id},
                    create={"ownerId": self.owner_id, "discordUserId": discord_user_id,
                            "createdAt": now},
                    update={"discordUserId": discord_user_id, "revokedAt": None},
                )
            return True

    async def verify_link(self, discord_user_id: str) -> str | None:
        self._configured()
        link = await self.db.phonediscordlink.find_unique(where={"discordUserId": discord_user_id})
        if (link and link.ownerId == self.owner_id and link.revokedAt is None
                and link.discordUserId == discord_user_id):
            return self.owner_id
        return None

    async def link_status(self, owner_id: str) -> bool:
        self._require_owner(owner_id)
        link = await self.db.phonediscordlink.find_unique(where={"ownerId": owner_id})
        return bool(link and link.revokedAt is None and link.discordUserId)

    async def revoke_link(self, owner_id: str, now: datetime | None = None) -> bool:
        self._require_owner(owner_id)
        now = now or datetime.now(timezone.utc)
        async with self.db.tx() as tx:
            if not await tx.query_raw('SELECT id FROM "User" WHERE id = $1 FOR UPDATE', owner_id):
                return False
            changed = await tx.phonediscordlink.update_many(
                where={"ownerId": owner_id, "discordUserId": {"not": None}, "revokedAt": None},
                data={"discordUserId": None, "revokedAt": now},
            )
            await tx.phonediscordpairing.update_many(
                where={"ownerId": owner_id, "consumedAt": None}, data={"consumedAt": now},
            )
        return bool(getattr(changed, "count", changed if isinstance(changed, int) else 0))
