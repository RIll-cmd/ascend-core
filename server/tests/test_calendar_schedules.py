"""Unit and integration tests for Core personal calendar schedules."""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers.calendar import router
from schemas.calendar import CalendarScheduleCreate
from services.calendar_schedule_store import LocalCalendarScheduleStore


@pytest.fixture
def schedule_store(tmp_path):
    return LocalCalendarScheduleStore(tmp_path / "test_calendar.sqlite3")


def test_schedule_store_crud(schedule_store):
    # 1. Create weekly schedule with optional endTime
    weekly = schedule_store.create_schedule({
        "characterId": "char-1",
        "title": "Math Class",
        "time": "09:00",
        "endTime": "10:00",
        "scheduleType": "WEEKLY",
        "dayOfWeek": 1,
    })
    assert weekly["id"]
    assert weekly["title"] == "Math Class"
    assert weekly["time"] == "09:00"
    assert weekly["endTime"] == "10:00"
    assert weekly["scheduleType"] == "WEEKLY"
    assert weekly["dayOfWeek"] == 1
    assert weekly["completed"] is False

    # 2. Create one-time schedule
    once = schedule_store.create_schedule({
        "characterId": "char-1",
        "title": "Meeting with a Friend",
        "time": "19:00",
        "endTime": "21:00",
        "scheduleType": "ONCE",
        "scheduledAt": "2026-09-15T19:00:00",
    })
    assert once["title"] == "Meeting with a Friend"
    assert once["scheduledAt"] == "2026-09-15T19:00:00"
    assert once["endTime"] == "21:00"

    # 3. Retrieve for character
    schedules = schedule_store.get_schedules_for_character("char-1")
    assert len(schedules) == 2

    # 4. Complete one-time schedule
    completed = schedule_store.complete_schedule(once["id"])
    assert completed["completed"] is True

    # 5. Delete schedule
    deleted = schedule_store.delete_schedule(weekly["id"])
    assert deleted is True
    assert schedule_store.get_schedule(weekly["id"]) is None
    assert len(schedule_store.get_schedules_for_character("char-1")) == 1


def test_schedule_auto_expiration(schedule_store):
    # Create an expired one-time schedule (yesterday)
    past_event = schedule_store.create_schedule({
        "characterId": "char-exp",
        "title": "Past Meeting",
        "time": "08:00",
        "endTime": "09:00",
        "scheduleType": "ONCE",
        "scheduledAt": "2020-01-01T08:00:00",
    })
    assert past_event["completed"] is False

    # Query schedules — auto_complete_expired_schedules marks it completed
    schedules = schedule_store.get_schedules_for_character("char-exp")
    assert len(schedules) == 1
    assert schedules[0]["completed"] is True


def test_schedule_validation_errors():
    # WEEKLY without dayOfWeek must fail
    with pytest.raises(ValueError, match="dayOfWeek"):
        CalendarScheduleCreate(
            characterId="char-1",
            title="Class",
            time="09:00",
            scheduleType="WEEKLY",
        )

    # ONCE without scheduledAt must fail
    with pytest.raises(ValueError, match="scheduledAt"):
        CalendarScheduleCreate(
            characterId="char-1",
            title="Meeting",
            time="09:00",
            scheduleType="ONCE",
        )


def test_extract_calendar_intent_variations():
    from services.aira_service import extract_calendar_intent

    # 1. One-time schedule with time range
    res1 = extract_calendar_intent("at 7 pm-9:00 pm i have a meeting with a friend", "char-1")
    assert res1 is not None
    assert res1["action_type"] == "create_calendar_schedule"
    assert res1["action_args"]["time"] == "19:00"
    assert res1["action_args"]["end_time"] == "21:00"
    assert res1["action_args"]["schedule_type"] == "ONCE"
    assert "Meeting With A Friend" in res1["action_args"]["title"]

    # 2. Multi-day recurring with 9-10 range
    res2 = extract_calendar_intent("schedule my math class every Monday and Thursday at 9-10", "char-1")
    assert res2 is not None
    assert res2["action_type"] == "create_calendar_schedule_multi"
    assert res2["action_args"]["time"] == "09:00"
    assert res2["action_args"]["end_time"] == "10:00"
    assert len(res2["action_args"]["schedules"]) == 2


@pytest.mark.asyncio
async def test_calendar_router_endpoints(monkeypatch, schedule_store):
    from routers import calendar

    monkeypatch.setattr(calendar, "get_calendar_schedule_store", lambda: schedule_store)

    async def mock_ownership(char_id, user):
        return char_id == "char-owned" and user and user.get("id") == "user-1"

    monkeypatch.setattr(calendar, "verify_character_ownership", mock_ownership)

    app = FastAPI()
    app.include_router(router)

    from auth_utils import get_current_user_optional
    app.dependency_overrides[get_current_user_optional] = lambda: {"id": "user-1"}
    client = TestClient(app)

    # 1. Create schedule via POST
    create_res = client.post(
        "/api/calendar/schedules",
        json={
            "characterId": "char-owned",
            "title": "Gym Class",
            "time": "08:00",
            "endTime": "09:30",
            "scheduleType": "WEEKLY",
            "dayOfWeek": 4,
        },
    )
    assert create_res.status_code == 201
    created_data = create_res.json()
    schedule_id = created_data["id"]
    assert created_data["title"] == "Gym Class"
    assert created_data["endTime"] == "09:30"

    # 2. List schedules via GET
    list_res = client.get("/api/calendar/schedules?characterId=char-owned")
    assert list_res.status_code == 200
    assert len(list_res.json()["schedules"]) == 1
    assert list_res.json()["schedules"][0]["endTime"] == "09:30"

    # 3. Unauthorized character access
    forbidden_res = client.get("/api/calendar/schedules?characterId=char-other")
    assert forbidden_res.status_code == 403

    # 4. Complete schedule via PATCH
    complete_res = client.patch(f"/api/calendar/schedules/{schedule_id}/complete")
    assert complete_res.status_code == 200
    assert complete_res.json()["completed"] is True

    # 5. Delete schedule via DELETE
    delete_res = client.delete(f"/api/calendar/schedules/{schedule_id}")
    assert delete_res.status_code == 200
    assert delete_res.json()["deleted"] is True
