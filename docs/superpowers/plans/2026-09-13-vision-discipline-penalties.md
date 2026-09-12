# Vision Discipline Penalties Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deduct behavior-specific, user-configured HP penalties for repeated Ascend Vision offenses and show durable warnings and penalty logs in the Ascend Core Habits tab without creating Habit records.

**Architecture:** Ascend Vision keeps the warning-window state machine and submits typed warning or penalty events through its purpose-scoped token. Ascend Core owns behavior settings, idempotent event persistence, atomic HP deductions, and canonical responses; the Habits UI reads and edits that Core-owned state.

**Tech Stack:** Python 3.11, FastAPI, Pydantic 2, Prisma Client Python/PostgreSQL, pytest, httpx, Next.js 16, React 19, TypeScript, Vitest, Tailwind CSS.

**Spec:** `D:\ascend-core\docs\superpowers\specs\2026-09-13-vision-discipline-penalties-design.md`

## Global Constraints

- Supported behaviors are exactly `PHONE_USE`, `SLOUCHING`, and `DROWSINESS`.
- Each behavior defaults to a 10 HP penalty and is independently configurable from 1 through 100 HP.
- The first accepted Vision event is a warning with no HP change; a matching repeat after debounce and within five minutes is a penalty.
- Ascend Core, never Vision, selects the amount and computes the HP transition.
- Penalty application and audit-log creation are atomic and idempotent by `eventId`.
- Vision discipline records have no `habitId`; this flow must not query, create, or trigger Habit records.
- Only purpose-scoped Vision tokens submit events; only normal user sessions read logs or update settings; all routes enforce character ownership.
- Existing uncommitted changes in `D:\ascend-core` belong to the user. Do not edit, stage, or commit them unless a task names the file.
- Use each repository's checked-in virtual environment for Python commands.

## File Structure

### Ascend Core server

- Modify `server/prisma/schema.prisma`: persistent settings and event-log models.
- Create `server/schemas/vision_discipline.py`: closed enums and validated request types.
- Create `server/services/vision_discipline_service.py`: settings, log reads, replay handling, and transactional HP penalties.
- Create `server/routers/vision_discipline.py`: secured Vision-ingestion and user-management routes.
- Modify `server/main.py` and `server/schemas/vision_contract.py`: register and advertise the new contract.
- Create `server/tests/test_vision_discipline_service.py` and `server/tests/test_vision_discipline_api.py`.

### Ascend Vision

- Modify `ascend-vision/vision_client/ascend_core_client.py` and the three maintained SDK mirrors with direct discipline-event transport.
- Modify `ascend-vision/integrations/warning_state_machine.py` to send warning and penalty stages without Habit coupling.
- Add or update focused client, state-machine, and integration tests.

### Ascend Core client

- Create `client/src/features/habits/types/visionDiscipline.ts` and `services/visionDiscipline.service.ts`.
- Create `client/src/features/habits/components/visionDisciplinePresentation.ts` and `VisionDisciplinePanel.tsx`.
- Modify the habits barrels and `client/src/app/(dashboard)/habits/page.tsx`.
- Add focused Vitest coverage for API mapping and deterministic presentation helpers.

---

### Task 1: Core persistence and transactional discipline service

**Files:**
- Modify: `D:\ascend-core\server\prisma\schema.prisma`
- Create: `D:\ascend-core\server\schemas\vision_discipline.py`
- Create: `D:\ascend-core\server\services\vision_discipline_service.py`
- Create: `D:\ascend-core\server\tests\test_vision_discipline_service.py`

**Interfaces:**
- Produces: `VisionBehavior`, `VisionDisciplineStage`, `VisionDisciplineEventRequest`, `VisionDisciplineSettingUpdate`.
- Produces: `get_discipline_settings(character_id, db_client=None) -> list[dict]`.
- Produces: `update_discipline_setting(character_id, behavior, penalty_amount, db_client=None) -> dict`.
- Produces: `list_discipline_logs(character_id, limit=50, db_client=None) -> list[dict]`.
- Produces: `record_discipline_event(request, db_client=None) -> dict`.

