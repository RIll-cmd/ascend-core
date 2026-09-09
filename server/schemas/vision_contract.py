from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


VISION_CONTRACT_VERSION = "2026-09-09"
VisionReadIntent = Literal[
    "missions_summary",
    "habits_summary",
    "automations_summary",
    "steps_summary",
    "recovery_summary",
    "sleep_summary",
    "health_summary",
]
VisionErrorCode = Literal[
    "unsupported_capability_version",
    "unsupported_intent",
    "unavailable_data",
    "invalid_request",
    "authentication_required",
    "authentication_expired",
    "forbidden_character",
]


class VisionQueryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    characterId: str = Field(min_length=1, max_length=128)
    requestId: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$")
    capabilityVersion: Literal[VISION_CONTRACT_VERSION]
    intent: VisionReadIntent
    parameters: dict[str, Any] = Field(default_factory=dict)


class VisionQuerySuccess(BaseModel):
    success: Literal[True] = True
    requestId: str
    intent: VisionReadIntent
    data: dict[str, Any]


class VisionQueryErrorBody(BaseModel):
    code: VisionErrorCode
    message: str
    retryable: bool = False


class VisionQueryError(BaseModel):
    success: Literal[False] = False
    requestId: str
    error: VisionQueryErrorBody


def vision_capabilities() -> dict[str, Any]:
    return {
        "version": VISION_CONTRACT_VERSION,
        "reads": {
            "missions_summary": {"availability": "available"},
            "habits_summary": {"availability": "available"},
            "automations_summary": {"availability": "available"},
            "steps_summary": {"availability": "available"},
            "recovery_summary": {"availability": "available"},
            "sleep_summary": {"availability": "unavailable"},
            "health_summary": {"availability": "unavailable"},
        },
        "writes": [],
    }
