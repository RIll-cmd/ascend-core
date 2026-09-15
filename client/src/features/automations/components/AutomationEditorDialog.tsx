"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/neo/dialog";
import { Button } from "@/components/ui/neo/button";
import { Input } from "@/components/ui/neo/input";
import { Label } from "@/components/ui/neo/label";
import { Badge } from "@/components/ui/neo/badge";
import { Switch } from "@/components/ui/neo/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/neo/select";
import {
  buildAutomationPayload,
  cooldownToSeconds,
  createAutomation,
  getAutomationCapabilities,
  getEligibleAutomationHabits,
  updateAutomation,
  type AdvancedAutomationCondition,
  type AutomationCapabilities,
  type AutomationDraft,
  type AutomationRule,
  type ConditionField,
  type ConditionOperator,
  type CooldownUnit,
  type EligibleHabit,
  type MatchMode,
  type TriggerType,
} from "../services/automation.service";
import type { Habit } from "@/features/habits/types/habit";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Hash,
  Loader2,
  Plus,
  Shield,
  Trash2,
  Zap,
} from "lucide-react";

/* ───────── fallback constants (used when capabilities API is unavailable) ── */
const FALLBACK_FIELDS: ConditionField[] = [
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
const FALLBACK_OPERATORS: ConditionOperator[] = [
  "equals",
  "not_equals",
  "greater_than",
  "greater_than_or_equal",
  "less_than",
  "less_than_or_equal",
  "contains",
];
const FALLBACK_TRIGGERS: TriggerType[] = [
  "phone_usage_observed",
  "drowsiness_observed",
  "posture_observed",
];
const NUMERIC_FIELDS: ConditionField[] = [
  "payload.confidence",
  "payload.ear",
  "payload.slouch_score",
];

/* ───────── initial draft builder ─────────────────────────────────────────── */
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

/* ───────── human-readable trigger label ──────────────────────────────────── */
function triggerLabel(t: TriggerType): string {
  const map: Record<TriggerType, string> = {
    phone_usage_observed: "📱 Phone Usage Observed",
    drowsiness_observed: "😴 Drowsiness Observed",
    posture_observed: "🧍 Posture Observed",
  };
  return map[t] ?? t.replaceAll("_", " ");
}

/* ───────── operator label ────────────────────────────────────────────────── */
function operatorLabel(o: ConditionOperator): string {
  return o.replaceAll("_", " ");
}

/* ───────── step section wrapper ──────────────────────────────────────────── */
function StepSection({
  step,
  label,
  icon,
  children,
}: {
  step: number;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3 rounded-base border-2 border-border bg-secondary-background p-4">
      <div className="flex items-center gap-2">
        <Badge variant="default" className="h-6 w-6 justify-center p-0 text-xs font-black">
          {step}
        </Badge>
        <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-foreground">
          {icon}
          {label}
        </span>
      </div>
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

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
  /* ── local state ──────────────────────────────────────────────────────── */
  const [draft, setDraft] = useState(() => initialDraft(characterId, rule));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* ── capabilities + eligible habits (loaded once on dialog open) ─────── */
  const [capabilities, setCapabilities] = useState<AutomationCapabilities | null>(null);
  const [eligibleHabits, setEligibleHabits] = useState<EligibleHabit[] | null>(null);
  const [capsLoading, setCapsLoading] = useState(false);

  /* Reset draft when rule/open changes */
  useEffect(() => {
    if (open) {
      setDraft(initialDraft(characterId, rule));
      setError("");
    }
  }, [open, rule, characterId]);

  /* Fetch capabilities and eligible habits */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setCapsLoading(true);
    Promise.allSettled([
      getAutomationCapabilities(),
      getEligibleAutomationHabits(characterId),
    ]).then(([capsResult, habitsResult]) => {
      if (cancelled) return;
      if (capsResult.status === "fulfilled") setCapabilities(capsResult.value);
      if (habitsResult.status === "fulfilled") setEligibleHabits(habitsResult.value);
      setCapsLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, characterId]);

  /* ── derived values ───────────────────────────────────────────────────── */
  const triggers = capabilities?.triggers ?? FALLBACK_TRIGGERS;
  const fields = capabilities?.fields ?? FALLBACK_FIELDS;
  const allOperators = capabilities?.operators ?? FALLBACK_OPERATORS;
  const fieldConstraints = capabilities?.fieldOperatorConstraints;

  // Get operators valid for the currently selected field
  const operatorsForField = (field: ConditionField): ConditionOperator[] => {
    if (fieldConstraints) {
      const constraint = fieldConstraints.find((c) => c.field === field);
      if (constraint) return constraint.operators;
    }
    return allOperators;
  };

  // Habits list: prefer eligible-habits API, fallback to negativeHabits prop
  const habitOptions: { id: string; name: string }[] =
    eligibleHabits ?? negativeHabits.map((h) => ({ id: h.id, name: h.name }));

  const maxConditions = capabilities?.limits?.maxConditions ?? 10;
  const advancedCount = (draft.conditions ?? []).length;

  /* ── helpers ──────────────────────────────────────────────────────────── */
  const setAdvancedConditions = (conditions: AdvancedAutomationCondition[]) =>
    setDraft({ ...draft, conditions });

  /* ── save handler ─────────────────────────────────────────────────────── */
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const cooldown = cooldownToSeconds(draft.cooldownAmount, draft.cooldownUnit);
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

  /* ═══════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                                */
  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rule ? "Edit Automation" : "Create Automation"}
          </DialogTitle>
          <DialogDescription>
            Define an observe → evaluate → act rule. Action type: log bad habit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={save} className="grid gap-4">
          {/* ── Name field ─────────────────────────────────────────────── */}
          <div className="grid gap-1.5">
            <Label htmlFor="auto-name">Name</Label>
            <Input
              id="auto-name"
              required
              maxLength={120}
              placeholder="e.g. Stop doomscrolling while working"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>

          {/* ── STEP 1 — WHEN ──────────────────────────────────────────── */}
          <StepSection step={1} label="When" icon={<Zap className="size-3.5" />}>
            <div className="grid gap-1.5">
              <Label htmlFor="auto-trigger">Trigger event</Label>
              <Select
                value={draft.triggerType}
                onValueChange={(value) =>
                  setDraft({ ...draft, triggerType: value as TriggerType })
                }
              >
                <SelectTrigger id="auto-trigger">
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  {triggers.map((t) => (
                    <SelectItem key={t} value={t}>
                      {triggerLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </StepSection>

          {/* ── STEP 2 — CONDITIONS ────────────────────────────────────── */}
          <StepSection
            step={2}
            label="Conditions"
            icon={<ArrowRight className="size-3.5" />}
          >
            {/* Match mode */}
            <div className="flex flex-wrap items-center gap-3">
              <Label htmlFor="auto-matchmode" className="shrink-0">Match mode</Label>
              <Select
                value={draft.matchMode ?? "all"}
                onValueChange={(value) =>
                  setDraft({ ...draft, matchMode: value as MatchMode })
                }
              >
                <SelectTrigger id="auto-matchmode" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All conditions</SelectItem>
                  <SelectItem value="any">Any condition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Primary condition */}
            <div className="grid gap-2 rounded-base border-2 border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Badge variant="neutral" className="text-[10px]">PRIMARY</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="auto-cond-field">Field</Label>
                  <Select
                    value={draft.condition.field}
                    onValueChange={(value) =>
                      setDraft({
                        ...draft,
                        condition: {
                          ...draft.condition,
                          field: value as ConditionField,
                          // reset operator if not valid for new field
                          operator: operatorsForField(value as ConditionField).includes(
                            draft.condition.operator
                          )
                            ? draft.condition.operator
                            : operatorsForField(value as ConditionField)[0],
                        },
                      })
                    }
                  >
                    <SelectTrigger id="auto-cond-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="auto-cond-op">Operator</Label>
                  <Select
                    value={draft.condition.operator}
                    onValueChange={(value) =>
                      setDraft({
                        ...draft,
                        condition: {
                          ...draft.condition,
                          operator: value as ConditionOperator,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="auto-cond-op">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorsForField(draft.condition.field).map((op) => (
                        <SelectItem key={op} value={op}>
                          {operatorLabel(op)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="auto-cond-val">Value</Label>
                  <Input
                    id="auto-cond-val"
                    required
                    type={NUMERIC_FIELDS.includes(draft.condition.field) ? "number" : "text"}
                    step={NUMERIC_FIELDS.includes(draft.condition.field) ? "any" : undefined}
                    value={String(draft.condition.value ?? "")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        condition: {
                          ...draft.condition,
                          value: NUMERIC_FIELDS.includes(draft.condition.field)
                            ? Number(e.target.value)
                            : e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Advanced conditions */}
            {(draft.conditions ?? []).map((condition, index) => (
              <div
                key={`${condition.type}-${index}`}
                className="grid gap-2 rounded-base border-2 border-border bg-card p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="neutral" className="text-[10px]">
                    {condition.type === "time_window" ? (
                      <><Clock className="mr-1 size-3" />TIME WINDOW</>
                    ) : (
                      <><Hash className="mr-1 size-3" />OCCURRENCE</>
                    )}
                  </Badge>
                  <Button
                    type="button"
                    variant="neutral"
                    size="icon-xs"
                    onClick={() =>
                      setAdvancedConditions(
                        (draft.conditions ?? []).filter((_, i) => i !== index)
                      )
                    }
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                {condition.type === "time_window" ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label>Start time</Label>
                      <Input
                        type="time"
                        value={condition.start}
                        onChange={(e) =>
                          setAdvancedConditions(
                            (draft.conditions ?? []).map((item, i) =>
                              i === index
                                ? { ...condition, start: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>End time</Label>
                      <Input
                        type="time"
                        value={condition.end}
                        onChange={(e) =>
                          setAdvancedConditions(
                            (draft.conditions ?? []).map((item, i) =>
                              i === index
                                ? { ...condition, end: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label>Occurrences</Label>
                      <Input
                        type="number"
                        min="1"
                        value={condition.count}
                        onChange={(e) =>
                          setAdvancedConditions(
                            (draft.conditions ?? []).map((item, i) =>
                              i === index
                                ? { ...condition, count: Number(e.target.value) }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Window (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={condition.windowSeconds / 60}
                        onChange={(e) =>
                          setAdvancedConditions(
                            (draft.conditions ?? []).map((item, i) =>
                              i === index
                                ? {
                                    ...condition,
                                    windowSeconds: Number(e.target.value) * 60,
                                  }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add condition buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="neutral"
                size="sm"
                disabled={advancedCount + 1 >= maxConditions}
                onClick={() =>
                  setAdvancedConditions([
                    ...(draft.conditions ?? []),
                    { type: "time_window", start: "09:00", end: "17:00" },
                  ])
                }
              >
                <Plus className="size-3" />
                Add Time Window
              </Button>
              <Button
                type="button"
                variant="neutral"
                size="sm"
                disabled={advancedCount + 1 >= maxConditions}
                onClick={() =>
                  setAdvancedConditions([
                    ...(draft.conditions ?? []),
                    { type: "occurrence_count", count: 2, windowSeconds: 1800 },
                  ])
                }
              >
                <Plus className="size-3" />
                Add Occurrence Rule
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Duration rules are unavailable until observations include paired
              started/ended events with a shared session identifier.
            </p>
          </StepSection>

          {/* ── STEP 3 — THEN ──────────────────────────────────────────── */}
          <StepSection
            step={3}
            label="Then"
            icon={<ArrowRight className="size-3.5" />}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="auto-habit">Bad habit target</Label>
              {capsLoading ? (
                <div className="flex h-10 items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading habits…
                </div>
              ) : (
                <Select
                  value={draft.habitId}
                  onValueChange={(value) =>
                    setDraft({ ...draft, habitId: value })
                  }
                >
                  <SelectTrigger id="auto-habit">
                    <SelectValue placeholder="Select a negative habit" />
                  </SelectTrigger>
                  <SelectContent>
                    {habitOptions.map((habit) => (
                      <SelectItem key={habit.id} value={habit.id}>
                        {habit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </StepSection>

          {/* ── STEP 4 — SAFETY ────────────────────────────────────────── */}
          <StepSection
            step={4}
            label="Safety"
            icon={<Shield className="size-3.5" />}
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div className="grid gap-1.5">
                <Label htmlFor="auto-cd-amount">Cooldown amount</Label>
                <Input
                  id="auto-cd-amount"
                  type="number"
                  min="0"
                  step="1"
                  value={draft.cooldownAmount}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      cooldownAmount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="auto-cd-unit">Cooldown unit</Label>
                <Select
                  value={draft.cooldownUnit}
                  onValueChange={(value) =>
                    setDraft({
                      ...draft,
                      cooldownUnit: value as CooldownUnit,
                    })
                  }
                >
                  <SelectTrigger id="auto-cd-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <Label htmlFor="auto-enabled">Enabled</Label>
                <Switch
                  id="auto-enabled"
                  checked={draft.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({ ...draft, enabled: checked })
                  }
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Cooldown prevents this rule from firing again within the specified
              duration after it last matched. Keep enabled to activate the rule
              immediately.
            </p>
          </StepSection>

          {/* ── Warnings ───────────────────────────────────────────────── */}
          {habitOptions.length === 0 && !capsLoading && (
            <div className="flex items-start gap-2 rounded-base border-2 border-amber-500 bg-amber-500/10 p-3 text-xs text-foreground">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <span>
                Create a negative habit before creating an automation rule.
              </span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-base border-2 border-red-500 bg-red-500/10 p-3 text-sm text-foreground"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Footer actions ─────────────────────────────────────────── */}
          <DialogFooter>
            <Button
              type="button"
              variant="neutral"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="amber"
              disabled={saving || habitOptions.length === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : rule ? (
                "Save Changes"
              ) : (
                "Create Automation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
