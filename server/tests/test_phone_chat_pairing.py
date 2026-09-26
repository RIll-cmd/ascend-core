"""Persistence contract checks for Discord phone pairing."""

from datetime import datetime, timezone
from pathlib import Path
import sqlite3
import asyncio
from contextlib import asynccontextmanager
from datetime import timedelta
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from schemas.phone_chat import (
    ConsumeDiscordPairingRequest,
    CreateDiscordPairingResponse,
    VerifyDiscordLinkRequest,
)
from services.phone_chat_pairing import PhoneChatPairing
from services import phone_chat_pairing as pairing_module


SCHEMA = Path(__file__).resolve().parents[1] / "prisma/schema.prisma"
CODE = "A" * 43
DISCORD_ID = "123456789012345678"


def test_pairing_response_accepts_public_code_and_timezone_aware_expiry():
    response = CreateDiscordPairingResponse.model_validate(
        {"code": CODE, "expiresAt": "2026-09-26T12:05:00Z"}
    )

    assert response.code == CODE
    assert response.expires_at == datetime(2026, 9, 26, 12, 5, tzinfo=timezone.utc)
    assert response.model_dump(by_alias=True)["expiresAt"] == response.expires_at

    with pytest.raises(ValidationError):
        CreateDiscordPairingResponse.model_validate(
            {"code": CODE, "expiresAt": "2026-09-26T12:05:00"}
        )


@pytest.mark.parametrize("code", ["", "short", "A" * 44, "!" * 43])
def test_pairing_request_rejects_codes_outside_token_urlsafe_32_shape(code):
    with pytest.raises(ValidationError):
        ConsumeDiscordPairingRequest.model_validate(
            {"code": code, "discordUserId": DISCORD_ID}
        )


@pytest.mark.parametrize("request_type,payload", [
    (ConsumeDiscordPairingRequest, {"code": CODE, "discordUserId": DISCORD_ID}),
    (VerifyDiscordLinkRequest, {"discordUserId": DISCORD_ID}),
])
def test_discord_requests_accept_valid_ids_and_reject_caller_selected_owner(request_type, payload):
    request = request_type.model_validate(payload)
    assert request.discord_user_id == DISCORD_ID

    with pytest.raises(ValidationError):
        request_type.model_validate({**payload, "ownerId": "another-user"})


@pytest.mark.parametrize("request_type", [ConsumeDiscordPairingRequest, VerifyDiscordLinkRequest])
@pytest.mark.parametrize("discord_id", ["1", "1234567890123456", "18446744073709551615"])
def test_discord_requests_accept_unsigned_64_bit_legacy_and_current_ids(request_type, discord_id):
    payload = {"discordUserId": discord_id}
    if request_type is ConsumeDiscordPairingRequest:
        payload["code"] = CODE
    assert request_type.model_validate(payload).discord_user_id == discord_id


@pytest.mark.parametrize("request_type", [ConsumeDiscordPairingRequest, VerifyDiscordLinkRequest])
@pytest.mark.parametrize("discord_id", ["", "0", "01", "abc", "-1", " 1", "1.0", "18446744073709551616", 1])
def test_discord_requests_reject_non_snowflake_numeric_values(request_type, discord_id):
    payload = {"discordUserId": discord_id}
    if request_type is ConsumeDiscordPairingRequest:
        payload["code"] = CODE
    with pytest.raises(ValidationError):
        request_type.model_validate(payload)


def test_prisma_link_contract_uses_unique_nullable_current_slot():
    schema = SCHEMA.read_text(encoding="utf-8")
    link_model = schema.split("model PhoneDiscordLink {", 1)[1].split("}", 1)[0]
    fields = {line.split()[0]: line.split()[1:] for line in link_model.splitlines() if line.strip() and not line.strip().startswith("//")}
    assert "@unique" in fields["ownerId"]
    assert fields["discordUserId"][0] == "String?"
    assert "@unique" in fields["discordUserId"]


