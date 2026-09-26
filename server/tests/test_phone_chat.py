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


def test_phone_chat_queue_scopes_devices_and_idempotent_enqueue():
    from datetime import datetime, timezone
    import importlib.util

    if importlib.util.find_spec("services.phone_chat_queue") is None:
        pytest.fail("phone chat queue service has not been implemented")
    from services.phone_chat_queue import PhoneChatQueue
    from services.phone_chat_repository import InMemoryPhoneChatRepository

    async def scenario():
        repo = InMemoryPhoneChatRepository()
        queue = PhoneChatQueue(repo, owner_id="owner-1", worker_token="worker-secret")
        device = await queue.register_device("owner-1")
        now = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        message_id = "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd"
        first = await queue.enqueue("owner-1", device.id, message_id, "session-1", "hello", now=now)
        replay = await queue.enqueue("owner-1", device.id, message_id, "session-1", "hello", now=now)

        assert first.message_id == replay.message_id
        assert replay.status == "queued"
        with pytest.raises(ValueError, match="different payload"):
            await queue.enqueue("owner-1", device.id, message_id, "session-1", "changed", now=now)
        with pytest.raises(PermissionError):
            await queue.enqueue("another-owner", device.id, "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fe", "s", "hello", now=now)

        assert await queue.revoke_device("owner-1", device.id, now=now)
        with pytest.raises(PermissionError, match="revoked"):
            await queue.enqueue("owner-1", device.id, "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fe", "s", "hello", now=now)

    import asyncio
    asyncio.run(scenario())


def test_phone_chat_queue_claim_lease_retry_and_acknowledgement():
    from datetime import datetime, timedelta, timezone
    import asyncio
    import importlib.util

    if importlib.util.find_spec("services.phone_chat_queue") is None:
        pytest.fail("phone chat queue service has not been implemented")
    from schemas.phone_chat import PhoneChatWorkerResult
    from services.phone_chat_queue import PhoneChatQueue
    from services.phone_chat_repository import InMemoryPhoneChatRepository

    async def scenario():
        repo = InMemoryPhoneChatRepository()
        queue = PhoneChatQueue(repo, owner_id="owner-1", worker_token="worker-secret")
        device = await queue.register_device("owner-1")
        now = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        message_id = "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd"
        await queue.enqueue("owner-1", device.id, message_id, "session-1", "hello", now=now)

        job = await queue.claim("worker-secret", now=now)
        assert job.attempt == 1
        assert await queue.claim("worker-secret", now=now) is None
        assert await queue.start("worker-secret", job.message_id, job.lease_id, now=now)
        assert await queue.renew("worker-secret", job.message_id, job.lease_id, now=now + timedelta(seconds=30))
        with pytest.raises(PermissionError):
            await queue.start("wrong-token", job.message_id, job.lease_id, now=now)
        completed = await queue.complete(
            "worker-secret", job.message_id, job.lease_id,
            PhoneChatWorkerResult(status="completed", reply="answer"), now=now + timedelta(seconds=40),
        )
        assert completed.reply == "answer"
        assert (await queue.get_for_device("owner-1", device.id, message_id)).reply == "answer"
        tombstone = await queue.acknowledge("owner-1", device.id, message_id, now=now + timedelta(seconds=40))
        assert tombstone.status == "completed"
        assert await queue.get_for_device("owner-1", device.id, message_id) == tombstone
        assert await repo.get_job(message_id) is None
        with pytest.raises(PermissionError):
            await queue.get_for_device("owner-1", "other-device", message_id)

        retry_id = "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fe"
        await queue.enqueue("owner-1", device.id, retry_id, "session-1", "retry", now=now)
        retry_job = await queue.claim("worker-secret", now=now)
        assert retry_job.attempt == 1
        for expected_attempt in (2, 3):
            retry_job = await queue.claim("worker-secret", now=retry_job.lease_expires_at + timedelta(seconds=1))
            assert retry_job.attempt == expected_attempt
        assert await queue.claim("worker-secret", now=retry_job.lease_expires_at + timedelta(seconds=1)) is None
        assert (await repo.get_job(retry_id)).status == "failed"

    asyncio.run(scenario())


