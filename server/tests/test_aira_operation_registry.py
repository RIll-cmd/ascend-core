import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from schemas.aira_operations import AIRAOperationRequest
from schemas.vision_contract import VISION_CONTRACT_VERSION


def test_operation_request_rejects_unknown_operation_and_extra_fields():
    with pytest.raises(ValidationError):
        AIRAOperationRequest.model_validate({
            "characterId": "character-1",
            "requestId": "aira-1",
            "operation": "delete_everything",
            "parameters": {},
            "extra": True,
        })


def test_operation_request_accepts_a_mission_read():
    request = AIRAOperationRequest.model_validate({
        "characterId": "character-1",
        "requestId": "aira-1",
        "operation": "missions_summary",
        "parameters": {},
    })

    assert request.operation == "missions_summary"


@pytest.mark.asyncio
async def test_registry_checks_ownership_before_dispatch(monkeypatch):
    from services import aira_operation_registry

    request = AIRAOperationRequest(
        characterId="character-1",
        requestId="aira-1",
        operation="missions_summary",
    )
    async def does_not_own(*_args):
        return False

    monkeypatch.setattr(aira_operation_registry, "verify_character_ownership", does_not_own)

    with pytest.raises(HTTPException) as error:
        await aira_operation_registry.execute_aira_read_operation(request, {"id": "user-1"})

    assert error.value.status_code == 403


@pytest.mark.asyncio
async def test_registry_delegates_supported_reads_to_the_core_dispatcher(monkeypatch):
    from services import aira_operation_registry

    request = AIRAOperationRequest(
        characterId="character-1",
        requestId="aira-1",
        operation="missions_summary",
    )
    captured = {}

    async def owns(*_args):
        return True

    async def execute(query):
        captured["query"] = query
        return {"success": True, "requestId": query.requestId, "intent": query.intent, "data": {"missions": []}}

    monkeypatch.setattr(aira_operation_registry, "verify_character_ownership", owns)
    monkeypatch.setattr(aira_operation_registry, "execute_vision_query", execute)

    result = await aira_operation_registry.execute_aira_read_operation(request, {"id": "user-1"})

    assert captured["query"].capabilityVersion == VISION_CONTRACT_VERSION
    assert captured["query"].intent == "missions_summary"
    assert result == {"success": True, "requestId": "aira-1", "operation": "missions_summary", "data": {"missions": []}}


@pytest.mark.asyncio
async def test_schedule_and_recommendation_are_composed_from_typed_reads(monkeypatch):
    from services import aira_operation_registry

    async def owns(*_args):
        return True

    async def execute(query):
        responses = {
            "missions_summary": {"success": True, "requestId": query.requestId, "intent": query.intent, "data": {"missions": [{"id": "m1", "name": "Push day", "status": "PENDING"}]}},
            "recovery_summary": {"success": True, "requestId": query.requestId, "intent": query.intent, "data": {"recovery": {"summary": {"overallFreshness": 84}, "muscles": {"CHEST": {"status": "FRESH"}, "FRONT_DELTS": {"status": "FRESH"}, "TRICEPS": {"status": "FRESH"}, "LATS": {"status": "FATIGUED"}}}}},
        }
        return responses[query.intent]

    monkeypatch.setattr(aira_operation_registry, "verify_character_ownership", owns)
    monkeypatch.setattr(aira_operation_registry, "execute_vision_query", execute)

    schedule = await aira_operation_registry.execute_aira_read_operation(
        AIRAOperationRequest(characterId="character-1", requestId="schedule-1", operation="today_schedule"), {"id": "user-1"}
    )
    recommendation = await aira_operation_registry.execute_aira_read_operation(
        AIRAOperationRequest(characterId="character-1", requestId="workout-1", operation="workout_recommendation"), {"id": "user-1"}
    )

    assert schedule["data"]["missions"][0]["name"] == "Push day"
    assert recommendation["data"]["recommendation"]["recommendation"] == "upper_push"
    assert recommendation["data"]["recommendation"]["avoidMuscles"] == ["LATS"]


@pytest.mark.asyncio
async def test_unavailable_sleep_is_not_synthesized(monkeypatch):
    from services import aira_operation_registry

    async def owns(*_args):
        return True

    async def execute(query):
        return {"success": False, "requestId": query.requestId, "error": {"code": "unavailable_data", "message": "Sleep data is not available from Ascend Core.", "retryable": False}}

    monkeypatch.setattr(aira_operation_registry, "verify_character_ownership", owns)
    monkeypatch.setattr(aira_operation_registry, "execute_vision_query", execute)

    result = await aira_operation_registry.execute_aira_read_operation(
        AIRAOperationRequest(characterId="character-1", requestId="sleep-1", operation="sleep_summary"), {"id": "user-1"}
    )

    assert result["success"] is False
    assert result["error"]["code"] == "unavailable_data"
