# Core Phase 6A Vision Auth Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an authenticated Core user mint a 15-minute Vision-only Bearer token for automation APIs.

**Architecture:** Existing JWT signing remains authoritative. A purpose claim separates a restricted Vision token from existing general Core user tokens; automations use an explicit dependency that accepts only either of those two valid token classes.

**Tech Stack:** FastAPI, PyJWT, Pydantic v2, pytest.

**Spec:** `docs/superpowers/specs/2026-09-08-core-phase6a-vision-auth-bridge-design.md`

## Global Constraints

- Keep the existing 30-day web token duration unchanged.
- No database/session/refresh/revocation changes.
- Do not modify `D:\ascend-vision`, AIRA, Gemini, or the deterministic automation engine.
- The integration key cannot mint or substitute for a user token.

---

### Task 1: Prove token and route behavior with failing tests

**Files:**
- Create: `server/tests/test_vision_auth_bridge.py`
- Modify: `server/tests/test_automation_proposals.py`

- [x] Test authenticated issuance, unauthenticated rejection, 15-minute expiry, identity claims, malformed/expired/wrong-purpose rejection, integration-key rejection, automation access, and ownership.
- [x] Run the tests against the current implementation and confirm failure.

### Task 2: Implement issuance and purpose-aware verification

**Files:**
- Modify: `server/auth_utils.py`
- Modify: `server/routers/auth.py`
- Modify: `server/routers/automations.py`

- [x] Add optional JWT purpose and expiry inputs while retaining the default 30-day token.
- [x] Add the authenticated handoff route and an automation-only user dependency.
- [x] Run focused tests and the existing automation regression suite.

### Task 3: Document and verify the bridge

**Files:**
- Modify: `docs/architecture/api.md`

- [x] Document issuance, expiry, reauthentication, headers, and Vision secure-storage restrictions.
- [x] Run the complete server suite and inspect the diff for database, AIRA, engine, or Vision changes.
