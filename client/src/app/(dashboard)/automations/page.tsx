"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, Loader2, Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useCharacterStore } from "@/store/useCharacterStore";
import { fetchHabits } from "@/features/habits/services/habit.service";
import type { Habit } from "@/features/habits/types/habit";
import {
  deleteAutomation,
  listAutomations,
  updateAutomation,
  type AutomationRule,
  type TriggerType,
} from "@/features/automations/services/automation.service";
import { AutomationCard } from "@/features/automations/components/AutomationCard";
import { AutomationEditorDialog } from "@/features/automations/components/AutomationEditorDialog";
import { AutomationTestDialog } from "@/features/automations/components/AutomationTestDialog";
import { VisionConnectionPanel } from "@/features/automations/components/VisionConnectionPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/neo/alert-dialog";
import { Badge } from "@/components/ui/neo/badge";
import { Button } from "@/components/ui/neo/button";
import { Input } from "@/components/ui/neo/input";
import { Skeleton } from "@/components/ui/neo/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/neo/select";

/* ───────── filter / sort types ───────────────────────────────────────────── */
type StatusFilter = "all" | "active" | "disabled";
type TriggerFilter = "all" | TriggerType;
type SortMode = "recent" | "newest" | "name" | "never" | "enabled";

const TRIGGER_LABELS: Record<TriggerType, string> = {
  phone_usage_observed: "Phone usage",
  drowsiness_observed: "Drowsiness",
  posture_observed: "Posture",
};

