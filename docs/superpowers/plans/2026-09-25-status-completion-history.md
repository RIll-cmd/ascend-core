# Status Completion History V1 Implementation Plan

> **For agentic execution:** Use `superpowers:executing-plans` and its subagent-driven workflow. Keep main checkouts and unrelated changes untouched.

**Goal:** Persist explicit task outcomes for Core AIRA and authenticated status producers, then let Vision report completion only when Core has evidence.

**Architecture:** Add an optional operation lifecycle to Core's producer event contract and a bounded durable completion-history table. Use an atomic repository operation for terminal transitions. AIRA's context manager records true outcomes instead of treating every exit as success. Extend the optional shelf payload; Vision validates and renders it through the existing read-only status tool.

**Safety:** Use test doubles/mocks and local schema validation/generation only. Do not run `db push` against the existing local database or any remote database. Do not provision credentials or deploy. Antigravity/Codex CLI producer adapters remain separate follow-up work; until installed, their completion cannot be claimed.

## Tasks

### 1. Specify and test the operation lifecycle contract ✅

- Modify Core `server/schemas/service_status.py` with a strict optional lifecycle DTO and phase/outcome validation.
- Add tests for valid lifecycle events, invalid IDs, overlong labels, forbidden content, and legacy events without the field.
- Add tests first and verify the new cases fail before implementation.

### 2. Persist bounded completion history atomically ✅

- Add `StatusOperationCompletion` to Prisma, unique by service/instance/operation identity, storing only outcome, started/finished timestamps, and safe label.
- Extend `StatusRepository`, its in-memory fake, and `PostgresStatusRepository` with atomic finish semantics and recent-history lookup.
- Ensure terminal retries are idempotent and cannot rewrite an existing outcome; derive current state from remaining live operations in the same transaction.
- Test retries, concurrent operations, history bounds, and no completion on idle/stale state.
- Run `prisma validate` and `prisma generate` only; do not sync any database. *(Validation passed. Client generation was stopped after several minutes of CPU-bound work without output; see progress log.)*

### 3. Correct AIRA operation outcomes ✅

- Update `track_aira_operation` to finish as succeeded after normal return, failed on ordinary exceptions, and cancelled on task cancellation.
- Preserve the original operation exception if status persistence fails while unwinding.
- Add async context-manager tests for all outcomes and disconnected-DB behavior.

### 4. Ingest producer lifecycle and expose optional shelf history ✅

- Extend the authenticated event route/service to track start/progress/terminal phases using the existing bound producer credential.
- Add at most five recent completion summaries per service to the optional shelf payload; never expose internal operation IDs.
- Test legacy event compatibility and unauthorized/cross-instance lifecycle rejection.

### 5. Teach Vision to use completion evidence ✅

- In the Vision status worktree, add strict optional completion parsing and deterministic wording for success, failure, and cancellation.
- With no history, state that completion cannot be confirmed; never infer success from `idle`.
- Add tests for each outcome, no-history fallback, malformed optional history, multiple agents, and existing security cases.

### 6. Verify and hand off producer integration

- Run focused Core status/AIRA tests, full Core suite, Prisma validation/generation, focused Vision shelf/status tests, full Vision suite, JS syntax and diff checks.
- Review the whole branch and record exact verification.
- Make no live staging/production call. List Antigravity/Codex instrumentation as a deployment follow-up because those integrations are absent today.

**Verification status:** Focused Core status/AIRA suite passes (98 tests); full Vision suite passes (593 tests). Prisma schema validation and Python client generation pass. A broad Core suite attempt encountered one pre-existing test that requires an unavailable database; a later run excluding that test stalled without progress and was stopped. No live PostgreSQL transaction/locking validation, schema push, staging call, deployment, or external Antigravity/Codex producer integration was performed.

## Completion criteria

- Only explicit terminal lifecycle evidence is rendered as a completed outcome.
- Core's active-operation semantics remain correct under concurrency.
- Legacy events/consumers work without optional history.
- AIRA exceptions and cancellation outcomes are preserved.
- Full mock/local suites pass, and unprovisioned live validation remains explicitly deferred.
