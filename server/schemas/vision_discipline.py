from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class VisionBehavior(str, Enum):
    PHONE_USE = "PHONE_USE"
    SLOUCHING = "SLOUCHING"
    DROWSINESS = "DROWSINESS"


class VisionDisciplineStage(str, Enum):
    WARNING = "WARNING"
    PENALTY = "PENALTY"


class VisionDisciplineEventRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    eventId: str = Field(
        min_length=1,
        max_length=128,
        pattern=r"^[A-Za-z0-9._:-]+$",
    )
    characterId: str = Field(min_length=1, max_length=128)
    behavior: VisionBehavior
    stage: VisionDisciplineStage
    deviceId: str = Field(min_length=1, max_length=128)
    observedAt: datetime
    reason: str = Field(min_length=1, max_length=280)

    @field_validator("observedAt")
    @classmethod
    def require_timezone_aware_observation(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("observedAt must include a timezone offset")
        return value


class VisionDisciplineSettingUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    penaltyAmount: int = Field(ge=1, le=100)
