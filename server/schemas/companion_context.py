"""Strict, redacted cross-device snapshot contract for the laptop companion."""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StrictBool, StrictInt, model_validator


MAX_CONTEXT_BYTES = 4 * 1024
MAX_CONTEXT_LEASE_SECONDS = 60
_IDENTIFIER = r"^[A-Za-z0-9_-]{1,128}$"
_FIELD_RULES = {
    "deskPresence": ({"present", "away", "unknown"}, {"webcam", "none"}, 15),
    "desktopActivity": ({"input_active", "input_idle", "locked", "unavailable"},
                        {"desktop_activity", "none"}, 10),
    "foregroundCategory": ({"development", "communication", "browser_unspecified",
                            "entertainment", "other", "unknown"},
                           {"desktop_activity", "none"}, 10),
    "focusSession": ({"focus", "background", "unavailable"}, {"session_runtime", "none"}, 10),
    "declaredIntent": ({"focus", "break", "research", "meeting", "none"},
                       {"user_declaration", "none"}, 12 * 60 * 60),
}
_DEFAULTS = {
    "deskPresence": "unknown", "desktopActivity": "unavailable",
    "foregroundCategory": "unknown", "focusSession": "unavailable", "declaredIntent": "none",
}


class ContextRequestModel(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class ContextField(ContextRequestModel):
    value: str
    source: Literal["webcam", "desktop_activity", "session_runtime", "user_declaration", "none"]
    freshness: Literal["fresh", "stale", "unavailable", "paused"]
    observed_at: datetime | None = Field(alias="observedAt")
    expires_at: datetime | None = Field(alias="expiresAt")
    age_seconds: StrictInt | None = Field(alias="ageSeconds", ge=0)
    evidence_kind: Literal["observation", "user_report", "inference"] = Field(alias="evidenceKind")

    @model_validator(mode="after")
    def validate_timestamps_and_provenance(self):
        for name in ("observed_at", "expires_at"):
            value = getattr(self, name)
            if value is not None and (value.tzinfo is None or value.utcoffset() is None):
                raise ValueError(f"{name} must include a timezone")
        if (self.freshness == "fresh"
                and (self.source == "none" or self.observed_at is None or self.expires_at is None)):
            raise ValueError("fresh context requires a source and bounded timestamps")
        if (self.observed_at is None) != (self.expires_at is None):
            raise ValueError("context timestamps must be both present or both absent")
        return self


class CompanionContextPublishRequest(ContextRequestModel):
    schema_version: Literal[1] = Field(alias="schemaVersion")
    source: Literal["local Vision laptop context"]
    device_id: str = Field(alias="deviceId", min_length=1, max_length=128, pattern=_IDENTIFIER)
    boot_id: str = Field(alias="bootId", min_length=1, max_length=128, pattern=_IDENTIFIER)
    boot_started_at: datetime = Field(alias="bootStartedAt")
    snapshot_revision: StrictInt = Field(alias="snapshotRevision", ge=0)
    source_sequences: dict[str, StrictInt] = Field(alias="sourceSequences", max_length=3)
    snapshot_id: str = Field(alias="snapshotId", min_length=1, max_length=160)
    generated_at: datetime = Field(alias="generatedAt")
    lease_expires_at: datetime = Field(alias="leaseExpiresAt")
    paused: StrictBool
    fields: dict[str, ContextField]

    @model_validator(mode="after")
    def validate_bounded_projection(self):
        if not isinstance(self.paused, bool):
            raise ValueError("paused must be a boolean")
        for name in ("boot_started_at", "generated_at", "lease_expires_at"):
            value = getattr(self, name)
            if value.tzinfo is None or value.utcoffset() is None:
                raise ValueError(f"{name} must include a timezone")
        if self.snapshot_id != f"{self.boot_id}:{self.snapshot_revision}":
            raise ValueError("snapshotId must match its boot and revision")
        if not set(self.fields) == set(_FIELD_RULES):
            raise ValueError("context must include exactly the allowlisted fields")
        if self.boot_started_at > self.generated_at:
            raise ValueError("boot timestamp cannot follow the snapshot")
        if (self.lease_expires_at <= self.generated_at
                or self.lease_expires_at - self.generated_at > timedelta(seconds=MAX_CONTEXT_LEASE_SECONDS)):
            raise ValueError("context lease must be positive and no longer than 60 seconds")
        allowed_sequences = {"webcam", "desktop_activity", "session_runtime"}
        for source, sequence in self.source_sequences.items():
            if source not in allowed_sequences or type(sequence) is not int or sequence < 0:
                raise ValueError("source sequence is invalid")
        for name, field in self.fields.items():
            values, sources, ttl = _FIELD_RULES[name]
            if field.value not in values or field.source not in sources:
                raise ValueError(f"invalid value or source for {name}")
            if field.source == "none" and field.value != _DEFAULTS[name]:
                raise ValueError(f"unavailable {name} must use its default value")
            if field.source != "none" and field.observed_at is None:
                raise ValueError(f"sourced {name} must include evidence timestamps")
            if field.observed_at is not None:
                observed = field.observed_at.astimezone(timezone.utc)
                expires = field.expires_at.astimezone(timezone.utc)
                if expires <= observed or expires - observed > timedelta(seconds=ttl):
                    raise ValueError(f"{name} expiry exceeds its field freshness policy")
                if observed > self.generated_at + timedelta(seconds=5):
                    raise ValueError(f"{name} timestamp is too far in the future")
                if field.freshness == "fresh" and expires <= self.generated_at:
                    raise ValueError(f"fresh {name} is already expired")
        encoded = json.dumps(self.model_dump(mode="json", by_alias=True), separators=(",", ":")).encode("utf-8")
        if len(encoded) > MAX_CONTEXT_BYTES:
            raise ValueError("context projection exceeds 4 KiB")
        return self

