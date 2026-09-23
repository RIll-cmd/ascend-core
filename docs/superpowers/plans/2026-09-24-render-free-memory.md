# Render Free Memory Optimization Plan

> **For agentic workers:** Inline execution with checkpoints. Use test-first changes and preserve all API routes and database behavior.

**Goal:** Reduce avoidable Render startup work and capture memory checkpoints so the backend can be iterated toward the Free 512 MiB limit.

**Architecture:** Keep the existing single-worker FastAPI service and Prisma connection required by database routes. Skip the optional baseline skill seeder on Render unless explicitly enabled, while retaining its existing manual script. Log Linux process RSS and cgroup memory at import and startup boundaries without adding dependencies.

**Tech Stack:** Python, FastAPI lifespan, pytest, Linux `/proc` and cgroup memory files.

**Spec:** User request in chat (2026-09-24): keep Render Free and make the backend fit its 512 MiB memory cap.

## Global Constraints

- Keep one Uvicorn worker; Render already sets `WEB_CONCURRENCY=1` for Free.
- Do not remove or disable API routes, AI features, or database-backed features.
- Do not print environment-variable values or database credentials.
- Production skill seeding remains explicitly opt-in via `AUTO_SEED_SKILLS_ON_STARTUP=true`.
- Do not claim the live service fits until a Render deploy completes without OOM and its memory metric remains below 512 MiB.

---

### Task 1: Make startup-seed policy explicit and testable

**Files:**
- Create: `server/startup_options.py`
- Create: `server/tests/test_startup_options.py`
- Modify: `server/main.py`

**Interfaces:**
- Produces `should_seed_skills_on_startup(environ: Mapping[str, str] | None = None) -> bool`.
- Explicit `AUTO_SEED_SKILLS_ON_STARTUP` wins; otherwise disable startup seeding in production/Render and preserve current local-development behavior.

- [ ] Write tests for production/Render default-off, development default-on, and explicit true/false overrides.
- [ ] Run the focused tests and confirm the missing helper fails as expected.
- [ ] Implement the policy helper and use it in the FastAPI lifespan.
- [ ] Re-run the focused tests.

### Task 2: Add low-overhead startup memory checkpoints

**Files:**
- Create: `server/startup_diagnostics.py`
- Create: `server/tests/test_startup_diagnostics.py`
- Modify: `server/main.py`

**Interfaces:**
- Produces `format_memory_snapshot(stage: str, process_rss_kib: int | None, cgroup_current_bytes: int | None, cgroup_limit_bytes: int | None) -> str` and `log_startup_memory(stage: str) -> None`.
- Snapshot reads are best-effort and silently tolerate platforms without `/proc`/cgroup files.

- [ ] Test formatting for present/missing values.
- [ ] Confirm the tests fail before implementation.
- [ ] Log snapshots before/after router imports, before/after Prisma connect, and around optional seeding.
- [ ] Run focused tests and Python compilation; inspect the final diff.

## Deployment Verification Boundary

The workspace cannot access the Render dashboard or deploy credentials. After redeploy, verify that Render no longer reports OOM and compare logged cgroup usage against 512 MiB. If Prisma connect alone exceeds the cap, this code change is insufficient; the data-access engine or service architecture must be reduced further.
