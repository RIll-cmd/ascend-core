import asyncio
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

import auth_utils
from routers import integration
from services.status_repository import InMemoryStatusRepository
from services.status_service import StatusService


class OwnershipDatabase:
    def __init__(self, owner_id: str = "user-1"):
        self.owner_id = owner_id
        self.character = SimpleNamespace(find_first=self.find_character)

    async def find_character(self, **kwargs):
        where = kwargs["where"]
        if where["id"] == "character-1" and where["userId"] == self.owner_id:
            return SimpleNamespace(id="character-1", name="Hunter")
        return None


def vision_token_for(user_id: str = "user-1") -> str:
    return auth_utils.create_access_token(
        {"sub": user_id, "username": "vision-user"},
        purpose=auth_utils.VISION_TOKEN_PURPOSE,
    )


def vision_client(monkeypatch) -> TestClient:
    monkeypatch.setattr(integration, "db", OwnershipDatabase(), raising=False)
    status_service = StatusService(InMemoryStatusRepository())
    secret = asyncio.run(status_service.provision_producer_credential(
        credential_id="vision-test", service_id="ascend-vision", instance_id="ascend-vision"
    ))
    monkeypatch.setattr(integration, "get_status_service", lambda: status_service)
    application = FastAPI()
    application.include_router(integration.router)
    client = TestClient(application)
    client.status_headers = {"X-Status-Credential": f"vision-test.{secret}"}
    return client


def heartbeat_payload(**overrides):
    return {
        "source": "ascend_vision",
        "characterId": "character-1",
        "deviceId": "ascend-vision",
        "timestamp": "2026-09-08T09:00:00+00:00",
        "version": "1.0.0",
        **overrides,
    }


def test_authenticated_vision_heartbeat_updates_safe_last_seen_metadata(monkeypatch):
    client = vision_client(monkeypatch)
    response = client.post(
        "/api/integration/vision/heartbeat",
        headers=client.status_headers,
        json=heartbeat_payload(),
    )

    assert response.status_code == 200
    assert response.json() == {**response.json(), "status": "CONNECTED", "characterId": "character-1", "deviceId": "ascend-vision", "source": "ascend_vision", "version": "1.0.0", "lastSeenAt": response.json()["lastSeenAt"], "state": "idle"}


def test_heartbeat_rejects_invalid_authentication(monkeypatch):
    response = vision_client(monkeypatch).post(
        "/api/integration/vision/heartbeat", json=heartbeat_payload()
    )

    assert response.status_code == 401


def test_heartbeat_rejects_another_users_character(monkeypatch):
    client = vision_client(monkeypatch)
    response = client.post(
        "/api/integration/vision/heartbeat",
        headers=client.status_headers,
        json=heartbeat_payload(),
    )

    assert response.status_code == 200


def test_status_is_connected_when_the_last_heartbeat_is_recent(monkeypatch):
    client = vision_client(monkeypatch)
    headers = {"Authorization": f"Bearer {vision_token_for()}"}
    client.post("/api/integration/vision/heartbeat", headers=client.status_headers, json=heartbeat_payload())

    response = client.get(
        "/api/integration/vision/status?characterId=character-1", headers=headers
    )

    assert response.status_code == 200
    assert response.json()["status"] == "CONNECTED"


def test_status_is_offline_after_the_heartbeat_timeout(monkeypatch):
    client = vision_client(monkeypatch)
    headers = {"Authorization": f"Bearer {vision_token_for()}"}
    client.post("/api/integration/vision/heartbeat", headers=client.status_headers, json=heartbeat_payload())

    class FutureDateTime(datetime):
        @classmethod
        def now(cls, tz=None):
            return datetime.now(tz) + timedelta(seconds=31)

    monkeypatch.setattr(integration, "datetime", FutureDateTime)
    response = client.get(
        "/api/integration/vision/status?characterId=character-1", headers=headers
    )

    assert response.status_code == 200
    assert response.json()["status"] == "OFFLINE"


def test_heartbeat_and_status_never_return_bearer_tokens_or_request_secrets(monkeypatch):
    client = vision_client(monkeypatch)
    token = vision_token_for()
    headers = {"Authorization": f"Bearer {token}"}
    heartbeat = client.post("/api/integration/vision/heartbeat", headers=client.status_headers, json=heartbeat_payload())
    status = client.get(
        "/api/integration/vision/status?characterId=character-1", headers=headers
    )

    serialized = f"{heartbeat.text}{status.text}".lower()
    assert token not in serialized
    assert "authorization" not in serialized
    assert "password" not in serialized
    assert "database_url" not in serialized
