from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


_FIELD_VALUES = {
    "event.type": ("event", "type"),
    "event.source": ("event", "source"),
    "event.timestamp": ("event", "timestamp"),
    "payload.confidence": ("payload", "confidence"),
    "payload.posture": ("payload", "posture"),
    "payload.state": ("payload", "state"),
    "payload.detector": ("payload", "detector"),
}


def _condition_matches(actual: Any, operator: str, expected: Any) -> bool:
    if operator == "equals":
        return actual == expected
    if operator == "not_equals":
        return actual != expected
    if operator in {"greater_than", "greater_than_or_equal", "less_than", "less_than_or_equal"}:
        if isinstance(actual, bool) or isinstance(expected, bool) or not isinstance(actual, (int, float)) or not isinstance(expected, (int, float)):
            return False
        return {
            "greater_than": actual > expected,
            "greater_than_or_equal": actual >= expected,
            "less_than": actual < expected,
            "less_than_or_equal": actual <= expected,
        }[operator]
    if operator == "contains":
        return isinstance(actual, str) and isinstance(expected, str) and expected in actual
    return False


def _local_time(timestamp: str, timezone_name: str) -> datetime:
    moment = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    try:
        return moment.astimezone(ZoneInfo(timezone_name))
    except ZoneInfoNotFoundError:
        return moment.astimezone(timezone.utc)


def _time_window_matches(timestamp: str, timezone_name: str, start: str, end: str) -> bool:
    current = _local_time(timestamp, timezone_name).time()
    start_time = datetime.strptime(start, "%H:%M").time()
    end_time = datetime.strptime(end, "%H:%M").time()
    return start_time <= current <= end_time if start_time <= end_time else current >= start_time or current <= end_time


def evaluate_conditions(conditions: list[Any], observation_view: dict[str, dict[str, Any]], *, match_mode: str = "all", character_timezone: str = "UTC", occurrence_count: int | None = None, occurrence_counts: dict[int, int] | None = None) -> dict[str, Any]:
    results = []
    for index, condition in enumerate(conditions):
        data = condition.model_dump() if hasattr(condition, "model_dump") else condition
        condition_type = data.get("type")
        if condition_type == "time_window":
            matched = _time_window_matches(observation_view["event"]["timestamp"], character_timezone, data["start"], data["end"])
            results.append({"matched": matched, **({} if matched else {"reason": "time_window_not_met"})})
        elif condition_type == "occurrence_count":
            actual = (occurrence_counts or {}).get(index, occurrence_count or 0)
            matched = actual >= data["count"]
            results.append({"matched": matched, **({} if matched else {"reason": "occurrence_threshold_not_met"})})
        else:
            namespace, key = _FIELD_VALUES[data["field"]]
            results.append({"matched": _condition_matches(observation_view[namespace].get(key), data["operator"], data["value"])})
    matched = all(result["matched"] for result in results) if match_mode == "all" else any(result["matched"] for result in results)
    failed = next((result for result in results if not result["matched"]), None)
    response = {"matched": matched, "conditions": results}
    if not matched and failed and "reason" in failed:
        response["reason"] = failed["reason"]
    return response


def get_db():
    from db import db

    return db


def observation_view(observation: Any) -> dict[str, dict[str, Any]]:
    payload = json.loads(observation.payloadJson)
    return {
        "event": {"type": observation.eventType, "source": observation.source, "timestamp": observation.observedAt.isoformat() if hasattr(observation.observedAt, "isoformat") else str(observation.observedAt)},
        "payload": {key: payload.get(key) for key in ("confidence", "posture", "state", "detector")},
    }


async def _claim_execution(database: Any, rule: Any, observation: Any) -> tuple[Any | None, str | None]:
    try:
        execution = await database.automationexecution.create(
            data={"ruleId": rule.id, "characterId": rule.characterId, "observationId": observation.id, "status": "PENDING", "resultJson": "{}"}
        )
    except Exception as error:
        if error.__class__.__name__ == "UniqueViolationError":
            return None, "duplicate_observation"
        raise
    if rule.cooldownSeconds:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(seconds=rule.cooldownSeconds)
        claimed = await database.automationrule.update_many(
            where={"id": rule.id, "OR": [{"lastTriggeredAt": None}, {"lastTriggeredAt": {"lt": cutoff}}]},
            data={"lastTriggeredAt": now},
        )
        if not claimed:
            await database.automationexecution.update(
                where={"id": execution.id},
                data={"status": "SKIPPED_COOLDOWN", "resultJson": json.dumps({"reason": "cooldown_active"}, separators=(",", ":"))},
            )
            return None, "cooldown_active"
    return execution, None


async def _execute_rule(database: Any, rule: Any, observation: Any) -> dict[str, Any]:
    execution, skip_reason = await _claim_execution(database, rule, observation)
    if not execution:
        status = "SKIPPED_COOLDOWN" if skip_reason == "cooldown_active" else "SKIPPED_DUPLICATE"
        return {"ruleId": rule.id, "status": status, "reason": skip_reason}
    try:
        from services.habit_trigger_service import trigger_negative_habit

        actions = json.loads(rule.actionsJson)
        action = actions[0]
        result = await trigger_negative_habit(action["habitId"], rule.characterId)
        await database.automationexecution.update(
            where={"id": execution.id}, data={"status": "SUCCEEDED", "resultJson": json.dumps({"action": action["type"], "habitId": action["habitId"]})}
        )
        return {"ruleId": rule.id, "status": "SUCCEEDED", "result": result}
    except Exception as error:
        await database.automationexecution.update(
            where={"id": execution.id},
            data={"status": "FAILED", "resultJson": json.dumps({"reason": "action_failed"}, separators=(",", ":"))},
        )
        return {"ruleId": rule.id, "status": "FAILED", "reason": "action_failed"}


async def evaluate_observation(observation: Any) -> list[dict[str, Any]]:
    database = get_db()
    rules = await database.automationrule.find_many(
        where={"characterId": observation.characterId, "triggerType": observation.eventType, "enabled": True}
    )
    if not rules:
        return []
    view = observation_view(observation)
    character = await database.character.find_unique(where={"id": observation.characterId})
    character_timezone = getattr(character, "timezone", None) or "UTC"
    outcomes = []
    for rule in rules:
        conditions = json.loads(rule.conditionsJson)
        occurrence_counts = {}
        for index, condition in enumerate(conditions):
            if condition.get("type") == "occurrence_count":
                cutoff = observation.observedAt - timedelta(seconds=condition["windowSeconds"])
                occurrence_counts[index] = 1 + await database.integrationobservation.count(where={"characterId": observation.characterId, "eventType": observation.eventType, "observedAt": {"gte": cutoff, "lt": observation.observedAt}})
        condition_result = evaluate_conditions(conditions, view, match_mode=getattr(rule, "matchMode", "all"), character_timezone=character_timezone, occurrence_counts=occurrence_counts)
        if not condition_result["matched"]:
            outcomes.append({"ruleId": rule.id, "status": "NOT_MATCHED", **condition_result})
            continue
        outcomes.append(await _execute_rule(database, rule, observation))
    return outcomes
