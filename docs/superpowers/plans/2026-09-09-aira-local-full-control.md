# AIRA Local Full Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a local-only, confirmed AIRA/Vision control loop for the supported Core domains.

**Architecture:** AIRA chat produces only a Core-normalized preview. The UI or Vision confirms with Core's signed token, and Core atomically reserves a SQLite audit record before delegating to an existing authenticated domain handler. Each domain is added through a small adapter, never raw chat-supplied ORM writes.

**Tech Stack:** FastAPI, Pydantic v2, Zustand/Next.js, SQLite, pytest.

**Spec:** `docs/superpowers/specs/2026-09-09-aira-core-control-design.md`

## Global Constraints

- Local execution requires `AIRA_LOCAL_MODE=true`; production fails closed.
- Store only safe audit metadata and results, never prompts, confirmation tokens, or Vision media.
- Require authenticated actor, character ownership, signed token, and request-id reservation before every mutation.
- Reuse existing domain handlers for Core rules, rewards, recovery, cooldowns, and duplicate checks.

### Task 1: Chat-to-preview bridge

**Files:** `server/routers/aira.py`, `server/services/aira_service.py`, `server/tests/test_aira_preview_route.py`

- [ ] Return only typed preview fields for recognized Batch 1 mutations.
- [ ] Make the chat route authenticate actor and validate character ownership.
- [ ] Verify a model cannot create executable arguments without Core preview normalization.

### Task 2: Confirmation-card execution

**Files:** `client/src/features/aira/types/aira.ts`, `client/src/features/aira/services/aira.service.ts`, `client/src/features/aira/store/useAiraStore.ts`, `client/src/app/(dashboard)/aira/page.tsx`

- [ ] Render Core-issued preview summary, expiry, and warnings.
- [ ] Send only characterId, requestId, operation, and confirmationToken to `/api/aira/operations/execute`.
- [ ] Show completed, replayed, expired, and failed results; never retry a failed request ID.

### Task 3: Batch 2 mission and automation adapters

**Files:** `server/services/aira_preview_registry.py`, `server/services/aira_domain_adapters.py`, `server/tests/test_aira_domain_adapters.py`

- [ ] Add create_mission through a validated Core service with date, ownership, duplicate, and reward rules.
- [ ] Add create/update/delete automation through automation proposal validation and existing handlers.
- [ ] Verify duplicate automation and invalid negative-habit targets are rejected before execution.

### Task 4: Batch 3 workouts and equipment

**Files:** `server/services/aira_preview_registry.py`, `server/services/aira_domain_adapters.py`, `server/tests/test_aira_domain_adapters.py`

- [ ] Normalize sets and delegate workout logs through `routers.workouts.log_workout`.
- [ ] Normalize inventory item target and delegate equipment toggles through `routers.inventory.equip_item`.
- [ ] Verify ownership and one-click idempotency for both actions.

### Task 5: Local Vision and regression verification

**Files:** `docs/architecture/ai-ai-communication.md`, `server/tests/test_aira_local_execution_roundtrip.py`, focused client tests.

- [ ] Verify Core-session and Vision-purpose tokens traverse preview and execute routes.
- [ ] Verify token tampering, expiration, wrong actor/character, concurrent/replayed confirmation, and adapter failure behavior.
- [ ] Run focused backend tests, client type/lint checks, and `git diff --check`.
