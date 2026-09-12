import asyncio
import copy
import os
import sys
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from schemas.vision_discipline import (  # noqa: E402
    VisionBehavior,
    VisionDisciplineEventRequest,
    VisionDisciplineSettingUpdate,
)
from services.vision_discipline_service import (  # noqa: E402
    get_discipline_settings,
    list_discipline_logs,
    record_discipline_event,
    update_discipline_setting,
)


OBSERVED_AT = datetime(2026, 9, 13, 9, 0, tzinfo=timezone.utc)


def discipline_event(**overrides):
    values = {
        "eventId": "vision-discipline-1",
        "characterId": "character-1",
        "behavior": "PHONE_USE",
        "stage": "WARNING",
        "deviceId": "ascend-vision",
        "observedAt": OBSERVED_AT,
        "reason": "Phone use detected.",
    }
    values.update(overrides)
    return VisionDisciplineEventRequest(**values)


class UniqueViolationError(Exception):
    pass


class CharacterDelegate:
    def __init__(self, owner):
        self.owner = owner

    async def find_unique(self, where):
        row = self.owner.state["characters"].get(where["id"])
        return SimpleNamespace(**row) if row else None

    async def update(self, where, data):
        row = self.owner.state["characters"].get(where["id"])
        if row is None:
            raise RuntimeError("missing character")
        row.update(data)
        return SimpleNamespace(**row)


class SettingDelegate:
    def __init__(self, owner):
        self.owner = owner

    async def find_many(self, where):
        return [
            SimpleNamespace(**row)
            for (character_id, _behavior), row in self.owner.state["settings"].items()
            if character_id == where["characterId"]
        ]

    async def find_unique(self, where):
        key = where["characterId_behavior"]
        row = self.owner.state["settings"].get(
            (key["characterId"], key["behavior"])
        )
        return SimpleNamespace(**row) if row else None

    async def upsert(self, where, data):
        key_data = where["characterId_behavior"]
        key = (key_data["characterId"], key_data["behavior"])
        existing = self.owner.state["settings"].get(key)
        now = OBSERVED_AT
        if existing:
            existing.update(data["update"])
            existing["updatedAt"] = now
        else:
            existing = {
                "id": f"setting-{len(self.owner.state['settings']) + 1}",
                **data["create"],
                "createdAt": now,
                "updatedAt": now,
            }
            self.owner.state["settings"][key] = existing
        return SimpleNamespace(**existing)


class LogDelegate:
    def __init__(self, owner):
        self.owner = owner

    async def find_unique(self, where):
        row = self.owner.state["logs"].get(where["eventId"])
        return SimpleNamespace(**row) if row else None

    async def find_many(self, where, order, take):
        self.owner.last_log_query = {"where": where, "order": order, "take": take}
        rows = [
            row
            for row in self.owner.state["logs"].values()
            if row["characterId"] == where["characterId"]
        ]
        rows.sort(key=lambda row: row["createdAt"], reverse=True)
        return [SimpleNamespace(**row) for row in rows[:take]]

    async def create(self, data):
        if self.owner.fail_log:
            raise RuntimeError("log storage unavailable")
        if data["eventId"] in self.owner.state["logs"]:
            raise UniqueViolationError("duplicate key violates unique constraint")
        number = self.owner.state["next_log"]
        self.owner.state["next_log"] += 1
        row = {
            "id": f"log-{number}",
            **data,
            "createdAt": OBSERVED_AT + timedelta(seconds=number),
        }
        self.owner.state["logs"][data["eventId"]] = row
        return SimpleNamespace(**row)


class DatabaseView:
    def __init__(self, state):
        self.state = state
        self.fail_log = False
        self.last_log_query = None
        self.character = CharacterDelegate(self)
        self.visiondisciplinesetting = SettingDelegate(self)
        self.visiondisciplinelog = LogDelegate(self)


class TransactionContext:
    def __init__(self, database):
        self.database = database
        self.view = None

    async def __aenter__(self):
        await self.database.transaction_lock.acquire()
        self.view = DatabaseView(copy.deepcopy(self.database.state))
        self.view.fail_log = self.database.fail_log
        return self.view

    async def __aexit__(self, exc_type, _exc, _traceback):
        if exc_type is None:
            self.database.state = self.view.state
        self.database.transaction_lock.release()
        return False


