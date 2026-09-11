from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from db import db
from db_utils import ensure_character_exists
from schemas.aira import AIRAChatSchema, AIRAChatResponseSchema, AIRAExecuteActionSchema, AIRACombatAnalysisSchema
from schemas.aira_operations import AIRAOperationExecuteRequest, AIRAOperationPreviewRequest, AIRAOperationRequest
from auth_utils import get_current_automation_user, get_current_user, verify_character_ownership
from services.aira_chat_preview import normalize_chat_action_candidate
from services.aira_audit_store import LocalAuditConfigurationError, get_aira_audit_store
from services.aira_domain_adapters import execute_aira_domain_operation
from services.aira_execution_registry import execute_confirmed_aira_operation
from services.aira_operation_registry import execute_aira_read_operation
from services.aira_preview_registry import create_aira_preview
from services.aira_service import (
    generate_aira_response,
    analyze_tower_combat,
    generate_daily_report,
    analyze_boss_trajectory,
    analyze_workout_performance,
    analyze_shop_efficiency
)

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/aira", tags=["aira"])

# These draft handlers predate the signed-preview Phase B design.  They must
# never be reachable from the legacy execute endpoint while Phase A is live.
_PHASE_B_ACTIONS_REQUIRING_SIGNED_PREVIEW = frozenset({
    "create_new_mission", "delete_mission", "create_habit", "update_habit", "archive_habit",
    "equip_inventory_item", "unequip_inventory_item", "buy_shop_item",
    "spend_skill_points", "equip_beast", "incubate_egg",
    "claim_achievement_reward", "create_automation_rule",
    "toggle_automation_rule", "delete_automation_rule",
    "create_calendar_schedule", "delete_calendar_schedule",
    "create_calendar_schedule_multi",
})



@router.post("/operations/read")
async def read_aira_operation(
    payload: AIRAOperationRequest,
    current_user: dict = Depends(get_current_automation_user),
):
    """Read owned Core context through AIRA's typed, metadata-only contract."""
    return await execute_aira_read_operation(payload, current_user)


@router.post("/operations/preview")
async def preview_aira_operation(
    payload: AIRAOperationPreviewRequest,
    current_user: dict = Depends(get_current_automation_user),
):
    """Create a signed, expiring preview; this endpoint never mutates Core."""
    return await create_aira_preview(payload, current_user)


@router.post("/operations/execute")
async def execute_aira_operation(
    payload: AIRAOperationExecuteRequest,
    current_user: dict = Depends(get_current_automation_user),
):
    """Execute one explicitly confirmed local AIRA operation exactly once."""
    try:
        audit_store = get_aira_audit_store()
    except LocalAuditConfigurationError as error:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)) from error

    async def execute_domain_operation(operation: str, character_id: str, arguments: dict):
        return await execute_aira_domain_operation(operation, character_id, arguments, current_user)

    return await execute_confirmed_aira_operation(
        payload,
        current_user,
        execute_domain_operation,
        audit_store,
    )


async def get_character_context_dict(character_id: str) -> dict:
    """Helper to fetch full character dictionary including stats for AIRA context."""
    try:
        from db import ensure_db_connected
        await ensure_db_connected()
        character = await ensure_character_exists(character_id)
        if character:
            if not getattr(character, "stats", None):
                reloaded = await db.character.find_unique(
                    where={"id": character.id},
                    include={"stats": True}
                )
                if reloaded:
                    character = reloaded
            return character.model_dump() if hasattr(character, "model_dump") else dict(character)
    except Exception as e:
        print(f"[AIRA Router get_character_context_dict Warning]: {e}")

    return {
        "name": "Master",
        "level": 1,
        "power": 50,
        "rank": "F",
        "gold": 0,
        "stats": {
            "strength": 1, "knowledge": 1, "recovery": 1,
            "focus": 1, "discipline": 1, "endurance": 1, "consistency": 1
        }
    }



