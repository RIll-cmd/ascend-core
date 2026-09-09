# Vision–Core Contract Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define and test the versioned, typed Vision–Core contract and the authoritative Core owner for every initial read capability, without adding the Phase 2 HTTP endpoints.

**Architecture:** Phase 1 creates a single contract model in Core and records the domain inventory in the existing AI-to-AI architecture document. The contract names data that Core can provide now (`missions`, `habits`, `automations`, `steps`, and muscle `recovery`) and distinguishes it from data Core does not own yet (`sleep` and heart-rate health metrics). Future Vision endpoints consume these models rather than inventing their own payload shapes.

**Tech Stack:** Python 3.14, FastAPI, Pydantic v2, pytest, existing JWT Vision authentication.

**Spec:** `docs/architecture/ai-ai-communication.md`

## Global Constraints

- Contract version: `2026-09-09`.
- Vision uses a short-lived Bearer token with purpose `ascend_vision`; the contract does not weaken `get_current_automation_user` ownership checks.
- Phase 1 is schema and documentation only: do not add `/api/integration/vision/capabilities`, `/query`, or write-action routes yet.
- Core is authoritative only for persisted Core data; sleep and heart-rate metrics must be represented as unavailable, never synthesized.
- Contract data is structured JSON; no raw Prisma access, database query text, camera material, or free-form AIRA action is part of the contract.
- Every future request includes `characterId`, `requestId`, and `capabilityVersion`.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `docs/architecture/ai-ai-communication.md` | Authoritative domain inventory, capability availability, tool ownership, and error-code reference. |
| `server/schemas/vision_contract.py` | Pydantic request/response types and capability constants used by later Vision API routes. |
| `server/tests/test_vision_contract.py` | Public-boundary schema tests for accepted contract requests and rejected malformed/unsupported input. |
| `server/auth_utils.py` | Existing Vision token purpose and authentication dependency; inspect only in Phase 1. |
| `server/services/aira_tools.py` | Existing Gemini AIRA tool allowlist; inspect only in Phase 1 to prevent a parallel Vision tool vocabulary. |
| `server/services/aira_service.py` | Existing AIRA tool-call dispatcher; inspect only in Phase 1. |
| `server/routers/aira.py` | Existing chat and confirmed-action routes; inspect only in Phase 1 because their current ownership boundary is not suitable for the Vision contract. |
| `server/routers/integration.py` | Existing Vision heartbeat, observation, and command seam; inspect only in Phase 1. |
| `server/routers/missions.py` | Existing mission reader owned by the future `missions_summary` adapter. |
| `server/routers/habits.py` | Existing habit reader owned by the future `habits_summary` adapter. |
| `server/routers/automations.py` | Existing owned automation reader owned by the future `automations_summary` adapter. |
| `server/routers/beasts.py` | Existing persisted `dailySteps`/`DailyStepLog` flow owned by the future `steps_summary` adapter. |
| `server/routers/workouts.py` | Existing computed muscle recovery reader owned by the future `recovery_summary` adapter. |

## Contract Decisions

| Intent | Phase 1 availability | Future Core owner | Reason |
| --- | --- | --- | --- |
| `missions_summary` | `available` | `routers.missions.get_today_missions` | Core owns mission state. |
| `habits_summary` | `available` | `routers.integration.get_existing_habits` / `routers.habits.get_habits` | Core owns habit state. |
| `automations_summary` | `available` | `routers.automations.list_automations` | Core owns automation rules. |
| `steps_summary` | `available` | `routers.beasts.sync_steps` persistence plus Character/DailyStepLog reads | Core persists daily steps. |
| `recovery_summary` | `available` | `routers.workouts.compute_muscle_status_dict` | Core computes muscle recovery. |
| `sleep_summary` | `unavailable` | none | Vision currently owns local sleep observations; Core has no sleep model. |
| `health_summary` | `unavailable` | none | Core has no authoritative heart-rate or broad health metric model. |

`CharacterStats.recovery` is an RPG stat, not physiological health data. `MuscleRecoveryState` is workout-derived muscle fatigue/freshness and is exposed only as `recovery_summary`.

The initial read request shape is:

```json
{
  "characterId": "character-1",
  "requestId": "vision-query-001",
  "capabilityVersion": "2026-09-09",
  "intent": "missions_summary",
  "parameters": {}
}
```

The later Phase 2 route will return either a success envelope:

```json
{
  "success": true,
  "requestId": "vision-query-001",
  "intent": "missions_summary",
  "data": {}
}
```

or an error envelope:

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

Allowed error codes are `unsupported_capability_version`, `unsupported_intent`, `unavailable_data`, `invalid_request`, `authentication_required`, `authentication_expired`, and `forbidden_character`.

### Task 1: Record the Core domain inventory and contract boundary

