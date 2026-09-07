from datetime import datetime, timezone

from fastapi import HTTPException, status

from schemas.habit import HabitType
from services.habit_penalties import calculate_penalty


def get_db():
    from db import db

    return db


async def trigger_negative_habit(habit_id: str, character_id: str) -> dict:
    """Apply the canonical penalty and relapse log for one owned negative habit."""
    db = get_db()
    habit = await db.habit.find_unique(where={"id": habit_id})
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    if habit.characterId != character_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Habit does not belong to character")

    habit_type = getattr(getattr(habit, "type", "POSITIVE"), "value", getattr(habit, "type", "POSITIVE"))
    if habit_type != HabitType.NEGATIVE.value:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Habit must be negative")

    character = await db.character.find_unique(where={"id": character_id}, include={"stats": True})
    if not character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")

    stats = getattr(character, "stats", None)
    penalty = calculate_penalty(
        getattr(habit, "affectedStat", "HP"),
        getattr(habit, "statModifier", 10),
        character,
        stats,
    )
    now = datetime.now(timezone.utc)
    if penalty["storage"] in {"currentHp", "exp"}:
        await db.character.update(where={"id": character.id}, data={penalty["storage"]: penalty["newValue"]})
    elif stats:
        await db.characterstats.update(where={"characterId": character.id}, data={penalty["storage"]: penalty["newValue"]})
    else:
        await db.characterstats.create(data={"characterId": character.id, penalty["storage"]: penalty["newValue"]})

    updated_habit = await db.habit.update(
        where={"id": habit_id},
        data={"relapseCount": {"increment": 1}, "streakDays": 0, "lastTriggeredAt": now},
    )
    await db.habitrelapselog.create(
        data={
            "habitId": habit_id,
            "characterId": character.id,
            "affectedStat": penalty["target"],
            "requestedAmount": getattr(habit, "statModifier", 10),
            "actualAmount": penalty["amount"],
            "previousValue": penalty["previousValue"],
            "newValue": penalty["newValue"],
        },
    )
    updated_character = await db.character.find_unique(where={"id": character.id}, include={"stats": True})
    return {
        "success": True,
        "habit": updated_habit,
        "character": updated_character,
        "stats": getattr(updated_character, "stats", None),
        "penalty": penalty,
    }
