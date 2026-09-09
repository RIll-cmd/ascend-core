from fastapi import FastAPI
from fastapi.testclient import TestClient
from types import SimpleNamespace

import pytest

import auth_utils
from routers import integration


def web_token_for(user_id: str) -> str:
    return auth_utils.create_access_token({"sub": user_id, "username": "web-user"})


def vision_token_for(user_id: str, *, expires_minutes: int = 15, purpose: str = "ascend_vision") -> str:
    return auth_utils.create_access_token(
        {"sub": user_id, "username": "vision-user"},
        expires_minutes=expires_minutes,
        purpose=purpose,
    )


def vision_headers(user_id: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {vision_token_for(user_id)}"}


def query_payload(**overrides):
    payload = {
        "characterId": "character-1",
        "requestId": "vision-query-001",
        "capabilityVersion": "2026-09-09",
        "intent": "missions_summary",
        "parameters": {},
    }
    payload.update(overrides)
    return payload


class OwnershipDatabase:
    def __init__(self, owner_id: str):
        self.owner_id = owner_id
        self.character = SimpleNamespace(find_first=self.find_character)

    async def find_character(self, *, where):
        if where == {"id": "character-1", "userId": self.owner_id}:
            return SimpleNamespace(id="character-1")
        return None


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(integration.router)
    return TestClient(app)


def test_vision_contract_rejects_a_normal_web_token(client):
    response = client.get(
        "/api/integration/vision/capabilities",
        headers={"Authorization": f"Bearer {web_token_for('user-1')}"},
    )

    assert response.status_code == 401


@pytest.mark.parametrize(
    "token",
    [
        "not.a.jwt",
        pytest.param(lambda: vision_token_for("user-1", expires_minutes=-1), id="expired"),
        pytest.param(lambda: vision_token_for("user-1", purpose="other_service"), id="wrong-purpose"),
    ],
)
def test_capabilities_reject_invalid_vision_tokens(client, token):
    actual_token = token() if callable(token) else token

    response = client.get(
        "/api/integration/vision/capabilities",
        headers={"Authorization": f"Bearer {actual_token}"},
    )

    assert response.status_code == 401


def test_capabilities_return_the_read_only_manifest(client):
    response = client.get("/api/integration/vision/capabilities", headers=vision_headers("user-1"))

    assert response.status_code == 200
    assert response.json()["writes"] == []
    assert response.json()["reads"]["recovery_summary"]["availability"] == "available"


def test_query_checks_ownership_before_reader_dispatch(client, monkeypatch):
    async def unexpected_dispatch(_request):
        raise AssertionError("unowned character must never reach a Core reader")

    monkeypatch.setattr(integration, "db", OwnershipDatabase(owner_id="user-1"))
    monkeypatch.setattr(integration, "execute_vision_query", unexpected_dispatch, raising=False)

    response = client.post(
        "/api/integration/vision/query",
        headers=vision_headers("user-2"),
        json=query_payload(),
    )

    assert response.status_code == 403


def test_query_returns_a_structured_unsupported_version_error(client, monkeypatch):
    monkeypatch.setattr(integration, "db", OwnershipDatabase(owner_id="user-1"))

    response = client.post(
        "/api/integration/vision/query",
        headers=vision_headers("user-1"),
        json=query_payload(capabilityVersion="2025-01-01"),
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "unsupported_capability_version"
    assert response.json()["requestId"] == "vision-query-001"
