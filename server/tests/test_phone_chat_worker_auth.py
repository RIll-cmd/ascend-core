from fastapi import FastAPI
from fastapi.testclient import TestClient
from uuid import uuid4
from datetime import datetime, timedelta, timezone
import asyncio
import pytest

import auth_utils
from routers import phone_chat
from services.phone_chat_queue import PhoneChatQueue
from services.phone_chat_repository import InMemoryPhoneChatRepository


def make_client(*, authenticated_user=None, pairing=None):
    phone_chat.limiter.reset()
    app = FastAPI()
    app.include_router(phone_chat.router)
    queue = PhoneChatQueue(InMemoryPhoneChatRepository(), owner_id="user-1", worker_token="worker-secret")
    app.dependency_overrides[phone_chat.get_phone_chat_queue] = lambda: queue
    if pairing is not None:
        app.dependency_overrides[phone_chat.get_phone_chat_pairing] = lambda: pairing
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


@pytest.mark.parametrize("method,path", [
    ("post", "/api/phone-chat/discord/pairing-codes"),
    ("get", "/api/phone-chat/discord/link"),
    ("delete", "/api/phone-chat/discord/link"),
])
def test_discord_browser_routes_require_login_and_do_not_accept_bridge_bearer(method, path):
    client, _ = make_client()
    params = {"deviceId": "device-1"}
    assert getattr(client, method)(path, params=params, headers={"Origin": "http://localhost:3000"}).status_code == 401
    assert getattr(client, method)(path, params=params, headers={
        "Authorization": "Bearer bridge-secret", "Origin": "http://localhost:3000",
    }).status_code == 401


def test_discord_bridge_requires_dedicated_token_and_rejects_worker_or_browser_token(monkeypatch):
    monkeypatch.setenv("ASCEND_DISCORD_BRIDGE_TOKEN", "bridge-secret")
    client, _ = make_client()
    browser_token = auth_utils.create_access_token({"sub": "user-1", "username": "owner"})
    payload = {"discordUserId": "123456789012345678"}
    path = "/api/phone-chat/worker/discord/verify-link"
    assert client.post(path, json=payload).status_code == 401
    for token in ("worker-secret", browser_token):
        assert client.post(path, json=payload, headers={"Authorization": f"Bearer {token}"}).status_code == 403


def test_discord_pairing_dependency_rejects_worker_token_reused_as_hmac_secret(monkeypatch):
    monkeypatch.setenv("ASCEND_PHONE_OWNER_ID", "user-1")
    monkeypatch.setenv("ASCEND_PHONE_WORKER_TOKEN", "worker-secret")
    monkeypatch.setenv("ASCEND_DISCORD_BRIDGE_TOKEN", "bridge-secret")
    monkeypatch.setenv("ASCEND_DISCORD_PAIRING_HMAC_SECRET", "worker-secret")
    pairing = asyncio.run(phone_chat.get_phone_chat_pairing())
    with pytest.raises(PermissionError):
        asyncio.run(pairing.verify_link("123456789012345678"))


class _PairingStub:
    def __init__(self):
        self.created_for = None
        self.revoked_for = None

    async def create_pairing(self, owner_id):
        from schemas.phone_chat import CreateDiscordPairingResponse
        self.created_for = owner_id
        return CreateDiscordPairingResponse(code="A" * 43, expiresAt=datetime.now(timezone.utc) + timedelta(minutes=5))

    async def link_status(self, owner_id):
        return owner_id == "user-1"

    async def revoke_link(self, owner_id):
        self.revoked_for = owner_id
        return True

    async def consume_pairing(self, code, discord_user_id):
        return code == "A" * 43 and discord_user_id == "123456789012345678"

    async def verify_link(self, discord_user_id):
        return "user-1" if discord_user_id == "123456789012345678" else None


def test_discord_browser_routes_bind_authenticated_owner_to_active_device_and_origin():
    pairing = _PairingStub()
    client, queue = make_client(authenticated_user={"id": "user-1"}, pairing=pairing)
    path = "/api/phone-chat/discord/pairing-codes"
    assert client.post(path, params={"deviceId": "missing"}, headers={"Origin": "http://localhost:3000"}).status_code == 403
    device = asyncio.run(queue.register_device("user-1"))
    params = {"deviceId": device.id}
    assert client.post(path, params=params).status_code == 403
    assert client.post(path, params=params, headers={"Origin": "https://evil.example"}).status_code == 403
    created = client.post(path, params=params, headers={"Origin": "http://localhost:3000"})
    assert created.status_code == 201
    assert pairing.created_for == "user-1"
    assert client.get("/api/phone-chat/discord/link", params=params).json() == {"linked": True}
    assert client.delete("/api/phone-chat/discord/link", params=params).status_code == 403
    assert client.delete("/api/phone-chat/discord/link", params=params,
                         headers={"Origin": "http://localhost:3000"}).status_code == 204
    assert pairing.revoked_for == "user-1"


def test_cookie_auth_cannot_skip_origin_by_adding_a_dummy_bearer_header():
    pairing = _PairingStub()
    client, queue = make_client(pairing=pairing)
    device = asyncio.run(queue.register_device("user-1"))
    browser_token = auth_utils.create_access_token({"sub": "user-1", "username": "owner"})
    client.cookies.set("ascend_session", browser_token)
    headers = {"Authorization": "Bearer dummy", "Origin": "https://evil.example"}
    params = {"deviceId": device.id}
    assert client.post("/api/phone-chat/discord/pairing-codes", params=params, headers=headers).status_code == 403
    assert client.delete("/api/phone-chat/discord/link", params=params, headers=headers).status_code == 403


