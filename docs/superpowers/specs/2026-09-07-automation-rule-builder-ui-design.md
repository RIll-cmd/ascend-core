# Phase 4B Automation Rule Builder UI Design

## Goal

Provide an authenticated dashboard UI for creating, editing, testing, enabling, disabling, and deleting Phase 4A automation rules.

## Scope

Add `/automations`, a sidebar entry, a single-condition editor, and a dry-run panel. Use only `log_bad_habit`, owned negative habits, the three existing triggers, backend-supported fields/operators, and cooldown seconds conversion. No backend changes, drag/drop, nested conditions, AI creation, schedules, analytics, or phone/watch changes.

## Components

`features/automations/types` owns frontend API/data types and label mappings. `services/automation.service` owns authenticated CRUD/test requests and safe API error conversion. `AutomationEditorDialog` owns the create/edit form. `AutomationsPage` owns loading the current character's rules and negative habits, list state, confirmation, and dry-run UI.

## Data flow

The current character comes from `useCharacterStore`, with the existing local-storage fallback. Rules come from `GET /api/automations?characterId=...`; negative targets are filtered from the existing `fetchHabits(characterId)` result. Create/update sends Phase 4A schemas, mapping labels to exact backend values and cooldown units to seconds. Test sends a hypothetical observation only to the existing test endpoint.

## UX

Use the established pixel stone/amber/slate panel language and Radix dialog primitives. Add Automations under SidebarNav's System Core; keep the compact mobile bottom navigation unchanged. No raw IDs are displayed or requested.
