"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildAutomationPayload,
  cooldownToSeconds,
  createAutomation,
  updateAutomation,
  type AutomationDraft,
  type AdvancedAutomationCondition,
  type AutomationRule,
  type ConditionField,
  type ConditionOperator,
  type CooldownUnit,
  type TriggerType,
} from "../services/automation.service";
import type { Habit } from "@/features/habits/types/habit";

const fields: ConditionField[] = [
  "event.type",
  "event.source",
  "event.timestamp",
  "payload.confidence",
  "payload.posture",
  "payload.state",
  "payload.detector",
  "payload.ear",
  "payload.slouch_score",
];
const operators: ConditionOperator[] = [
  "equals",
  "not_equals",
  "greater_than",
  "greater_than_or_equal",
  "less_than",
  "less_than_or_equal",
  "contains",
];
const triggers: TriggerType[] = [
  "phone_usage_observed",
  "drowsiness_observed",
  "posture_observed",
];
const initialDraft = (
  characterId: string,
  rule?: AutomationRule | null
): AutomationDraft => ({
  characterId,
  name: rule?.name ?? "",
  enabled: rule?.enabled ?? true,
  triggerType: rule?.triggerType ?? "phone_usage_observed",
  condition: rule?.conditions.find(
    (
      condition
    ): condition is import("../services/automation.service").FieldCondition =>
      "field" in condition
  ) ?? {
    field: "payload.state",
    operator: "equals",
    value: "started",
  },
  conditions: rule?.conditions.filter(
    (condition): condition is AdvancedAutomationCondition => "type" in condition
  ),
  matchMode: rule?.matchMode ?? "all",
  habitId: rule?.actions[0]?.habitId ?? "",
  cooldownAmount: rule ? rule.cooldownSeconds / 60 : 30,
  cooldownUnit: "minutes",
});

