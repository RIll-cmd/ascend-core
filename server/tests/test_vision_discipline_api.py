from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

import auth_utils
from routers import vision_discipline


def token(user_id="user-1", purpose=None):
    return auth_utils.create_access_token({"sub": user_id}, purpose=purpose)


def headers(user_id="user-1", purpose=None):
    return {"Authorization": f"Bearer {token(user_id, purpose)}"}


def payload(**changes):
    return {
        "eventId": "event-1", "characterId": "character-1", "behavior": "PHONE_USE",
        "stage": "WARNING", "deviceId": "vision-1",
        "observedAt": datetime.now(timezone.utc).isoformat(), "reason": "Phone detected.",
        **changes,
    }


@pytest.fixture
def client(monkeypatch):
    async def owned(character_id, user):
        if character_id != "character-1" or user["id"] != "user-1":
            from fastapi import HTTPException
            raise HTTPException(403, "Forbidden")
        return SimpleNamespace(id=character_id)

    async def record(request):
        return {"success": True, "log": {"eventId": request.eventId}}

    async def settings(character_id):
        return [{"behavior": "PHONE_USE", "penaltyAmount": 10}]

    async def update(character_id, behavior, amount):
        return {"behavior": behavior.value, "penaltyAmount": amount}

    async def logs(character_id, limit=50):
        return [{"eventId": "event-1"}]

    monkeypatch.setattr(vision_discipline, "get_owned_vision_character", owned)
    monkeypatch.setattr(vision_discipline, "require_owned_character", owned)
    monkeypatch.setattr(vision_discipline, "record_discipline_event", record)
    monkeypatch.setattr(vision_discipline, "get_discipline_settings", settings)
    monkeypatch.setattr(vision_discipline, "update_discipline_setting", update)
    monkeypatch.setattr(vision_discipline, "list_discipline_logs", logs)
    app = FastAPI()
    app.include_router(vision_discipline.router)
    return TestClient(app)


def test_vision_event_requires_scoped_token_and_owned_character(client):
    path = "/api/integration/vision/discipline-events"
    assert client.post(path, json=payload()).status_code == 401
    assert client.post(path, headers=headers(), json=payload()).status_code == 401
    assert client.post(path, headers=headers("user-2", "ascend_vision"), json=payload()).status_code == 403
    response = client.post(path, headers=headers(purpose="ascend_vision"), json=payload())
    assert response.status_code == 200
    assert response.json()["log"]["eventId"] == "event-1"


def test_event_contract_rejects_bad_behavior_and_naive_time(client):
    path = "/api/integration/vision/discipline-events"
    h = headers(purpose="ascend_vision")
    assert client.post(path, headers=h, json=payload(behavior="OTHER")).status_code == 422
    assert client.post(path, headers=h, json=payload(observedAt="2026-09-13T09:00:00")).status_code == 422


def test_settings_and_logs_require_web_token(client):
    base = "/api/habits/character-1/vision-discipline"
    assert client.get(base + "/settings", headers=headers(purpose="ascend_vision")).status_code == 401
    assert client.get(base + "/settings", headers=headers("user-2")).status_code == 403
    assert client.get(base + "/settings", headers=headers()).json()[0]["penaltyAmount"] == 10
    assert client.get(base + "/logs?limit=101", headers=headers()).status_code == 422
    assert client.get(base + "/logs", headers=headers()).json()[0]["eventId"] == "event-1"


def test_user_can_update_only_valid_penalty_amount(client):
    path = "/api/habits/character-1/vision-discipline/settings/PHONE_USE"
    assert client.put(path, headers=headers(), json={"penaltyAmount": 25}).json()["penaltyAmount"] == 25
    assert client.put(path, headers=headers(), json={"penaltyAmount": 0}).status_code == 422
    assert client.put(path, headers=headers(), json={"penaltyAmount": 101}).status_code == 422
    assert client.put(path.replace("PHONE_USE", "OTHER"), headers=headers(), json={"penaltyAmount": 10}).status_code == 422
