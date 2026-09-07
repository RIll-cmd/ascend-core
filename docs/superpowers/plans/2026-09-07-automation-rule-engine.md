# Phase 4A Automation Rule Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a backend-only, character-scoped automation engine that safely executes the existing negative-habit action from newly persisted observations.

**Architecture:** The integration router persists observations before it delegates newly created rows to an automation evaluator. The evaluator uses Pydantic-validated allowlists, database-backed rule/execution records, an atomic claim, and one extracted negative-habit service. CRUD uses JWT authentication and exact character/user ownership lookup.

**Tech Stack:** FastAPI, Pydantic v2, Prisma Client Python, PostgreSQL/Neon, pytest.

**Spec:** `docs/superpowers/specs/2026-09-07-automation-rule-engine-design.md`

## Global Constraints

- No raw device imagery; use only existing semantic observations.
- Preserve `workout_completed` behavior.
- Do not build frontend, AIRA creation, scheduling, aggregation, focus-mode conditions, notifications, mission actions, or positive-habit actions.
- Permit only `log_bad_habit`, reusing canonical negative-habit behavior.
- Require JWT user auth for management; never use the device integration key.
- Never evaluate user code, SQL, function names, or arbitrary field paths.

---

### Task 1: Persist rules and executions

**Files:**
- Modify: `server/prisma/schema.prisma`
- Test: `server/tests/test_automation_engine.py`

**Interfaces:** Creates `AutomationRule` and `AutomationExecution` Prisma delegates. `AutomationExecution` has unique `(ruleId, observationId)`; rules carry `lastTriggeredAt` and `cooldownSeconds`.

- [ ] Write a schema-contract test asserting the models, unique constraint, and cooldown field exist.
- [ ] Run `pytest server/tests/test_automation_engine.py -v` and observe the missing-model failure.
- [ ] Add the models, relations, indexes, JSON-string fields, timestamps, and unique constraint.
- [ ] Run `cd server; prisma db push; prisma generate`.
- [ ] Re-run the schema-contract test.

### Task 2: Extract negative-habit mutation logic

**Files:**
- Create: `server/services/habit_trigger_service.py`
- Modify: `server/routers/habits.py`
- Test: `server/tests/test_automation_engine.py`

**Interfaces:** `async trigger_negative_habit(habit_id: str, character_id: str) -> dict` validates ownership/type and preserves the existing penalty, relapse update, and `HabitRelapseLog` behavior.

- [ ] Write a failing async test that mocks the canonical penalty dependencies and asserts one relapse log.
- [ ] Run that test and observe the missing service failure.
- [ ] Move only the negative branch from `trigger_habit()` into the service; have the route call it. Keep the positive path calling `log_habit()`.
- [ ] Run the new test and `pytest server/tests/test_habit_penalties.py -v`.

### Task 3: Implement constrained schemas and evaluator

**Files:**
- Create: `server/schemas/automation.py`
- Create: `server/services/automation_engine.py`
- Test: `server/tests/test_automation_engine.py`

**Interfaces:** Defines rule create/update, allowlisted condition/action, and dry-run observation schemas. Defines `evaluate_conditions()` and `async evaluate_observation(observation)`.

- [ ] Write failing tests for valid rules and rejection of unknown triggers, operators, actions, extra fields, and arbitrary field paths.
- [ ] Add tests for disabled/nonmatching rules, matching execution, durable cooldown, duplicate execution, multiple rules, failure isolation, and no arbitrary execution.
- [ ] Run focused tests and observe missing schema/evaluator failures.
- [ ] Implement fixed-field condition mapping and typed comparisons; never dynamically traverse fields.
- [ ] In a database transaction, atomically claim the cooldown and create an execution before calling `trigger_negative_habit`; record terminal success/failure results.
- [ ] Run `pytest server/tests/test_automation_engine.py -v`.

### Task 4: Add authenticated CRUD and dry run

**Files:**
- Create: `server/routers/automations.py`
- Modify: `server/main.py`
- Test: `server/tests/test_automation_api.py`

**Interfaces:** Exposes `GET/POST /api/automations`, `GET/PATCH/DELETE /api/automations/{id}`, and `POST /api/automations/{id}/test`. Uses exact `Character.id` + `Character.userId` lookup.

- [ ] Write failing route tests for JWT requirement, valid CRUD, cross-character habit rejection, character isolation, enable/disable, invalid payloads, and no-mutation dry run.
- [ ] Run the API test file and observe its missing-router failure.
- [ ] Require `get_current_user`, validate all action targets, and return only owned rule records.
- [ ] Register the router in `server/main.py`.
- [ ] Run `pytest server/tests/test_automation_api.py -v`.

### Task 5: Wire post-persistence evaluation

**Files:**
- Modify: `server/routers/integration.py`
- Modify: `server/tests/test_integration_api.py`
- Test: `server/tests/test_automation_engine.py`

**Interfaces:** `persist_observation()` returns the stored record and duplicate status. `evaluate_observation()` receives only a newly stored observation.

- [ ] Write failing integration tests that assert evaluation after persistence, no evaluation for duplicates, failure isolation, and no evaluator call for `workout_completed`.
- [ ] Run `pytest server/tests/test_integration_api.py -v` and observe the failures.
- [ ] Call the evaluator only after a non-duplicate observation is stored; catch/log unexpected evaluator failures while retaining the successful observation response.
- [ ] Run integration and automation test files together.

### Task 6: Final verification

**Files:** All files above.

- [ ] Regenerate/apply Prisma schema with `cd server; prisma db push; prisma generate`.
- [ ] Run `pytest server/tests -v`.
- [ ] Inspect `git diff -- server/prisma/schema.prisma server/schemas server/services server/routers server/tests` and confirm no frontend or unrelated changes.
