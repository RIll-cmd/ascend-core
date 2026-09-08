# Core Phase 6 Proposal Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure, transient automation-proposal contract for Ascend Vision without adding persistence paths.

**Architecture:** The existing automations router remains the public boundary. `AutomationRuleCreate` is the single rule shape for proposals and persistence; schema-derived constants drive capability discovery, while router database reads enforce ownership and target eligibility.

**Tech Stack:** FastAPI, Pydantic v2, Prisma client, pytest.

**Spec:** `docs/superpowers/specs/2026-09-07-core-phase6-proposal-boundary-design.md`

## Global Constraints

- Do not modify `D:\ascend-vision`, Core AIRA/Gemini code, database schema, or deterministic execution behavior.
- `POST /api/automations` remains the only rule persistence endpoint.
- Proposal routes require JWT/session authentication and exact user-character ownership.
- Validation performs reads and pure normalization only.

---

### Task 1: Specify and test the proposal contract

**Files:**
- Create: `server/tests/test_automation_proposals.py`
- Modify: `server/schemas/automation.py`

**Interfaces:**
- Produces canonical capability metadata and strict semantic validation shared by proposal and persistence requests.

- [x] Write failing route tests for authentication, capabilities, eligible negative habits, normalized valid proposals, invalid proposal components, generic target failures, and no writes.
- [x] Run the focused tests and confirm the routes are absent.
- [x] Add schema constants, capability serialization, and semantic request validation.
- [x] Re-run focused tests.

### Task 2: Add the authenticated automations boundary

**Files:**
- Modify: `server/routers/automations.py`
- Test: `server/tests/test_automation_proposals.py`

**Interfaces:**
- Consumes `AutomationRuleCreate`, capability metadata, existing `get_owned_character`, and `validate_actions`.
- Produces the three static proposal routes and makes persistence reuse semantic validation.

- [x] Implement static routes before `/{rule_id}` and use read-only Prisma queries for eligibility/validation.
- [x] Run proposal tests, then the existing automation tests.

### Task 3: Normalize the integration source compatibility alias

**Files:**
- Modify: `server/routers/integration.py`
- Modify: `server/tests/test_integration_api.py`

**Interfaces:**
- Produces canonical `ascend_vision` response/source behavior while accepting `phone_watch_phase5` input.

- [x] Add failing canonical and legacy source tests.
- [x] Normalize the legacy value at model-validation time.
- [x] Run integration tests.

### Task 4: Verify the full Core slice

**Files:**
- Modify: `docs/architecture/api.md`

- [x] Document the Vision-facing Core contract without rewriting historical phase documentation.
- [x] Run the focused automation, integration, and full server test suite.
- [x] Inspect the diff to ensure no database, AIRA, execution-engine, or Vision files changed.
