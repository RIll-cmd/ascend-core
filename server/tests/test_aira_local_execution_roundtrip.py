import pytest

from schemas.aira_operations import AIRAOperationExecuteRequest, AIRAOperationPreviewRequest
from services.aira_audit_store import LocalSQLiteAuditStore
from services.aira_execution_registry import execute_confirmed_aira_operation
from services.aira_preview_registry import create_aira_preview


@pytest.mark.asyncio
async def test_local_preview_confirmation_and_replay_execute_once(monkeypatch, tmp_path):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)
    preview = await create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="character-1", requestId="local-roundtrip-1", operation="create_habit", arguments={"name": "Read"}
        ),
        {"id": "user-1"},
        secret="test-secret",
    )
    request = AIRAOperationExecuteRequest(
        characterId="character-1",
        requestId="local-roundtrip-1",
        operation="create_habit",
        confirmationToken=preview["confirmationToken"],
    )
    calls = []

    async def execute(operation, character_id, arguments):
        calls.append((operation, character_id, arguments["name"]))
        return {"habitId": "habit-local-1"}

    store = LocalSQLiteAuditStore(tmp_path / "audit.sqlite3")
    first = await execute_confirmed_aira_operation(request, {"id": "user-1"}, execute, store, secret="test-secret")
    replay = await execute_confirmed_aira_operation(request, {"id": "user-1"}, execute, store, secret="test-secret")

    assert calls == [("create_habit", "character-1", "Read")]
    assert first["idempotentReplay"] is False
    assert replay["idempotentReplay"] is True
    assert replay["result"] == {"habitId": "habit-local-1"}


@pytest.mark.asyncio
async def test_local_automation_update_and_delete_roundtrip(monkeypatch, tmp_path):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)

    # 1. Update automation roundtrip
    update_preview = await create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="character-1",
            requestId="local-auto-update-1",
            operation="update_automation",
            arguments={"ruleId": "rule-42", "enabled": True},
        ),
        {"id": "user-1"},
        secret="test-secret",
    )
    update_request = AIRAOperationExecuteRequest(
        characterId="character-1",
        requestId="local-auto-update-1",
        operation="update_automation",
        confirmationToken=update_preview["confirmationToken"],
    )
    executed_ops = []

    async def execute_handler(operation, character_id, arguments):
        executed_ops.append((operation, character_id, dict(arguments)))
        if operation == "update_automation":
            return {"automationId": arguments["ruleId"], "enabled": arguments["enabled"]}
        if operation == "delete_automation":
            return {"automationId": arguments["ruleId"], "deleted": True}

    store = LocalSQLiteAuditStore(tmp_path / "audit_auto.sqlite3")
    res1 = await execute_confirmed_aira_operation(update_request, {"id": "user-1"}, execute_handler, store, secret="test-secret")
    res1_replay = await execute_confirmed_aira_operation(update_request, {"id": "user-1"}, execute_handler, store, secret="test-secret")

    assert res1["idempotentReplay"] is False
    assert res1["result"] == {"automationId": "rule-42", "enabled": True}
    assert res1_replay["idempotentReplay"] is True
    assert res1_replay["result"] == {"automationId": "rule-42", "enabled": True}

    # 2. Delete automation roundtrip
    delete_preview = await create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="character-1",
            requestId="local-auto-delete-1",
            operation="delete_automation",
            arguments={"ruleId": "rule-42"},
        ),
        {"id": "user-1"},
        secret="test-secret",
    )
    delete_request = AIRAOperationExecuteRequest(
        characterId="character-1",
        requestId="local-auto-delete-1",
        operation="delete_automation",
        confirmationToken=delete_preview["confirmationToken"],
    )
    del_res = await execute_confirmed_aira_operation(delete_request, {"id": "user-1"}, execute_handler, store, secret="test-secret")
    del_replay = await execute_confirmed_aira_operation(delete_request, {"id": "user-1"}, execute_handler, store, secret="test-secret")

    assert del_res["idempotentReplay"] is False
    assert del_res["result"] == {"automationId": "rule-42", "deleted": True}
    assert del_replay["idempotentReplay"] is True

    # Check total actual execution calls: exactly one update and one delete
    assert len(executed_ops) == 2
    assert executed_ops[0][0] == "update_automation"
    assert executed_ops[1][0] == "delete_automation"


@pytest.mark.asyncio
async def test_local_calendar_schedule_roundtrip(monkeypatch, tmp_path):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)

    preview = await create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="character-1",
            requestId="local-cal-1",
            operation="create_calendar_schedule",
            arguments={"title": "Class", "time": "09:00", "scheduleType": "WEEKLY", "dayOfWeek": 1},
        ),
        {"id": "user-1"},
        secret="test-secret",
    )
    request = AIRAOperationExecuteRequest(
        characterId="character-1",
        requestId="local-cal-1",
        operation="create_calendar_schedule",
        confirmationToken=preview["confirmationToken"],
    )

    calls = []

    async def execute_handler(op, char_id, args):
        calls.append((op, char_id, dict(args)))
        return {"scheduleId": "sched-roundtrip-1", "title": args["title"]}

    store = LocalSQLiteAuditStore(tmp_path / "audit_cal.sqlite3")
    first = await execute_confirmed_aira_operation(request, {"id": "user-1"}, execute_handler, store, secret="test-secret")
    replay = await execute_confirmed_aira_operation(request, {"id": "user-1"}, execute_handler, store, secret="test-secret")

    assert calls == [("create_calendar_schedule", "character-1", {"title": "Class", "time": "09:00", "scheduleType": "WEEKLY", "dayOfWeek": 1})]
    assert first["idempotentReplay"] is False
    assert first["result"] == {"scheduleId": "sched-roundtrip-1", "title": "Class"}
    assert replay["idempotentReplay"] is True
    assert replay["result"] == {"scheduleId": "sched-roundtrip-1", "title": "Class"}


