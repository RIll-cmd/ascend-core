from datetime import datetime, timedelta, timezone
from typing import Any, cast, get_args

from schemas.vision_contract import (
    VISION_CONTRACT_VERSION,
    VisionQueryRequest,
    VisionQuerySuccess,
    VisionReadIntent,
    vision_error,
)


async def get_existing_today_missions(character_id: str) -> list[dict[str, Any]]:
    from routers.integration import get_existing_today_missions as reader

    return await reader(character_id)


async def get_existing_habits(character_id: str) -> list[dict[str, Any]]:
    from routers.integration import get_existing_habits as reader

    return await reader(character_id)


def _database():
    # Keep contract validation and unit tests independent of Prisma client startup.
    from db import db
    return db


def _parse_mission_range(parameters: dict[str, Any]) -> tuple[datetime, datetime]:
    if set(parameters) != {"startAt", "endAt"}:
        raise ValueError("mission completion history requires startAt and endAt")
    values = []
    for key in ("startAt", "endAt"):
        value = parameters[key]
        if not isinstance(value, str):
            raise ValueError("mission completion boundaries must be timestamps")
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None or parsed.utcoffset() is None:
            raise ValueError("mission completion boundaries must include timezone offsets")
        values.append(parsed.astimezone(timezone.utc))
    start_at, end_at = values
    if end_at <= start_at or end_at - start_at > timedelta(days=31):
        raise ValueError("mission completion range must be positive and at most 31 days")
    return start_at, end_at


async def _read_mission_completion_history(character_id: str, parameters: dict[str, Any]) -> dict[str, Any]:
    start_at, end_at = _parse_mission_range(parameters)
    rows = await _database().mission.find_many(
        where={"characterId": character_id, "status": "COMPLETED",
               "completedAt": {"gte": start_at, "lt": end_at}},
        include={"habit": True},
        order={"completedAt": "asc"},
        take=100,
    )
    completions = []
    for row in rows:
        completed_at = getattr(row, "completedAt", None)
        if completed_at is None or not getattr(row, "id", None):
            continue
        if completed_at.tzinfo is None or completed_at.utcoffset() is None:
            continue
        habit = getattr(row, "habit", None)
        completions.append({
            "id": row.id,
            "name": getattr(habit, "name", None) or "Mission",
            "completedAt": completed_at.astimezone(timezone.utc).isoformat(),
            "completionType": getattr(row, "completionType", None),
        })
    return {"completions": completions}


async def _read_available_intent(intent: VisionReadIntent, character_id: str,
                                parameters: dict[str, Any]) -> dict[str, Any]:
    if intent == "missions_summary":
        return {"missions": await get_existing_today_missions(character_id)}

    if intent == "mission_completion_history":
        return await _read_mission_completion_history(character_id, parameters)

    if intent == "habits_summary":
        return {"habits": await get_existing_habits(character_id)}

    if intent == "automations_summary":
        from routers.automations import serialize_rule
        rules = await _database().automationrule.find_many(
            where={"characterId": character_id},
            order={"createdAt": "desc"},
        )
        return {"automations": [serialize_rule(rule) for rule in rules]}

    if intent == "steps_summary":
        character = await _database().character.find_unique(where={"id": character_id})
        if not character:
            return {}
        return {
            "steps": int(getattr(character, "dailySteps", 0) or 0),
            "goal": int(getattr(character, "dailyStepGoal", 10000) or 10000),
        }

    if intent == "recovery_summary":
        from routers.workouts import compute_muscle_status_dict
        return {"recovery": await compute_muscle_status_dict(character_id)}

    raise ValueError(f"Unsupported available intent: {intent}")


async def execute_vision_query(request: VisionQueryRequest) -> dict[str, Any]:
    if request.capabilityVersion != VISION_CONTRACT_VERSION:
        return vision_error(
            request.requestId,
            "unsupported_capability_version",
            f"Unsupported capability version: {request.capabilityVersion}.",
        )

    if request.intent not in get_args(VisionReadIntent):
        return vision_error(
            request.requestId,
            "unsupported_intent",
            f"Unsupported Vision read intent: {request.intent}.",
        )

    if request.intent in {"sleep_summary", "health_summary"}:
        label = "Sleep" if request.intent == "sleep_summary" else "Health"
        return vision_error(
            request.requestId,
            "unavailable_data",
            f"{label} data is not available from Ascend Core.",
        )

    intent = cast(VisionReadIntent, request.intent)
    try:
        data = await _read_available_intent(intent, request.characterId, request.parameters)
    except ValueError as error:
        return vision_error(request.requestId, "invalid_request", str(error))
    if not data and intent == "steps_summary":
        return vision_error(
            request.requestId,
            "unavailable_data",
            "Step data is not available from Ascend Core.",
        )

    return VisionQuerySuccess(
        requestId=request.requestId,
        intent=intent,
        data=data,
    ).model_dump(mode="json")