@router.post("/chat", response_model=AIRAChatResponseSchema)
@limiter.limit("5/minute")
async def chat_with_aira(
    request: Request,
    payload: AIRAChatSchema,
    current_user: dict = Depends(get_current_automation_user),
):
    """
    POST /api/aira/chat
    Accepts user prompt and character ID, injects current character stats as context,
    and returns AIRA's Ciel-style response. Rate-limited to 5 requests per minute.
    """
    character_id = payload.characterId or "char-id-123"
    if not await verify_character_ownership(character_id, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this character.")
    context_dict = await get_character_context_dict(character_id)

    response_data = await generate_aira_response(
        prompt=payload.prompt,
        character_context=context_dict,
        character_id=character_id
    )

    pending_action = response_data.get("pending_action")
    if pending_action:
        candidate = normalize_chat_action_candidate(
            pending_action.get("action_type", ""), pending_action.get("action_args", {})
        )
        if candidate:
            preview = await create_aira_preview(
                AIRAOperationPreviewRequest(
                    characterId=character_id,
                    requestId=f"aira-chat-{__import__('uuid').uuid4()}",
                    operation=candidate["operation"],
                    arguments=candidate["arguments"],
                ),
                current_user,
            )
            pending_action = {
                "action_type": candidate["operation"],
                "action_args": preview["normalizedArguments"],
                "summary": pending_action.get("summary") or preview["summary"],
                "operation": preview["operation"],
                "requestId": preview["requestId"],
                "confirmationToken": preview["confirmationToken"],
                "expiresAt": preview["expiresAt"],
                "warnings": preview["warnings"],
            }

    return {
        "response": response_data.get("response", "Analysis complete."),
        "pending_action": pending_action
    }


@router.post("/execute")
async def execute_aira_action(payload: AIRAExecuteActionSchema):
    """
    POST /api/aira/execute
    Executes a mutative action that was confirmed by the user.
    """
    character_id = payload.characterId or "char-id-123"
    action_type = payload.action_type
    args = payload.action_args

    if action_type in _PHASE_B_ACTIONS_REQUIRING_SIGNED_PREVIEW:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This action requires the signed preview flow planned for AIRA Phase B.",
        )
    
    if action_type == "log_completed_workout":
        # Simplified workout logging for AI
        from routers.workouts import WorkoutLogInput, SetInput, log_workout
        
        # We need an exercise ID. In a real app we'd look it up.
        # For now, we will create a dummy or try to find one.
        exercise_name = args.get("exercise_name", "Unknown Exercise")
        exercise = await db.exercise.find_first(where={"name": exercise_name})
        if not exercise:
            exercise = await db.exercise.create(data={
                "name": exercise_name,
                "targetMuscleGroup": "FULL_BODY",
                "mechanic": "COMPOUND"
            })
            
        sets_count = int(args.get("sets", 1))
        reps_count = int(args.get("reps", 1))
        weight = float(args.get("weight", 0.0))
        
        sets = []
        for _ in range(sets_count):
            sets.append(SetInput(exerciseId=exercise.id, weight=weight, reps=reps_count))
            
        workout_data = WorkoutLogInput(
            characterId=character_id,
            durationSeconds=1800, # Assume 30 mins
            sets=sets
        )
        
        result = await log_workout(workout_data)
        return {"success": True, "message": result["message"]}
        
    elif action_type == "complete_daily_mission":
        mission_id = args.get("mission_id")
        if not mission_id:
            raise HTTPException(status_code=400, detail="Missing mission_id")
            
        from routers.missions import complete_mission
        from schemas.habit import MissionCompleteSchema
        
        schema = MissionCompleteSchema(
            completionType="SYSTEM_AUTO",
            expEarned=100,
            statsEarned={}
        )
        await complete_mission(mission_id, schema)
        return {"success": True, "message": f"Mission '{args.get('mission_title', 'Unknown')}' completed successfully."}
        
    elif action_type == "create_new_mission":
        # Create a basic mission directly
        title = args.get("title", "New Mission")
        description = args.get("description", "")
        stat_type = args.get("stat_type", "strength")
        
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        
        await db.mission.create(data={
            "characterId": character_id,
            "title": title,
            "description": description,
            "statType": stat_type,
            "expReward": 50,
            "date": now,
            "status": "PENDING"
        })
        
        return {"success": True, "message": f"Mission '{title}' created successfully."}
        
    elif action_type == "generate_progression_plan":
        # Extract habits from args, or fallback to some default if not parsed well
        # In a real app we'd ask LLM to provide a JSON array, here we might have generic args
        title1 = args.get("habit1_title", "Read for 30m")
        title2 = args.get("habit2_title", "Code for 1h")
        title3 = args.get("habit3_title", "Review notes")
        
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        
        # Batch create habits
        await db.habit.create(data={
            "characterId": character_id,
            "name": title1,
            "category": "Mind",
            "difficulty": "MEDIUM",
            "primaryStat": "knowledge",
            "status": "ACTIVE"
        })
        await db.habit.create(data={
            "characterId": character_id,
            "name": title2,
            "category": "Mind",
            "difficulty": "HARD",
            "primaryStat": "focus",
            "status": "ACTIVE"
        })
        await db.habit.create(data={
            "characterId": character_id,
            "name": title3,
            "category": "Mind",
            "difficulty": "EASY",
            "primaryStat": "discipline",
            "status": "ACTIVE"
        })
        
        return {"success": True, "message": f"Successfully initialized new progression plan."}
        
    elif action_type == "delete_mission":
        mission_id = args.get("mission_id")
        if not mission_id:
            raise HTTPException(status_code=400, detail="Missing mission_id")
        await db.mission.delete(where={"id": mission_id})
        return {"success": True, "message": f"Mission '{args.get('mission_title', 'Mission')}' successfully removed."}

    elif action_type == "create_habit":
        name = args.get("name", "New Habit")
        category = args.get("category", "General")
        difficulty = args.get("difficulty", "MEDIUM").upper()
        primary_stat = args.get("primary_stat", "strength")
        description = args.get("description", "")

        habit = await db.habit.create(data={
            "characterId": character_id,
            "name": name,
            "description": description,
            "category": category,
            "difficulty": difficulty,
            "primaryStat": primary_stat,
            "status": "ACTIVE"
        })
        # Create default metrics
        await db.habitmetrics.create(data={
            "habitId": habit.id,
            "habitStrength": 100.0,
            "successRate": 0.0,
            "completionRate": 0.0
        })
        return {"success": True, "message": f"Habit '{name}' successfully initialized in category '{category}'."}

    elif action_type == "update_habit":
        habit_id = args.get("habit_id")
        if not habit_id:
            raise HTTPException(status_code=400, detail="Missing habit_id")
        update_data = {}
        if args.get("name"):
            update_data["name"] = args.get("name")
        if args.get("difficulty"):
            update_data["difficulty"] = args.get("difficulty").upper()
        
        await db.habit.update(where={"id": habit_id}, data=update_data)
        return {"success": True, "message": f"Habit updated successfully."}

    elif action_type == "archive_habit":
        habit_id = args.get("habit_id")
        if not habit_id:
            raise HTTPException(status_code=400, detail="Missing habit_id")
        await db.habit.update(where={"id": habit_id}, data={"status": "ARCHIVED"})
        return {"success": True, "message": f"Habit '{args.get('habit_name', 'Habit')}' archived successfully."}

    elif action_type == "equip_inventory_item":
        player_item_id = args.get("player_item_id")
        if not player_item_id:
            raise HTTPException(status_code=400, detail="Missing player_item_id")
        # Fetch item to see type
        p_item = await db.playeritem.find_unique(where={"id": player_item_id}, include={"itemDefinition": True})
        if not p_item or p_item.characterId != character_id:
            raise HTTPException(status_code=404, detail="Item not found in inventory")
            
        # Unequip any item of same type
        if p_item.itemDefinition:
            same_type_items = await db.playeritem.find_many(
                where={"characterId": character_id, "isEquipped": True},
                include={"itemDefinition": True}
            )
            for item in same_type_items:
                if item.itemDefinition and item.itemDefinition.type == p_item.itemDefinition.type and item.id != player_item_id:
                    await db.playeritem.update(where={"id": item.id}, data={"isEquipped": False})
                    
        await db.playeritem.update(where={"id": player_item_id}, data={"isEquipped": True})
        return {"success": True, "message": f"Equipped '{p_item.itemDefinition.name if p_item.itemDefinition else 'Item'}'."}

    elif action_type == "unequip_inventory_item":
        player_item_id = args.get("player_item_id")
        if not player_item_id:
            raise HTTPException(status_code=400, detail="Missing player_item_id")
        await db.playeritem.update(where={"id": player_item_id}, data={"isEquipped": False})
        return {"success": True, "message": f"Unequipped '{args.get('item_name', 'Item')}'."}

    elif action_type == "buy_shop_item":
        shop_item_id = args.get("shop_item_id")
        price = int(args.get("price", 0))
        currency_type = args.get("currency_type", "GOLD").upper()

        character = await ensure_character_exists(character_id)
        if currency_type == "GEMS":
            if getattr(character, "gems", 0) < price:
                raise HTTPException(status_code=400, detail=f"Insufficient Gems. Required: {price}, Available: {character.gems}")
            await db.character.update(where={"id": character.id}, data={"gems": character.gems - price})
        else:
            if getattr(character, "gold", 0) < price:
                raise HTTPException(status_code=400, detail=f"Insufficient Gold. Required: {price}, Available: {character.gold}")
            await db.character.update(where={"id": character.id}, data={"gold": character.gold - price})

        # Add item to player's inventory
        shop_item = await db.shopitem.find_unique(where={"id": shop_item_id})
        if shop_item:
            await db.playeritem.create(data={
                "characterId": character.id,
                "itemDefinitionId": shop_item.itemId,
                "quantity": 1,
                "isEquipped": False
            })
            await db.economylog.create(data={
                "characterId": character.id,
                "currency": currency_type,
                "amount": -price,
                "reason": f"Purchased shop item",
                "source": "SHOP"
            })
        return {"success": True, "message": f"Successfully purchased '{args.get('item_name', 'Item')}' for {price} {currency_type}."}

    elif action_type == "spend_skill_points":
        skill_id = args.get("skill_id")
        character = await ensure_character_exists(character_id)
        if getattr(character, "availableSP", 0) < 1:
            raise HTTPException(status_code=400, detail="Insufficient Skill Points (SP)")

        # Decrement SP
        await db.character.update(where={"id": character.id}, data={"availableSP": character.availableSP - 1})
        # Upgrade or unlock skill
        existing = await db.playerskill.find_unique(where={"characterId_skillDefinitionId": {"characterId": character.id, "skillDefinitionId": skill_id}})
        if existing:
            await db.playerskill.update(where={"id": existing.id}, data={"currentLevel": existing.currentLevel + 1})
        else:
            await db.playerskill.create(data={
                "characterId": character.id,
                "skillDefinitionId": skill_id,
                "currentLevel": 1
            })
        return {"success": True, "message": f"Skill '{args.get('skill_name', 'Skill')}' successfully upgraded."}

    elif action_type == "equip_beast":
        beast_id = args.get("beast_id")
        if not beast_id:
            raise HTTPException(status_code=400, detail="Missing beast_id")
        # Unequip others
        await db.beast.update_many(where={"characterId": character_id, "isEquipped": True}, data={"isEquipped": False})
        # Equip selected
        await db.beast.update(where={"id": beast_id}, data={"isEquipped": True})
        await db.character.update(where={"id": character_id}, data={"equippedBeastId": beast_id})
        return {"success": True, "message": f"Equipped companion beast '{args.get('beast_name', 'Beast')}'."}

    elif action_type == "incubate_egg":
        egg_type = args.get("egg_type", "ELEMENTAL").upper()
        await db.egg.create(data={
            "characterId": character_id,
            "name": f"{egg_type.capitalize()} Egg",
            "eggType": egg_type,
            "status": "INCUBATING",
            "targetSteps": 5000,
            "currentSteps": 0
        })
        return {"success": True, "message": f"Started incubation of {egg_type} Egg. 5,000 steps to hatch."}

    elif action_type == "claim_achievement_reward":
        achievement_id = args.get("achievement_id")
        char_ach = await db.characterachievement.find_unique(
            where={"characterId_achievementId": {"characterId": character_id, "achievementId": achievement_id}},
            include={"achievement": True}
        )
        if not char_ach or char_ach.isClaimed:
            raise HTTPException(status_code=400, detail="Achievement already claimed or not found")

        # Mark claimed and award rewards
        await db.characterachievement.update(where={"id": char_ach.id}, data={"isClaimed": True})
        ach = char_ach.achievement
        if ach:
            char = await ensure_character_exists(character_id)
            new_gold = char.gold + (ach.rewardGold or 0)
            new_gems = char.gems + (ach.rewardGems or 0)
            await db.character.update(where={"id": character_id}, data={"gold": new_gold, "gems": new_gems})
        return {"success": True, "message": f"Claimed achievement rewards: +{ach.rewardGold if ach else 0} Gold, +{ach.rewardGems if ach else 0} Gems."}

    elif action_type == "create_automation_rule":
        name = args.get("name", "New Automation")
        trigger_type = args.get("trigger_type", "VISION_DETECTION")
        action_type_val = args.get("action_type", "COMPLETE_HABIT")

        rule = await db.automationrule.create(data={
            "characterId": character_id,
            "name": name,
            "enabled": True,
            "triggerType": trigger_type,
            "matchMode": "all",
            "conditionsJson": "[]",
            "actionsJson": f'[{{"type": "{action_type_val}"}}]',
            "cooldownSeconds": 300
        })
        return {"success": True, "message": f"Automation rule '{name}' successfully created and active."}

    elif action_type == "toggle_automation_rule":
        rule_id = args.get("rule_id")
        enabled = bool(args.get("enabled", True))
        await db.automationrule.update(where={"id": rule_id}, data={"enabled": enabled})
        status_text = "Enabled" if enabled else "Paused"
        return {"success": True, "message": f"Automation rule '{args.get('rule_name', 'Rule')}' is now {status_text}."}

    elif action_type == "delete_automation_rule":
        rule_id = args.get("rule_id")
        await db.automationrule.delete(where={"id": rule_id})
        return {"success": True, "message": f"Automation rule '{args.get('rule_name', 'Rule')}' deleted."}

    else:
        raise HTTPException(status_code=400, detail=f"Unknown action_type: {action_type}")


