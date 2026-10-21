# Task 2 — atomic bounded completion persistence

Read the design/plan and Task 1 contract before implementation. Modify the Prisma model, status repository/service, and focused persistence/service tests only.

## Required behavior

- Add a durable `StatusOperationCompletion` record keyed by `(serviceId, instanceId, operationId)`, with terminal outcome, start/finish timestamps, and optional safe label only.
- Keep only the latest 20 terminal records per service instance. The read contract in a later task will expose at most five. Do not store event bodies, prompts, logs, results, credentials, or internal operation IDs in the shelf output.
- Make the terminal transition atomic: require a matching active operation unless the completion already exists; insert exactly once; remove its active row; derive current service state/count from remaining active rows. First terminal outcome wins, and retries return it without rewriting it.
- Preserve concurrent operation state: completing one operation must not mark the service idle while another remains active. Serialize start/finish mutations per service instance in PostgreSQL, using the existing status row or another safe lock strategy inside a Prisma interactive transaction. Keep the in-memory repository behavior aligned.
- `idle` heartbeat/events and stale/offline derivation never create completion records.
- Keep compatibility for current `finish_operation` call until Task 3 updates AIRA outcomes; provide a temporary default only if needed, and make its semantics explicit for this commit.

## TDD and safety

Write tests first for success/failure/cancel outcomes, duplicate terminal retry with conflicting outcome, unknown operation rejection, parallel active operation count, bounded history, and idle/stale non-inference. Demonstrate RED, implement narrowly, run focused status tests, `prisma validate`, and `prisma generate`. Do NOT run `prisma db push`, connect to the local `dev.db`, connect to any hosted DB, provision a credential, or deploy. Generated client changes should be included only if required and narrow.

## Report

Record test commands/results and commit. Flag any PostgreSQL concurrency assumption that cannot be verified with test doubles.
