import os
import secrets
import json
import re
from datetime import datetime, timezone
from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator
from services.automation_engine import evaluate_observation
from auth_utils import get_current_automation_user
from db import db


router = APIRouter(prefix="/api/integration", tags=["integration"])

VISION_CONNECTED_TIMEOUT_SECONDS = 30
_vision_presence: dict[str, dict[str, Any]] = {}


class IntegrationEvent(BaseModel):
    source: str = Field(min_length=1, max_length=50)
    type: Literal["workout_completed"]
    timestamp: datetime
    confidence: float | None = Field(default=None, ge=0, le=1)
    text: str | None = Field(default=None, max_length=1000)
    payload: dict[str, Any]


class VisionHeartbeat(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source: Literal["ascend_vision"]
    characterId: str = Field(min_length=1, max_length=128)
    deviceId: str = Field(min_length=1, max_length=128)
    timestamp: datetime
    version: str | None = Field(default=None, min_length=1, max_length=64)

    @field_validator("timestamp")
    @classmethod
    def require_heartbeat_timestamp_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("timestamp must include a timezone offset")
        return value


class ObservationPayload(BaseModel):
    """Semantic detector metadata only; raw camera material is rejected by `extra=forbid`."""
    model_config = ConfigDict(extra="forbid")

    confidence: float = Field(ge=0, le=1)
    posture: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    detector: str = Field(min_length=1, max_length=200)


class ObservationEvent(BaseModel):
    source: Literal["phone_cv"]
    type: Literal["phone_usage_observed", "posture_observed", "sleep_state_observed"]
    characterId: str = Field(min_length=1, max_length=128)
    timestamp: datetime
    eventId: UUID
    payload: ObservationPayload

    @field_validator("timestamp")
    @classmethod
    def require_observation_timestamp_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("timestamp must include a timezone offset")
        return value


CommandName = Literal["complete_mission", "complete_habit", "get_missions", "get_habits", "unknown"]


class IntegrationCommand(BaseModel):
    source: Literal["phone", "watch", "ascend_vision", "phone_watch_phase5"]
    characterId: str = Field(min_length=1, max_length=128)
    text: str = Field(min_length=1, max_length=1000)
    timestamp: datetime
    requestId: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$")

    @field_validator("timestamp")
    @classmethod
    def require_timestamp_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("timestamp must include a timezone offset")
        return value

    @field_validator("source")
    @classmethod
    def normalize_legacy_vision_source(cls, value: str) -> str:
        return "ascend_vision" if value == "phone_watch_phase5" else value



class CommandIntent(BaseModel):
    intent: CommandName
    target: str | None = Field(default=None, max_length=200)
    confidence: float | None = Field(default=None, ge=0, le=1)


# Phase 2 is intentionally process-local: it prevents network retries while this
# single-worker service handles a command. Durable multi-instance idempotency
# belongs with an explicit persistence design, not an implicit schema change.
_command_request_results: dict[str, dict[str, Any]] = {}


def clear_command_request_cache() -> None:
    _command_request_results.clear()


def require_integration_api_key(x_integration_key: str | None = Header(default=None)) -> None:
    expected_key = os.getenv("INTEGRATION_API_KEY", "")
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Integration API is not configured.",
        )
    if not x_integration_key or not secrets.compare_digest(x_integration_key, expected_key):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid integration credentials.")


async def get_owned_vision_character(character_id: str, current_user: dict) -> Any:
    character = await db.character.find_first(
        where={"id": character_id, "userId": current_user["id"]}
    )
    if not character:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this character.",
        )
    return character


def serialize_vision_presence(character_id: str) -> dict[str, Any]:
    presence = _vision_presence.get(character_id)
    if not presence:
        return {
            "status": "OFFLINE",
            "characterId": character_id,
            "deviceId": None,
            "source": None,
            "version": None,
            "lastSeenAt": None,
        }

    age_seconds = (datetime.now(timezone.utc) - presence["lastSeenAt"]).total_seconds()
    return {
        "status": "CONNECTED" if age_seconds < VISION_CONNECTED_TIMEOUT_SECONDS else "OFFLINE",
        "characterId": character_id,
        "deviceId": presence["deviceId"],
        "source": presence["source"],
        "version": presence["version"],
        "lastSeenAt": presence["lastSeenAt"].isoformat(),
    }


@router.post("/vision/heartbeat")
async def receive_vision_heartbeat(
    heartbeat: VisionHeartbeat,
    current_user: dict = Depends(get_current_automation_user),
):
    await get_owned_vision_character(heartbeat.characterId, current_user)
    _vision_presence[heartbeat.characterId] = {
        "source": heartbeat.source,
        "deviceId": heartbeat.deviceId,
        "version": heartbeat.version,
        # Presence is recorded by Core, not the client-supplied clock.
        "lastSeenAt": datetime.now(timezone.utc),
    }
    return serialize_vision_presence(heartbeat.characterId)


