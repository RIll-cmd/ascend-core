# REST API Reference

Base Endpoint: `http://127.0.0.1:8000`

## System Routes

### `GET /`
Returns server operational health and version status.

### `GET /api/health`
Returns system status summary.

## User & Identity Routes

### `GET /api/user/{user_id_or_email}`
Fetches user model by ID, email, or associated character name.

## Character Domain Routes

### `GET /api/character/{character_id}`
Fetches character record by ID, including relations to `CharacterStats` and `ProgressHistory`.

**Response**:
```json
{
  "id": "char-id-123",
  "userId": "user-1",
  "name": "Shadow Monarch",
  "avatar": "/avatars/shadow-monarch.png",
  "theme": "dark-rpg",
  "title": "Shadow Seeker",
  "level": 1,
  "exp": 0,
  "power": 50,
  "rank": "F",
  "gold": 0,
  "createdAt": "2026-08-03T22:00:00.000Z",
  "stats": {
    "id": "stats-1",
    "characterId": "char-id-123",
    "strength": 1,
    "knowledge": 1,
    "discipline": 1,
    "focus": 1,
    "endurance": 1,
    "recovery": 1,
    "consistency": 1
  },
  "history": []
}
```

### `PATCH /api/character/{character_id}`
Accepts optional JSON payload containing character identity attributes (`name`, `title`, `theme`, `avatar`) and updates the character record.

**Request Body**:
```json
{
  "name": "Shadow Sovereign",
  "title": "Shadow Seeker",
  "theme": "purple-rpg",
  "avatar": "/avatars/shadow-monarch.png"
}
```

**Response**: Updated `Character` object with included relations.

### `POST /api/character/{character_id}/sync-progression`
Accepts total experience, current level, power score, rank classification, and an optional activity history entry to sync character progression with the database.

**Request Body**:
```json
{
  "total_exp": 150,
  "level": 2,
  "power": 100,
  "rank": "F",
  "history_entry": {
    "amount": 150,
    "type": "LEVEL_UP",
    "description": "Leveled up to Level 2! (Completed Simulation Training)"
  }
}
```

**Response**: Updated `Character` object with refreshed history array.

## Habit Domain Routes

### `POST /api/habits/{character_id}`
Creates a new `Habit` template record along with 1:1 `HabitSchedule` and 1:1 `HabitMetrics` relations.

**Request Body**:
```json
{
  "name": "Morning Workout",
  "description": "30-minute cardio and strength session",
  "category": "Fitness",
  "difficulty": "Medium",
  "primaryStat": "strength",
  "scheduleType": "Daily",
  "scheduleDays": null,
  "icon": "Dumbbell",
  "color": "blue"
}
```

**Response**: Full created `Habit` object including `schedule` and `metrics`.

### `GET /api/habits/{character_id}`
Returns all permanent habit templates for a character, including schedule configuration and metrics.

**Response**: Array of `Habit` objects.

## Mission Domain Routes

### `GET /api/missions/today/{character_id}`
**Daily Mission Generator**: Inspects active habit templates for the specified character, checks today's date boundary, generates missing `PENDING` mission instances for today, and returns all today's missions.

**Response**: Array of today's `Mission` objects with included parent `Habit` relation.

### `POST /api/missions/{mission_id}/complete`
Marks a mission instance as `COMPLETED`, records completion tier (`MINI`, `NORMAL`, `ELITE`) and rewards (`expEarned`, `statsEarned`), and updates parent `HabitMetrics` habit strength.

**Request Body**:
```json
{
  "completionType": "ELITE",
  "expEarned": 128,
  "statsEarned": 17
}
```

**Response**: Updated `Mission` object with included parent `Habit` relation.

## Progression & Economy Domain Routes

### `POST /api/progression/{character_id}/gold`
Creates an `EconomyLog` transaction record (currency=`GOLD`) for earning or spending gold and updates the character's gold balance in the database.

**Request Body**:
```json
{
  "amount": 50,
  "reason": "Completed Mission: Morning Pushups",
  "source": "MISSION"
}
```

**Response**: Created `EconomyLog` object.

### `GET /api/progression/{character_id}/history`
Returns all `EconomyLog` records for the character ordered by `createdAt` descending (limit 50).

