# Ascend Core ↔ Ascend Vision AI Communication

## Purpose

Create one typed, authenticated contract between Ascend Vision and Ascend Core.

Vision owns conversation, intent extraction, and user-facing responses. Core and AIRA own domain data, validation, permissions, business rules, and mutations. Vision must call Core tools rather than reading Core's database or relying on free-form AIRA responses.

## Target flow

```text
User → Ascend Vision
     → typed Core query or action request
     → Core authentication and validation
     → AIRA/domain service execution
     → typed response
     → Vision explanation or confirmation
```

## Shared contract

## Phase 1 Contract Inventory

The Phase 1 capability inventory records the existing Core owner for each initial
read. Future Vision contract routes must adapt these readers rather than duplicate
their domain logic.

| Intent | Phase 1 availability | Future Core owner | Reason |
| --- | --- | --- | --- |
| `missions_summary` | `available` | `routers.missions.get_today_missions` | Core owns mission state. |
| `habits_summary` | `available` | `routers.integration.get_existing_habits` / `routers.habits.get_habits` | Core owns habit state. |
| `automations_summary` | `available` | `routers.automations.list_automations` | Core owns automation rules. |
| `steps_summary` | `available` | `routers.beasts.sync_steps` persistence plus Character/DailyStepLog reads | Core persists daily steps. |
| `recovery_summary` | `available` | `routers.workouts.compute_muscle_status_dict` | Core computes workout-derived muscle recovery. |
| `sleep_summary` | `unavailable` | none | Vision currently owns local sleep observations; Core has no sleep model. |
| `health_summary` | `unavailable` | none | Core has no authoritative heart-rate or broad health metric model. |

`CharacterStats.recovery` is an RPG stat, not physiological health data.
`MuscleRecoveryState` is workout-derived muscle fatigue/freshness and is exposed
only as `recovery_summary`. Core does not own sleep, heart-rate, video, image,
frame, screenshot, or camera data. `sleep_summary` and `health_summary` return
`unavailable_data` until Core gains an authoritative persistence model.

The typed read request is:

```json
{
  "characterId": "character-1",
  "requestId": "vision-query-001",
  "capabilityVersion": "2026-09-09",
  "intent": "missions_summary",
  "parameters": {}
}
```

The success envelope is:

```json
{
  "success": true,
  "requestId": "vision-query-001",
  "intent": "missions_summary",
  "data": {}
}
```

The error envelope is:

```json
{
  "success": false,
  "requestId": "vision-query-001",
  "error": {
    "code": "unavailable_data",
    "message": "Sleep data is not available from Ascend Core.",
    "retryable": false
  }
}
```

Allowed error codes are `unsupported_capability_version`,
`unsupported_intent`, `unavailable_data`, `invalid_request`,
`authentication_required`, `authentication_expired`, and
`forbidden_character`.

- `capabilityVersion` is required and must equal `2026-09-09`.
- `requestId` is an opaque client-generated idempotency key, 1–128 characters, matching `^[A-Za-z0-9._:-]+$`.
- `characterId` is required and is authorized by the existing Vision Bearer token.
- Every response echoes `requestId`.
- `unavailable_data` is a valid business response, not an empty successful result.

The existing Vision Bearer token uses the JWT purpose `ascend_vision` and
identifies the authenticated user. The future Phase 2 Vision contract handler
must enforce character ownership before dispatching a read.

Phase 2 may add the capability and query HTTP routes only by importing
`vision_capabilities()` and `VisionQueryRequest` from
`server/schemas/vision_contract.py`. It must use the existing purpose-bound
Vision Bearer token dependency and perform an explicit character-ownership
check before dispatching any read.

- Existing AIRA tools are a Gemini-specific allowlist and are not the Vision contract.
- Existing AIRA chat and execute routes do not currently enforce the Vision ownership boundary; Phase 2 must not proxy Vision requests through them.
- Existing integration command replay protection is process-local; Phase 2 query responses may echo request IDs, but durable multi-instance idempotency is deferred to the write-action phase.

### Capability discovery

```http
GET /api/integration/vision/capabilities
```

The Phase 1 response must include a version, an availability map for every read
intent, and no write capabilities:

```json
{
  "version": "2026-09-09",
  "reads": {
    "missions_summary": { "availability": "available" },
    "habits_summary": { "availability": "available" },
    "automations_summary": { "availability": "available" },
    "steps_summary": { "availability": "available" },
    "recovery_summary": { "availability": "available" },
    "sleep_summary": { "availability": "unavailable" },
    "health_summary": { "availability": "unavailable" }
  },
  "writes": []
}
```

Future write capabilities (`create_habit`, `complete_habit`,
`create_automation`, and `update_automation`) are Phase 5 work and are not
advertised by the Phase 1 manifest.

### Typed reads

```http
POST /api/integration/vision/query
```

```json
{
  "characterId": "...",
  "requestId": "...",
   "capabilityVersion": "2026-09-09",
  "intent": "steps_summary",
  "parameters": {}
}
```

