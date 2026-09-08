import pytest
from pydantic import ValidationError
from types import SimpleNamespace


def valid_rule_payload(**overrides):
    payload = {
        "characterId": "character-1",
        "name": "Track phone distraction",
        "enabled": True,
        "triggerType": "phone_usage_observed",
        "conditions": [
            {"field": "payload.state", "operator": "equals", "value": "started"},
        ],
        "actions": [{"type": "log_bad_habit", "habitId": "habit-1"}],
        "cooldownSeconds": 1800,
    }
    payload.update(overrides)
    return payload


def test_rule_schema_accepts_a_safe_phone_distraction_rule():
    from schemas.automation import AutomationRuleCreate

    rule = AutomationRuleCreate.model_validate(valid_rule_payload())

    assert rule.triggerType == "phone_usage_observed"
    assert rule.actions[0].habitId == "habit-1"


@pytest.mark.parametrize(
    "change",
    [
        {"triggerType": "run_python"},
        {"conditions": [{"field": "payload.__class__", "operator": "equals", "value": "x"}]},
        {"conditions": [{"field": "payload.state", "operator": "eval", "value": "x"}]},
        {"actions": [{"type": "call_anything", "habitId": "habit-1"}]},
    ],
)
def test_rule_schema_rejects_unallowlisted_trigger_condition_or_action(change):
    from schemas.automation import AutomationRuleCreate

    with pytest.raises(ValidationError):
        AutomationRuleCreate.model_validate(valid_rule_payload(**change))


def test_matching_conditions_return_each_match_without_dynamic_field_lookup():
    from services.automation_engine import evaluate_conditions

    result = evaluate_conditions(
        [
            {"field": "payload.state", "operator": "equals", "value": "started"},
            {"field": "payload.confidence", "operator": "greater_than_or_equal", "value": 0.85},
        ],
        {
            "event": {"type": "phone_usage_observed", "source": "phone_cv", "timestamp": "2026-09-07T12:00:00+00:00"},
            "payload": {"state": "started", "confidence": 0.91, "posture": None, "detector": "cv"},
        },
    )

    assert result == {"matched": True, "conditions": [{"matched": True}, {"matched": True}]}


def test_legacy_rule_defaults_to_all_match_mode():
    from schemas.automation import AutomationRuleCreate

    assert AutomationRuleCreate.model_validate(valid_rule_payload()).matchMode == "all"


def test_advanced_conditions_explain_time_and_count_results():
    from services.automation_engine import evaluate_conditions

    view = {"event": {"type": "phone_usage_observed", "source": "phone_cv", "timestamp": "2026-09-07T23:30:00+00:00"}, "payload": {"state": "started"}}
    overnight = evaluate_conditions(
        [{"type": "time_window", "start": "22:00", "end": "06:00"}], view, match_mode="all", character_timezone="UTC", occurrence_count=1
    )
    below_threshold = evaluate_conditions(
        [{"type": "occurrence_count", "count": 2, "windowSeconds": 1800}], view, match_mode="all", character_timezone="UTC", occurrence_count=1
    )

    assert overnight["matched"] is True
    assert below_threshold == {"matched": False, "reason": "occurrence_threshold_not_met", "conditions": [{"matched": False, "reason": "occurrence_threshold_not_met"}]}


def test_overnight_time_window_uses_the_character_iana_timezone():
    from services.automation_engine import evaluate_conditions

    result = evaluate_conditions(
        [{"type": "time_window", "start": "23:00", "end": "06:00"}],
        {"event": {"timestamp": "2026-09-07T15:30:00+00:00"}, "payload": {}},
        character_timezone="Asia/Shanghai",
    )

    assert result["matched"] is True


@pytest.mark.anyio
async def test_negative_habit_service_refuses_a_habit_owned_by_another_character(monkeypatch):
    from services import habit_trigger_service

    class Habits:
        async def find_unique(self, **_kwargs):
            return SimpleNamespace(id="habit-2", characterId="character-2", type="NEGATIVE")

    monkeypatch.setattr(habit_trigger_service, "get_db", lambda: SimpleNamespace(habit=Habits()))

    with pytest.raises(Exception) as error:
        await habit_trigger_service.trigger_negative_habit("habit-2", "character-1")

    assert getattr(error.value, "status_code", None) == 422


@pytest.mark.anyio
async def test_disabled_rule_never_creates_an_execution(monkeypatch):
    from services import automation_engine

    class Rules:
        async def find_many(self, **_kwargs):
            return []

    monkeypatch.setattr(automation_engine, "get_db", lambda: SimpleNamespace(automationrule=Rules()))
    observation = SimpleNamespace(
        id="observation-1",
        characterId="character-1",
        eventType="phone_usage_observed",
        source="phone_cv",
        observedAt="2026-09-07T12:00:00+00:00",
        payloadJson='{"state":"started","confidence":0.91,"detector":"cv"}',
    )

    assert await automation_engine.evaluate_observation(observation) == []


@pytest.mark.anyio
async def test_cooldown_skip_is_persisted_with_a_machine_readable_reason(monkeypatch):
    """A matching event blocked by cooldown must leave durable, explainable history."""
    from services import automation_engine

    class Executions:
        def __init__(self):
            self.created = []
            self.updated = []

        async def create(self, *, data):
            self.created.append(data)
            return SimpleNamespace(id="execution-1")

        async def update(self, *, where, data):
            self.updated.append((where, data))

    class Rules:
        async def update_many(self, **_kwargs):
            return 0

    executions = Executions()
    database = SimpleNamespace(automationexecution=executions, automationrule=Rules())
    rule = SimpleNamespace(id="rule-1", characterId="character-1", cooldownSeconds=1800)
    observation = SimpleNamespace(id="observation-2")

    outcome = await automation_engine._execute_rule(database, rule, observation)

    assert outcome == {"ruleId": "rule-1", "status": "SKIPPED_COOLDOWN", "reason": "cooldown_active"}
    assert executions.created == [
        {
            "ruleId": "rule-1",
            "characterId": "character-1",
            "observationId": "observation-2",
            "status": "PENDING",
            "resultJson": "{}",
        }
    ]
    assert executions.updated == [
        (
            {"id": "execution-1"},
            {"status": "SKIPPED_COOLDOWN", "resultJson": '{"reason":"cooldown_active"}'},
        )
    ]


@pytest.mark.anyio
async def test_failed_action_is_persisted_with_a_machine_readable_reason(monkeypatch):
    """An action failure must be explainable without storing an observation payload."""
    from services import automation_engine, habit_trigger_service

    class Executions:
        async def create(self, *, data):
            return SimpleNamespace(id="execution-1")

        def __init__(self):
            self.updated = []

        async def update(self, *, where, data):
            self.updated.append((where, data))

    async def fail_action(*_args):
        raise RuntimeError("habit service unavailable")

    executions = Executions()
    database = SimpleNamespace(automationexecution=executions, automationrule=SimpleNamespace())
    rule = SimpleNamespace(
        id="rule-1", characterId="character-1", cooldownSeconds=0,
        actionsJson='[{"type":"log_bad_habit","habitId":"habit-1"}]',
    )
    monkeypatch.setattr(habit_trigger_service, "trigger_negative_habit", fail_action)

    outcome = await automation_engine._execute_rule(database, rule, SimpleNamespace(id="observation-3"))

    assert outcome == {"ruleId": "rule-1", "status": "FAILED", "reason": "action_failed"}
    assert executions.updated == [
        (
            {"id": "execution-1"},
            {"status": "FAILED", "resultJson": '{"reason":"action_failed"}'},
        )
    ]
