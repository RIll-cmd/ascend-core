# Core Phase 6A: Vision User-Auth Bridge

## Goal

Allow an already authenticated Core user to mint a 15-minute Bearer JWT for `D:\ascend-vision`, without creating a new identity, session, refresh-token, or database system.

## Design

`POST /api/auth/vision-token` requires the existing general Core user JWT/session and signs a second JWT using the existing signer. The handoff token contains only `sub`, `username`, `exp`, and `purpose: "ascend_vision"`.

The generic user dependency rejects purpose-bound tokens. A dedicated automation dependency accepts either a normal Core user token or the `ascend_vision` purpose token; no other purpose is accepted. This prevents a Vision handoff token from being used by unrelated Core routes while retaining existing web access to automations.

## Security

The issuer never accepts an integration key, user-supplied identity, character ID, voice text, or model output. Expiry and signature validation remain PyJWT validation. There is no refresh: expiry yields 401 and Vision must obtain a fresh authenticated handoff. Vision must use an OS-native credential vault and never place the token in LLM context, logs, telemetry, observations, CV payloads, crash reports, or source code.

## Non-goals

No database schema change, no refresh/revocation design, no modification of the 30-day web token, no Vision workspace changes, no AIRA changes, and no Phase 5 execution changes.
