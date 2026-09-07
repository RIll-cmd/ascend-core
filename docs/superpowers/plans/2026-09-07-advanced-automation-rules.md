# Advanced Automation Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add backwards-compatible multiple conditions, timezone-aware time windows, rolling occurrence counts, and explainable outcomes to automation rules.

**Architecture:** Preserve Phase 4 `conditionsJson` as a list and add a defaulted `matchMode` column. Keep the evaluator and action claim logic in `automation_engine`, use persisted `IntegrationObservation` rows for bounded count queries, and expose typed condition rows through the existing editor.

**Tech Stack:** FastAPI, Pydantic v2, Prisma, PostgreSQL/Neon, Next.js, React, TypeScript, Vitest, pytest.

**Spec:** `docs/superpowers/specs/2026-09-07-advanced-automation-rules-design.md`

## Global Constraints

- Preserve all Phase 4 list-shaped `conditionsJson` data and default omitted `matchMode` to `all`.
- Keep `log_bad_habit` as the only executable action.
- Reject duration conditions until paired state transitions with a session identifier exist.
- Do not persist normal condition non-matches; dry-run returns their safe reason instead.
- Persist only `SUCCEEDED`, `FAILED`, `SKIPPED_COOLDOWN`, and `SKIPPED_DUPLICATE` outcomes.
- Do not alter phone/watch, schema-destructive operations, or unrelated UI.

---

### Task 1: Expand the persisted rule contract safely

**Files:**
- Modify: `server/prisma/schema.prisma`
- Modify: `server/schemas/automation.py`
- Modify: `server/routers/automations.py`
- Test: `server/tests/test_automation_engine.py`

**Interfaces:** Produces `MatchMode = Literal["all", "any"]`, field/time/count condition models, and serialized `matchMode`.

- [ ] **Step 1: Write failing compatibility tests**

```python
def test_legacy_rule_defaults_to_all_match_mode():
    rule = AutomationRuleCreate.model_validate(legacy_phase4_payload)
    assert rule.matchMode == "all"

def test_rejects_unknown_advanced_condition_type():
    with pytest.raises(ValidationError):
        AutomationRuleCreate.model_validate({**payload, "conditions": [{"type": "script"}]})
```

- [ ] **Step 2: Run the targeted tests and confirm they fail**

Run: `server/.venv/Scripts/python.exe -m pytest server/tests/test_automation_engine.py -q`

- [ ] **Step 3: Add the additive Prisma migration shape and Pydantic union**

```prisma
matchMode String @default("all")
@@index([characterId, eventType, observedAt])
```

```python
class TimeWindowCondition(BaseModel):
    type: Literal["time_window"]
    start: str
    end: str
```

- [ ] **Step 4: Serialize and update `matchMode` without changing `conditionsJson`**

```python
"matchMode": getattr(rule, "matchMode", "all")
```

- [ ] **Step 5: Re-run the targeted tests and Prisma validation**

Run: `server/.venv/Scripts/python.exe -m pytest server/tests/test_automation_engine.py -q`

Run: `server/.venv/Scripts/prisma.exe validate`

- [ ] **Step 6: Commit the additive contract change**

```bash
git add server/prisma/schema.prisma server/schemas/automation.py server/routers/automations.py server/tests/test_automation_engine.py
git commit -m "feat: extend automation rule conditions"
```

### Task 2: Implement explainable advanced evaluation

**Files:**
- Modify: `server/services/automation_engine.py`
- Test: `server/tests/test_automation_engine.py`

**Interfaces:** `evaluate_conditions(conditions, observation_view, *, match_mode, character_timezone, occurrence_counter)` returns `{matched, reason, conditions}`.

- [ ] **Step 1: Write failing evaluator tests**

```python
assert result["reason"] == "time_window_not_met"
assert overnight_result["matched"] is True
assert count_result["reason"] == "occurrence_threshold_not_met"
```

- [ ] **Step 2: Verify the tests fail before implementation**

Run: `server/.venv/Scripts/python.exe -m pytest server/tests/test_automation_engine.py -q`

- [ ] **Step 3: Add allowlisted field, time-window, and count evaluators**

```python
def time_window_matches(local_time: time, start: time, end: time) -> bool:
    return start <= local_time <= end if start <= end else local_time >= start or local_time <= end
```

- [ ] **Step 4: Keep `all` and `any` aggregation explicit**

```python
matched = all(item["matched"] for item in results) if match_mode == "all" else any(item["matched"] for item in results)
```

- [ ] **Step 5: Verify field-condition compatibility, time windows, count semantics, and allowlist rejection**

Run: `server/.venv/Scripts/python.exe -m pytest server/tests/test_automation_engine.py -q`

- [ ] **Step 6: Commit evaluator behavior**

```bash
git add server/services/automation_engine.py server/tests/test_automation_engine.py
git commit -m "feat: evaluate advanced automation conditions"
```

### Task 3: Bound occurrence queries and execution outcomes

