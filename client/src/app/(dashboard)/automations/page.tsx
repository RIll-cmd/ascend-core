"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCharacterStore } from "@/store/useCharacterStore";
import { fetchHabits } from "@/features/habits/services/habit.service";
import type { Habit } from "@/features/habits/types/habit";
import {
  deleteAutomation,
  listAutomations,
  updateAutomation,
  type AutomationRule,
} from "@/features/automations/services/automation.service";
import { AutomationCard } from "@/features/automations/components/AutomationCard";
import { AutomationEditorDialog } from "@/features/automations/components/AutomationEditorDialog";
import { AutomationTestDialog } from "@/features/automations/components/AutomationTestDialog";

export default function AutomationsPage() {
  const character = useCharacterStore((state) => state.character);
  const characterId =
    character?.id ||
    (typeof window !== "undefined"
      ? localStorage.getItem("ascend_character_id")
      : null) ||
    "char-id-123";
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorRule, setEditorRule] = useState<
    AutomationRule | null | undefined
  >(undefined);
  const [testRule, setTestRule] = useState<AutomationRule | null>(null);
  const [deleteRule, setDeleteRule] = useState<AutomationRule | null>(null);
  const [deleting, setDeleting] = useState(false);
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
  const negativeHabits = useMemo(
    () => habits.filter((habit) => habit.type === "NEGATIVE"),
    [habits]
  );
  const habitNames = useMemo(
    () => new Map(habits.map((habit) => [habit.id, habit.name])),
    [habits]
  );
  const saveRule = (saved: AutomationRule) =>
    setRules((current) =>
      current.some((rule) => rule.id === saved.id)
        ? current.map((rule) => (rule.id === saved.id ? saved : rule))
        : [saved, ...current]
    );
  const toggleRule = async (rule: AutomationRule) => {
    try {
      const saved = await updateAutomation(rule.id, { enabled: !rule.enabled });
      saveRule(saved);
      toast.success(`Automation ${saved.enabled ? "enabled" : "disabled"}.`);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Unable to update automation."
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
        cause instanceof Error ? cause.message : "Unable to delete automation."
      );
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="space-y-5 pb-12 font-pixel">
      <section className="relative overflow-hidden border-3 border-[#3b424c] bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_55%,#b0b8c4_100%)] p-5 text-[#1d2d2a] shadow-[4px_4px_0_0_#1d2d2a]">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center border-2 border-[#1d2d2a] bg-[#2f3640] text-amber-300 shadow-[inset_0_0_8px_rgba(0,0,0,.8)]">
              <Bot aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.16em] text-amber-800">
                System core
              </p>
              <h1 className="text-base font-bold uppercase tracking-wide">
                Automations
              </h1>
              <p className="mt-1 font-sans text-xs text-[#34414a]">
                Turn observations into deliberate, cooldown-protected habit
                logs.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditorRule(null)}
            className="automation-button bg-[#2f3640] text-amber-200 hover:bg-[#1d2d2a]"
          >
            <Plus aria-hidden="true" /> Create automation
          </button>
        </div>
      </section>
      {loading ? (
        <section className="automation-panel p-8 text-center font-mono text-sm text-slate-100">
          Loading automation rules…
        </section>
      ) : error ? (
        <section className="automation-panel p-8 text-center">
          <p role="alert" className="text-red-200">
            {error}
          </p>
          <button
            type="button"
            onClick={load}
            className="automation-button mt-4"
          >
            <RefreshCw aria-hidden="true" /> Retry
          </button>
        </section>
      ) : rules.length === 0 ? (
        <section className="automation-panel p-8 text-center">
          <Bot
            className="mx-auto h-10 w-10 text-amber-300"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-sm uppercase text-white">
            No automations yet
          </h2>
          <p className="mx-auto mt-2 max-w-md font-sans text-sm text-slate-200">
            Create a rule to log one of your negative habits when a supported
            observation arrives.
          </p>
          <button
            type="button"
            onClick={() => setEditorRule(null)}
            className="automation-button mt-5 bg-amber-500 text-[#1d2d2a] hover:bg-amber-300"
          >
            <Plus aria-hidden="true" /> Create automation
          </button>
        </section>
      ) : (
        <section aria-label="Automation rules" className="grid gap-4">
          {rules.map((rule) => (
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
      <AutomationEditorDialog
        key={`${characterId}:${editorRule?.id ?? (editorRule === null ? "new" : "closed")}`}
        open={editorRule !== undefined}
        rule={editorRule ?? null}
        characterId={characterId}
        negativeHabits={negativeHabits}
        onOpenChange={(open) => !open && setEditorRule(undefined)}
        onSaved={saveRule}
      />
      <AutomationTestDialog
        open={testRule !== null}
        rule={testRule}
        onOpenChange={(open) => !open && setTestRule(null)}
      />
      <Dialog
        open={deleteRule !== null}
        onOpenChange={(open) => !open && setDeleteRule(null)}
      >
        <DialogContent className="max-w-md border-2 border-red-800 bg-[#16101a] text-white">
          <DialogHeader>
            <DialogTitle className="font-pixel text-sm uppercase">
              Delete automation?
            </DialogTitle>
            <DialogDescription className="text-slate-200">
              Delete “{deleteRule?.name}”? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteRule(null)}
              className="automation-button"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void confirmDelete()}
              className="automation-button bg-red-700 text-white hover:bg-red-600"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
