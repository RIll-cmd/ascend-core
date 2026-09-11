from typing import Dict, Any, List, Optional
import asyncio
import concurrent.futures
from datetime import datetime, timezone, timedelta
from db import db, ensure_db_connected
from db_utils import ensure_character_exists

def _run_sync(coro):
    """Safely runs an async coroutine synchronously inside any event loop context."""
    try:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                return pool.submit(asyncio.run, coro).result(timeout=10)
        elif loop:
            return loop.run_until_complete(coro)
        else:
            return asyncio.run(coro)
    except Exception as e:
        print(f"[AIRA Tool Sync Runner Warning]: {e}")
        return {}


# ==========================================
# 01. DASHBOARD & PROFILE READS
# ==========================================

async def _async_get_character_stats(character_id: str) -> Dict[str, Any]:
    try:
        await ensure_db_connected()
        character = await ensure_character_exists(character_id)
        if not character:
            return {"name": "Master", "level": 1, "power": 50, "stats": {"strength": 1, "knowledge": 1, "recovery": 1, "focus": 1, "discipline": 1, "endurance": 1, "consistency": 1}}
            
        stats_data = character.stats.model_dump() if character.stats and hasattr(character.stats, "model_dump") else (character.stats if character.stats else {})
        return {
            "name": getattr(character, "name", "Master"),
            "level": getattr(character, "level", 1),
            "power": getattr(character, "power", 50),
            "rank": getattr(character, "rank", "F"),
            "gold": getattr(character, "gold", 0),
            "gems": getattr(character, "gems", 0),
            "availableSP": getattr(character, "availableSP", 0),
            "highestTowerFloor": getattr(character, "highestTowerFloor", 0),
            "stats": stats_data
        }
    except Exception as e:
        print(f"[AIRA Tool get_character_stats Warning]: {e}")
        return {"name": "Master", "level": 1, "power": 50, "stats": {"strength": 1, "knowledge": 1, "recovery": 1, "focus": 1, "discipline": 1, "endurance": 1, "consistency": 1}}

def get_character_stats(character_id: str) -> Dict[str, Any]:
    """
    Fetches the core RPG stats, level, rank, and power of the character.
    Use this to answer questions about attributes, leveling, or currency.
    """
    return _run_sync(_async_get_character_stats(character_id))


async def _async_get_dashboard_summary(character_id: str) -> Dict[str, Any]:
    try:
        await ensure_db_connected()
        character = await ensure_character_exists(character_id)

        # Missions today
        missions = await db.mission.find_many(where={"characterId": character_id})
        total_missions = len(missions) if missions else 0
        completed_missions = sum(1 for m in missions if m.status == "COMPLETED") if missions else 0

        # Active habits count
        active_habits = await db.habit.count(where={"characterId": character_id, "status": "ACTIVE"})

        # Recent snapshot
        snapshot = await db.dailycompletionsnapshot.find_first(
            where={"characterId": character_id},
            order={"date": "desc"}
        )

        return {
            "character_name": getattr(character, "name", "Master"),
            "level": getattr(character, "level", 1),
            "power": getattr(character, "power", 50),
            "rank": getattr(character, "rank", "F"),
            "active_habits_count": active_habits,
            "missions_today": {
                "total": total_missions,
                "completed": completed_missions,
                "completion_rate": round((completed_missions / total_missions * 100), 1) if total_missions > 0 else 0.0
            },
            "recent_completion_rate": snapshot.completionRate if snapshot else 0.0,
            "daily_steps": getattr(character, "dailySteps", 0),
            "step_goal": getattr(character, "dailyStepGoal", 10000)
        }
    except Exception as e:
        print(f"[AIRA Tool get_dashboard_summary Warning]: {e}")
        return {"error": str(e)}

def get_dashboard_summary(character_id: str) -> Dict[str, Any]:
    """
    Provides a comprehensive overview of the character's daily performance, mission completion,
    habits count, daily steps, and overall power score.
    """
    return _run_sync(_async_get_dashboard_summary(character_id))


# ==========================================
# 02. MISSIONS & 03. HABITS READS
# ==========================================

