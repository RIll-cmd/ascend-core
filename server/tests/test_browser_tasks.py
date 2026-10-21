"""BrowserTaskService identity, scope and feature-flag behavior tests."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from uuid import uuid4

import pytest

from schemas.browser_tasks import BrowserSessionCreate, BrowserTaskCreate, BrowserWorkerReconcile
from services.browser_tasks import BrowserTaskService
from services.browser_task_repository import (
    _completion_is_identical, _event_page, _reconciliation_is_identical,
    _reconciliation_state_allowed,
)


class FakeBrowserRepository:
    def __init__(self):
        self.devices = {("owner-1", "device-1")}
        self.calls = []

    async def ensure_laptop(self, owner_id, laptop_id, descriptor=None):
        self.calls.append(("ensure", owner_id, laptop_id))

    async def require_active_device(self, owner_id, device_id):
        if (owner_id, device_id) not in self.devices:
            raise PermissionError("Active phone device is required")

    async def create_session(self, **values):
        self.calls.append(("session", values))
        return {"browserSessionId": values["session_id"], "channel": "phone_pwa",
                "parentSessionId": values["parent_session_id"], "sourceLinkGeneration": None,
                "expiresAt": values["now"]}

    async def get_availability(self, owner_id, laptop_id, *, now=None):
        return {"available": True, "reason": "online", "laptopId": laptop_id,
                "lastHeartbeatAt": now, "provider": "gemini", "scopes": []}

    async def get_worker_identity(self, owner_id, laptop_id):
        return {"currentBootId": None, "availability": "offline", "lastHeartbeatAt": None, "revokedAt": None}

    async def enqueue(self, **values):
        self.calls.append(("enqueue", values))
        return {"taskId": values["task_id"], "status": "queued", "createdAt": values["now"],
                "expiresAt": values["now"]}

    async def claim(self, **_kwargs):
        return {"schema_version": 1, "binding": {"task_id": str(uuid4())}, "goal": "Read docs",
                "provider": "gemini", "provider_consent": True, "expires_at": 1_798_500_000.0}

    async def reconcile(self, **values):
        self.calls.append(("reconcile", values))
        return True

    async def authorize_dispatch(self, **values):
        self.calls.append(("authorize_dispatch", values))
        return True


def _service(*, enabled=True):
    repository = FakeBrowserRepository()
    service = BrowserTaskService(
        repository, owner_id="owner-1", laptop_id="laptop-1", worker_token="browser-token",
        enabled=enabled, writes_enabled=False,
        other_credentials=("phone-token", "discord-token"),
        clock=lambda: datetime(2026, 9, 28, tzinfo=timezone.utc),
    )
    return service, repository


def test_service_keeps_task_owner_and_laptop_server_derived():
    service, repository = _service()
    session_id = asyncio.run(service.create_session("owner-1", BrowserSessionCreate.model_validate({
        "deviceId": "device-1", "parentSessionId": "phone-session-a", "providerConsent": "gemini",
    })))
    assert session_id["channel"] == "phone_pwa"
    assert session_id["parentSessionId"] == "phone-session-a"

    request = BrowserTaskCreate.model_validate({
        "taskId": str(uuid4()), "browserSessionId": session_id["browserSessionId"],
        "laptopId": "laptop-1", "goal": "Read official documentation",
        "scopeId": "public_research", "scopeVersion": 1,
    })
    receipt = asyncio.run(service.enqueue("owner-1", "device-1", request))
    assert receipt["status"] == "queued"
    assert [call[0] for call in repository.calls].count("enqueue") == 1

    with pytest.raises(PermissionError):
        asyncio.run(service.enqueue("owner-1", "device-2", request))
    with pytest.raises(PermissionError):
        asyncio.run(service.enqueue("owner-1", "device-1", request.model_copy(update={"laptop_id": "laptop-evil"})))


def test_only_dedicated_browser_worker_credential_is_accepted():
    service, _ = _service()
    service.authenticate_worker("browser-token")
    for token in ("phone-token", "discord-token", "wrong"):
        with pytest.raises(PermissionError):
            service.authenticate_worker(token)


def test_remote_disabled_blocks_session_and_claim_but_allows_safe_status_shape():
    service, _ = _service(enabled=False)
    availability = asyncio.run(service.availability("owner-1", "device-1"))
    assert availability["reason"] == "disabled"
    assert availability["scopes"][0] == {"scopeId": "public_research", "version": 1, "actions": []}
    with pytest.raises(PermissionError):
        asyncio.run(service.create_session("owner-1", BrowserSessionCreate.model_validate({
            "deviceId": "device-1", "providerConsent": "gemini",
        })))
    with pytest.raises(PermissionError):
        asyncio.run(service.claim("boot-1"))


def test_remote_write_scopes_stay_denied_even_when_public_research_is_enabled():
    service, _ = _service()
    request = BrowserTaskCreate.model_validate({
        "taskId": str(uuid4()), "browserSessionId": str(uuid4()), "laptopId": "laptop-1",
        "goal": "Fill a form", "scopeId": "approved_form", "scopeVersion": 1,
    })
    with pytest.raises(PermissionError):
        asyncio.run(service.enqueue("owner-1", "device-1", request))


def test_event_page_cursor_stops_at_last_returned_event_not_latest_persisted_cursor():
    events = [{"sequence": sequence} for sequence in range(11, 61)]
    page = _event_page(events, after=10, current_cursor=80, first_sequence=1)

    assert page == {
        "events": events,
        "cursor": 60,
        "nextCursor": 60,
        "resetRequired": False,
    }


def test_empty_event_page_preserves_requested_cursor_and_reports_retention_reset():
    page = _event_page([], after=12, current_cursor=12, first_sequence=20)

    assert page == {
        "events": [],
        "cursor": 12,
        "nextCursor": 12,
        "resetRequired": True,
    }


def test_completion_retry_is_idempotent_only_for_identical_terminal_content():
    stored = {"state": "completed", "resultJson": '{"summary":"done"}', "terminalReason": None}

    assert _completion_is_identical(stored, "completed", '{"summary":"done"}', None)
    assert not _completion_is_identical(stored, "completed", '{"summary":"different"}', None)
    assert not _completion_is_identical(stored, "partial", '{"summary":"done"}', None)


def test_reconcile_service_binds_report_to_configured_owner_laptop_and_current_boot():
    service, repository = _service()
    payload = BrowserWorkerReconcile.model_validate({
        "previousBrokerBootId": "old_boot", "fence": 2, "actionId": "broker_task",
        "action": "task_status", "proposalDigest": None, "outcome": "unknown",
    })

    assert asyncio.run(service.reconcile("new_boot", str(uuid4()), payload)) is True
    call = next(call for call in repository.calls if call[0] == "reconcile")[1]
    assert call["owner_id"] == "owner-1"
    assert call["laptop_id"] == "laptop-1"
    assert call["current_boot_id"] == "new_boot"
    assert call["payload"]["actionId"] == "broker_task"


def test_reconciliation_idempotency_rejects_conflicting_evidence_for_same_action():
    payload = {
        "previousBrokerBootId": "old_boot", "fence": 2, "actionId": "action_1",
        "action": "click", "proposalDigest": "a" * 64, "outcome": "unknown",
    }
    assert _reconciliation_is_identical(payload, payload)
    assert not _reconciliation_is_identical(payload, {**payload, "outcome": "attempted"})


def test_reconciliation_only_attaches_to_terminal_records_without_reopening_them():
    assert all(_reconciliation_state_allowed(state) for state in (
        "unknown", "completed", "partial", "failed", "cancelled", "expired",
    ))
    assert not _reconciliation_state_allowed("running")
    assert not _reconciliation_state_allowed("queued")


def test_dispatch_authorization_allows_only_public_read_actions_without_review():
    service, repository = _service()
    permit = asyncio.run(service.authorize_dispatch(
        "boot-1", str(uuid4()), "lease-1", 2, "attempt-1", "observe", None,
    ))

    assert permit["taskId"]
    assert permit["attemptId"] == "attempt-1"
    assert permit["action"] == "observe"
    assert permit["proposalDigest"] is None
    assert any(call[0] == "authorize_dispatch" for call in repository.calls)


@pytest.mark.parametrize("action,digest", [("fill", "a" * 64), ("click", "a" * 64), ("select", None)])
def test_dispatch_authorization_rejects_write_or_unreviewed_actions(action, digest):
    service, _ = _service()
    with pytest.raises(PermissionError):
        asyncio.run(service.authorize_dispatch(
            "boot-1", str(uuid4()), "lease-1", 2, "attempt-1", action, digest,
        ))
