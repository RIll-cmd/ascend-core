import json
import sqlite3
import os
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from db import db
from auth_utils import get_current_user, verify_character_ownership
from services.workout_engine import calculate_e1rm, determine_rank, get_exercise_standard
from services.boss_engine import deal_boss_damage
from routers.achievements import sync_achievements_for_character

router = APIRouter(tags=["workouts"])

# =======================================================================
# 🧬 CANONICAL MUSCLE METADATA & RECOVERY TIMETABLES
# =======================================================================
CANONICAL_MUSCLES = {
    "CHEST": {"name": "Chest (Pectorals)", "view": "front", "recoveryHours": 48.0, "category": "UPPER_PUSH"},
    "FRONT_DELTS": {"name": "Front Deltoids", "view": "front", "recoveryHours": 48.0, "category": "UPPER_PUSH"},
    "SHOULDERS": {"name": "Lateral Deltoids", "view": "front", "recoveryHours": 48.0, "category": "UPPER_PUSH"},
    "REAR_DELTS": {"name": "Rear Deltoids", "view": "back", "recoveryHours": 48.0, "category": "UPPER_PULL"},
    "TRAPS": {"name": "Trapezius", "view": "back", "recoveryHours": 48.0, "category": "UPPER_PULL"},
    "LATS": {"name": "Latissimus Dorsi", "view": "back", "recoveryHours": 72.0, "category": "UPPER_PULL"},
    "LOWER_BACK": {"name": "Lower Back (Erectors)", "view": "back", "recoveryHours": 72.0, "category": "CORE_POSTERIOR"},
    "BICEPS": {"name": "Biceps", "view": "front", "recoveryHours": 48.0, "category": "ARMS"},
    "TRICEPS": {"name": "Triceps", "view": "back", "recoveryHours": 48.0, "category": "ARMS"},
    "FOREARMS": {"name": "Forearms", "view": "front", "recoveryHours": 48.0, "category": "ARMS"},
    "ABS": {"name": "Abdominals", "view": "front", "recoveryHours": 48.0, "category": "CORE"},
    "OBLIQUES": {"name": "Obliques", "view": "front", "recoveryHours": 48.0, "category": "CORE"},
    "QUADS": {"name": "Quadriceps", "view": "front", "recoveryHours": 72.0, "category": "LEGS"},
    "HAMSTRINGS": {"name": "Hamstrings", "view": "back", "recoveryHours": 72.0, "category": "LEGS"},
    "GLUTES": {"name": "Glutes", "view": "back", "recoveryHours": 72.0, "category": "LEGS"},
    "CALVES": {"name": "Calves", "view": "both", "recoveryHours": 48.0, "category": "LEGS"},
}

# Fuzzy Muscle Group Name Normalizer
def normalize_muscle_key(name: str) -> str:
    if not name:
        return "CHEST"
    n = name.upper().strip().replace(" ", "_").replace("-", "_")
    if "CHEST" in n or "PEC" in n:
        return "CHEST"
    if "FRONT_DELT" in n or "ANTERIOR_DELT" in n:
        return "FRONT_DELTS"
    if "REAR_DELT" in n or "POSTERIOR_DELT" in n:
        return "REAR_DELTS"
    if "SHOULDER" in n or "DELT" in n:
        return "SHOULDERS"
    if "TRAP" in n:
        return "TRAPS"
    if "LAT" in n:
        return "LATS"
    if "LOWER_BACK" in n or "ERECTOR" in n:
        return "LOWER_BACK"
    if "BACK" in n:
        return "LATS"
    if "BICEP" in n:
        return "BICEPS"
    if "TRICEP" in n:
        return "TRICEPS"
    if "FOREARM" in n or "GRIP" in n or "WRIST" in n:
        return "FOREARMS"
    if "ARM" in n:
        return "BICEPS"
    if "OBLIQUE" in n:
        return "OBLIQUES"
    if "AB" in n or "CORE" in n:
        return "ABS"
    if "QUAD" in n:
        return "QUADS"
    if "HAMSTRING" in n:
        return "HAMSTRINGS"
    if "GLUTE" in n:
        return "GLUTES"
    if "CALF" in n or "CALVES" in n:
        return "CALVES"
    if "LEG" in n:
        return "QUADS"
    return "CHEST"

def get_db_path() -> str:
    # Look in prisma/dev.db or server/dev.db
    p1 = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "prisma", "dev.db"))
    if os.path.exists(p1):
        return p1
    p2 = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dev.db"))
    return p2