@router.post("/analyze-combat")
async def analyze_combat(payload: AIRACombatAnalysisSchema):
    """
    POST /api/aira/analyze-combat
    Accepts combat logs and character data, processes tactical combat analysis through AIRA,
    and returns her analytical recommendation.
    """
    character_id = payload.characterId or "char-id-123"
    context_dict = await get_character_context_dict(character_id)

    analysis_text = await analyze_tower_combat(
        character_data=context_dict,
        battle_logs=payload.battleLogs,
        floor_number=payload.floorNumber or 1,
        is_victory=payload.isVictory,
        turns_elapsed=payload.turnsElapsed,
        player_hp=payload.playerHpRemaining,
    )

    return {"analysis": analysis_text}


@router.get("/daily-report/{character_id}")
async def get_daily_report(character_id: str):
    """
    GET /api/aira/daily-report/{character_id}
    Aggregates character consistency, pending habits, and power score to generate AIRA's
    signature morning briefing (<< Report. >>).
    """
    context_dict = await get_character_context_dict(character_id)

    # Count pending habits for today
    pending_count = await db.mission.count(
        where={"characterId": character_id, "status": "PENDING"}
    )

    report_text = await generate_daily_report(
        character_context=context_dict,
        pending_habits_count=pending_count,
    )

    return {"report": report_text}


