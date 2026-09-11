"""Initial AIRA write adapters that reuse existing Core domain handlers."""

from typing import Any

from fastapi import HTTPException, status

from schemas.habit import HabitCreateSchema, HabitStatusUpdateSchema, HabitUpdateSchema, MissionCompleteSchema
from schemas.automation import AutomationRuleCreate


async def create_habit(character_id: str, payload: HabitCreateSchema, current_user: dict[str, Any]) -> Any:
    from routers.habits import create_habit as handler

    return await handler(character_id, payload, current_user)


async def update_habit(habit_id: str, payload: HabitUpdateSchema, current_user: dict[str, Any]) -> Any:
    from routers.habits import update_habit as handler

    return await handler(habit_id, payload, current_user)


async def update_habit_status(habit_id: str, payload: HabitStatusUpdateSchema, current_user: dict[str, Any]) -> Any:
    from routers.habits import update_habit_status as handler

    return await handler(habit_id, payload, current_user)


async def complete_mission(mission_id: str, payload: MissionCompleteSchema) -> Any:
    from routers.missions import complete_mission as handler

    return await handler(mission_id, payload)


async def get_mission_for_adapter(mission_id: str) -> Any:
    from db import db

    return await db.mission.find_unique(where={"id": mission_id})


async def get_automation_for_adapter(rule_id: str) -> Any:
    from db import db

    return await db.automationrule.find_unique(where={"id": rule_id})


async def create_automation(payload: AutomationRuleCreate, current_user: dict[str, Any]) -> Any:
    from routers.automations import create_automation as handler

    return await handler(payload, current_user)


async def update_automation(rule_id: str, payload: Any, current_user: dict[str, Any]) -> Any:
    from routers.automations import update_automation as handler

    return await handler(rule_id, payload, current_user)


async def delete_automation(rule_id: str, current_user: dict[str, Any]) -> Any:
    from routers.automations import delete_automation as handler

    return await handler(rule_id, current_user)


async def log_workout(character_id: str, arguments: dict[str, Any], current_user: dict[str, Any]) -> Any:
    from routers.workouts import WorkoutLogInput, log_workout as handler

    return await handler(WorkoutLogInput.model_validate({"characterId": character_id, **arguments}), current_user)


async def equip_item(player_item_id: str, current_user: dict[str, Any]) -> Any:
    from routers.inventory import equip_item as handler

    return await handler(player_item_id, current_user)


