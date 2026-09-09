from pydantic import ValidationError
import pytest

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
