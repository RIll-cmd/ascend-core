"""
AIRA Core Operation Registry
============================
The authoritative central dispatcher for AIRA operations across all Ascend Core domains.
Ensures typed reads, domain service delegation, and clear UNAVAILABLE_DATA handling
without raw unauthenticated database queries or duplicate business logic.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from db import db, ensure_db_connected
from db_utils import ensure_character_exists

# Canonical list of domains recognized by AIRA
SUPPORTED_DOMAINS = {
    "dashboard": "01 Dashboard",
    "missions": "02 Missions",
    "habits": "03 Habits",
    "calendar": "04 Calendar",
    "profile": "05 Profile",
    "workouts": "06 Workouts",
    "recovery": "06 Recovery",
    "sleep": "07 Sleep & Rest",
    "focus": "08 Focus & Study",
    "skills": "09 Skills",
    "tower": "10 Tower",
    "bosses": "11 Bosses",
    "weekly_boss": "12 Boss PR",
    "inventory": "13 Inventory",
    "crafting": "14 Forge & Craft",
    "shop": "15 Shop",
    "beasts": "16 Beasts & Pets",
    "system": "17 System Core",
    "achievements": "18 Achievements",
    "automations": "Automations Engine",
}

UNAVAILABLE_DOMAINS = {
    "sleep": "Sleep and sleep telemetry data are not available in Ascend Core.",
    "focus": "Deep focus/study session logs are not tracked as authoritative Core data.",
}


async def read_domain_operation(
    character_id: str,
    domain: str,
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Authoritative read dispatcher for AIRA.
    Queries the appropriate domain service/reader or returns unavailable_data.
    """
    domain_key = domain.lower().strip()
    params = parameters or {}

    # 1. Handle explicit unmodeled domains
    if domain_key in UNAVAILABLE_DOMAINS:
        return {
            "success": False,
            "domain": domain_key,
            "error": {
                "code": "unavailable_data",
                "message": UNAVAILABLE_DOMAINS[domain_key],
            }
        }

    await ensure_db_connected()
    character = await ensure_character_exists(character_id)
    char_id = character.id if character else character_id

    # 2. Domain Reads Dispatcher
    try:
        if domain_key == "dashboard":
            from routers.integration import get_existing_today_missions, get_existing_habits
            missions = await get_existing_today_missions(char_id)
            habits = await get_existing_habits(char_id)
            total_m = len(missions)
            comp_m = sum(1 for m in missions if m.get("status") == "COMPLETED")
            snapshot = await db.dailycompletionsnapshot.find_first(
                where={"characterId": char_id},
                order={"date": "desc"}
            )
            return {
                "success": True,
                "domain": "dashboard",
                "data": {
                    "character_name": getattr(character, "name", "Master"),
                    "level": getattr(character, "level", 1),
                    "power": getattr(character, "power", 50),
                    "rank": getattr(character, "rank", "F"),
                    "gold": getattr(character, "gold", 0),
                    "gems": getattr(character, "gems", 0),
                    "active_habits_count": len(habits),
                    "missions_today": {
                        "total": total_m,
                        "completed": comp_m,
                        "completion_rate": round((comp_m / total_m * 100), 1) if total_m > 0 else 0.0,
                    },
                    "recent_completion_rate": snapshot.completionRate if snapshot else 0.0,
                    "daily_steps": getattr(character, "dailySteps", 0),
                    "step_goal": getattr(character, "dailyStepGoal", 10000),
                }
            }

        if domain_key == "missions":
            from routers.integration import get_existing_today_missions
            missions = await get_existing_today_missions(char_id)
            status_filter = params.get("status")
            if status_filter:
                missions = [m for m in missions if m.get("status") == status_filter.upper()]
            return {"success": True, "domain": "missions", "data": {"missions": missions}}

        if domain_key == "habits":
            from routers.integration import get_existing_habits
            habits = await get_existing_habits(char_id)
            return {"success": True, "domain": "habits", "data": {"habits": habits}}

        if domain_key == "calendar":
            days = int(params.get("days", 7))
            snapshots = await db.dailycompletionsnapshot.find_many(
                where={"characterId": char_id},
                order={"date": "desc"},
                take=days
            )
            data = [
                {
                    "date": s.date.strftime("%Y-%m-%d") if hasattr(s.date, "strftime") else str(s.date),
                    "completedCount": s.completedCount,
                    "totalCount": s.totalCount,
                    "completionRate": s.completionRate,
                }
                for s in (snapshots or [])
            ]
            return {"success": True, "domain": "calendar", "data": {"snapshots": data}}

        if domain_key == "profile":
            stats = character.stats if getattr(character, "stats", None) else {}
            stats_dict = stats.model_dump() if hasattr(stats, "model_dump") else (dict(stats) if isinstance(stats, dict) else {})
            return {
                "success": True,
                "domain": "profile",
                "data": {
                    "name": getattr(character, "name", "Master"),
                    "level": getattr(character, "level", 1),
                    "power": getattr(character, "power", 50),
                    "rank": getattr(character, "rank", "F"),
                    "gold": getattr(character, "gold", 0),
                    "gems": getattr(character, "gems", 0),
                    "availableSP": getattr(character, "availableSP", 0),
                    "highestTowerFloor": getattr(character, "highestTowerFloor", 0),
                    "stats": stats_dict,
                }
            }

        if domain_key in {"workouts", "recovery"}:
            from routers.workouts import compute_muscle_status_dict
            recovery_data = await compute_muscle_status_dict(char_id)
            sessions = await db.workoutsession.find_many(
                where={"characterId": char_id},
                include={"sets": {"include": {"exercise": True}}},
                order={"date": "desc"},
                take=int(params.get("limit", 5))
            )
            history = []
            for s in (sessions or []):
                sets_data = []
                for st in (s.sets or []):
                    sets_data.append({
                        "exercise": st.exercise.name if st.exercise else "Exercise",
                        "primaryMuscle": st.exercise.primaryMuscle if st.exercise else "FULL_BODY",
                        "weight": st.weight,
                        "reps": st.reps,
                        "isPr": st.isPr,
                    })
                history.append({
                    "sessionId": s.id,
                    "date": s.date.strftime("%Y-%m-%d %H:%M") if hasattr(s.date, "strftime") else str(s.date),
                    "durationSeconds": s.durationSeconds,
                    "sets": sets_data,
                })
            return {
                "success": True,
                "domain": "workouts",
                "data": {
                    "recovery": recovery_data,
                    "recent_sessions": history,
                }
            }

        if domain_key == "skills":
            from routers.skills import get_skills
            skills_res = await get_skills(char_id)
            return {
                "success": True,
                "domain": "skills",
                "data": {
                    "availableSP": getattr(character, "availableSP", 0),
                    "skills": skills_res,
                }
            }

        if domain_key == "tower":
            highest_floor = getattr(character, "highestTowerFloor", 0)
            next_floor = await db.towerfloor.find_first(
                where={"floorNumber": highest_floor + 1},
                include={"enemy": True}
            )
            return {
                "success": True,
                "domain": "tower",
                "data": {
                    "highestClearedFloor": highest_floor,
                    "nextFloor": {
                        "floorNumber": highest_floor + 1,
                        "requiredPower": next_floor.requiredPower if next_floor else (highest_floor + 1) * 100,
                        "requiredStrength": next_floor.requiredStrength if next_floor else 10,
                        "enemyName": next_floor.enemy.name if (next_floor and next_floor.enemy) else "Guardian",
                        "isBoss": next_floor.isBoss if next_floor else False,
                    } if next_floor else None
                }
            }

        if domain_key == "bosses":
            bosses = await db.boss.find_many(
                where={"characterId": char_id, "isDefeated": False}
            )
            data = [
                {
                    "id": b.id,
                    "name": b.name,
                    "category": getattr(b, "category", "Goal"),
                    "currentHp": b.currentHp,
                    "maxHp": b.maxHp,
                    "deadline": str(b.deadline) if b.deadline else None,
                }
                for b in (bosses or [])
            ]
            return {"success": True, "domain": "bosses", "data": {"active_bosses": data}}

        if domain_key == "weekly_boss":
            weekly_boss = await db.weeklyboss.find_first(
                where={"characterId": char_id, "isDefeated": False},
                order={"createdAt": "desc"}
            )
            if not weekly_boss:
                return {"success": True, "domain": "weekly_boss", "data": {"status": "no_active_weekly_boss"}}
            return {
                "success": True,
                "domain": "weekly_boss",
                "data": {
                    "name": weekly_boss.name,
                    "targetExercise": weekly_boss.targetExercise,
                    "targetWeight": weekly_boss.targetWeight,
                    "targetReps": weekly_boss.targetReps,
                    "currentDamage": weekly_boss.currentDamage,
                    "isDefeated": weekly_boss.isDefeated,
                    "expiresAt": str(weekly_boss.expiresAt),
                }
            }

        if domain_key == "inventory":
            from routers.inventory import get_inventory
            items = await get_inventory(char_id)
            inv_list = []
            for p in (items or []):
                defi = getattr(p, "itemDefinition", None)
                inv_list.append({
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
                    "recovery": getattr(defi, "recovery", 0),
                })
            return {"success": True, "domain": "inventory", "data": {"items": inv_list}}

        if domain_key == "shop":
            from routers.shop import get_shop_items
            shop_items = await get_shop_items(char_id)
            catalog = []
            for si in (shop_items or []):
                catalog.append({
                    "id": si.id,
                    "itemId": si.itemId,
                    "name": si.name,
                    "currencyType": si.currencyType,
                    "price": si.price,
                    "stock": si.stock,
                    "type": si.type,
                    "rarity": si.rarity,
                })
            return {"success": True, "domain": "shop", "data": {"catalog": catalog}}

        if domain_key == "crafting":
            from routers.crafting import get_crafting_recipes
            recipes = await get_crafting_recipes(char_id)
            return {
                "success": True,
                "domain": "crafting",
                "data": {
                    "recipes": [
                        {
                            "id": r.id,
                            "title": r.title,
                            "category": r.category,
                            "requiredLevel": r.requiredLevel,
                            "goldCost": r.goldCost,
                            "canCraft": r.canCraft,
                        }
                        for r in (recipes or [])
                    ]
                }
            }

        if domain_key == "beasts":
            from routers.beasts import get_beast_collection
            coll = await get_beast_collection(character_id=char_id)
            eggs = [
                {"id": e.id, "name": e.name, "eggType": e.eggType, "status": e.status, "currentSteps": e.currentSteps, "targetSteps": e.targetSteps}
                for e in (coll.eggs or [])
            ]
            beasts = [
                {"id": b.id, "name": b.name, "species": b.species, "rarity": b.rarity, "isEquipped": b.isEquipped, "statBonusType": b.statBonusType, "statBonusValue": b.statBonusValue}
                for b in (coll.beasts or [])
            ]
            return {
                "success": True,
                "domain": "beasts",
                "data": {
                    "eggs": eggs,
                    "beasts": beasts,
                    "passiveBuffs": coll.passiveBuffs,
                }
            }

        if domain_key == "achievements":
            from routers.achievements import get_achievements
            ach_res = await get_achievements(char_id)
            return {"success": True, "domain": "achievements", "data": ach_res}

        if domain_key == "automations":
            from routers.automations import list_automations
            auto_res = await list_automations(char_id)
            return {"success": True, "domain": "automations", "data": {"automations": auto_res}}

        return {
            "success": False,
            "domain": domain_key,
            "error": {
                "code": "unsupported_domain",
                "message": f"Domain '{domain}' is not recognized in the AIRA Operation Registry.",
            }
        }

    except Exception as exc:
        return {
            "success": False,
            "domain": domain_key,
            "error": {
                "code": "internal_error",
                "message": str(exc),
            }
        }


