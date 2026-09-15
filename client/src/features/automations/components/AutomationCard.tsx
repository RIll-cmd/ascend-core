"use client";

import {
  Activity,
  ArrowRight,
  Clock,
  MoreVertical,
  Pencil,
  Play,
  Smartphone,
  Trash2,
  Zap,
  Moon,
} from "lucide-react";
import type {
  AutomationCondition,
  AutomationRule,
  TriggerType,
} from "../services/automation.service";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Switch,
} from "@/components/ui/neo";

const triggerLabels: Record<TriggerType, string> = {
  phone_usage_observed: "Phone usage observed",
  drowsiness_observed: "Drowsiness observed",
  posture_observed: "Posture observed",
};

const triggerShortLabels: Record<TriggerType, string> = {
  phone_usage_observed: "PHONE USAGE",
  drowsiness_observed: "DROWSINESS",
  posture_observed: "POSTURE SLOUCH",
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

const operatorSymbols: Record<string, string> = {
  equals: "=",
  not_equals: "≠",
  greater_than: ">",
  greater_than_or_equal: "≥",
  less_than: "<",
  less_than_or_equal: "≤",
  contains: "CONTAINS",
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

const formatRelativeTime = (isoString?: string | null) => {
  if (!isoString) return "Never triggered";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (seconds < 60) return "Just triggered";
  if (seconds < 3600) return `Last triggered ${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `Last triggered ${Math.floor(seconds / 3600)}h ago`;
  return `Last triggered ${Math.floor(seconds / 86400)}d ago`;
};

const getTriggerIcon = (trigger: TriggerType) => {
  switch (trigger) {
    case "phone_usage_observed":
      return <Smartphone className="size-4 text-cyan-400" />;
    case "drowsiness_observed":
      return <Moon className="size-4 text-purple-400" />;
    case "posture_observed":
      return <Activity className="size-4 text-amber-400" />;
    default:
      return <Zap className="size-4 text-main" />;
  }
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
  const primaryFieldCondition = rule.conditions.find(
    (c): c is import("../services/automation.service").FieldCondition => "field" in c
  );
  const advancedConditions = rule.conditions.filter(
    (c): c is import("../services/automation.service").AdvancedAutomationCondition => "type" in c
  );

  return (
    <article
      className={`rounded-base border-2 border-border shadow-shadow transition-all ${
        rule.enabled ? "bg-card text-foreground" : "bg-card/60 opacity-80 text-muted-foreground"
      }`}
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-secondary-background/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="font-mono text-sm font-black uppercase tracking-wider text-foreground">
            {rule.name}
          </h2>
          <Badge
            variant={rule.enabled ? "emerald" : "neutral"}
            className="text-[10px] font-mono font-black tracking-wider"
          >
            {rule.enabled ? "● ENABLED" : "○ DISABLED"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <Clock className="size-3.5" />
          <span>{formatRelativeTime(rule.lastTriggeredAt)}</span>
        </div>
      </div>

      {/* Visual Logic Pipeline (WHEN → IF → THEN) */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1.4fr_auto_1.2fr] items-center gap-3 font-mono text-xs">
          {/* WHEN Box */}
          <div className="rounded-base border-2 border-border bg-secondary-background p-3 shadow-shadow space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                WHEN
              </span>
              {getTriggerIcon(rule.triggerType)}
            </div>
            <p className="font-bold text-foreground text-xs uppercase tracking-wide">
              {triggerShortLabels[rule.triggerType] || rule.triggerType}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {getTriggerLabel(rule.triggerType)}
            </p>
          </div>

          {/* Connector Arrow 1 */}
          <div className="hidden md:flex justify-center text-muted-foreground/60">
            <ArrowRight className="size-5" />
          </div>

          {/* IF Box (Conditions) */}
          <div className="rounded-base border-2 border-border bg-secondary-background p-3 shadow-shadow space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                IF
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground uppercase">
                {rule.matchMode === "all" ? "MATCH ALL" : "MATCH ANY"}
              </span>
            </div>

            {/* Primary Field Condition */}
            {primaryFieldCondition ? (
              <div className="inline-flex items-center gap-1.5 rounded-sm bg-card border border-border px-2 py-1 text-xs font-bold text-foreground">
                <span className="text-cyan-400">
                  {primaryFieldCondition.field.replace("payload.", "").toUpperCase()}
                </span>
                <span className="text-main">
                  {operatorSymbols[primaryFieldCondition.operator] || primaryFieldCondition.operator}
                </span>
                <span className="text-amber-300">
                  {String(primaryFieldCondition.value).toUpperCase()}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Always matches observation</span>
            )}

            {/* Advanced Conditions List */}
            {advancedConditions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {advancedConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] rounded-sm bg-muted/80 border border-border px-1.5 py-0.5 text-muted-foreground font-mono"
                  >
                    {cond.type === "time_window" && `⏰ ${cond.start}–${cond.end}`}
                    {cond.type === "occurrence_count" &&
                      `🔢 ${cond.count}x / ${Math.round(cond.windowSeconds / 60)}m`}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Connector Arrow 2 */}
          <div className="hidden md:flex justify-center text-muted-foreground/60">
            <ArrowRight className="size-5" />
          </div>

          {/* THEN Box (Action) */}
          <div className="rounded-base border-2 border-border bg-secondary-background p-3 shadow-shadow space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                THEN
              </span>
              <span className="text-[9px] font-bold text-destructive uppercase">
                BAD HABIT
              </span>
            </div>
            <p className="font-bold text-destructive uppercase text-xs">
              LOG BAD HABIT
            </p>
            <p className="font-bold text-foreground truncate text-xs bg-card border border-border px-2 py-1 rounded-sm">
              {habitName}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Controls & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-border bg-secondary-background/40 px-4 py-3">
        {/* Cooldown Badge */}
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="font-bold uppercase tracking-wider text-[10px]">COOLDOWN:</span>
          <Badge variant="amber" className="text-[11px] font-mono font-bold">
            {formatAutomationCooldown(rule.cooldownSeconds)}
          </Badge>
        </div>

        {/* Actions Cluster */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={onTest}
            className="text-xs font-mono uppercase h-8"
          >
            <Play className="size-3.5 mr-1 text-main fill-main/20" />
            TEST
          </Button>

          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={onEdit}
            className="text-xs font-mono uppercase h-8"
          >
            <Pencil className="size-3.5 mr-1" />
            EDIT
          </Button>

          {/* Enabled Switch */}
          <div className="flex items-center gap-2 pl-1 pr-1 border-l-2 border-border">
            <Switch
              checked={rule.enabled}
              onCheckedChange={onToggle}
              aria-label={`Toggle ${rule.name}`}
            />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline">
              {rule.enabled ? "ON" : "OFF"}
            </span>
          </div>

          {/* Overflow Menu with Delete */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="neutral"
                size="icon"
                className="size-8"
                aria-label="More options"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive font-mono text-xs uppercase font-bold focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
              >
                <Trash2 className="size-4 mr-2" />
                DELETE RULE
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
