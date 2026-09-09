# Vision Core Contract Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the versioned, authenticated Ascend Vision capability manifest and read-only query contract for Core-owned missions, habits, automations, steps, and workout recovery.

**Architecture:** Keep `routers.integration` thin: it authenticates a purpose-bound Vision token, verifies ownership before dispatch, and serializes HTTP responses. A new `services.vision_query_service` module maps intents to existing Core readers and returns stable envelopes. Phase 2 adds no AIRA proxy, writes, persistence, or Vision-owned data.

**Tech Stack:** FastAPI, Pydantic v2, Prisma client, pytest/FastAPI TestClient.

**Spec:** `docs/architecture/ai-ai-communication.md`

## Global Constraints

- Contract version: `2026-09-09`.
- The Vision routes accept only a short-lived Bearer token whose JWT purpose is `ascend_vision`; normal web tokens retain only their existing access.
- Verify `characterId` ownership before query dispatch or a Core data read.
- Use structured JSON; never expose Prisma objects, raw SQL, credentials, model prompts, camera data, frames, screenshots, video, or images.
- Phase 2 is read-only: no action/preview routes, mutation, command routing, or AIRA execution.
- Sleep and health return `unavailable_data`. Do not synthesize them from Vision observations or RPG `CharacterStats.recovery`.
- Echo `requestId` on every handled query. It is correlation only; query idempotency is intentionally deferred.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `server/auth_utils.py` | Add a Vision-only dependency without changing automation’s mixed web/Vision auth. |
| `server/schemas/vision_contract.py` | Public models, capability manifest, and contract error factory. |
| `server/services/vision_query_service.py` | Intent dispatch and data adaptation behind one read-only interface. |
| `server/routers/integration.py` | Capability/query routes and ownership gate only. |
| `server/tests/test_vision_contract.py` | Schema and query-module unit tests. |
| `server/tests/test_vision_query_api.py` | Auth, ownership, route, envelope, and unavailable-data tests. |
| `docs/architecture/ai-ai-communication.md` | Mark Phase 2 live and publish exact response shapes. |

### Task 1: Establish Vision-only authentication and route-ready request parsing

**Files:**
- Modify: `server/auth_utils.py:94-102`
- Modify: `server/schemas/vision_contract.py:1-76`
- Modify: `server/tests/test_vision_contract.py`
- Create: `server/tests/test_vision_query_api.py`

**Interfaces:**
- Consumes: `VISION_TOKEN_PURPOSE`, `_get_current_user_for_purposes()`, and `VISION_CONTRACT_VERSION`.
- Produces: `get_current_vision_user(request) -> dict`, `VisionQueryRequest`, `vision_error(request_id, code, message, *, retryable=False) -> dict[str, Any]`.

- [ ] **Step 1: Write failing authentication/parser tests**

~~~python
def test_vision_contract_rejects_a_normal_web_token(client):
    response = client.get(
        "/api/integration/vision/capabilities",
        headers={"Authorization": f"Bearer {web_token_for('user-1')}"},
    )
    assert response.status_code == 401


def test_query_model_keeps_version_and_intent_for_contract_dispatch():
    request = VisionQueryRequest.model_validate({
        "characterId": "character-1",
        "requestId": "vision-query-001",
        "capabilityVersion": "unsupported-version",
        "intent": "future_summary",
        "parameters": {},
    })
    assert request.capabilityVersion == "unsupported-version"
    assert request.intent == "future_summary"
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `python -m pytest -q server/tests/test_vision_contract.py server/tests/test_vision_query_api.py`

Expected: FAIL because the Vision-only dependency, route fixture, and dispatch-ready fields do not exist.

- [ ] **Step 3: Add the Vision-only dependency**

Add alongside `get_current_automation_user`; do not change that existing mixed-purpose dependency:

~~~python
async def get_current_vision_user(request: Request) -> dict:
    """Authenticate only the restricted Ascend Vision handoff token."""
    return await _get_current_user_for_purposes(request, {VISION_TOKEN_PURPOSE})
~~~

- [ ] **Step 4: Keep strict structure while allowing structured version/intent errors**

