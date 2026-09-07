from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Literal
from datetime import datetime

class BossPhaseSchema(BaseModel):
    id: str
    bossId: str
    name: str
    maxHp: int
    orderIndex: int

class BossActivityCreate(BaseModel):
    activityType: str = Field(..., description="'HABIT', 'MISSION', 'WORKOUT'")
    referenceId: Optional[str] = None
    damageValue: int = Field(..., description="Damage this activity deals")

class BossActivitySchema(BossActivityCreate):
    id: str
    bossId: str

class BossDamageLogSchema(BaseModel):
    id: str
    bossId: str
    activityId: Optional[str]
    damage: int
    createdAt: datetime

class BossCreate(BaseModel):
    name: str = Field(..., description="Name of the boss/goal")
    description: Optional[str] = None
    category: str = Field(..., description="'ACADEMIC', 'PROJECT', 'FITNESS', 'CAREER', etc.")
    difficulty: Literal["EASY", "NORMAL", "HARD", "ELITE", "LEGENDARY"] = Field(
        ..., description="Official boss difficulty used for reward calibration"
    )
    archetype: Optional[str] = Field(default=None, max_length=32)
    maxHp: Optional[int] = Field(default=None, ge=1000, le=1000000)
    rewardGold: Optional[int] = Field(default=None, ge=0, le=10000000)
    rewardExp: Optional[int] = Field(default=None, ge=0, le=10000000)
    rewardTitle: Optional[str] = Field(default=None, max_length=80)
    realWorldReward: Optional[str] = Field(default=None, max_length=160)
    deadline: Optional[datetime] = None
    activities: List[BossActivityCreate] = Field(default_factory=list, description="Activities linked to this boss")

    @model_validator(mode="after")
    def validate_ritual_budget(self):
        limits = {
            "EASY": {"minHp": 1000, "gold": 1000, "exp": 2000},
            "NORMAL": {"minHp": 1000, "gold": 2400, "exp": 5000},
            "HARD": {"minHp": 10000, "gold": 6000, "exp": 15000},
            "ELITE": {"minHp": 25000, "gold": 15000, "exp": 30000},
            "LEGENDARY": {"minHp": 100000, "gold": 40000, "exp": 70000},
        }
        rank_limits = limits.get(self.difficulty.upper())
        if not rank_limits:
            return self
        if self.maxHp is not None and self.maxHp < rank_limits["minHp"]:
            raise ValueError(
                f"Calibrated HP must be at least {rank_limits['minHp']} for this threat rank"
            )
        if self.rewardGold is not None and self.rewardGold > rank_limits["gold"]:
            raise ValueError("Gold bounty exceeds the server-owned threat-rank budget")
        if self.rewardExp is not None and self.rewardExp > rank_limits["exp"]:
            raise ValueError("EXP allocation exceeds the server-owned threat-rank budget")
        return self

class BossSchema(BaseModel):
    id: str
    characterId: str
    name: str
    description: Optional[str]
    category: str
    difficulty: str
    archetype: Optional[str] = None
    maxHp: int
    currentHp: int
    rewardGold: Optional[int] = None
    rewardExp: Optional[int] = None
    rewardTitle: Optional[str] = None
    realWorldReward: Optional[str] = None
    deadline: Optional[datetime]
    status: str
    createdAt: datetime
    
    phases: List[BossPhaseSchema] = []
    activities: List[BossActivitySchema] = []
    damageLogs: List[BossDamageLogSchema] = []
