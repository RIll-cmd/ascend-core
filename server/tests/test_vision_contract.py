from pydantic import ValidationError
import pytest
from types import SimpleNamespace

from schemas.vision_contract import (
    VISION_CONTRACT_VERSION,
    VisionQueryRequest,
    vision_capabilities,
)
from services import vision_query_service


def query(intent: str, **overrides):
    payload = {
        "characterId": "character-1",
        "requestId": "vision-query-001",
        "capabilityVersion": VISION_CONTRACT_VERSION,
        "intent": intent,
        "parameters": {},
    }
    payload.update(overrides)
    return VisionQueryRequest.model_validate(payload)


def test_capabilities_distinguish_available_and_unavailable_reads():
    capabilities = vision_capabilities()

    assert capabilities["version"] == VISION_CONTRACT_VERSION
    assert capabilities["reads"]["missions_summary"]["availability"] == "available"
    assert capabilities["reads"]["sleep_summary"]["availability"] == "unavailable"
    assert capabilities["reads"]["health_summary"]["availability"] == "unavailable"


def test_query_request_accepts_a_versioned_missions_query():
    request = VisionQueryRequest.model_validate({
        "characterId": "character-1",
        "requestId": "vision-query-001",
        "capabilityVersion": VISION_CONTRACT_VERSION,
        "intent": "missions_summary",
        "parameters": {},
    })

    assert request.intent == "missions_summary"


def test_query_request_keeps_unknown_version_and_intent_for_dispatch():
    request = VisionQueryRequest.model_validate({
        "characterId": "character-1",
        "requestId": "vision-query-001",
        "capabilityVersion": "unsupported-version",
        "intent": "future_summary",
        "parameters": {},
    })

    assert request.capabilityVersion == "unsupported-version"
    assert request.intent == "future_summary"


@pytest.mark.parametrize("payload", [
    {"characterId": "character-1", "requestId": "bad id", "capabilityVersion": VISION_CONTRACT_VERSION, "intent": "missions_summary", "parameters": {}},
    {"characterId": "character-1", "requestId": "vision-query-001", "capabilityVersion": VISION_CONTRACT_VERSION, "intent": "missions_summary", "parameters": [],},
])
def test_query_request_rejects_malformed_contract_input(payload):
    with pytest.raises(ValidationError):
        VisionQueryRequest.model_validate(payload)


@pytest.mark.asyncio
async def test_service_wraps_existing_missions_in_a_stable_summary(monkeypatch):
    async def missions(_character_id):
        return [{"id": "mission-1", "name": "Morning Workout", "status": "PENDING"}]

    monkeypatch.setattr(vision_query_service, "get_existing_today_missions", missions)

    result = await vision_query_service.execute_vision_query(query("missions_summary"))

    assert result == {
        "success": True,
        "requestId": "vision-query-001",
        "intent": "missions_summary",
        "data": {"missions": [{"id": "mission-1", "name": "Morning Workout", "status": "PENDING"}]},
    }


@pytest.mark.asyncio
async def test_mission_completion_history_is_owner_scoped_timestamped_and_excludes_reopened_rows(monkeypatch):
    from datetime import datetime, timezone
    captured = {}
    completed_at = datetime(2026, 9, 27, 3, 0, tzinfo=timezone.utc)

    async def find_many(**kwargs):
        captured.update(kwargs)
        return [
            SimpleNamespace(id="mission-1", completedAt=completed_at,
                            completionType="NORMAL", habit=SimpleNamespace(name="Morning review")),
            SimpleNamespace(id="reopened", completedAt=None, completionType=None,
                            habit=SimpleNamespace(name="Reopened mission")),
        ]

    monkeypatch.setattr(vision_query_service, "_database", lambda: SimpleNamespace(mission=SimpleNamespace(find_many=find_many)))
    result = await vision_query_service.execute_vision_query(query(
        "mission_completion_history",
        parameters={"startAt": "2026-09-27T00:00:00+00:00", "endAt": "2026-09-28T00:00:00+00:00"},
    ))

    assert result["data"]["completions"] == [{
        "id": "mission-1", "name": "Morning review",
        "completedAt": "2026-09-27T03:00:00+00:00", "completionType": "NORMAL",
    }]
    assert captured["where"]["characterId"] == "character-1"
    assert captured["where"]["status"] == "COMPLETED"
    assert captured["where"]["completedAt"]["lt"].isoformat() == "2026-09-28T00:00:00+00:00"