class FakeDatabase(DatabaseView):
    def __init__(self):
        super().__init__(
            {
                "characters": {
                    "character-1": {"id": "character-1", "currentHp": 100}
                },
                "settings": {},
                "logs": {},
                "next_log": 1,
            }
        )
        self.transaction_lock = asyncio.Lock()

    def tx(self):
        return TransactionContext(self)


class RacingLogDelegate(LogDelegate):
    def __init__(self, owner, database):
        super().__init__(owner)
        self.database = database

    async def create(self, data):
        self.database.state["characters"][data["characterId"]]["currentHp"] = data[
            "newHp"
        ]
        self.database.state["logs"][data["eventId"]] = {
            "id": "winning-log",
            **data,
            "createdAt": OBSERVED_AT + timedelta(seconds=1),
        }
        raise UniqueViolationError("duplicate key violates unique constraint")


class RacingTransactionContext:
    def __init__(self, database):
        self.database = database
        self.view = None

    async def __aenter__(self):
        self.view = DatabaseView(copy.deepcopy(self.database.state))
        self.view.visiondisciplinelog = RacingLogDelegate(self.view, self.database)
        return self.view

    async def __aexit__(self, _exc_type, _exc, _traceback):
        return False


class RacingDatabase(FakeDatabase):
    def tx(self):
        return RacingTransactionContext(self)


@pytest.fixture
def fake_db():
    return FakeDatabase()


def test_contracts_reject_unknown_values_extra_fields_and_naive_timestamps():
    assert [behavior.value for behavior in VisionBehavior] == [
        "PHONE_USE",
        "SLOUCHING",
        "DROWSINESS",
    ]
    with pytest.raises(ValidationError):
        discipline_event(behavior="SMOKING")
    with pytest.raises(ValidationError):
        discipline_event(observedAt=OBSERVED_AT.replace(tzinfo=None))
    with pytest.raises(ValidationError):
        VisionDisciplineSettingUpdate(penaltyAmount=10, ignored=True)


@pytest.mark.parametrize("amount", [0, 101])
def test_setting_contract_rejects_amounts_outside_one_through_one_hundred(amount):
    with pytest.raises(ValidationError):
        VisionDisciplineSettingUpdate(penaltyAmount=amount)


@pytest.mark.asyncio
async def test_all_behaviors_default_to_ten_hp(fake_db):
    settings = await get_discipline_settings("character-1", db_client=fake_db)

    assert [(row["behavior"], row["penaltyAmount"]) for row in settings] == [
        ("PHONE_USE", 10),
        ("SLOUCHING", 10),
        ("DROWSINESS", 10),
    ]


@pytest.mark.asyncio
async def test_updating_one_behavior_does_not_change_the_other_defaults(fake_db):
    updated = await update_discipline_setting(
        "character-1", VisionBehavior.SLOUCHING, 25, db_client=fake_db
    )
    settings = await get_discipline_settings("character-1", db_client=fake_db)

    assert updated["penaltyAmount"] == 25
    assert {row["behavior"]: row["penaltyAmount"] for row in settings} == {
        "PHONE_USE": 10,
        "SLOUCHING": 25,
        "DROWSINESS": 10,
    }


@pytest.mark.asyncio
async def test_warning_is_logged_without_changing_hp(fake_db):
    result = await record_discipline_event(discipline_event(), db_client=fake_db)

    assert fake_db.state["characters"]["character-1"]["currentHp"] == 100
    assert result["log"]["penaltyAmount"] == 0
    assert result["log"]["previousHp"] is None
    assert result["log"]["newHp"] is None
    assert result["penalty"] is None
    assert result["canonicalNarration"] is None
    assert result["idempotentReplay"] is False


@pytest.mark.asyncio
async def test_penalty_uses_the_configured_behavior_amount(fake_db):
    await update_discipline_setting(
        "character-1", "PHONE_USE", 25, db_client=fake_db
    )

    result = await record_discipline_event(
        discipline_event(stage="PENALTY", reason="Phone use repeated."),
        db_client=fake_db,
    )

    assert fake_db.state["characters"]["character-1"]["currentHp"] == 75
    assert result["penalty"] == {
        "target": "HP",
        "configuredAmount": 25,
        "amount": 25,
        "previousValue": 100,
        "newValue": 75,
    }
    assert result["log"]["penaltyAmount"] == 25
    assert result["canonicalNarration"] == (
        "Vision discipline penalty applied: -25 HP."
    )