@router.get("/status/{character_id}")
async def get_system_status(character_id: str):
    """
    GET /api/aira/status/{character_id}
    Retrieves proactive insights and warnings for the Attention Panel.
    """
    from services.aira_service import generate_proactive_insight
    
    insight = await generate_proactive_insight(character_id)
    
    if insight:
        return {"status": "warning", "message": insight}
    else:
        return {"status": "optimal", "message": "System optimal. No critical warnings."}


@router.get("/boss-trajectory/{character_id}/{boss_id}")
async def get_boss_trajectory(character_id: str, boss_id: str):
    """
    GET /api/aira/boss-trajectory/{character_id}/{boss_id}
    Retrieves Boss data, Damage Log history, and generates Ciel's tactical coaching on trajectory.
    """
    context_dict = await get_character_context_dict(character_id)
    
    # Fetch Boss
    boss = await db.boss.find_first(
        where={"id": boss_id, "characterId": character_id},
        include={"damageLogs": {"order": {"createdAt": "desc"}}}
    )
    if not boss:
        raise HTTPException(status_code=404, detail="Boss not found")
        
    boss_dict = boss.model_dump() if hasattr(boss, "model_dump") else dict(boss)
    # Ensure datetime objects are converted to strings if needed for JSON serialization later, but we just need them in memory here
    if "deadline" in boss_dict and boss_dict["deadline"]:
        boss_dict["deadline"] = str(boss_dict["deadline"])
        
    damage_logs = [log.model_dump() if hasattr(log, "model_dump") else dict(log) for log in boss_dict.get("damageLogs", [])]
    
    analysis_text = await analyze_boss_trajectory(
        character_context=context_dict,
        boss_data=boss_dict,
        damage_logs=damage_logs,
    )

    return {"analysis": analysis_text}

