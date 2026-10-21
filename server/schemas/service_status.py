"""Versioned, privacy-safe status shelf API contracts."""

from __future__ import annotations

from datetime import datetime
import hashlib
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

ServiceState = Literal["idle", "working", "stuck", "offline"]
ProducerState = Literal["idle", "working", "stuck"]
ServiceType = Literal["agent", "assistant", "bot", "vision", "provider"]

_PROHIBITED_KEYS = {
    "prompt", "prompts", "code", "patch", "patches", "screenshot", "screenshots",
    "terminal", "terminaloutput", "terminal_output", "rawlog", "rawlogs", "logoutput",
    "token", "tokens", "apikey", "apikeys", "api_key", "secret", "secrets", "password", "cookie", "cookies",
    "authorization", "authheader", "auth_header", "usercontent", "user_content", "usermessage", "messagecontent",
    "trace", "stacktrace", "fulltrace", "camera", "image", "images", "biometric", "pii", "personaldata",
}


def _validate_safe_value(value: Any) -> Any:
    if isinstance(value, dict):
        for key, nested in value.items():
            normalized = str(key).replace("-", "").replace("_", "").casefold()
            if normalized in _PROHIBITED_KEYS:
                raise ValueError(f"prohibited status payload field: {key}")
            _validate_safe_value(nested)
    elif isinstance(value, list):
        for nested in value:
            _validate_safe_value(nested)
    elif isinstance(value, str):
        # Status labels/messages are summaries, never transcripts or source material.
        if "```" in value or "\n" in value or "\r" in value:
            raise ValueError("prohibited multiline status payload material")
    return value


class SafeActivity(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    kind: str = Field(min_length=1, max_length=64)
    label: str | None = Field(default=None, max_length=160)
    started_at: datetime | None = Field(default=None, alias="startedAt")
    progress: float | None = Field(default=None, ge=0, le=1)

    @field_validator("label")
    @classmethod
    def reject_unsafe_label(cls, value: str | None) -> str | None:
        return _validate_safe_value(value)


class SafeIssue(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    code: str = Field(min_length=1, max_length=64)
    message: str = Field(min_length=1, max_length=240)
    retryable: bool
    operation_id: str | None = Field(default=None, alias="operationId", min_length=1, max_length=128)

    @field_validator("message")
    @classmethod
    def reject_unsafe_message(cls, value: str) -> str:
        return _validate_safe_value(value)

    @model_validator(mode="after")
    def validate_needs_input_identity(self) -> SafeIssue:
        if self.code == "needs_input" and not self.operation_id:
            raise ValueError("needs_input requires an operationId")
        if self.code != "needs_input" and self.operation_id is not None:
            raise ValueError("operationId is only valid for needs_input")
        return self


class SafeProvider(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(min_length=1, max_length=64)
    model: str | None = Field(default=None, max_length=96)
    degraded: bool = False


class ServiceStatusEvent(BaseModel):
    """The schema-version 1 producer event contract from the status spec."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    schema_version: Literal[1] = Field(alias="schemaVersion")
    event_id: UUID = Field(alias="eventId")
    sequence: int | None = Field(default=None, ge=0)
    service_id: str = Field(alias="serviceId", min_length=1, max_length=128, pattern=r"^[a-z0-9][a-z0-9._-]*$")
    instance_id: str = Field(alias="instanceId", min_length=1, max_length=128, pattern=r"^[a-z0-9][a-z0-9._-]*$")
    service_type: ServiceType = Field(alias="serviceType")
    state: ProducerState
    state_since: datetime = Field(alias="stateSince")
    reported_at: datetime = Field(alias="reportedAt")
    activity: SafeActivity | None = None
    issue: SafeIssue | None = None
    provider: SafeProvider | None = None
    capabilities: list[str] = Field(default_factory=list, max_length=32)
    metadata: dict[str, str | int | float | bool | None] = Field(default_factory=dict)

    @field_validator("state_since", "reported_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("status timestamps must include a timezone offset")
        return value

    @field_validator("capabilities")
    @classmethod
    def validate_capabilities(cls, value: list[str]) -> list[str]:
        for capability in value:
            if not capability or len(capability) > 64:
                raise ValueError("capabilities must be short non-empty identifiers")
            _validate_safe_value(capability)
        return value

    @field_validator("metadata")
    @classmethod
    def validate_metadata(cls, value: dict[str, str | int | float | bool | None]) -> dict[str, str | int | float | bool | None]:
        return _validate_safe_value(value)

    @model_validator(mode="after")
    def validate_needs_input_evidence(self) -> ServiceStatusEvent:
        if self.issue and self.issue.code == "needs_input":
            if (self.state != "working" or self.activity is None
                    or self.activity.kind != "operation" or self.activity.started_at is None):
                raise ValueError("needs_input requires a current working operation")
        return self


class ShelfIssue(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    code: str = Field(min_length=1, max_length=64)
    message: str = Field(min_length=1, max_length=240)
    retryable: bool
    operation_ref: str | None = Field(default=None, alias="operationRef", pattern=r"^[a-f0-9]{16}$")

    @model_validator(mode="after")
    def validate_operation_ref(self) -> ShelfIssue:
        if (self.code == "needs_input") != (self.operation_ref is not None):
            raise ValueError("operationRef is only present for needs_input")
        return self


def issue_for_shelf(value: dict | None) -> ShelfIssue | None:
    if value is None:
        return None
    issue = SafeIssue.model_validate(value)
    operation_ref = (hashlib.sha256(issue.operation_id.encode("utf-8")).hexdigest()[:16]
                     if issue.operation_id else None)
    return ShelfIssue(code=issue.code, message=issue.message, retryable=issue.retryable,
                      operationRef=operation_ref)


class ShelfServiceStatus(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    service_id: str = Field(alias="serviceId")
    instance_id: str = Field(alias="instanceId")
    service_type: ServiceType = Field(alias="serviceType")
    state: ServiceState
    state_since: datetime = Field(alias="stateSince")
    last_heartbeat_at: datetime | None = Field(alias="lastHeartbeatAt")
    stale_after_seconds: int = Field(alias="staleAfterSeconds")
    activity: SafeActivity | None = None
    issue: ShelfIssue | None = None
    provider: SafeProvider | None = None
    capabilities: list[str] = Field(default_factory=list)
    metadata: dict[str, str | int | float | bool | None] = Field(default_factory=dict)


class StatusShelfResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    schema_version: Literal[1] = Field(alias="schemaVersion")
    generated_at: datetime = Field(alias="generatedAt")
    services: list[ShelfServiceStatus]
