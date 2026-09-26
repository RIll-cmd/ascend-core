"""Persistence contract checks for Discord phone pairing."""

from datetime import datetime, timezone
from pathlib import Path
import sqlite3

import pytest
from pydantic import ValidationError

from schemas.phone_chat import (
    ConsumeDiscordPairingRequest,
    CreateDiscordPairingResponse,
    VerifyDiscordLinkRequest,
)


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