const SORT_LABELS: Record<SortMode, string> = {
  recent: "Recently triggered",
  newest: "Newest first",
  name: "Name A → Z",
  never: "Never triggered",
  enabled: "Enabled first",
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PAGE                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function AutomationsPage() {
  const character = useCharacterStore((state) => state.character);
  const characterId =
    character?.id ||
    (typeof window !== "undefined"
      ? localStorage.getItem("ascend_character_id")
      : null) ||
    "char-id-123";

  /* ── core state ──────────────────────────────────────────────────────── */
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ── dialog state ────────────────────────────────────────────────────── */
  const [editorRule, setEditorRule] = useState<
    AutomationRule | null | undefined
  >(undefined);
  const [testRule, setTestRule] = useState<AutomationRule | null>(null);
  const [deleteRule, setDeleteRule] = useState<AutomationRule | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── filter / sort state ─────────────────────────────────────────────── */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [triggerFilter, setTriggerFilter] = useState<TriggerFilter>("all");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  /* ── data loading ────────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextRules, nextHabits] = await Promise.all([
        listAutomations(characterId),
        fetchHabits(characterId),
      ]);
      setRules(nextRules);
      setHabits(nextHabits);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load automations."
      );
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  /* ── derived data ────────────────────────────────────────────────────── */
  const negativeHabits = useMemo(
    () => habits.filter((habit) => habit.type === "NEGATIVE"),
    [habits]
  );
  const habitNames = useMemo(
    () => new Map(habits.map((habit) => [habit.id, habit.name])),
    [habits]
  );

  // Telemetry counts
  const totalCount = rules.length;
  const activeCount = rules.filter((r) => r.enabled).length;
  const disabledCount = totalCount - activeCount;
  const triggerTypes = useMemo(
    () => [...new Set(rules.map((r) => r.triggerType))],
    [rules]
  );

  // Filtered + sorted rules
  const filteredRules = useMemo(() => {
    let result = [...rules];

    // Status filter
    if (statusFilter === "active") result = result.filter((r) => r.enabled);
    else if (statusFilter === "disabled")
      result = result.filter((r) => !r.enabled);

    // Trigger filter
    if (triggerFilter !== "all")
      result = result.filter((r) => r.triggerType === triggerFilter);

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.triggerType.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortMode) {
        case "recent": {
          const aTime = a.lastTriggeredAt
            ? new Date(a.lastTriggeredAt).getTime()
            : 0;
          const bTime = b.lastTriggeredAt
            ? new Date(b.lastTriggeredAt).getTime()
            : 0;
          return bTime - aTime;
        }
        case "newest":
          return b.id.localeCompare(a.id);
        case "name":
          return a.name.localeCompare(b.name);
        case "never":
          return (a.lastTriggeredAt ? 1 : 0) - (b.lastTriggeredAt ? 1 : 0);
        case "enabled":
          return (b.enabled ? 1 : 0) - (a.enabled ? 1 : 0);
        default:
          return 0;
      }
    });

    return result;
  }, [rules, statusFilter, triggerFilter, search, sortMode]);

  /* ── rule CRUD helpers ───────────────────────────────────────────────── */
  const saveRule = (saved: AutomationRule) =>
    setRules((current) =>
      current.some((rule) => rule.id === saved.id)
        ? current.map((rule) => (rule.id === saved.id ? saved : rule))
        : [saved, ...current]
    );

  const toggleRule = async (rule: AutomationRule) => {
    try {
      const saved = await updateAutomation(rule.id, {
        enabled: !rule.enabled,
      });
      saveRule(saved);
      toast.success(`Automation ${saved.enabled ? "enabled" : "disabled"}.`);
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : "Unable to update automation."
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteRule) return;
    setDeleting(true);
    try {
      await deleteAutomation(deleteRule.id);
      setRules((current) =>
        current.filter((rule) => rule.id !== deleteRule.id)
      );
      toast.success("Automation deleted.");
      setDeleteRule(null);
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : "Unable to delete automation."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                                */
  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="automations-neo-theme relative space-y-5 pb-12">
      {/* Neo grid background — covers entire automations viewport */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/backgrounds/automations-neo-grid.jpg')",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          opacity: 0.06,
        }}
      />
      <div className="relative z-10 space-y-5">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <section className="rounded-base border-2 border-border bg-card p-5 shadow-shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-base border-2 border-border bg-main text-main-foreground shadow-shadow">
              <Bot aria-hidden="true" className="size-6" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">
                System Module
              </p>
              <h1 className="font-mono text-base font-black uppercase tracking-wider text-foreground">
                Automation Control Center
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Observe → evaluate → act automatically
              </p>
            </div>
          </div>
          <Button
            variant="amber"
            onClick={() => setEditorRule(null)}
          >
            <Plus className="size-4" />
            Create Rule
          </Button>
        </div>
      </section>

      {/* ── Vision Connection ──────────────────────────────────────────── */}
      <VisionConnectionPanel characterId={characterId} />

      {/* ── Telemetry Bar ──────────────────────────────────────────────── */}
      {!loading && !error && totalCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" className="font-mono text-[10px]">
            TOTAL {totalCount}
          </Badge>
          <Badge variant="emerald" className="font-mono text-[10px]">
            ACTIVE {activeCount}
          </Badge>
          {disabledCount > 0 && (
            <Badge variant="neutral" className="font-mono text-[10px]">
              DISABLED {disabledCount}
            </Badge>
          )}
          <Badge variant="amber" className="font-mono text-[10px]">
            {triggerTypes.length} TYPE{triggerTypes.length !== 1 ? "S" : ""}
          </Badge>
        </div>
      )}

      {/* ── Search & Filters ───────────────────────────────────────────── */}
      {!loading && !error && totalCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status tabs */}
          <div className="flex gap-1">
            {(
              [
                ["all", `All (${totalCount})`],
                ["active", `Active (${activeCount})`],
                ["disabled", `Disabled (${disabledCount})`],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                variant={statusFilter === value ? "default" : "neutral"}
                size="sm"
                className="font-mono text-[10px] uppercase tracking-wider"
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Search + Trigger filter + Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search automations…"
                className="h-8 w-48 pl-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={triggerFilter}
              onValueChange={(v) => setTriggerFilter(v as TriggerFilter)}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SlidersHorizontal className="mr-1.5 size-3" />
                <SelectValue placeholder="All triggers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All triggers</SelectItem>
                {triggerTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TRIGGER_LABELS[t] ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sortMode}
              onValueChange={(v) => setSortMode(v as SortMode)}
            >
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* ── Content Area ───────────────────────────────────────────────── */}
      {loading ? (
        <section className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </section>
      ) : error ? (
        <section className="rounded-base border-2 border-border bg-card p-8 text-center shadow-shadow">
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
          <Button
            variant="neutral"
            className="mt-4"
            onClick={load}
          >
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </section>
      ) : filteredRules.length === 0 && totalCount > 0 ? (
        /* Filtered empty state */
        <section className="rounded-base border-2 border-border bg-card p-8 text-center shadow-shadow">
          <Search
            className="mx-auto size-10 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="mt-3 font-mono text-sm font-bold uppercase tracking-wider text-foreground">
            No matching rules
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Try adjusting your search or filters to find the automation you're
            looking for.
          </p>
          <Button
            variant="neutral"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setTriggerFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </section>
      ) : rules.length === 0 ? (
        /* Empty state — no rules at all */
        <section className="rounded-base border-2 border-border bg-card p-8 text-center shadow-shadow">
          <Bot
            className="mx-auto size-10 text-main"
            aria-hidden="true"
          />
          <h2 className="mt-3 font-mono text-sm font-bold uppercase tracking-wider text-foreground">
            No Automations Yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Create a rule to log one of your negative habits when a supported
            observation arrives from Ascend Vision.
          </p>
          <Button
            variant="amber"
            className="mt-5"
            onClick={() => setEditorRule(null)}
          >
            <Plus className="size-4" />
            Create Automation
          </Button>
        </section>
      ) : (
        /* Rule list */
        <section aria-label="Automation rules" className="grid gap-4">
          {filteredRules.map((rule) => (
            <AutomationCard
              key={rule.id}
              rule={rule}
              habitName={
                habitNames.get(rule.actions[0]?.habitId) ?? "Deleted habit"
              }
              onEdit={() => setEditorRule(rule)}
              onTest={() => setTestRule(rule)}
              onToggle={() => void toggleRule(rule)}
              onDelete={() => setDeleteRule(rule)}
            />
          ))}
        </section>
      )}

      {/* ── Editor Dialog ──────────────────────────────────────────────── */}
      <AutomationEditorDialog
        key={`${characterId}:${editorRule?.id ?? (editorRule === null ? "new" : "closed")}`}
        open={editorRule !== undefined}
        rule={editorRule ?? null}
        characterId={characterId}
        negativeHabits={negativeHabits}
        onOpenChange={(open) => !open && setEditorRule(undefined)}
        onSaved={saveRule}
      />

      {/* ── Test Dialog ────────────────────────────────────────────────── */}
      <AutomationTestDialog
        open={testRule !== null}
        rule={testRule}
        onOpenChange={(open) => !open && setTestRule(null)}
      />

      {/* ── Delete Confirmation (AlertDialog) ──────────────────────────── */}
      <AlertDialog
        open={deleteRule !== null}
        onOpenChange={(open) => !open && setDeleteRule(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete &ldquo;{deleteRule?.name}&rdquo;? This cannot
              be undone. The rule will stop evaluating immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>{/* end z-10 content wrapper */}
    </div>
  );
}
