"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  testAutomation,
  type AutomationRule,
  type TriggerType,
} from "../services/automation.service";

export const createTestObservation = (type: TriggerType) => ({
  source: "phone_cv" as const,
  type,
  timestamp: new Date().toISOString(),
  payload: { state: "started" },
});

export function AutomationTestDialog({
  open,
  rule,
  onOpenChange,
}: {
  open: boolean;
  rule: AutomationRule | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "matched" | "not-matched" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const run = async () => {
    if (!rule) return;
    setStatus("loading");
    try {
      const result = await testAutomation(
        rule.id,
        createTestObservation(rule.triggerType)
      );
      setStatus(result.matched ? "matched" : "not-matched");
      setMessage(
        result.matched
          ? "Rule matches this sample observation. No action was executed."
          : "Rule does not match this sample observation. No action was executed."
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The dry run could not be validated."
      );
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-2 border-[#4a5a63] bg-[#101722] text-slate-100">
        <DialogHeader>
          <DialogTitle className="font-pixel text-sm uppercase">
            Test automation
          </DialogTitle>
          <DialogDescription className="text-slate-200">
            This is a dry run. It never logs a bad habit or changes your
            character.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border border-slate-700 bg-[#080c13] p-3 text-xs">
            <span className="font-mono text-amber-300">Sample:</span>{" "}
            {rule
              ? `${getTriggerText(rule.triggerType)} from phone CV, state started.`
              : "No rule selected."}
          </div>
          {status !== "idle" && (
            <p
              role="status"
              className={`border p-3 text-sm ${status === "matched" ? "border-emerald-700 bg-emerald-950/50 text-emerald-200" : status === "error" ? "border-red-800 bg-red-950/50 text-red-200" : "border-amber-700 bg-amber-950/40 text-amber-100"}`}
            >
              {status === "loading" ? "Validating rule…" : message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="automation-button"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!rule || status === "loading"}
              onClick={run}
              className="automation-button bg-amber-500 text-[#1d2d2a] hover:bg-amber-300"
            >
              {status === "loading" ? "Testing…" : "Run dry test"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function getTriggerText(type: TriggerType) {
  return type.replaceAll("_", " ");
}