- [ ] **Step 1: Write failing schema and service tests**

Create an in-memory fake Prisma delegate/transaction. Cover all defaults, independent updates, warnings without HP changes, configured deductions, HP-floor clamping, exact replay, concurrent duplicate delivery, conflicting replay, rollback on log failure, newest-first bounded log reads, and absence of Habit access:

```python
@pytest.mark.asyncio
async def test_penalty_does_not_read_or_create_a_habit(fake_db):
    fake_db.habit = SimpleNamespace(
        find_many=AsyncMock(side_effect=AssertionError("habit read")),
        create=AsyncMock(side_effect=AssertionError("habit create")),
    )
    result = await record_discipline_event(
        discipline_event(behavior="PHONE_USE", stage="PENALTY"),
        db_client=fake_db,
    )
    assert result["log"]["behavior"] == "PHONE_USE"
    assert result["penalty"]["amount"] == 10
```

- [ ] **Step 2: Run the new tests and verify the red state**

```powershell
cd D:\ascend-core\server
.\.venv\Scripts\python.exe -m pytest tests/test_vision_discipline_service.py -q
```

Expected: collection fails because the new schema and service modules do not exist.

- [ ] **Step 3: Add Prisma models and Character relations**

Add `visionDisciplineSettings VisionDisciplineSetting[]` and `visionDisciplineLogs VisionDisciplineLog[]` to `Character`. Add:

```prisma
model VisionDisciplineSetting {
  id            String    @id @default(uuid())
  characterId   String
  character     Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  behavior      String
  penaltyAmount Int       @default(10)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  @@unique([characterId, behavior])
}

model VisionDisciplineLog {
  id            String    @id @default(uuid())
  eventId       String    @unique
  characterId   String
  character     Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  behavior      String
  stage         String
  deviceId      String
  observedAt    DateTime
  reason        String
  penaltyAmount Int       @default(0)
  previousHp    Int?
  newHp         Int?
  createdAt     DateTime  @default(now())
  @@index([characterId, createdAt])
}
```

- [ ] **Step 4: Add closed Pydantic contracts**

```python
class VisionBehavior(str, Enum):
    PHONE_USE = "PHONE_USE"
    SLOUCHING = "SLOUCHING"
    DROWSINESS = "DROWSINESS"

class VisionDisciplineStage(str, Enum):
    WARNING = "WARNING"
    PENALTY = "PENALTY"

class VisionDisciplineEventRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    eventId: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$")
    characterId: str = Field(min_length=1, max_length=128)
    behavior: VisionBehavior
    stage: VisionDisciplineStage
    deviceId: str = Field(min_length=1, max_length=128)
    observedAt: datetime
    reason: str = Field(min_length=1, max_length=280)

class VisionDisciplineSettingUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    penaltyAmount: int = Field(ge=1, le=100)
```

Add a field validator that rejects a timezone-naive `observedAt`.

- [ ] **Step 5: Implement the minimal transactional service**

Use `DEFAULT_PENALTY_AMOUNT = 10` and `async with db.tx() as transaction`. For penalties:

```python
previous_hp = character.currentHp
configured_amount = setting.penaltyAmount if setting else DEFAULT_PENALTY_AMOUNT
new_hp = max(0, previous_hp - configured_amount)
actual_amount = previous_hp - new_hp
```

Update HP and create the log in the same transaction. Exact replay compares `characterId`, behavior, stage, device, normalized observation time, and reason and returns `idempotentReplay: True`; conflicting reuse raises HTTP 409. Catch the Prisma unique-key race from concurrent `eventId` submissions after transaction rollback, reload the winning log, and apply the same exact/conflicting replay comparison. Warning responses contain `penalty: None` and `canonicalNarration: None`. Penalty responses contain the configured and actual amounts, previous/new HP, and Core-generated narration.

