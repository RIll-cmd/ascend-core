import importlib
import importlib.util

import pytest
from pydantic import ValidationError


def _phone_chat_schemas():
    if importlib.util.find_spec("schemas.phone_chat") is None:
        pytest.fail("phone chat DTO module has not been implemented")
    return importlib.import_module("schemas.phone_chat")


def test_phone_message_request_accepts_bounded_message_and_rejects_owner_override():
    schemas = _phone_chat_schemas()
    request = schemas.PhoneChatMessageRequest.model_validate({
        "deviceId": "device-1",
        "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd",
        "sessionId": "tab_session-1",
        "text": "x" * 4_000,
    })

    assert len(request.text) == 4_000
    with pytest.raises(ValidationError):
        schemas.PhoneChatMessageRequest.model_validate({
            "deviceId": "device-1",
            "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd",
            "sessionId": "tab_session-1",
            "text": "hello",
            "ownerId": "attacker-selected-owner",
        })


@pytest.mark.parametrize(
    "payload",
    [
        {"deviceId": "", "messageId": "bad", "sessionId": "session-1", "text": "hello"},
        {"deviceId": "device-1", "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd", "sessionId": "invalid session", "text": "hello"},
        {"deviceId": "device-1", "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd", "sessionId": "session-1", "text": "x" * 4_001},
        {"deviceId": "device-1", "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd", "sessionId": "session-1", "text": " "},
    ],
)
def test_phone_message_request_rejects_malformed_ids_and_text(payload):
    schemas = _phone_chat_schemas()

    with pytest.raises(ValidationError):
        schemas.PhoneChatMessageRequest.model_validate(payload)


def test_worker_job_requires_lease_scope_and_timezone_aware_expiry():
    schemas = _phone_chat_schemas()
    job = schemas.PhoneChatWorkerJob.model_validate({
        "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd",
        "ownerId": "owner-1",
        "deviceId": "device-1",
        "sessionId": "session-1",
        "text": "status?",
        "expiresAt": "2026-09-27T00:00:00Z",
        "attempt": 1,
        "leaseId": "lease-1",
        "leaseExpiresAt": "2026-09-26T12:01:00Z",
    })

    assert job.attempt == 1
    assert str(job.message_id) == "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd"

    with pytest.raises(ValidationError):
        schemas.PhoneChatWorkerJob.model_validate({
            "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd",
            "ownerId": "owner-1",
            "deviceId": "device-1",
            "sessionId": "session-1",
            "text": "status?",
            "expiresAt": "2026-09-27T00:00:00",
            "attempt": 4,
            "leaseId": "lease-1",
            "leaseExpiresAt": "2026-09-26T12:01:00Z",
        })


def test_worker_job_rejects_blank_text():
    schemas = _phone_chat_schemas()

    with pytest.raises(ValidationError):
        schemas.PhoneChatWorkerJob.model_validate({
            "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd",
            "ownerId": "owner-1",
            "deviceId": "device-1",
            "sessionId": "session-1",
            "text": "   ",
            "expiresAt": "2026-09-27T00:00:00Z",
            "attempt": 1,
            "leaseId": "lease-1",
            "leaseExpiresAt": "2026-09-26T12:01:00Z",
        })


def test_worker_result_is_terminal_and_rejects_unknown_fields():
    schemas = _phone_chat_schemas()
    result = schemas.PhoneChatWorkerResult.model_validate({
        "status": "completed",
        "reply": "Here is the verified status.",
    })

    assert result.status == "completed"
    assert result.reply == "Here is the verified status."

    with pytest.raises(ValidationError):
        schemas.PhoneChatWorkerResult.model_validate({
            "status": "running",
            "ownerId": "caller-selected-owner",
            "reply": "not a terminal result",
        })

    failed = schemas.PhoneChatWorkerResult.model_validate({
        "status": "failed",
        "errorCode": "assistant_unavailable",
    })
    assert failed.error_code == "assistant_unavailable"

    with pytest.raises(ValidationError):
        schemas.PhoneChatWorkerResult.model_validate({
            "status": "failed",
            "reply": "error detail",
        })


def test_phone_message_state_rejects_unknown_lifecycle_state():
    schemas = _phone_chat_schemas()
    response = schemas.PhoneChatMessageStatus.model_validate({
        "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd",
        "status": "processing",
        "expiresAt": "2026-09-27T00:00:00Z",
    })

    assert response.status == "processing"
    with pytest.raises(ValidationError):
        schemas.PhoneChatMessageStatus.model_validate({
            "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd",
            "status": "working",
            "expiresAt": "2026-09-27T00:00:00Z",
        })

    with pytest.raises(ValidationError):
        schemas.PhoneChatMessageStatus.model_validate({
            "messageId": "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd",
            "status": "completed",
            "expiresAt": "2026-09-27T00:00:00Z",
        })