export function AutomationEditorDialog({
  open,
  rule,
  characterId,
  negativeHabits,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  rule: AutomationRule | null;
  characterId: string;
  negativeHabits: Habit[];
  onOpenChange: (open: boolean) => void;
  onSaved: (rule: AutomationRule) => void;
}) {
  const [draft, setDraft] = useState(() => initialDraft(characterId, rule));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const setAdvancedConditions = (conditions: AdvancedAutomationCondition[]) =>
    setDraft({ ...draft, conditions });
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const cooldown = cooldownToSeconds(
      draft.cooldownAmount,
      draft.cooldownUnit
    );
    if (!draft.name.trim() || !draft.habitId)
      return setError("Name and a bad habit target are required.");
    if (
      !Number.isFinite(draft.cooldownAmount) ||
      draft.cooldownAmount < 0 ||
      cooldown > 31_536_000
    )
      return setError("Enter a cooldown from 0 to 365 days.");
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...buildAutomationPayload(draft),
        conditions: [draft.condition, ...(draft.conditions ?? [])],
      };
      const saved = rule
        ? await updateAutomation(rule.id, {
            name: payload.name,
            enabled: payload.enabled,
            triggerType: payload.triggerType,
            matchMode: payload.matchMode,
            conditions: payload.conditions,
            actions: [{ type: "log_bad_habit", habitId: draft.habitId }],
            cooldownSeconds: payload.cooldownSeconds,
          })
        : await createAutomation(draft);
      onSaved(saved);
      toast.success(rule ? "Automation updated." : "Automation created.");
      onOpenChange(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save automation."
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-2 border-[#4a5a63] bg-[#101722] text-slate-100">
        <DialogHeader>
          <DialogTitle className="font-pixel text-sm uppercase">
            {rule ? "Edit automation" : "Create automation"}
          </DialogTitle>
          <DialogDescription className="text-slate-200">
            When the condition matches, the selected bad habit is logged. Action
            type: log bad habit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-4 text-sm">
          <label className="automation-field">
            Name
            <input
              required
              value={draft.name}
              maxLength={120}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="automation-field">
              Trigger
              <select
                value={draft.triggerType}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    triggerType: e.target.value as TriggerType,
                  })
                }
              >
                {triggers.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="automation-field">
              Bad habit target
              <select
                required
                value={draft.habitId}
                onChange={(e) =>
                  setDraft({ ...draft, habitId: e.target.value })
                }
              >
                <option value="">Select a negative habit</option>
                {negativeHabits.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="automation-field">
              Condition field
              <select
                value={draft.condition.field}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    condition: {
                      ...draft.condition,
                      field: e.target.value as ConditionField,
                    },
                  })
                }
              >
                {fields.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="automation-field">
              Operator
              <select
                value={draft.condition.operator}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    condition: {
                      ...draft.condition,
                      operator: e.target.value as ConditionOperator,
                    },
                  })
                }
              >
                {operators.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="automation-field">
              Condition value
              <input
                required
                value={String(draft.condition.value ?? "")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    condition: {
                      ...draft.condition,
                      value:
                        [
                          "payload.confidence",
                          "payload.ear",
                          "payload.slouch_score",
                        ].includes(draft.condition.field)
                          ? Number(e.target.value)
                          : e.target.value,
                    },
                  })
                }
              />
            </label>
          </div>
          <section className="grid gap-3 border border-slate-700 bg-[#080c13] p-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <label className="automation-field max-w-48">
                Condition match mode
                <select
                  value={draft.matchMode ?? "all"}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      matchMode: event.target.value as "all" | "any",
                    })
                  }
                >
                  <option value="all">All conditions</option>
                  <option value="any">Any condition</option>
                </select>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="automation-button"
                  onClick={() =>
                    setAdvancedConditions([
                      ...(draft.conditions ?? []),
                      { type: "time_window", start: "09:00", end: "17:00" },
                    ])
                  }
                >
                  Add time window
                </button>
                <button
                  type="button"
                  className="automation-button"
                  onClick={() =>
                    setAdvancedConditions([
                      ...(draft.conditions ?? []),
                      {
                        type: "occurrence_count",
                        count: 2,
                        windowSeconds: 1800,
                      },
                    ])
                  }
                >
                  Add occurrence count
                </button>
              </div>
            </div>
            {(draft.conditions ?? []).map((condition, index) => (
              <div
                key={`${condition.type}-${index}`}
                className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
              >
                {condition.type === "time_window" ? (
                  <>
                    <label className="automation-field">
                      Start
                      <input
                        type="time"
                        value={condition.start}
                        onChange={(event) =>
                          setAdvancedConditions(
                            (draft.conditions ?? []).map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...condition, start: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className="automation-field">
                      End
                      <input
                        type="time"
                        value={condition.end}
                        onChange={(event) =>
                          setAdvancedConditions(
                            (draft.conditions ?? []).map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...condition, end: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="automation-field">
                      Occurrences
                      <input
                        type="number"
                        min="1"
                        value={condition.count}
                        onChange={(event) =>
                          setAdvancedConditions(
                            (draft.conditions ?? []).map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...condition,
                                    count: Number(event.target.value),
                                  }
                                : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className="automation-field">
                      Window minutes
                      <input
                        type="number"
                        min="1"
                        value={condition.windowSeconds / 60}
                        onChange={(event) =>
                          setAdvancedConditions(
                            (draft.conditions ?? []).map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...condition,
                                    windowSeconds:
                                      Number(event.target.value) * 60,
                                  }
                                : item
                            )
                          )
                        }
                      />
                    </label>
                  </>
                )}
                <button
                  type="button"
                  className="automation-button self-end"
                  onClick={() =>
                    setAdvancedConditions(
                      (draft.conditions ?? []).filter(
                        (_, itemIndex) => itemIndex !== index
                      )
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <p className="font-sans text-xs text-slate-200">
              Duration rules are unavailable until observations include paired
              started/ended events with a shared session identifier.
            </p>
          </section>
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <label className="automation-field">
              Cooldown amount
              <input
                type="number"
                min="0"
                step="1"
                value={draft.cooldownAmount}
                onChange={(e) =>
                  setDraft({ ...draft, cooldownAmount: Number(e.target.value) })
                }
              />
            </label>
            <label className="automation-field">
              Cooldown unit
              <select
                value={draft.cooldownUnit}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    cooldownUnit: e.target.value as CooldownUnit,
                  })
                }
              >
                {(["seconds", "minutes", "hours"] as CooldownUnit[]).map(
                  (value) => (
                    <option key={value}>{value}</option>
                  )
                )}
              </select>
            </label>
            <label className="flex items-end gap-2 pb-2 font-mono text-xs uppercase text-slate-300">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(e) =>
                  setDraft({ ...draft, enabled: e.target.checked })
                }
              />{" "}
              Enabled
            </label>
          </div>
          {negativeHabits.length === 0 && (
            <p className="border border-amber-700 bg-amber-950/40 p-3 text-xs text-amber-100">
              Create a negative habit before creating an automation.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="border border-red-800 bg-red-950/50 p-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="automation-button"
            >
              Cancel
            </button>
            <button
              disabled={saving || negativeHabits.length === 0}
              className="automation-button bg-amber-500 text-[#1d2d2a] hover:bg-amber-300"
            >
              {saving ? "Saving…" : rule ? "Save changes" : "Create automation"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