Responses must be structured JSON with stable keys. Core must return explicit errors for unsupported intents, unavailable data, invalid characters, expired authentication, and unsupported contract versions.

### Future typed writes (Phase 5)

Use a preview/execute pair for user-impacting changes:

```http
POST /api/integration/vision/actions/preview
POST /api/integration/vision/actions/execute
```

The preview validates ownership, input fields, duplicates, and domain rules. It returns a normalized action and a short-lived confirmation token. Execute accepts only that normalized action/token and is idempotent by `requestId`.

Automatic Vision observation automations remain the special no-confirmation path already defined by the automation contract.

## Checkpoints and agent ownership

### Checkpoint 1 — Contract and domain inventory

Owner: `core-contract-agent`

- [ ] Inventory existing AIRA routes, command intents, authentication, missions, habits, sleep, steps, recovery, health, and automation services.
- [ ] Define the first capability version and exact request/response/error schemas.
- [ ] Identify which existing service owns each tool; do not duplicate domain logic.
- [ ] Record unavailable metrics explicitly instead of returning invented values.

Completion criterion: the contract lists every initial read/write tool, owner, auth rule, response shape, and error code.

### Checkpoint 2 — Core capability manifest

Owner: `core-api-agent`

- [ ] Add `GET /api/integration/vision/capabilities`.
- [ ] Add capability-version negotiation.
- [ ] Add Vision authentication and character ownership checks.
- [ ] Add tests for missing, expired, invalid, and unauthorized Vision credentials.

Completion criterion: Vision can discover supported tools and versions without accessing implementation details.

### Checkpoint 3 — Core typed read tools

Owner: `core-context-agent`

- [ ] Add `POST /api/integration/vision/query`.
- [ ] Implement `missions_summary` and `habits_summary` by reusing existing services.
- [ ] Implement `sleep_summary`, `steps_summary`, and `health_summary` only where Core has authoritative data.
- [ ] Add `automations_summary` using the existing automation response contract.
- [ ] Add request idempotency and structured unavailable-data errors.

Completion criterion: every supported read returns deterministic typed data and every unsupported/unavailable read returns a clear machine-readable error.

### Checkpoint 4 — AIRA read-tool integration

Owner: `aira-tools-agent`

- [ ] Give AIRA a constrained tool registry matching the Core capability manifest.
- [ ] Make AIRA call Core domain services/tools, not Prisma directly.
- [ ] Validate tool name, character scope, parameters, and response schema.
- [ ] Add logging for tool selection, latency, failures, and request IDs without storing sensitive raw prompts unnecessarily.

Completion criterion: AIRA can answer missions, habits, sleep, steps, and health questions using typed Core results.

### Checkpoint 5 — Core write preview and execution

Owner: `core-actions-agent`

- [ ] Add typed action preview and execution endpoints.
- [ ] Implement `create_habit`, `complete_habit`, `create_automation`, and `update_automation` through existing domain services.
- [ ] Normalize inputs before execution.
- [ ] Require confirmation for ordinary user-impacting writes.
- [ ] Preserve the automatic no-confirmation path for the three Vision detection automations.
- [ ] Enforce ownership, duplicate prevention, idempotency, cooldowns, and audit records.

Completion criterion: every write either produces a validated preview or executes exactly once through an authorized Core service.

### Checkpoint 6 — Vision Core client and voice routing

Owner: `vision-integration-agent`

- [ ] Add typed Vision client methods for capabilities, queries, action previews, and action execution.
- [ ] Replace duplicated mission/habit command handling with Core tool calls where appropriate.
- [ ] Route “How did I sleep?”, “How many steps do I have?”, “What are my missions?”, and “Show my habits.” to typed Core intents.
- [ ] Present write previews to the user and execute only after confirmation.
- [ ] Handle Core error codes in user-friendly language.
- [ ] Cache capabilities briefly and refresh on version mismatch.

Completion criterion: Vision can answer supported Core questions and safely perform supported Core changes without local duplication of Core business logic.

### Checkpoint 7 — End-to-end security and contract tests

Owner: `integration-review-agent`

- [ ] Test capability negotiation and unsupported versions.
- [ ] Test read authorization and cross-character access rejection.
- [ ] Test write preview, confirmation, execution, replay, and duplicate requests.
- [ ] Test unavailable sleep/steps/health data.
- [ ] Test AIRA tool allowlisting and malformed tool arguments.
- [ ] Test Vision phrasing for success, confirmation, and errors.
- [ ] Run Core and Vision test, lint, typecheck, and build commands.

Completion criterion: the shared contract is verified at HTTP boundaries, no unauthorized mutation path exists, and all required checks have fresh passing evidence.

## Guardrails

- Use structured tool names and schemas instead of free-form AI-to-AI commands.
- Keep Core authoritative for Core-owned data and mutations.
- Keep Vision responsible for conversation and presentation.
- Never expose database credentials, raw database queries, or unrestricted model-generated actions.
- Treat health data as private and return the minimum necessary fields.
- Make every mutating request authenticated, auditable, and idempotent.
