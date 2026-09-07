from fastapi import APIRouter, HTTPException
from typing import List
from prisma import Prisma
from db import db
from db_utils import ensure_character_exists
from schemas.bosses import BossCreate, BossSchema
from services.boss_engine import calculate_boss_hp, generate_boss_phases

router = APIRouter()

@router.post("/{character_id}", response_model=BossSchema)
async def create_boss(character_id: str, payload: BossCreate):
    try:
        character = await ensure_character_exists(character_id)
        char_id = character.id if character else character_id
        
        # Existing clients may omit ritual calibration and retain difficulty-derived HP.
        max_hp = payload.maxHp or calculate_boss_hp(payload.difficulty)

        if payload.rewardTitle:
            existing_title = await db.title.find_unique(
                where={"name": payload.rewardTitle.strip()}
            )
            if existing_title and existing_title.requirementType != "BOSS_RITUAL":
                raise ValueError(
                    "That cosmetic title is protected; choose a unique conquest title"
                )
        
        # Create the Boss
        boss = await db.boss.create(
            data={
                "characterId": char_id,
                "name": payload.name,
                "description": payload.description,
                "category": payload.category,
                "difficulty": payload.difficulty,
                "archetype": payload.archetype,
                "maxHp": max_hp,
                "currentHp": max_hp,
                "rewardGold": payload.rewardGold,
                "rewardExp": payload.rewardExp,
                "rewardTitle": payload.rewardTitle,
                "realWorldReward": payload.realWorldReward,
                "deadline": payload.deadline,
                "status": "ACTIVE"
            }
        )
        
        # Create phases
        await generate_boss_phases(db, boss.id, max_hp)
        
        # Create linked activities
        for activity in payload.activities:
            await db.bossactivity.create(
                data={
                    "bossId": boss.id,
                    "activityType": activity.activityType,
                    "referenceId": activity.referenceId,
                    "damageValue": activity.damageValue
                }
            )
            
        # Fetch complete boss with relations
        complete_boss = await db.boss.find_unique(
            where={"id": boss.id},
            include={
                "phases": {"order": {"orderIndex": "asc"}},
                "activities": True,
                "damageLogs": True
            }
        )
        return complete_boss
    except Exception as e:
        print(f"[Bosses API Error] create_boss failed for {character_id}: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create boss: {str(e)}")

@router.get("/{character_id}", response_model=List[BossSchema])
async def get_bosses(character_id: str):
    try:
        char = await ensure_character_exists(character_id)
        lookup_id = char.id if char else character_id
        
        bosses = await db.boss.find_many(
            where={
                "OR": [
                    {"characterId": character_id},
                    {"characterId": lookup_id}
                ]
            },
            include={
                "phases": {"order": {"orderIndex": "asc"}},
                "activities": True,
                "damageLogs": {"order": {"createdAt": "desc"}}
            },
            order={"createdAt": "desc"}
        )
        return bosses or []
    except Exception as e:
        print(f"[Bosses API Warning] Error fetching bosses for {character_id}: {e}")
        return []