**Response**: Array of `EconomyLog` objects.

## Achievements Domain Routes

### `GET /api/achievements`
Returns all permanent `Achievement` template records configured in the game database.

**Response**: Array of `Achievement` objects.

### `POST /api/achievements/{character_id}/{achievement_id}`
Creates a `CharacterAchievement` instance linking the character to the achievement. Handles unique constraint checks gracefully if the achievement is already unlocked.

**Response**: Status response object containing `status`, `message`, and `unlocked` relation record.

## Analytics Domain Routes

### `GET /api/analytics/{character_id}/weekly`
Fetches all completed `Mission` instances for the character from the past 7 days and aggregates earned EXP grouped by day of the week.

**Response**: Recharts-formatted array:
```json
[
  { "day": "Mon", "exp": 120 },
  { "day": "Tue", "exp": 45 },
  { "day": "Wed", "exp": 0 },
  { "day": "Thu", "exp": 80 },
  { "day": "Fri", "exp": 150 },
  { "day": "Sat", "exp": 30 },
  { "day": "Sun", "exp": 90 }
]
```

## Tower Domain Routes

### `GET /api/tower`
Returns all `Tower` records configured in the game database (defaults to Tower of Ascension).

**Response**: Array of `Tower` objects.

### `GET /api/tower/{tower_id}/floors/{character_id}`
Fetches all `Floor` records for a tower including boss relations, merging the character's `FloorProgress` data (`status`, `attempts`, `bestTime`, `clearedAt`).

**Response**: Array of merged `Floor` objects.

### `POST /api/tower/floors/{floor_id}/combat/{character_id}`
Records the outcome of a combat encounter (`isVictory`, `totalTurns`). Increments attempt count. If victorious, updates status to `CLEARED`, sets `clearedAt`, updates `bestTime`, and automatically unlocks the next floor in the tower.

**Request Body**:
```json
{
  "isVictory": true,
  "totalTurns": 8
}
```

**Response**: Updated `FloorProgress` object.

## Inventory Domain Routes

### `GET /api/inventory/{character_id}`
Fetches all `Inventory` records for a character, including nested `Item`, `Equipment`, and `Consumable` relations ordered by `obtainedAt` descending.

**Response**: Array of `Inventory` objects.

### `POST /api/inventory/{character_id}/grant`
Creates an `Item` template record (with `Equipment` stats if provided) and grants an `Inventory` instance to the specified character.

**Request Body**:
```json
{
  "name": "Iron Sword",
  "description": "A sturdy forged iron blade.",
  "category": "Equipment",
  "rarity": "Common",
  "sellPrice": 15,
  "buyPrice": 50,
  "equipment": {
    "slot": "Weapon",
    "attack": 25,
    "strength": 5
  }
}
```

**Response**: Created `Inventory` record.

### `POST /api/inventory/{character_id}/equip/{inventory_id}`
Equips an inventory item for a character (`isEquipped = true`). Automatically unequips any item currently occupying the same equipment slot (`isEquipped = false`).

**Response**: Status response object with updated `Inventory` record.

### `POST /api/inventory/{character_id}/unequip/{inventory_id}`
Unequips an inventory item (`isEquipped = false`).

**Response**: Status response object with updated `Inventory` record.

## AIRA System Domain Routes

### `POST /api/aira/chat`
Accepts a user prompt and character ID, injects current character attributes/stats as context, and returns AIRA's Ciel-style response.

**Request Body**:
```json
{
  "prompt": "AIRA, what is my current battle readiness?",
  "characterId": "char-id-123"
}
```

**Response**:
```json
{
  "response": "<< Report. >> Analysis complete with 100% calculation accuracy. Master's current Power Score is registered at 1250..."
}
```

### `POST /api/aira/diagnose-defeat`
Accepts turn battle logs and character data, processes a tactical defeat diagnosis through AIRA, and returns her analytical recommendation.

**Request Body**:
```json
{
  "battleLogs": ["Turn 1: You strike Floor 10 Boss for 25 damage...", "Floor 10 Boss attacks you for 150 damage..."],
  "characterId": "char-id-123",
  "floorNumber": 10
}
```

