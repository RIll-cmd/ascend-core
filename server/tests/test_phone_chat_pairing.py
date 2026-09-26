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


MIGRATION = (
    Path(__file__).resolve().parents[1]
    / "prisma/migrations/20260926_phone_discord_pairing/migration.sql"
)
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


@pytest.mark.parametrize("discord_id", ["", "abc", "1234567890123456", "123456789012345678901"])
def test_discord_requests_require_snowflake_shaped_user_id(discord_id):
    with pytest.raises(ValidationError):
        VerifyDiscordLinkRequest.model_validate({"discordUserId": discord_id})


def test_active_link_unique_indexes_preserve_revoked_history():
    # Execute the migration's real index statements against a small compatible
    # table. SQLite and PostgreSQL share the partial-index syntax used here.
    migration = MIGRATION.read_text(encoding="utf-8")
    statements = [statement.strip() for statement in migration.split(";")]
    active_indexes = [
        statement for statement in statements
        if statement.startswith("CREATE UNIQUE INDEX") and '"PhoneDiscordLink"' in statement
    ]
    assert len(active_indexes) == 2

    db = sqlite3.connect(":memory:")
    db.execute(
        'CREATE TABLE "PhoneDiscordLink" ('
        '"id" TEXT PRIMARY KEY, "ownerId" TEXT NOT NULL, '
        '"discordUserId" TEXT NOT NULL, "revokedAt" TEXT)'
    )
    for statement in active_indexes:
        db.execute(statement)

    db.execute(
        'INSERT INTO "PhoneDiscordLink" VALUES (?, ?, ?, ?)',
        ("old", "owner-1", DISCORD_ID, "2026-09-26T12:00:00Z"),
    )
    db.execute(
        'INSERT INTO "PhoneDiscordLink" VALUES (?, ?, ?, ?)',
        ("current", "owner-1", DISCORD_ID, None),
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
    db.execute('UPDATE "PhoneDiscordLink" SET "revokedAt" = ? WHERE "id" = ?',
               ("2026-09-26T12:01:00Z", "current"))
    db.execute(
        'INSERT INTO "PhoneDiscordLink" VALUES (?, ?, ?, ?)',
        ("replacement", "owner-1", DISCORD_ID, None),
    )
    assert db.execute('SELECT COUNT(*) FROM "PhoneDiscordLink"').fetchone()[0] == 3
