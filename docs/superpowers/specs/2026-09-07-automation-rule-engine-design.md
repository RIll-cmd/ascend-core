# Phase 4A Automation Rule Engine Design

## Goal

Add a backend-only, user-configured automation engine that can turn a stored integration observation into a single existing Ascend action when an enabled rule's safe conditions match.

## Scope

Phase 4A handles only the existing negative-habit action, exposed as `log_bad_habit`. It supports the stored observation trigger types `phone_usage_observed`, `posture_observed`, and `sleep_state_observed`, authenticated rule CRUD, and a non-mutating test endpoint. It excludes a frontend, AIRA rule authoring, focus-mode conditions, notifications, positive-habit and mission actions, scheduling, aggregation, and retries.

## Architecture

`POST /api/integration/event` remains the trusted device-ingestion path. It validates and durably stores an `IntegrationObservation` first. Only a newly stored observation is passed to the evaluator; duplicate event IDs return their existing response and have no side effects. `workout_completed` remains on its existing direct workout path.

The evaluator finds enabled rules for the same character and trigger type, evaluates allowlisted conditions against a fixed event view, claims execution with durable cooldown and idempotency protection, then invokes existing negative-habit behavior. Each rule is isolated so a failure is recorded without failing ingestion or stopping other rules.

The current negative-habit code lives in `routers.habits.trigger_habit`. Its negative branch will be extracted into a focused service. The existing route and the automation evaluator will call that service, preserving penalty calculation, stat updates, relapse counters, timestamps, and `HabitRelapseLog` creation in one place.

## Persistence

`AutomationRule` stores character ownership, name, enablement, trigger type, conditions/actions as JSON strings, cooldown seconds, and `lastTriggeredAt`.

`AutomationExecution` stores rule, character, and observation references; execution status; execution time; and a JSON result/error summary. A unique constraint on `(ruleId, observationId)` prevents reexecution for one stored observation.

The evaluator claims a rule execution in a database transaction. The claim uses the rule's persisted `lastTriggeredAt` to enforce cooldown and creates the execution record before calling the mutation. A `FAILED` record is terminal in Phase 4A: dangerous mutation actions are not retried automatically.

## Security and ownership

Rule schemas forbid unknown fields. Trigger strings, condition fields, operators, and action types are explicit allowlists. No user input is evaluated as code, SQL, or a function name.

Management endpoints require normal JWT authentication. They resolve ownership by matching `Character.id` and `Character.userId` exactly, rather than using the guest-compatible ownership helper. Rule creation and updates also verify that an action target belongs to that character and is a `NEGATIVE` habit.

## Condition input

Rules may inspect only `event.type`, `event.source`, `event.timestamp`, `payload.confidence`, `payload.posture`, `payload.state`, and `payload.detector`. Operators are `equals`, `not_equals`, `greater_than`, `greater_than_or_equal`, `less_than`, `less_than_or_equal`, and `contains`.

## APIs

- `GET /api/automations?characterId=...`
- `POST /api/automations`
- `GET /api/automations/{id}`
- `PATCH /api/automations/{id}`
- `DELETE /api/automations/{id}`
- `POST /api/automations/{id}/test`

The test route evaluates only the stored rule and a hypothetical observation, returning per-condition matches without storage or mutations.
