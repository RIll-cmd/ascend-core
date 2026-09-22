# Status Shelf Phase 1 Implementation Plan

## Scope

Implement only Phase 1 from `future ai implementation.md`: normalize Ascend
Core/AIRA and Ascend Vision status. Do not add Hub UI integration or adapters
for third-party agents.

## Durable model

- Add a Postgres latest-state row keyed by `(service_id, instance_id)` with the
  fields specified in the status-shelf contract.
- Add a Postgres live-operation row keyed by `(service_id, instance_id,
  operation_id)`. These rows are deleted when work ends and automatically
  expired when abandoned; they are not history. Transactional queries derive
  the active-operation count and prevent multi-replica or restart-induced idle
  transitions.
- Add a per-instance, revocable producer credential table. Store only a
  credential identifier and a salted/hashed secret; bind each credential to one
  service and instance.

## API and behaviour

1. Define schema-version 1 Pydantic contracts corresponding exactly to
   `ServiceStatusEvent` and `StatusShelfResponse`. Forbid unknown input fields
   and recursively reject prohibited payload keys/content categories.
2. Add a `StatusRepository` and `StatusService`, using Postgres transactions
   for event-id deduplication, monotonic sequence handling, durable live work,
   stale-to-offline derivation, and 90-second stuck detection.
3. Add an authenticated producer event route and an authenticated shelf-read
   route. Limit producer writes to 60 requests per bound service instance per
   minute.
4. Replace Core's in-process Vision presence state with the service. Extend the
   existing Vision heartbeat payload in both deployed client paths; do not add a
   second Core channel.
5. Wrap AIRA request operation boundaries in durable operation scopes and run a
   Core lifecycle heartbeat/sweep task. The final completion transitions to idle
   only once the transactional active-operation count is zero.

## Tests and verification

- First add tests for schema privacy, credentials and service-instance binding,
  duplicate event IDs, out-of-order sequences, stale heartbeat offline state,
  90-second stuck derivation, and concurrent AIRA scopes.
- Run the focused status, Vision heartbeat, and AIRA route suites, then the
  full server test suite and Prisma validation/generation checks.