async def recommend_workout_operation(character_id: str, focus_preference: Optional[str] = None) -> Dict[str, Any]:
    """
    Authoritative workout recommendation engine.
    Synthesizes live muscle recovery status with character profile and preferences,
    returning transparent recommendations without mutating database state.
    """
    await ensure_db_connected()
    from routers.workouts import compute_muscle_status_dict
    status = await compute_muscle_status_dict(character_id)
    muscles = status.get("muscles", {})

    fresh_groups = [k for k, v in muscles.items() if v.get("status") == "FRESH"]
    recovering_groups = [k for k, v in muscles.items() if v.get("status") == "RECOVERING"]
    fatigued_groups = [k for k, v in muscles.items() if v.get("status") == "FATIGUED"]

    # Target muscle group selection
    recommended_split = "FULL_BODY"
    target_exercises = []

    if "CHEST" in fresh_groups and "FRONT_DELTS" in fresh_groups and "TRICEPS" in fresh_groups:
        recommended_split = "UPPER_PUSH"
        target_exercises = ["Barbell Bench Press", "Overhead Press", "Incline Dumbbell Press", "Tricep Pushdowns"]
    elif "LATS" in fresh_groups and "TRAPS" in fresh_groups and "BICEPS" in fresh_groups:
        recommended_split = "UPPER_PULL"
        target_exercises = ["Barbell Deadlift", "Pull-ups", "Barbell Row", "Dumbbell Hammer Curls"]
    elif "QUADS" in fresh_groups and "HAMSTRINGS" in fresh_groups and "GLUTES" in fresh_groups:
        recommended_split = "LOWER_LEGS"
        target_exercises = ["Barbell Back Squat", "Romanian Deadlift", "Leg Press", "Standing Calf Raises"]
    else:
        # Fall back to whichever fresh muscle groups exist
        target_exercises = [f"{m.capitalize()} Compound Lift" for m in fresh_groups[:4]] or ["Active Recovery / Zone 2 Cardio"]

    return {
        "success": True,
        "recommended_split": recommended_split,
        "target_exercises": target_exercises,
        "muscle_readiness": {
            "fresh_count": len(fresh_groups),
            "recovering_count": len(recovering_groups),
            "fatigued_count": len(fatigued_groups),
            "overall_freshness": status.get("summary", {}).get("overallFreshness", 100.0),
        },
        "fresh_muscles": fresh_groups,
        "fatigued_muscles": fatigued_groups,
        "reasoning": f"Based on physiological recovery metrics, {len(fresh_groups)} muscle groups have reached >= 80% freshness. Recommended protocol targets {recommended_split}.",
    }
