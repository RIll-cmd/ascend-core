"""Authenticated, read-only Core operations for AIRA.

The registry deliberately delegates data access to the shared Vision/Core read
dispatcher.  That keeps AIRA responses consistent with the integration
contract and prevents conversational code from acquiring a second ORM path.
"""

from typing import Any

from fastapi import HTTPException, status

from schemas.aira_operations import AIRAOperationRequest
from schemas.vision_contract import VISION_CONTRACT_VERSION, VisionQueryRequest


_DIRECT_READS = {
    "missions_summary",
    "habits_summary",
    "automations_summary",
    "steps_summary",
    "recovery_summary",
    "sleep_summary",
    "health_summary",
}


async def execute_vision_query(request: VisionQueryRequest) -> dict[str, Any]:
    """Lazy boundary around the shared dispatcher for a lightweight registry."""
    from services.vision_query_service import execute_vision_query as dispatch

    return await dispatch(request)


async def verify_character_ownership(character_id: str, current_user: dict[str, Any]) -> bool:
    """Lazy ownership boundary; avoids loading the database on module import."""
    from auth_utils import verify_character_ownership as verify

    return await verify(character_id, current_user)


async def _read_core_intent(request: AIRAOperationRequest, intent: str) -> dict[str, Any]:
    return await execute_vision_query(
        VisionQueryRequest(
            characterId=request.characterId,
            requestId=request.requestId,
            capabilityVersion=VISION_CONTRACT_VERSION,
            intent=intent,
            parameters=request.parameters,
        )
    )


def _operation_success(request: AIRAOperationRequest, data: dict[str, Any]) -> dict[str, Any]:
    return {
        "success": True,
        "requestId": request.requestId,
        "operation": request.operation,
        "data": data,
    }


def _operation_error(request: AIRAOperationRequest, response: dict[str, Any]) -> dict[str, Any]:
    return {
        "success": False,
        "requestId": request.requestId,
        "operation": request.operation,
        "error": response["error"],
    }


def _workout_recommendation(recovery: dict[str, Any]) -> dict[str, Any]:
    """Produce a transparent, deterministic suggestion from Core recovery data."""
    muscle_states = recovery.get("muscles", {})
    fresh = sorted(name for name, state in muscle_states.items() if state.get("status") == "FRESH")
    avoid = sorted(name for name, state in muscle_states.items() if state.get("status") == "FATIGUED")
    freshness = float(recovery.get("summary", {}).get("overallFreshness", 0))

    if freshness < 40 or not fresh:
        recommendation = "rest_or_mobility"
        reason = "Recovery is limited; prioritize rest, mobility, or an easy walk."
    elif {"CHEST", "FRONT_DELTS", "TRICEPS"}.issubset(fresh):
        recommendation = "upper_push"
        reason = "Chest, front delts, and triceps are fresh."
    elif {"LATS", "REAR_DELTS", "BICEPS"}.issubset(fresh):
        recommendation = "upper_pull"
        reason = "Back and biceps are fresh."
    elif {"QUADS", "HAMSTRINGS", "GLUTES"}.issubset(fresh):
        recommendation = "lower_body"
        reason = "Primary lower-body muscles are fresh."
    else:
        recommendation = "balanced_light_session"
        reason = "Recovery supports a light session; avoid fatigued muscles."

    return {
        "recommendation": recommendation,
        "reason": reason,
        "overallFreshness": freshness,
        "freshMuscles": fresh,
        "avoidMuscles": avoid,
    }


async def execute_aira_read_operation(
    request: AIRAOperationRequest,
    current_user: dict[str, Any],
) -> dict[str, Any]:
    """Authorize an AIRA read and return stable, metadata-only Core context."""
    if not await verify_character_ownership(request.characterId, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this character.",
        )

    if request.operation in _DIRECT_READS:
        response = await _read_core_intent(request, request.operation)
        if not response["success"]:
            return _operation_error(request, response)
        return _operation_success(request, response["data"])

    if request.operation == "today_schedule":
        response = await _read_core_intent(request, "missions_summary")
        if not response["success"]:
            return _operation_error(request, response)
        return _operation_success(request, {"missions": response["data"].get("missions", [])})

    response = await _read_core_intent(request, "recovery_summary")
    if not response["success"]:
        return _operation_error(request, response)
    recovery = response["data"].get("recovery", {})
    return _operation_success(request, {"recommendation": _workout_recommendation(recovery), "recovery": recovery})
