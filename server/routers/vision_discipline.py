"""Scoped Vision discipline ingestion and user-owned settings/history routes."""

from fastapi import APIRouter, Depends, HTTPException, Query

from auth_utils import get_current_user, get_current_vision_user
from db import db
from routers.integration import get_owned_vision_character
from schemas.vision_discipline import (
    VisionBehavior,
    VisionDisciplineEventRequest,
    VisionDisciplineSettingUpdate,
)
from services.vision_discipline_service import (
    get_discipline_settings,
    list_discipline_logs,
    record_discipline_event,
    update_discipline_setting,
)


router = APIRouter(tags=["vision-discipline"])


async def require_owned_character(character_id: str, current_user: dict):
    character = await db.character.find_first(
        where={"id": character_id, "userId": current_user["id"]}
    )
    if character is None:
        raise HTTPException(403, "Forbidden: You do not own this character.")
    return character


@router.post("/api/integration/vision/discipline-events")
async def ingest_vision_discipline_event(
    request: VisionDisciplineEventRequest,
    current_user: dict = Depends(get_current_vision_user),
):
    await get_owned_vision_character(request.characterId, current_user)
    return await record_discipline_event(request)


@router.get("/api/habits/{character_id}/vision-discipline/settings")
async def read_vision_discipline_settings(
    character_id: str,
    current_user: dict = Depends(get_current_user),
):
    await require_owned_character(character_id, current_user)
    return await get_discipline_settings(character_id)


@router.put("/api/habits/{character_id}/vision-discipline/settings/{behavior}")
async def save_vision_discipline_setting(
    character_id: str,
    behavior: VisionBehavior,
    payload: VisionDisciplineSettingUpdate,
    current_user: dict = Depends(get_current_user),
):
    await require_owned_character(character_id, current_user)
    return await update_discipline_setting(character_id, behavior, payload.penaltyAmount)


@router.get("/api/habits/{character_id}/vision-discipline/logs")
async def read_vision_discipline_logs(
    character_id: str,
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    await require_owned_character(character_id, current_user)
    return await list_discipline_logs(character_id, limit)