- [ ] **Step 6: Validate and regenerate Prisma, then run tests**

```powershell
cd D:\ascend-core\server
.\.venv\Scripts\python.exe -m prisma validate
.\.venv\Scripts\python.exe -m prisma generate
.\.venv\Scripts\python.exe -m pytest tests/test_vision_discipline_service.py -q
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit Task 1**

```powershell
git add server/prisma/schema.prisma server/schemas/vision_discipline.py server/services/vision_discipline_service.py server/tests/test_vision_discipline_service.py
git commit -m "feat(core): add direct vision discipline persistence"
```

### Task 2: Secure Core HTTP contracts

**Files:**
- Create: `D:\ascend-core\server\routers\vision_discipline.py`
- Modify: `D:\ascend-core\server\main.py`
- Modify: `D:\ascend-core\server\schemas\vision_contract.py`
- Create: `D:\ascend-core\server\tests\test_vision_discipline_api.py`
- Modify: `D:\ascend-core\server\tests\test_vision_contract.py`

**Interfaces:**
- Consumes Task 1 contracts and service functions.
- Produces: `POST /api/integration/vision/discipline-events`.
- Produces: settings `GET`/`PUT` and logs `GET` under `/api/habits/{character_id}/vision-discipline`.

- [ ] **Step 1: Write failing API tests**

Use a small FastAPI app with the new router, real JWT helpers, and monkeypatched ownership/service functions. Assert a normal web token cannot post Vision events and a Vision token cannot read or modify user settings. Cover success, cross-character 403, unknown behavior 422, amounts 0/101 returning 422, naive timestamps returning 422, and log limit bounds.

```python
def test_web_token_cannot_submit_vision_event(client):
    response = client.post(
        "/api/integration/vision/discipline-events",
        headers=web_headers("user-1"),
        json=event_payload(),
    )
    assert response.status_code == 401
```

- [ ] **Step 2: Run the API tests and verify the red state**

```powershell
cd D:\ascend-core\server
.\.venv\Scripts\python.exe -m pytest tests/test_vision_discipline_api.py -q
```

Expected: import failure because the router does not exist.

- [ ] **Step 3: Implement and register the router**

Use `get_current_vision_user` for ingestion and `get_current_user` for settings/logs. The ingestion route calls existing `get_owned_vision_character`; user routes call `verify_character_ownership` and return 403 on mismatch. Bind log `limit` using `Query(50, ge=1, le=100)`. Register `vision_discipline.router` in `main.py`.

- [ ] **Step 4: Advertise the write contract**

Change the Vision capability manifest to:

```python
"writes": {
    "discipline_event": {
        "availability": "available",
        "path": "/api/integration/vision/discipline-events",
    }
},
```

Update the previous read-only manifest test.

- [ ] **Step 5: Run focused API and contract tests**

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_vision_discipline_api.py tests/test_vision_contract.py tests/test_vision_query_api.py tests/test_vision_auth_bridge.py -q
```

Expected: all focused tests pass.

- [ ] **Step 6: Commit Task 2**

```powershell
git add server/routers/vision_discipline.py server/main.py server/schemas/vision_contract.py server/tests/test_vision_discipline_api.py server/tests/test_vision_contract.py
git commit -m "feat(core): expose secure vision discipline APIs"
```

### Task 3: Vision SDK direct-event transport

**Files:**
- Modify: `D:\ascend-vision\ascend-vision\vision_client\ascend_core_client.py`
- Modify: `D:\ascend-vision\vision_client\ascend_core_client.py`
- Modify: `D:\ascend-vision\vision-client\ascend_core_client.py`
- Modify: `D:\ascend-core\clients\vision-client\ascend_core_client.py`
- Create: `D:\ascend-vision\ascend-vision\tests\test_vision_discipline_client.py`

**Interfaces:**
- Produces: `record_discipline_event(*, event_id: str, behavior: str, stage: str, reason: str, observed_at: datetime) -> dict[str, Any]`.

- [ ] **Step 1: Write failing SDK tests**