@pytest.mark.asyncio
async def test_penalty_clamps_hp_at_zero_and_logs_the_actual_deduction(fake_db):
    fake_db.state["characters"]["character-1"]["currentHp"] = 4

    result = await record_discipline_event(
        discipline_event(stage="PENALTY", reason="Phone use repeated."),
        db_client=fake_db,
    )

    assert result["penalty"]["configuredAmount"] == 10
    assert result["penalty"]["amount"] == 4
    assert result["penalty"]["previousValue"] == 4
    assert result["penalty"]["newValue"] == 0
    assert result["log"]["penaltyAmount"] == 4


@pytest.mark.asyncio
async def test_exact_replay_returns_the_existing_log_without_a_second_deduction(fake_db):
    request = discipline_event(stage="PENALTY", reason="Phone use repeated.")

    first = await record_discipline_event(request, db_client=fake_db)
    replay = await record_discipline_event(request, db_client=fake_db)

    assert fake_db.state["characters"]["character-1"]["currentHp"] == 90
    assert replay["log"]["id"] == first["log"]["id"]
    assert replay["idempotentReplay"] is True


@pytest.mark.asyncio
async def test_concurrent_duplicate_delivery_deducts_only_once(fake_db):
    request = discipline_event(stage="PENALTY", reason="Phone use repeated.")

    first, second = await asyncio.gather(
        record_discipline_event(request, db_client=fake_db),
        record_discipline_event(request, db_client=fake_db),
    )

    assert fake_db.state["characters"]["character-1"]["currentHp"] == 90
    assert len(fake_db.state["logs"]) == 1
    assert {first["idempotentReplay"], second["idempotentReplay"]} == {False, True}


@pytest.mark.asyncio
async def test_unique_event_race_reloads_the_winning_transaction():
    database = RacingDatabase()
    request = discipline_event(stage="PENALTY", reason="Phone use repeated.")

    result = await record_discipline_event(request, db_client=database)

    assert database.state["characters"]["character-1"]["currentHp"] == 90
    assert result["log"]["id"] == "winning-log"
    assert result["idempotentReplay"] is True


@pytest.mark.asyncio
async def test_conflicting_event_id_reuse_returns_http_409(fake_db):
    await record_discipline_event(discipline_event(), db_client=fake_db)

    with pytest.raises(HTTPException) as error:
        await record_discipline_event(
            discipline_event(reason="Different observation."), db_client=fake_db
        )

    assert error.value.status_code == 409


@pytest.mark.asyncio
async def test_log_failure_rolls_back_the_hp_update(fake_db):
    fake_db.fail_log = True

    with pytest.raises(RuntimeError, match="log storage unavailable"):
        await record_discipline_event(
            discipline_event(stage="PENALTY", reason="Phone use repeated."),
            db_client=fake_db,
        )

    assert fake_db.state["characters"]["character-1"]["currentHp"] == 100
    assert fake_db.state["logs"] == {}


@pytest.mark.asyncio
async def test_logs_are_read_newest_first_with_a_maximum_limit_of_one_hundred(fake_db):
    for index in range(3):
        await record_discipline_event(
            discipline_event(
                eventId=f"vision-discipline-{index}",
                observedAt=OBSERVED_AT + timedelta(seconds=index),
            ),
            db_client=fake_db,
        )

    logs = await list_discipline_logs("character-1", limit=500, db_client=fake_db)

    assert [row["id"] for row in logs] == ["log-3", "log-2", "log-1"]
    assert fake_db.last_log_query == {
        "where": {"characterId": "character-1"},
        "order": {"createdAt": "desc"},
        "take": 100,
    }


@pytest.mark.asyncio
async def test_penalty_does_not_read_or_create_a_habit(fake_db):
    fake_db.habit = SimpleNamespace(
        find_many=AsyncMock(side_effect=AssertionError("habit read")),
        create=AsyncMock(side_effect=AssertionError("habit create")),
    )
    result = await record_discipline_event(
        discipline_event(behavior="PHONE_USE", stage="PENALTY"),
        db_client=fake_db,
    )
    assert result["log"]["behavior"] == "PHONE_USE"
    assert result["penalty"]["amount"] == 10
