from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException

from schemas.aira_operations import AIRAOperationExecuteRequest, AIRAOperationPreviewRequest


def preview_request():
    return AIRAOperationPreviewRequest(
        characterId="character-1",
        requestId="request-1",
        operation="create_habit",
        arguments={"name": "Read", "category": "Mind"},
    )


@pytest.mark.asyncio
async def test_preview_binds_normalized_arguments_to_the_authenticated_actor(monkeypatch):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)
    preview = await aira_preview_registry.create_aira_preview(
        preview_request(), {"id": "user-1"}, secret="test-secret"
    )

    assert preview["operation"] == "create_habit"
    assert preview["normalizedArguments"]["name"] == "Read"
    assert preview["normalizedArguments"]["category"] == "Mind"
    assert preview["normalizedArguments"]["difficulty"] == "EASY"
    assert preview["normalizedArguments"]["scheduleType"] == "DAILY"
    assert preview["confirmationToken"]


@pytest.mark.asyncio
async def test_execute_rejects_a_token_bound_to_a_different_actor(monkeypatch):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)
    preview = await aira_preview_registry.create_aira_preview(
        preview_request(), {"id": "user-1"}, secret="test-secret"
    )

    with pytest.raises(HTTPException) as error:
        await aira_preview_registry.validate_aira_execution(
            AIRAOperationExecuteRequest(
                characterId="character-1",
                requestId="request-1",
                operation="create_habit",
                confirmationToken=preview["confirmationToken"],
            ),
            {"id": "user-2"},
            secret="test-secret",
        )

    assert error.value.status_code == 403


@pytest.mark.asyncio
async def test_execute_rejects_a_token_for_a_different_operation(monkeypatch):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)
    preview = await aira_preview_registry.create_aira_preview(
        preview_request(), {"id": "user-1"}, secret="test-secret"
    )

    with pytest.raises(HTTPException) as error:
        await aira_preview_registry.validate_aira_execution(
            AIRAOperationExecuteRequest(
                characterId="character-1",
                requestId="request-1",
                operation="create_mission",
                confirmationToken=preview["confirmationToken"],
            ),
            {"id": "user-1"},
            secret="test-secret",
        )

    assert error.value.status_code == 400


@pytest.mark.asyncio
async def test_preview_rejects_a_mission_completion_without_a_mission_id(monkeypatch):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)

    with pytest.raises(HTTPException, match="missionId"):
        await aira_preview_registry.create_aira_preview(
            AIRAOperationPreviewRequest(
                characterId="character-1", requestId="request-1", operation="complete_mission", arguments={}
            ),
            {"id": "user-1"},
            secret="test-secret",
        )


@pytest.mark.asyncio
async def test_preview_normalizes_update_and_delete_automation(monkeypatch):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)

    update_preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="character-1",
            requestId="request-update-auto",
            operation="update_automation",
            arguments={"ruleId": "rule-100", "name": "Posture Guard", "enabled": False},
        ),
        {"id": "user-1"},
        secret="test-secret",
    )
    assert update_preview["normalizedArguments"] == {
        "ruleId": "rule-100",
        "name": "Posture Guard",
        "enabled": False,
    }
    assert update_preview["confirmationToken"]

    delete_preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="character-1",
            requestId="request-delete-auto",
            operation="delete_automation",
            arguments={"ruleId": "rule-100"},
        ),
        {"id": "user-1"},
        secret="test-secret",
    )
    assert delete_preview["normalizedArguments"] == {"ruleId": "rule-100"}
    assert delete_preview["confirmationToken"]


@pytest.mark.asyncio
async def test_preview_rejects_invalid_automation_update_and_delete(monkeypatch):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)

    # Missing ruleId for update
    with pytest.raises(HTTPException, match="ruleId"):
        await aira_preview_registry.create_aira_preview(
            AIRAOperationPreviewRequest(
                characterId="character-1",
                requestId="req-bad-1",
                operation="update_automation",
                arguments={"name": "New Name"},
            ),
            {"id": "user-1"},
            secret="test-secret",
        )

    # Missing update fields
    with pytest.raises(HTTPException, match="At least one update field"):
        await aira_preview_registry.create_aira_preview(
            AIRAOperationPreviewRequest(
                characterId="character-1",
                requestId="req-bad-2",
                operation="update_automation",
                arguments={"ruleId": "rule-1"},
            ),
            {"id": "user-1"},
            secret="test-secret",
        )

    # Missing ruleId for delete
    with pytest.raises(HTTPException, match="ruleId"):
        await aira_preview_registry.create_aira_preview(
            AIRAOperationPreviewRequest(
                characterId="character-1",
                requestId="req-bad-3",
                operation="delete_automation",
                arguments={},
            ),
            {"id": "user-1"},
            secret="test-secret",
        )


@pytest.mark.asyncio
async def test_preview_rejects_create_mission_with_habit_informational_guidance(monkeypatch):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)

    with pytest.raises(HTTPException) as err:
        await aira_preview_registry.create_aira_preview(
            AIRAOperationPreviewRequest(
                characterId="character-1",
                requestId="req-mission-create",
                operation="create_mission",
                arguments={"title": "Run 5 miles"},
            ),
            {"id": "user-1"},
            secret="test-secret",
        )
    assert err.value.status_code == 422
    assert "Direct mission creation is not supported" in err.value.detail
    assert "create a supporting habit instead" in err.value.detail


@pytest.mark.asyncio
async def test_preview_normalizes_calendar_schedules(monkeypatch):
    from services import aira_preview_registry

    async def owns(*_args):
        return True

    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", owns)

    # 1. Weekly schedule preview
    weekly_preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="character-1",
            requestId="req-cal-weekly",
            operation="create_calendar_schedule",
            arguments={"title": "Class", "time": "09:00", "scheduleType": "WEEKLY", "dayOfWeek": 1},
        ),
        {"id": "user-1"},
        secret="test-secret",
    )
    assert weekly_preview["normalizedArguments"]["title"] == "Class"
    assert weekly_preview["normalizedArguments"]["dayOfWeek"] == 1
    assert weekly_preview["confirmationToken"]

    # 2. One-time schedule preview
    once_preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="character-1",
            requestId="req-cal-once",
            operation="create_calendar_schedule",
            arguments={"title": "Exam", "time": "14:00", "scheduleType": "ONCE", "scheduledAt": "2026-09-12T14:00:00"},
        ),
        {"id": "user-1"},
        secret="test-secret",
    )
    assert once_preview["normalizedArguments"]["scheduledAt"] == "2026-09-12T14:00:00"

    # 3. Delete schedule preview
    del_preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="character-1",
            requestId="req-cal-del",
            operation="delete_calendar_schedule",
            arguments={"scheduleId": "sched-123"},
        ),
        {"id": "user-1"},
        secret="test-secret",
    )
    assert del_preview["normalizedArguments"] == {"scheduleId": "sched-123"}