async def _async_get_today_missions(character_id: str) -> List[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        missions = await db.mission.find_many(
            where={"characterId": character_id}
        )
        result = []
        for m in (missions or []):
            result.append({
                "id": m.id,
                "title": getattr(m, "title", "Mission"),
                "description": getattr(m, "description", ""),
                "status": getattr(m, "status", "PENDING"),
                "expReward": getattr(m, "expReward", 0),
                "statReward": getattr(m, "statReward", 0),
                "statType": getattr(m, "statType", "strength"),
                "completionType": getattr(m, "completionType", None)
            })
        return result
    except Exception as e:
        print(f"[AIRA Tool get_today_missions Warning]: {e}")
        return []

def get_today_missions(character_id: str) -> List[Dict[str, Any]]:
    """
    Fetches the user's missions for today and their completion status.
    Use this when the user asks about daily tasks or pending missions.
    """
    return _run_sync(_async_get_today_missions(character_id)) or []


async def _async_get_habits_overview(character_id: str) -> List[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        habits = await db.habit.find_many(
            where={"characterId": character_id},
            include={"metrics": True, "tiers": True}
        )
        result = []
        for h in (habits or []):
            result.append({
                "id": h.id,
                "name": h.name,
                "category": h.category,
                "difficulty": h.difficulty,
                "primaryStat": h.primaryStat,
                "status": h.status,
                "type": h.type,
                "streak": h.streak,
                "bestStreak": h.bestStreak,
                "relapseCount": h.relapseCount,
                "habitStrength": h.metrics.habitStrength if h.metrics else 100.0,
                "successRate": h.metrics.successRate if h.metrics else 0.0
            })
        return result
    except Exception as e:
        print(f"[AIRA Tool get_habits_overview Warning]: {e}")
        return []

def get_habits_overview(character_id: str) -> List[Dict[str, Any]]:
    """
    Fetches all habits tracked by the player, including category, difficulty, current streak,
    positive/negative habit type, and habit strength.
    """
    return _run_sync(_async_get_habits_overview(character_id)) or []


# ==========================================
# 04. CALENDAR READS
# ==========================================

async def _async_get_calendar_history(character_id: str, days: int = 7) -> List[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        snapshots = await db.dailycompletionsnapshot.find_many(
            where={"characterId": character_id},
            order={"date": "desc"},
            take=days
        )
        return [
            {
                "date": s.date.strftime("%Y-%m-%d"),
                "completedCount": s.completedCount,
                "totalCount": s.totalCount,
                "completionRate": s.completionRate
            }
            for s in (snapshots or [])
        ]
    except Exception as e:
        print(f"[AIRA Tool get_calendar_history Warning]: {e}")
        return []

def get_calendar_history(character_id: str, days: int = 7) -> List[Dict[str, Any]]:
    """
    Fetches historical habit completion rates and daily consistency snapshots over recent days.
    """
    return _run_sync(_async_get_calendar_history(character_id, days)) or []


# ==========================================
# 06. WORKOUTS & 07. RECOVERY READS
# ==========================================

async def _async_get_workout_history(character_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        sessions = await db.workoutsession.find_many(
            where={"characterId": character_id},
            include={
                "sets": {
                    "include": {"exercise": True}
                }
            },
            order={"date": "desc"},
            take=limit
        )
        result = []
        for s in (sessions or []):
            sets_data = []
            for item in (s.sets or []):
                sets_data.append({
                    "exercise": item.exercise.name if item.exercise else "Exercise",
                    "primaryMuscle": item.exercise.primaryMuscle if item.exercise else "FULL_BODY",
                    "weight": item.weight,
                    "reps": item.reps,
                    "isPr": item.isPr
                })
            result.append({
                "sessionId": s.id,
                "date": s.date.strftime("%Y-%m-%d %H:%M"),
                "durationSeconds": s.durationSeconds,
                "totalSets": len(sets_data),
                "sets": sets_data
            })
        return result
    except Exception as e:
        print(f"[AIRA Tool get_workout_history Warning]: {e}")
        return []

def get_workout_history(character_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Fetches the character's recent workout sessions, completed sets, reps, exercises, and PRs.
    """
    return _run_sync(_async_get_workout_history(character_id, limit)) or []


async def _async_get_muscle_recovery(character_id: str) -> List[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        recovery_states = await db.musclerecoverystate.find_many(
            where={"characterId": character_id}
        )
        now = datetime.now(timezone.utc)
        result = []
        for r in (recovery_states or []):
            last_trained = r.lastTrainedAt if r.lastTrainedAt.tzinfo else r.lastTrainedAt.replace(tzinfo=timezone.utc)
            elapsed_hours = (now - last_trained).total_seconds() / 3600.0
            recovery_ratio = min(1.0, elapsed_hours / r.fullRecoveryHours) if r.fullRecoveryHours > 0 else 1.0
            current_fatigue = max(0.0, r.initialFatigue * (1.0 - recovery_ratio))
            hours_remaining = max(0.0, r.fullRecoveryHours - elapsed_hours)

            result.append({
                "muscleGroup": r.muscleGroup,
                "currentFatigue": round(current_fatigue, 1),
                "isRecovered": current_fatigue < 10.0,
                "hoursRemaining": round(hours_remaining, 1)
            })
        return result
    except Exception as e:
        print(f"[AIRA Tool get_muscle_recovery Warning]: {e}")
        return []

def get_muscle_recovery(character_id: str) -> List[Dict[str, Any]]:
    """
    Calculates current fatigue and hours until full recovery for each trained muscle group.
    """
    return _run_sync(_async_get_muscle_recovery(character_id)) or []


# ==========================================
# 09. SKILLS & PROGRESSION READS
# ==========================================

async def _async_get_skills_tree(character_id: str) -> Dict[str, Any]:
    try:
        await ensure_db_connected()
        character = await db.character.find_unique(
            where={"id": character_id},
            include={"specialization": True}
        )
        player_skills = await db.playerskill.find_many(
            where={"characterId": character_id},
            include={"skillDefinition": True}
        )
        skills_unlocked = []
        for ps in (player_skills or []):
            if ps.skillDefinition:
                skills_unlocked.append({
                    "id": ps.skillDefinition.id,
                    "name": ps.skillDefinition.name,
                    "tier": ps.skillDefinition.tier,
                    "skillType": ps.skillDefinition.skillType,
                    "currentLevel": ps.currentLevel,
                    "maxLevel": ps.skillDefinition.maxLevel,
                    "elementPath": ps.skillDefinition.elementPath
                })

        return {
            "specialization": character.specialization.name if (character and character.specialization) else "Novice",
            "availableSP": getattr(character, "availableSP", 0) if character else 0,
            "unlocked_skills": skills_unlocked
        }
    except Exception as e:
        print(f"[AIRA Tool get_skills_tree Warning]: {e}")
        return {"specialization": "Novice", "availableSP": 0, "unlocked_skills": []}

def get_skills_tree(character_id: str) -> Dict[str, Any]:
    """
    Fetches the player's class specialization, unlocked skills, current skill levels, and available Skill Points (SP).
    """
    return _run_sync(_async_get_skills_tree(character_id))


# ==========================================
# 10. TOWER & 11. BOSSES & 12. BOSS PR READS
# ==========================================

async def _async_get_tower_status(character_id: str) -> Dict[str, Any]:
    try:
        await ensure_db_connected()
        character = await db.character.find_unique(where={"id": character_id})
        highest_floor = getattr(character, "highestTowerFloor", 0) if character else 0
        
        next_floor = await db.towerfloor.find_unique(
            where={"floorNumber": highest_floor + 1},
            include={"enemy": True}
        )
        return {
            "highestClearedFloor": highest_floor,
            "nextFloor": {
                "floorNumber": highest_floor + 1,
                "requiredPower": next_floor.requiredPower if next_floor else (highest_floor + 1) * 100,
                "requiredStrength": next_floor.requiredStrength if next_floor else 10,
                "requiredKnowledge": next_floor.requiredKnowledge if next_floor else 10,
                "requiredEndurance": next_floor.requiredEndurance if next_floor else 10,
                "enemyName": next_floor.enemy.name if (next_floor and next_floor.enemy) else "Guardian",
                "isBoss": next_floor.isBoss if next_floor else False
            } if next_floor else None
        }
    except Exception as e:
        print(f"[AIRA Tool get_tower_status Warning]: {e}")
        return {"highestClearedFloor": 0, "nextFloor": None}

def get_tower_status(character_id: str) -> Dict[str, Any]:
    """
    Fetches the character's Tower progress, highest cleared floor, and requirements for the next floor.
    """
    return _run_sync(_async_get_tower_status(character_id))


async def _async_get_active_bosses(character_id: str) -> List[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        bosses = await db.boss.find_many(
            where={"characterId": character_id, "isDefeated": False}
        )
        return [
            {
                "id": b.id,
                "name": b.name,
                "category": getattr(b, "category", "Goal"),
                "currentHp": b.currentHp,
                "maxHp": b.maxHp,
                "deadline": str(b.deadline) if b.deadline else None
            }
            for b in (bosses or [])
        ]
    except Exception as e:
        print(f"[AIRA Tool get_active_bosses Warning]: {e}")
        return []

def get_active_bosses(character_id: str) -> List[Dict[str, Any]]:
    """
    Fetches the user's active custom bosses and major goals.
    """
    return _run_sync(_async_get_active_bosses(character_id)) or []


async def _async_get_weekly_boss_pr(character_id: str) -> Optional[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        weekly_boss = await db.weeklyboss.find_first(
            where={"characterId": character_id, "isDefeated": False},
            order={"createdAt": "desc"}
        )
        if not weekly_boss:
            return {"status": "no_active_weekly_boss"}
            
        return {
            "name": weekly_boss.name,
            "targetExercise": weekly_boss.targetExercise,
            "targetWeight": weekly_boss.targetWeight,
            "targetReps": weekly_boss.targetReps,
            "currentDamage": weekly_boss.currentDamage,
            "isDefeated": weekly_boss.isDefeated,
            "expiresAt": str(weekly_boss.expiresAt)
        }
    except Exception as e:
        print(f"[AIRA Tool get_weekly_boss_pr Warning]: {e}")
        return None

def get_weekly_boss_pr(character_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetches the current weekly gym/fitness Boss PR trial, target exercise, target weight, and damage progress.
    """
    return _run_sync(_async_get_weekly_boss_pr(character_id))


# ==========================================
# 13. INVENTORY & 15. SHOP & 16. BEASTS READS
# ==========================================

async def _async_get_inventory_items(character_id: str) -> List[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        items = await db.playeritem.find_many(
            where={"characterId": character_id},
            include={"itemDefinition": True}
        )
        result = []
        for p in (items or []):
            defi = p.itemDefinition
            result.append({
                "playerItemId": p.id,
                "name": defi.name if defi else "Unknown Item",
                "type": defi.type if defi else "EQUIPMENT",
                "rarity": defi.rarity if defi else "COMMON",
                "quantity": p.quantity,
                "isEquipped": p.isEquipped,
                "attack": getattr(defi, "attack", 0),
                "defense": getattr(defi, "defense", 0),
                "strength": getattr(defi, "strength", 0),
                "knowledge": getattr(defi, "knowledge", 0),
                "endurance": getattr(defi, "endurance", 0),
                "focus": getattr(defi, "focus", 0),
                "discipline": getattr(defi, "discipline", 0),
                "recovery": getattr(defi, "recovery", 0)
            })
        return result
    except Exception as e:
        print(f"[AIRA Tool get_inventory_items Warning]: {e}")
        return []

def get_inventory_items(character_id: str) -> List[Dict[str, Any]]:
    """
    Fetches all items in the character's inventory, including equipped weapons/armor, stats, and rarity.
    """
    return _run_sync(_async_get_inventory_items(character_id)) or []


async def _async_get_shop_inventory(character_id: str) -> List[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        shop_items = await db.shopitem.find_many(
            include={"item": True}
        )
        return [
            {
                "shopItemId": s.id,
                "name": s.item.name if s.item else "Shop Item",
                "rarity": s.item.rarity if s.item else "COMMON",
                "currencyType": s.currencyType,
                "price": s.price,
                "stock": s.stock,
                "requiredLevel": s.requiredLevel
            }
            for s in (shop_items or [])
        ]
    except Exception as e:
        print(f"[AIRA Tool get_shop_inventory Warning]: {e}")
        return []

def get_shop_inventory(character_id: str) -> List[Dict[str, Any]]:
    """
    Fetches items available for purchase in the Ascend Shop with pricing and currency requirements.
    """
    return _run_sync(_async_get_shop_inventory(character_id)) or []


async def _async_get_beasts_and_eggs(character_id: str) -> Dict[str, Any]:
    try:
        await ensure_db_connected()
        character = await db.character.find_unique(where={"id": character_id})
        eggs = await db.egg.find_many(where={"characterId": character_id})
        beasts = await db.beast.find_many(where={"characterId": character_id})

        return {
            "dailySteps": getattr(character, "dailySteps", 0) if character else 0,
            "equippedBeastId": getattr(character, "equippedBeastId", None) if character else None,
            "incubatingEggs": [
                {
                    "id": e.id,
                    "name": e.name,
                    "eggType": e.eggType,
                    "currentSteps": e.currentSteps,
                    "targetSteps": e.targetSteps,
                    "status": e.status
                }
                for e in (eggs or [])
            ],
            "unlockedBeasts": [
                {
                    "id": b.id,
                    "name": b.name,
                    "species": b.species,
                    "element": b.element,
                    "level": b.level,
                    "passiveBuffType": b.passiveBuffType,
                    "passiveBuffValue": b.passiveBuffValue,
                    "isEquipped": b.isEquipped
                }
                for b in (beasts or [])
            ]
        }
    except Exception as e:
        print(f"[AIRA Tool get_beasts_and_eggs Warning]: {e}")
        return {"incubatingEggs": [], "unlockedBeasts": []}

def get_beasts_and_eggs(character_id: str) -> Dict[str, Any]:
    """
    Fetches companion pets/beasts and incubating eggs, step counts, and active pet buffs.
    """
    return _run_sync(_async_get_beasts_and_eggs(character_id))


# ==========================================
# 18. ACHIEVEMENTS & N. AUTOMATIONS READS
# ==========================================

async def _async_get_achievements_list(character_id: str) -> List[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        char_achievements = await db.characterachievement.find_many(
            where={"characterId": character_id},
            include={"achievement": True}
        )
        return [
            {
                "achievementId": ca.achievement.id if ca.achievement else ca.achievementId,
                "title": ca.achievement.title if ca.achievement else "Achievement",
                "description": ca.achievement.description if ca.achievement else "",
                "category": ca.achievement.category if ca.achievement else "GENERAL",
                "currentProgress": ca.currentProgress,
                "targetValue": ca.achievement.targetValue if ca.achievement else 1,
                "isClaimed": ca.isClaimed,
                "rewardGold": ca.achievement.rewardGold if ca.achievement else 0,
                "rewardGems": ca.achievement.rewardGems if ca.achievement else 0
            }
            for ca in (char_achievements or [])
        ]
    except Exception as e:
        print(f"[AIRA Tool get_achievements_list Warning]: {e}")
        return []

def get_achievements_list(character_id: str) -> List[Dict[str, Any]]:
    """
    Fetches all milestones and achievements, showing progress, completion, and claimable status.
    """
    return _run_sync(_async_get_achievements_list(character_id)) or []


async def _async_get_automations_list(character_id: str) -> List[Dict[str, Any]]:
    try:
        await ensure_db_connected()
        rules = await db.automationrule.find_many(
            where={"characterId": character_id}
        )
        return [
            {
                "id": r.id,
                "name": r.name,
                "enabled": r.enabled,
                "triggerType": r.triggerType,
                "matchMode": r.matchMode,
                "cooldownSeconds": r.cooldownSeconds,
                "lastTriggeredAt": str(r.lastTriggeredAt) if r.lastTriggeredAt else None
            }
            for r in (rules or [])
        ]
    except Exception as e:
        print(f"[AIRA Tool get_automations_list Warning]: {e}")
        return []

def get_automations_list(character_id: str) -> List[Dict[str, Any]]:
    """
    Fetches the user's active and paused Automation Rules across all triggers.
    """
    return _run_sync(_async_get_automations_list(character_id)) or []


# ==========================================
# PHASE B: MUTATIVE TOOL STUBS (REQUIRES CONFIRMATION)
# ==========================================

def log_completed_workout(character_id: str, exercise_name: str, sets: int, reps: int, weight: float) -> Dict[str, Any]:
    """Logs a completed workout for the user."""
    return {"status": "pending_confirmation", "message": "Workout log requires user confirmation."}

def complete_daily_mission(character_id: str, mission_id: str, mission_title: str) -> Dict[str, Any]:
    """Marks a daily mission or habit as completed."""
    return {"status": "pending_confirmation", "message": "Mission completion requires user confirmation."}

def create_new_mission(character_id: str, title: str, description: str = "", stat_type: str = "strength") -> Dict[str, Any]:
    """
    Informational: Daily missions in Ascend Core are deterministically generated from recurring habits.
    To add a new daily mission routine, create the supporting habit instead.
    """
    return {
        "status": "informational",
        "message": "Daily missions are generated from recurring habits. Create a supporting habit instead.",
        "recommended_action": "create_habit",
        "habit_template": {
            "name": title,
            "category": "Discipline",
            "difficulty": "MEDIUM",
            "primaryStat": stat_type.lower() if stat_type else "discipline",
        },
    }

def delete_mission(character_id: str, mission_id: str, mission_title: str) -> Dict[str, Any]:
    """Deletes or removes a mission from today's list."""
    return {"status": "pending_confirmation", "message": "Mission deletion requires user confirmation."}

def create_habit(character_id: str, name: str, category: str, difficulty: str, primary_stat: str, description: str = "") -> Dict[str, Any]:
    """Creates a new recurring habit for the player."""
    return {"status": "pending_confirmation", "message": "Habit creation requires user confirmation."}

def update_habit(character_id: str, habit_id: str, name: str, difficulty: str) -> Dict[str, Any]:
    """Updates an existing habit's name or difficulty level."""
    return {"status": "pending_confirmation", "message": "Habit update requires user confirmation."}

def archive_habit(character_id: str, habit_id: str, habit_name: str) -> Dict[str, Any]:
    """Archives an existing habit so it is no longer tracked daily."""
    return {"status": "pending_confirmation", "message": "Habit archival requires user confirmation."}

def equip_inventory_item(character_id: str, player_item_id: str, item_name: str) -> Dict[str, Any]:
    """Equips a weapon, armor, or relic from the inventory."""
    return {"status": "pending_confirmation", "message": "Equipping item requires user confirmation."}

def unequip_inventory_item(character_id: str, player_item_id: str, item_name: str) -> Dict[str, Any]:
    """Unequips a currently equipped item."""
    return {"status": "pending_confirmation", "message": "Unequipping item requires user confirmation."}

def buy_shop_item(character_id: str, shop_item_id: str, item_name: str, currency_type: str, price: int) -> Dict[str, Any]:
    """Purchases an item from the Ascend Shop with Gold or Gems."""
    return {"status": "pending_confirmation", "message": "Shop purchase requires user confirmation."}

def spend_skill_points(character_id: str, skill_id: str, skill_name: str) -> Dict[str, Any]:
    """Spends available Skill Points (SP) to unlock or upgrade a class skill."""
    return {"status": "pending_confirmation", "message": "Skill upgrade requires user confirmation."}

def equip_beast(character_id: str, beast_id: str, beast_name: str) -> Dict[str, Any]:
    """Equips a companion pet/beast to activate its passive boost."""
    return {"status": "pending_confirmation", "message": "Equipping beast requires user confirmation."}

def incubate_egg(character_id: str, egg_type: str) -> Dict[str, Any]:
    """Starts incubating a newly acquired pet egg."""
    return {"status": "pending_confirmation", "message": "Egg incubation requires user confirmation."}

def claim_achievement_reward(character_id: str, achievement_id: str, achievement_title: str) -> Dict[str, Any]:
    """Claims the Gold, Gems, or Title reward for a completed achievement."""
    return {"status": "pending_confirmation", "message": "Claiming achievement requires user confirmation."}

def create_automation_rule(character_id: str, name: str, trigger_type: str, action_type: str) -> Dict[str, Any]:
    """Creates a new automated workflow rule (e.g. auto-complete habit upon Vision detection)."""
    return {"status": "pending_confirmation", "message": "Automation rule creation requires user confirmation."}

def toggle_automation_rule(character_id: str, rule_id: str, rule_name: str, enabled: bool) -> Dict[str, Any]:
    """Enables or pauses an existing automation rule."""
    return {"status": "pending_confirmation", "message": "Toggling automation rule requires user confirmation."}

def delete_automation_rule(character_id: str, rule_id: str, rule_name: str) -> Dict[str, Any]:
    """Deletes an automation rule."""
    return {"status": "pending_confirmation", "message": "Deleting automation rule requires user confirmation."}

def create_calendar_schedule(character_id: str, title: str, time: str, schedule_type: str, end_time: Optional[str] = None, day_of_week: Optional[int] = None, scheduled_at: Optional[str] = None) -> Dict[str, Any]:
    """Call this to add a class, event, or appointment to the player's personal calendar.
    Use schedule_type='WEEKLY' with day_of_week (0=Sunday,1=Monday,...,6=Saturday) for recurring weekly events.
    Use schedule_type='ONCE' with scheduled_at (YYYY-MM-DD or ISO date string) for single-occurrence events.
    The time parameter must be in HH:MM 24-hour format (e.g., '09:00' for 9am).
    The optional end_time parameter must also be in HH:MM 24-hour format (e.g., '10:00' or '21:00').
    Examples: 'schedule math class every Monday at 9am', 'at 7pm-9pm meeting with a friend', 'add gym session Thursday 6pm-7:30pm'.
    Call this once per day-of-week when scheduling on multiple days."""
    return {"status": "pending_confirmation", "message": "Calendar schedule creation requires user confirmation."}

def delete_calendar_schedule(character_id: str, schedule_id: str) -> Dict[str, Any]:
    """Removes a class, event, or recurring appointment from the player's calendar by its scheduleId.
    Use get_calendar_history first to find the scheduleId if the user only provides a name."""
    return {"status": "pending_confirmation", "message": "Calendar schedule deletion requires user confirmation."}

def generate_progression_plan(character_id: str, goal_description: str) -> Dict[str, Any]:
    """Formulates a structured progression plan with recommended habits."""
    return {"status": "pending_confirmation", "message": "Progression plan requires user confirmation."}


# ==========================================
# ANALYTICAL TOOLS
# ==========================================

async def _async_analyze_tower_readiness(character_id: str, floor_number: int) -> Dict[str, Any]:
    try:
        await ensure_db_connected()
        character = await ensure_character_exists(character_id)
        char_record = await db.character.find_unique(
            where={"id": character.id if character else character_id},
            include={"stats": True, "playerItems": {"include": {"itemDefinition": True}}}
        )
        if not char_record or not char_record.stats:
            return {"readiness_summary": "Ready for Level 1", "recommendation": "Maintain daily habit completion."}

        floor = await db.towerfloor.find_unique(where={"floorNumber": floor_number})
        if not floor:
            return {"floor_analyzed": floor_number, "readiness_summary": "Ready", "critical_weaknesses": []}

        total_stats = {
            "power": char_record.power,
            "strength": char_record.stats.strength,
            "endurance": char_record.stats.endurance,
            "knowledge": char_record.stats.knowledge,
            "recovery": char_record.stats.recovery,
            "focus": char_record.stats.focus,
            "discipline": char_record.stats.discipline,
        }
        for p_item in [item for item in (char_record.playerItems or []) if item.isEquipped]:
            defi = p_item.itemDefinition
            if defi:
                total_stats["strength"] += getattr(defi, "strength", 0)
                total_stats["endurance"] += getattr(defi, "endurance", 0)
                total_stats["knowledge"] += getattr(defi, "knowledge", 0)
                total_stats["recovery"] += getattr(defi, "recovery", 0)
                total_stats["focus"] += getattr(defi, "focus", 0)
                total_stats["discipline"] += getattr(defi, "discipline", 0)

        weaknesses = []
        if total_stats["power"] < floor.requiredPower:
            weaknesses.append(f"Power is {floor.requiredPower - total_stats['power']} points below requirement.")
        if total_stats["strength"] < floor.requiredStrength:
            weaknesses.append(f"Strength is {floor.requiredStrength - total_stats['strength']} points below requirement.")

        return {
            "floor_analyzed": floor_number,
            "readiness_summary": "Ready" if not weaknesses else "Not Ready",
            "critical_weaknesses": weaknesses
        }
    except Exception as e:
        print(f"[AIRA Tool analyze_tower_readiness Warning]: {e}")
        return {"floor_analyzed": floor_number, "readiness_summary": "Ready", "critical_weaknesses": []}

def analyze_tower_readiness(character_id: str, floor_number: int) -> Dict[str, Any]:
    """Analyzes if player is ready to conquer a specific Tower floor based on stats and gear."""
    return _run_sync(_async_analyze_tower_readiness(character_id, floor_number))


async def _async_compare_equipment(character_id: str) -> Dict[str, Any]:
    try:
        await ensure_db_connected()
        character = await ensure_character_exists(character_id)
        char_record = await db.character.find_unique(
            where={"id": character.id if character else character_id},
            include={"stats": True, "playerItems": {"include": {"itemDefinition": True}}}
        )
        if not char_record or not char_record.stats:
            return {"recommendation": "Complete quests to acquire higher tier gear."}

        stats_dict = {
            "strength": char_record.stats.strength,
            "endurance": char_record.stats.endurance,
            "knowledge": char_record.stats.knowledge,
            "recovery": char_record.stats.recovery,
            "focus": char_record.stats.focus,
            "discipline": char_record.stats.discipline,
        }
        lowest_stat = min(stats_dict, key=stats_dict.get)
        unequipped = []
        for p_item in (char_record.playerItems or []):
            if not p_item.itemDefinition or p_item.isEquipped:
                continue
            unequipped.append({
                "id": p_item.id,
                "name": p_item.itemDefinition.name,
                "bonus": getattr(p_item.itemDefinition, lowest_stat, 0)
            })
        unequipped.sort(key=lambda x: x["bonus"], reverse=True)
        top_rec = f"Recommend equipping {unequipped[0]['name']} to improve {lowest_stat.capitalize()}." if unequipped and unequipped[0]["bonus"] > 0 else "No gear currently available for this stat."
        return {"lowest_base_stat": lowest_stat, "recommendation": top_rec}
    except Exception as e:
        print(f"[AIRA Tool compare_equipment Warning]: {e}")
        return {"recommendation": "Complete daily habits to obtain new gear."}

def compare_equipment(character_id: str) -> Dict[str, Any]:
    """Analyzes player's inventory and recommends optimal gear for lowest stats."""
    return _run_sync(_async_compare_equipment(character_id))


def recommend_workout_plan(character_id: str, focus_preference: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyzes live muscle recovery fatigue, freshness status, and character workload to recommend
    an optimal workout split and target exercises without mutating state.
    """
    from services.aira_registry import recommend_workout_operation
    return _run_sync(recommend_workout_operation(character_id, focus_preference))


# Full Master Tool Registry for AIRA
AIRA_TOOLS = [
    # Operations & Character Reads
    get_character_stats,
    get_dashboard_summary,
    get_today_missions,
    get_habits_overview,
    get_calendar_history,
    
    # Disciplines Reads & Recommendations
    get_workout_history,
    get_muscle_recovery,
    recommend_workout_plan,
    get_skills_tree,
    
    # Combat Reads
    get_tower_status,
    get_active_bosses,
    get_weekly_boss_pr,
    
    # Armory Reads
    get_inventory_items,
    get_shop_inventory,
    get_beasts_and_eggs,
    
    # System Core Reads
    get_achievements_list,
    get_automations_list,
    
    # Analytics
    analyze_tower_readiness,
    compare_equipment,

    # Preview candidates and actions; Core creates a signed preview before execution.
    create_habit,
    update_habit,
    archive_habit,
    complete_daily_mission,
    create_automation_rule,
    toggle_automation_rule,
    delete_automation_rule,
    create_new_mission,
    create_calendar_schedule,
    delete_calendar_schedule,
]