**Response**:
```json
{
  "diagnosis": "<< Report. >> Combat Simulation Analysis on Floor 10 complete. Calculation confirms a 100% probability that Master's defeat was caused by an Attribute deficit in Recovery..."
}
```

### `GET /api/aira/daily-report/{character_id}`
Aggregates character consistency, pending habits, and power score to generate AIRA's signature morning briefing (`<< Report. >>`).

```json
{
  "report": "<< Report. >> Good morning, Shadow Monarch. System diagnostic complete with 100% accuracy..."
}
```

## Fitness & Workout Domain Routes

### `POST /api/fitness/sessions/start`
Starts a new workout session for a character.

**Request Body**:
```json
{
  "characterId": "char-123"
}
```

### `POST /api/fitness/sessions/{session_id}/log`
Logs a set for an active workout session, calculates e1RM, and applies damage to the active boss.

**Request Body**:
```json
{
  "exerciseId": "ex-123",
  "weight": 100.5,
  "reps": 8,
  "rpe": 8.5
}
```

### `POST /api/fitness/sessions/{session_id}/log-text`
Parses natural language (voice or text shorthand) into a workout set and logs it. Handles shorthand like "same weight".

**Request Body**:
```json
{
  "text": "Barbell Bench Press 60 for 8"
}
```

### `POST /api/fitness/sessions/{session_id}/finish`
Completes the workout session, aggregates all logged sets, finalizes PRs, grants EXP/Gold/Stats, and verifies Boss defeat condition.

### `POST /api/fitness/overload-batch/{character_id}`
Returns hybrid progressive overload recommendations (+2.5kg or +5%) for a list of exercise IDs.

### `GET /api/fitness/boss/{character_id}`
Returns the active Weekly Boss for a character, or generates one if it's expired/missing based on 90% of their highest 1RM.

## Skills Domain Routes

### `GET /api/skills/{character_id}`
Returns the player's available SP, unlocked skills, and the full catalog of master skill definitions.

### `POST /api/skills/{character_id}/unlock`
Consumes Skill Points (SP) to unlock or upgrade a skill. Enforces prerequisite skill trees, max levels, and stat requirements.

**Request Body**:
```json
{
  "skillDefinitionId": "skill-456"
}
```

## Inventory & Economy Domain Routes

### `GET /api/inventory/{character_id}`
Returns the character's items from `PlayerItem` with associated `ItemDefinition` details.

### `POST /api/inventory/{character_id}/equip`
Toggles the equipped state of an item. Automatically unequips any item currently occupying the same equipment slot (Weapon, Armor, Relic, Accessory).

**Request Body**:
```json
{
  "playerItemId": "item-789",
  "equip": true
}
```

## Workout & Muscle Recovery Engine Routes (`/api/workouts`)

### `GET /api/workouts/muscle-status/{character_id}`
Dynamically calculates real-time time-decay muscle recovery telemetry for all 16 canonical muscle groups.

**Response**:
```json
{
  "muscles": {
    "CHEST": {
      "id": "CHEST",
      "name": "Chest (Pectorals)",
      "view": "front",
      "category": "UPPER_PUSH",
      "freshness": 44.0,
      "fatigue": 56.0,
      "hoursRemaining": 26.8,
      "status": "RECOVERING",
      "lastTrainedAt": "2026-08-15T04:24:53Z",
      "fullRecoveryHours": 48.0
    }
  },
  "summary": {
    "freshCount": 11,
    "recoveringCount": 5,
    "fatiguedCount": 0,
    "totalCount": 16,
    "overallFreshness": 80.5,
    "daysSinceLastWorkout": 0,
    "lastWorkoutDate": "2026-08-15T04:24:53Z"
  }
}
```

### `POST /api/workouts/log`
Logs multi-set workout sessions, calculates muscle fatigue (+35%–60% primary, +15%–35% secondary), resets timestamps, updates character STR/END/EXP stats, advances achievements, and damages active bosses.

**Request Body**:
```json
{
  "characterId": "char-123",
  "durationSeconds": 2400,
  "sets": [
    {
      "exerciseId": "ex1",
      "weight": 100.0,
      "reps": 8,
      "rpe": 8.5
    }
  ],
  "bodyweight": 75.0,
  "sex": "M"
}
```

