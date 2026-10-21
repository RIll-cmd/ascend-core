"""Strict DTOs for consented companion notification management."""
from __future__ import annotations

from datetime import datetime
import re
from typing import Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, field_validator


class NotificationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class NotificationPreferenceRequest(NotificationRequest):
    channel: Literal["pwa_push", "discord_dm"]
    enabled: bool


class PushSubscriptionKeys(NotificationRequest):
    p256dh: str = Field(min_length=16, max_length=256, pattern=r"^[A-Za-z0-9_-]+={0,2}$")
    auth: str = Field(min_length=8, max_length=128, pattern=r"^[A-Za-z0-9_-]+={0,2}$")


class PushSubscriptionRequest(NotificationRequest):
    device_id: str = Field(alias="deviceId", min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")
    endpoint: str = Field(min_length=20, max_length=2_048)
    keys: PushSubscriptionKeys

    @field_validator("endpoint")
    @classmethod
    def require_https_endpoint(cls, value: str) -> str:
        parts = urlsplit(value)
        if parts.scheme != "https" or not parts.hostname or parts.username or parts.password or parts.fragment:
            raise ValueError("Push endpoint must be an HTTPS capability URL")
        return value


class NotificationPublishRequest(NotificationRequest):
    trigger_key: str = Field(alias="triggerKey", min_length=1, max_length=128,
                             pattern=r"^[A-Za-z0-9._:-]+$")
    category: str = Field(min_length=1, max_length=64)
    detail: str = Field(min_length=1, max_length=2_000)
    expires_at: datetime | None = Field(default=None, alias="expiresAt")

    @field_validator("category", "detail")
    @classmethod
    def require_single_line(cls, value: str) -> str:
        if not value.strip() or "\n" in value or "\r" in value:
            raise ValueError("Notification text must be nonempty and single-line")
        return value

    @field_validator("expires_at")
    @classmethod
    def require_aware_expiry(cls, value: datetime | None) -> datetime | None:
        if value is not None and (value.tzinfo is None or value.utcoffset() is None):
            raise ValueError("expiresAt must include a timezone")
        return value


class NotificationOutcomeRequest(NotificationRequest):
    claim_id: str = Field(alias="claimId", min_length=1, max_length=64, pattern=r"^[A-Za-z0-9-]+$")
    outcome: Literal["attempted", "acknowledged", "unknown", "failed"]
    retryable: bool = False
    revoke_destination: bool = Field(default=False, alias="revokeDestination")
