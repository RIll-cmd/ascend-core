# System Architecture

## Overview
Ascend OS is built on a scalable, feature-based SaaS architecture separating concern boundaries between client UI, state management, backend APIs, and persistence.

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js App Router (Client)               │
│  ┌──────────────┐   ┌──────────────────┐   ┌─────────────┐  │
│  │ Auth Feature │   │ Character Feature│   │ Dashboard   │  │
│  └──────┬───────┘   └────────┬─────────┘   └──────┬──────┘  │
│         │                    │                    │         │
│  ┌──────┴────────────────────┴────────────────────┴──────┐  │
│  │                    Zustand Stores                      │  │
│  │      (useAuthStore, useCharacterStore, etc.)           │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ HTTP / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Server (Python)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Endpoints & Routers                     │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │ Prisma ORM                   │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │             Neon PostgreSQL (Serverless Pooled)       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Architectural Principles
1. **Feature Co-location**: Code specific to a domain feature (components, hooks, utils, services) resides within `/features/<feature-name>`.
2. **Global State Boundaries**: Zustand handles persistent client-side state slices independently (`AuthStore`, `CharacterStore`, `ThemeStore`, `NavigationStore`).
3. **Decoupled Backend**: FastAPI provides stateless RESTful JSON endpoints over Python Prisma ORM on Vercel Serverless Functions.
4. **Neon Persistence**: Primary data layer is exclusively Neon PostgreSQL, connected via connection pooler (`-pooler`).

---

## Game Engine Abstraction Pipeline

The RPG Game Engine operates via a decoupled, reactive flow separating UI triggers, pure math functions, optimistic state mutations, and backend persistence:

```
[UI Trigger: "Simulate Training (+150 EXP)"]
                       │
                       ▼
    [Zustand Action: useCharacterStore.gainExp(150)]
                       │
                       ├──────► [Pure RPG Math: calculateLevelData(totalExp)]
                       ├──────► [Pure RPG Math: calculatePower(level, stats)]
                       ├──────► [Pure RPG Math: calculateRank(power)]
                       │
                       ▼
    [Optimistic UI State Mutation & Sonner Toast Notifications]
                       │
                       ▼
    [Asynchronous Service Sync: character.service.syncCharacterProgression()]
                       │
                       ▼
    [FastAPI Endpoint: POST /api/character/{id}/sync-progression]
                       │
                       ▼
    [Prisma ORM & Neon Serverless PostgreSQL Persistence]
```

### Flow Mechanics:
1. **User Interaction**: User clicks a progression trigger (e.g. completing a daily quest or running a simulation training button).
2. **Store Pipeline Invocation**: The event calls `useCharacterStore.gainExp(amount, reason)`.
3. **Isolated Math Execution**: Pure utility functions in `client/src/features/character/utils/` calculate level threshold, percentage progress, power score integer, and rank letter classification.
4. **Optimistic UI Update & Notifications**: Zustand state updates immediately. If `currentLevel > previousLevel`, a `"LEVEL UP!"` toast notification fires using `sonner`.
5. **Non-Blocking Persistence Sync**: The store invokes `syncCharacterProgression` from `character.service.ts` in the background asynchronously without blocking the UI rendering thread.