Mock `httpx.AsyncClient`; assert endpoint, bearer headers, payload, response passthrough, and pre-network rejection of naive datetimes or unsupported enum strings.

```python
result = asyncio.run(client.record_discipline_event(
    event_id="vision-discipline-abc",
    behavior="PHONE_USE",
    stage="PENALTY",
    reason="Phone use repeated within the warning window.",
    observed_at=datetime(2026, 9, 13, 9, 0, tzinfo=timezone.utc),
))
assert result["penalty"]["newValue"] == 90
```

- [ ] **Step 2: Run the SDK test and verify the red state**

```powershell
cd D:\ascend-vision\ascend-vision
.\.venv\Scripts\python.exe -m pytest tests/test_vision_discipline_client.py -q
```

Expected: failure because the method is absent.

- [ ] **Step 3: Implement the transport in every maintained SDK copy**

Serialize the aware timestamp in UTC and post:

```python
payload = {
    "eventId": event_id,
    "characterId": self.character_id,
    "behavior": behavior,
    "stage": stage,
    "deviceId": self.device_id,
    "observedAt": observed_at.astimezone(timezone.utc).isoformat(),
    "reason": reason,
}
res = await client.post(
    "/api/integration/vision/discipline-events",
    headers=self.headers,
    json=payload,
)
res.raise_for_status()
return res.json()
```

Retain legacy Habit methods for voice habit creation and external compatibility.

- [ ] **Step 4: Run SDK tests**

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_vision_discipline_client.py tests/test_ascend_client.py -q
```

Expected: all tests pass.

- [ ] **Step 5: Commit SDK changes separately by repository**

```powershell
cd D:\ascend-vision
git add ascend-vision/vision_client/ascend_core_client.py vision_client/ascend_core_client.py vision-client/ascend_core_client.py ascend-vision/tests/test_vision_discipline_client.py
git commit -m "feat(vision): add direct discipline event client"

cd D:\ascend-core
git add clients/vision-client/ascend_core_client.py
git commit -m "feat(sdk): expose vision discipline event transport"
```

### Task 4: Rewire the warning-first state machine

**Files:**
- Modify: `D:\ascend-vision\ascend-vision\integrations\warning_state_machine.py`
- Modify: `D:\ascend-vision\ascend-vision\tests\test_warning_state_machine.py`
- Modify: `D:\ascend-vision\ascend-vision\tests\test_ascend_core_integration.py`

**Interfaces:**
- Consumes `record_discipline_event` from Task 3.
- Produces Core `WARNING` delivery on offense 1 and Core `PENALTY` delivery on offense 2.

- [ ] **Step 1: Replace old expectations with failing direct-event tests**

Give the Core mock only `record_discipline_event = AsyncMock(return_value={"success": True, "canonicalNarration": "Vision discipline penalty applied: -10 HP."})`, so any lingering Habit method call fails. Parameterize all mappings:

```python
@pytest.mark.parametrize(("trigger", "behavior"), [
    (SensoryTriggerType.PHONE, "PHONE_USE"),
    (SensoryTriggerType.SLOUCH, "SLOUCHING"),
    (SensoryTriggerType.FATIGUE, "DROWSINESS"),
])
def test_warning_and_repeat_send_direct_events(
    trigger, behavior, mock_core_client, mock_feedback
):
    clock = MockTime(500.0)
    machine = WarningFirstStateMachine(
        core_client=mock_core_client,
        feedback_service=mock_feedback,
        time_fn=clock,
        debounce_seconds=5.0,
    )
    assert machine.handle_trigger(trigger)["stage"] == "WARNING"
    clock.advance(60)
    assert machine.handle_trigger(trigger)["stage"] == "PENALTY"
    calls = mock_core_client.record_discipline_event.call_args_list
    assert [call.kwargs["stage"] for call in calls] == ["WARNING", "PENALTY"]
    assert all(call.kwargs["behavior"] == behavior for call in calls)