Keep `VisionReadIntent` as the documented supported set and `VisionQuerySuccess.intent` as that type. Change only the request fields below so the dispatcher, rather than FastAPI’s generic validation response, can report unsupported version/intent with the supplied `requestId`.

~~~python
class VisionQueryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    characterId: str = Field(min_length=1, max_length=128)
    requestId: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$")
    capabilityVersion: str = Field(min_length=1, max_length=64)
    intent: str = Field(min_length=1, max_length=128)
    parameters: dict[str, Any] = Field(default_factory=dict)


def vision_error(request_id: str, code: VisionErrorCode, message: str, *, retryable: bool = False) -> dict[str, Any]:
    return VisionQueryError(
        requestId=request_id,
        error=VisionQueryErrorBody(code=code, message=message, retryable=retryable),
    ).model_dump(mode="json")
~~~

- [ ] **Step 5: Run focused contract tests**

Run: `python -m pytest -q server/tests/test_vision_contract.py server/tests/test_vision_query_api.py`

Expected: parser/auth tests pass; live-route tests remain for Task 3.

- [ ] **Step 6: Commit**

~~~bash
git add server/auth_utils.py server/schemas/vision_contract.py server/tests/test_vision_contract.py server/tests/test_vision_query_api.py
git commit -m "feat: prepare vision contract authentication"
~~~

### Task 2: Build the read-only Vision query module

**Files:**
- Create: `server/services/vision_query_service.py`
- Modify: `server/tests/test_vision_contract.py`

**Interfaces:**
- Consumes: `VisionQueryRequest`, `VisionReadIntent`, `VISION_CONTRACT_VERSION`, `vision_error()`, `routers.integration.get_existing_today_missions()`, `routers.integration.get_existing_habits()`, `routers.automations.serialize_rule()`, `routers.workouts.compute_muscle_status_dict()`, and `db`.
- Produces: `async execute_vision_query(request: VisionQueryRequest) -> dict[str, Any]`; it always returns a contract success/error envelope for a valid request model.

- [ ] **Step 1: Write failing service tests for each intent category**

~~~python
@pytest.mark.asyncio
async def test_service_wraps_existing_missions_in_a_stable_summary(monkeypatch):
    async def missions(_character_id):
        return [{"id": "mission-1", "name": "Morning Workout", "status": "PENDING"}]
    monkeypatch.setattr(vision_query_service, "get_existing_today_missions", missions)

    result = await vision_query_service.execute_vision_query(query("missions_summary"))

    assert result == {
        "success": True, "requestId": "vision-query-001", "intent": "missions_summary",
        "data": {"missions": [{"id": "mission-1", "name": "Morning Workout", "status": "PENDING"}]},
    }


@pytest.mark.asyncio
async def test_service_returns_unavailable_data_without_a_reader():
    result = await vision_query_service.execute_vision_query(query("sleep_summary"))

    assert result["success"] is False
    assert result["error"] == {
        "code": "unavailable_data",
        "message": "Sleep data is not available from Ascend Core.",
        "retryable": False,
    }
~~~

Add independent tests for `habits_summary`, `automations_summary`, `steps_summary`, `recovery_summary`, `health_summary`, unsupported version, and unsupported intent.

- [ ] **Step 2: Run the service tests to verify they fail**

Run: `python -m pytest -q server/tests/test_vision_contract.py`

Expected: FAIL because `services.vision_query_service` and `execute_vision_query` do not exist.

- [ ] **Step 3: Implement one dispatcher with private readers**

Create `server/services/vision_query_service.py`.

~~~python
async def execute_vision_query(request: VisionQueryRequest) -> dict[str, Any]:
    if request.capabilityVersion != VISION_CONTRACT_VERSION:
        return vision_error(
            request.requestId, "unsupported_capability_version",
            f"Unsupported capability version: {request.capabilityVersion}.",
        )
    if request.intent not in get_args(VisionReadIntent):
        return vision_error(
            request.requestId, "unsupported_intent",
            f"Unsupported Vision read intent: {request.intent}.",
        )
    if request.intent in {"sleep_summary", "health_summary"}:
        label = "Sleep" if request.intent == "sleep_summary" else "Health"
        return vision_error(request.requestId, "unavailable_data", f"{label} data is not available from Ascend Core.")

    intent = cast(VisionReadIntent, request.intent)
    return VisionQuerySuccess(
        requestId=request.requestId,
        intent=intent,
        data=await _read_available_intent(intent, request.characterId),
    ).model_dump(mode="json")
