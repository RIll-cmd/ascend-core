from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AIRAChatSchema(BaseModel):
    prompt: str = Field(..., max_length=500, description="User prompt or query for AIRA (max 500 characters)")
    characterId: Optional[str] = Field("char-id-123", max_length=100, description="Character ID for context injection")


class AIRAPendingAction(BaseModel):
    action_type: str = Field(..., description="The name of the mutative tool (e.g., log_completed_workout)")
    action_args: Dict[str, Any] = Field(..., description="The arguments for the action")
    summary: str = Field(..., description="A short summary of the detected action for the user to confirm")
    operation: Optional[str] = None
    requestId: Optional[str] = None
    confirmationToken: Optional[str] = None
    expiresAt: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)

class AIRAChatResponseSchema(BaseModel):
    response: str
    pending_action: Optional[AIRAPendingAction] = None

class AIRAExecuteActionSchema(BaseModel):
    action_type: str
    action_args: Dict[str, Any]
    characterId: Optional[str] = "char-id-123"

class AIRACombatAnalysisSchema(BaseModel):
    battleLogs: List[str] = Field(default_factory=list, description="Array of turn battle logs from the tower run")
    characterId: Optional[str] = Field("char-id-123", description="Character ID for context injection")
    floorNumber: Optional[int] = Field(1, description="Floor number")
    isVictory: bool = Field(False, description="Did the player win?")
    turnsElapsed: int = Field(0, description="Number of turns the combat took")
    playerHpRemaining: int = Field(0, description="Player remaining HP")