**Files:**
- Modify: `server/services/automation_engine.py`
- Modify: `server/routers/integration.py`
- Test: `server/tests/test_automation_engine.py`
- Test: `server/tests/test_integration_api.py`

**Interfaces:** `count_recent_observations(character_id, event_type, cutoff)` queries only the indexed rolling window. Matched but blocked executions persist reasoned skip statuses.

- [ ] **Step 1: Write failing database-adapter tests**

```python
assert await count_recent_observations("c1", "phone_usage_observed", cutoff) == 2
assert outcome == {"ruleId": "r1", "status": "SKIPPED_COOLDOWN", "reason": "cooldown_active"}
```

- [ ] **Step 2: Verify failures**

Run: `server/.venv/Scripts/python.exe -m pytest server/tests/test_automation_engine.py server/tests/test_integration_api.py -q`

- [ ] **Step 3: Query only character, event type, and `observedAt >= cutoff`**

```python
await database.integrationobservation.count(where={"characterId": character_id, "eventType": event_type, "observedAt": {"gte": cutoff}})
```

- [ ] **Step 4: Persist only cooldown, duplicate, success, and failure outcomes**

```python
{"status": "SKIPPED_COOLDOWN", "resultJson": json.dumps({"reason": "cooldown_active"})}
```

- [ ] **Step 5: Verify rolling cutoff, duplicate, cooldown, action isolation, and character isolation**

Run: `server/.venv/Scripts/python.exe -m pytest server/tests/test_automation_engine.py server/tests/test_integration_api.py -q`

- [ ] **Step 6: Commit query and outcome behavior**

```bash
git add server/services/automation_engine.py server/routers/integration.py server/tests/test_automation_engine.py server/tests/test_integration_api.py
git commit -m "feat: add bounded automation occurrence counts"
```

### Task 4: Extend the existing automation editor

**Files:**
- Modify: `client/src/features/automations/services/automation.service.ts`
- Modify: `client/src/features/automations/components/AutomationEditorDialog.tsx`
- Modify: `client/src/features/automations/components/AutomationCard.tsx`
- Modify: `client/src/features/automations/components/AutomationTestDialog.tsx`
- Test: `client/src/features/automations/services/automation.service.test.ts`
- Test: `client/src/features/automations/components/AutomationCard.test.ts`

**Interfaces:** Adds typed condition unions and `matchMode` while preserving existing `AutomationDraft` payload generation.

- [ ] **Step 1: Write failing frontend mapping/presentation tests**

```ts
expect(buildAutomationPayload(draft).matchMode).toBe("all");
expect(getConditionValueLabel({ type: "time_window", start: "22:00", end: "06:00" })).toContain("22:00");
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- --pool=forks --maxWorkers=1 src/features/automations/services/automation.service.test.ts src/features/automations/components/AutomationCard.test.ts`

- [ ] **Step 3: Add condition rows and match mode to the reusable editor**

```tsx
<button type="button" onClick={() => setConditions([...conditions, defaultFieldCondition])}>
  Add condition
</button>
```

- [ ] **Step 4: Render time-window/count controls and unavailable duration guidance**

```tsx
<p>Duration rules require paired started/ended observations with a session identifier.</p>
```

- [ ] **Step 5: Show safe dry-run reason labels and card summaries**

Run: `npm test -- --pool=forks --maxWorkers=1 src/features/automations/services/automation.service.test.ts src/features/automations/components/AutomationCard.test.ts`

- [ ] **Step 6: Commit the UI extension**

```bash
git add client/src/features/automations
git commit -m "feat: add advanced automation rule builder"
```

### Task 5: Verify compatibility and live behavior

**Files:**
- Test: `server/tests/test_automation_engine.py`
- Test: `server/tests/test_integration_api.py`
- Test: `client/src/features/automations/services/automation.service.test.ts`
- Test: `client/src/features/automations/components/AutomationCard.test.ts`

- [ ] **Step 1: Run focused backend proof**

Run: `server/.venv/Scripts/python.exe -m pytest server/tests/test_automation_engine.py server/tests/test_integration_api.py -q`

- [ ] **Step 2: Run focused frontend proof under constrained workers**

Run: `npm test -- --pool=forks --maxWorkers=1 src/features/automations/services/automation.service.test.ts src/features/automations/components/AutomationCard.test.ts src/features/automations/components/AutomationTestDialog.test.ts`

- [ ] **Step 3: Run static checks**

Run: `npx tsc --noEmit`

Run: `npx eslint src/features/automations 'src/app/(dashboard)/automations/page.tsx'`

- [ ] **Step 4: Live validate the advanced work-hours count rule**

Send two accepted `phone_usage_observed` events for the same character within 30 minutes; confirm first is `occurrence_threshold_not_met`, second triggers once, immediate third is `cooldown_active`, and another character's event does not affect the count.

- [ ] **Step 5: Commit verification-only test updates**

```bash
git add server/tests client/src/features/automations
git commit -m "test: cover advanced automation rules"
```
