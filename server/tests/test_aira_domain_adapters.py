from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest


@pytest.mark.asyncio
async def test_create_habit_adapter_delegates_to_the_existing_habit_handler(monkeypatch):
    from services import aira_domain_adapters

    created = SimpleNamespace(id="habit-1", name="Read")
    create = AsyncMock(return_value=created)
    monkeypatch.setattr(aira_domain_adapters, "create_habit", create)

    result = await aira_domain_adapters.execute_aira_domain_operation(
        "create_habit",
        "character-1",
        {"name": "Read", "category": "Mind", "difficulty": "EASY", "primaryStat": "knowledge"},
        {"id": "user-1"},
    )

    assert result["habitId"] == "habit-1"
    assert result["name"] == "Read"
    assert "Protocol locked" in result["canonicalNarration"]
    assert create.await_args.args[0] == "character-1"
    assert create.await_args.args[1].name == "Read"
    assert create.await_args.args[2] == {"id": "user-1"}


@pytest.mark.asyncio
async def test_complete_mission_adapter_rejects_a_mission_outside_the_character(monkeypatch):
    from services import aira_domain_adapters

    async def mission_lookup(_mission_id):
        return SimpleNamespace(characterId="another-character")

    monkeypatch.setattr(aira_domain_adapters, "get_mission_for_adapter", mission_lookup)

    with pytest.raises(Exception, match="does not belong"):
        await aira_domain_adapters.execute_aira_domain_operation(
            "complete_mission",
            "character-1",
            {"missionId": "mission-1", "completionType": "NORMAL"},
            {"id": "user-1"},
        )


@pytest.mark.asyncio
async def test_create_automation_adapter_delegates_to_existing_handler(monkeypatch):
    from services import aira_domain_adapters

    create = AsyncMock(return_value={"id": "rule-1", "name": "Phone guard"})
    monkeypatch.setattr(aira_domain_adapters, "create_automation", create)

    result = await aira_domain_adapters.execute_aira_domain_operation(
        "create_automation", "character-1",
        {"name": "Phone guard", "triggerType": "phone_usage_observed", "actions": [{"type": "log_bad_habit", "habitId": "habit-1"}]},
        {"id": "user-1"},
    )

    assert result == {"automationId": "rule-1", "name": "Phone guard"}
    assert create.await_args.args[1] == {"id": "user-1"}


@pytest.mark.asyncio
async def test_workout_and_equip_adapters_delegate_to_existing_handlers(monkeypatch):
    from services import aira_domain_adapters

    workout = AsyncMock(return_value={"message": "logged"})
    equip = AsyncMock(return_value=SimpleNamespace(message="equipped"))
    monkeypatch.setattr(aira_domain_adapters, "log_workout", workout)
    monkeypatch.setattr(aira_domain_adapters, "equip_item", equip)

    workout_result = await aira_domain_adapters.execute_aira_domain_operation(
        "log_workout", "character-1", {"durationSeconds": 1800, "sets": [{"exerciseId": "exercise-1", "weight": 50, "reps": 8}]}, {"id": "user-1"}
    )
    equip_result = await aira_domain_adapters.execute_aira_domain_operation(
        "equip_item", "character-1", {"playerItemId": "item-1"}, {"id": "user-1"}
    )

    assert workout_result == {"message": "logged"}
    assert workout.await_args.args[2] == {"id": "user-1"}
    assert equip_result == {"message": "equipped"}


@pytest.mark.asyncio
async def test_update_and_delete_automation_adapters(monkeypatch):
    from services import aira_domain_adapters

    async def get_rule(rule_id):
        return SimpleNamespace(id=rule_id, characterId="character-1")

    update = AsyncMock(return_value={"id": "rule-1", "name": "Phone guard updated", "enabled": False})
    delete = AsyncMock(return_value=None)
    monkeypatch.setattr(aira_domain_adapters, "get_automation_for_adapter", get_rule)
    monkeypatch.setattr(aira_domain_adapters, "update_automation", update)
    monkeypatch.setattr(aira_domain_adapters, "delete_automation", delete)

    update_res = await aira_domain_adapters.execute_aira_domain_operation(
        "update_automation", "character-1", {"ruleId": "rule-1", "name": "Phone guard updated", "enabled": False}, {"id": "user-1"}
    )
    delete_res = await aira_domain_adapters.execute_aira_domain_operation(
        "delete_automation", "character-1", {"ruleId": "rule-1"}, {"id": "user-1"}
    )

    assert update_res == {"automationId": "rule-1", "name": "Phone guard updated", "enabled": False}
    assert delete_res == {"automationId": "rule-1", "deleted": True}
    assert update.await_args.args[0] == "rule-1"
    assert update.await_args.args[2] == {"id": "user-1"}
    assert delete.await_args.args[0] == "rule-1"
    assert delete.await_args.args[1] == {"id": "user-1"}


