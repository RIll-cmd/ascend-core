# Ascend agent entry point

At the start of a new task or after switching coding agents, read the shared handoff at `D:/ascend_hub/ASCEND_HANDOFF.md` (sibling-repository path: `../ascend_hub/ASCEND_HANDOFF.md`). Resolve the relative path from this file's directory, not a feature worktree's working directory.

Confirm the intended Core checkout and preserve its existing changes. Read the applicable local instructions; frontend work must also follow `client/AGENTS.md`. The backend environment can target production PostgreSQL, so verify it before database operations.

Before switching agents, update the shared handoff's Current session with the objective, exact checkout, changed files, checks/results, outstanding issues, next action, and commit/push status. Keep credentials and private runtime data out of documentation.
