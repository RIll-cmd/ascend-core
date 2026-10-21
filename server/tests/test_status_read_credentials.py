import pytest
import asyncio

from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers import status as status_router
from services.status_repository import InMemoryStatusRepository
from services.status_service import StatusService


@pytest.mark.asyncio
async def test_shelf_read_credential_authenticates_without_a_core_user_session():
    service = StatusService(InMemoryStatusRepository())
    secret = await service.provision_shelf_read_credential(credential_id="hub-read-1")

    credential = await service.authenticate_shelf_reader(f"hub-read-1.{secret}")

    assert credential.credential_id == "hub-read-1"


@pytest.mark.asyncio
async def test_producer_credential_cannot_authenticate_as_a_shelf_reader():
    service = StatusService(InMemoryStatusRepository())
    producer_secret = await service.provision_producer_credential(
        credential_id="vision-1", service_id="ascend-vision", instance_id="vision-1"
    )

    with pytest.raises(PermissionError, match="Invalid or revoked"):
        await service.authenticate_shelf_reader(f"vision-1.{producer_secret}")


@pytest.mark.asyncio
async def test_only_one_active_shelf_read_credential_is_allowed():
    service = StatusService(InMemoryStatusRepository())
    await service.provision_shelf_read_credential(credential_id="hub-read-1")

    with pytest.raises(ValueError, match="active"):
        await service.provision_shelf_read_credential(credential_id="hub-read-2")


def test_shelf_endpoint_accepts_only_the_dedicated_read_credential(monkeypatch):
    service = StatusService(InMemoryStatusRepository())
    reader_secret = asyncio.run(service.provision_shelf_read_credential(credential_id="hub-read-1"))
    producer_secret = asyncio.run(service.provision_producer_credential(
        credential_id="vision-1", service_id="ascend-vision", instance_id="vision-1"
    ))
    monkeypatch.setattr(status_router, "get_status_service", lambda: service)
    app = FastAPI()
    app.include_router(status_router.router)
    client = TestClient(app)

    assert client.get("/api/status/shelf").status_code == 401
    assert client.get("/api/status/shelf", headers={"X-Status-Read-Credential": f"vision-1.{producer_secret}"}).status_code == 401
    response = client.get("/api/status/shelf", headers={"X-Status-Read-Credential": f"hub-read-1.{reader_secret}"})

    assert response.status_code == 200
    assert response.json()["schemaVersion"] == 1


def test_lifecycle_events_require_the_producer_bound_instance_and_shelf_hides_operation_id(monkeypatch):
    service = StatusService(InMemoryStatusRepository())
    secret = asyncio.run(service.provision_producer_credential(
        credential_id="codex-default", service_id="codex-cli", instance_id="default"
    ))
    reader_secret = asyncio.run(service.provision_shelf_read_credential(credential_id="hub-read"))
    monkeypatch.setattr(status_router, "get_status_service", lambda: service)
    app = FastAPI()
    app.include_router(status_router.router)
    client = TestClient(app)
    headers = {"X-Status-Credential": f"codex-default.{secret}"}
    event = {
        "schemaVersion": 1,
        "eventId": "00000000-0000-0000-0000-000000000001",
        "sequence": 1,
        "serviceId": "codex-cli",
        "instanceId": "other-instance",
        "serviceType": "agent",
        "state": "working",
        "stateSince": "2026-09-25T00:00:00Z",
        "reportedAt": "2026-09-25T00:00:00Z",
        "lifecycle": {"operationId": "job-1", "phase": "started", "label": "Build"},
    }

    rejected = client.post("/api/status/events", headers=headers, json=event)
    assert rejected.status_code == 403
    event["instanceId"] = "default"
    assert client.post("/api/status/events", headers=headers, json=event).status_code == 202
    event["eventId"] = "00000000-0000-0000-0000-000000000002"
    event["sequence"] = 2
    event["state"] = "idle"
    event["lifecycle"] = {"operationId": "job-1", "phase": "succeeded"}
    assert client.post("/api/status/events", headers=headers, json=event).status_code == 202

    shelf = client.get("/api/status/shelf", headers={"X-Status-Read-Credential": f"hub-read.{reader_secret}"})
    assert shelf.status_code == 200
    completion = shelf.json()["services"][0]["completions"][0]
    assert completion["outcome"] == "succeeded"
    assert completion["label"] == "Build"
    assert "finishedAt" in completion
    assert "operationId" not in completion
