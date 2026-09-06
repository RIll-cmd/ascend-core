# Bad Habits Stat Penalty Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent positive/negative habit polarity with an atomic relapse endpoint that deducts HP, EXP, or mapped character stats and exposes the flow on `/habits`.

**Architecture:** Extend the existing Prisma `Habit` and `Character` models and add a durable `HabitRelapseLog`. Keep positive completion on the existing `/log` path; add `/trigger` for negative habits, with the server as the source of truth and Zustand updated from its response. Keep the current PostgreSQL datasource and existing habit wizard/card structure.

**Tech Stack:** Prisma Python client, FastAPI/Pydantic, PostgreSQL, Next.js/React/TypeScript, Zustand, Vitest, pytest.

**Spec:** `docs/superpowers/specs/2026-09-06-bad-habits-stat-penalty-design.md`

## Global Constraints

- Preserve all existing `Habit` fields for scheduling, difficulty, tiers, metrics, and missions.
- Use the configured PostgreSQL datasource; do not introduce a parallel SQLite store.
- Normalize penalty targets to uppercase and accept only `HP`, `EXP`, `VITALITY`, `DISCIPLINE`, `STRENGTH`, `KNOWLEDGE`, `FOCUS`, `RECOVERY`, and `CONSISTENCY`.
- `VITALITY` maps to `CharacterStats.endurance`.
- `statModifier` is a positive integer; deductions clamp at zero.
- Negative triggers award no XP, gold, stats, or boss damage.
- Preserve the existing positive `/log` completion behavior.

---

### Task 1: Add schema fields and relapse history

**Files:**
- Modify: `server/prisma/schema.prisma` (`Character`, `Habit`, and new `HabitRelapseLog` model)

**Interfaces:**
- Produces generated Prisma fields `Character.currentHp`, `Character.maxHp`, `Habit.type`, `Habit.affectedStat`, `Habit.statModifier`, `Habit.relapseCount`, `Habit.streakDays`, `Habit.lastTriggeredAt`, and `HabitRelapseLog` CRUD access for later backend tasks.

- [ ] **Step 1: Add the schema definitions**

Add `HabitType { POSITIVE NEGATIVE }`, add `maxHp Int @default(100)` and `currentHp Int @default(100)` to `Character`, add the six habit fields with the defaults from the spec, and add `HabitRelapseLog` with relations to `Habit` and `Character`, `previousValue`, `newValue`, and indexes on `(characterId, createdAt)` and `(habitId, createdAt)`.

- [ ] **Step 2: Generate the Prisma client**

Run from `server`:

```powershell
prisma generate
```

Expected: Prisma Python client generation succeeds using the repository schema.

- [ ] **Step 3: Push the schema to the configured database**

Run from `server`:

```powershell
prisma db push
```

Expected: the configured PostgreSQL database contains the new columns, enum, and relapse-log table without dropping existing data.

- [ ] **Step 4: Commit the schema change**

```powershell
git add server/prisma/schema.prisma
git commit -m "feat: add bad habit penalty persistence"
```

---

### Task 2: Add backend validation and penalty calculation tests

**Files:**
- Modify: `server/schemas/habit.py`
- Create: `server/services/habit_penalties.py`
- Create: `server/tests/test_habit_penalties.py`

**Interfaces:**
- Consumes: persisted habit target names and character/stat records.
- Produces: `normalize_penalty_target(target: str) -> str` and `calculate_penalty(target: str, modifier: int, character: object, stats: object) -> dict` for the route.

- [ ] **Step 1: Write failing unit tests**

```python
def test_vitality_maps_to_endurance_and_clamps_at_zero():
    result = calculate_penalty("VITALITY", 10, character=None, stats=SimpleNamespace(endurance=4))
    assert result == {"storage": "endurance", "previousValue": 4, "newValue": 0, "amount": 4}

def test_hp_penalty_uses_current_hp():
    character = SimpleNamespace(currentHp=20, maxHp=100, exp=50)
    assert calculate_penalty("HP", 15, character, None)["newValue"] == 5

def test_unknown_target_and_non_positive_modifier_are_rejected():
    with pytest.raises(ValueError):
        normalize_penalty_target("MANA")
    with pytest.raises(ValueError):
        validate_stat_modifier(0)
```

- [ ] **Step 2: Run tests to verify they fail**

Run from `server`:

```powershell
pytest tests/test_habit_penalties.py -q
```

Expected: FAIL because the penalty service and validation functions do not yet exist.

- [ ] **Step 3: Implement the narrow penalty service**