```

Also assert unique event IDs, timezone-aware timestamps, independent behavior windows, no false success narration on Core errors, and authoritative narration after Core accepts a penalty.

- [ ] **Step 2: Run focused tests and verify the red state**

```powershell
cd D:\ascend-vision\ascend-vision
.\.venv\Scripts\python.exe -m pytest tests/test_warning_state_machine.py tests/test_ascend_core_integration.py -q
```

Expected: failures because warnings are not sent and repeats still call `record_bad_habit_offense`.

- [ ] **Step 3: Replace Habit configuration with discipline configuration**

```python
@dataclass(frozen=True)
class DisciplineConfig:
    behavior: str
    warning_text: str
    warning_reason: str
    penalty_reason: str
```

Map phone to `PHONE_USE`, slouch to `SLOUCHING`, and fatigue to `DROWSINESS`. Keep the current warning copy, 15-second debounce, five-minute repeat window, and synchronous warning speech.

- [ ] **Step 4: Dispatch each accepted transition non-blockingly**

Add `observed_at_fn` defaulting to `lambda: datetime.now(timezone.utc)`. Generate one `vision-discipline-{uuid.uuid4()}` event ID per accepted transition and submit:

```python
result = await self.core_client.record_discipline_event(
    event_id=event_id,
    behavior=cfg.behavior,
    stage=stage,
    reason=reason,
    observed_at=observed_at,
)
if stage == "PENALTY":
    narration = result.get("canonicalNarration")
    if narration and speak_announcement is not None:
        speak_announcement(narration)
```

Log delivery failure without speaking a claimed deduction. Return `offense`, `behavior`, `stage`, `event_id`, and monotonic `timestamp`; do not expose a Vision-selected amount.

- [ ] **Step 5: Run warning and detector regression tests**

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_warning_state_machine.py tests/test_ascend_core_integration.py tests/test_fusion.py tests/test_posture.py tests/test_drowsiness.py -q
```

Expected: all tests pass.

- [ ] **Step 6: Commit Task 4**

```powershell
cd D:\ascend-vision
git add ascend-vision/integrations/warning_state_machine.py ascend-vision/tests/test_warning_state_machine.py ascend-vision/tests/test_ascend_core_integration.py
git commit -m "feat(vision): send warnings and direct repeat penalties"
```

### Task 5: Habits client API contracts

**Files:**
- Create: `D:\ascend-core\client\src\features\habits\types\visionDiscipline.ts`
- Modify: `D:\ascend-core\client\src\features\habits\types\index.ts`
- Create: `D:\ascend-core\client\src\features\habits\services\visionDiscipline.service.ts`
- Modify: `D:\ascend-core\client\src\features\habits\services\index.ts`
- Create: `D:\ascend-core\client\src\features\habits\services\visionDiscipline.service.test.ts`

**Interfaces:**
- Produces TypeScript `VisionBehavior`, `VisionDisciplineSetting`, `VisionDisciplineLog`, and `VisionDisciplineStage`.
- Produces `fetchVisionDisciplineSettings`, `updateVisionDisciplineSetting`, and `fetchVisionDisciplineLogs`.

- [ ] **Step 1: Write failing service-contract tests**

Stub global `fetch`. Verify encoded path segments, `credentials: "include"`, optional local-storage bearer token, `PUT` JSON `{ penaltyAmount: 25 }`, response passthrough, local amount validation, and a typed error containing HTTP status for non-2xx responses.

- [ ] **Step 2: Run the new tests and verify the red state**

```powershell
cd D:\ascend-core\client
npm.cmd test -- src/features/habits/services/visionDiscipline.service.test.ts
```

Expected: import failure because the service is absent.

- [ ] **Step 3: Add exact TypeScript contracts**

