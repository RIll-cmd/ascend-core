from pydantic import ValidationError
import pytest

from schemas.vision_contract import (
    VISION_CONTRACT_VERSION,
    VisionQueryRequest,
    vision_capabilities,
)


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
