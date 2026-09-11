# Implementation Plan — AIRA Omnipresent Sidebar Intelligence (Phase A & Phase B)

Ascend Core currently has an AIRA AI Assistant that only has tools for basic stats, today's missions, active bosses, tower floor readiness, and equipment advice. To make AIRA a true hyper-competent Ascend OS resonance administrator (like Ciel from Tensura), AIRA needs to understand and interact with **all 18+ sidebar routes and domain modules**.

## User Review Required

> [!IMPORTANT]
> **Two-Phase Architecture**:
> - **Phase A (Read & Context Omnipresence)**: AIRA receives read tools for all 18+ sidebar modules (Operations, Disciplines, Combat, Armory, System Core). When the user asks about anything on the site, AIRA queries live database context and provides exact analytical answers.
> - **Phase B (Action Suite: Add, Edit, Remove, Analyze)**: AIRA receives structured tool declarations for mutating actions across all sidebars. All mutations require preview & confirmation in the chat interface before executing via `/api/aira/execute`.

> [!TIP]
> Gemini model tool calling: With ~20 distinct sidebar modules, we will organize tools into clean, domain-scoped functions with crisp docstrings and schemas so Gemini can select and invoke them cleanly without token bloat or hallucination.

---

## Complete Sidebar Domain Inventory (18 Routes + Automations)

| Section | Route # & Name | Domain Data & Models (Prisma / Services) | Phase A: Read Tools | Phase B: Actions (Add/Edit/Remove/Analyze) |
|---|---|---|---|---|
| **Operations** | `01` Dashboard | Daily snapshot, overall completion rate, streak, power | `get_dashboard_summary` | `analyze_daily_performance` |
| | `02` Missions | `Mission` model (PENDING, COMPLETED, MISSED, exp/stat rewards) | `get_missions` (filter by date/status) | `create_mission`, `complete_mission`, `delete_mission` |
| | `03` Habits | `Habit`, `HabitTier`, `HabitSchedule`, `HabitMetrics`, `HabitRelapseLog` | `get_habits_overview` | `create_habit`, `update_habit`, `archive_habit`, `analyze_habit_streaks` |
| | `04` Calendar | `DailyCompletionSnapshot`, history, upcoming schedules | `get_calendar_history` | `analyze_consistency_trends` |
| **Disciplines** | `05` Profile | `Character`, `CharacterStats`, `CharacterTitle`, Level/Rank/XP | `get_character_profile` | `equip_title`, `analyze_stat_distribution` |
| | `06` Workouts | `WorkoutSession`, `WorkoutSet`, `ExerciseDefinition`, `MuscleRecoveryState` | `get_workout_history`, `get_muscle_recovery` | `log_workout`, `analyze_workout_fatigue` |
| | `07` Sleep & Rest | `DailyStepLog`, rest metrics, recovery hours | `get_sleep_and_rest_summary` | `log_rest_session`, `analyze_recovery_status` |
| | `08` Learning & Focus | Knowledge habits, focus sessions | `get_focus_summary` | `log_focus_session`, `analyze_study_efficiency` |
| | `09` Skills | `ClassSpecialization`, `SkillDefinition`, `PlayerSkill`, `availableSP` | `get_skills_tree` | `upgrade_skill`, `analyze_skill_synergy` |
| **Combat** | `10` Tower | `TowerFloor`, `TowerProgress`, `TowerEnemy` | `get_tower_status` | `analyze_tower_readiness` |
| | `11` Bosses | `Boss`, `BossPhase`, `BossActivity`, `BossDamageLog` | `get_bosses_status` | `create_boss_goal`, `abandon_boss`, `analyze_boss_strategy` |
| | `12` Boss PR | `WeeklyBoss`, target exercise, damage, PRs | `get_weekly_boss_pr` | `attack_weekly_boss`, `analyze_pr_trajectory` |
| **Armory** | `13` Inventory | `PlayerItem`, `ItemDefinition`, equipped status | `get_inventory_items` | `equip_item`, `unequip_item`, `lock_item`, `analyze_optimal_loadout` |
| | `14` Forge & Craft | Item crafting, upgrade potential | `get_crafting_recipes` | `craft_item`, `upgrade_item`, `analyze_crafting_materials` |
| | `15` Shop | `ShopItem`, `ItemDefinition`, `ActiveBuff`, Gold/Gems | `get_shop_inventory`, `get_active_buffs` | `buy_shop_item`, `analyze_shop_purchases` |
| | `16` Beasts & Pets | `Egg`, `Beast`, equipped beast, step upgrade reqs | `get_beasts_and_eggs` | `equip_beast`, `incubate_egg`, `upgrade_beast`, `analyze_pet_buffs` |
| **System Core**| `17` AI System / AIRA | Chat logs, status, morning briefings | `get_system_status` | `generate_progression_plan`, `optimize_daily_routine` |
| | `18` Achievements | `Achievement`, `CharacterAchievement`, rewards | `get_achievements_list` | `claim_achievement`, `analyze_next_achievements` |
| | `N` Automations | `AutomationRule`, `AutomationExecution`, triggers/conditions | `get_automations_list` | `create_automation_rule`, `toggle_automation`, `delete_automation`, `analyze_automations` |

---

## Proposed Changes

### Backend (`server/`)