@pytest.mark.asyncio
async def test_update_and_delete_automation_reject_other_character_rules(monkeypatch):
    from services import aira_domain_adapters

    async def get_rule(_rule_id):
        return SimpleNamespace(id="rule-1", characterId="other-character")

    monkeypatch.setattr(aira_domain_adapters, "get_automation_for_adapter", get_rule)

    with pytest.raises(Exception, match="does not belong"):
        await aira_domain_adapters.execute_aira_domain_operation(
            "update_automation", "character-1", {"ruleId": "rule-1", "name": "Hack"}, {"id": "user-1"}
        )

    with pytest.raises(Exception, match="does not belong"):
        await aira_domain_adapters.execute_aira_domain_operation(
            "delete_automation", "character-1", {"ruleId": "rule-1"}, {"id": "user-1"}
        )


@pytest.mark.asyncio
async def test_create_and_delete_calendar_schedule_adapters(monkeypatch):
    from services import aira_domain_adapters

    created_sched = {
        "id": "sched-10",
        "characterId": "character-1",
        "title": "Study Group",
        "time": "10:00",
        "scheduleType": "WEEKLY",
        "dayOfWeek": 2,
    }

    class MockStore:
        def create_schedule(self, data):
            return {**created_sched, **data, "id": "sched-10"}

        def get_schedule(self, sched_id):
            if sched_id == "sched-10":
                return created_sched
            return None

        def delete_schedule(self, sched_id):
            return True

    monkeypatch.setattr(
        "services.calendar_schedule_store.get_calendar_schedule_store",
        lambda: MockStore(),
    )

    create_res = await aira_domain_adapters.execute_aira_domain_operation(
        "create_calendar_schedule",
        "character-1",
        {"title": "Study Group", "time": "10:00", "scheduleType": "WEEKLY", "dayOfWeek": 2},
        {"id": "user-1"},
    )
    assert create_res == {
        "scheduleId": "sched-10",
        "title": "Study Group",
        "time": "10:00",
        "endTime": None,
        "scheduleType": "WEEKLY",
    }

    delete_res = await aira_domain_adapters.execute_aira_domain_operation(
        "delete_calendar_schedule",
        "character-1",
        {"scheduleId": "sched-10"},
        {"id": "user-1"},
    )
    assert delete_res == {"scheduleId": "sched-10", "deleted": True}


@pytest.mark.asyncio
async def test_create_calendar_schedule_multi_adapter(monkeypatch):
    from services import aira_domain_adapters

    created_items = []

    class MockStore:
        def create_schedule(self, data):
            sched = {
                "id": f"sched-{len(created_items) + 1}",
                **data,
            }
            created_items.append(sched)
            return sched

    monkeypatch.setattr(
        "services.calendar_schedule_store.get_calendar_schedule_store",
        lambda: MockStore(),
    )

    multi_args = {
        "schedules": [
            {"title": "Math Class", "time": "09:00", "day_of_week": 1, "schedule_type": "WEEKLY"},
            {"title": "Math Class", "time": "09:00", "day_of_week": 4, "schedule_type": "WEEKLY"},
        ],
        "title": "Math Class",
        "time": "09:00",
        "days": ["Monday", "Thursday"],
    }

    res = await aira_domain_adapters.execute_aira_domain_operation(
        "create_calendar_schedule_multi",
        "character-1",
        multi_args,
        {"id": "user-1"},
    )

    assert res["count"] == 2
    assert len(res["created"]) == 2
    assert res["created"][0]["dayOfWeek"] == 1
    assert res["created"][1]["dayOfWeek"] == 4
    assert res["created"][0]["title"] == "Math Class"
    assert res["created"][1]["title"] == "Math Class"


@pytest.mark.asyncio
async def test_trigger_negative_habit_adapter_applies_penalty_and_returns_narration(monkeypatch):
    from services import aira_domain_adapters

    async def mock_trigger(habit_id, char_id):
        return {
            "success": True,
            "habit": SimpleNamespace(id=habit_id, name="Doomscrolling", relapseCount=3),
            "penalty": {"amount": 10, "target": "HP", "previousValue": 100, "newValue": 90},
        }

    monkeypatch.setattr("services.habit_trigger_service.trigger_negative_habit", mock_trigger)

    res = await aira_domain_adapters.execute_aira_domain_operation(
        "trigger_negative_habit",
        "character-1",
        {"habitId": "hab-bad-1"},
        {"id": "user-1"},
    )

    assert res["habitId"] == "hab-bad-1"
    assert res["name"] == "Doomscrolling"
    assert res["relapseCount"] == 3
    assert res["penalty"]["amount"] == 10
    assert "Protocol breached" in res["canonicalNarration"]
    assert "-10 HP deducted" in res["canonicalNarration"]
