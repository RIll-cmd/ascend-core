from fastapi import FastAPI
from fastapi.testclient import TestClient

import auth_utils
from routers import integration


def web_token_for(user_id: str) -> str:
    return auth_utils.create_access_token({"sub": user_id, "username": "web-user"})


def test_vision_contract_rejects_a_normal_web_token():
    app = FastAPI()
    app.include_router(integration.router)
    client = TestClient(app)

    response = client.get(
        "/api/integration/vision/capabilities",
        headers={"Authorization": f"Bearer {web_token_for('user-1')}"},
    )

    assert response.status_code == 401