### `POST /api/workouts/reset-recovery/{character_id}`
Resets all 16 muscle groups to 100% Fresh for testing and simulation.

### `GET /api/workouts/exercises`
Returns all enriched exercise definitions with primary & secondary muscle mappings and equipment.

### `GET /api/workouts/ranks/{character_id}`
Calculates estimated 1-Rep Max (e1RM) PR ranks (E through SSS) and tier progress bars.

---

## Beasts & Dragon Companion Routes (`/api/beasts`)

### `GET /api/beasts/collection/{character_id}`
Fetches character's bestiary collection, discovered species count, owned eggs, active incubating egg, and currently equipped dragon companion.

### `POST /api/beasts/sync-steps`
Syncs physical daily step counts, converting step energy directly into egg incubation progress.

**Request Body**:
```json
{
  "characterId": "char-123",
  "stepCount": 2500
}
```

### `POST /api/beasts/feed-energy`
Manually converts workout intensity / habit energy into incubation progress.

### `POST /api/beasts/hatch`
Cracks and hatches a `READY_TO_HATCH` egg into an animated dragon pet (`.gif`), auto-equipping the new companion.

**Request Body**:
```json
{
  "characterId": "char-123",
  "eggId": "egg-456"
}
```

### `POST /api/beasts/equip`
Equips or unequips a hatched dragon pet to activate passive stat multipliers (+Strength, +Endurance, +Recovery).

**Request Body**:
```json
{
  "characterId": "char-123",
  "beastId": "beast-789"
}
```

### `POST /api/beasts/buy-egg`
Purchases mystery elemental eggs (Common, Rare, Epic, Legendary, Holographic) from the Egg Shop using Gold or Gems.

### `POST /api/beasts/incubate`
Places an owned egg into the active incubation pedestal.

### `GET /api/beasts/catalog`
Returns master Bestiary catalog and Egg Shop pricing tables.

---

## Ascend Vision Automation Proposal Routes (`/api/automations`)

These authenticated routes let `D:\ascend-vision` discover Core-owned automation capabilities and validate a transient rule proposal. They require the normal session or Bearer-token user context; `X-Integration-Key` is not user authentication. The existing `POST /api/automations` remains the only route that persists a rule.

### `GET /api/automations/capabilities`
Returns a versioned allowlist of supported triggers, match modes, condition fields and operators, condition types, actions, and validation limits. Vision must not invent values outside this contract.

### `GET /api/automations/eligible-habits?characterId={characterId}`
Requires ownership of `characterId` and returns only owned negative habits:

```json
{
  "characterId": "char-123",
  "habits": [{ "id": "habit-456", "name": "Avoid doomscrolling" }]
}
```

### `POST /api/automations/proposals/validate`
Accepts the same structured body as a prospective `POST /api/automations` request. It validates the allowlists and ownership, returns a normalized proposal and deterministic preview, and creates no rule, execution, habit log, mission, reward, or cooldown mutation.

```json
{
  "valid": true,
  "requiresConfirmation": true,
  "normalizedProposal": { "characterId": "char-123", "triggerType": "phone_usage_observed" },
  "preview": { "sideEffectsDuringValidation": false },
  "warnings": []
}
```

Vision must obtain explicit user confirmation before sending the normalized payload to `POST /api/automations`.

---

## Ascend Vision User-Auth Handoff (`/api/auth`)

### `POST /api/auth/vision-token`

An already authenticated Core user may mint a short-lived token for `D:\ascend-vision` automation calls. It accepts the normal authenticated Core session cookie or general Bearer token; it does not accept `X-Integration-Key`, a character ID, or a user identity supplied by Vision.

```json
{
  "accessToken": "<JWT>",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "expiresAt": "2026-09-08T12:00:00+00:00"
}
```

The token contains Core user identity, a 15-minute expiry, and `purpose: "ascend_vision"`. It is accepted only by `/api/automations` routes, which still enforce character ownership. On expiry Core returns normal authentication failure; Vision must obtain a fresh authenticated handoff. There is no refresh token or silent renewal.

Vision must store the token only in OS-native secure credential storage. It must never be included in LLM prompts, voice text, logs, telemetry, observations, CV payloads, crash reports, source code, or browser-style `localStorage`.
