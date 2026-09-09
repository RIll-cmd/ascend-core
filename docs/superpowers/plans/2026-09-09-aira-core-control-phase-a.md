# AIRA Core Control Phase A Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Replace AIRA direct read tools with a typed registry and add read-only workout recommendations for Vision.

**Architecture:** A new registry delegates Core facts to execute_vision_query and composes only approved read results for recommendations. The AIRA router authenticates a Core user, validates ownership, and delegates to this registry. Phase A adds no mutation, preview, or execute route.

**Tech Stack:** FastAPI, Pydantic v2, Prisma-backed existing readers, pytest.

**Spec:** docs/superpowers/specs/2026-09-09-aira-core-control-design.md

## Global constraints

- Use contract version 2026-09-09 and execute_vision_query for all Phase A Core facts.
- Require authenticated actor plus character ownership before a Core read.
- Registry code must not import Prisma, ensure_character_exists, sync_steps, Gemini, or services.aira_tools.
- Sleep and health stay unavailable_data. Recovery is workout muscle recovery only.
- Model output may select only a registered operation; Core validates input and owns character scope.
- Do not change legacy /api/aira/execute behavior in this phase.

---

### Task 1: Define strict AIRA operation models

**Files:**
- Create: server/schemas/aira_operations.py
- Create: server/tests/test_aira_operation_registry.py

**Interfaces:**
- Produces AIRAReadOperation, AIRAOperationRequest, AIRAOperationResult, and AIRAWorkoutRecommendation.
- Read operations: missions_summary, habits_summary, automations_summary, steps_summary, recovery_summary, sleep_summary, health_summary, today_schedule, workout_recommendation.

- [ ] Step 1: Write a failing model test.

~~~python
def test_operation_request_rejects_unknown_operation_and_extra_fields():
    with pytest.raises(ValidationError):
        AIRAOperationRequest.model_validate({
            "characterId": "character-1", "requestId": "aira-1",
            "operation": "delete_everything", "parameters": {}, "extra": True,
        })
~~~

- [ ] Step 2: Run python -m pytest -q server/tests/test_aira_operation_registry.py and confirm failure.

- [ ] Step 3: Implement Pydantic models with extra forbid, characterId, safe requestId pattern, literal operation names, and stable success/error envelope.

- [ ] Step 4: Re-run the test and confirm pass.

- [ ] Step 5: Commit.

~~~bash
git add server/schemas/aira_operations.py server/tests/test_aira_operation_registry.py
git commit -m "feat: define aira operation contracts"
~~~

### Task 2: Add a typed read registry

**Files:**
- Create: server/services/aira_operation_registry.py
- Modify: server/tests/test_aira_operation_registry.py

**Interfaces:**
- Consumes AIRAOperationRequest, actor, verify_character_ownership, and execute_vision_query.
- Produces async execute_aira_operation(request, actor).

- [ ] Step 1: Write failing registry tests.

~~~python
@pytest.mark.asyncio
async def test_registry_delegates_mission_reads_to_core_dispatcher(monkeypatch):
    async def core_query(request):
        assert request.intent == "missions_summary"
        return {"success": True, "requestId": request.requestId, "intent": request.intent, "data": {"missions": []}}

    monkeypatch.setattr(aira_operation_registry, "execute_vision_query", core_query)
    result = await aira_operation_registry.execute_aira_operation(read_request("missions_summary"), {"id": "user-1"})

    assert result.data == {"missions": []}
~~~

Also cover ownership denial before dispatch, all seven direct reads, and unavailable sleep/health.

- [ ] Step 2: Run python -m pytest -q server/tests/test_aira_operation_registry.py and confirm failure.

- [ ] Step 3: Create one map from AIRA operation to VisionReadIntent. Verify ownership, construct VisionQueryRequest, call execute_vision_query, and map the result into AIRAOperationResult. Do not forward model-supplied character scope.

- [ ] Step 4: Re-run registry tests and confirm pass.

