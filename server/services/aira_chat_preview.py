"""Converts narrow chat tool candidates into typed AIRA preview input."""

from typing import Any


def normalize_chat_action_candidate(action_type: str, action_args: dict[str, Any]) -> dict[str, Any] | None:
    """Only validated candidate actions may cross from conversational tooling to Core preview."""
    if action_type == "create_habit":
        arguments = dict(action_args)
        if "primary_stat" in arguments:
            arguments["primaryStat"] = arguments.pop("primary_stat")
        return {"operation": "create_habit", "arguments": arguments}
    if action_type == "update_habit":
        arguments = dict(action_args)
        if "habit_id" in arguments:
            arguments["habitId"] = arguments.pop("habit_id")
        return {"operation": "update_habit", "arguments": arguments}
    if action_type == "archive_habit":
        return {"operation": "archive_habit", "arguments": {"habitId": action_args.get("habit_id")}}
    if action_type == "complete_daily_mission":
        return {"operation": "complete_mission", "arguments": {"missionId": action_args.get("mission_id")}}
    if action_type in ("create_automation", "create_automation_rule"):
        arguments = dict(action_args)
        if "trigger_type" in arguments:
            arguments["triggerType"] = arguments.pop("trigger_type")
        return {"operation": "create_automation", "arguments": arguments}
    if action_type in ("update_automation", "toggle_automation_rule"):
        arguments = dict(action_args)
        if "rule_id" in arguments:
            arguments["ruleId"] = arguments.pop("rule_id")
        return {"operation": "update_automation", "arguments": arguments}
    if action_type in ("delete_automation", "delete_automation_rule"):
        arguments = dict(action_args)
        rule_id = arguments.pop("rule_id", None) or arguments.get("ruleId")
        return {"operation": "delete_automation", "arguments": {"ruleId": rule_id}}
    if action_type in ("create_calendar_schedule", "add_calendar_schedule", "create_schedule"):
        arguments = dict(action_args)
        arguments.pop("character_id", None)
        arguments.pop("characterId", None)
        if "day_of_week" in arguments:
            arguments["dayOfWeek"] = arguments.pop("day_of_week")
        if "scheduled_at" in arguments:
            arguments["scheduledAt"] = arguments.pop("scheduled_at")
        if "schedule_type" in arguments:
            arguments["scheduleType"] = arguments.pop("schedule_type")
        if "end_time" in arguments:
            arguments["endTime"] = arguments.pop("end_time")
        return {"operation": "create_calendar_schedule", "arguments": arguments}
    if action_type == "create_calendar_schedule_multi":
        # Multi-day bundle: pass through as-is; execution will fan-out to individual schedules
        return {"operation": "create_calendar_schedule_multi", "arguments": dict(action_args)}
    if action_type in ("delete_calendar_schedule", "remove_schedule", "delete_schedule"):
        arguments = dict(action_args)
        schedule_id = arguments.pop("schedule_id", None) or arguments.get("scheduleId")
        return {"operation": "delete_calendar_schedule", "arguments": {"scheduleId": schedule_id}}
    return None
