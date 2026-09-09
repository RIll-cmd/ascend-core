# AIRA Core Control Design

## Purpose

AIRA gains safe, comprehensive control over Core-owned Ascend features. Vision owns conversation and presentation. Core owns facts, authorization, validation, and mutations. AIRA can select only typed Core operations; it must not query Prisma or execute model-provided arguments directly.

## Architecture

Use one AIRA operation registry with four classes:

| Class | Examples | Confirmation |
| --- | --- | --- |
| Read | missions, habits, steps, recovery, shops | Never |
| Recommendation | workout recommendation from recovery and schedule | Never |
| Preview | create/edit/archive habit, buy item | Always returns a preview |
| Execute | apply one approved preview | Required |

The registry is the shared seam for Vision, AIRA, and domain services. Its four operations are read, recommend, preview, and execute. It handles actor/character ownership, schema validation, domain delegation, response shaping, and audit input behind that small interface.

Vision calls the Vision Core read contract for direct facts. For synthesis, explanations, and recommendations, Vision calls an authenticated Core AIRA endpoint. Gemini may select only a registry operation name and candidate structured arguments. Server code validates the operation and overwrites character scope from the authenticated request.

## Supported scope

Read/recommendation:
- Missions, today's schedule, habits, calendar snapshots, automations, steps, recovery, workout ranks/exercises, shop catalog, inventory, and shop requirements.
- Sleep and health always return unavailable_data.
- Workout recommendations combine persisted recovery with the pending schedule. They never create or log a workout.

Writes:
- Habits: create, update, archive/status, complete/log.
- Missions: complete; create only through a validated Core domain service.
- Workouts: preview then log validated sets through the existing workout flow.
- Automations: create, update, enable/disable, delete.
- Shops: preview then purchase existing items.
- Calendar: expose existing snapshots now. A new arbitrary event model is separate domain work.

## Execution policy

Every mutation is preview, explicit user confirmation, then execute. Preview returns normalized arguments, warning(s), a human summary, expiry, and an opaque confirmation token. Execute requires the same actor, character, operation, request ID, and token; it is idempotent and audited.

Purchases, deletion/archive, completion/logging, and new records always require confirmation. The three existing Vision observation automations are the sole no-confirmation exception.

Never store raw model prompts, tokens, images, video, frames, camera data, or database queries in audit records. Record only actor, character, operation, request ID, safe metadata, result, and timestamp.

## Migration

Replace legacy direct read tools and the direct mutation behavior in /api/aira/execute. Do not add further actions there. Keep compatibility only until the typed equivalents exist, then return a migration error and remove the old path.

## Delivery phases

A. Typed reads and deterministic workout recommendations.
B. Preview, approval-token, audit, and idempotent execute foundation.
C. Migrate habits, missions, workouts, and automations.
D. Migrate shop purchases; expose calendar snapshots; design a calendar-event model only if required.
E. Vision voice client, confirmations, error translation, and end-to-end policy tests.

## Success criteria

AIRA answers Core questions through typed data, gives transparent workout recommendations, and can only change Core after validated confirmation. Vision receives stable structured results and remains the user-facing AI.

