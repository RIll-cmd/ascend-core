import json
from types import SimpleNamespace
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from auth_utils import get_current_user
from db import db
from schemas.automation import AutomationRuleCreate, AutomationRuleUpdate, AutomationTestObservation
from services.automation_engine import evaluate_conditions


router = APIRouter(prefix="/api/automations", tags=["automations"])


async def get_owned_character(character_id: str, current_user: dict) -> Any:
    character = await db.character.find_first(where={"id": character_id, "userId": current_user["id"]})
    if not character:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: You do not own this character.")
    return character


async def validate_actions(character_id: str, actions: list[Any]) -> None:
    for action in actions:
        habit = await db.habit.find_unique(where={"id": action.habitId})
        habit_type = getattr(getattr(habit, "type", None), "value", getattr(habit, "type", None)) if habit else None
        if not habit or habit.characterId != character_id or habit_type != "NEGATIVE":
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="log_bad_habit requires an owned negative habit.")


def serialize_rule(rule: Any) -> dict[str, Any]:
    return {
        "id": rule.id, "characterId": rule.characterId, "name": rule.name, "enabled": rule.enabled, "matchMode": getattr(rule, "matchMode", "all"),
        "triggerType": rule.triggerType, "conditions": json.loads(rule.conditionsJson), "actions": json.loads(rule.actionsJson),
        "cooldownSeconds": rule.cooldownSeconds, "lastTriggeredAt": rule.lastTriggeredAt,
        "createdAt": rule.createdAt, "updatedAt": rule.updatedAt,
    }


@router.get("")
async def list_automations(characterId: str, current_user: dict = Depends(get_current_user)):
    await get_owned_character(characterId, current_user)
    rules = await db.automationrule.find_many(where={"characterId": characterId}, order={"createdAt": "desc"})
    return [serialize_rule(rule) for rule in rules]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_automation(payload: AutomationRuleCreate, current_user: dict = Depends(get_current_user)):
    await get_owned_character(payload.characterId, current_user)
    await validate_actions(payload.characterId, payload.actions)
    rule = await db.automationrule.create(data={
        "characterId": payload.characterId, "name": payload.name, "enabled": payload.enabled, "triggerType": payload.triggerType,
        "matchMode": payload.matchMode, "conditionsJson": json.dumps([item.model_dump() for item in payload.conditions]),
        "actionsJson": json.dumps([item.model_dump() for item in payload.actions]), "cooldownSeconds": payload.cooldownSeconds,
    })
    return serialize_rule(rule)


async def get_owned_rule(rule_id: str, current_user: dict) -> Any:
    rule = await db.automationrule.find_unique(where={"id": rule_id})
    if not rule:
        raise HTTPException(status_code=404, detail="Automation not found")
    await get_owned_character(rule.characterId, current_user)
    return rule


@router.get("/{rule_id}")
async def get_automation(rule_id: str, current_user: dict = Depends(get_current_user)):
    return serialize_rule(await get_owned_rule(rule_id, current_user))


@router.patch("/{rule_id}")
async def update_automation(rule_id: str, payload: AutomationRuleUpdate, current_user: dict = Depends(get_current_user)):
    rule = await get_owned_rule(rule_id, current_user)
    if payload.actions is not None:
        await validate_actions(rule.characterId, payload.actions)
    data = payload.model_dump(exclude_unset=True)
    if "conditions" in data:
        data["conditionsJson"] = json.dumps([item.model_dump() for item in payload.conditions or []])
        del data["conditions"]
    if "actions" in data:
        data["actionsJson"] = json.dumps([item.model_dump() for item in payload.actions or []])
        del data["actions"]
    return serialize_rule(await db.automationrule.update(where={"id": rule.id}, data=data))


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_automation(rule_id: str, current_user: dict = Depends(get_current_user)):
    rule = await get_owned_rule(rule_id, current_user)
    await db.automationrule.delete(where={"id": rule.id})


@router.post("/{rule_id}/test")
async def test_automation(rule_id: str, observation: AutomationTestObservation, current_user: dict = Depends(get_current_user)):
    rule = await get_owned_rule(rule_id, current_user)
    view = {"event": {"type": observation.type, "source": observation.source, "timestamp": observation.timestamp}, "payload": observation.payload}
    return evaluate_conditions(json.loads(rule.conditionsJson), view)