@router.get("/vision/status")
async def vision_status(
    characterId: str,
    current_user: dict = Depends(get_current_automation_user),
):
    await get_owned_vision_character(characterId, current_user)
    return serialize_vision_presence(characterId)


async def dispatch_workout_completed(payload: dict[str, Any]) -> dict[str, Any]:
    from routers.workouts import WorkoutLogInput, log_workout_from_integration

    try:
        workout = WorkoutLogInput.model_validate(payload)
    except ValidationError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=error.errors()) from error
    return await log_workout_from_integration(workout)


async def integration_character_exists(character_id: str) -> bool:
    """Integration observations must target an existing character; never trigger guest creation."""
    from db import db

    return await db.character.find_unique(where={"id": character_id}) is not None


def _observation_summary(observation: Any) -> dict[str, Any]:
    return {"id": observation.id, "eventId": observation.eventId}


async def persist_observation(event: ObservationEvent) -> tuple[dict[str, Any], bool, Any]:
    """Persist one semantic observation, using the database unique constraint for durable replay protection."""
    from db import db

    event_id = str(event.eventId)
    existing = await db.integrationobservation.find_unique(where={"eventId": event_id})
    if existing:
        return _observation_summary(existing), True, existing

    try:
        observation = await db.integrationobservation.create(
            data={
                "eventId": event_id,
                "characterId": event.characterId,
                "source": event.source,
                "eventType": event.type,
                "observedAt": event.timestamp,
                "payloadJson": json.dumps(event.payload.model_dump(mode="json"), separators=(",", ":")),
            }
        )
    except Exception as error:
        if error.__class__.__name__ != "UniqueViolationError":
            raise
        # A concurrent retry inserted the same unique event ID after the initial lookup.
        existing = await db.integrationobservation.find_unique(where={"eventId": event_id})
        if existing:
            return _observation_summary(existing), True, existing
        raise
    return _observation_summary(observation), False, observation


def _target_from_text(text: str) -> str | None:
    target = text.casefold()
    target = re.sub(r"\b(mark|complete|finish|done|log|my|a|the|today|mission|habit)\b", " ", target)
    target = re.sub(r"\s+", " ", target).strip(" .!?")
    return target or None


def _fallback_intent(text: str) -> CommandIntent:
    normalized = text.casefold()
    if "habit" in normalized and any(word in normalized for word in ("what", "show", "list", "have")):
        return CommandIntent(intent="get_habits", confidence=0.75)
    if "mission" in normalized and any(word in normalized for word in ("what", "show", "list", "have")):
        return CommandIntent(intent="get_missions", confidence=0.75)
    if any(word in normalized for word in ("complete", "finish", "mark", "done", "log")):
        return CommandIntent(
            intent="complete_habit" if "habit" in normalized else "complete_mission",
            target=_target_from_text(text),
            confidence=0.70,
        )
    return CommandIntent(intent="unknown", confidence=0.0)


async def interpret_command(text: str) -> CommandIntent:
    """Use AIRA only as a constrained parser; invalid model output is never executable."""
    try:
        from services.aira_service import call_gemini_generate, get_gemini_client

        prompt = (
            "Return JSON only, without markdown. Interpret this command using exactly one intent: "
            "complete_mission, complete_habit, get_missions, get_habits, unknown. "
            "Schema: {\"intent\": string, \"target\": string|null, \"confidence\": number}. "
            "Do not propose actions outside that list. Command: " + text
        )
        response = call_gemini_generate(get_gemini_client(), prompt)
        if response:
            candidate = response.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return CommandIntent.model_validate(json.loads(candidate))
    except (json.JSONDecodeError, ValidationError, TypeError, ValueError):
        pass
    except Exception:
        # Model availability must not make a trusted local command endpoint fail.
        pass
    return _fallback_intent(text)


def _summary(record: Any, fallback_name: str) -> dict[str, Any]:
    habit = getattr(record, "habit", None)
    return {
        "id": record.id,
        "name": getattr(habit, "name", None) or fallback_name,
        "status": record.status,
    }


async def get_existing_today_missions(character_id: str) -> list[dict[str, Any]]:
    from routers.missions import get_today_missions

    missions = await get_today_missions(character_id)
    return [_summary(mission, f"Mission {mission.id}") for mission in missions]


async def find_matching_missions(character_id: str, target: str) -> list[dict[str, Any]]:
    missions = await get_existing_today_missions(character_id)
    needle = target.casefold()
    return [mission for mission in missions if needle in mission["name"].casefold() and mission["status"] == "PENDING"]


async def get_existing_habits(character_id: str) -> list[dict[str, Any]]:
    from db import db

    habits = await db.habit.find_many(where={"characterId": character_id, "status": "ACTIVE"})
    return [{"id": habit.id, "name": habit.name, "status": habit.status} for habit in habits]