# =======================================================================
# ⚙️ DYNAMIC REAL-TIME MUSCLE RECOVERY ENGINE (PRISMA POSTGRESQL & HYBRID)
# =======================================================================
async def compute_muscle_status_dict(character_id: str) -> Dict[str, Any]:
    """
    Computes real-time dynamic time-decay recovery values on fetch.
    Zero background cron required.
    """
    tracked = {}
    now = datetime.now(timezone.utc)
    
    if db.is_connected():
        try:
            states = await db.musclerecoverystate.find_many(where={"characterId": character_id})
            for s in states:
                lt = s.lastTrainedAt
                if isinstance(lt, datetime):
                    lt = lt.replace(tzinfo=timezone.utc) if lt.tzinfo is None else lt
                else:
                    lt = now
                tracked[s.muscleGroup.upper()] = {
                    "initialFatigue": float(s.initialFatigue or 0.0),
                    "lastTrainedAt": lt,
                    "fullRecoveryHours": float(s.fullRecoveryHours or 48.0)
                }
        except Exception:
            pass

    if not tracked:
        try:
            db_path = get_db_path()
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute(
                "SELECT muscleGroup, initialFatigue, lastTrainedAt, fullRecoveryHours FROM MuscleRecoveryState WHERE characterId = ?",
                (character_id,)
            )
            rows = c.fetchall()
            conn.close()

            for mg, ifat, lt_str, rec_h in rows:
                try:
                    if isinstance(lt_str, str):
                        if "T" in lt_str:
                            lt = datetime.fromisoformat(lt_str.replace("Z", "+00:00"))
                        else:
                            lt = datetime.strptime(lt_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
                    elif isinstance(lt_str, datetime):
                        lt = lt_str.replace(tzinfo=timezone.utc) if lt_str.tzinfo is None else lt_str
                    else:
                        lt = now
                except Exception:
                    lt = now
                    
                tracked[mg.upper()] = {
                    "initialFatigue": float(ifat or 0.0),
                    "lastTrainedAt": lt,
                    "fullRecoveryHours": float(rec_h or 48.0)
                }
        except Exception:
            pass

    muscles_data = {}
    most_recent_train = None
    
    for key, meta in CANONICAL_MUSCLES.items():
        if key in tracked:
            data = tracked[key]
            rec_hours = data["fullRecoveryHours"]
            lt = data["lastTrainedAt"]
            if most_recent_train is None or lt > most_recent_train:
                most_recent_train = lt
                
            elapsed_hours = max(0.0, (now - lt).total_seconds() / 3600.0)
            if elapsed_hours >= rec_hours:
                cur_fatigue = 0.0
                freshness = 100.0
                hours_rem = 0.0
            else:
                cur_fatigue = max(0.0, data["initialFatigue"] * (1.0 - (elapsed_hours / rec_hours)))
                freshness = min(100.0, max(0.0, 100.0 - cur_fatigue))
                hours_rem = max(0.0, rec_hours - elapsed_hours)
        else:
            cur_fatigue = 0.0
            freshness = 100.0
            hours_rem = 0.0
            lt = None
            
        status = "FRESH" if freshness >= 80.0 else "RECOVERING" if freshness >= 40.0 else "FATIGUED"
        
        muscles_data[key] = {
            "id": key,
            "name": meta["name"],
            "view": meta["view"],
            "category": meta["category"],
            "freshness": round(freshness, 1),
            "fatigue": round(cur_fatigue, 1),
            "hoursRemaining": round(hours_rem, 1),
            "status": status,
            "lastTrainedAt": lt.isoformat() if lt else None,
            "fullRecoveryHours": meta["recoveryHours"]
        }
        
    fresh_count = sum(1 for m in muscles_data.values() if m["status"] == "FRESH")
    recovering_count = sum(1 for m in muscles_data.values() if m["status"] == "RECOVERING")
    fatigued_count = sum(1 for m in muscles_data.values() if m["status"] == "FATIGUED")
    overall_freshness = round(sum(m["freshness"] for m in muscles_data.values()) / len(muscles_data), 1)
    
    days_since_last = 0
    if most_recent_train:
        days_since_last = max(0, (now - most_recent_train).days)
        
    return {
        "muscles": muscles_data,
        "summary": {
            "freshCount": fresh_count,
            "recoveringCount": recovering_count,
            "fatiguedCount": fatigued_count,
            "totalCount": len(muscles_data),
            "overallFreshness": overall_freshness,
            "daysSinceLastWorkout": days_since_last,
            "lastWorkoutDate": most_recent_train.isoformat() if most_recent_train else None
        }
    }

async def update_character_muscle_fatigue(character_id: str, exercise_set_counts: Dict[str, int]):
    """
    Increases fatigue for trained primary and secondary muscles and resets their lastTrainedAt.
    """
    now = datetime.now(timezone.utc)
    
    # Calculate target fatigue deltas
    fatigue_deltas: Dict[str, float] = {}
    
    for ex_id, sets_count in exercise_set_counts.items():
        ex_meta = None
        for ex in DEFAULT_EXERCISES:
            if ex["id"] == ex_id or ex["name"].lower() == ex_id.lower():
                ex_meta = ex
                break
                
        if ex_meta:
            primary = normalize_muscle_key(ex_meta.get("primaryMuscle", "CHEST"))
            p_fatigue = min(90.0, 35.0 + sets_count * 7.0)
            fatigue_deltas[primary] = max(fatigue_deltas.get(primary, 0.0), p_fatigue)
            
            secondaries = ex_meta.get("secondaryMuscles", [])
            if isinstance(secondaries, str):
                try:
                    secondaries = json.loads(secondaries)
                except Exception:
                    secondaries = [s.strip() for s in secondaries.split(",") if s.strip()]
                    
            for sec in secondaries:
                s_key = normalize_muscle_key(sec)
                s_fatigue = min(60.0, 15.0 + sets_count * 4.0)
                fatigue_deltas[s_key] = max(fatigue_deltas.get(s_key, 0.0), s_fatigue)
        else:
            primary = "CHEST"
            fatigue_deltas[primary] = max(fatigue_deltas.get(primary, 0.0), 40.0)
            
    # Apply to Prisma
    if db.is_connected():
        try:
            for m_key, add_fatigue in fatigue_deltas.items():
                rec_hours = CANONICAL_MUSCLES.get(m_key, {}).get("recoveryHours", 48.0)
                existing = await db.musclerecoverystate.find_first(
                    where={"characterId": character_id, "muscleGroup": m_key}
                )
                if existing:
                    new_fatigue = min(100.0, max(add_fatigue, float(existing.initialFatigue or 0.0) * 0.4 + add_fatigue))
                    await db.musclerecoverystate.update(
                        where={"id": existing.id},
                        data={
                            "initialFatigue": new_fatigue,
                            "lastTrainedAt": now,
                            "fullRecoveryHours": rec_hours,
                        }
                    )
                else:
                    new_fatigue = min(100.0, add_fatigue)
                    await db.musclerecoverystate.create(
                        data={
                            "characterId": character_id,
                            "muscleGroup": m_key,
                            "initialFatigue": new_fatigue,
                            "lastTrainedAt": now,
                            "fullRecoveryHours": rec_hours,
                        }
                    )
            return
        except Exception:
            pass

    # Fallback to local SQLite if not connected to Prisma
    try:
        db_path = get_db_path()
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        now_iso = now.isoformat()
        for m_key, add_fatigue in fatigue_deltas.items():
            c.execute(
                "SELECT id, initialFatigue, fullRecoveryHours FROM MuscleRecoveryState WHERE characterId = ? AND muscleGroup = ?",
                (character_id, m_key)
            )
            row = c.fetchone()
            rec_hours = CANONICAL_MUSCLES.get(m_key, {}).get("recoveryHours", 48.0)
            if row:
                row_id, cur_ifat, cur_rh = row
                new_fatigue = min(100.0, max(add_fatigue, float(cur_ifat or 0.0) * 0.4 + add_fatigue))
                c.execute(
                    "UPDATE MuscleRecoveryState SET initialFatigue = ?, lastTrainedAt = ?, fullRecoveryHours = ?, updatedAt = ? WHERE id = ?",
                    (new_fatigue, now_iso, rec_hours, now_iso, row_id)
                )
            else:
                import uuid
                new_id = str(uuid.uuid4())
                new_fatigue = min(100.0, add_fatigue)
                c.execute(
                    "INSERT INTO MuscleRecoveryState (id, characterId, muscleGroup, initialFatigue, lastTrainedAt, fullRecoveryHours, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (new_id, character_id, m_key, new_fatigue, now_iso, rec_hours, now_iso, now_iso)
                )
        conn.commit()
        conn.close()
    except Exception:
        pass


# =======================================================================
# 📋 EXERCISE LIBRARY (ENRICHED CATALOG)
# =======================================================================
DEFAULT_EXERCISES = [
    {
        "id": "ex1",
        "name": "Barbell Bench Press",
        "primaryMuscle": "Chest",
        "secondaryMuscles": ["Triceps", "Front Delts"],
        "category": "STRENGTH",
        "equipment": "Barbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Lie flat on the bench, grip bar slightly wider than shoulder width, lower bar smoothly to mid-chest, press up explosively locking out."
    },
    {
        "id": "ex2",
        "name": "Barbell Back Squat",
        "primaryMuscle": "Quads",
        "secondaryMuscles": ["Glutes", "Hamstrings", "Lower Back"],
        "category": "STRENGTH",
        "equipment": "Barbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Place bar on upper traps, brace core, squat down until hips break parallel with knees, drive powerfully up through mid-foot."
    },
    {
        "id": "ex3",
        "name": "Barbell Deadlift",
        "primaryMuscle": "Lower Back",
        "secondaryMuscles": ["Hamstrings", "Glutes", "Lats", "Traps", "Forearms"],
        "category": "STRENGTH",
        "equipment": "Barbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Stand with feet hip-width apart, grip bar outside shins, engage lats, drive hips forward to pull bar upward keeping spine neutral."
    },
    {
        "id": "ex4",
        "name": "Overhead Barbell Press",
        "primaryMuscle": "Shoulders",
        "secondaryMuscles": ["Front Delts", "Triceps", "Traps", "Core"],
        "category": "STRENGTH",
        "equipment": "Barbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Grip bar just outside shoulders, press straight overhead clearing chin, lock out elbows with head pushing slightly forward."
    },
    {
        "id": "ex5",
        "name": "Dumbbell Bicep Curl",
        "primaryMuscle": "Biceps",
        "secondaryMuscles": ["Forearms"],
        "category": "HYPERTROPHY",
        "equipment": "Dumbbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Hold dumbbells at sides with palms facing forward, curl weights smoothly toward shoulders contracting biceps at apex, lower with control."
    },
    {
        "id": "ex6",
        "name": "Barbell Row",
        "primaryMuscle": "Lats",
        "secondaryMuscles": ["Rear Delts", "Biceps", "Traps", "Lower Back"],
        "category": "HYPERTROPHY",
        "equipment": "Barbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Hinge at hips with back flat at 45 degrees, pull barbell up to sternum squeezing shoulder blades together, lower under control."
    },
    {
        "id": "ex7",
        "name": "Incline Dumbbell Press",
        "primaryMuscle": "Chest",
        "secondaryMuscles": ["Front Delts", "Triceps"],
        "category": "HYPERTROPHY",
        "equipment": "Dumbbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Set bench to 30-degree incline, press dumbbells up over upper chest, lower with elbows at a 45-degree angle to torso."
    },
    {
        "id": "ex8",
        "name": "Pull Up",
        "primaryMuscle": "Lats",
        "secondaryMuscles": ["Biceps", "Forearms", "Rear Delts", "Abs"],
        "category": "STRENGTH",
        "equipment": "Bodyweight",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Grip bar overhand wider than shoulders, pull chest toward bar driving elbows down and back, lower to full dead hang."
    },
    {
        "id": "ex9",
        "name": "Tricep Rope Pushdown",
        "primaryMuscle": "Triceps",
        "secondaryMuscles": ["Forearms"],
        "category": "HYPERTROPHY",
        "equipment": "Cable",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Attach rope to high pulley, keep upper arms pinned to sides, push hands down and spread rope apart at bottom lockout."
    },
    {
        "id": "ex10",
        "name": "Dumbbell Lateral Raise",
        "primaryMuscle": "Shoulders",
        "secondaryMuscles": ["Traps"],
        "category": "HYPERTROPHY",
        "equipment": "Dumbbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Raise dumbbells out to sides leading with elbows until parallel to floor, pause momentarily, lower slowly."
    },
    {
        "id": "ex11",
        "name": "Dips",
        "primaryMuscle": "Chest",
        "secondaryMuscles": ["Triceps", "Front Delts"],
        "category": "HYPERTROPHY",
        "equipment": "Bodyweight",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Support body on parallel bars, lean slightly forward, lower until shoulders are below elbows, press up powerfully."
    },
    {
        "id": "ex12",
        "name": "Lat Pulldown",
        "primaryMuscle": "Lats",
        "secondaryMuscles": ["Biceps", "Rear Delts", "Forearms"],
        "category": "HYPERTROPHY",
        "equipment": "Cable",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Sit with thighs secured, grasp wide bar, pull down smoothly to upper chest, squeeze lats, return bar with control."
    },
    {
        "id": "ex13",
        "name": "Romanian Deadlift",
        "primaryMuscle": "Hamstrings",
        "secondaryMuscles": ["Glutes", "Lower Back", "Forearms"],
        "category": "HYPERTROPHY",
        "equipment": "Barbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Hold barbell with overhand grip, slight knee bend, push hips far back lowering bar along shins until hamstrings stretch, drive hips forward."
    },
    {
        "id": "ex14",
        "name": "Leg Press",
        "primaryMuscle": "Quads",
        "secondaryMuscles": ["Glutes", "Hamstrings", "Calves"],
        "category": "HYPERTROPHY",
        "equipment": "Machine",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Place feet shoulder-width on platform, release safety, lower weight until knees reach 90 degrees, press up without locking knees."
    },
    {
        "id": "ex15",
        "name": "Lying Leg Curl",
        "primaryMuscle": "Hamstrings",
        "secondaryMuscles": ["Calves"],
        "category": "HYPERTROPHY",
        "equipment": "Machine",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Lie facedown on machine with pad against lower calves, curl legs up toward glutes holding peak squeeze, lower with control."
    },
    {
        "id": "ex16",
        "name": "Calf Raises",
        "primaryMuscle": "Calves",
        "secondaryMuscles": [],
        "category": "HYPERTROPHY",
        "equipment": "Machine",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Stand on ball of feet on edge of platform, lower heels for deep calf stretch, raise up onto toes as high as possible."
    },
    {
        "id": "ex17",
        "name": "Cable Woodchoppers",
        "primaryMuscle": "Obliques",
        "secondaryMuscles": ["Abs", "Shoulders"],
        "category": "HYPERTROPHY",
        "equipment": "Cable",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Rotate torso pulling high cable handle diagonally down across body, bracing core through entire arc."
    },
    {
        "id": "ex18",
        "name": "Hanging Leg Raises",
        "primaryMuscle": "Abs",
        "secondaryMuscles": ["Obliques", "Forearms"],
        "category": "HYPERTROPHY",
        "equipment": "Bodyweight",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Hang from pull-up bar, raise legs smoothly until perpendicular to torso, avoid swinging, lower with strict control."
    },
    {
        "id": "ex19",
        "name": "Planks",
        "primaryMuscle": "Abs",
        "secondaryMuscles": ["Obliques", "Shoulders", "Glutes"],
        "category": "ENDURANCE",
        "equipment": "Bodyweight",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Rest on forearms and toes, maintain straight rigid line from head to heels, engage glutes and core continuously."
    },
    {
        "id": "ex20",
        "name": "Push-ups",
        "primaryMuscle": "Chest",
        "secondaryMuscles": ["Triceps", "Front Delts", "Abs"],
        "category": "ENDURANCE",
        "equipment": "Bodyweight",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Hands shoulder-width apart, lower chest to floor keeping body rigid, press up firmly to full arm extension."
    },
    {
        "id": "ex21",
        "name": "Face Pulls",
        "primaryMuscle": "Rear Delts",
        "secondaryMuscles": ["Traps", "Shoulders"],
        "category": "HYPERTROPHY",
        "equipment": "Cable",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Attach rope to eye level pulley, pull hands toward eyes while externally rotating shoulders, pulling elbows high and back."
    },
    {
        "id": "ex22",
        "name": "Bulgarian Split Squats",
        "primaryMuscle": "Quads",
        "secondaryMuscles": ["Glutes", "Hamstrings"],
        "category": "HYPERTROPHY",
        "equipment": "Dumbbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Elevate rear foot on bench, lower front thigh until parallel to floor, drive up through front heel."
    },
    {
        "id": "ex23",
        "name": "Barbell Shrugs",
        "primaryMuscle": "Traps",
        "secondaryMuscles": ["Forearms"],
        "category": "HYPERTROPHY",
        "equipment": "Barbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Hold barbell with overhand grip, shrug shoulders straight up toward ears, hold peak contraction for 1 second, lower smoothly."
    },
    {
        "id": "ex24",
        "name": "Hip Thrusts",
        "primaryMuscle": "Glutes",
        "secondaryMuscles": ["Hamstrings", "Quads"],
        "category": "STRENGTH",
        "equipment": "Barbell",
        "trackingMetrics": "Weight, Reps",
        "instructions": "Upper back against bench, barbell across hips, drive hips upward until thighs and torso align, squeeze glutes at apex."
    }
]

async def seed_exercises_auto():
    count = await db.exercisedefinition.count()
    if count == 0:
        for ex in DEFAULT_EXERCISES:
            sec_json = json.dumps(ex.get("secondaryMuscles", []))
            await db.exercisedefinition.create(
                data={
                    "id": ex["id"],
                    "name": ex["name"],
                    "primaryMuscle": ex["primaryMuscle"],
                    "secondaryMuscles": sec_json,
                    "category": ex.get("category", "HYPERTROPHY"),
                    "instructions": ex.get("instructions"),
                    "equipment": ex["equipment"],
                    "trackingMetrics": ex["trackingMetrics"]
                }
            )

# =======================================================================
# 🌐 API ENDPOINTS
# =======================================================================

class SetInput(BaseModel):
    exerciseId: str
    weight: float
    reps: int
    rpe: Optional[float] = None

class WorkoutLogInput(BaseModel):
    characterId: str
    durationSeconds: int
    sets: List[SetInput]
    sex: Optional[str] = "M"
    bodyweight: Optional[float] = 70.0
    notes: Optional[str] = None

@router.get("/muscle-status/{character_id}")
async def get_muscle_status(character_id: str):
    """
    Returns real-time computed muscle recovery freshness %, fatigue levels,
    hours until full recovery, and summary counts for all 16 muscle groups.
    Never throws 404 for missing/guest users, returns default 100% fresh status.
    """
    try:
        from db_utils import ensure_character_exists
        char = await ensure_character_exists(character_id)
        cid = char.id if char else character_id
        return await compute_muscle_status_dict(cid)
    except Exception as e:
        print(f"[Workouts API Warning] get_muscle_status fallback for {character_id}: {e}")
        return await compute_muscle_status_dict(character_id)

@router.post("/reset-recovery/{character_id}")
async def reset_muscle_recovery(character_id: str, current_user: dict = Depends(get_current_user)):
    """
    Utility endpoint: Resets all muscle fatigue levels to 0% (100% Fresh).
    """
    is_owner = await verify_character_ownership(character_id, current_user)
    if not is_owner:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this character.")

    cid = character_id
    try:
        from db_utils import ensure_character_exists
        char = await ensure_character_exists(character_id)
        if char:
            cid = char.id
    except Exception:
        pass

    if db.is_connected():
        try:
            await db.musclerecoverystate.delete_many(where={"characterId": cid})
        except Exception:
            pass

    try:
        db_path = get_db_path()
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("DELETE FROM MuscleRecoveryState WHERE characterId = ?", (cid,))
        conn.commit()
        conn.close()
    except Exception:
        pass
    
    return {
        "message": "All muscle groups reset to 100% Fresh.",
        "status": await compute_muscle_status_dict(cid)
    }


async def _record_workout(data: WorkoutLogInput):
    """
    Logs a workout session, computes 1RM PRs, applies Boss damage,
    updates muscle recovery fatigue and timestamps, and rewards character stats & EXP.
    """
    from db_utils import ensure_character_exists
    character = await ensure_character_exists(data.characterId)
    char_id = character.id if character else data.characterId
    
    # Create the WorkoutSession
    session = await db.workoutsession.create(
        data={
            "characterId": char_id,
            "durationSeconds": data.durationSeconds
        }
    )


    
    results = []
    exercise_set_counts: Dict[str, int] = {}
    
    # Process each set in the workout session
    for s in data.sets:
        exercise_set_counts[s.exerciseId] = exercise_set_counts.get(s.exerciseId, 0) + 1
        
        # Calculate Estimated 1RM
        e1rm = calculate_e1rm(s.weight, s.reps)
        
        # Fetch the Exercise Standard based on sex and bodyweight
        standard = await get_exercise_standard(db, s.exerciseId, data.sex, data.bodyweight)
        
        # Determine Rank
        rank = "E"
        if standard:
            rank = determine_rank(e1rm, standard)
            
        # Determine if this is a new PR
        previous_sets = await db.workoutset.find_many(
            where={
                "session": {
                    "characterId": data.characterId
                },
                "exerciseId": s.exerciseId
            }
        )
        
        is_pr = True
        for prev_set in previous_sets:
            prev_e1rm = calculate_e1rm(prev_set.weight, prev_set.reps)
            if prev_e1rm >= e1rm:
                is_pr = False
                break
                
        # Save the WorkoutSet
        new_set = await db.workoutset.create(
            data={
                "sessionId": session.id,
                "exerciseId": s.exerciseId,
                "weight": s.weight,
                "reps": s.reps,
                "rpe": s.rpe,
                "isPr": is_pr
            }
        )
        
        # Deal damage to Boss
        boss_damage_results = await deal_boss_damage(db, data.characterId, "WORKOUT", s.exerciseId)
        
        results.append({
            "setId": new_set.id,
            "exerciseId": s.exerciseId,
            "e1rm": round(e1rm, 2),
            "rank": rank,
            "isPr": is_pr,
            "bossDamage": boss_damage_results
        })
        
    # Update Real-Time Muscle Recovery Fatigue
    await update_character_muscle_fatigue(data.characterId, exercise_set_counts)

    
    # Calculate Stat Rewards based on Muscle Groups logged
    strength_inc = 0
    endurance_inc = 0
    consistency_inc = 1
    discipline_inc = 2  # Session Finish reward
    recovery_inc = 2    # Session Finish reward

    for s in data.sets:
        ex_def = await db.exercisedefinition.find_unique(where={"id": s.exerciseId})
        muscle = (ex_def.primaryMuscle.lower() if ex_def else "chest")
        
        if muscle in ["chest", "back", "legs", "shoulders", "arms", "biceps", "triceps", "quads", "hamstrings", "glutes"]:
            strength_inc += 1
            endurance_inc += 1
        elif muscle in ["core", "abs", "obliques", "cardio"]:
            endurance_inc += 2
            consistency_inc += 1
        else:
            strength_inc += 1

    exp_reward = len(data.sets) * 50
    gold_reward = len(data.sets) * 10
    
    # Calculate PR bonuses
    pr_count = sum(1 for r in results if r.get("isPr"))
    pr_gems = pr_count * 10
    pr_tokens = pr_count * 25
    pr_gold = pr_count * 50

    total_gold = gold_reward + pr_gold
    
    await db.character.update(
        where={"id": data.characterId},
        data={
            "exp": {"increment": exp_reward},
            "gold": {"increment": total_gold},
            "gems": {"increment": pr_gems},
            "towerTokens": {"increment": pr_tokens},
            "stats": {
                "update": {
                    "strength": {"increment": max(1, strength_inc)},
                    "endurance": {"increment": max(1, endurance_inc)},
                    "discipline": {"increment": discipline_inc},
                    "recovery": {"increment": recovery_inc},
                    "consistency": {"increment": max(1, consistency_inc)},
                }
            }
        }
    )

    if pr_count > 0:
        await db.economylog.create(
            data={
                "characterId": data.characterId,
                "currency": "GEMS",
                "amount": pr_gems,
                "reason": f"New PR Achieved ({pr_count} PR sets)",
                "source": "WORKOUT_PR"
            }
        )
        await db.economylog.create(
            data={
                "characterId": data.characterId,
                "currency": "TOWER_TOKENS",
                "amount": pr_tokens,
                "reason": f"New PR Achieved ({pr_count} PR sets)",
                "source": "WORKOUT_PR"
            }
        )
        await db.progresshistory.create(
            data={
                "characterId": data.characterId,
                "type": "WORKOUT_PR",
                "amount": pr_gems,
                "description": f"🔥 New Personal Record! Earned +{pr_gold} Gold, +{pr_gems} Gems, +{pr_tokens} Tower Tokens!"
            }
        )
        
    # Auto-Sync workout milestone achievements
    await sync_achievements_for_character(data.characterId)
    
    # Fetch updated muscle recovery status
    updated_recovery = compute_muscle_status_dict(data.characterId)
    
    return {
        "sessionId": session.id,
        "message": "Workout successfully logged, muscle fatigue calculated, character attributes enhanced, and boss damage applied.",
        "results": results,
        "rewards": {
            "exp": exp_reward,
            "gold": total_gold,
            "gems": pr_gems,
            "towerTokens": pr_tokens,
            "statGains": {
                "strength": max(1, strength_inc),
                "endurance": max(1, endurance_inc),
                "discipline": discipline_inc,
                "recovery": recovery_inc,
                "consistency": max(1, consistency_inc),
            }
        },
        "recoveryStatus": updated_recovery
    }

@router.post("/log")
async def log_workout(data: WorkoutLogInput, current_user: dict = Depends(get_current_user)):
    """Logs a workout from the authenticated Ascend client."""
    is_owner = await verify_character_ownership(data.characterId, current_user)
    if not is_owner:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this character.")
    return await _record_workout(data)


async def log_workout_from_integration(data: WorkoutLogInput):
    """Internal trusted-client adapter; never exposed as an HTTP route."""
    return await _record_workout(data)


@router.post("/finish")
async def finish_workout(data: WorkoutLogInput, current_user: dict = Depends(get_current_user)):
    """Alias endpoint for finishing workout sessions."""
    return await log_workout(data, current_user)

@router.get("/ranks/{character_id}")
async def get_workout_ranks(character_id: str):
    """
    Computes the max e1RM and current Rank for all exercises the character has logged.
    """
    sessions = await db.workoutsession.find_many(
        where={"characterId": character_id},
        include={"sets": {"include": {"exercise": True}}}
    )
    
    exercise_maxes = {}
    for session in sessions:
        for s in session.sets:
            e1rm = calculate_e1rm(s.weight, s.reps)
            ex_id = s.exerciseId
            if ex_id not in exercise_maxes or e1rm > exercise_maxes[ex_id]["e1rm"]:
                exercise_maxes[ex_id] = {
                    "exercise": s.exercise,
                    "e1rm": e1rm
                }
                
    results = []
    ranks_ladder = ["E", "D", "C", "B", "A", "S", "SS", "SSS"]
    
    for ex_id, data in exercise_maxes.items():
        ex = data["exercise"]
        e1rm = data["e1rm"]
        standard = await get_exercise_standard(db, ex_id, "M", 70.0)
        
        current_rank = "E"
        next_rank = "D"
        next_threshold = 0
        progress = 0
        
        if standard:
            current_rank = determine_rank(e1rm, standard)
            
            thresholds = {
                "E": standard.rankE,
                "D": standard.rankD,
                "C": standard.rankC,
                "B": standard.rankB,
                "A": standard.rankA,
                "S": standard.rankS,
                "SS": standard.rankSS,
                "SSS": standard.rankSSS
            }
            
            idx = ranks_ladder.index(current_rank)
            if idx < len(ranks_ladder) - 1:
                next_rank = ranks_ladder[idx + 1]
                next_threshold = thresholds[next_rank]
                prev_threshold = thresholds[current_rank]
                
                range_size = next_threshold - prev_threshold
                if range_size > 0:
                    progress = ((e1rm - prev_threshold) / range_size) * 100
                    progress = min(100, max(0, progress))
            else:
                next_rank = "MAX"
                next_threshold = thresholds["SSS"]
                progress = 100
                
        results.append({
            "exerciseId": ex_id,
            "exerciseName": ex.name,
            "e1rm": round(e1rm, 2),
            "currentRank": current_rank,
            "nextRank": next_rank,
            "nextThreshold": next_threshold,
            "progress": round(progress, 1)
        })
        
    return {"ranks": results}

@router.get("/exercises")
async def get_exercises():
    """
    Returns all cataloged exercises with primary and secondary muscle mappings.
    """
    await seed_exercises_auto()
    
    # Return enriched exercises
    db_exercises = await db.exercisedefinition.find_many(
        order={"name": "asc"}
    )
    
    out = []
    for ex in db_exercises:
        sec = []
        if hasattr(ex, "secondaryMuscles") and ex.secondaryMuscles:
            try:
                sec = json.loads(ex.secondaryMuscles)
            except Exception:
                sec = [s.strip() for s in ex.secondaryMuscles.split(",") if s.strip()]
                
        out.append({
            "id": ex.id,
            "name": ex.name,
            "primaryMuscle": ex.primaryMuscle,
            "secondaryMuscles": sec,
            "category": getattr(ex, "category", "HYPERTROPHY"),
            "instructions": getattr(ex, "instructions", None),
            "equipment": ex.equipment,
            "trackingMetrics": ex.trackingMetrics
        })
        
    return out
