"""Producer event contract for optional operation lifecycle evidence."""

from uuid import uuid4

import pytest
from pydantic import ValidationError

from schemas.service_status import ServiceStatusEvent


def event_payload(**overrides):
    return {
        "schemaVersion": 1,
        "eventId": str(uuid4()),
        "serviceId": "ascend-core",
        "instanceId": "core-1",
        "serviceType": "agent",
        "state": "working",
        "stateSince": "2026-09-25T00:00:00Z",
        "reportedAt": "2026-09-25T00:00:00Z",
        **overrides,
    }


@pytest.mark.parametrize("phase", ["started", "progress", "succeeded", "failed", "cancelled"])
def test_accepts_each_lifecycle_phase_with_a_stable_operation_id(phase):
    event = ServiceStatusEvent.model_validate(event_payload(
        lifecycle={"operationId": "request-42", "phase": phase, "label": "AIRA request"},
    ))

    assert event.lifecycle.operation_id == "request-42"
    assert event.lifecycle.phase == phase
    assert event.lifecycle.label == "AIRA request"
    assert event.model_dump(by_alias=True)["lifecycle"] == {
        "operationId": "request-42", "phase": phase, "label": "AIRA request"
    }


@pytest.mark.parametrize("state", ["idle", "working", "stuck"])
@pytest.mark.parametrize("phase", ["succeeded", "failed", "cancelled"])
def test_terminal_lifecycle_accepts_current_state_independently(state, phase):
    event = ServiceStatusEvent.model_validate(event_payload(
        state=state,
        lifecycle={"operationId": "request-42", "phase": phase},
    ))

    assert event.state == state
    assert event.lifecycle.phase == phase


@pytest.mark.parametrize("phase", ["started", "progress"])
@pytest.mark.parametrize("state", ["idle", "stuck"])
def test_nonterminal_lifecycle_requires_working_state(phase, state):
    with pytest.raises(ValidationError, match="working"):
        ServiceStatusEvent.model_validate(event_payload(
            state=state,
            lifecycle={"operationId": "request-42", "phase": phase},
        ))


@pytest.mark.parametrize("state", ["idle", "working", "stuck"])
def test_legacy_event_without_lifecycle_remains_valid_and_has_no_completion(state):
    event = ServiceStatusEvent.model_validate(event_payload(state=state))

    assert event.lifecycle is None
    assert "lifecycle" not in event.model_dump(by_alias=True, exclude_none=True)


@pytest.mark.parametrize("operation_id", ["", " leading", "has space", "a/b", "a\nsource", "x" * 129])
def test_rejects_invalid_or_unbounded_operation_id(operation_id):
    with pytest.raises(ValidationError):
        ServiceStatusEvent.model_validate(event_payload(
            lifecycle={"operationId": operation_id, "phase": "started"},
        ))


def test_accepts_maximum_bounded_operation_id_and_safe_label():
    event = ServiceStatusEvent.model_validate(event_payload(
        lifecycle={"operationId": "x" * 128, "phase": "started", "label": "x" * 160},
    ))

    assert len(event.lifecycle.operation_id) == 128
    assert len(event.lifecycle.label) == 160


@pytest.mark.parametrize("label", ["x" * 161, "first\nsecond", "first\rsecond", "```python print(1) ```"])
def test_rejects_overlong_multiline_or_fenced_source_label(label):
    with pytest.raises(ValidationError):
        ServiceStatusEvent.model_validate(event_payload(
            lifecycle={"operationId": "request-42", "phase": "started", "label": label},
        ))


@pytest.mark.parametrize("extra", [
    {"prompt": "secret"}, {"transcript": "secret"}, {"result": "secret"},
    {"code": "print(1)"}, {"logs": "secret"}, {"metadata": {"safe": "looking"}},
])
def test_rejects_arbitrary_lifecycle_content(extra):
    with pytest.raises(ValidationError):
        ServiceStatusEvent.model_validate(event_payload(
            lifecycle={"operationId": "request-42", "phase": "started", **extra},
        ))


def test_rejects_unknown_lifecycle_phase():
    with pytest.raises(ValidationError):
        ServiceStatusEvent.model_validate(event_payload(
            lifecycle={"operationId": "request-42", "phase": "finished"},
        ))
