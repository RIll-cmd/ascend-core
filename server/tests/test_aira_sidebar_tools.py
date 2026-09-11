from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime, timezone
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers import aira
from services import aira_tools


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(aira.router)
    return TestClient(app)


# ==========================================
# PHASE A: READ TOOLS UNIT TESTS
# ==========================================

def test_phase_a_read_tools_exist():
    """Ensure all read tools for the 18+ sidebar routes exist and are callable."""
    tools = [
        aira_tools.get_character_stats,
        aira_tools.get_dashboard_summary,
        aira_tools.get_today_missions,
        aira_tools.get_habits_overview,
        aira_tools.get_calendar_history,
        aira_tools.get_workout_history,
        aira_tools.get_muscle_recovery,
        aira_tools.get_skills_tree,
        aira_tools.get_tower_status,
        aira_tools.get_active_bosses,
        aira_tools.get_weekly_boss_pr,
        aira_tools.get_inventory_items,
        aira_tools.get_shop_inventory,
        aira_tools.get_beasts_and_eggs,
        aira_tools.get_achievements_list,
        aira_tools.get_automations_list,
        aira_tools.analyze_tower_readiness,
        aira_tools.compare_equipment,
        aira_tools.recommend_workout_plan,
    ]
    for tool in tools:
        assert callable(tool), f"Tool {tool.__name__} should be callable"
        assert tool in aira_tools.AIRA_TOOLS, f"Tool {tool.__name__} should be registered in AIRA_TOOLS"


@pytest.mark.asyncio
async def test_dashboard_summary_with_mock_db(monkeypatch):
    mock_char = MagicMock()
    mock_char.name = "SoloHunter"
    mock_char.level = 10
    mock_char.power = 450
    mock_char.rank = "C"
    mock_char.dailySteps = 7500
    mock_char.dailyStepGoal = 10000

    fake_db = SimpleNamespace(
        mission=SimpleNamespace(
            find_many=AsyncMock(return_value=[MagicMock(status="COMPLETED"), MagicMock(status="PENDING")])
        ),
        habit=SimpleNamespace(count=AsyncMock(return_value=4)),
        dailycompletionsnapshot=SimpleNamespace(
            find_first=AsyncMock(return_value=MagicMock(completionRate=85.0))
        ),
    )

    monkeypatch.setattr(aira_tools, "ensure_db_connected", AsyncMock())
    monkeypatch.setattr(aira_tools, "ensure_character_exists", AsyncMock(return_value=mock_char))
    monkeypatch.setattr(aira_tools, "db", fake_db)

    summary = await aira_tools._async_get_dashboard_summary("char-test")
    assert summary["character_name"] == "SoloHunter"
    assert summary["level"] == 10
    assert summary["missions_today"]["total"] == 2
    assert summary["missions_today"]["completed"] == 1
    assert summary["active_habits_count"] == 4


@pytest.mark.asyncio
async def test_muscle_recovery_computation(monkeypatch):
    now = datetime.now(timezone.utc)
    mock_recovery = MagicMock(
        muscleGroup="CHEST",
        initialFatigue=80.0,
        lastTrainedAt=now,
        fullRecoveryHours=48.0,
    )

    fake_db = SimpleNamespace(
        musclerecoverystate=SimpleNamespace(find_many=AsyncMock(return_value=[mock_recovery]))
    )

    monkeypatch.setattr(aira_tools, "ensure_db_connected", AsyncMock())
    monkeypatch.setattr(aira_tools, "db", fake_db)

    states = await aira_tools._async_get_muscle_recovery("char-test")
    assert len(states) == 1
    assert states[0]["muscleGroup"] == "CHEST"
    assert states[0]["currentFatigue"] > 0
    assert states[0]["isRecovered"] is False


@pytest.mark.asyncio
async def test_inventory_and_shop_reads(monkeypatch):
    mock_item_def = SimpleNamespace(
        name="Demon King Dagger",
        type="WEAPON",
        rarity="EPIC",
        attack=150,
        strength=25,
    )
    mock_player_item = SimpleNamespace(
        id="item-1",
        quantity=1,
        isEquipped=True,
        itemDefinition=mock_item_def,
    )

    fake_db = SimpleNamespace(
        playeritem=SimpleNamespace(find_many=AsyncMock(return_value=[mock_player_item]))
    )

    monkeypatch.setattr(aira_tools, "ensure_db_connected", AsyncMock())
    monkeypatch.setattr(aira_tools, "db", fake_db)

    items = await aira_tools._async_get_inventory_items("char-test")
    assert len(items) == 1
    assert items[0]["name"] == "Demon King Dagger"
    assert items[0]["isEquipped"] is True
    assert items[0]["attack"] == 150


# ==========================================
# PHASE B: MUTATIVE PREVIEW & EXECUTION TESTS
# ==========================================

def test_mutative_tools_return_pending_confirmation():
    """All mutative tool stubs should return pending_confirmation status."""
    res_habit = aira_tools.create_habit("char-1", "Morning Pushups", "Fitness", "EASY", "strength")
    assert res_habit["status"] == "pending_confirmation"

    res_equip = aira_tools.equip_inventory_item("char-1", "item-123", "Shadow Blade")
    assert res_equip["status"] == "pending_confirmation"

    res_auto = aira_tools.create_automation_rule("char-1", "Auto Pushups", "VISION_DETECTION", "COMPLETE_HABIT")
    assert res_auto["status"] == "pending_confirmation"


def test_phase_b_create_habit_is_not_executable_during_phase_a(client):
    payload = {
        "characterId": "char-test-1",
        "action_type": "create_habit",
        "action_args": {
            "name": "Meditation",
            "category": "Mind",
            "difficulty": "EASY",
            "primary_stat": "discipline",
        },
    }
    res = client.post("/api/aira/execute", json=payload)
    assert res.status_code == 409
    assert "signed preview" in res.json()["detail"]


def test_phase_b_equip_is_not_executable_during_phase_a(client):
    payload = {
        "characterId": "char-test-1",
        "action_type": "equip_inventory_item",
        "action_args": {
            "player_item_id": "p-item-1",
            "item_name": "Shadow Blade",
        },
    }
    res = client.post("/api/aira/execute", json=payload)
    assert res.status_code == 409


def test_phase_b_automation_is_not_executable_during_phase_a(client):
    create_res = client.post("/api/aira/execute", json={
        "characterId": "char-test-1",
        "action_type": "create_automation_rule",
        "action_args": {
            "name": "Vision Auto Habit",
            "trigger_type": "VISION_DETECTION",
            "action_type": "COMPLETE_HABIT",
        },
    })
    assert create_res.status_code == 409
