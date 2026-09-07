# Phase 5 Advanced Automation Rules Design

## Goal

Extend Phase 4 automation rules with safe, explainable multiple conditions, local time windows, and rolling occurrence counts while preserving all existing rule data and behavior.

## Scope

Phase 5 adds `matchMode`, `time_window`, and `occurrence_count`. It retains `log_bad_habit` as the only executable action. It does not add duration, notifications, arbitrary expressions, scripts, webhooks, or phone/watch changes.

## Compatibility

`conditionsJson` remains the current list form. Existing field-comparison objects remain valid unmodified. A new `matchMode` rule column defaults to `all`, so old rules retain their present AND behavior. API create and update schemas default omitted `matchMode` to `all`.

## Condition model

The allowlisted condition union is:

- Field comparison: existing `field`, `operator`, and `value` shape.
- `time_window`: `{ "type": "time_window", "start": "HH:MM", "end": "HH:MM" }`.
- `occurrence_count`: `{ "type": "occurrence_count", "count": 1..N, "windowSeconds": 1..86400 }`.

`all` requires each condition to match. `any` is supported only if the evaluator remains simple and testable; otherwise the API only accepts `all` in this phase.

## Evaluation

The automation engine owns condition evaluation behind one evaluator interface. It returns a safe structured result with `matched`, condition results, and reason codes. Field traversal remains restricted to the current allowlist.

Time windows use the rule character's IANA timezone. Invalid or missing timezone values fall back to UTC. Windows with `start > end` are overnight windows.

Occurrence count includes the incoming accepted observation and persisted observations for the same `characterId` and `eventType` within the cutoff. Source and state are constrained only by the rule's ordinary conditions; counting has no hidden filters. Queries are bounded by `windowSeconds` and supported by a composite observation index on character, event type, and observed time.

## Execution history

Dry-run and evaluator responses expose non-match reasons but do not mutate history. Persistent `AutomationExecution` rows are retained only for meaningful attempted outcomes: `SUCCEEDED`, `FAILED`, `SKIPPED_COOLDOWN`, and `SKIPPED_DUPLICATE`. Normal field, time, and count non-matches are not persisted. Result JSON stores compact action/outcome/reason information and never copies raw observation payloads.

## Duration

Duration remains unavailable. The current observation contract has a state field but does not require paired `started`/`ended` observations with session identity; therefore duration cannot be measured truthfully. The backend rejects duration conditions and the UI describes the prerequisite rather than offering an active control.

## UI

The existing editor gains add/remove condition rows, match mode, and dedicated time-window/count controls. Existing one-condition rules render and edit unchanged. Cards and dry-run show friendly, safe explanation results. The visual language and Phase 4 page structure remain intact.

## Verification

Focused tests prove Phase 4 compatibility, ALL/ANY behavior if enabled, day/overnight windows, count thresholds and stale-event exclusion, isolation, cooldown, duplicate protection, allowlists, and dry-run non-mutation. Live validation uses a work-hours/count rule against real persisted observations.
