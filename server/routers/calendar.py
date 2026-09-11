"""REST API router for personal calendar schedules."""

from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from auth_utils import get_current_user_optional, verify_character_ownership
from schemas.calendar import CalendarScheduleCreate, CalendarScheduleResponse
from services.calendar_schedule_store import get_calendar_schedule_store

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


@router.get("/schedules")
async def list_calendar_schedules(
    characterId: str,
    current_user: Optional[dict[str, Any]] = Depends(get_current_user_optional),
):
    """Retrieve all personal calendar schedules for the specified character."""
    if not await verify_character_ownership(characterId, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this character.")

    store = get_calendar_schedule_store()
    schedules = store.get_schedules_for_character(characterId)
    return {"schedules": schedules}


@router.post("/schedules", status_code=status.HTTP_201_CREATED, response_model=CalendarScheduleResponse)
async def create_calendar_schedule(
    payload: CalendarScheduleCreate,
    current_user: Optional[dict[str, Any]] = Depends(get_current_user_optional),
):
    """Create a new personal calendar schedule (one-time or weekly recurring)."""
    if not await verify_character_ownership(payload.characterId, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this character.")

    store = get_calendar_schedule_store()
    created = store.create_schedule(payload.model_dump())
    return created


@router.delete("/schedules/{schedule_id}")
async def delete_calendar_schedule(
    schedule_id: str,
    current_user: Optional[dict[str, Any]] = Depends(get_current_user_optional),
):
    """Delete an existing calendar schedule by ID."""
    store = get_calendar_schedule_store()
    schedule = store.get_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Calendar schedule not found.")

    if not await verify_character_ownership(schedule["characterId"], current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this schedule.")

    store.delete_schedule(schedule_id)
    return {"success": True, "deleted": True, "scheduleId": schedule_id}


@router.patch("/schedules/{schedule_id}/complete", response_model=CalendarScheduleResponse)
async def complete_calendar_schedule(
    schedule_id: str,
    current_user: Optional[dict[str, Any]] = Depends(get_current_user_optional),
):
    """Mark a one-time calendar schedule as completed."""
    store = get_calendar_schedule_store()
    schedule = store.get_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Calendar schedule not found.")

    if not await verify_character_ownership(schedule["characterId"], current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this schedule.")

    updated = store.complete_schedule(schedule_id)
    return updated
