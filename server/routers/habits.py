from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from db import db
from db_utils import ensure_character_exists
from auth_utils import get_current_user, get_current_user_optional, verify_character_ownership
from schemas.habit import HabitCreateSchema, HabitStatus, HabitStatusUpdateSchema, HabitUpdateSchema, HabitLogSchema, HabitType
from services.mission_generator import generate_daily_missions, recalculate_habit_strength
from services.boss_engine import deal_boss_damage
from services.habit_trigger_service import trigger_negative_habit

router = APIRouter(prefix="/api/habits", tags=["habits"])


@router.post("/{character_id}")
async def create_habit(character_id: str, payload: HabitCreateSchema, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Create a new Habit template along with 1:1 HabitSchedule, HabitMetrics, and 1:N HabitTier relations.
    Automatically ensures character exists in database (seeding fallback if necessary).
    """
    is_owner = await verify_character_ownership(character_id, current_user)
    if not is_owner:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this character.")

    character = await ensure_character_exists(character_id)

    schedule_data = {}
    if payload.schedule:
        schedule_data = {
            "daysOfWeek": payload.schedule.daysOfWeek,
            "timesPerWeek": payload.schedule.timesPerWeek,
            "timesPerMonth": payload.schedule.timesPerMonth,
            "startTime": payload.schedule.startTime,
            "endTime": payload.schedule.endTime,
            "timezone": payload.schedule.timezone,
        }

    tiers_data = []
    for t in payload.tiers:
        tiers_data.append({
            "tier": t.tier.value if hasattr(t.tier, "value") else str(t.tier),
            "targetType": t.targetType,
            "targetValue": t.targetValue,
            "targetUnit": t.targetUnit,
            "baseExp": t.baseExp,
            "baseGold": t.baseGold,
            "statReward": t.statReward,
        })

    habit = await db.habit.create(
        data={
            "characterId": character.id,
            "name": payload.name,
            "description": payload.description,
            "category": payload.category,
            "difficulty": payload.difficulty.value if hasattr(payload.difficulty, "value") else str(payload.difficulty),
            "primaryStat": payload.primaryStat,
            "scheduleType": payload.scheduleType.value if hasattr(payload.scheduleType, "value") else str(payload.scheduleType),
            "rrule": payload.rrule,
            "preferredTime": payload.preferredTime,
            "icon": payload.icon,
            "color": payload.color,
            "status": HabitStatus.ACTIVE.value,
            "type": payload.type.value,
            "affectedStat": payload.affectedStat.value,
            "statModifier": payload.statModifier,
            "schedule": {
                "create": schedule_data
            },
            "tiers": {
                "create": tiers_data
            },
            "metrics": {
                "create": {
                    "habitStrength": 100.0,
                    "successRate": 0.0,
                    "completionRate": 0.0,
                    "currentConsistency": 0.0,
                }
            },
        },
        include={
            "schedule": True,
            "metrics": True,
            "tiers": True,
        },
    )
    return habit


@router.get("/{character_id}")
async def get_habits(character_id: str):
    """
    Return all habit templates for the specified character ID.
    Automatically ensures character exists in database.
    """
    await ensure_character_exists(character_id)

    habits = await db.habit.find_many(
        where={"characterId": character_id},
        include={
            "schedule": True,
            "metrics": True,
            "tiers": True,
            "missions": True,
        },
    )
    return habits



@router.post("/{habit_id}/log")
async def log_habit(habit_id: str, payload: HabitLogSchema, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Directly log completion of a habit for today.
    Creates or updates today's Mission instance, updates streaks, grants character EXP/Gold/Stats,
    recalculates habit strength, updates calendar snapshots, and deals boss damage.
    """
    habit = await db.habit.find_unique(
        where={"id": habit_id},
        include={"tiers": True, "schedule": True, "metrics": True}
    )
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    is_owner = await verify_character_ownership(habit.characterId, current_user)
    if not is_owner:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this habit.")

    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    today_end = today_start + timedelta(days=1)

    completion_tier_str = payload.completionType.value if hasattr(payload.completionType, "value") else str(payload.completionType)
    
    # Calculate rewards from habit tiers or defaults
    tier_info = next((t for t in habit.tiers if t.tier == completion_tier_str), None)
    if not tier_info and habit.tiers:
        tier_info = next((t for t in habit.tiers if t.tier == "NORMAL"), habit.tiers[0])

    diff_mult = {"EASY": 1.0, "MEDIUM": 1.5, "HARD": 2.2}.get(habit.difficulty, 1.0)
    tier_mult = {"MINI": 0.5, "NORMAL": 1.0, "ELITE": 1.7}.get(completion_tier_str, 1.0)

    base_exp = tier_info.baseExp if tier_info and tier_info.baseExp > 0 else int(30 * diff_mult)
    base_gold = tier_info.baseGold if tier_info and tier_info.baseGold > 0 else int(10 * diff_mult)
    stat_reward = tier_info.statReward if tier_info and tier_info.statReward > 0 else int(2 * diff_mult)

    exp_earned = int(base_exp if tier_info and tier_info.baseExp > 0 else base_exp * tier_mult)
    gold_earned = int(base_gold if tier_info and tier_info.baseGold > 0 else base_gold * tier_mult)
    stats_earned = int(stat_reward if tier_info and tier_info.statReward > 0 else stat_reward * tier_mult)

    # Find or create today's mission
    mission = await db.mission.find_first(
        where={
            "habitId": habit_id,
            "characterId": habit.characterId,
            "date": {"gte": today_start, "lt": today_end},
        }
    )

    if mission:
        updated_mission = await db.mission.update(
            where={"id": mission.id},
            data={
                "status": "COMPLETED",
                "completionType": completion_tier_str,
                "expEarned": exp_earned,
                "statsEarned": stats_earned,
                "completedAt": now,
            }
        )
    else:
        updated_mission = await db.mission.create(
            data={
                "habitId": habit_id,
                "characterId": habit.characterId,
                "date": today_start,
                "status": "COMPLETED",
                "completionType": completion_tier_str,
                "expEarned": exp_earned,
                "statsEarned": stats_earned,
                "completedAt": now,
            }
        )

    # Check streak logic
    yesterday_start = today_start - timedelta(days=1)
    yesterday_mission = await db.mission.find_first(
        where={
            "habitId": habit_id,
            "characterId": habit.characterId,
            "status": "COMPLETED",
            "date": {"gte": yesterday_start, "lt": today_start},
        }
    )

    new_streak = habit.streak + 1 if (yesterday_mission or habit.streak == 0) else 1
    new_best = max(habit.bestStreak, new_streak)

    # Update habit streak in database
    await db.habit.update(
        where={"id": habit_id},
        data={"streak": new_streak, "bestStreak": new_best}
    )

    # Recalculate Habit Strength
    await recalculate_habit_strength(habit_id)

    # Grant character currencies & stats
    char = await ensure_character_exists(habit.characterId)
    await db.character.update(
        where={"id": habit.characterId},
        data={
            "exp": {"increment": exp_earned},
            "gold": {"increment": gold_earned},
        }
    )

    # Update primary stat in characterstats
    stat_name = (habit.primaryStat or "discipline").lower()
    allowed_stats = ["strength", "knowledge", "discipline", "focus", "endurance", "recovery", "consistency"]
    if stat_name in allowed_stats:
        try:
            await db.characterstats.upsert(
                where={"characterId": habit.characterId},
                data={
                    "create": {"characterId": habit.characterId, stat_name: 1 + stats_earned},
                    "update": {stat_name: {"increment": stats_earned}},
                }
            )
        except Exception as e:
            print(f"[habits.py] Stat increment error for {stat_name}: {e}")

    # Deal Boss Damage if linked
    try:
        await deal_boss_damage(
            db=db,
            character_id=habit.characterId,
            activity_type="HABIT",
            reference_id=habit.id
        )
    except Exception as e:
        print(f"[habits.py] Error dealing boss damage: {e}")

    # Elite bonus gems
    bonus_gems = 0
    if completion_tier_str in ["ELITE", "HARDCORE"]:
        bonus_gems = 1
        await db.character.update(
            where={"id": habit.characterId},
            data={"gems": {"increment": bonus_gems}}
        )

    # Snapshot update for Heatmap
    try:
        day_missions = await db.mission.find_many(
            where={
                "characterId": habit.characterId,
                "date": {"gte": today_start, "lt": today_end},
            }
        )
        total_m = len(day_missions)
        completed_m = len([m for m in day_missions if m.status == "COMPLETED"])
        rate = (completed_m / total_m * 100.0) if total_m > 0 else 0.0

        await db.dailycompletionsnapshot.upsert(
            where={"characterId_date": {"characterId": habit.characterId, "date": today_start}},
            data={
                "create": {
                    "characterId": habit.characterId,
                    "date": today_start,
                    "completedCount": completed_m,
                    "totalCount": total_m,
                    "completionRate": rate,
                },
                "update": {
                    "completedCount": completed_m,
                    "totalCount": total_m,
                    "completionRate": rate,
                }
            }
        )
    except Exception as e:
        print(f"[habits.py] Snapshot update error: {e}")

    # Fetch fresh habit with updated relations
    fresh_habit = await db.habit.find_unique(
        where={"id": habit_id},
        include={"schedule": True, "metrics": True, "tiers": True}
    )

    return {
        "success": True,
        "habit": fresh_habit,
        "mission": updated_mission,
        "rewards": {
            "exp": exp_earned,
            "gold": gold_earned,
            "stat": stats_earned,
            "statName": habit.primaryStat,
            "gems": bonus_gems,
            "streak": new_streak,
            "habitStrength": fresh_habit.metrics.habitStrength if fresh_habit and fresh_habit.metrics else 100.0,
        }
    }


@router.post("/{habit_id}/trigger")
async def trigger_habit(habit_id: str, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """Trigger a habit. Negative habits apply an immediate, clamped penalty."""
    habit = await db.habit.find_unique(where={"id": habit_id})
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    is_owner = await verify_character_ownership(habit.characterId, current_user)
    if not is_owner:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this habit.")

    habit_type = getattr(getattr(habit, "type", "POSITIVE"), "value", getattr(habit, "type", "POSITIVE"))
    if habit_type != HabitType.NEGATIVE.value:
        return await log_habit(habit_id, HabitLogSchema(), current_user)

    return await trigger_negative_habit(habit_id, habit.characterId)


@router.patch("/{habit_id}/status")
async def update_habit_status(habit_id: str, payload: HabitStatusUpdateSchema, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Update the status of a habit (e.g. PAUSED, ARCHIVED, DELETED).
    Handles setting pausedAt and archivedAt timestamps.
    """
    existing = await db.habit.find_unique(where={"id": habit_id})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    is_owner = await verify_character_ownership(existing.characterId, current_user)
    if not is_owner:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this habit.")

    update_data = {"status": payload.status.value}
    now = datetime.now(timezone.utc)

    if payload.status == HabitStatus.PAUSED:
        update_data["pausedAt"] = now
    elif payload.status == HabitStatus.ARCHIVED:
        update_data["archivedAt"] = now
    elif payload.status == HabitStatus.DELETED:
        update_data["pausedAt"] = None
        update_data["archivedAt"] = None
    elif payload.status == HabitStatus.ACTIVE:
        update_data["pausedAt"] = None
        update_data["archivedAt"] = None

    updated = await db.habit.update(
        where={"id": habit_id},
        data=update_data,
        include={
            "schedule": True,
            "metrics": True,
            "tiers": True,
        },
    )
    return updated


@router.put("/{habit_id}")
async def update_habit(habit_id: str, payload: HabitUpdateSchema, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Update habit details, schedule, target frequencies, and tiers.
    """
    existing = await db.habit.find_unique(where={"id": habit_id}, include={"schedule": True, "tiers": True})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    is_owner = await verify_character_ownership(existing.characterId, current_user)
    if not is_owner:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this habit.")

    habit_update_data = {}
    if payload.name is not None:
        habit_update_data["name"] = payload.name
    if payload.description is not None:
        habit_update_data["description"] = payload.description
    if payload.icon is not None:
        habit_update_data["icon"] = payload.icon
    if payload.color is not None:
        habit_update_data["color"] = payload.color
    if payload.category is not None:
        habit_update_data["category"] = payload.category
    if payload.difficulty is not None:
        habit_update_data["difficulty"] = payload.difficulty.value if hasattr(payload.difficulty, "value") else str(payload.difficulty)
    if payload.primaryStat is not None:
        habit_update_data["primaryStat"] = payload.primaryStat
    if payload.scheduleType is not None:
        habit_update_data["scheduleType"] = payload.scheduleType.value if hasattr(payload.scheduleType, "value") else str(payload.scheduleType)
    if payload.preferredTime is not None:
        habit_update_data["preferredTime"] = payload.preferredTime
    if payload.type is not None:
        habit_update_data["type"] = payload.type.value
    if payload.affectedStat is not None:
        habit_update_data["affectedStat"] = payload.affectedStat.value
    if payload.statModifier is not None:
        habit_update_data["statModifier"] = payload.statModifier

    if habit_update_data:
        await db.habit.update(where={"id": habit_id}, data=habit_update_data)

    # Schedule update
    if payload.schedule is not None:
        sched_data = {
            "daysOfWeek": payload.schedule.daysOfWeek,
            "timesPerWeek": payload.schedule.timesPerWeek,
            "timesPerMonth": payload.schedule.timesPerMonth,
            "startTime": payload.schedule.startTime,
            "endTime": payload.schedule.endTime,
            "timezone": payload.schedule.timezone,
        }
        if existing.schedule:
            await db.habitschedule.update(where={"habitId": habit_id}, data=sched_data)
        else:
            await db.habitschedule.create(data={"habitId": habit_id, **sched_data})

    # Tiers update
    if payload.tiers is not None:
        for t in payload.tiers:
            tier_val = t.tier.value if hasattr(t.tier, "value") else str(t.tier)
            tier_data = {
                "targetType": t.targetType,
                "targetValue": t.targetValue,
                "targetUnit": t.targetUnit,
                "baseExp": t.baseExp,
                "baseGold": t.baseGold,
                "statReward": t.statReward,
            }
            await db.habittier.upsert(
                where={"habitId_tier": {"habitId": habit_id, "tier": tier_val}},
                data={
                    "create": {"habitId": habit_id, "tier": tier_val, **tier_data},
                    "update": tier_data,
                }
            )

    return await db.habit.find_unique(
        where={"id": habit_id},
        include={"schedule": True, "metrics": True, "tiers": True}
    )


@router.post("/{character_id}/generate-missions")
async def trigger_mission_generation(character_id: str):
    """
    Triggers the daily mission generator for the given character.
    Should be called when the user visits the dashboard to ensure today's missions exist.
    """
    await ensure_character_exists(character_id)
    now = datetime.now(timezone.utc)
    missions_created = await generate_daily_missions(character_id, now)
    return {"status": "success", "missions_created": missions_created}


@router.post("/{character_id}/decay/simulate")
async def trigger_decay_simulation(character_id: str):
    """
    Manually triggers midnight decay simulation for dev/testing.
    Evaluates uncompleted habits, applies adaptive decay, checks streak shields, and logs heatmap snapshots.
    """
    from services.decay_service import process_midnight_decay
    await ensure_character_exists(character_id)
    result = await process_midnight_decay(db, character_id, is_simulation=True)
    return result


@router.get("/{character_id}/calendar-snapshots")
async def get_calendar_snapshots(character_id: str):
    """
    Returns 365-day historical DailyCompletionSnapshot records for calendar heatmap visualization.
    """
    await ensure_character_exists(character_id)
    
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=365)
    
    missions = await db.mission.find_many(
        where={
            "characterId": character_id,
            "date": {"gte": start_date}
        }
    )
    
    heatmap_data = {}
    for m in missions:
        d_str = m.date.strftime("%Y-%m-%d") if hasattr(m.date, 'strftime') else str(m.date)[:10]
        if d_str not in heatmap_data:
            heatmap_data[d_str] = {"totalCount": 0, "completedCount": 0}
        
        heatmap_data[d_str]["totalCount"] += 1
        if m.status == "COMPLETED":
            heatmap_data[d_str]["completedCount"] += 1
            
    snapshots = []
    for date_str, stats in heatmap_data.items():
        total = stats["totalCount"]
        completed = stats["completedCount"]
        rate = (completed / total * 100) if total > 0 else 0
        snapshots.append({
            "id": f"snap-{date_str}",
            "date": date_str,
            "totalCount": total,
            "completedCount": completed,
            "completionRate": rate
        })
        
    return {"snapshots": snapshots}


@router.post("/{character_id}/buy-streak-freeze")
async def buy_streak_freeze(character_id: str, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Purchases 1 Streak Freeze Shield for 300 Gold or 15 Gems (up to max 3 shields).
    """
    is_owner = await verify_character_ownership(character_id, current_user)
    if not is_owner:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this character.")

    char = await ensure_character_exists(character_id)
    if char.streakFreezes >= 3:
        raise HTTPException(status_code=400, detail="Maximum Streak Freeze Shields (3) already in inventory.")


    if char.gold < 300:
        raise HTTPException(status_code=400, detail="Insufficient Gold. Streak Freeze costs 300 Gold.")

    updated = await db.character.update(
        where={"id": character_id},
        data={
            "gold": char.gold - 300,
            "streakFreezes": char.streakFreezes + 1
        }
    )

    await db.progresshistory.create(
        data={
            "characterId": character_id,
            "type": "ITEM_PURCHASE",
            "amount": -300,
            "description": f"Purchased 1 Streak Freeze Shield 🛡️. Total active shields: {updated.streakFreezes}"
        }
    )

    return {
        "message": f"Successfully purchased Streak Freeze Shield 🛡️! Total active shields: {updated.streakFreezes}",
        "streakFreezes": updated.streakFreezes,
        "gold": updated.gold
    }
