from typing import Any, cast, get_args

from db import db
from routers.automations import serialize_rule
from routers.workouts import compute_muscle_status_dict
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


async def _read_available_intent(intent: VisionReadIntent, character_id: str) -> dict[str, Any]:
    if intent == "missions_summary":
        return {"missions": await get_existing_today_missions(character_id)}

    if intent == "habits_summary":
        return {"habits": await get_existing_habits(character_id)}

    if intent == "automations_summary":
        rules = await db.automationrule.find_many(
            where={"characterId": character_id},
            order={"createdAt": "desc"},
        )
        return {"automations": [serialize_rule(rule) for rule in rules]}

    if intent == "steps_summary":
        character = await db.character.find_unique(where={"id": character_id})
        if not character:
            return {}
        return {
            "steps": int(getattr(character, "dailySteps", 0) or 0),
            "goal": int(getattr(character, "dailyStepGoal", 10000) or 10000),
        }

    if intent == "recovery_summary":
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
    data = await _read_available_intent(intent, request.characterId)
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
