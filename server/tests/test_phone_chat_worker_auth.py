from fastapi import FastAPI
from fastapi.testclient import TestClient
from uuid import uuid4

import auth_utils
from routers import phone_chat
from services.phone_chat_queue import PhoneChatQueue
from services.phone_chat_repository import InMemoryPhoneChatRepository


def make_client(*, authenticated_user=None):
    phone_chat.limiter.reset()
    app = FastAPI()
    app.include_router(phone_chat.router)
    queue = PhoneChatQueue(InMemoryPhoneChatRepository(), owner_id="user-1", worker_token="worker-secret")
    app.dependency_overrides[phone_chat.get_phone_chat_queue] = lambda: queue
    if authenticated_user is not None:
        app.dependency_overrides[phone_chat.get_current_user] = lambda: authenticated_user
    return TestClient(app), queue


def test_pwa_routes_require_a_user_and_worker_routes_require_worker_bearer():
    client, _ = make_client()

    assert client.post("/api/phone-chat/devices", headers={"Origin": "http://localhost:3000"}).status_code == 401
    assert client.post("/api/phone-chat/worker/claim").status_code == 401
    assert client.post("/api/phone-chat/worker/claim", headers={
        "Authorization": "Bearer wrong",
    }).status_code == 403


def test_cookie_authenticated_pwa_writes_require_an_allowed_origin():
    client, _ = make_client(authenticated_user={"id": "user-1", "username": "owner"})

    no_origin = client.post("/api/phone-chat/devices")
    foreign_origin = client.post("/api/phone-chat/devices", headers={"Origin": "https://evil.example"})
    allowed = client.post("/api/phone-chat/devices", headers={"Origin": "http://localhost:3000"})

    assert no_origin.status_code == 403
    assert foreign_origin.status_code == 403
    assert allowed.status_code == 201
    assert allowed.json()["deviceId"]


def test_worker_rejects_a_valid_browser_session_token_and_browser_rejects_worker_token():
    client, _ = make_client()
    browser_token = auth_utils.create_access_token({"sub": "user-1", "username": "owner"})

    worker_with_browser_token = client.post("/api/phone-chat/worker/claim", headers={
        "Authorization": f"Bearer {browser_token}",
    })
    browser_with_worker_token = client.post("/api/phone-chat/devices", headers={
        "Authorization": "Bearer worker-secret",
        "Origin": "http://localhost:3000",
    })

    assert worker_with_browser_token.status_code == 403
    assert browser_with_worker_token.status_code == 401


def test_non_owner_cannot_register_device_or_choose_owner_in_message_payload():
    client, _ = make_client(authenticated_user={"id": "other-user", "username": "intruder"})
    headers = {"Origin": "http://localhost:3000"}

    denied = client.post("/api/phone-chat/devices", headers=headers)
    assert denied.status_code == 403

    client, _ = make_client(authenticated_user={"id": "user-1", "username": "owner"})
    response = client.post("/api/phone-chat/messages", headers=headers, json={
        "deviceId": "device-1",
        "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd",
        "sessionId": "session-1",
        "text": "hello",
        "ownerId": "other-user",
    })
    assert response.status_code == 422


def test_pwa_device_registration_rejects_worker_bearer_even_if_origin_is_trusted():
    client, _ = make_client()
    response = client.post("/api/phone-chat/devices", headers={
        "Authorization": "Bearer worker-secret",
        "Origin": "http://localhost:3000",
    })
    assert response.status_code == 401


def test_message_enqueue_is_rate_limited():
    client, queue = make_client(authenticated_user={"id": "user-1", "username": "owner"})
    import asyncio
    device = asyncio.run(queue.register_device("user-1"))
    headers = {"Origin": "http://localhost:3000"}
    responses = [client.post("/api/phone-chat/messages", headers=headers, json={
        "deviceId": device.id,
        "messageId": str(uuid4()),
        "sessionId": "session-1",
        "text": "rate limit probe",
    }) for _ in range(21)]

    assert any(response.status_code == 429 for response in responses)


def test_http_queue_flow_claims_completes_reads_and_acknowledges_one_reply():
    client, queue = make_client(authenticated_user={"id": "user-1", "username": "owner"})
    origin = {"Origin": "http://localhost:3000"}
    device = client.post("/api/phone-chat/devices", headers=origin).json()["deviceId"]
    message_id = "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd"
    accepted = client.post("/api/phone-chat/messages", headers=origin, json={
        "deviceId": device, "messageId": message_id, "sessionId": "tab-1", "text": "What is Hub status?",
    })
    assert accepted.status_code == 202
    assert accepted.json()["status"] == "queued"

    worker = {"Authorization": "Bearer worker-secret"}
    claimed = client.post("/api/phone-chat/worker/claim", headers=worker)
    assert claimed.status_code == 200
    job = claimed.json()
    assert job["text"] == "What is Hub status?"
    assert job["ownerId"] == "user-1"
    assert client.post(f"/api/phone-chat/worker/jobs/{message_id}/start", headers={
        **worker, "X-Phone-Lease": job["leaseId"],
    }).status_code == 204
    assert client.post(f"/api/phone-chat/worker/jobs/{message_id}/complete", headers={
        **worker, "X-Phone-Lease": job["leaseId"],
    }, json={"status": "completed", "reply": "Antigravity is idle."}).status_code == 204

    status = client.get(f"/api/phone-chat/messages/{message_id}", params={"deviceId": device})
    assert status.json()["reply"] == "Antigravity is idle."
    acknowledged = client.post(f"/api/phone-chat/messages/{message_id}/ack", params={"deviceId": device}, headers=origin)
    assert acknowledged.status_code == 200
    assert acknowledged.json()["status"] == "completed"
    after_ack = client.get(f"/api/phone-chat/messages/{message_id}", params={"deviceId": device})
    assert after_ack.json()["status"] == "completed"
    assert "reply" not in after_ack.json()
    assert job_is_absent(queue, message_id)


def job_is_absent(queue, message_id):
    import asyncio
    return asyncio.run(queue.repository.get_job(message_id)) is None
