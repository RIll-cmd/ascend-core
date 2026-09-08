import time
from types import SimpleNamespace

import jwt
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import auth_utils
from routers import auth, automations


class OwnershipDatabase:
    def __init__(self, owner_id="user-1"):
        self.owner_id = owner_id
        self.character = SimpleNamespace(find_first=self.find_character)
        self.habit = SimpleNamespace(find_many=self.find_habits)

    async def find_character(self, **kwargs):
        where = kwargs["where"]
        return SimpleNamespace(id=where["id"]) if where["userId"] == self.owner_id else None

    async def find_habits(self, **_kwargs):
        return []


def app_with_auth_router(current_user=None):
    app = FastAPI()
    app.include_router(auth.router)
    if current_user:
        async def authenticated_user():
            return current_user

        app.dependency_overrides[auth.get_current_user] = authenticated_user
    return app


def vision_token_for(user_id="user-1", *, expires_minutes=15, purpose="ascend_vision"):
    return auth_utils.create_access_token(
        data={"sub": user_id, "username": "vision-user"},
        expires_minutes=expires_minutes,
        purpose=purpose,
    )


def automation_client():
    app = FastAPI()
    app.include_router(automations.router)
    return TestClient(app)


def test_authenticated_user_can_mint_a_vision_token():
    response = TestClient(app_with_auth_router({"id": "user-1", "username": "vision-user"})).post("/api/auth/vision-token")

    assert response.status_code == 201
    body = response.json()
    claims = jwt.decode(body["accessToken"], auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
    assert body["tokenType"] == "Bearer"
    assert body["expiresIn"] == 900
    assert claims["sub"] == "user-1"
    assert claims["purpose"] == "ascend_vision"


def test_unauthenticated_request_cannot_mint_a_vision_token():
    response = TestClient(app_with_auth_router()).post("/api/auth/vision-token", headers={"X-Integration-Key": "trusted-but-not-user"})

    assert response.status_code == 401


def test_vision_token_ttl_is_fifteen_minutes():
    token = vision_token_for()
    claims = jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])

    assert 890 <= claims["exp"] - time.time() <= 900


def test_vision_token_accesses_automation_capabilities():
    response = automation_client().get(
        "/api/automations/capabilities",
        headers={"Authorization": f"Bearer {vision_token_for()}"},
    )

    assert response.status_code == 200


@pytest.mark.parametrize(
    "token",
    [
        "not.a.jwt",
        pytest.param(lambda: vision_token_for(expires_minutes=-1), id="expired"),
        pytest.param(lambda: vision_token_for(purpose="other_service"), id="wrong-purpose"),
    ],
)
def test_invalid_vision_tokens_are_rejected(token):
    actual_token = token() if callable(token) else token

    response = automation_client().get(
        "/api/automations/capabilities",
        headers={"Authorization": f"Bearer {actual_token}"},
    )

    assert response.status_code == 401


def test_integration_key_alone_cannot_access_user_scoped_automation():
    response = automation_client().get("/api/automations/capabilities", headers={"X-Integration-Key": "trusted-but-not-user"})

    assert response.status_code == 401


def test_vision_token_preserves_character_ownership(monkeypatch):
    monkeypatch.setattr(automations, "db", OwnershipDatabase(owner_id="user-1"))
    client = automation_client()
    headers = {"Authorization": f"Bearer {vision_token_for('user-1')}"}

    owned = client.get("/api/automations/eligible-habits?characterId=character-1", headers=headers)
    unowned = client.get("/api/automations/eligible-habits?characterId=other-character", headers={"Authorization": f"Bearer {vision_token_for('user-2')}"})

    assert owned.status_code == 200
    assert unowned.status_code == 403


def test_existing_web_token_duration_and_automation_access_remain_compatible():
    web_token = auth_utils.create_access_token({"sub": "user-1", "username": "web-user"})
    claims = jwt.decode(web_token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
    response = automation_client().get("/api/automations/capabilities", headers={"Authorization": f"Bearer {web_token}"})

    assert 29 * 24 * 60 * 60 <= claims["exp"] - time.time() <= 30 * 24 * 60 * 60
    assert "purpose" not in claims
    assert response.status_code == 200


def test_vision_token_cannot_mint_another_vision_token():
    response = TestClient(app_with_auth_router()).post(
        "/api/auth/vision-token",
        headers={"Authorization": f"Bearer {vision_token_for()}"},
    )

    assert response.status_code == 401
