"""PWA/worker HTTP boundary tests for the B4 Core routes."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers import browser_tasks
from services.browser_tasks import BrowserTaskService
from tests.test_browser_tasks import FakeBrowserRepository


def _client(*, enabled=True):
    browser_tasks.limiter.reset()
    app = FastAPI()
    app.include_router(browser_tasks.router)
    repo = FakeBrowserRepository()
    service = BrowserTaskService(
        repo, owner_id="owner-1", laptop_id="laptop-1", worker_token="browser-token",
        enabled=enabled, other_credentials=("phone-token", "discord-token"),
    )
    app.dependency_overrides[browser_tasks.get_browser_task_service] = lambda: service
    app.dependency_overrides[browser_tasks.get_current_user] = lambda: {"id": "owner-1", "username": "owner"}
    return TestClient(app), repo


def test_worker_routes_are_registered_before_generic_task_status_path():
    client, _ = _client()
    response = client.get("/api/browser-tasks/worker/identity", headers={"Authorization": "Bearer browser-token"})
    assert response.status_code == 200
    assert response.json()["laptopId"] == "laptop-1"
    assert response.json()["currentBootId"] is None
    assert response.headers["cache-control"] == "no-store"


def test_worker_routes_reject_phone_and_discord_transport_credentials():
    client, _ = _client()
    for token in ("phone-token", "discord-token"):
        response = client.get("/api/browser-tasks/worker/identity", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 403


def test_worker_reconcile_requires_current_boot_and_returns_recorded_receipt():
    client, _ = _client()
    response = client.post(
        "/api/browser-tasks/worker/tasks/25f40e2b-f8e1-4f93-a3d1-f3f7fca471f7/reconcile",
        headers={"Authorization": "Bearer browser-token", "X-Browser-Boot": "new_boot"},
        json={
            "previousBrokerBootId": "old_boot", "fence": 2, "actionId": "broker_task",
            "action": "task_status", "proposalDigest": None, "outcome": "unknown",
        },
    )
    assert response.status_code == 200
    assert response.json() == {"recorded": True}
    assert response.headers["cache-control"] == "no-store"


def test_worker_dispatch_authorization_is_bound_to_current_lease():
    client, _ = _client()
    response = client.post(
        "/api/browser-tasks/worker/tasks/25f40e2b-f8e1-4f93-a3d1-f3f7fca471f7/authorize-dispatch",
        headers={
            "Authorization": "Bearer browser-token", "X-Browser-Boot": "boot-1",
            "X-Browser-Lease": "lease-1", "X-Browser-Fence": "2",
        },
        json={"attemptId": "attempt-1", "action": "observe", "proposalDigest": None},
    )
    assert response.status_code == 200
    permit = response.json()
    assert permit["attemptId"] == "attempt-1"
    assert permit["action"] == "observe"
    assert permit["brokerBootId"] == "boot-1"


def test_worker_dispatch_authorization_rejects_consequential_work_until_review_routes_exist():
    client, _ = _client()
    response = client.post(
        "/api/browser-tasks/worker/tasks/25f40e2b-f8e1-4f93-a3d1-f3f7fca471f7/authorize-dispatch",
        headers={
            "Authorization": "Bearer browser-token", "X-Browser-Boot": "boot-1",
            "X-Browser-Lease": "lease-1", "X-Browser-Fence": "2",
        },
        json={"attemptId": "attempt-1", "action": "fill", "proposalDigest": "a" * 64},
    )
    assert response.status_code == 403


def test_pwa_session_and_enqueue_bind_device_session_owner_and_scope():
    client, _ = _client()
    headers = {"Authorization": "Bearer pwa-session", "Origin": "http://localhost:3000", "X-Phone-Device": "device-1"}
    session = client.post("/api/browser-tasks/sessions", headers=headers, json={
        "deviceId": "device-1", "parentSessionId": "phone-session-a", "providerConsent": "gemini",
    })
    assert session.status_code == 201
    browser_session_id = session.json()["browserSessionId"]
    assert session.json()["parentSessionId"] == "phone-session-a"

    task_id = "25f40e2b-f8e1-4f93-a3d1-f3f7fca471f7"
    task = client.post("/api/browser-tasks/", headers={
        **headers, "X-Browser-Session": browser_session_id,
    }, json={
        "taskId": task_id, "browserSessionId": browser_session_id, "laptopId": "laptop-1",
        "goal": "Read official docs", "scopeId": "public_research", "scopeVersion": 1,
    })
    assert task.status_code == 202
    assert task.json()["taskId"] == task_id
    assert task.json()["status"] == "queued"

    foreign = client.post("/api/browser-tasks/", headers={
        **headers, "X-Browser-Session": browser_session_id,
    }, json={
        "taskId": "ed526541-7afd-4ef9-a2a4-77b6d4176dbe", "browserSessionId": browser_session_id,
        "laptopId": "laptop-1", "goal": "Fill a form", "scopeId": "signed_in", "scopeVersion": 1,
    })
    assert foreign.status_code == 403


def test_cookie_authenticated_write_requires_same_origin():
    client, _ = _client()
    response = client.post("/api/browser-tasks/sessions", headers={
        "Cookie": "ascend_session=opaque", "X-Phone-Device": "device-1",
    }, json={"deviceId": "device-1", "providerConsent": "gemini"})
    assert response.status_code == 403
