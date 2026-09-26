"""Strict DTOs for the authenticated phone-chat PWA and Vision worker."""
from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


PhoneChatState = Literal["queued", "claimed", "processing", "completed", "failed", "expired"]
TerminalPhoneChatState = Literal["completed", "failed", "expired"]
_IDENTIFIER_PATTERN = r"^[A-Za-z0-9_-]{1,128}$"


def _require_discord_snowflake(value: str) -> str:
    if not value.isascii() or not value.isdecimal() or value.startswith("0"):
        raise ValueError("discordUserId must be a positive decimal snowflake")
    if int(value) > 2**64 - 1:
        raise ValueError("discordUserId exceeds the unsigned 64-bit snowflake range")
    return value


class PhoneChatRequestModel(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class PhoneChatMessageRequest(PhoneChatRequestModel):
    device_id: str = Field(alias="deviceId", min_length=1, max_length=128, pattern=_IDENTIFIER_PATTERN)
    message_id: UUID = Field(alias="messageId")
    session_id: str = Field(alias="sessionId", min_length=1, max_length=128, pattern=_IDENTIFIER_PATTERN)
    text: str = Field(min_length=1, max_length=4_000)

    @field_validator("text")
    @classmethod
    def require_nonblank_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text must not be blank")
        return value


class PhoneChatDeviceResponse(PhoneChatRequestModel):
    device_id: str = Field(alias="deviceId", min_length=1, max_length=128)


class PhoneChatMessageAccepted(PhoneChatRequestModel):
    message_id: UUID = Field(alias="messageId")
    status: Literal["queued"]
    expires_at: datetime = Field(alias="expiresAt")


class PhoneChatMessageStatus(PhoneChatRequestModel):
    message_id: UUID = Field(alias="messageId")
    status: PhoneChatState
    expires_at: datetime = Field(alias="expiresAt")
    reply: str | None = Field(default=None, max_length=8_000)
    error_code: str | None = Field(default=None, alias="errorCode", max_length=64)

    @model_validator(mode="after")
    def match_payload_to_state(self):
        if self.status == "completed" and (self.reply is None or self.error_code is not None):
            raise ValueError("completed message requires reply and cannot include errorCode")
        if self.status == "failed" and (self.reply is not None or self.error_code is None):
            raise ValueError("failed message requires errorCode and cannot include reply")
        if self.status in {"queued", "claimed", "processing", "expired"} and (
            self.reply is not None or self.error_code is not None
        ):
            raise ValueError("non-terminal message cannot include a reply or errorCode")
        return self


class PhoneChatWorkerJob(PhoneChatRequestModel):
    message_id: UUID = Field(alias="messageId")
    owner_id: str = Field(alias="ownerId", min_length=1, max_length=128)
    device_id: str = Field(alias="deviceId", min_length=1, max_length=128, pattern=_IDENTIFIER_PATTERN)
    session_id: str = Field(alias="sessionId", min_length=1, max_length=128, pattern=_IDENTIFIER_PATTERN)
    text: str = Field(min_length=1, max_length=4_000)
    expires_at: datetime = Field(alias="expiresAt")
    attempt: int = Field(ge=1, le=3)
    lease_id: str = Field(alias="leaseId", min_length=1, max_length=128, pattern=_IDENTIFIER_PATTERN)
    lease_expires_at: datetime = Field(alias="leaseExpiresAt")

    @field_validator("expires_at", "lease_expires_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("timestamps must include a timezone offset")
        return value

    @field_validator("text")
    @classmethod
    def require_nonblank_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text must not be blank")
        return value


class PhoneChatWorkerResult(PhoneChatRequestModel):
    status: Literal["completed", "failed"]
    reply: str | None = Field(default=None, max_length=8_000)
    error_code: str | None = Field(default=None, alias="errorCode", max_length=64,
                                   pattern=r"^[a-z0-9_]{1,64}$")

    @field_validator("reply")
    @classmethod
    def require_nonblank_reply(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("reply must not be blank")
        return value

    @model_validator(mode="after")
    def require_result_for_terminal_status(self):
        if self.status == "completed" and (self.reply is None or self.error_code is not None):
            raise ValueError("completed result requires reply and cannot include errorCode")
        if self.status == "failed" and (self.reply is not None or self.error_code is None):
            raise ValueError("failed result requires errorCode and cannot include reply")
        return self


class PhoneChatTombstoneResponse(PhoneChatRequestModel):
    message_id: UUID = Field(alias="messageId")
    status: TerminalPhoneChatState
    expires_at: datetime = Field(alias="expiresAt")


class CreateDiscordPairingResponse(PhoneChatRequestModel):
    code: str = Field(strict=True, min_length=43, max_length=43, pattern=r"^[A-Za-z0-9_-]{43}$")
    expires_at: datetime = Field(alias="expiresAt")

    @field_validator("expires_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("expiresAt must include a timezone offset")
        return value


class ConsumeDiscordPairingRequest(PhoneChatRequestModel):
    code: str = Field(strict=True, min_length=43, max_length=43, pattern=r"^[A-Za-z0-9_-]{43}$")
    discord_user_id: str = Field(alias="discordUserId", strict=True)

    @field_validator("discord_user_id")
    @classmethod
    def require_discord_snowflake(cls, value: str) -> str:
        return _require_discord_snowflake(value)


class VerifyDiscordLinkRequest(PhoneChatRequestModel):
    discord_user_id: str = Field(alias="discordUserId", strict=True)

    @field_validator("discord_user_id")
    @classmethod
    def require_discord_snowflake(cls, value: str) -> str:
        return _require_discord_snowflake(value)