def test_expiry_and_device_revocation_discard_unfinished_prompts_and_retain_only_tombstones():
    from datetime import datetime, timedelta, timezone
    import asyncio
    from services.phone_chat_queue import PhoneChatQueue
    from services.phone_chat_repository import InMemoryPhoneChatRepository

    async def scenario():
        repo = InMemoryPhoneChatRepository()
        queue = PhoneChatQueue(repo, owner_id="owner-1", worker_token="worker-secret")
        device = await queue.register_device("owner-1")
        now = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        expired_id = "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd"
        await queue.enqueue("owner-1", device.id, expired_id, "session-1", "private prompt", now=now)
        assert await queue.claim("worker-secret", now=now + timedelta(hours=25)) is None
        expired = await repo.get_job(expired_id)
        assert expired.status == "expired"
        assert expired.text == ""
        await repo.cleanup(now + timedelta(hours=50))
        assert await repo.get_job(expired_id) is None
        assert (await repo.get_tombstone(expired_id)).status == "expired"
        await repo.cleanup(now + timedelta(hours=75))
        assert await repo.get_tombstone(expired_id) is None

        revoked_id = "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fe"
        await queue.enqueue("owner-1", device.id, revoked_id, "session-1", "another private prompt", now=now)
        claimed = await queue.claim("worker-secret", now=now)
        assert claimed.message_id == revoked_id
        assert await queue.start("worker-secret", revoked_id, claimed.lease_id, now=now)
        assert await queue.revoke_device("owner-1", device.id, now=now)
        discarded = await repo.get_job(revoked_id)
        assert discarded.status == "failed"
        assert discarded.error_code == "device_revoked"
        assert discarded.text == ""
        with pytest.raises(PermissionError):
            await queue.complete(
                "worker-secret", revoked_id, claimed.lease_id,
                _phone_chat_schemas().PhoneChatWorkerResult(status="completed", reply="late reply"), now=now,
            )

    asyncio.run(scenario())


def test_expired_claim_is_discarded_before_start_or_late_completion():
    from datetime import datetime, timedelta, timezone
    import asyncio
    from schemas.phone_chat import PhoneChatWorkerResult
    from services.phone_chat_queue import PhoneChatQueue
    from services.phone_chat_repository import InMemoryPhoneChatRepository

    async def scenario():
        repo = InMemoryPhoneChatRepository()
        queue = PhoneChatQueue(repo, owner_id="owner-1", worker_token="worker-secret")
        device = await queue.register_device("owner-1")
        now = datetime(2026, 9, 26, 12, tzinfo=timezone.utc)
        message_id = "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd"
        await queue.enqueue("owner-1", device.id, message_id, "session-1", "private", now=now)
        job = await queue.claim("worker-secret", now=now)

        assert not await queue.start("worker-secret", message_id, job.lease_id, now=now + timedelta(hours=25))
        expired = await repo.get_job(message_id)
        assert expired.status == "expired"
        assert expired.text == ""
        with pytest.raises(PermissionError, match="lease"):
            await queue.complete(
                "worker-secret", message_id, job.lease_id,
                PhoneChatWorkerResult(status="completed", reply="late"), now=now + timedelta(hours=25),
            )

    asyncio.run(scenario())


def test_postgres_phone_chat_repository_maps_snake_case_fields_for_prisma():
    from unittest.mock import AsyncMock, MagicMock
    from services.phone_chat_repository import PostgresPhoneChatRepository
    import asyncio

    mock_db = MagicMock()
    mock_db.phonechatjob.update_many = AsyncMock(return_value=1)
    repo = PostgresPhoneChatRepository(mock_db)

    async def scenario():
        res = await repo.update_job("msg-1", {"status": "claimed", "lease_id": "l-1"}, {"status": "completed", "lease_id": None, "completed_at": "t"})
        assert res is True
        mock_db.phonechatjob.update_many.assert_called_once_with(
            where={"messageId": "msg-1", "status": "claimed", "leaseId": "l-1"},
            data={"status": "completed", "leaseId": None, "completedAt": "t"}
        )

    asyncio.run(scenario())

