import { Pencil, Play, Power, Trash2 } from "lucide-react";
import type {
  AutomationCondition,
  AutomationRule,
  TriggerType,
} from "../services/automation.service";

const triggerLabels: Record<TriggerType, string> = {
  phone_usage_observed: "Phone usage observed",
  posture_observed: "Posture observed",
  sleep_state_observed: "Sleep state observed",
};

const operatorLabels: Record<
  | "equals"
  | "not_equals"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal"
  | "contains",
  string
> = {
  equals: "is",
  not_equals: "is not",
  greater_than: "is greater than",
  greater_than_or_equal: "is at least",
  less_than: "is less than",
  less_than_or_equal: "is at most",
  contains: "contains",
};

export const getTriggerLabel = (trigger: TriggerType) => triggerLabels[trigger];
export const getActionLabel = (
  action: AutomationRule["actions"][number]["type"]
) => (action === "log_bad_habit" ? "Log bad habit" : action);
export const getConditionValueLabel = (condition: AutomationCondition) => {
  if ("type" in condition && condition.type === "time_window")
    return `Time is between ${condition.start} and ${condition.end}`;
  if ("type" in condition && condition.type === "occurrence_count")
    return `Observed ${condition.count} times within ${Math.round(condition.windowSeconds / 60)} minutes`;
  const field = condition.field.replace("payload.", "").replace("event.", "");
  return `${field.charAt(0).toUpperCase()}${field.slice(1)} ${operatorLabels[condition.operator]} ${String(condition.value)}`;
};
export const formatAutomationCooldown = (seconds: number) => {
  if (!seconds) return "No cooldown";
  if (seconds % 3600 === 0)
    return `${seconds / 3600} ${seconds === 3600 ? "hour" : "hours"}`;
  if (seconds % 60 === 0)
    return `${seconds / 60} ${seconds === 60 ? "minute" : "minutes"}`;
  return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
};

export function AutomationCard({
  rule,
  habitName,
  onEdit,
  onTest,
  onToggle,
  onDelete,
}: {
  rule: AutomationRule;
  habitName: string;
  onEdit: () => void;
  onTest: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={`border-2 p-4 shadow-[3px_3px_0_0_#1d2d2a] ${rule.enabled ? "border-[#4a5a63] bg-[#d1d6dc] text-[#1d2d2a]" : "border-slate-700 bg-slate-900/80 text-slate-200"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-amber-700">
            {getTriggerLabel(rule.triggerType)}
          </p>
          <h2 className="mt-1 font-pixel text-sm uppercase">{rule.name}</h2>
        </div>
        <span
          className={`border px-2 py-1 font-mono text-[10px] font-bold uppercase ${rule.enabled ? "border-emerald-700 bg-emerald-100 text-emerald-900" : "border-slate-600 bg-slate-800 text-white"}`}
        >
          {rule.enabled ? "Enabled" : "Disabled"}
        </span>
      </div>
      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[10px] uppercase opacity-60">
            Condition
          </dt>
          <dd className="mt-1 font-medium">
            {rule.matchMode.toUpperCase()}:{" "}
            {rule.conditions.length
              ? rule.conditions.map(getConditionValueLabel).join(" · ")
              : "Always"}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase opacity-60">Action</dt>
          <dd className="mt-1 font-medium">
            {getActionLabel(rule.actions[0].type)}: {habitName}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase opacity-60">
            Cooldown
          </dt>
          <dd className="mt-1 font-medium">
            {formatAutomationCooldown(rule.cooldownSeconds)}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-current/15 pt-3">
        <button type="button" onClick={onEdit} className="automation-button">
          <Pencil aria-hidden="true" /> Edit
        </button>
        <button type="button" onClick={onTest} className="automation-button">
          <Play aria-hidden="true" /> Test
        </button>
        <button type="button" onClick={onToggle} className="automation-button">
          <Power aria-hidden="true" /> {rule.enabled ? "Disable" : "Enable"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="automation-button border-red-800/60 text-red-700 hover:bg-red-900 hover:text-white"
        >
          <Trash2 aria-hidden="true" /> Delete
        </button>
      </div>
    </article>
  );
}
