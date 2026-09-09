import json
from types import SimpleNamespace
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from auth_utils import get_current_automation_user
from db import db
from schemas.automation import AUTOMATION_CAPABILITY_VERSION, AutomationRuleCreate, AutomationRuleUpdate, AutomationTestObservation, automation_capabilities
from services.automation_engine import evaluate_conditions


router = APIRouter(prefix="/api/automations", tags=["automations"])


async def get_owned_character(character_id: str, current_user: dict) -> Any:
    character = await db.character.find_first(where={"id": character_id, "userId": current_user["id"]})
    if not character:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: You do not own this character.")
    return character


async def validate_actions(character_id: str, actions: list[Any]) -> None:
    for action in actions:
        if not await get_eligible_negative_habit(character_id, action.habitId):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="log_bad_habit requires an owned negative habit.")


async def get_eligible_negative_habit(character_id: str, habit_id: str) -> Any | None:
    habit = await db.habit.find_unique(where={"id": habit_id})
    habit_type = getattr(getattr(habit, "type", None), "value", getattr(habit, "type", None)) if habit else None
    return habit if habit and habit.characterId == character_id and habit_type == "NEGATIVE" else None


async def find_duplicate_automation(character_id: str, trigger_type: str, habit_id: str) -> Any | None:
    find_many = getattr(db.automationrule, "find_many", None)
    if not find_many:
        return None
    rules = await find_many(where={"characterId": character_id, "triggerType": trigger_type})
    for rule in rules:
        if any(action.get("habitId") == habit_id for action in json.loads(rule.actionsJson)):
            return rule
    return None


def proposal_validation_error(error: ValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "valid": False,
            "requiresConfirmation": False,
            "errors": [
                {"code": "invalid_proposal", "path": list(item["loc"]), "message": item["msg"]}
                for item in error.errors()
            ],
        },
    )


def serialize_rule(rule: Any) -> dict[str, Any]:
    return {
        "id": rule.id, "characterId": rule.characterId, "name": rule.name, "enabled": rule.enabled, "matchMode": getattr(rule, "matchMode", "all"),
        "triggerType": rule.triggerType, "conditions": json.loads(rule.conditionsJson), "actions": json.loads(rule.actionsJson),
        "cooldownSeconds": rule.cooldownSeconds, "lastTriggeredAt": rule.lastTriggeredAt,
        "createdAt": rule.createdAt, "updatedAt": rule.updatedAt,
    }


@router.get("")
async def list_automations(characterId: str, current_user: dict = Depends(get_current_automation_user)):
    await get_owned_character(characterId, current_user)
    rules = await db.automationrule.find_many(where={"characterId": characterId}, order={"createdAt": "desc"})
    return {"automations": [serialize_rule(rule) for rule in rules]}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_automation(payload: AutomationRuleCreate, current_user: dict = Depends(get_current_automation_user)):
    await get_owned_character(payload.characterId, current_user)
    await validate_actions(payload.characterId, payload.actions)
    duplicate = await find_duplicate_automation(payload.characterId, payload.triggerType, payload.actions[0].habitId)
    if duplicate:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"code": "duplicate_automation", "message": "An automation for this trigger and habit already exists."})
    rule = await db.automationrule.create(data={
        "characterId": payload.characterId, "name": payload.name, "enabled": payload.enabled, "triggerType": payload.triggerType,
        "matchMode": payload.matchMode, "conditionsJson": json.dumps([item.model_dump() for item in payload.conditions]),
        "actionsJson": json.dumps([item.model_dump() for item in payload.actions]), "cooldownSeconds": payload.cooldownSeconds,
    })
    return serialize_rule(rule)


# Static proposal routes intentionally precede /{rule_id} dynamic routes.
@router.get("/capabilities")
async def get_automation_capabilities(current_user: dict = Depends(get_current_automation_user)):
    return automation_capabilities()


@router.get("/eligible-habits")
async def get_eligible_habits(characterId: str, current_user: dict = Depends(get_current_automation_user)):
    await get_owned_character(characterId, current_user)
    habits = await db.habit.find_many(where={"characterId": characterId, "type": "NEGATIVE"})
    return {
        "characterId": characterId,
        "habits": [{"id": habit.id, "name": habit.name} for habit in habits],
    }


@router.post("/proposals/validate")
async def validate_automation_proposal(payload: dict[str, Any], current_user: dict = Depends(get_current_automation_user)):
    requested_version = payload.get("capabilityVersion")
    if requested_version and requested_version != AUTOMATION_CAPABILITY_VERSION:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"valid": False, "requiresConfirmation": False, "errors": [{"code": "unsupported_capability_version", "expected": AUTOMATION_CAPABILITY_VERSION}]},
        )
    payload = {key: value for key, value in payload.items() if key != "capabilityVersion"}
    try:
        proposal = AutomationRuleCreate.model_validate(payload)
    except ValidationError as error:
        return proposal_validation_error(error)

    await get_owned_character(proposal.characterId, current_user)
    target_habit = await get_eligible_negative_habit(proposal.characterId, proposal.actions[0].habitId)
    if not target_habit:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"valid": False, "requiresConfirmation": False, "errors": [{"code": "target_not_eligible"}]},
        )

    duplicate = await find_duplicate_automation(proposal.characterId, proposal.triggerType, proposal.actions[0].habitId)
    if duplicate:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"valid": False, "requiresConfirmation": False, "errors": [{"code": "duplicate_automation"}]},
        )

    normalized = proposal.model_dump(mode="json")
    return {
        "valid": True,
        "requiresConfirmation": proposal.triggerType not in {"phone_usage_observed", "drowsiness_observed", "posture_observed"},
        "normalizedProposal": normalized,
        "preview": {
            "targetHabit": {"id": target_habit.id, "name": target_habit.name},
            "execution": {
                "engine": "existing_phase5_deterministic_engine",
                "triggerType": proposal.triggerType,
                "matchMode": proposal.matchMode,
                "conditionCount": len(proposal.conditions),
                "cooldownSeconds": proposal.cooldownSeconds,
                "requiresFutureMatchingObservation": True,
            },
            "sideEffectsDuringValidation": False,
        },
        "warnings": [],
    }


async def get_owned_rule(rule_id: str, current_user: dict) -> Any:
    rule = await db.automationrule.find_unique(where={"id": rule_id})
    if not rule:
        raise HTTPException(status_code=404, detail="Automation not found")
    await get_owned_character(rule.characterId, current_user)
    return rule


@router.get("/{rule_id}")
async def get_automation(rule_id: str, current_user: dict = Depends(get_current_automation_user)):
    return serialize_rule(await get_owned_rule(rule_id, current_user))


@router.patch("/{rule_id}")
async def update_automation(rule_id: str, payload: AutomationRuleUpdate, current_user: dict = Depends(get_current_automation_user)):
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
async def delete_automation(rule_id: str, current_user: dict = Depends(get_current_automation_user)):
    rule = await get_owned_rule(rule_id, current_user)
    await db.automationrule.delete(where={"id": rule.id})


@router.post("/{rule_id}/test")
async def test_automation(rule_id: str, observation: AutomationTestObservation, current_user: dict = Depends(get_current_automation_user)):
    rule = await get_owned_rule(rule_id, current_user)
    view = {"event": {"type": observation.type, "source": observation.source, "timestamp": observation.timestamp}, "payload": observation.payload}
    return evaluate_conditions(json.loads(rule.conditionsJson), view)
