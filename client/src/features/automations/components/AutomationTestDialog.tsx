"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/neo/dialog";
import { Button } from "@/components/ui/neo/button";
import { Badge } from "@/components/ui/neo/badge";
import {
  testAutomation,
  type AutomationRule,
  type TriggerType,
} from "../services/automation.service";
import {
  AlertCircle,
  Check,
  Loader2,
  Play,
  Shield,
  X,
} from "lucide-react";

/* ───────── test payload builder (exported for external test compat) ────── */
export const createTestObservation = (type: TriggerType) => ({
  source: "phone_cv" as const,
  type,
  timestamp: new Date().toISOString(),
  payload: { state: "started" },
});

/* ───────── condition result type ─────────────────────────────────────────── */
type ConditionResult = {
  matched: boolean;
  reason?: string;
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  COMPONENT                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

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
  const [conditionResults, setConditionResults] = useState<ConditionResult[]>(
    []
  );

  const run = async () => {
    if (!rule) return;
    setStatus("loading");
    setConditionResults([]);
    try {
      const result = await testAutomation(
        rule.id,
        createTestObservation(rule.triggerType)
      );
      setStatus(result.matched ? "matched" : "not-matched");
      setMessage(
        result.matched
          ? "Rule matches this sample observation."
          : `Rule does not match. ${result.reason ?? ""}`
      );
      setConditionResults(result.conditions ?? []);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The dry run could not be validated."
      );
    }
  };

  const observation = rule ? createTestObservation(rule.triggerType) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Test Automation</DialogTitle>
          <DialogDescription>
            Dry-run evaluation — no habit is logged and no character state
            changes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* ── Simulated observation ──────────────────────────────────── */}
          <div className="rounded-base border-2 border-border bg-secondary-background p-3">
            <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Play className="size-3" />
              Simulated Observation
            </div>
            {observation ? (
              <pre className="overflow-x-auto text-xs leading-relaxed text-foreground">
                {JSON.stringify(observation, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground">No rule selected.</p>
            )}
          </div>

          {/* ── Result banner ─────────────────────────────────────────── */}
          {status !== "idle" && status !== "loading" && (
            <div
              role="status"
              className={`flex items-start gap-2 rounded-base border-2 p-3 text-sm font-bold ${
                status === "matched"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : status === "error"
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-amber-500 bg-amber-500/10 text-amber-400"
              }`}
            >
              {status === "matched" ? (
                <Check className="mt-0.5 size-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          {/* ── Condition-by-condition breakdown ──────────────────────── */}
          {conditionResults.length > 0 && (
            <div className="grid gap-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Condition Evaluation
              </span>
              {conditionResults.map((cr, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-base border-2 border-border bg-card px-3 py-2 text-xs"
                >
                  {cr.matched ? (
                    <Badge variant="emerald" className="mt-0.5 shrink-0 px-1 py-0 text-[10px]">
                      <Check className="size-3" />
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="mt-0.5 shrink-0 px-1 py-0 text-[10px]">
                      <X className="size-3" />
                    </Badge>
                  )}
                  <span className="text-foreground">
                    Condition {i + 1}
                    {cr.reason && (
                      <span className="ml-1.5 text-muted-foreground">
                        — {cr.reason}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Safety banner ─────────────────────────────────────────── */}
          {status !== "idle" && (
            <div className="flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Shield className="size-3" />
              No action was executed. This was a dry run.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="neutral"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="amber"
            disabled={!rule || status === "loading"}
            onClick={run}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Testing…
              </>
            ) : (
              <>
                <Play className="size-4" />
                Run Dry Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