```typescript
export type VisionBehavior = "PHONE_USE" | "SLOUCHING" | "DROWSINESS";
export type VisionDisciplineStage = "WARNING" | "PENALTY";

export interface VisionDisciplineSetting {
  id: string;
  characterId: string;
  behavior: VisionBehavior;
  penaltyAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VisionDisciplineLog {
  id: string;
  eventId: string;
  characterId: string;
  behavior: VisionBehavior;
  stage: VisionDisciplineStage;
  deviceId: string;
  observedAt: string;
  reason: string;
  penaltyAmount: number;
  previousHp: number | null;
  newHp: number | null;
  createdAt: string;
}
```

- [ ] **Step 4: Implement authenticated service functions**

Follow `habit.service.ts` for `API_BASE_URL`, credentials, and bearer-token headers. Throw `VisionDisciplineApiError` instead of converting failures into successful empty data. Encode path parameters and reject amounts unless `Number.isInteger(amount) && amount >= 1 && amount <= 100`.

- [ ] **Step 5: Run service tests and commit**

```powershell
npm.cmd test -- src/features/habits/services/visionDiscipline.service.test.ts
cd D:\ascend-core
git add client/src/features/habits/types/visionDiscipline.ts client/src/features/habits/types/index.ts client/src/features/habits/services/visionDiscipline.service.ts client/src/features/habits/services/visionDiscipline.service.test.ts client/src/features/habits/services/index.ts
git commit -m "feat(habits): add vision discipline client contracts"
```

Expected: all new service tests pass before the commit.

### Task 6: Vision Discipline settings and logs panel

**Files:**
- Create: `D:\ascend-core\client\src\features\habits\components\visionDisciplinePresentation.ts`
- Create: `D:\ascend-core\client\src\features\habits\components\visionDisciplinePresentation.test.ts`
- Create: `D:\ascend-core\client\src\features\habits\components\VisionDisciplinePanel.tsx`
- Modify: `D:\ascend-core\client\src\features\habits\components\index.ts`
- Modify: `D:\ascend-core\client\src\app\(dashboard)\habits\page.tsx`

**Interfaces:**
- Consumes Task 5 types and services.
- Produces `VisionDisciplinePanel({ characterId }: { characterId: string })`.
- Produces pure `formatVisionDisciplineLog(log)` and `normalizePenaltyInput(value)` helpers.

- [ ] **Step 1: Write failing presentation tests**

```typescript
expect(formatVisionDisciplineLog({
  id: "log-1",
  eventId: "event-1",
  characterId: "character-1",
  behavior: "SLOUCHING",
  stage: "PENALTY",
  deviceId: "ascend-vision",
  observedAt: "2026-09-13T09:00:00Z",
  reason: "Slouching repeated within the warning window.",
  penaltyAmount: 10,
  previousHp: 100,
  newHp: 90,
  createdAt: "2026-09-13T09:00:01Z",
})).toMatchObject({
  behaviorLabel: "Slouching",
  detail: "100 → 90 HP (−10)",
});

expect(formatVisionDisciplineLog({
  id: "log-2",
  eventId: "event-2",
  characterId: "character-1",
  behavior: "PHONE_USE",
  stage: "WARNING",
  deviceId: "ascend-vision",
  observedAt: "2026-09-13T08:59:00Z",
  reason: "Phone use detected.",
  penaltyAmount: 0,
  previousHp: null,
  newHp: null,
  createdAt: "2026-09-13T08:59:01Z",
}).detail)
  .toBe("Warning issued — no HP deducted.");
```

Also test all behavior labels and valid/invalid penalty inputs.

- [ ] **Step 2: Run the presentation tests and verify the red state**

```powershell
cd D:\ascend-core\client
npm.cmd test -- src/features/habits/components/visionDisciplinePresentation.test.ts
```

Expected: import failure because the module is absent.

- [ ] **Step 3: Implement presentation helpers**

```typescript
export const VISION_BEHAVIORS = [
  { behavior: "PHONE_USE", label: "Phone Use", description: "Repeated phone distraction" },
  { behavior: "SLOUCHING", label: "Slouching", description: "Repeated poor posture" },
  { behavior: "DROWSINESS", label: "Drowsiness", description: "Repeated fatigue or microsleep" },
] as const;
```

