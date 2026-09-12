# Vision Discipline Penalties Design

**Date:** 2026-09-13

## Goal

Let Ascend Vision warn a user when it detects phone use, slouching, or drowsiness, then automatically deduct a user-configured HP penalty when the same behavior repeats within Vision's five-minute warning window. Ascend Core must persist both warnings and penalties and display them in the Habits tab without creating or depending on Habit records.

## Scope

This change spans `D:\ascend-vision` and `D:\ascend-core`:

- Ascend Vision keeps responsibility for detection, debounce, the five-minute two-strike state machine, and spoken feedback.
- Ascend Core owns penalty configuration, authorization, idempotency, HP mutation, durable audit logs, and authoritative narration.
- The Ascend Core Habits tab exposes penalty settings and recent Vision discipline activity.

The existing generic automation and negative-habit flows remain available for other use cases, but Vision's warning-first flow will no longer query, create, or trigger negative habits.

## Behaviors

Core supports exactly three canonical behaviors:

| Behavior | Vision trigger | Default penalty |
| --- | --- | ---: |
| `PHONE_USE` | `SensoryTriggerType.PHONE` | 10 HP |
| `SLOUCHING` | `SensoryTriggerType.SLOUCH` | 10 HP |
| `DROWSINESS` | `SensoryTriggerType.FATIGUE` | 10 HP |

The stored amount is independently configurable from 1 through 100 HP for each behavior. Core is the sole authority for the amount applied; Vision never supplies a penalty amount.

## Data Model

### `VisionDisciplineSetting`

One row per character and behavior:

- `id`: UUID primary key
- `characterId`: owned character foreign key, cascade delete
- `behavior`: canonical behavior string
- `penaltyAmount`: integer, default 10
- `createdAt`
- `updatedAt`
- unique constraint on `(characterId, behavior)`

Missing rows resolve to the default of 10 HP. The settings read endpoint may lazily create all three defaults so subsequent reads and writes have stable identifiers.

### `VisionDisciplineLog`

Append-only audit record:

- `id`: UUID primary key
- `eventId`: client-generated unique identifier used for replay protection
- `characterId`: owned character foreign key, cascade delete
- `behavior`: canonical behavior string
- `stage`: `WARNING` or `PENALTY`
- `deviceId`: originating Vision device identifier
- `observedAt`: timezone-aware detector timestamp supplied by Vision
- `reason`: bounded human-readable detector reason
- `penaltyAmount`: zero for warnings; authoritative actual deduction for penalties
- `previousHp`: null for warnings
- `newHp`: null for warnings
- `createdAt`: Core receipt time
- unique constraint on `eventId`
- index on `(characterId, createdAt)`

The log intentionally has no `habitId`. Deleting or changing a habit cannot affect Vision discipline history.

## Core API

### Vision event ingestion

`POST /api/integration/vision/discipline-events`

Requires a purpose-scoped Ascend Vision bearer token and ownership of `characterId`.

Request fields:

- `eventId`
- `characterId`
- `behavior`
- `stage`
- `deviceId`
- `observedAt`
- `reason`

For `WARNING`, Core writes a log with no HP change. For `PENALTY`, Core reads the setting, clamps the character's HP at zero, updates HP, and writes the log in one database transaction. The response contains the persisted log and canonical narration.

An exact replay of an existing `eventId` returns the existing result without another deduction. Reuse of an existing `eventId` with conflicting content returns HTTP 409.

### User settings

- `GET /api/habits/{character_id}/vision-discipline/settings`
- `PUT /api/habits/{character_id}/vision-discipline/settings/{behavior}`

These routes require a normal user session, verify character ownership, and accept only integer values from 1 through 100.

### User-visible logs

`GET /api/habits/{character_id}/vision-discipline/logs?limit=50`

Requires a normal user session and ownership. Results are newest-first. `limit` is bounded from 1 through 100 and defaults to 50.

## Transaction and Idempotency Rules

Penalty processing must be atomic:

1. Resolve an existing event by `eventId`.
2. If it is an identical replay, return its stored result.
3. Load the character and the behavior-specific penalty setting.
4. Compute `newHp = max(0, previousHp - configuredAmount)` and `actualAmount = previousHp - newHp`.
5. Update `Character.currentHp` and create the audit log in the same transaction.

The log records `actualAmount`, so a character with 4 HP receiving a configured 10 HP penalty records `4`, not `10`. Concurrent duplicate submissions must result in one deduction. If the database client cannot express all operations in one interactive transaction, the service must use the repository's supported transaction primitive and preserve the unique-event constraint as the final replay guard.

## Vision Changes

