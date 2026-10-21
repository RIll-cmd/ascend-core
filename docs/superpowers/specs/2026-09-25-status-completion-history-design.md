# Ascend Hub Status Completion History V1

## Goal

Let Vision distinguish an agent that is merely idle from one whose producer explicitly reported that its task succeeded, failed, or was cancelled. Preserve a small, privacy-safe completion history alongside the existing current-state shelf.

## Evidence and current boundary

Core currently stores one current `ServiceStatus` row and deletes `StatusActiveOperation` rows when work ends. The AIRA request context manager calls `finish_operation` from `finally`, so an exception can currently be followed by an idle state indistinguishable from success. The producer event contract reports only `idle`, `working`, or `stuck`; no Antigravity/Codex producer implementation was found in either repository. This feature establishes the Core contract and AIRA lifecycle, but external agents will not report until separately integrated.

## Contract

- Keep current state and completed work distinct. An `idle` state, stale heartbeat, process exit, timeout, or disappearance is never completion evidence.
- Add an optional bounded operation-lifecycle object to producer events: stable `operationId`, phase (`started`, `progress`, `succeeded`, `failed`, `cancelled`), and an optional short safe label. Do not accept prompts, transcripts, result bodies, code, logs, or arbitrary metadata as completion content.
- Completion is terminal and idempotent per `(serviceId, instanceId, operationId)` while its bounded history record is retained. Persist the outcome and `finishedAt`; retained retries cannot change one terminal outcome into another. After eviction, a terminal retry is rejected as unmatched rather than accepted as success. Producers must generate a fresh, non-reused operation ID for every operation; UUIDs are recommended.
- Keep existing producer credential binding and shelf-read credential separation. Producers can only submit for their bound service instance.
- Retain the latest 20 completion records per instance (the idempotency horizon). Expose at most the latest five in the shelf response with only the service identity already present, outcome, timestamp, and safe label. Do not expose operation IDs or error payloads.
- History is an optional additive shelf field. Vision validates and renders it deterministically; when absent, Vision reports current status without claiming completion.
- AIRA scopes record `succeeded` only after normal return, `failed` on ordinary exceptions, and `cancelled` on task cancellation. Status-write failures must not replace the original AIRA exception. Process loss produces no completion record.

## Atomicity and privacy

Finishing an operation atomically removes its live row, persists the terminal record once, and derives current state from the remaining active count. Duplicate terminal submissions return the existing outcome. History stores no event payload, credentials, prompts, chats, or arbitrary results. Labels use the existing safe-summary validation.

## Out of scope

- Installing provider-specific Antigravity/Codex CLI hooks.
- Claiming uninstrumented agents have finished work.
- Changing memory, phone relay, MCP, executable skills, or action permissions.
- Provisioning/using production credentials, applying remote schema changes, or deploying.

## Acceptance

Tests prove success/failure/cancellation outcomes, idle-without-completion wording, stable idempotency, concurrent operation counts, process-loss non-inference, privacy rejection, producer identity binding, optional shelf compatibility, and deterministic Vision rendering. Full Core/Vision suites pass using mocks/local test doubles; live validation remains deferred until staging endpoint and credentials are provisioned.