@pytest.mark.asyncio
@pytest.mark.parametrize("parameters", [
    {},
    {"startAt": "2026-09-27T00:00:00", "endAt": "2026-09-28T00:00:00Z"},
    {"startAt": "2026-09-28T00:00:00Z", "endAt": "2026-09-27T00:00:00Z"},
    {"startAt": "2026-01-01T00:00:00Z", "endAt": "2026-02-10T00:00:00Z"},
])
async def test_mission_history_rejects_invalid_or_overlong_ranges(parameters):
    result = await vision_query_service.execute_vision_query(
        query("mission_completion_history", parameters=parameters),
    )
    assert result["success"] is False
    assert result["error"]["code"] == "invalid_request"


@pytest.mark.asyncio
async def test_service_returns_unavailable_data_without_calling_a_reader():
    result = await vision_query_service.execute_vision_query(query("sleep_summary"))

    assert result == {
        "success": False,
        "requestId": "vision-query-001",
        "error": {
            "code": "unavailable_data",
            "message": "Sleep data is not available from Ascend Core.",
            "retryable": False,
        },
    }


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("intent", "expected_key"),
    [
        ("sleep_summary", "Sleep"),
        ("health_summary", "Health"),
    ],
)
async def test_service_returns_unavailable_data_for_non_core_health_intents(intent, expected_key):
    result = await vision_query_service.execute_vision_query(query(intent))

    assert result["success"] is False
    assert result["error"] == {
        "code": "unavailable_data",
        "message": f"{expected_key} data is not available from Ascend Core.",
        "retryable": False,
    }


@pytest.mark.asyncio
async def test_service_wraps_existing_habits_in_a_stable_summary(monkeypatch):
    async def habits(_character_id):
        return [{"id": "habit-1", "name": "Hydration", "status": "ACTIVE"}]

    monkeypatch.setattr(vision_query_service, "get_existing_habits", habits)

    result = await vision_query_service.execute_vision_query(query("habits_summary"))

    assert result["data"] == {"habits": [{"id": "habit-1", "name": "Hydration", "status": "ACTIVE"}]}


@pytest.mark.asyncio
async def test_service_wraps_automations_in_a_stable_summary(monkeypatch):
    import sys
    import types
    rule = SimpleNamespace(id="rule-1")

    async def find_many(**_kwargs):
        return [rule]

    monkeypatch.setattr(vision_query_service, "_database", lambda: SimpleNamespace(automationrule=SimpleNamespace(find_many=find_many)))
    automations = types.ModuleType("routers.automations")
    automations.serialize_rule = lambda item: {"id": item.id, "name": "Phone automation"}
    monkeypatch.setitem(sys.modules, "routers.automations", automations)

    result = await vision_query_service.execute_vision_query(query("automations_summary"))

    assert result["data"] == {"automations": [{"id": "rule-1", "name": "Phone automation"}]}


@pytest.mark.asyncio
async def test_service_returns_persisted_daily_steps_and_goal(monkeypatch):
    async def find_unique(**_kwargs):
        return SimpleNamespace(dailySteps=4200, dailyStepGoal=8000)

    monkeypatch.setattr(vision_query_service, "_database", lambda: SimpleNamespace(character=SimpleNamespace(find_unique=find_unique)))

    result = await vision_query_service.execute_vision_query(query("steps_summary"))

    assert result["data"] == {"steps": 4200, "goal": 8000}


@pytest.mark.asyncio
async def test_service_wraps_workout_recovery_without_health_synthesis(monkeypatch):
    import sys
    import types
    async def recovery(_character_id):
        return {"summary": {"overallFreshness": 82.5}}

    workouts = types.ModuleType("routers.workouts")
    workouts.compute_muscle_status_dict = recovery
    monkeypatch.setitem(sys.modules, "routers.workouts", workouts)

    result = await vision_query_service.execute_vision_query(query("recovery_summary"))

    assert result["data"] == {"recovery": {"summary": {"overallFreshness": 82.5}}}


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("overrides", "error_code"),
    [
        ({"capabilityVersion": "2025-01-01"}, "unsupported_capability_version"),
        ({"intent": "future_summary"}, "unsupported_intent"),
    ],
)
async def test_service_returns_structured_dispatch_errors(overrides, error_code):
    request = query("missions_summary")
    request.intent = overrides.get("intent", request.intent)
    request.capabilityVersion = overrides.get("capabilityVersion", request.capabilityVersion)
    result = await vision_query_service.execute_vision_query(request)

    assert result["success"] is False
    assert result["requestId"] == "vision-query-001"
    assert result["error"]["code"] == error_code