@router.post("/analyze-workout")
async def analyze_workout(payload: AIRAChatSchema):
    """
    POST /api/aira/analyze-workout
    Takes standard AIRAChatSchema. Analyzes the character's recent workout ranks 
    and returns a tactical Ciel assessment.
    """
    from routers.workouts import get_workout_ranks
    
    character_id = payload.characterId or "char-id-123"
    context_dict = await get_character_context_dict(character_id)
    
    ranks_res = await get_workout_ranks(character_id)
    workout_ranks = ranks_res.get("ranks", [])
    
    analysis_text = await analyze_workout_performance(
        character_context=context_dict,
        workout_ranks=workout_ranks
    )
    
    return {"analysis": analysis_text}

@router.get("/shop-analysis/{character_id}")
async def get_shop_analysis(character_id: str):
    """
    GET /api/aira/shop-analysis/{character_id}
    Retrieves Shop items, character's equipped inventory, and generates Ciel's tactical coaching on optimal purchases.
    """
    context_dict = await get_character_context_dict(character_id)
    
    # Fetch shop items
    shop_items = await db.shopitem.find_many(include={"item": True})
    shop_items_dict = []
    for si in shop_items:
        s_dict = si.model_dump() if hasattr(si, "model_dump") else dict(si)
        if si.item:
            i_dict = si.item.model_dump() if hasattr(si.item, "model_dump") else dict(si.item)
            s_dict.update(i_dict)
            s_dict['name'] = si.item.name
            s_dict['type'] = si.item.type
            s_dict['rarity'] = si.item.rarity
        shop_items_dict.append(s_dict)
        
    # Fetch equipped inventory
    inventory = await db.playeritem.find_many(
        where={"characterId": character_id, "isEquipped": True},
        include={"itemDefinition": True}
    )
    inv_dict = []
    for inv in inventory:
        i_dict = inv.itemDefinition.model_dump() if hasattr(inv.itemDefinition, "model_dump") else dict(inv.itemDefinition)
        inv_dict.append(i_dict)
        
    analysis_text = await analyze_shop_efficiency(
        character_context=context_dict,
        shop_items=shop_items_dict,
        inventory=inv_dict
    )

    return {"analysis": analysis_text}
