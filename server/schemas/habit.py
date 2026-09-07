from enum import Enum
from typing import Optional, Literal, List
from pydantic import BaseModel, Field

class HabitType(str, Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"

class PenaltyTarget(str, Enum):
    HP = "HP"
    EXP = "EXP"
    VITALITY = "VITALITY"
    DISCIPLINE = "DISCIPLINE"
    STRENGTH = "STRENGTH"
    KNOWLEDGE = "KNOWLEDGE"
    FOCUS = "FOCUS"
    RECOVERY = "RECOVERY"
    CONSISTENCY = "CONSISTENCY"

class HabitStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    ARCHIVED = "ARCHIVED"
    DELETED = "DELETED"

class Difficulty(str, Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

class ScheduleType(str, Enum):
    DAILY = "DAILY"
    SPECIFIC_DAYS = "SPECIFIC_DAYS"
    X_TIMES_WEEK = "X_TIMES_WEEK"
    MONTHLY = "MONTHLY"
    CUSTOM = "CUSTOM"

class Tier(str, Enum):
    MINI = "MINI"
    NORMAL = "NORMAL"
    ELITE = "ELITE"

class HabitScheduleCreateSchema(BaseModel):
    daysOfWeek: Optional[str] = None
    timesPerWeek: Optional[int] = None
    timesPerMonth: Optional[int] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    timezone: Optional[str] = None

class HabitTierCreateSchema(BaseModel):
    tier: Tier
    targetType: Optional[str] = None
    targetValue: Optional[float] = None
    targetUnit: Optional[str] = None
    baseExp: int = 0
    baseGold: int = 0
    statReward: int = 0

class HabitCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = None
    color: Optional[str] = None
    category: str = Field("General", max_length=50)
    difficulty: Difficulty = Field(Difficulty.EASY)
    primaryStat: str = Field("discipline", max_length=50)
    scheduleType: ScheduleType = Field(ScheduleType.DAILY)
    rrule: Optional[str] = None
    preferredTime: Optional[str] = None
    type: HabitType = HabitType.POSITIVE
    affectedStat: PenaltyTarget = PenaltyTarget.HP
    statModifier: int = Field(10, ge=1, le=100000)
    
    schedule: Optional[HabitScheduleCreateSchema] = None
    tiers: List[HabitTierCreateSchema] = Field(default_factory=list)

class MissionCompleteSchema(BaseModel):
    completionType: Tier
    expEarned: Optional[int] = None
    statsEarned: Optional[int] = None

class HabitStatusUpdateSchema(BaseModel):
    status: HabitStatus

class HabitUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    primaryStat: Optional[str] = None
    scheduleType: Optional[ScheduleType] = None
    rrule: Optional[str] = None
    preferredTime: Optional[str] = None
    type: Optional[HabitType] = None
    affectedStat: Optional[PenaltyTarget] = None
    statModifier: Optional[int] = Field(None, ge=1, le=100000)
    schedule: Optional[HabitScheduleCreateSchema] = None
    tiers: Optional[List[HabitTierCreateSchema]] = None

class HabitLogSchema(BaseModel):
    completionType: Tier = Field(Tier.NORMAL)
    targetValue: Optional[float] = None
    notes: Optional[str] = None

