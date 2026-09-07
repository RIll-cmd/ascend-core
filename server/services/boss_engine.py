import math
from datetime import datetime
from prisma import Prisma
from typing import Dict, Any, List

DIFFICULTY_HP = {
    "EASY": 5000,
    "NORMAL": 10000,
    "HARD": 25000,
    "ELITE": 50000,
    "LEGENDARY": 100000
}

def calculate_boss_hp(difficulty: str) -> int:
    return DIFFICULTY_HP.get(difficulty.upper(), 10000)

async def generate_boss_phases(db: Prisma, boss_id: str, max_hp: int) -> None:
    """Generate 4 default phases for a newly created boss."""
    phase_hp = max_hp // 4
    remainder = max_hp % 4
    
    phases_data = [
        {"bossId": boss_id, "name": "Phase 1 - Initiation", "maxHp": phase_hp, "orderIndex": 1},
        {"bossId": boss_id, "name": "Phase 2 - Development", "maxHp": phase_hp, "orderIndex": 2},
        {"bossId": boss_id, "name": "Phase 3 - Execution", "maxHp": phase_hp, "orderIndex": 3},
        {"bossId": boss_id, "name": "Phase 4 - Finalization", "maxHp": phase_hp + remainder, "orderIndex": 4},
    ]
    
    for phase in phases_data:
        await db.bossphase.create(data=phase)


async def unlock_boss_reward_title(
    db: Prisma, character_id: str, reward_title: str | None
) -> bool:
    """Create and grant a ritual title once, without changing the equipped title."""
    normalized_title = reward_title.strip() if reward_title else ""
    if not normalized_title:
        return False

    title = await db.title.upsert(
        where={"name": normalized_title},
        data={
            "create": {
                "name": normalized_title,
                "description": "A conquest title bound through a forbidden boss ritual.",
                "category": "Special",
                "icon": "crown",
                "requirementType": "BOSS_RITUAL",
            },
            "update": {},
        },
    )
    if title.requirementType != "BOSS_RITUAL":
        return False
    await db.charactertitle.upsert(
        where={
            "characterId_titleId": {
                "characterId": character_id,
                "titleId": title.id,
            }
        },
        data={
            "create": {"characterId": character_id, "titleId": title.id},
            "update": {},
        },
    )
    return True

async def deal_boss_damage(db: Prisma, character_id: str, activity_type: str, reference_id: str) -> List[Dict[str, Any]]:
    """
    Check if the activity is linked to an Active Boss.
    If so, deduct HP, log damage, and check for defeat.
    Returns a list of result summaries for each affected boss.
    """
    
    # 1. Find all active bosses for this character
    active_bosses = await db.boss.find_many(
        where={
            "characterId": character_id,
            "status": "ACTIVE"
        },
        include={
            "activities": True
        }
    )
    
    results = []
    
    for boss in active_bosses:
        # Check if the activity is linked to this boss
        # Match by activityType and referenceId (if provided)
        # referenceId can be a habitId or exerciseId
        linked_activity = next(
            (act for act in boss.activities if act.activityType == activity_type and (act.referenceId == reference_id or not act.referenceId)), 
            None
        )
        
        if linked_activity:
            damage = linked_activity.damageValue
            for _attempt in range(3):
                # Damage, defeat, currency, logs, and title ownership commit together.
                async with db.tx() as transaction:
                    current_boss = await transaction.boss.find_unique(
                        where={"id": boss.id}
                    )
                    if not current_boss or current_boss.status != "ACTIVE":
                        break

                    new_hp = max(0, current_boss.currentHp - damage)
                    actual_damage_dealt = current_boss.currentHp - new_hp
                    is_defeated = new_hp == 0
                    updated_count = await transaction.boss.update_many(
                        where={
                            "id": boss.id,
                            "status": "ACTIVE",
                            "currentHp": current_boss.currentHp,
                        },
                        data={
                            "currentHp": new_hp,
                            "status": "DEFEATED" if is_defeated else "ACTIVE",
                        },
                    )
                    if updated_count != 1:
                        continue

                    await transaction.bossdamagelog.create(
                        data={
                            "bossId": boss.id,
                            "activityId": linked_activity.id,
                            "damage": actual_damage_dealt,
                        },
                    )

                    result_summary = {
                        "bossId": boss.id,
                        "bossName": current_boss.name,
                        "damageDealt": actual_damage_dealt,
                        "newHp": new_hp,
                        "isDefeated": is_defeated,
                        "rewards": None,
                    }

                    if is_defeated:
                        rewards = resolve_boss_rewards(
                            difficulty=current_boss.difficulty,
                            reward_gold=getattr(current_boss, "rewardGold", None),
                            reward_exp=getattr(current_boss, "rewardExp", None),
                        )
                        await transaction.character.update(
                            where={"id": character_id},
                            data={
                                "exp": {"increment": rewards["exp"]},
                                "gold": {"increment": rewards["gold"]},
                                "gems": {"increment": rewards["gems"]},
                                "towerTokens": {"increment": rewards["towerTokens"]},
                            },
                        )

                        for currency, reward_key in (
                            ("GOLD", "gold"),
                            ("EXP", "exp"),
                            ("GEMS", "gems"),
                            ("TOWER_TOKENS", "towerTokens"),
                        ):
                            await transaction.economylog.create(
                                data={
                                    "characterId": character_id,
                                    "currency": currency,
                                    "amount": rewards[reward_key],
                                    "reason": f"Defeated Boss: {current_boss.name}",
                                    "source": "BOSS",
                                }
                            )

                        reward_title = getattr(current_boss, "rewardTitle", None)
                        title_unlocked = await unlock_boss_reward_title(
                            transaction, character_id, reward_title
                        )
                        result_summary["rewards"] = rewards
                        result_summary["rewardTitle"] = (
                            reward_title if title_unlocked else None
                        )
                        result_summary["rewardTitleConflict"] = bool(
                            reward_title and not title_unlocked
                        )
                        result_summary["realWorldReward"] = getattr(
                            current_boss, "realWorldReward", None
                        )

                    results.append(result_summary)
                    break
            else:
                raise RuntimeError(
                    "Boss damage contention exceeded retry budget; retry the activity sync"
                )
            
    return results

def resolve_boss_rewards(
    difficulty: str,
    reward_gold: int | None = None,
    reward_exp: int | None = None,
) -> Dict[str, int]:
    diff = difficulty.upper()
    rewards = {
        "EASY": {"exp": 1000, "gold": 500, "gems": 25, "towerTokens": 50},
        "NORMAL": {"exp": 2500, "gold": 1200, "gems": 50, "towerTokens": 100},
        "HARD": {"exp": 7500, "gold": 3000, "gems": 100, "towerTokens": 250},
        "ELITE": {"exp": 15000, "gold": 7500, "gems": 200, "towerTokens": 500},
        "LEGENDARY": {"exp": 35000, "gold": 20000, "gems": 500, "towerTokens": 1000}
    }
    resolved = dict(rewards.get(diff, rewards["NORMAL"]))
    if reward_gold is not None:
        resolved["gold"] = reward_gold
    if reward_exp is not None:
        resolved["exp"] = reward_exp
    return resolved


def grant_boss_rewards(difficulty: str) -> Dict[str, int]:
    """Compatibility wrapper for callers that use difficulty-only rewards."""
    return resolve_boss_rewards(difficulty)
