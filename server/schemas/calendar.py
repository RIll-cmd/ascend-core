"""Pydantic schemas for Core personal calendar schedules."""

from datetime import datetime
import re
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator

ScheduleType = Literal["WEEKLY", "ONCE"]

_TIME_REGEX = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


class CalendarScheduleCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    characterId: str = Field(min_length=1, max_length=128)
    title: str = Field(min_length=1, max_length=120)
    time: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$", description="Time in HH:MM format (24-hour)")
    endTime: Optional[str] = Field(default=None, pattern=r"^([01]\d|2[0-3]):[0-5]\d$", description="Optional end time in HH:MM format (24-hour)")
    scheduleType: ScheduleType
    dayOfWeek: Optional[int] = Field(default=None, ge=0, le=6, description="0=Sunday, 1=Monday, ..., 6=Saturday")
    scheduledAt: Optional[str] = Field(default=None, max_length=64, description="ISO datetime or date string for one-time events")

    @model_validator(mode="after")
    def validate_schedule_type_fields(self) -> "CalendarScheduleCreate":
        if self.scheduleType == "WEEKLY":
            if self.dayOfWeek is None:
                raise ValueError("dayOfWeek (0-6) is required for WEEKLY schedules.")
        elif self.scheduleType == "ONCE":
            if not self.scheduledAt or not self.scheduledAt.strip():
                raise ValueError("scheduledAt is required for ONCE schedules.")
        return self


class CalendarScheduleResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    characterId: str
    title: str
    time: str
    endTime: Optional[str] = None
    scheduleType: str
    dayOfWeek: Optional[int] = None
    scheduledAt: Optional[str] = None
    completed: bool = False
    createdAt: str
    updatedAt: str