`WarningFirstStateMachine` retains the existing per-behavior state:

- First qualifying detection: speak the local warning and asynchronously post a `WARNING` event.
- A matching detection after the debounce and within five minutes: asynchronously post a `PENALTY` event.
- A detection after five minutes starts a new warning cycle.
- Phone, slouching, and fatigue state remain independent.

The Core client gains a typed `record_discipline_event` method. The warning state machine stops calling `record_bad_habit_offense`, and therefore never queries, creates, or triggers a Habit. Vision generates a fresh UUID event ID per accepted state-machine transition and sends its configured device ID.

If Core accepts a penalty, Vision speaks Core's canonical narration. If Core is offline or rejects the request, Vision logs the failure and must not claim that HP was deducted. Delivery remains non-blocking so camera processing is not stalled.

## Habits UI

The Habits page adds a `VisionDisciplinePanel` below the summary cards and above the existing search and habit grid.

The panel contains:

- Three setting cards for Phone Use, Slouching, and Drowsiness.
- A numeric HP input constrained to 1–100 on each card.
- Explicit save actions with loading, success, and failure feedback.
- A recent activity list with warning/penalty badges, behavior label, reason, device, timestamp, and HP change.
- Warning copy: `Warning issued — no HP deducted.`
- Penalty copy such as `100 → 90 HP (−10)`.
- Empty, loading, authentication, and Core-offline states that do not block the existing Habits UI.

The UI reads the active character using the same character-store and local fallback already used by the Habits page. It uses the existing authenticated fetch pattern and the current Kyoto-dusk visual language.

## Validation and Security

- Only purpose-scoped Vision tokens can submit discipline events.
- Only normal user sessions can read logs or update settings.
- Every route verifies character ownership.
- Behaviors and stages are closed enums.
- Penalty amounts must be integers from 1 through 100.
- Vision cannot choose the deduction amount or submit before/after HP values.
- Reasons and device IDs have bounded lengths.
- Client timestamps must be timezone-aware; Core stores both observation and receipt times.
- Logs are append-only through the public API.

## Error Handling

- Invalid payloads return HTTP 422.
- Missing or expired authentication returns HTTP 401.
- Ownership failures return HTTP 403 or the repository's existing ownership response.
- Conflicting event ID reuse returns HTTP 409.
- Missing characters return HTTP 404.
- Database failures roll back both HP and log changes.
- Vision contains network and server failures and continues detection.
- The Habits UI shows a retryable inline error while preserving the rest of the page.

## Testing

### Ascend Core server

- Default and independently updated settings
- Settings bounds and ownership
- Warning persistence without HP change
- Penalty persistence with the correct configured behavior amount
- HP floor clamping and actual-amount logging
- Exact replay idempotency
- Conflicting event ID rejection
- Transaction rollback on log or HP update failure
- Vision-token restriction and character ownership
- Newest-first, bounded log reads
- No Habit row created or required

### Ascend Vision

- First offense sends `WARNING` and speaks the local warning
- Repeat offense sends `PENALTY`
- Payload behavior mapping for all three detectors
- Independent warning windows and existing debounce behavior
- No call to habit query/create/trigger APIs
- Canonical penalty narration is spoken only after Core success
- Core failure never produces false success narration

### Ascend Core client

- Settings and logs service contracts
- Panel loading, empty, populated, and error states
- Independent amount edits and validation
- Successful save refreshes displayed state
- Warning and penalty rendering, including HP transitions
- Existing Habits page remains usable when the Vision panel request fails

## Migration and Compatibility

The Prisma migration adds the two new tables and character relations without modifying existing Habit or HabitRelapseLog rows. Existing negative habits and automation rules remain intact. No historical negative-habit relapse data is copied because those records cannot reliably distinguish Vision-triggered activity from other sources.

The Vision client and Core endpoint should ship together. During a version mismatch, Vision handles a missing endpoint as a contained delivery failure; detection and local warnings continue to work.

## Acceptance Criteria

1. A first phone, slouch, or drowsiness event is spoken locally and visible as a warning in the Habits tab.
2. A repeat of the same behavior after debounce and within five minutes deducts that behavior's configured HP amount and creates a penalty log.
3. The flow creates no Habit and requires no existing Habit.
4. Each behavior's penalty can be changed independently in the Habits tab within 1–100 HP.
5. Duplicate event delivery cannot deduct HP twice.
6. The activity list clearly distinguishes warnings from penalties and shows the actual HP transition.
7. Unauthorized or cross-character requests cannot read, configure, or apply penalties.
8. Existing Vision detection, Habits, and automation behavior continues to pass its regression tests.
