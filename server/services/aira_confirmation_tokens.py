"""Signed, opaque confirmation tokens for AIRA Phase B previews."""

import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timezone
from typing import Any


class ConfirmationTokenError(ValueError):
    """A token is malformed, altered, or can no longer be used."""


def _signing_secret(secret: str | None) -> bytes:
    return (secret or os.getenv("SECRET_KEY", "ascend_os_super_secret_key_change_me_in_prod")).encode("utf-8")


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def create_confirmation_token(claims: dict[str, Any], *, secret: str | None = None) -> str:
    """Create a signed token; callers provide only safe normalized preview data."""
    payload = json.dumps(claims, sort_keys=True, separators=(",", ":")).encode("utf-8")
    signature = hmac.new(_signing_secret(secret), payload, hashlib.sha256).digest()
    return f"{_encode(payload)}.{_encode(signature)}"


def verify_confirmation_token(token: str, *, secret: str | None = None) -> dict[str, Any]:
    """Verify integrity and expiration before an execution request is accepted."""
    try:
        payload_part, signature_part = token.split(".", 1)
        payload = _decode(payload_part)
        supplied_signature = _decode(signature_part)
    except (ValueError, TypeError, UnicodeError) as error:
        raise ConfirmationTokenError("invalid confirmation token") from error

    expected_signature = hmac.new(_signing_secret(secret), payload, hashlib.sha256).digest()
    if not hmac.compare_digest(supplied_signature, expected_signature):
        raise ConfirmationTokenError("invalid confirmation token")

    try:
        claims = json.loads(payload)
        expires_at = datetime.fromisoformat(claims["expiresAt"].replace("Z", "+00:00"))
        if expires_at.tzinfo is None:
            raise ValueError("expiresAt must include a timezone")
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
        raise ConfirmationTokenError("invalid confirmation token") from error

    if expires_at <= datetime.now(timezone.utc):
        raise ConfirmationTokenError("confirmation token expired")
    return claims
