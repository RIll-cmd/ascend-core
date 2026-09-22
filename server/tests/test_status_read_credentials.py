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
