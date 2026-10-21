"""Validation and fail-closed contract tests for B4 browser APIs."""
from __future__ import annotations

from uuid import uuid4

import pytest
from pydantic import ValidationError

from schemas.browser_tasks import (
    BrowserSessionCreate, BrowserTaskCreate, BrowserWorkerBootRegistration,
    BrowserWorkerCompletion, BrowserWorkerEventsPublishRequest, BrowserWorkerReconcile,
    BrowserWorkerTask,
)


def test_pwa_requests_forbid_unknown_owner_and_source_fields():
    device_id = "device_A"
    session = BrowserSessionCreate.model_validate({
        "deviceId": device_id, "parentSessionId": "phone-session-1", "providerConsent": "gemini",
    })
    assert session.device_id == device_id
    with pytest.raises(ValidationError):
        BrowserSessionCreate.model_validate({
            "deviceId": device_id, "providerConsent": "gemini", "ownerId": "attacker",
        })


def test_browser_task_rejects_extra_or_non_public_scope_by_validation_boundary():
    task = BrowserTaskCreate.model_validate({
        "taskId": str(uuid4()), "browserSessionId": str(uuid4()), "laptopId": "laptop_A",
        "goal": "  Read official docs  ", "scopeId": "public_research", "scopeVersion": 1,
    })
    assert task.goal == "Read official docs"
    with pytest.raises(ValidationError):
        BrowserTaskCreate.model_validate({
            "taskId": str(uuid4()), "browserSessionId": str(uuid4()), "laptopId": "laptop_A",
            "goal": "Read docs", "scopeId": "public_research", "scopeVersion": 1,
            "origin": "https://attacker.example",
        })


def test_claim_contract_has_exact_vision_snake_case_envelope():
    task_id, session_id = str(uuid4()), str(uuid4())
    payload = {
        "schema_version": 1,
        "binding": {
            "task_id": task_id, "owner_id": "owner_A", "channel": "phone_pwa",
            "browser_session_id": session_id, "laptop_id": "laptop_A", "broker_boot_id": "boot_A",
            "lease_id": "lease_A", "fence": 2, "scope_id": "public_research", "scope_version": 1,
        },
        "goal": "Read official docs", "provider": "gemini", "provider_consent": True,
        "expires_at": 1_798_500_000.0,
    }
    validated = BrowserWorkerTask.model_validate(payload)
    assert str(validated.binding.task_id) == task_id
    with pytest.raises(ValidationError):
        BrowserWorkerTask.model_validate({**payload, "owner_id": "caller_override"})


def test_completion_bounds_all_content_and_forbids_result_on_failed_task():
    value = BrowserWorkerCompletion.model_validate({
        "state": "completed", "summary": "Finished research", "eventsCursor": 5,
        "result": {"sources": []},
    })
    assert value.events_cursor == 5
    with pytest.raises(ValidationError):
        BrowserWorkerCompletion.model_validate({
            "state": "failed", "summary": "Failed", "eventsCursor": 0, "result": {"secret": "x"},
        })
    with pytest.raises(ValidationError):
        BrowserWorkerCompletion.model_validate({
            "state": "completed", "summary": "x" * 16_400, "eventsCursor": 1, "result": None,
        })


def test_event_batches_require_monotonic_sequence_and_bounded_size():
    BrowserWorkerEventsPublishRequest.model_validate({"events": [
        {"sequence": 1, "eventType": "progress", "summary": "Searching"},
        {"sequence": 2, "eventType": "source", "summary": "Found official documentation"},
    ]})
    with pytest.raises(ValidationError):
        BrowserWorkerEventsPublishRequest.model_validate({"events": [
            {"sequence": 2, "eventType": "progress"}, {"sequence": 2, "eventType": "progress"},
        ]})


def test_boot_registration_requires_valid_compare_and_swap_identity():
    payload = BrowserWorkerBootRegistration.model_validate({"expectedBootId": None, "newBootId": "boot_1"})
    assert payload.new_boot_id == "boot_1"
    with pytest.raises(ValidationError):
        BrowserWorkerBootRegistration.model_validate({"newBootId": "bad/boot"})


def test_reconcile_contract_is_content_free_bounded_and_supports_task_sentinel():
    reconcile = BrowserWorkerReconcile.model_validate({
        "previousBrokerBootId": "old_boot", "fence": 2, "actionId": "broker_task",
        "action": "task_status", "proposalDigest": None, "outcome": "unknown",
    })
    assert reconcile.action_id == "broker_task"
    with pytest.raises(ValidationError):
        BrowserWorkerReconcile.model_validate({
            "previousBrokerBootId": "old_boot", "fence": 2, "actionId": "action_1",
            "action": "click", "proposalDigest": "not-a-digest", "outcome": "unknown",
            "pageText": "must never be accepted",
        })
