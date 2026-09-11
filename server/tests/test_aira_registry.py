from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime, timezone
import pytest

from services.aira_registry import (
    read_domain_operation,
    recommend_workout_operation,
    SUPPORTED_DOMAINS,
    UNAVAILABLE_DOMAINS,
)


@pytest.mark.asyncio
async def test_supported_domains_inventory():
    """Ensure all core sidebar domains are accounted for."""
    assert "dashboard" in SUPPORTED_DOMAINS
    assert "missions" in SUPPORTED_DOMAINS
    assert "habits" in SUPPORTED_DOMAINS
    assert "workouts" in SUPPORTED_DOMAINS
    assert "tower" in SUPPORTED_DOMAINS
    assert "inventory" in SUPPORTED_DOMAINS
    assert "shop" in SUPPORTED_DOMAINS
    assert "beasts" in SUPPORTED_DOMAINS
    assert "achievements" in SUPPORTED_DOMAINS
    assert "automations" in SUPPORTED_DOMAINS


@pytest.mark.asyncio
async def test_unmodeled_domains_return_unavailable_data():
    """Sleep and focus must return typed unavailable_data without errors or hallucinated metrics."""
    sleep_res = await read_domain_operation("char-1", "sleep")
    assert sleep_res["success"] is False
    assert sleep_res["domain"] == "sleep"
    assert sleep_res["error"]["code"] == "unavailable_data"
    assert "Sleep" in sleep_res["error"]["message"]

    focus_res = await read_domain_operation("char-1", "focus")
    assert focus_res["success"] is False
    assert focus_res["domain"] == "focus"
    assert focus_res["error"]["code"] == "unavailable_data"


@pytest.mark.asyncio
async def test_unknown_domain_returns_unsupported_domain():
    res = await read_domain_operation("char-1", "non_existent_sidebar")
    assert res["success"] is False
    assert res["error"]["code"] == "unsupported_domain"


@pytest.mark.asyncio
async def test_dashboard_read_delegation(monkeypatch):
    mock_char = SimpleNamespace(
        id="char-1",
        name="SoloHunter",
        level=10,
        power=450,
        rank="C",
        gold=1000,
        gems=50,
        dailySteps=8000,
        dailyStepGoal=10000,
    )
    fake_db = SimpleNamespace(
        dailycompletionsnapshot=SimpleNamespace(
            find_first=AsyncMock(return_value=SimpleNamespace(completionRate=92.5))
        )
    )

    from services import aira_registry
    import routers.integration as integration

    monkeypatch.setattr(aira_registry, "ensure_db_connected", AsyncMock())
    monkeypatch.setattr(aira_registry, "ensure_character_exists", AsyncMock(return_value=mock_char))
    monkeypatch.setattr(aira_registry, "db", fake_db)
    monkeypatch.setattr(integration, "get_existing_today_missions", AsyncMock(return_value=[{"id": "m1", "status": "COMPLETED"}]))
    monkeypatch.setattr(integration, "get_existing_habits", AsyncMock(return_value=[{"id": "h1"}]))

    res = await read_domain_operation("char-1", "dashboard")
    assert res["success"] is True
    assert res["domain"] == "dashboard"
    assert res["data"]["character_name"] == "SoloHunter"
    assert res["data"]["active_habits_count"] == 1
    assert res["data"]["missions_today"]["total"] == 1
    assert res["data"]["missions_today"]["completed"] == 1
    assert res["data"]["recent_completion_rate"] == 92.5


@pytest.mark.asyncio
async def test_recommend_workout_operation(monkeypatch):
    from services import aira_registry
    import routers.workouts as workouts

    mock_recovery = {
        "muscles": {
            "CHEST": {"status": "FRESH"},
            "FRONT_DELTS": {"status": "FRESH"},
            "TRICEPS": {"status": "FRESH"},
            "LATS": {"status": "FATIGUED"},
            "QUADS": {"status": "RECOVERING"},
        },
        "summary": {
            "overallFreshness": 78.5,
        }
    }

    monkeypatch.setattr(aira_registry, "ensure_db_connected", AsyncMock())
    monkeypatch.setattr(workouts, "compute_muscle_status_dict", AsyncMock(return_value=mock_recovery))

    rec = await recommend_workout_operation("char-1")
    assert rec["success"] is True
    assert rec["recommended_split"] == "UPPER_PUSH"
    assert len(rec["target_exercises"]) > 0
    assert "Barbell Bench Press" in rec["target_exercises"]
    assert "CHEST" in rec["fresh_muscles"]
    assert "LATS" in rec["fatigued_muscles"]
