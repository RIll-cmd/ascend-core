"""Strict HTTP contracts for remote browser task ownership and worker leases."""
from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StrictFloat, StrictInt, field_validator, model_validator

BrowserChannel = Literal["phone_pwa", "discord_dm"]
BrowserState = Literal[
    "queued", "claimed", "running", "paused", "waiting_for_user", "stopping",
    "completed", "partial", "failed", "unknown", "cancelled", "expired",
]
_TOKEN = r"^[A-Za-z0-9_-]{1,128}$"
_SCOPE = r"^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$"


class BrowserRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class BrowserSessionCreate(BrowserRequest):
    device_id: str = Field(alias="deviceId", min_length=1, max_length=128, pattern=_TOKEN)
    parent_session_id: str | None = Field(default=None, alias="parentSessionId", min_length=1, max_length=128, pattern=_TOKEN)
    provider_consent: Literal["gemini", "cerebras", "groq"] = Field(alias="providerConsent")


class BrowserSessionResponse(BrowserRequest):
    browser_session_id: UUID = Field(alias="browserSessionId")
    channel: BrowserChannel
    parent_session_id: str | None = Field(default=None, alias="parentSessionId", max_length=128)
    source_link_generation: int | None = Field(default=None, alias="sourceLinkGeneration", ge=1)
    expires_at: datetime = Field(alias="expiresAt")

    @field_validator("expires_at")
    @classmethod
    def aware_expiry(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("expiresAt must include a timezone")
        return value


class BrowserSessionEndRequest(BrowserRequest):
    browser_session_id: UUID = Field(alias="browserSessionId")


class BrowserTaskCreate(BrowserRequest):
    task_id: UUID = Field(alias="taskId")
    browser_session_id: UUID = Field(alias="browserSessionId")
    laptop_id: str = Field(alias="laptopId", min_length=1, max_length=128, pattern=_TOKEN)
    goal: str = Field(min_length=1, max_length=4000)
    scope_id: str = Field(alias="scopeId", min_length=1, max_length=64, pattern=_SCOPE)
    scope_version: int = Field(alias="scopeVersion", ge=1, le=2**31 - 1)

    @field_validator("goal")
    @classmethod
    def nonblank_goal(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("goal must not be blank")
        return value.strip()


class BrowserTaskReceipt(BrowserRequest):
    task_id: UUID = Field(alias="taskId")
    status: BrowserState
    expires_at: datetime = Field(alias="expiresAt")
    created_at: datetime = Field(alias="createdAt")


class BrowserTaskControl(BrowserRequest):
    browser_session_id: UUID = Field(alias="browserSessionId")
    command: Literal["pause", "resume", "stop"]


class BrowserTaskAck(BrowserRequest):
    browser_session_id: UUID = Field(alias="browserSessionId")


class BrowserTaskEventView(BrowserRequest):
    sequence: int = Field(ge=1)
    event_type: str = Field(alias="eventType", min_length=1, max_length=64)
    summary: str | None = Field(default=None, max_length=8192)
    created_at: datetime = Field(alias="createdAt")


class BrowserActionProposal(BrowserRequest):
    task_id: str = Field(min_length=1, max_length=128)
    action_id: str = Field(min_length=1, max_length=128)
    owner: str = Field(min_length=1, max_length=128)
    observation_id: str = Field(min_length=1, max_length=128)
    document_revision: int = Field(strict=True, ge=0)
    origin: str = Field(min_length=1, max_length=2048)
    action: Literal["fill", "select", "click"]
    target_ref: str = Field(min_length=1, max_length=128)
    target_label: str = Field(max_length=300)
    arguments: dict[str, str]
    expected_effect: str = Field(min_length=1, max_length=500)
    expires_at: StrictFloat | StrictInt = Field(gt=0)
    digest: str = Field(pattern=r"^[a-f0-9]{64}$")

    @model_validator(mode="after")
    def canonical_content(self):
        import hashlib
        import json
        import math
        from urllib.parse import urlsplit
        parsed = urlsplit(self.origin)
        if (parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username
                or parsed.password or parsed.path or parsed.query or parsed.fragment):
            raise ValueError("A canonical HTTP(S) origin is required")
        canonical_origin = f"{parsed.scheme.lower()}://{parsed.hostname.lower()}"
        if parsed.port is not None:
            canonical_origin += f":{parsed.port}"
        if canonical_origin != self.origin:
            raise ValueError("Origin is not canonical")
        if not math.isfinite(self.expires_at):
            raise ValueError("Expiry must be finite")
        keys = {"fill": {"value"}, "select": {"value"}, "click": set()}[self.action]
        if set(self.arguments) != keys or any(len(v) > 2000 for v in self.arguments.values()):
            raise ValueError("Action arguments are not eligible for remote review")
        payload = self.model_dump(exclude={"digest"})
        actual = hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
        if actual != self.digest:
            raise ValueError("Proposal digest does not match canonical content")
        return self


class BrowserProposalPublish(BrowserRequest):
    waiting_for_user_type: Literal["action_review", "local_takeover"] = Field(alias="waitingForUserType")
    proposal: BrowserActionProposal | None = None

    @model_validator(mode="after")
    def review_shape(self):
        if (self.waiting_for_user_type == "action_review") != (self.proposal is not None):
            raise ValueError("Only action_review must carry a proposal")
        return self


class BrowserReviewView(BrowserRequest):
    proposal: BrowserActionProposal
    laptop_id: str = Field(alias="laptopId")
    broker_boot_id: str = Field(alias="brokerBootId")
    fence: int = Field(ge=1)


class BrowserReviewDecision(BrowserRequest):
    browser_session_id: UUID = Field(alias="browserSessionId")
    proposal_digest: str = Field(alias="proposalDigest", pattern=r"^[a-f0-9]{64}$")
    approved: bool = Field(strict=True)


class BrowserReviewConsume(BrowserRequest):
    browser_session_id: UUID = Field(alias="browserSessionId")
    token: str = Field(min_length=43, max_length=43, pattern=r"^[A-Za-z0-9_-]+$")


class BrowserDiscordUser(BrowserRequest):
    discord_user_id: str = Field(alias="discordUserId", pattern=r"^[0-9]{1,32}$")


class BrowserDiscordTask(BrowserDiscordUser):
    task_id: UUID = Field(alias="taskId")


class BrowserDiscordStart(BrowserDiscordTask):
    goal: str = Field(min_length=1, max_length=4000)
    provider_consent: Literal["gemini", "cerebras", "groq"] | None = Field(default=None, alias="providerConsent")
    expected_link_generation: int | None = Field(default=None, alias="expectedLinkGeneration", strict=True, ge=1)


class BrowserRecorded(BrowserRequest):
    recorded: Literal[True]


class BrowserPublished(BrowserRequest):
    published: Literal[True]


class BrowserReviewAccessReceipt(BrowserRequest):
    task_id: UUID = Field(alias="taskId")
    expires_at: datetime = Field(alias="expiresAt")


class BrowserReviewLinkReceipt(BrowserRequest):
    token: str
    expires_at: datetime = Field(alias="expiresAt")


class BrowserDiscordConsent(BrowserRequest):
    consent_required: Literal[True] = Field(alias="consentRequired")
    provider: Literal["gemini", "cerebras", "groq"]
    link_generation: int = Field(alias="linkGeneration", ge=1)


class BrowserDiscordAvailability(BrowserRequest):
    consent_required: bool = Field(alias="consentRequired")
    provider: Literal["gemini", "cerebras", "groq"] | None
    link_generation: int = Field(alias="linkGeneration", ge=1)


class BrowserDiscordStarted(BrowserRequest):
    consent_required: Literal[False] = Field(alias="consentRequired")
    task_id: UUID = Field(alias="taskId")
    status: BrowserState
    browser_session_id: UUID = Field(alias="browserSessionId")
    expires_at: datetime = Field(alias="expiresAt")


class BrowserStatusReceipt(BrowserRequest):
    status: BrowserState


class BrowserAcknowledged(BrowserRequest):
    acknowledged: Literal[True]


class BrowserEnded(BrowserRequest):
    ended: Literal[True]


class BrowserTaskView(BrowserRequest):
    task_id: UUID = Field(alias="taskId")
    status: BrowserState
    channel: BrowserChannel
    scope_id: str = Field(alias="scopeId")
    created_at: datetime = Field(alias="createdAt")
    expires_at: datetime = Field(alias="expiresAt")
    parent_session_id: str | None = Field(default=None, alias="parentSessionId", max_length=128)
    source_link_generation: int | None = Field(default=None, alias="sourceLinkGeneration", ge=1)
    result: dict | None = None
    terminal_reason: str | None = Field(default=None, alias="terminalReason", max_length=64)
    events: list[BrowserTaskEventView] = Field(default_factory=list, max_length=50)
    cursor: int = Field(ge=0)
    next_cursor: int = Field(alias="nextCursor", ge=0)
    reset_required: bool = Field(default=False, alias="resetRequired")
    waiting_for_user_type: Literal["action_review", "local_takeover"] | None = Field(default=None, alias="waitingForUserType")
    review: BrowserReviewView | None = None

    @model_validator(mode="after")
    def no_result_before_terminal(self):
        if self.status not in {"completed", "partial"} and self.result is not None:
            raise ValueError("result is only available for completed or partial tasks")
        return self


class BrowserWorkerBinding(BrowserRequest):
    task_id: UUID = Field(alias="taskId")
    owner_id: str = Field(alias="ownerId", min_length=1, max_length=128)
    channel: BrowserChannel
    browser_session_id: UUID = Field(alias="browserSessionId")
    laptop_id: str = Field(alias="laptopId", min_length=1, max_length=128, pattern=_TOKEN)
    broker_boot_id: str = Field(alias="brokerBootId", min_length=1, max_length=128, pattern=_TOKEN)
    lease_id: str = Field(alias="leaseId", min_length=1, max_length=128, pattern=_TOKEN)
    fence: int = Field(ge=1, le=2**31 - 1)
    scope_id: str = Field(alias="scopeId", min_length=1, max_length=64, pattern=_SCOPE)
    scope_version: int = Field(alias="scopeVersion", ge=1, le=2**31 - 1)


class BrowserWorkerTask(BrowserRequest):
    schema_version: Literal[1] = Field(alias="schema_version")
    binding: BrowserWorkerBinding
    goal: str = Field(min_length=1, max_length=4000)
    provider: Literal["gemini", "cerebras", "groq"]
    provider_consent: Literal[True]
    expires_at: float = Field(alias="expires_at", gt=0, allow_inf_nan=False)


class BrowserWorkerClaimRequest(BrowserRequest):
    broker_boot_id: str = Field(alias="brokerBootId", min_length=1, max_length=128, pattern=_TOKEN)


class BrowserWorkerBootRegistration(BrowserRequest):
    expected_boot_id: str | None = Field(alias="expectedBootId", default=None, max_length=128, pattern=_TOKEN)
    new_boot_id: str = Field(alias="newBootId", min_length=1, max_length=128, pattern=_TOKEN)


class BrowserWorkerReconcile(BrowserRequest):
    previous_broker_boot_id: str = Field(alias="previousBrokerBootId", min_length=1, max_length=128, pattern=_TOKEN)
    fence: int = Field(ge=1, le=2**31 - 1)
    action_id: str = Field(alias="actionId", min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_.:-]+$")
    action: str = Field(min_length=1, max_length=64, pattern=r"^[a-z][a-z0-9_]*$")
    proposal_digest: str | None = Field(default=None, alias="proposalDigest", pattern=r"^[a-f0-9]{64}$")
    outcome: Literal["not_attempted", "attempted", "unknown"]

    @model_validator(mode="after")
    def constrain_task_sentinel(self):
        if self.action_id == "broker_task" and (self.action != "task_status" or self.proposal_digest is not None):
            raise ValueError("broker_task reconciliation must use task_status without a proposal digest")
        if self.action == "task_status" and self.action_id != "broker_task":
            raise ValueError("task_status reconciliation must use actionId broker_task")
        return self


class BrowserWorkerDispatchRequest(BrowserRequest):
    attempt_id: str = Field(alias="attemptId", min_length=1, max_length=128, pattern=_TOKEN)
    action: str = Field(min_length=1, max_length=64, pattern=r"^[a-z][a-z0-9_]*$")
    proposal_digest: str | None = Field(default=None, alias="proposalDigest", pattern=r"^[a-f0-9]{64}$")


class BrowserWorkerDispatchPermit(BrowserRequest):
    permit_id: str = Field(alias="permitId", min_length=1, max_length=128, pattern=_TOKEN)
    expires_at: datetime = Field(alias="expiresAt")
    task_id: UUID = Field(alias="taskId")
    attempt_id: str = Field(alias="attemptId", min_length=1, max_length=128, pattern=_TOKEN)
    laptop_id: str = Field(alias="laptopId", min_length=1, max_length=128, pattern=_TOKEN)
    broker_boot_id: str = Field(alias="brokerBootId", min_length=1, max_length=128, pattern=_TOKEN)
    fence: int = Field(ge=1, le=2**31 - 1)
    action: str
    proposal_digest: str | None = Field(default=None, alias="proposalDigest")

    @field_validator("expires_at")
    @classmethod
    def aware_expiry(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("expiresAt must include a timezone")
        return value


class BrowserWorkerHeartbeat(BrowserRequest):
    broker_boot_id: str = Field(alias="brokerBootId", min_length=1, max_length=128, pattern=_TOKEN)
    availability: Literal["online", "busy", "provider_unavailable", "disabled"]
    descriptor: dict = Field(default_factory=dict)


class BrowserWorkerStart(BrowserRequest):
    pass


class BrowserWorkerRenew(BrowserRequest):
    pass


class BrowserWorkerCompletion(BrowserRequest):
    state: Literal["completed", "partial", "failed", "unknown", "cancelled"]
    summary: str = Field(min_length=1, max_length=8192)
    events_cursor: int = Field(alias="eventsCursor", ge=0, le=2**31 - 1)
    result: dict | None = None
    terminal_reason: str | None = Field(default=None, alias="terminalReason", max_length=64)

    @model_validator(mode="after")
    def bound_result(self):
        import json
        bounded = {"summary": self.summary, "eventsCursor": self.events_cursor, "result": self.result}
        if len(json.dumps(bounded, separators=(",", ":"), ensure_ascii=False).encode("utf-8")) > 16_384:
            raise ValueError("result exceeds 16 KiB")
        if self.state in {"failed", "unknown", "cancelled"} and self.result is not None:
            raise ValueError("failed, unknown, and cancelled tasks cannot expose a result")
        return self


class BrowserWorkerEvent(BrowserRequest):
    sequence: int = Field(ge=1)
    event_type: str = Field(alias="eventType", min_length=1, max_length=64)
    summary: str | None = Field(default=None, max_length=8192)


class BrowserWorkerEventsPublishRequest(BrowserRequest):
    events: list[BrowserWorkerEvent] = Field(max_length=50)

    @model_validator(mode="after")
    def bound_batch(self):
        import json
        value = [event.model_dump(by_alias=True) for event in self.events]
        if len(json.dumps(value, separators=(",", ":"), ensure_ascii=False).encode("utf-8")) > 65_536:
            raise ValueError("event batch exceeds 64 KiB")
        sequences = [event.sequence for event in self.events]
        if sequences != sorted(set(sequences)):
            raise ValueError("event sequences must be strictly increasing")
        return self


class BrowserWorkerEventsRequest(BrowserRequest):
    after: int = Field(default=0, ge=0, le=2**31 - 1)


class BrowserWorkerRelease(BrowserRequest):
    pass


class BrowserWorkerEventsResponse(BrowserRequest):
    task_id: UUID = Field(alias="taskId")
    state: BrowserState
    events: list[BrowserTaskEventView] = Field(max_length=50)
    next_cursor: int = Field(alias="nextCursor", ge=0)
    reset_required: bool = Field(alias="resetRequired")
    result: dict | None = None


class BrowserAvailabilityResponse(BrowserRequest):
    available: bool
    reason: Literal["online", "busy", "provider_unavailable", "disabled", "offline"]
    laptop_id: str | None = Field(default=None, alias="laptopId")
    last_heartbeat_at: datetime | None = Field(default=None, alias="lastHeartbeatAt")
    provider: str | None = None
    scopes: list[dict] = Field(default_factory=list, max_length=32)