def test_unique_slot_rejects_duplicate_owner_or_discord_and_allows_relink_after_revoke():
    db = sqlite3.connect(":memory:")
    db.execute(
        'CREATE TABLE "PhoneDiscordLink" ('
        '"id" TEXT PRIMARY KEY, "ownerId" TEXT NOT NULL UNIQUE, '
        '"discordUserId" TEXT UNIQUE, "revokedAt" TEXT)'
    )
    db.execute(
        'INSERT INTO "PhoneDiscordLink" VALUES (?, ?, ?, ?)',
        ("slot-1", "owner-1", DISCORD_ID, None),
    )
    with pytest.raises(sqlite3.IntegrityError):
        db.execute(
            'INSERT INTO "PhoneDiscordLink" VALUES (?, ?, ?, ?)',
            ("same-owner", "owner-1", "223456789012345678", None),
        )
    with pytest.raises(sqlite3.IntegrityError):
        db.execute(
            'INSERT INTO "PhoneDiscordLink" VALUES (?, ?, ?, ?)',
            ("same-discord", "owner-2", DISCORD_ID, None),
        )
    db.execute('UPDATE "PhoneDiscordLink" SET "discordUserId" = NULL, "revokedAt" = ? WHERE "id" = ?',
               ("2026-09-26T12:01:00Z", "slot-1"))
    db.execute(
        'INSERT INTO "PhoneDiscordLink" VALUES (?, ?, ?, ?)',
        ("slot-2", "owner-2", DISCORD_ID, None),
    )
    db.execute('UPDATE "PhoneDiscordLink" SET "discordUserId" = ?, "revokedAt" = NULL WHERE "id" = ?',
               ("223456789012345678", "slot-1"))
    assert db.execute('SELECT COUNT(*) FROM "PhoneDiscordLink"').fetchone()[0] == 2


class _Table:
    def __init__(self, rows):
        self.rows = rows

    @staticmethod
    def _matches(row, where):
        for key, wanted in where.items():
            actual = getattr(row, key)
            if isinstance(wanted, dict):
                if "lt" in wanted and not actual < wanted["lt"]:
                    return False
                if "gt" in wanted and not actual > wanted["gt"]:
                    return False
                if "not" in wanted and actual == wanted["not"]:
                    return False
            elif actual != wanted:
                return False
        return True

    async def create(self, *, data):
        row = SimpleNamespace(**{"id": f"row-{len(self.rows) + 1}", "consumedAt": None,
                                 "revokedAt": None, "discordUserId": None, **data})
        self.rows.append(row)
        return row

    async def update_many(self, *, where, data):
        count = 0
        for row in self.rows:
            if self._matches(row, where):
                for key, value in data.items():
                    setattr(row, key, getattr(row, key) + value["increment"]
                            if isinstance(value, dict) else value)
                count += 1
        return SimpleNamespace(count=count)

    async def find_unique(self, *, where):
        return next((row for row in self.rows if self._matches(row, where)), None)

    async def upsert(self, *, where, create, update):
        row = await self.find_unique(where=where)
        if row:
            for key, value in update.items():
                setattr(row, key, value)
            return row
        if create["discordUserId"] in [r.discordUserId for r in self.rows if r.discordUserId]:
            raise ValueError("unique Discord ID")
        return await self.create(data=create)


class _PairingDB:
    def __init__(self):
        self.phonediscordpairing = _Table([])
        self.phonediscordlink = _Table([])
        self._lock = asyncio.Lock()

    @asynccontextmanager
    async def tx(self):
        async with self._lock:
            yield self

    async def query_raw(self, statement, owner_id):
        assert statement == 'SELECT id FROM "User" WHERE id = $1 FOR UPDATE'
        return [{"id": owner_id}]


def _service():
    database = _PairingDB()
    return PhoneChatPairing(database, owner_id="owner-1", hmac_secret="hash-secret",
                            bridge_token="bridge-secret"), database


def test_pairing_code_is_hashed_at_rest_and_replaced_by_next_code():
    async def scenario():
        service, database = _service()
        now = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        first = await service.create_pairing("owner-1", now)
        second = await service.create_pairing("owner-1", now)
        assert first.code != second.code
        assert first.expires_at == now + timedelta(minutes=5)
        assert first.code not in repr(database.phonediscordpairing.rows)
        assert not await service.consume_pairing(first.code, DISCORD_ID, now)
        assert await service.consume_pairing(second.code, DISCORD_ID, now)
        assert not await service.consume_pairing(second.code, DISCORD_ID, now)
        assert database.phonediscordpairing.rows[-1].attempts == 2
        assert await service.verify_link(DISCORD_ID) == "owner-1"
    asyncio.run(scenario())


def test_expired_code_and_fifth_conflicting_attempt_cannot_link():
    async def scenario():
        service, database = _service()
        now = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        expired = await service.create_pairing("owner-1", now)
        assert not await service.consume_pairing(expired.code, DISCORD_ID, now + timedelta(minutes=5))
        assert database.phonediscordpairing.rows[0].attempts == 1
        for _ in range(6):
            assert not await service.consume_pairing(expired.code, DISCORD_ID, now + timedelta(minutes=5))
        assert database.phonediscordpairing.rows[0].attempts == 5
        await database.phonediscordlink.create(data={
            "ownerId": "owner-2", "discordUserId": DISCORD_ID,
        })
        fresh = await service.create_pairing("owner-1", now)
        for _ in range(5):
            assert not await service.consume_pairing(fresh.code, DISCORD_ID, now)
        assert database.phonediscordpairing.rows[-1].attempts == 5
        assert not await service.consume_pairing(fresh.code, "223456789012345678", now)
    asyncio.run(scenario())


