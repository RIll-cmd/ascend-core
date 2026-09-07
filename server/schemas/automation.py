from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


TriggerType = Literal["phone_usage_observed", "posture_observed", "sleep_state_observed"]
ConditionField = Literal[
    "event.type",
    "event.source",
    "event.timestamp",
    "payload.confidence",
    "payload.posture",
    "payload.state",
    "payload.detector",
]
ConditionOperator = Literal[
    "equals",
    "not_equals",
    "greater_than",
    "greater_than_or_equal",
    "less_than",
    "less_than_or_equal",
    "contains",
]


class AutomationCondition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field: ConditionField
    operator: ConditionOperator
    value: str | int | float | bool | None


class TimeWindowCondition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["time_window"]
    start: str
    end: str

    @field_validator("start", "end")
    @classmethod
    def validate_time(cls, value: str) -> str:
        datetime.strptime(value, "%H:%M")
        return value


class OccurrenceCountCondition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["occurrence_count"]
    count: int = Field(ge=1, le=100)
    windowSeconds: int = Field(ge=1, le=86_400)


AutomationRuleCondition = AutomationCondition | TimeWindowCondition | OccurrenceCountCondition


class AutomationAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["log_bad_habit"]
    habitId: str = Field(min_length=1, max_length=128)


class AutomationRuleCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    characterId: str = Field(min_length=1, max_length=128)
    name: str = Field(min_length=1, max_length=120)
    enabled: bool = True
    triggerType: TriggerType
    matchMode: Literal["all", "any"] = "all"
    conditions: list[AutomationRuleCondition] = Field(default_factory=list, max_length=20)
    actions: list[AutomationAction] = Field(min_length=1, max_length=1)
    cooldownSeconds: int = Field(default=0, ge=0, le=31_536_000)


class AutomationRuleUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=120)
    enabled: bool | None = None
    triggerType: TriggerType | None = None
    matchMode: Literal["all", "any"] | None = None
    conditions: list[AutomationRuleCondition] | None = Field(default=None, max_length=20)
    actions: list[AutomationAction] | None = Field(default=None, min_length=1, max_length=1)
    cooldownSeconds: int | None = Field(default=None, ge=0, le=31_536_000)


class AutomationTestObservation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source: Literal["phone_cv"]
    type: TriggerType
    timestamp: str
    payload: dict[str, str | int | float | bool | None]