**Files:**
- Modify: `docs/architecture/ai-ai-communication.md`
- Inspect: `server/auth_utils.py:76-101`
- Inspect: `server/services/aira_tools.py:27-336`
- Inspect: `server/services/aira_service.py:110-160`
- Inspect: `server/routers/aira.py:20-120`
- Inspect: `server/routers/integration.py:168-185,359-392`
- Inspect: `server/routers/missions.py:12-35`
- Inspect: `server/routers/habits.py:91-110`
- Inspect: `server/routers/automations.py:72-75`
- Inspect: `server/routers/beasts.py:593-756`
- Inspect: `server/routers/workouts.py:95-215,602-616`

**Interfaces:**
- Consumes: existing Core domain readers and the Vision JWT purpose `ascend_vision`.
- Produces: the authoritative availability/owner table and the exact request, success, and error envelope definitions used by `vision_contract.py`.

- [ ] **Step 1: Add the Phase 1 contract inventory section to the architecture document**

Add a `## Phase 1 Contract Inventory` section after `## Shared contract` containing the availability/owner table from this plan. State that `sleep_summary` and `health_summary` return `unavailable_data` until Core gains an authoritative persistence model.

- [ ] **Step 2: Add exact version, envelope, and error-code definitions**

Add these definitions to the same section:

```markdown
- `capabilityVersion` is required and must equal `2026-09-09`.
- `requestId` is an opaque client-generated idempotency key, 1–128 characters, matching `^[A-Za-z0-9._:-]+$`.
- `characterId` is required and is authorized by the existing Vision Bearer token.
- Every response echoes `requestId`.
- `unavailable_data` is a valid business response, not an empty successful result.
```

- [ ] **Step 3: Review the document against actual source ownership**

Confirm each row against the inspected function. Remove any claim that Core owns sleep, heart-rate, video, image, frame, screenshot, or camera data.

Record these boundaries explicitly:

```markdown
- Existing AIRA tools are a Gemini-specific allowlist and are not the Vision contract.
- Existing AIRA chat and execute routes do not currently enforce the Vision ownership boundary; Phase 2 must not proxy Vision requests through them.
- Existing integration command replay protection is process-local; Phase 2 query responses may echo request IDs, but durable multi-instance idempotency is deferred to the write-action phase.
```

- [ ] **Step 4: Verify the documentation diff**

Run: `git diff --check -- docs/architecture/ai-ai-communication.md`

Expected: exit code `0`.

- [ ] **Step 5: Commit the inventory documentation**

```bash
git add docs/architecture/ai-ai-communication.md
git commit -m "docs: define vision core contract inventory"
```

### Task 2: Define the versioned Vision contract models

**Files:**
- Create: `server/schemas/vision_contract.py`
- Test: `server/tests/test_vision_contract.py`

**Interfaces:**
- Consumes: the version, read intents, and error codes documented in Task 1.
- Produces: `VISION_CONTRACT_VERSION`, `VisionReadIntent`, `VisionQueryRequest`, `VisionQuerySuccess`, `VisionQueryError`, `VisionQueryErrorBody`, and `vision_capabilities()` for the Phase 2 integration router.

- [ ] **Step 1: Write the failing contract tests**

```python
from pydantic import ValidationError
import pytest

from schemas.vision_contract import (
    VISION_CONTRACT_VERSION,
    VisionQueryRequest,
    vision_capabilities,
)


def test_capabilities_distinguish_available_and_unavailable_reads():
    capabilities = vision_capabilities()

    assert capabilities["version"] == VISION_CONTRACT_VERSION
    assert capabilities["reads"]["missions_summary"]["availability"] == "available"
    assert capabilities["reads"]["sleep_summary"]["availability"] == "unavailable"


def test_query_request_accepts_a_versioned_missions_query():
    request = VisionQueryRequest.model_validate({
        "characterId": "character-1",
        "requestId": "vision-query-001",
        "capabilityVersion": VISION_CONTRACT_VERSION,
        "intent": "missions_summary",
        "parameters": {},
    })

    assert request.intent == "missions_summary"


@pytest.mark.parametrize("payload", [
    {"characterId": "character-1", "requestId": "bad id", "capabilityVersion": VISION_CONTRACT_VERSION, "intent": "missions_summary", "parameters": {}},
    {"characterId": "character-1", "requestId": "vision-query-001", "capabilityVersion": "2020-01-01", "intent": "missions_summary", "parameters": {}},
    {"characterId": "character-1", "requestId": "vision-query-001", "capabilityVersion": VISION_CONTRACT_VERSION, "intent": "unknown_summary", "parameters": {}},
])
def test_query_request_rejects_invalid_contract_input(payload):
    with pytest.raises(ValidationError):
        VisionQueryRequest.model_validate(payload)
```

- [ ] **Step 2: Run the contract tests to verify they fail**

Run: `python -m pytest tests/test_vision_contract.py -q`

Working directory: `server`

Expected: collection failure because `schemas.vision_contract` does not exist.

