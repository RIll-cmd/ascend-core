# Bad Habits Stat Penalty Design

## Goal

Add negative-polarity habits to `/habits` so a user can track a vice, trigger a relapse, immediately lose the configured HP, EXP, or character stat, and retain the result across refreshes.

## Existing constraints

- The existing `Habit` model already owns habit scheduling, difficulty, tiers, metrics, and missions. New polarity fields must extend it without replacing those fields.
- The repository's Prisma datasource is PostgreSQL. The implementation will preserve that configured datasource and use the existing Prisma database workflow; it will not introduce a parallel SQLite store.
- `Character` currently stores EXP and `CharacterStats` stores the available attributes. HP and max HP do not currently exist.
- Existing positive habit completion flows through `POST /api/habits/{habit_id}/log`, the habit service, `useHabitStore`, and the progression event bus.

## Data model

Add to `Habit`:

- `type`: enum `POSITIVE | NEGATIVE`, default `POSITIVE`.
- `affectedStat`: string, default `HP`.
- `statModifier`: positive integer, default `10`.
- `relapseCount`: integer, default `0`.
- `streakDays`: integer, default `0`.
- `lastTriggeredAt`: nullable DateTime.

Add to `Character`:

- `maxHp`: integer, default `100`.
- `currentHp`: integer, default `100`.

Add `HabitRelapseLog`:

- id, habitId, characterId, affectedStat, amount, previousValue, newValue, createdAt.
- Cascade with the owning character and habit.
- Index by character and creation time for future history views.

The schema must retain the existing `CharacterStats` attributes. `VITALITY` is a public penalty target mapped to `CharacterStats.endurance`; `DISCIPLINE`, `STRENGTH`, `KNOWLEDGE`, `FOCUS`, `RECOVERY`, and `CONSISTENCY` map directly to their same-named fields.

## Backend behavior

Extend create and update validation with `type`, `affectedStat`, and `statModifier`. Reject non-positive modifiers and unsupported target names. Normalize target names to uppercase at the API boundary.

Add `POST /api/habits/{habit_id}/trigger` with the existing optional-auth and ownership checks. In one database transaction:

1. Load the habit and its character.
2. For `POSITIVE`, use the existing completion behavior and response shape.
3. For `NEGATIVE`, subtract `statModifier` from the selected target.
4. Clamp HP, EXP, and attributes at zero.
5. Increment `relapseCount`, reset `streakDays`, and set `lastTriggeredAt`.
6. Insert a `HabitRelapseLog` row.
7. Return the updated habit, updated character, updated stats, and penalty metadata.

Negative triggers must not award XP, gold, stat points, or boss damage. Positive completion behavior must remain compatible with the existing `/log` path.

## Frontend behavior

Add polarity controls to the existing habit creation wizard and edit flow:

- Positive Habit (+) keeps the existing reward-oriented fields and completion language.
- Bad Habit (-) exposes preset selection or custom name, penalty target, and positive magnitude displayed as a deduction.
- Presets: Overeating → HP 10, Smoking → HP 15, Procrastinating → DISCIPLINE 5.

Extend the `Habit` and create/update payload types. Add a service method for `/trigger` and a store action that:

- calls the API;
- updates the habit and character stores from the response;
- records a temporary damage event for UI feedback;
- leaves positive habit completion unchanged.

Bad-habit cards use crimson warning styling and a “Relapse / Log Slip” action. The action shows a short-lived floating damage label such as `-15 HP`; it must be keyboard accessible and not rely on color alone. Positive cards retain their current green/reward styling and “Complete” action.

## Testing and verification

Backend tests will cover:

- creation and validation of both polarities;
- negative HP, EXP, direct-stat, and VITALITY/endurance deductions;
- zero clamping;
- relapse counter, clean-streak reset, timestamp, and durable log creation;
- ownership rejection;
- positive completion regression.

Frontend tests will cover target normalization/display, penalty response handling, and character-store updates.

Verification will run Prisma client generation, the relevant server tests, client tests, lint, and TypeScript checks. Manual acceptance: create Smoking with `-15 HP`, trigger it, confirm HP drops by 15, relapse count increments, and refresh preserves both values.

## Non-goals

- Background or automatic relapse detection.
- Debuff states after HP reaches zero.
- Replacing the configured PostgreSQL datasource with SQLite.
- Reworking unrelated habit scheduling, mission, or progression systems.