#### 1. Core Tool Definitions: `server/services/aira_tools.py`
- Refactor and extend `server/services/aira_tools.py` into modular, typed tool functions:
  - **Reads (Phase A)**:
    - `get_dashboard_summary(character_id)`: Daily status, completion rate, power, top habits.
    - `get_missions(character_id, status=None)`: Full missions list with XP, rewards, state.
    - `get_habits_overview(character_id)`: All active habits, streaks, metrics, relapse counts.
    - `get_calendar_history(character_id, days=14)`: Completion snapshots & history.
    - `get_character_profile(character_id)`: Stats, rank, level, SP, gold, gems, equipped title, class.
    - `get_workout_history(character_id, limit=5)`: Recent sessions, exercises, sets, weights.
    - `get_muscle_recovery(character_id)`: Recovery fatigue by muscle group.
    - `get_skills_tree(character_id)`: Specialization, unlocked player skills, available SP.
    - `get_tower_status(character_id)`: Current highest cleared floor, next floor requirements, enemy info.
    - `get_bosses_status(character_id)`: Active custom bosses, current HP, phase, deadline.
    - `get_weekly_boss_pr(character_id)`: Target exercise, weekly damage, PR status.
    - `get_inventory_items(character_id, item_type=None)`: Inventory items, equipped items, stats.
    - `get_shop_inventory(character_id)`: Shop catalog with prices, stock, user currency check.
    - `get_beasts_and_eggs(character_id)`: Active eggs, hatched beasts, equipped beast, step progression.
    - `get_achievements_list(character_id)`: Completed, claimed, and in-progress achievements.
    - `get_automations_list(character_id)`: Automation rules, enabled state, last triggers.
  - **Writes / Mutative Tools (Phase B)**:
    - Add preview stubs returning `{"status": "pending_confirmation", ...}` with clear arguments:
      - Habits & Missions: `create_habit`, `update_habit`, `archive_habit`, `complete_daily_mission`, `create_new_mission`, `delete_mission`.
      - Workouts & Rest: `log_completed_workout`.
      - Armory: `equip_inventory_item`, `unequip_inventory_item`, `buy_shop_item`.
      - Skills: `spend_skill_points`.
      - Beasts: `equip_beast`, `incubate_egg`.
      - Achievements: `claim_achievement_reward`.
      - Automations: `create_automation_rule`, `toggle_automation_rule`, `delete_automation_rule`.
      - Analysis: `analyze_tower_readiness`, `compare_equipment`, `generate_progression_plan`, `analyze_stat_distribution`, `analyze_routine_efficiency`.

#### 2. Action Execution Engine: `server/routers/aira.py`
- Expand `POST /api/aira/execute` to handle all new confirmed action types:
  - `equip_inventory_item`: Toggles `isEquipped` on `PlayerItem` ensuring slot validity.
  - `unequip_inventory_item`: Unequips item.
  - `buy_shop_item`: Deducts Gold/Gems, creates `PlayerItem`, logs `EconomyLog`.
  - `create_habit`: Uses `db.habit.create` with default schedule & tiers.
  - `update_habit`: Updates title, category, difficulty.
  - `archive_habit`: Sets status to `ARCHIVED`.
  - `spend_skill_points`: Decrements `availableSP`, increments `PlayerSkill.currentLevel`.
  - `equip_beast`: Updates `Character.equippedBeastId` and `Beast.isEquipped`.
  - `claim_achievement_reward`: Marks `isClaimed=True`, adds Gold/Gems/Title to `Character`.
  - `create_automation_rule`: Adds new rule with trigger/actions JSON.
  - `toggle_automation_rule`: Flips `enabled` on `AutomationRule`.
  - `delete_automation_rule`: Deletes rule from DB.

#### 3. Ciel Persona & System Instruction: `server/services/aira_service.py`
- Enrich `AIRA_SYSTEM_PROMPT` to educate AIRA about all 18 sidebar routes of Ascend OS.
- Update `call_gemini_with_tools_async` with the full `MUTATIVE_TOOLS` list and auto-generate readable summaries for confirmation dialogs.

---

### Frontend (`client/`)

#### 1. Quick Prompts & Categorized Pills: `client/src/app/(dashboard)/aira/page.tsx`
- Expand `QUICK_PROMPTS` to showcase operations across different sidebars:
  - Operations: `"What are my pending missions today?"`, `"Review my habits and streaks"`
  - Disciplines: `"Check my muscle recovery status"`, `"Show my skill tree and available SP"`
  - Combat: `"Am I ready for the next Tower floor?"`, `"How is my boss battle progressing?"`
  - Armory: `"What items can I equip to boost strength?"`, `"Check my pet incubation steps"`
  - System Core: `"What achievements can I claim right now?"`, `"Show my active automation rules"`

#### 2. Enhanced Confirmation Cards in Chat:
- Render rich, domain-styled confirmation cards for pending actions:
  - Equip item (item rarity color, stat delta)
  - Buy shop item (cost in gold/gems)
  - Create habit/mission (tier rewards, stat type)
  - Claim achievement (trophy icon, rewards)
  - Automation creation (trigger & action badge)

---

## Verification Plan

### Automated Tests
- Create `server/tests/test_aira_sidebar_tools.py`:
  - Test all Phase A read tools against mock/test character data for all 18 domains.
  - Test Phase B execution endpoints in `routers/aira.py` for each action type (`equip_item`, `create_habit`, `claim_achievement`, `toggle_automation`, etc.).
  - Run pytest: `pytest tests/test_aira_sidebar_tools.py`.

### Manual Verification
- In the web app (`http://localhost:3000/aira`):
  1. Ask questions about different sidebar routes:
     - *"What habits do I have?"*
     - *"What items are in my inventory?"*
     - *"What's my muscle recovery looking like?"*
     - *"What achievements can I claim?"*
     - *"Show my active automations"*
  2. Ask AIRA to perform actions:
     - *"Create a new habit to read for 20 minutes daily"* -> Observe confirmation card -> Confirm -> Check `/habits` route.
     - *"Equip my highest attack weapon"* -> Observe confirmation card -> Confirm -> Check `/inventory` route.
     - *"Toggle my vision detection automation"* -> Observe confirmation card -> Confirm -> Check `/automations` route.