- [ ] **Step 3: Create the minimal schema module**

```python
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


VISION_CONTRACT_VERSION = "2026-09-09"
VisionReadIntent = Literal[
    "missions_summary",
    "habits_summary",
    "automations_summary",
    "steps_summary",
    "recovery_summary",
    "sleep_summary",
    "health_summary",
]
VisionErrorCode = Literal[
    "unsupported_capability_version",
    "unsupported_intent",
    "unavailable_data",
    "invalid_request",
    "authentication_required",
    "authentication_expired",
    "forbidden_character",
]


class VisionQueryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    characterId: str = Field(min_length=1, max_length=128)
    requestId: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$")
    capabilityVersion: Literal[VISION_CONTRACT_VERSION]
    intent: VisionReadIntent
    parameters: dict[str, Any] = Field(default_factory=dict)


class VisionQuerySuccess(BaseModel):
    success: Literal[True] = True
    requestId: str
    intent: VisionReadIntent
    data: dict[str, Any]


class VisionQueryErrorBody(BaseModel):
    code: VisionErrorCode
    message: str
    retryable: bool = False


class VisionQueryError(BaseModel):
    success: Literal[False] = False
    requestId: str
    error: VisionQueryErrorBody


def vision_capabilities() -> dict[str, Any]:
    return {
        "version": VISION_CONTRACT_VERSION,
        "reads": {
            "missions_summary": {"availability": "available"},
            "habits_summary": {"availability": "available"},
            "automations_summary": {"availability": "available"},
            "steps_summary": {"availability": "available"},
            "recovery_summary": {"availability": "available"},
            "sleep_summary": {"availability": "unavailable"},
            "health_summary": {"availability": "unavailable"},
        },
        "writes": [],
    }
```

- [ ] **Step 4: Run the contract tests to verify they pass**

Run: `python -m pytest tests/test_vision_contract.py -q`

Working directory: `server`

Expected: all tests pass.

- [ ] **Step 5: Run syntax and formatting checks**

Run: `python -m compileall -q schemas/vision_contract.py tests/test_vision_contract.py`

Working directory: `server`

Expected: exit code `0`.

- [ ] **Step 6: Commit the contract model and tests**

```bash
git add server/schemas/vision_contract.py server/tests/test_vision_contract.py
git commit -m "feat: define vision core contract models"
```

### Task 3: Lock the Phase 1 handoff boundary

**Files:**
- Modify: `docs/architecture/ai-ai-communication.md`
- Modify: `docs/superpowers/plans/2026-09-09-vision-core-contract-phase-1.md`

**Interfaces:**
- Consumes: the checked Phase 1 documentation and contract schema from Tasks 1–2.
- Produces: the explicit Phase 2 entry condition for adding a capability endpoint and a query route.

- [ ] **Step 1: Add the Phase 2 handoff note**

Add this statement to the architecture document:

```markdown
Phase 2 may add the capability and query HTTP routes only by importing
`vision_capabilities()` and `VisionQueryRequest` from
`server/schemas/vision_contract.py`. It must use the existing purpose-bound
Vision Bearer token dependency and perform an explicit character-ownership
check before dispatching any read.
```

- [ ] **Step 2: Confirm Phase 1 did not add a live query or action route**

Run: `rg -n 'vision/(capabilities|query|actions)' server/routers`

Expected: no Phase 2 Vision contract route is present.

- [ ] **Step 3: Run the Phase 1 verification set**

Run: `python -m pytest tests/test_vision_contract.py tests/test_vision_auth_bridge.py tests/test_vision_heartbeat.py -q`

Working directory: `server`

Expected: all selected tests pass. If the local Prisma bootstrap blocks test collection, record the command, the point of failure, and the successful `compileall` result in the handoff rather than changing the production test setup.

- [ ] **Step 4: Inspect the final diff**

Run: `git diff --check && git diff --stat`

Expected: exit code `0`, with changes limited to the Phase 1 documentation, schema, and tests.

- [ ] **Step 5: Commit the Phase 1 handoff documentation**

```bash
git add docs/architecture/ai-ai-communication.md docs/superpowers/plans/2026-09-09-vision-core-contract-phase-1.md
git commit -m "docs: hand off vision core contract phase one"
```

## Plan Self-Review

- Spec coverage: the plan covers Checkpoint 1's inventory, capability version, request/response/error schemas, owner mapping, and explicit unavailable-data behavior.
- Deliberate boundary: no runtime Vision contract endpoint, AIRA tool execution, or mutation endpoint is included; those begin in later checkpoints.
- Type consistency: Phase 2 imports `vision_capabilities()` and `VisionQueryRequest`; the exact names are defined in Task 2.
- No placeholders: every task names exact files, commands, interfaces, expected results, and implementation content.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-09-vision-core-contract-phase-1.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh worker per task and review after each task.
2. **Inline Execution** — execute the tasks in this session with checkpoints.