~~~

Implement `_read_available_intent()` with exactly these data shapes:

~~~python
missions_summary    -> {"missions": await get_existing_today_missions(character_id)}
habits_summary      -> {"habits": await get_existing_habits(character_id)}
automations_summary -> {"automations": [serialize_rule(rule) for rule in rules]}
steps_summary       -> {"steps": int(character.dailySteps or 0), "goal": int(character.dailyStepGoal or 10000)}
recovery_summary    -> {"recovery": await compute_muscle_status_dict(character_id)}
~~~

For automations, query `db.automationrule.find_many(where={"characterId": character_id}, order={"createdAt": "desc"})`. For steps, use `db.character.find_unique(where={"id": character_id})`; return `unavailable_data` if missing. Never call `ensure_character_exists()` or `sync_steps()`, because a contract read must not mutate data.

- [ ] **Step 4: Run the service tests**

Run: `python -m pytest -q server/tests/test_vision_contract.py`

Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add server/services/vision_query_service.py server/tests/test_vision_contract.py
git commit -m "feat: add vision query dispatcher"
~~~

### Task 3: Expose authenticated capability and query routes

**Files:**
- Modify: `server/routers/integration.py:1-18,130-188,400-470`
- Modify: `server/tests/test_vision_query_api.py`

**Interfaces:**
- Consumes: `get_current_vision_user`, `get_owned_vision_character`, `vision_capabilities()`, `VisionQueryRequest`, `execute_vision_query()`.
- Produces: `GET /api/integration/vision/capabilities` and `POST /api/integration/vision/query`.

- [ ] **Step 1: Write failing HTTP contract tests**

~~~python
def test_capabilities_require_a_vision_bearer_token(client):
    assert client.get("/api/integration/vision/capabilities").status_code == 401
    response = client.get("/api/integration/vision/capabilities", headers=vision_headers("user-1"))
    assert response.status_code == 200
    assert response.json()["writes"] == []
    assert response.json()["reads"]["recovery_summary"]["availability"] == "available"


def test_query_checks_ownership_before_reader_dispatch(client, monkeypatch):
    async def unexpected_dispatch(_request):
        raise AssertionError("unowned character must never reach a Core reader")
    monkeypatch.setattr(integration, "execute_vision_query", unexpected_dispatch)

    response = client.post("/api/integration/vision/query", headers=vision_headers("user-2"), json=query_payload())

    assert response.status_code == 403


def test_query_returns_a_structured_unsupported_version_error(client):
    response = client.post(
        "/api/integration/vision/query", headers=vision_headers("user-1"),
        json=query_payload(capabilityVersion="2025-01-01"),
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "unsupported_capability_version"
    assert response.json()["requestId"] == "vision-query-001"
~~~

The fixture must use a local `OwnershipDatabase` test double implementing `character.find_first`. Cover valid, expired, malformed, wrong-purpose, and normal web tokens; cross-character denial; the five available results; both unavailable results; and unsupported intent/version.

- [ ] **Step 2: Run HTTP tests to verify they fail**

Run: `python -m pytest -q server/tests/test_vision_query_api.py`

Expected: FAIL with 404 because neither route exists.

- [ ] **Step 3: Add the capability route**

Add these imports in `server/routers/integration.py`:

~~~python
from auth_utils import get_current_automation_user, get_current_vision_user
from schemas.vision_contract import VisionQueryRequest, vision_capabilities
from services.vision_query_service import execute_vision_query
~~~

Add the route before generic integration event/command routes:

~~~python
@router.get("/vision/capabilities")
async def get_vision_capabilities(current_user: dict = Depends(get_current_vision_user)):
    return vision_capabilities()
~~~

`current_user` is intentionally unused after authentication; the manifest is global and returns no character data.

- [ ] **Step 4: Add the query route with ownership before dispatch**

~~~python
@router.post("/vision/query")
async def query_vision_core(
    request: VisionQueryRequest,
    current_user: dict = Depends(get_current_vision_user),
):
    await get_owned_vision_character(request.characterId, current_user)
    result = await execute_vision_query(request)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT if not result["success"] else status.HTTP_200_OK,
        content=result,
    )
