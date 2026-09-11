from datetime import datetime, timedelta, timezone

import pytest

from services.aira_confirmation_tokens import (
    ConfirmationTokenError,
    create_confirmation_token,
    verify_confirmation_token,
)


def preview_claims():
    return {
        "actorId": "user-1",
        "characterId": "character-1",
        "operation": "create_habit",
        "requestId": "request-1",
        "normalizedArguments": {"name": "Read", "category": "Mind"},
        "expiresAt": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(),
    }


def test_signed_preview_token_round_trips_exact_claims():
    claims = preview_claims()

    token = create_confirmation_token(claims, secret="test-secret")

    assert verify_confirmation_token(token, secret="test-secret") == claims


def test_signed_preview_token_rejects_tampering():
    token = create_confirmation_token(preview_claims(), secret="test-secret")
    tampered = f"{'b' if token[0] != 'b' else 'c'}{token[1:]}"

    with pytest.raises(ConfirmationTokenError, match="invalid"):
        verify_confirmation_token(tampered, secret="test-secret")


def test_signed_preview_token_rejects_expiration():
    claims = preview_claims()
    claims["expiresAt"] = (datetime.now(timezone.utc) - timedelta(seconds=1)).isoformat()
    token = create_confirmation_token(claims, secret="test-secret")

    with pytest.raises(ConfirmationTokenError, match="expired"):
        verify_confirmation_token(token, secret="test-secret")