def test_discord_browser_routes_reject_non_owner_even_with_valid_device():
    pairing = _PairingStub()
    client, _ = make_client(authenticated_user={"id": "other-user"}, pairing=pairing)
    origin = {"Origin": "http://localhost:3000"}
    params = {"deviceId": "device-1"}
    assert client.post("/api/phone-chat/discord/pairing-codes", params=params, headers=origin).status_code == 403
    assert client.get("/api/phone-chat/discord/link", params=params).status_code == 403
    assert client.delete("/api/phone-chat/discord/link", params=params, headers=origin).status_code == 403


def test_discord_pairing_creation_and_status_checks_are_rate_limited():
    client, queue = make_client(authenticated_user={"id": "user-1"}, pairing=_PairingStub())
    device = asyncio.run(queue.register_device("user-1"))
    params = {"deviceId": device.id}
    origin = {"Origin": "http://localhost:3000"}
    create_codes = [client.post("/api/phone-chat/discord/pairing-codes", params=params, headers=origin)
                    for _ in range(6)]
    statuses = [client.get("/api/phone-chat/discord/link", params=params) for _ in range(61)]
    assert any(response.status_code == 429 for response in create_codes)
    assert any(response.status_code == 429 for response in statuses)


def test_discord_bridge_accepts_only_dedicated_token_and_never_accepts_owner_override(monkeypatch):
    monkeypatch.setenv("ASCEND_DISCORD_BRIDGE_TOKEN", "bridge-secret")
    pairing = _PairingStub()
    client, _ = make_client(pairing=pairing)
    auth = {"Authorization": "Bearer bridge-secret"}
    path = "/api/phone-chat/worker/discord/consume-link"
    payload = {"code": "A" * 43, "discordUserId": "123456789012345678"}
    assert client.post(path, headers=auth, json={**payload, "ownerId": "other-user"}).status_code == 400
    assert client.post(path, headers=auth, json=payload).json() == {"linked": True}
    assert client.post(path, headers=auth, json={**payload, "code": "B" * 43}).json() == {"detail": "Pairing unavailable"}
    malformed = client.post(path, headers=auth, json={**payload, "code": "private-invalid-code"})
    assert malformed.json() == {"detail": "Pairing unavailable"}
    verify = "/api/phone-chat/worker/discord/verify-link"
    assert client.post(verify, headers=auth, json={
        "discordUserId": payload["discordUserId"], "ownerId": "other-user",
    }).status_code == 400
    assert client.post(verify, headers=auth, json={"discordUserId": payload["discordUserId"]}).json() == {
        "linked": True, "ownerId": "user-1",
    }
    assert client.post(verify, headers=auth, json={"discordUserId": "223456789012345678"}).json() == {
        "linked": False,
    }


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

    def fake_vision_handler(claimed_job):
        assert claimed_job["text"] == "What is Hub status?"
        return {"status": "completed", "reply": "Antigravity is idle."}

    result = fake_vision_handler(job)
    assert client.post(f"/api/phone-chat/worker/jobs/{message_id}/complete", headers={
        **worker, "X-Phone-Lease": job["leaseId"],
    }, json=result).status_code == 204
    # A repeated identical completion is idempotent: the delivery has one reply.
    assert client.post(f"/api/phone-chat/worker/jobs/{message_id}/complete", headers={
        **worker, "X-Phone-Lease": job["leaseId"],
    }, json=result).status_code == 204

    status = client.get(f"/api/phone-chat/messages/{message_id}", params={"deviceId": device})
    assert status.json()["reply"] == "Antigravity is idle."
    acknowledged = client.post(f"/api/phone-chat/messages/{message_id}/ack", params={"deviceId": device}, headers=origin)
    assert acknowledged.status_code == 200
    assert acknowledged.json()["status"] == "completed"
    after_ack = client.get(f"/api/phone-chat/messages/{message_id}", params={"deviceId": device})
    assert after_ack.json()["status"] == "completed"
    assert "reply" not in after_ack.json()
    assert client.post(f"/api/phone-chat/messages/{message_id}/ack", params={"deviceId": device}, headers=origin).status_code == 200
    other_device = client.post("/api/phone-chat/devices", headers=origin).json()["deviceId"]
    assert client.get(f"/api/phone-chat/messages/{message_id}", params={"deviceId": other_device}).status_code == 404
    assert job_is_absent(queue, message_id)

    expired_id = "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fe"
    assert client.post("/api/phone-chat/messages", headers=origin, json={
        "deviceId": device, "messageId": expired_id, "sessionId": "tab-1", "text": "Expired private prompt",
    }).status_code == 202
    assert asyncio.run(queue.repository.update_job(expired_id, {"status": "queued"}, {
        "expires_at": datetime.now(timezone.utc) - timedelta(seconds=1),
    }))
    assert client.post("/api/phone-chat/worker/claim", headers=worker).status_code == 204
    expired = client.get(f"/api/phone-chat/messages/{expired_id}", params={"deviceId": device})
    assert expired.status_code == 200
    assert expired.json()["status"] == "expired"
    assert expired.json()["reply"] is None
    assert asyncio.run(queue.repository.get_job(expired_id)).text == ""
    assert client.post(f"/api/phone-chat/messages/{expired_id}/ack", params={"deviceId": device}, headers=origin).status_code == 200
    assert job_is_absent(queue, expired_id)
    expired_tombstone = client.get(f"/api/phone-chat/messages/{expired_id}", params={"deviceId": device})
    assert expired_tombstone.json()["status"] == "expired"
    assert "reply" not in expired_tombstone.json()
    assert client.delete(f"/api/phone-chat/devices/{device}", headers=origin).status_code == 204
    assert client.delete(f"/api/phone-chat/devices/{device}", headers=origin).status_code == 204


def job_is_absent(queue, message_id):
    import asyncio
    return asyncio.run(queue.repository.get_job(message_id)) is None