Use a constant target map. Return the storage field, previous value, clamped new value, and actual deducted amount. Treat `HP` as `character.currentHp`, `EXP` as `character.exp`, and all other targets as `CharacterStats` fields, with `VITALITY` mapped to `endurance`.

- [ ] **Step 4: Extend Pydantic schemas**

Add `HabitType`, `PenaltyTarget`, `type`, `affectedStat`, and `statModifier` to `HabitCreateSchema`; add optional equivalents to `HabitUpdateSchema`; validate `statModifier >= 1`; normalize the target through a validator or route-boundary helper.

- [ ] **Step 5: Run tests to verify they pass**

```powershell
pytest tests/test_habit_penalties.py -q
```

Expected: PASS.

- [ ] **Step 6: Commit validation and calculation code**

```powershell
git add server/schemas/habit.py server/services/habit_penalties.py server/tests/test_habit_penalties.py
git commit -m "feat: validate bad habit penalty targets"
```

---

### Task 3: Implement atomic create and relapse backend behavior

**Files:**
- Modify: `server/routers/habits.py`
- Modify: `server/tests/test_habit_penalties.py`

**Interfaces:**
- Consumes: `HabitType`, `HabitCreateSchema`, `HabitUpdateSchema`, `HabitLogSchema`, and the penalty service.
- Produces: `POST /api/habits/{habit_id}/trigger` returning `{success, habit, character, stats, penalty}` for negative habits.

- [ ] **Step 1: Add route-level failing tests**

Cover creation with `type="NEGATIVE"`, HP deduction and `HabitRelapseLog` insertion, stat/EXP deduction, zero clamping, relapse counter/streak/timestamp updates, ownership rejection, and positive trigger compatibility. Assert the database values rather than only response fields.

- [ ] **Step 2: Run the route tests to verify the expected failures**

```powershell
pytest tests/test_habit_penalties.py -q
```

Expected: FAIL because the schema fields and `/trigger` route are not wired into the router.

- [ ] **Step 3: Persist the new fields during create and update**

Pass normalized `type`, `affectedStat`, and validated `statModifier` into `db.habit.create`. Add the same fields to the update payload and update data. Default legacy habits to `POSITIVE`, `HP`, and `10` through Prisma defaults.

- [ ] **Step 4: Add the `/trigger` endpoint**

Load the habit with character, stats, and relations; verify ownership; reject archived/deleted or missing habits. For positive habits, delegate to the existing completion implementation or preserve the current reward path without duplicating reward calculations. For negative habits, open one transaction, calculate the penalty, update either `Character`, `CharacterStats`, or both, update habit counters/timestamp, create `HabitRelapseLog`, and return refreshed records.

- [ ] **Step 5: Protect negative triggers from reward side effects**

Do not publish `MISSION_COMPLETED`, update gold, award EXP/stat rewards, or call boss damage for a negative trigger. Return the actual deducted amount when a clamp reduces the requested penalty.

- [ ] **Step 6: Run backend tests**

```powershell
pytest tests/test_habit_penalties.py -q
pytest tests -q
```

Expected: the new penalty tests and existing server tests pass.

- [ ] **Step 7: Commit backend behavior**

```powershell
git add server/routers/habits.py server/tests/test_habit_penalties.py
git commit -m "feat: trigger bad habit stat penalties"
```

---

### Task 4: Extend frontend domain types and API/store actions

**Files:**
- Modify: `client/src/features/habits/types/habit.ts`
- Modify: `client/src/features/habits/services/habit.service.ts`
- Modify: `client/src/features/habits/store/useHabitStore.ts`
- Modify: `client/src/store/useCharacterStore.ts`
- Create: `client/src/features/habits/utils/penaltyPresentation.ts`
- Create: `client/src/features/habits/utils/penaltyPresentation.test.ts`

**Interfaces:**
- Produces `HabitType`, `PenaltyTarget`, `Habit.type`, `Habit.affectedStat`, `Habit.statModifier`, `triggerHabit(habitId)`, and a store action `triggerBadHabit(habitId) -> Promise<{success, penalty}>`.

- [ ] **Step 1: Write failing presentation/store-adjacent tests**

```typescript
it("labels vitality as endurance while showing the public target", () => {
  expect(formatPenalty({ affectedStat: "VITALITY", amount: 5 })).toBe("-5 VITALITY");
});
```

Add a test for API penalty response normalization and an updated character HP/stat value.

- [ ] **Step 2: Run the focused client tests**

```powershell
npm test -- src/features/habits/utils/penaltyPresentation.test.ts
```

Expected: FAIL because the presentation helper and negative fields do not exist.

- [ ] **Step 3: Add client types and service method**

