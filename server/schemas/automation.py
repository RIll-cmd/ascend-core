from datetime import datetime
from typing import Literal, get_args

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


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

AUTOMATION_CAPABILITY_VERSION = "2026-09-07"
MAX_AUTOMATION_CONDITIONS = 20
MAX_AUTOMATION_ACTIONS = 1
MAX_OCCURRENCE_COUNT = 100
MAX_OCCURRENCE_WINDOW_SECONDS = 86_400
MAX_COOLDOWN_SECONDS = 31_536_000

_FIELD_OPERATOR_CONSTRAINTS = {
    "event.type": ("equals", "not_equals", "contains"),
    "event.source": ("equals", "not_equals", "contains"),
    "event.timestamp": ("equals", "not_equals", "contains"),
    "payload.confidence": ("equals", "not_equals", "greater_than", "greater_than_or_equal", "less_than", "less_than_or_equal"),
    "payload.posture": ("equals", "not_equals", "contains"),
    "payload.state": ("equals", "not_equals", "contains"),
    "payload.detector": ("equals", "not_equals", "contains"),
}


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
    count: int = Field(ge=1, le=MAX_OCCURRENCE_COUNT)
    windowSeconds: int = Field(ge=1, le=MAX_OCCURRENCE_WINDOW_SECONDS)


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
    conditions: list[AutomationRuleCondition] = Field(default_factory=list, max_length=MAX_AUTOMATION_CONDITIONS)
    actions: list[AutomationAction] = Field(min_length=1, max_length=MAX_AUTOMATION_ACTIONS)
    cooldownSeconds: int = Field(default=0, ge=0, le=MAX_COOLDOWN_SECONDS)

    @model_validator(mode="after")
    def validate_semantics(self):
        validate_automation_rule_semantics(self)
        return self


def validate_automation_rule_semantics(rule: AutomationRuleCreate) -> None:
    """Reject structurally valid rules that the deterministic evaluator cannot match."""
    for condition in rule.conditions:
        data = condition.model_dump()
        if data.get("type"):
            continue

        field = data["field"]
        operator = data["operator"]
        value = data["value"]
        if operator not in _FIELD_OPERATOR_CONSTRAINTS[field]:
            raise ValueError(f"operator '{operator}' is not supported for field '{field}'")
        if field == "payload.confidence" and (isinstance(value, bool) or not isinstance(value, (int, float))):
            raise ValueError("payload.confidence requires a numeric value")
        if field != "payload.confidence" and not isinstance(value, str):
            raise ValueError(f"field '{field}' requires a string value")
        if field == "event.type" and operator == "equals" and value != rule.triggerType:
            raise ValueError("event.type must equal triggerType when compared with equals")


def automation_capabilities() -> dict:
    """Public, versioned contract derived from this persistence schema's allowlists."""
    return {
        "version": AUTOMATION_CAPABILITY_VERSION,
        "triggers": list(get_args(TriggerType)),
        "matchModes": ["all", "any"],
        "fields": list(get_args(ConditionField)),
        "operators": list(get_args(ConditionOperator)),
        "fieldOperatorConstraints": [
            {"field": field, "operators": list(operators)}
            for field, operators in _FIELD_OPERATOR_CONSTRAINTS.items()
        ],
        "conditionTypes": [
            {"type": "field_comparison"},
            {"type": "time_window", "timeFormat": "HH:MM"},
            {"type": "occurrence_count"},
        ],
        "actions": [{"type": "log_bad_habit", "target": "owned_negative_habit"}],
        "limits": {
            "maxConditions": MAX_AUTOMATION_CONDITIONS,
            "minActions": 1,
            "maxActions": MAX_AUTOMATION_ACTIONS,
            "occurrenceCount": {"min": 1, "max": MAX_OCCURRENCE_COUNT},
            "occurrenceWindowSeconds": {"min": 1, "max": MAX_OCCURRENCE_WINDOW_SECONDS},
            "cooldownSeconds": {"min": 0, "max": MAX_COOLDOWN_SECONDS},
        },
    }


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
