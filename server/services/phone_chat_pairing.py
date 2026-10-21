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
                 bridge_token: str | None = None, worker_token: str | None = None):
        self.db = database
        self.owner_id = owner_id.strip() if owner_id else None
        self.hmac_secret = hmac_secret or ""
        self.bridge_token = bridge_token or ""
        self.worker_token = worker_token or ""

    def _configured(self) -> None:
        if (not self.owner_id or not self.hmac_secret or not self.bridge_token
                or secrets.compare_digest(self.hmac_secret, self.bridge_token)
                or (self.worker_token and secrets.compare_digest(self.hmac_secret, self.worker_token))):
            raise PermissionError("Discord pairing is unavailable")

    def _require_owner(self, owner_id: str) -> None:
        self._configured()
        if not secrets.compare_digest(owner_id, self.owner_id):
            raise PermissionError("Phone chat is not available for this account")

    def _code_hash(self, code: str) -> str:
        return hmac.new(self.hmac_secret.encode(), code.encode(), hashlib.sha256).hexdigest()

    @staticmethod
    async def _invalidate_browser_generation(tx, link_id: str, generation: int, now: datetime) -> None:
        # Pairing contract doubles predate the additive browser tables.
        if not hasattr(tx, "execute_raw"):
            return
        await tx.query_raw(
            '''SELECT "id" FROM "BrowserRemoteSession" WHERE "sourceDiscordLinkId"=$1
                 AND "discordGeneration"=$2 AND "endedAt" IS NULL FOR UPDATE''', link_id, generation,
        )
        await tx.execute_raw(
            '''UPDATE "BrowserRemoteSession" SET "endedAt"=COALESCE("endedAt",$3)
               WHERE "sourceDiscordLinkId"=$1 AND "discordGeneration"=$2''', link_id, generation, now,
        )
        await tx.execute_raw(
            '''UPDATE "BrowserTask" SET
                 "state"=CASE WHEN "state" IN ('queued','claimed') THEN 'cancelled'::"BrowserRemoteTaskState"
                               WHEN "state" IN ('running','paused','waiting_for_user') THEN 'stopping'::"BrowserRemoteTaskState"
                               ELSE "state" END,
                 "cancelRequested"=TRUE,"requestedControl"='stop',"goal"=NULL,"resultJson"=NULL,
                 "terminalReason"='discord_link_changed',
                 "completedAt"=CASE WHEN "state" IN ('queued','claimed') THEN $3 ELSE "completedAt" END,
                 "claimTokenHash"=CASE WHEN "state" IN ('queued','claimed') THEN NULL ELSE "claimTokenHash" END,
                 "leaseExpiresAt"=CASE WHEN "state" IN ('queued','claimed') THEN NULL ELSE "leaseExpiresAt" END
               WHERE "sessionId" IN (SELECT "id" FROM "BrowserRemoteSession" WHERE "sourceDiscordLinkId"=$1 AND "discordGeneration"=$2)
                 AND "state" IN ('queued','claimed','running','paused','waiting_for_user','stopping')''',
            link_id, generation, now,
        )
        await tx.execute_raw(
            '''UPDATE "BrowserTask" SET "goal"=NULL,"resultJson"=NULL,"currentProposalId"=NULL,"waitingForUserType"=NULL
               WHERE "sessionId" IN (SELECT "id" FROM "BrowserRemoteSession" WHERE "sourceDiscordLinkId"=$1 AND "discordGeneration"=$2)''', link_id, generation,
        )
        await tx.execute_raw(
            '''DELETE FROM "BrowserTaskEvent" WHERE "taskId" IN
               (SELECT t."id" FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                 WHERE s."sourceDiscordLinkId"=$1 AND s."discordGeneration"=$2)''', link_id, generation,
        )
        await tx.execute_raw(
            '''DELETE FROM "BrowserTaskReconciliation" WHERE "taskId" IN
               (SELECT t."id" FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                WHERE s."sourceDiscordLinkId"=$1 AND s."discordGeneration"=$2)''', link_id, generation,
        )
        await tx.execute_raw(
            '''UPDATE "BrowserActionReview" SET "proposalJson"=NULL,"decision"=NULL WHERE "taskId" IN
               (SELECT t."id" FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                 WHERE s."sourceDiscordLinkId"=$1 AND s."discordGeneration"=$2)''', link_id, generation,
        )
        await tx.execute_raw(
            '''UPDATE "BrowserReviewAccess" SET "revokedAt"=COALESCE("revokedAt",$3) WHERE "taskId" IN
               (SELECT t."id" FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                 WHERE s."sourceDiscordLinkId"=$1 AND s."discordGeneration"=$2)''', link_id, generation, now,
        )

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
            checked_at = now if now is not None else datetime.now(timezone.utc)
            if challenge.consumedAt is not None or challenge.expiresAt <= checked_at:
                return False
            owner_link = await tx.phonediscordlink.find_unique(where={"ownerId": self.owner_id})
            if owner_link and owner_link.revokedAt is None and owner_link.discordUserId:
                if owner_link.discordUserId != discord_user_id:
                    return False
            other_link = await tx.phonediscordlink.find_unique(where={"discordUserId": discord_user_id})
            if other_link and other_link.ownerId != self.owner_id:
                return False
            consumed = await tx.phonediscordpairing.update_many(
                where={"id": challenge.id, "consumedAt": None}, data={"consumedAt": checked_at},
            )
            if not getattr(consumed, "count", consumed if isinstance(consumed, int) else 0):
                return False
            if not owner_link or owner_link.revokedAt is not None or not owner_link.discordUserId:
                if owner_link:
                    await self._invalidate_browser_generation(tx, owner_link.id, owner_link.generation, checked_at)
                await tx.phonediscordlink.upsert(
                    where={"ownerId": self.owner_id},
                    data={
                        "create": {
                            "ownerId": self.owner_id,
                            "discordUserId": discord_user_id,
                            "generation": 1,
                            "createdAt": checked_at,
                        },
                        "update": {
                            "discordUserId": discord_user_id,
                            "revokedAt": None,
                            "generation": {"increment": 1},
                        },
                    },
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
            link = await tx.phonediscordlink.find_unique(where={"ownerId": owner_id})
            if link and link.discordUserId and link.revokedAt is None:
                await self._invalidate_browser_generation(tx, link.id, link.generation, now)
            changed = await tx.phonediscordlink.update_many(
                where={"ownerId": owner_id, "discordUserId": {"not": None}, "revokedAt": None},
                data={"discordUserId": None, "revokedAt": now, "generation": {"increment": 1}},
            )
            await tx.phonediscordpairing.update_many(
                where={"ownerId": owner_id, "consumedAt": None}, data={"consumedAt": now},
            )
        return bool(getattr(changed, "count", changed if isinstance(changed, int) else 0))
