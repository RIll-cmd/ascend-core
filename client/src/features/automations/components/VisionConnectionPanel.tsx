"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Radio, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/constants";
import {
  getVisionStatus,
  type VisionConnectionStatus,
} from "../services/automation.service";
import { Badge, Button } from "@/components/ui/neo";

type PanelState =
  | { kind: "loading" }
  | { kind: "ready"; status: VisionConnectionStatus }
  | { kind: "error" };

const relativeTime = (value: string | null) => {
  if (!value) return "Never";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
};

function CopyField({ label, value }: { label: string; value: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard.`);
  };

  return (
    <div className="flex flex-col gap-1 rounded-base border-2 border-border bg-secondary-background p-2 shadow-shadow">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center justify-between gap-2">
        <code className="truncate font-mono text-xs text-foreground">{value}</code>
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-base border-2 border-border bg-card p-1 text-muted-foreground transition-all hover:bg-main hover:text-main-foreground"
          aria-label={`Copy ${label}`}
        >
          <Copy className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function VisionConnectionPanel({ characterId }: { characterId: string }) {
  const [state, setState] = useState<PanelState>({ kind: "loading" });
  const [detailsOpen, setDetailsOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await getVisionStatus(characterId);
      setState({ kind: "ready", status: res });
    } catch {
      setState({ kind: "error" });
    }
  }, [characterId]);

  useEffect(() => {
    const initialFetch = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 10_000);
    return () => {
      window.clearTimeout(initialFetch);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const status = state.kind === "ready" ? state.status : null;
  const connected = status?.status === "CONNECTED";
  const unavailable = state.kind === "error";
  const deviceId = status?.deviceId ?? "ascend-vision";
  const authorizationStatus = unavailable
    ? "Unable to verify"
    : connected
      ? "Authenticated"
      : "Awaiting authenticated heartbeat";

  return (
    <section
      aria-label="Ascend Vision Connection Status"
      className="rounded-base border-2 border-border bg-card shadow-shadow transition-all"
    >
      {/* Compact Status Module Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-foreground">
            <Radio
              className={`size-4 ${
                connected ? "text-emerald-500 animate-pulse" : "text-amber-500"
              }`}
              aria-hidden="true"
            />
            <span>ASCEND VISION</span>
          </div>

          <Badge
            variant={connected ? "emerald" : unavailable ? "destructive" : "amber"}
            className="text-[10px] font-mono font-black tracking-wider"
          >
            {unavailable
              ? "CORE UNREACHABLE"
              : state.kind === "loading"
                ? "CHECKING"
                : status?.status ?? "OFFLINE"}
          </Badge>

          <span className="hidden sm:inline font-mono text-xs text-muted-foreground">
            {deviceId} · seen {relativeTime(status?.lastSeenAt ?? null)} · {status?.version ?? "v1.x"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={() => setDetailsOpen((prev) => !prev)}
            className="text-[11px] font-mono uppercase h-8"
          >
            <span>{detailsOpen ? "Hide Details" : "Connection Details"}</span>
            {detailsOpen ? (
              <ChevronUp className="size-3.5 ml-1" />
            ) : (
              <ChevronDown className="size-3.5 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Offline Alert Callout */}
      {(!connected || unavailable) && !detailsOpen && (
        <div className="border-t-2 border-border px-4 py-2.5 bg-secondary-background flex items-center justify-between text-xs font-mono">
          <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1.5 font-medium">
            <ShieldAlert className="size-4 shrink-0" />
            Vision heartbeat absent. Automations relying on CV will pause until reconnected.
          </span>
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="underline text-foreground hover:text-main shrink-0 ml-2"
          >
            Inspect
          </button>
        </div>
      )}

      {/* Expandable Technical Details */}
      {detailsOpen && (
        <div className="border-t-2 border-border bg-secondary-background p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              {unavailable ? (
                <ShieldAlert className="size-4 text-destructive" />
              ) : (
                <ShieldCheck className="size-4 text-emerald-400" />
              )}
              <span className="text-muted-foreground">Core API:</span>
              <span className="font-bold text-foreground">
                {unavailable ? "Unreachable" : "Reachable & Healthy"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Authorization:</span>
              <span className="font-bold text-foreground">{authorizationStatus}</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <CopyField label="Core URL" value={API_BASE_URL} />
            <CopyField label="Character ID" value={characterId} />
            <CopyField label="Device ID" value={deviceId} />
          </div>

          {unavailable && (
            <p className="font-sans text-xs text-muted-foreground">
              Re-authenticate Vision through Core’s existing Vision token handoff or ensure Core API is accessible at {API_BASE_URL}.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