def test_revocation_clears_binding_and_allows_relink():
    async def scenario():
        service, database = _service()
        now = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        first = await service.create_pairing("owner-1", now)
        assert await service.consume_pairing(first.code, DISCORD_ID, now)
        assert await service.link_status("owner-1")
        assert await service.revoke_link("owner-1", now)
        assert await service.verify_link(DISCORD_ID) is None
        assert not await service.link_status("owner-1")
        assert database.phonediscordlink.rows[0].discordUserId is None
        second = await service.create_pairing("owner-1", now)
        assert await service.consume_pairing(second.code, "223456789012345678", now)
        assert len(database.phonediscordlink.rows) == 1
    asyncio.run(scenario())


def test_active_owner_link_cannot_be_silently_reassigned():
    async def scenario():
        service, database = _service()
        now = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        first = await service.create_pairing("owner-1", now)
        assert await service.consume_pairing(first.code, DISCORD_ID, now)
        second = await service.create_pairing("owner-1", now)
        assert not await service.consume_pairing(second.code, "223456789012345678", now)
        assert database.phonediscordpairing.rows[-1].attempts == 1
        assert await service.verify_link(DISCORD_ID) == "owner-1"
        assert await service.verify_link("223456789012345678") is None
    asyncio.run(scenario())


def test_concurrent_consumption_only_links_one_discord_account():
    async def scenario():
        service, _ = _service()
        now = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        pairing = await service.create_pairing("owner-1", now)
        results = await asyncio.gather(
            service.consume_pairing(pairing.code, DISCORD_ID, now),
            service.consume_pairing(pairing.code, "223456789012345678", now),
        )
        assert results.count(True) == 1
        assert bool(await service.verify_link(DISCORD_ID)) != bool(await service.verify_link("223456789012345678"))
    asyncio.run(scenario())


def test_pairing_fails_closed_without_distinct_secrets_or_configured_owner():
    async def scenario():
        now = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        for owner, hmac_secret, bridge_token in [
            (None, "hash-secret", "bridge-secret"),
            ("owner-1", None, "bridge-secret"),
            ("owner-1", "hash-secret", None),
            ("owner-1", "same-secret", "same-secret"),
        ]:
            service = PhoneChatPairing(_PairingDB(), owner_id=owner,
                                       hmac_secret=hmac_secret, bridge_token=bridge_token)
            with pytest.raises(PermissionError):
                await service.create_pairing("owner-1", now)
            with pytest.raises(PermissionError):
                await service.verify_link(DISCORD_ID)
        service, _ = _service()
        with pytest.raises(PermissionError):
            await service.create_pairing("owner-2", now)
        worker_key_reused = PhoneChatPairing(
            _PairingDB(), owner_id="owner-1", hmac_secret="worker-secret",
            bridge_token="bridge-secret", worker_token="worker-secret",
        )
        with pytest.raises(PermissionError):
            await worker_key_reused.create_pairing("owner-1", now)
    asyncio.run(scenario())


def test_waiting_for_owner_lock_cannot_extend_pairing_lifetime(monkeypatch):
    class Clock:
        after_lock = False

        @classmethod
        def now(cls, _timezone):
            return (datetime(2026, 9, 26, 12, 5, 1, tzinfo=timezone.utc)
                    if cls.after_lock else datetime(2026, 9, 26, 12, 4, 59, tzinfo=timezone.utc))

    class DelayedLockDB(_PairingDB):
        async def query_raw(self, statement, owner_id):
            Clock.after_lock = True
            return await super().query_raw(statement, owner_id)

    async def scenario():
        database = DelayedLockDB()
        service = PhoneChatPairing(database, owner_id="owner-1", hmac_secret="hash-secret",
                                   bridge_token="bridge-secret")
        issued_at = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        pairing = await service.create_pairing("owner-1", issued_at)
        Clock.after_lock = False
        monkeypatch.setattr(pairing_module, "datetime", Clock)
        assert not await service.consume_pairing(pairing.code, DISCORD_ID)
        assert database.phonediscordpairing.rows[0].attempts == 1
        assert await service.verify_link(DISCORD_ID) is None
    asyncio.run(scenario())
