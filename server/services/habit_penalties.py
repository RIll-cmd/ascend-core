from typing import Any

TARGET_FIELDS = {
    "HP": ("character", "currentHp"),
    "EXP": ("character", "exp"),
    "VITALITY": ("stats", "endurance"),
    "DISCIPLINE": ("stats", "discipline"),
    "STRENGTH": ("stats", "strength"),
    "KNOWLEDGE": ("stats", "knowledge"),
    "FOCUS": ("stats", "focus"),
    "RECOVERY": ("stats", "recovery"),
    "CONSISTENCY": ("stats", "consistency"),
}


def normalize_penalty_target(target: str) -> str:
    normalized = target.strip().upper()
    if normalized not in TARGET_FIELDS:
        raise ValueError(f"Unsupported penalty target: {target}")
    return normalized


def validate_stat_modifier(modifier: int) -> int:
    if modifier < 1:
        raise ValueError("statModifier must be at least 1")
    return modifier


def calculate_penalty(target: str, modifier: int, character: Any, stats: Any) -> dict:
    target = normalize_penalty_target(target)
    modifier = validate_stat_modifier(modifier)
    owner, field = TARGET_FIELDS[target]
    record = character if owner == "character" else stats
    if record is None:
        raise ValueError(f"Missing record for penalty target {target}")
    previous = max(0, int(getattr(record, field, 0) or 0))
    new_value = max(0, previous - modifier)
    return {
        "storage": field,
        "previousValue": previous,
        "newValue": new_value,
        "amount": previous - new_value,
        "target": target,
    }
