from datetime import datetime, timezone
from enum import Enum
from typing import Any

from fastapi import HTTPException, status

from schemas.vision_discipline import (
    VisionBehavior,
    VisionDisciplineEventRequest,
    VisionDisciplineStage,
)


DEFAULT_PENALTY_AMOUNT = 10
MAX_LOG_LIMIT = 100


def get_db():
    from db import db

    return db


def _enum_value(value: Any) -> Any:
    return value.value if isinstance(value, Enum) else value


def _record_dict(record: Any) -> dict:
    if isinstance(record, dict):
        return dict(record)
    if hasattr(record, "model_dump"):
        return record.model_dump()
    if hasattr(record, "dict"):
        return record.dict()
    return {
        key: value
        for key, value in vars(record).items()
        if not key.startswith("_")
    }


def _normalize_observed_at(value: datetime | str) -> datetime:
    if isinstance(value, str):
        value = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if value.tzinfo is None or value.utcoffset() is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _is_exact_replay(log: Any, request: VisionDisciplineEventRequest) -> bool:
    return (
        log.characterId == request.characterId
        and _enum_value(log.behavior) == request.behavior.value
        and _enum_value(log.stage) == request.stage.value
        and log.deviceId == request.deviceId
        and _normalize_observed_at(log.observedAt)
        == _normalize_observed_at(request.observedAt)
        and log.reason == request.reason
    )


def _is_unique_violation(error: Exception) -> bool:
    name = error.__class__.__name__.lower()
    message = str(error).lower()
    return (
        "uniqueviolation" in name
        or "unique constraint" in message
        or "duplicate key" in message
        or "p2002" in message
    )


async def _setting_amount(db_client: Any, character_id: str, behavior: str) -> int:
    setting = await db_client.visiondisciplinesetting.find_unique(
        where={
            "characterId_behavior": {
                "characterId": character_id,
                "behavior": behavior,
            }
        }
    )
    return setting.penaltyAmount if setting else DEFAULT_PENALTY_AMOUNT


def _event_response(
    log: Any,
    *,
    idempotent_replay: bool,
    configured_amount: int | None = None,
) -> dict:
    log_data = _record_dict(log)
    stage = _enum_value(log_data["stage"])
    if stage == VisionDisciplineStage.WARNING.value:
        penalty = None
        narration = None
    else:
        actual_amount = log_data["penaltyAmount"]
        penalty = {
            "target": "HP",
            "configuredAmount": (
                actual_amount if configured_amount is None else configured_amount
            ),
            "amount": actual_amount,
            "previousValue": log_data["previousHp"],
            "newValue": log_data["newHp"],
        }
        narration = (
            f"Vision discipline penalty applied: -{actual_amount} HP."
        )
    return {
        "success": True,
        "log": log_data,
        "penalty": penalty,
        "canonicalNarration": narration,
        "idempotentReplay": idempotent_replay,
    }


async def _replay_response(
    log: Any,
    request: VisionDisciplineEventRequest,
    db_client: Any,
) -> dict:
    if not _is_exact_replay(log, request):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="eventId has already been used for a different discipline event",
        )
    configured_amount = None
    if _enum_value(log.stage) == VisionDisciplineStage.PENALTY.value:
        configured_amount = await _setting_amount(
            db_client,
            request.characterId,
            request.behavior.value,
        )
    return _event_response(
        log,
        idempotent_replay=True,
        configured_amount=configured_amount,
    )


async def get_discipline_settings(
    character_id: str,
    db_client: Any = None,
) -> list[dict]:
    database = db_client or get_db()
    existing = await database.visiondisciplinesetting.find_many(
        where={"characterId": character_id}
    )
    by_behavior = {_enum_value(row.behavior): row for row in existing}
    settings = []
    for behavior in VisionBehavior:
        row = by_behavior.get(behavior.value)
        if row is None:
            row = await database.visiondisciplinesetting.upsert(
                where={
                    "characterId_behavior": {
                        "characterId": character_id,
                        "behavior": behavior.value,
                    }
                },
                data={
                    "create": {
                        "characterId": character_id,
                        "behavior": behavior.value,
                        "penaltyAmount": DEFAULT_PENALTY_AMOUNT,
                    },
                    "update": {},
                },
            )
        settings.append(_record_dict(row))
    return settings


async def update_discipline_setting(
    character_id: str,
    behavior: VisionBehavior | str,
    penalty_amount: int,
    db_client: Any = None,
) -> dict:
    database = db_client or get_db()
    behavior_value = VisionBehavior(_enum_value(behavior)).value
    row = await database.visiondisciplinesetting.upsert(
        where={
            "characterId_behavior": {
                "characterId": character_id,
                "behavior": behavior_value,
            }
        },
        data={
            "create": {
                "characterId": character_id,
                "behavior": behavior_value,
                "penaltyAmount": penalty_amount,
            },
            "update": {"penaltyAmount": penalty_amount},
        },
    )
    return _record_dict(row)


async def list_discipline_logs(
    character_id: str,
    limit: int = 50,
    db_client: Any = None,
) -> list[dict]:
    database = db_client or get_db()
    bounded_limit = max(1, min(limit, MAX_LOG_LIMIT))
    rows = await database.visiondisciplinelog.find_many(
        where={"characterId": character_id},
        order={"createdAt": "desc"},
        take=bounded_limit,
    )
    return [_record_dict(row) for row in rows]


async def record_discipline_event(
    request: VisionDisciplineEventRequest,
    db_client: Any = None,
) -> dict:
    database = db_client or get_db()
    existing = await database.visiondisciplinelog.find_unique(
        where={"eventId": request.eventId}
    )
    if existing:
        return await _replay_response(existing, request, database)

    try:
        async with database.tx() as transaction:
            existing = await transaction.visiondisciplinelog.find_unique(
                where={"eventId": request.eventId}
            )
            if existing:
                return await _replay_response(existing, request, transaction)

            character = await transaction.character.find_unique(
                where={"id": request.characterId}
            )
            if not character:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Character not found",
                )

            behavior = request.behavior.value
            stage = request.stage.value
            configured_amount = None
            previous_hp = None
            new_hp = None
            actual_amount = 0
            if request.stage == VisionDisciplineStage.PENALTY:
                configured_amount = await _setting_amount(
                    transaction,
                    request.characterId,
                    behavior,
                )
                previous_hp = character.currentHp
                new_hp = max(0, previous_hp - configured_amount)
                actual_amount = previous_hp - new_hp
                await transaction.character.update(
                    where={"id": request.characterId},
                    data={"currentHp": new_hp},
                )

            log = await transaction.visiondisciplinelog.create(
                data={
                    "eventId": request.eventId,
                    "characterId": request.characterId,
                    "behavior": behavior,
                    "stage": stage,
                    "deviceId": request.deviceId,
                    "observedAt": request.observedAt,
                    "reason": request.reason,
                    "penaltyAmount": actual_amount,
                    "previousHp": previous_hp,
                    "newHp": new_hp,
                }
            )
            return _event_response(
                log,
                idempotent_replay=False,
                configured_amount=configured_amount,
            )
    except HTTPException:
        raise
    except Exception as error:
        if not _is_unique_violation(error):
            raise
        winning_log = await database.visiondisciplinelog.find_unique(
            where={"eventId": request.eventId}
        )
        if not winning_log:
            raise
        return await _replay_response(winning_log, request, database)
