"""Typed, read-only operations exposed to AIRA clients.

This contract is intentionally separate from conversational tool calling.  It
gives AIRA and future trusted clients one narrow way to ask Core for live,
owned character context without granting any mutation capability.
"""

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


AIRAReadOperation = Literal[
    "missions_summary",
    "habits_summary",
    "automations_summary",
    "steps_summary",
    "recovery_summary",
    "sleep_summary",
    "health_summary",
    "today_schedule",
    "workout_recommendation",
]

AIRAWriteOperation = Literal[
    "create_habit",
    "update_habit",
    "archive_habit",
    "complete_mission",
    "create_mission",
    "log_workout",
    "create_automation",
    "update_automation",
    "delete_automation",
    "buy_shop_item",
    "equip_item",
    "create_calendar_schedule",
    "create_calendar_schedule_multi",
    "delete_calendar_schedule",
]



class AIRAOperationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    characterId: str = Field(min_length=1, max_length=128)
    requestId: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$")
    operation: AIRAReadOperation
    parameters: dict[str, Any] = Field(default_factory=dict)


class AIRAOperationPreviewRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    characterId: str = Field(min_length=1, max_length=128)
    requestId: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$")
    operation: AIRAWriteOperation
    arguments: dict[str, Any] = Field(default_factory=dict)


class AIRAOperationExecuteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    characterId: str = Field(min_length=1, max_length=128)
    requestId: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$")
    operation: AIRAWriteOperation
    confirmationToken: str = Field(min_length=1, max_length=4096)
