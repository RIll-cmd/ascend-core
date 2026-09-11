"""Phase B preview validation and confirmation-token binding for AIRA writes."""

import json
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status

from schemas.aira_operations import AIRAOperationExecuteRequest, AIRAOperationPreviewRequest
from schemas.habit import HabitCreateSchema, HabitStatus, HabitStatusUpdateSchema, HabitUpdateSchema, MissionCompleteSchema, Tier
from schemas.automation import AutomationRuleCreate, AutomationRuleUpdate
from services.aira_confirmation_tokens import ConfirmationTokenError, create_confirmation_token, verify_confirmation_token


_PREVIEW_TTL = timedelta(minutes=5)


async def verify_character_ownership(character_id: str, current_user: dict[str, Any]) -> bool:
    """Lazy ownership boundary so token tests do not initialize Prisma."""
    from auth_utils import verify_character_ownership as verify

    return await verify(character_id, current_user)


def _actor_id(current_user: dict[str, Any]) -> str:
    actor_id = current_user.get("id")
    if not isinstance(actor_id, str) or not actor_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authenticated actor is required.")
    return actor_id


def _normalized_arguments(arguments: dict[str, Any]) -> dict[str, Any]:
    """Only JSON metadata may enter a signed preview; media and objects are excluded."""
    try:
        normalized = json.loads(json.dumps(arguments, sort_keys=True))
    except (TypeError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Preview arguments must be JSON metadata.",
        ) from error
    if not isinstance(normalized, dict):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Preview arguments must be an object.")
    return normalized


def normalize_aira_write_arguments(operation: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """Apply only Core-owned defaults for the initial habit and mission adapters."""
    normalized = _normalized_arguments(arguments)
    try:
        if operation == "create_habit":
            if "name" not in normalized and "title" in normalized:
                normalized["name"] = normalized.pop("title")
            if "primary_stat" in normalized:
                normalized["primaryStat"] = normalized.pop("primary_stat")
            return HabitCreateSchema.model_validate(normalized).model_dump(mode="json")
        if operation == "update_habit":
            habit_id = normalized.pop("habitId", None) or normalized.pop("habit_id", None)
            if "name" not in normalized and "title" in normalized:
                normalized["name"] = normalized.pop("title")
            if "primary_stat" in normalized:
                normalized["primaryStat"] = normalized.pop("primary_stat")
            return {"habitId": habit_id, **HabitUpdateSchema.model_validate(normalized).model_dump(mode="json", exclude_none=True)}
        if operation == "archive_habit":
            return {"habitId": normalized["habitId"], "status": HabitStatus.ARCHIVED.value}
        if operation == "complete_mission":
            return {
                "missionId": normalized["missionId"],
                **MissionCompleteSchema.model_validate({
                    "completionType": normalized.get("completionType", Tier.NORMAL.value),
                    "expEarned": normalized.get("expEarned"),
                    "statsEarned": normalized.get("statsEarned"),
                }).model_dump(mode="json"),
            }
        if operation == "create_mission":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Direct mission creation is not supported. Daily missions are generated from habits; create a supporting habit instead.",
            )
        if operation == "create_automation":
            return AutomationRuleCreate.model_validate(normalized).model_dump(mode="json", exclude={"characterId"})
        if operation == "update_automation":
            rule_id = normalized.pop("ruleId", None)
            if not isinstance(rule_id, str) or not rule_id.strip():
                raise ValueError("ruleId must be a non-empty string")
            validated = AutomationRuleUpdate.model_validate(normalized).model_dump(mode="json", exclude_none=True)
            if not validated:
                raise ValueError("At least one update field must be provided")
            return {
                "ruleId": rule_id,
                **validated,
            }
        if operation == "delete_automation":
            rule_id = normalized.get("ruleId")
            if not isinstance(rule_id, str) or not rule_id.strip():
                raise ValueError("ruleId must be a non-empty string")
            return {"ruleId": rule_id}
        if operation == "log_workout":
            if not normalized.get("sets") or not normalized.get("durationSeconds"):
                raise ValueError("durationSeconds and at least one set are required")
            return {"durationSeconds": normalized["durationSeconds"], "sets": normalized["sets"], **{key: normalized[key] for key in ("sex", "bodyweight", "notes") if key in normalized}}
        if operation == "equip_item":
            return {"playerItemId": normalized["playerItemId"]}
        if operation == "create_calendar_schedule":
            from schemas.calendar import CalendarScheduleCreate

            clean_args = {k: v for k, v in normalized.items() if k not in ("characterId", "character_id")}
            return CalendarScheduleCreate.model_validate(
                {"characterId": "preview-target", **clean_args}
            ).model_dump(mode="json", exclude={"characterId"}, exclude_none=True)
        if operation == "create_calendar_schedule_multi":
            schedules = normalized.get("schedules")
            if not isinstance(schedules, list) or not schedules:
                raise ValueError("schedules must be a non-empty list of calendar entries")
            # Pass through verbatim — domain adapter validates each entry on execution
            return {
                "schedules": schedules,
                "title": normalized.get("title", ""),
                "time": normalized.get("time", ""),
                "days": normalized.get("days", []),
            }
        if operation == "delete_calendar_schedule":
            schedule_id = normalized.get("scheduleId")
            if not isinstance(schedule_id, str) or not schedule_id.strip():
                raise ValueError("scheduleId must be a non-empty string")
            return {"scheduleId": schedule_id}
    except (KeyError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid {operation} preview arguments: {error}.",
        ) from error

    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail=f"The {operation} adapter is not available yet.",
    )



async def create_aira_preview(
    request: AIRAOperationPreviewRequest,
    current_user: dict[str, Any],
    *,
    secret: str | None = None,
) -> dict[str, Any]:
    """Create an expiring signed preview without mutating Core state."""
    actor_id = _actor_id(current_user)
    if not await verify_character_ownership(request.characterId, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this character.")

    expires_at = datetime.now(timezone.utc) + _PREVIEW_TTL
    normalized_arguments = normalize_aira_write_arguments(request.operation, request.arguments)
    claims = {
        "actorId": actor_id,
        "characterId": request.characterId,
        "operation": request.operation,
        "requestId": request.requestId,
        "normalizedArguments": normalized_arguments,
        "expiresAt": expires_at.isoformat(),
    }
    return {
        "requestId": request.requestId,
        "characterId": request.characterId,
        "operation": request.operation,
        "normalizedArguments": normalized_arguments,
        "summary": f"Confirm {request.operation.replace('_', ' ')}.",
        "warnings": ["This action will require a second, explicit confirmation."],
        "expiresAt": claims["expiresAt"],
        "confirmationToken": create_confirmation_token(claims, secret=secret),
    }


async def validate_aira_execution(
    request: AIRAOperationExecuteRequest,
    current_user: dict[str, Any],
    *,
    secret: str | None = None,
) -> dict[str, Any]:
    """Validate token identity and ownership before any domain adapter can run."""
    actor_id = _actor_id(current_user)
    try:
        claims = verify_confirmation_token(request.confirmationToken, secret=secret)
    except ConfirmationTokenError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error

    if claims["actorId"] != actor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Confirmation token belongs to a different actor.")
    if claims["characterId"] != request.characterId:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Confirmation token belongs to a different character.")
    if claims["operation"] != request.operation or claims["requestId"] != request.requestId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Confirmation token does not match this operation.")

    if not await verify_character_ownership(request.characterId, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this character.")

    return claims