async def execute_aira_domain_operation(
    operation: str,
    character_id: str,
    arguments: dict[str, Any],
    current_user: dict[str, Any],
) -> dict[str, Any]:
    """Delegate validated arguments to existing handlers; never issue raw ORM writes."""
    if operation == "create_habit":
        try:
            habit = await create_habit(character_id, HabitCreateSchema.model_validate(arguments), current_user)
        except Exception as error:
            err_name = error.__class__.__name__
            err_msg = str(error).lower()
            if err_name == "UniqueViolationError" or "unique constraint" in err_msg or "already exists" in err_msg or "duplicate key" in err_msg or "p2002" in err_msg:
                habit_name = arguments.get("name", "Habit")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"An active habit named '{habit_name}' already exists for this character.",
                ) from error
            raise
        result = {
            "habitId": habit.id,
            "name": habit.name,
            "canonicalNarration": f"Protocol locked: '{habit.name}' successfully registered to daily routines.",
        }
        if getattr(habit, "category", None):
            result["category"] = habit.category
        if getattr(habit, "primaryStat", None):
            result["primaryStat"] = habit.primaryStat
        return result

    if operation == "update_habit":
        habit_id = arguments["habitId"]
        payload = HabitUpdateSchema.model_validate({key: value for key, value in arguments.items() if key != "habitId"})
        habit = await update_habit(habit_id, payload, current_user)
        return {"habitId": habit.id, "name": habit.name}

    if operation == "archive_habit":
        habit = await update_habit_status(
            arguments["habitId"], HabitStatusUpdateSchema.model_validate({"status": arguments["status"]}), current_user
        )
        return {"habitId": habit.id, "status": habit.status}

    if operation == "complete_mission":
        mission_id = arguments["missionId"]
        mission = await get_mission_for_adapter(mission_id)
        if not mission or mission.characterId != character_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mission does not belong to this character.")
        completed = await complete_mission(
            mission_id,
            MissionCompleteSchema.model_validate({key: value for key, value in arguments.items() if key != "missionId"}),
        )
        return {"missionId": completed.id, "status": completed.status}

    if operation == "create_automation":
        rule = await create_automation(
            AutomationRuleCreate.model_validate({"characterId": character_id, **arguments}), current_user
        )
        return {"automationId": rule["id"], "name": rule["name"]}

    if operation == "update_automation":
        from schemas.automation import AutomationRuleUpdate
        rule_id = arguments["ruleId"]
        rule = await get_automation_for_adapter(rule_id)
        if not rule or getattr(rule, "characterId", None) != character_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation rule does not belong to this character.")
        payload_data = {key: value for key, value in arguments.items() if key != "ruleId"}
        updated = await update_automation(rule_id, AutomationRuleUpdate.model_validate(payload_data), current_user)
        return {"automationId": updated["id"], "name": updated["name"], "enabled": updated["enabled"]}

    if operation == "delete_automation":
        rule_id = arguments["ruleId"]
        rule = await get_automation_for_adapter(rule_id)
        if not rule or getattr(rule, "characterId", None) != character_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation rule does not belong to this character.")
        await delete_automation(rule_id, current_user)
        return {"automationId": rule_id, "deleted": True}

    if operation == "log_workout":
        return await log_workout(character_id, arguments, current_user)

    if operation == "equip_item":
        item = await equip_item(arguments["playerItemId"], current_user)
        return {"message": item.message}

    if operation == "create_calendar_schedule":
        from services.calendar_schedule_store import get_calendar_schedule_store

        store = get_calendar_schedule_store()
        normalized = {
            "characterId": character_id,
            "title": arguments.get("title"),
            "time": arguments.get("time"),
            "endTime": arguments.get("endTime") or arguments.get("end_time"),
            "scheduleType": arguments.get("scheduleType") or arguments.get("schedule_type", "WEEKLY"),
            "dayOfWeek": arguments.get("dayOfWeek") if "dayOfWeek" in arguments else arguments.get("day_of_week"),
            "scheduledAt": arguments.get("scheduledAt") if "scheduledAt" in arguments else arguments.get("scheduled_at"),
        }
        created = store.create_schedule(normalized)
        return {
            "scheduleId": created["id"],
            "title": created["title"],
            "time": created["time"],
            "endTime": created.get("endTime"),
            "scheduleType": created["scheduleType"],
        }

    if operation == "delete_calendar_schedule":
        from services.calendar_schedule_store import get_calendar_schedule_store

        store = get_calendar_schedule_store()
        schedule_id = arguments["scheduleId"]
        existing = store.get_schedule(schedule_id)
        if not existing or existing.get("characterId") != character_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Calendar schedule does not belong to this character.",
            )
        store.delete_schedule(schedule_id)
        return {"scheduleId": schedule_id, "deleted": True}

    if operation == "create_calendar_schedule_multi":
        from services.calendar_schedule_store import get_calendar_schedule_store

        store = get_calendar_schedule_store()
        schedules_raw = arguments.get("schedules", [])
        created = []
        for entry in schedules_raw:
            # Normalize snake_case → camelCase field names from Gemini tool args
            normalized: dict[str, Any] = {
                "characterId": character_id,
                "title": entry.get("title", arguments.get("title", "Schedule")),
                "time": entry.get("time", arguments.get("time", "09:00")),
                "endTime": entry.get("endTime") or entry.get("end_time") or arguments.get("endTime") or arguments.get("end_time"),
                "scheduleType": entry.get("schedule_type", entry.get("scheduleType", "WEEKLY")),
                "dayOfWeek": entry.get("day_of_week", entry.get("dayOfWeek")),
                "scheduledAt": entry.get("scheduled_at", entry.get("scheduledAt")),
            }
            result = store.create_schedule(normalized)
            created.append({
                "scheduleId": result["id"],
                "title": result["title"],
                "time": result["time"],
                "endTime": result.get("endTime"),
                "scheduleType": result["scheduleType"],
                "dayOfWeek": result["dayOfWeek"],
            })
        return {"created": created, "count": len(created)}

    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=f"Unsupported AIRA operation: {operation}.")