async def find_matching_habits(character_id: str, target: str) -> list[dict[str, Any]]:
    needle = target.casefold()
    return [habit for habit in await get_existing_habits(character_id) if needle in habit["name"].casefold()]


async def complete_existing_mission(mission_id: str) -> dict[str, Any]:
    from routers.missions import complete_mission
    from schemas.habit import MissionCompleteSchema, Tier

    mission = await complete_mission(mission_id, MissionCompleteSchema(completionType=Tier.NORMAL))
    return _summary(mission, f"Mission {mission.id}")


async def complete_existing_habit(habit_id: str) -> dict[str, Any]:
    from routers.habits import log_habit
    from schemas.habit import HabitLogSchema

    result = await log_habit(habit_id, HabitLogSchema(), None)
    return {"id": habit_id, "status": "COMPLETED", "result": result}


def _response(request: IntegrationCommand, intent: CommandName, action: str, message: str, data: Any = None, **extra: Any) -> dict[str, Any]:
    return {
        "success": action not in {"unknown", "not_found"},
        "requestId": request.requestId,
        "intent": intent,
        "action": action,
        "message": message,
        "data": data if data is not None else {},
        **extra,
    }


@router.get("/status")
async def integration_status(x_integration_key: str | None = Header(default=None)):
    require_integration_api_key(x_integration_key)
    return {"status": "ready", "supportedEvents": ["workout_completed"]}


@router.post("/event")
async def receive_event(event: IntegrationEvent | ObservationEvent, x_integration_key: str | None = Header(default=None)):
    require_integration_api_key(x_integration_key)
    if isinstance(event, ObservationEvent):
        if not await integration_character_exists(event.characterId):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found.")
        persisted = await persist_observation(event)
        data, duplicate = persisted[0], persisted[1]
        observation = persisted[2] if len(persisted) > 2 else data
        if not duplicate:
            try:
                await evaluate_observation(observation)
            except Exception as error:
                print(f"[integration.py] Automation evaluation error: {error}")
        return {
            "success": True,
            "action": "observation_recorded",
            "message": f"{event.type} recorded as an observation.",
            "data": data,
            "duplicate": duplicate,
        }

    required_workout_fields = {"characterId", "durationSeconds", "sets"}
    if not required_workout_fields.issubset(event.payload):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="workout_completed requires characterId, durationSeconds, and sets.",
        )

    result = await dispatch_workout_completed(event.payload)
    return {
        "success": True,
        "action": "workout_logged",
        "message": result["message"],
        "data": result,
        "source": event.source,
        "confidence": event.confidence,
    }


@router.post("/command")
async def receive_command(command: IntegrationCommand, x_integration_key: str | None = Header(default=None)):
    require_integration_api_key(x_integration_key)

    cached = _command_request_results.get(command.requestId)
    if cached is not None:
        return cached

    parsed = await interpret_command(command.text)
    try:
        intent = CommandIntent.model_validate(parsed)
    except ValidationError:
        intent = CommandIntent(intent="unknown", confidence=0.0)

    if intent.intent == "get_missions":
        missions = await get_existing_today_missions(command.characterId)
        result = _response(command, intent.intent, "missions_query", f"You have {len(missions)} missions today.", missions)
    elif intent.intent == "get_habits":
        habits = await get_existing_habits(command.characterId)
        result = _response(command, intent.intent, "habits_query", f"You have {len(habits)} active habits.", habits)
    elif intent.intent in {"complete_mission", "complete_habit"} and not intent.target:
        result = _response(command, intent.intent, "not_found", "I need the mission or habit name before I can complete it.")
    elif intent.intent == "complete_mission":
        matches = await find_matching_missions(command.characterId, intent.target)
        if len(matches) == 1:
            data = await complete_existing_mission(matches[0]["id"])
            result = _response(command, intent.intent, "mission_completed", f"{matches[0]['name']} completed.", data)
        elif len(matches) > 1:
            result = _response(command, intent.intent, "ambiguous", "I found multiple matching missions.", matches, needsConfirmation=True, options=matches)
            result["success"] = False
        else:
            result = _response(command, intent.intent, "not_found", "I couldn't find that mission.")
    elif intent.intent == "complete_habit":
        matches = await find_matching_habits(command.characterId, intent.target)
        if len(matches) == 1:
            data = await complete_existing_habit(matches[0]["id"])
            result = _response(command, intent.intent, "habit_completed", f"{matches[0]['name']} completed.", data)
        elif len(matches) > 1:
            result = _response(command, intent.intent, "ambiguous", "I found multiple matching habits.", matches, needsConfirmation=True, options=matches)
            result["success"] = False
        else:
            result = _response(command, intent.intent, "not_found", "I couldn't find that habit.")
    else:
        result = _response(command, "unknown", "unknown", "I couldn't safely interpret that command.")

    _command_request_results[command.requestId] = result
    return result
