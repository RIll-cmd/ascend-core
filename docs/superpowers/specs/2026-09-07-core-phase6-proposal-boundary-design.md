# Core Phase 6: Vision Automation Proposal Boundary

## Goal

Provide `D:\ascend-vision` with an authenticated, read-only Core contract for discovering automation capabilities, resolving eligible negative habits, and validating prospective automation rules. Core remains the source of truth and the existing `POST /api/automations` remains the only persistence path.

## Boundary

`D:\ascend-vision` owns natural-language, voice, CV, device context, and proposal generation. `D:\ascend-core` owns JWT/session authentication, character and habit ownership, allowlists, deterministic validation, persistence, and deterministic execution. Existing Core AIRA/Gemini behavior is unchanged.

## Contract

The automations router adds authenticated `GET /capabilities`, `GET /eligible-habits?characterId=...`, and `POST /proposals/validate` endpoints before dynamic `/{rule_id}` routes. Proposal input is the exact `AutomationRuleCreate` shape. The validator returns a normalized rule, a proposal-derived preview, `requiresConfirmation: true`, and no durable side effects.

Core exposes only supported triggers, match modes, fields, operators, condition types, actions, and limits, plus `{id,name}` for owned negative habits. The same schema and semantic checks protect proposal validation and `POST /api/automations`.

## Security and compatibility

Proposal endpoints require `get_current_user` and exact `Character.id + Character.userId` lookup; an integration key cannot establish user identity. Invalid target IDs use a generic eligibility failure. No observations, secrets, or unrelated records are returned.

`ascend_vision` is the canonical integration command source. `phone_watch_phase5` remains accepted temporarily and is normalized internally to `ascend_vision`; no migration is required. Historical inventory Phase 6 documentation remains unchanged.

## Non-goals

No database schema changes, no changes under `D:\ascend-vision`, no Core AIRA changes, no Gemini proposal generation, and no changes to Phase 5 deterministic execution semantics.
