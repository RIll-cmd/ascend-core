# Task 1 — strict operation lifecycle event contract

Read the plan and design spec at:
- `docs/superpowers/plans/2026-09-25-status-completion-history.md`
- `docs/superpowers/specs/2026-09-25-status-completion-history-design.md`

Modify only `server/schemas/service_status.py` and focused Core status contract tests.

Define the minimal strict optional lifecycle event payload: stable bounded `operationId`, phase `started|progress|succeeded|failed|cancelled`, and optional safe short label. Reject arbitrary/unknown payload keys and prohibited multiline/source content. Preserve compatibility with legacy events that omit lifecycle. Define and test state/phase consistency without allowing idle/stale states to imply terminal success. Add regressions first, run focused tests to show RED, implement, run focused GREEN and diff check, then commit.

Do not modify status persistence or AIRA yet. Do not run Prisma schema synchronization, access any configured database, or provision credentials. Report exact tests and commit hash.
