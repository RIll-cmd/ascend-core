# Phase 4B Automation Rule Builder UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a form-based `/automations` dashboard UI over the verified Phase 4A API.

**Architecture:** Isolate API mapping in an automations feature service and reuse it from a page-level controller and one dialog for create/edit. Filter existing habits client-side for owned negative targets; send dry runs only to the backend test endpoint.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind, Radix Dialog, Sonner, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-07-automation-rule-builder-ui-design.md`

## Global Constraints

- Do not change the Phase 4A backend, phone/watch project, or unrelated pages.
- Support one condition and `log_bad_habit` only.
- Use only backend trigger, field, operator, and action allowlists.
- Require no raw habit IDs in the UI.
- Keep mobile bottom navigation unchanged.

---

### Task 1: Add automation types, API service, and mappings

**Files:**
- Create: `client/src/features/automations/types/automation.ts`
- Create: `client/src/features/automations/services/automation.service.ts`
- Test: `client/src/features/automations/services/automation.service.test.ts`

**Interfaces:** Expose `AutomationRule`, `AutomationDraft`, `cooldownToSeconds(amount, unit)`, and authenticated `list/create/update/remove/test` API functions.

- [ ] Write failing tests for 30 minutes mapping to 1800 seconds, exact trigger/action values, and a safe condition payload.
- [ ] Run `npm test -- automation.service.test.ts` and observe missing-module failure.
- [ ] Implement label maps and API calls with credentials/Bearer auth consistent with `habit.service.ts`; return safe messages from non-OK responses.
- [ ] Re-run focused tests.

### Task 2: Create the editor and dry-run dialog

**Files:**
- Create: `client/src/features/automations/components/AutomationEditorDialog.tsx`
- Create: `client/src/features/automations/components/AutomationEditorDialog.test.tsx`

**Interfaces:** `AutomationEditorDialog({ rule?, negativeHabits, onSave, onClose })` creates a one-condition `AutomationDraft`; it accepts no manual habit ID.

- [ ] Write failing tests for prepopulation, selecting a negative habit, cooldown conversion input, and safe dry-run submission.
- [ ] Run the dialog test and observe missing-component failure.
- [ ] Implement labeled native controls in the existing pixel-panel/dialog style, loading/error states, and human-readable dry-run result.
- [ ] Re-run focused tests.

### Task 3: Add Automations route and management list

**Files:**
- Create: `client/src/app/(dashboard)/automations/page.tsx`
- Create: `client/src/features/automations/components/AutomationCard.tsx`
- Test: `client/src/features/automations/components/AutomationCard.test.tsx`

**Interfaces:** Page loads the current character's rules and habits; cards expose Edit, Test, Enable/Disable, and Delete actions.

- [ ] Write failing tests for rule list, empty state, enabled state, and friendly labels.
- [ ] Implement current-character lookup, list/loading/error/empty states, create/edit dialog state, deletion confirmation, and Sonner feedback.
- [ ] Re-run focused tests.

### Task 4: Register navigation and verify

**Files:**
- Modify: `client/src/components/SidebarNav.tsx`
- Test: relevant focused tests above

- [ ] Add Automations to System Core with an accessible label and a consistent icon/index.
- [ ] Run `npm test` and `npm run lint` from `client`.
- [ ] Manually verify responsive page, create/edit/toggle/delete/dry-run flow against the existing backend; dry run must create no action.