`normalizePenaltyInput` returns an integer for 1–100 and otherwise `null`. Keep timestamp localization in the component so helper tests are timezone-independent.

- [ ] **Step 4: Implement the panel and integrate the page**

Fetch settings and logs together whenever `characterId` changes. Keep independent draft strings and saving flags by behavior. Each card has a labeled numeric input with `min={1}`, `max={100}`, `step={1}` and an explicit Save button. Render loading, retry, empty, warning, and penalty states; a panel failure must not block the Habits page.

Export the component and render:

```tsx
<VisionDisciplinePanel characterId={charId} />
```

between the summary grid and search toolbar. Move the existing `charId` calculation above its first use without changing its fallback.

- [ ] **Step 5: Run tests, focused lint, and production build**

```powershell
cd D:\ascend-core\client
npm.cmd test -- src/features/habits/components/visionDisciplinePresentation.test.ts src/features/habits/services/visionDiscipline.service.test.ts
npx.cmd eslint "src/features/habits/components/VisionDisciplinePanel.tsx" "src/features/habits/components/visionDisciplinePresentation.ts" "src/features/habits/services/visionDiscipline.service.ts" "src/app/(dashboard)/habits/page.tsx"
npm.cmd run build
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit Task 6**

```powershell
cd D:\ascend-core
git add client/src/features/habits/components/visionDisciplinePresentation.ts client/src/features/habits/components/visionDisciplinePresentation.test.ts client/src/features/habits/components/VisionDisciplinePanel.tsx client/src/features/habits/components/index.ts "client/src/app/(dashboard)/habits/page.tsx"
git commit -m "feat(habits): show vision discipline settings and logs"
```

### Task 7: Cross-repository regression and deployment readiness

**Files:**
- Modify only if verification exposes a defect in files already named by Tasks 1–6.

**Interfaces:**
- Validates the complete approved specification across both repositories.

- [ ] **Step 1: Apply schema to the deliberately selected development database**

Confirm `DATABASE_URL` targets the intended non-production database, then run:

```powershell
cd D:\ascend-core\server
.\.venv\Scripts\python.exe -m prisma db push
```

Expected: synchronization succeeds without dropping unrelated data. Never load production deployment secrets for this step.

- [ ] **Step 2: Run complete server and Vision suites**

```powershell
cd D:\ascend-core\server
.\.venv\Scripts\python.exe -m pytest -q
cd D:\ascend-vision\ascend-vision
.\.venv\Scripts\python.exe -m pytest -q
```

Expected: zero failures in both suites.

- [ ] **Step 3: Run the complete Core client suite and build**

```powershell
cd D:\ascend-core\client
npm.cmd test
npm.cmd run build
```

Expected: zero test failures and a successful Next.js build.

- [ ] **Step 4: Verify acceptance criteria explicitly**

```text
[ ] Warnings persist without HP deduction.
[ ] Repeats use the relevant Core setting and deduct HP atomically.
[ ] The warning-first flow does not access Habit APIs or models.
[ ] Exact replay cannot deduct twice; conflicting replay returns 409.
[ ] The Habits UI edits all three settings independently within 1–100.
[ ] Logs distinguish warnings and penalties and show actual HP changes.
[ ] Vision and normal-user token scopes cannot cross their allowed routes.
[ ] Existing detector, Habits, and automation regression suites pass.
```

- [ ] **Step 5: Inspect diffs and repository state**

```powershell
git -C D:\ascend-core diff --check
git -C D:\ascend-core status --short
git -C D:\ascend-vision diff --check
git -C D:\ascend-vision status --short
```

Expected: no whitespace errors; only the user's pre-existing unrelated Core changes remain outside the feature commits.

- [ ] **Step 6: Commit only required verification corrections**

If an in-scope correction was necessary, stage its exact files and run:

```powershell
git commit -m "fix: harden vision discipline integration"
```

If no correction was required, create no empty commit.