Add polarity/target unions, optional persisted fields to `Habit`, create/update payload fields, a `HabitTriggerResponse`, and `triggerHabit` posting to `/api/habits/{habitId}/trigger` with existing auth headers.

- [ ] **Step 4: Update the habit store**

Add `triggerBadHabit`. On success, replace the returned habit, call `useCharacterStore.getState().setCharacter(response.character)`, and expose a short-lived penalty event payload for the card. Do not route positive habits through this action.

- [ ] **Step 5: Implement presentation helpers**

Format `-amount target` labels and provide preset definitions for Overeating, Smoking, and Procrastinating. Keep the public `VITALITY` label even though the backend stores endurance.

- [ ] **Step 6: Run focused tests and TypeScript**

```powershell
npm test -- src/features/habits/utils/penaltyPresentation.test.ts
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 7: Commit frontend domain wiring**

```powershell
git add client/src/features/habits/types/habit.ts client/src/features/habits/services/habit.service.ts client/src/features/habits/store/useHabitStore.ts client/src/store/useCharacterStore.ts client/src/features/habits/utils/penaltyPresentation.ts client/src/features/habits/utils/penaltyPresentation.test.ts
git commit -m "feat: wire bad habit penalties into client state"
```

---

### Task 5: Add bad-habit creation controls and card feedback

**Files:**
- Modify: `client/src/features/habits/components/wizard/CreateHabitWizard.tsx`
- Modify: `client/src/features/habits/components/wizard/StepBasicInfo.tsx`
- Modify: `client/src/features/habits/components/wizard/StepReview.tsx`
- Modify: `client/src/features/habits/components/EditHabitModal.tsx`
- Modify: `client/src/features/habits/components/HabitCard.tsx`
- Modify: `client/src/features/habits/store/useCreateHabitStore.ts`

**Interfaces:**
- Consumes: store/API types and penalty presentation helpers from Task 4.
- Produces: accessible Positive Habit/Bad Habit controls, preset/custom penalty fields, warning card treatment, and temporary floating damage feedback.

- [ ] **Step 1: Add a failing component contract test or utility test for default presets**

Assert Smoking resolves to `{type: "NEGATIVE", affectedStat: "HP", statModifier: 15}` and that positive drafts continue to produce the existing payload shape.

- [ ] **Step 2: Run the focused test to verify it fails**

```powershell
npm test -- src/features/habits/utils/penaltyPresentation.test.ts
```

Expected: FAIL until preset and draft support are implemented.

- [ ] **Step 3: Extend the draft store and wizard payload**

Add `type`, `affectedStat`, and `statModifier` to the draft and `getPayload`. Show a segmented polarity toggle in the basic-info step. When negative is selected, show preset selection plus custom name/target/amount fields; keep reward tiers available only for positive habits or preserve them without awarding them.

- [ ] **Step 4: Extend edit and review surfaces**

Display and edit the saved penalty fields, show a `-amount target` summary in review, and keep values stable when moving between wizard steps.

- [ ] **Step 5: Update HabitCard behavior**

Use warning/crimson borders and a skull/flame icon for negative habits. Render `Relapse / Log Slip` with an accessible text label and button semantics; on success, add a temporary event that renders the red floating penalty label, then remove it after the animation duration. Keep positive `Complete` behavior unchanged.

- [ ] **Step 6: Run client checks**

```powershell
npm test
npx eslint src/features/habits src/store/useCharacterStore.ts
npx tsc --noEmit
```

Expected: all client tests, lint, and TypeScript checks pass.

- [ ] **Step 7: Commit the UI**

```powershell
git add client/src/features/habits client/src/store/useCharacterStore.ts
git commit -m "feat: add bad habit creation and relapse UI"
```

---

### Task 6: End-to-end verification and manual acceptance

**Files:**
- Modify: only the specific implementation or test file identified by a failing verification command; no new scope is introduced.

- [ ] **Step 1: Generate and push Prisma schema**

```powershell
cd server
prisma generate
prisma db push
```

- [ ] **Step 2: Run complete automated gates**

```powershell
pytest tests -q
cd ..\client
npm test
npm run lint
npx tsc --noEmit
```

- [ ] **Step 3: Perform manual acceptance at `/habits`**

Create a bad habit named `Smoking`, choose `HP`, set the penalty to `15`, save it, record current HP, click `Relapse / Log Slip`, and verify:

```text
new currentHp = max(0, old currentHp - 15)
relapseCount = old relapseCount + 1
visible feedback = "-15 HP"
```

Refresh the page and verify the updated HP and relapse count remain persisted.