~~~

Keep FastAPI’s standard `422` only for malformed JSON or fields that cannot yield a safe request ID. The dispatcher returns the defined envelope for unsupported version, unsupported intent, and unavailable Core data.

- [ ] **Step 5: Run HTTP tests**

Run: `python -m pytest -q server/tests/test_vision_query_api.py`

Expected: PASS.

- [ ] **Step 6: Commit**

~~~bash
git add server/routers/integration.py server/tests/test_vision_query_api.py
git commit -m "feat: expose vision core read contract"
~~~

### Task 4: Finalize documentation and prove the boundary

**Files:**
- Modify: `docs/architecture/ai-ai-communication.md:21-181`
- Modify: `server/tests/test_vision_contract.py`
- Modify: `server/tests/test_vision_query_api.py`

**Interfaces:**
- Consumes: the routes and response shapes from Tasks 1–3.
- Produces: an implementable Vision handoff and regression evidence for Phase 2.

- [ ] **Step 1: Add remaining acceptance tests**

~~~python
@pytest.mark.parametrize("intent, key", [
    ("missions_summary", "missions"),
    ("habits_summary", "habits"),
    ("automations_summary", "automations"),
    ("steps_summary", "steps"),
    ("recovery_summary", "recovery"),
])
def test_every_available_intent_returns_its_documented_data_key(client, monkeypatch, intent, key):
    stub_available_reader(monkeypatch, intent)
    response = client.post(
        "/api/integration/vision/query",
        headers=vision_headers("user-1"),
        json=query_payload(intent=intent),
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert key in response.json()["data"]
~~~

Also assert sleep and health each return `unavailable_data` with `retryable: false`, and assert no query test needs or calls any AIRA function.

- [ ] **Step 2: Update the architecture contract**

In `docs/architecture/ai-ai-communication.md`, replace future-tense Phase 2 text with:

- Vision-token-only auth for `GET /api/integration/vision/capabilities` and its `writes: []` response.
- Vision-token auth plus character ownership for `POST /api/integration/vision/query`.
- The five exact success data keys from Task 2.
- `401` for missing/expired/invalid/wrong-purpose tokens, `403` for unowned characters, structured contract `422` errors for unsupported version/intent/unavailable data, and generic `422` only for malformed request shapes.
- Recovery is workout-derived muscle recovery, not health telemetry. Sleep and health remain unavailable.

- [ ] **Step 3: Run focused Phase 2 tests**

Run: `python -m pytest -q server/tests/test_vision_contract.py server/tests/test_vision_query_api.py server/tests/test_vision_auth_bridge.py`

Expected: PASS.

- [ ] **Step 4: Run the server suite and whitespace check**

Run: `python -m pytest -q`

Run: `git diff --check`

Expected: all server tests pass and `git diff --check` prints nothing. Record test count and any warnings in the handoff.

- [ ] **Step 5: Commit**

~~~bash
git add docs/architecture/ai-ai-communication.md server/tests/test_vision_contract.py server/tests/test_vision_query_api.py
git commit -m "docs: complete vision read contract"
~~~

## Acceptance Checklist

- [ ] Capability discovery is live and Vision-token-only; it advertises all seven reads and no writes.
- [ ] Bad/missing/expired/wrong-purpose and normal web tokens cannot query the contract.
- [ ] Another user’s character is rejected before dispatch.
- [ ] Missions, habits, automations, steps, and workout recovery have deterministic documented envelopes.
- [ ] Sleep and health return `unavailable_data`, never empty success or invented data.
- [ ] Unsupported capability versions/intents return the structured error and supplied request ID.
- [ ] No Phase 2 code calls AIRA, `sync_steps()`, or `ensure_character_exists()`, or performs a mutation.
- [ ] Focused and full server tests pass.