- [ ] Step 5: Commit.

~~~bash
git add server/services/aira_operation_registry.py server/tests/test_aira_operation_registry.py
git commit -m "feat: add aira typed read registry"
~~~

### Task 3: Add deterministic workout recommendations

**Files:**
- Modify: server/services/aira_operation_registry.py
- Modify: server/tests/test_aira_operation_registry.py

**Interfaces:**
- Consumes successful recovery_summary and missions_summary.
- Produces workout_recommendation containing recommendation, reasons, recoverySummary, todayMissions, and limitations.

- [ ] Step 1: Write failing tests for rest, moderate, and ready recommendations; assert no workout logging call.

- [ ] Step 2: Run registry tests and confirm failure.

- [ ] Step 3: Implement deterministic rules:
  - Freshness below 40 or relevant fatigued group: rest/mobility.
  - Freshness 40 to 79: moderate work avoiding fatigued groups.
  - Freshness at least 80: next pending workout mission, otherwise balanced session.
  - Unavailable recovery: recommendation explains the limitation and does not guess.

- [ ] Step 4: Re-run registry tests and confirm pass.

- [ ] Step 5: Commit.

~~~bash
git add server/services/aira_operation_registry.py server/tests/test_aira_operation_registry.py
git commit -m "feat: add aira workout recommendations"
~~~

### Task 4: Expose an authenticated typed AIRA read endpoint

**Files:**
- Modify: server/routers/aira.py
- Create: server/tests/test_aira_operation_api.py

**Interfaces:**
- Consumes AIRAOperationRequest, get_current_user, execute_aira_operation.
- Produces POST /api/aira/operations/read.

- [ ] Step 1: Write failing HTTP tests for missing token, unowned character, malformed input, unavailable data, and success.

- [ ] Step 2: Run python -m pytest -q server/tests/test_aira_operation_api.py and confirm 404 failure.

- [ ] Step 3: Add the thin authenticated route.

~~~python
@router.post("/operations/read")
async def read_aira_operation(payload: AIRAOperationRequest, current_user: dict = Depends(get_current_user)):
    return (await execute_aira_operation(payload, current_user)).model_dump(mode="json")
~~~

- [ ] Step 4: Re-run API tests and confirm pass.

- [ ] Step 5: Commit.

~~~bash
git add server/routers/aira.py server/tests/test_aira_operation_api.py
git commit -m "feat: expose typed aira read operations"
~~~

### Task 5: Constrain legacy Gemini tools and document migration

**Files:**
- Modify: server/services/aira_service.py
- Modify: server/services/aira_tools.py
- Modify: docs/architecture/ai-ai-communication.md
- Modify: server/tests/test_aira_operation_registry.py

**Interfaces:**
- Produces a Phase A model-selection allowlist with no direct Core read/write function.

- [ ] Step 1: Write failing tests proving Phase A registry code does not call AIRA_TOOLS, Gemini, db, ensure_character_exists, or sync_steps.

- [ ] Step 2: Run focused tests and confirm failure.

- [ ] Step 3: Remove Phase A reads from Gemini function exposure. Gemini can explain already-authorized registry results, but cannot fetch or mutate Core state.

- [ ] Step 4: Update the architecture document with registry classes, calendar limitation, and Phase B preview/execute policy.

- [ ] Step 5: Run focused tests, full server suite, and git diff --check.

- [ ] Step 6: Commit.

~~~bash
git add server/services/aira_service.py server/services/aira_tools.py docs/architecture/ai-ai-communication.md server/tests
git commit -m "docs: define aira typed operation migration"
~~~

## Follow-on phases

- Phase B: preview models, durable audit records, expiry tokens, and idempotent execute.
- Phase C: habits, missions, workouts, and automations through preview/execute adapters.
- Phase D: shop purchase flow and calendar snapshot support; separate calendar-event domain if arbitrary events are needed.
- Phase E: Vision client, voice routing, confirmation dialogue, and end-to-end policy verification.

