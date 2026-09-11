import pytest

from schemas.aira_operations import AIRAOperationExecuteRequest, AIRAOperationPreviewRequest


class MemoryAuditStore:
    def __init__(self):
        self.records = {}

    async def reserve(self, actor_id, character_id, operation, request_id, metadata):
        existing = self.records.get((actor_id, request_id))
        if existing:
            return False, existing
        record = {"actorId": actor_id, "characterId": character_id, "operation": operation, "requestId": request_id, "status": "PENDING", "metadata": metadata, "result": {}}
        self.records[(actor_id, request_id)] = record
        return True, record

    async def find(self, actor_id, request_id):
        return self.records.get((actor_id, request_id))

    async def complete(self, actor_id, request_id, result):
        self.records[(actor_id, request_id)].update({"status": "COMPLETED", "result": result})
        return self.records[(actor_id, request_id)]

    async def fail(self, actor_id, request_id, error):
        self.records[(actor_id, request_id)].update({"status": "FAILED", "result": {"error": error}})


@pytest.mark.asyncio
async def test_confirmed_execution_is_idempotent_by_actor_and_request_id(monkeypatch):
    from services import aira_execution_registry, aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)
    preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="character-1", requestId="request-1", operation="create_habit", arguments={"name": "Read"}
        ),
        {"id": "user-1"},
        secret="test-secret",
    )
    request = AIRAOperationExecuteRequest(
        characterId="character-1", requestId="request-1", operation="create_habit", confirmationToken=preview["confirmationToken"]
    )
    calls = []

    async def execute(operation, character_id, arguments):
        calls.append((operation, character_id, arguments))
        return {"habitId": "habit-1"}

    audit = MemoryAuditStore()
    first = await aira_execution_registry.execute_confirmed_aira_operation(
        request, {"id": "user-1"}, execute, audit, secret="test-secret"
    )
    second = await aira_execution_registry.execute_confirmed_aira_operation(
        request, {"id": "user-1"}, execute, audit, secret="test-secret"
    )

    assert len(calls) == 1
    assert calls[0][0:2] == ("create_habit", "character-1")
    assert calls[0][2]["name"] == "Read"
    assert calls[0][2]["scheduleType"] == "DAILY"
    assert first["idempotentReplay"] is False
    assert second["idempotentReplay"] is True
    assert second["result"] == {"habitId": "habit-1"}


@pytest.mark.asyncio
async def test_confirmed_execution_reserves_before_calling_the_domain_handler(monkeypatch):
    from services import aira_execution_registry, aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)
    preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(characterId="character-1", requestId="request-2", operation="create_habit", arguments={"name": "Read"}),
        {"id": "user-1"}, secret="test-secret"
    )
    events = []

    class OrderedAuditStore(MemoryAuditStore):
        async def reserve(self, *args):
            events.append("reserve")
            return await super().reserve(*args)

    async def execute(*_args):
        events.append("execute")
        return {"habitId": "habit-2"}

    await aira_execution_registry.execute_confirmed_aira_operation(
        AIRAOperationExecuteRequest(characterId="character-1", requestId="request-2", operation="create_habit", confirmationToken=preview["confirmationToken"]),
        {"id": "user-1"}, execute, OrderedAuditStore(), secret="test-secret"
    )

    assert events == ["reserve", "execute"]
