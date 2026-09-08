"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Radio, ShieldCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/constants";
import {
  getVisionStatus,
  type VisionConnectionStatus,
} from "../services/automation.service";

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

function CopyValue({ label, value }: { label: string; value: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  };

  return (
    <div className="min-w-0 border border-slate-700 bg-[#0a1018] px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[.14em] text-slate-400">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-amber-100">{value}</code>
        <button type="button" onClick={() => void copy()} className="text-slate-300 hover:text-amber-300" aria-label={`Copy ${label}`}>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function VisionConnectionPanel({ characterId }: { characterId: string }) {
  const [state, setState] = useState<PanelState>({ kind: "loading" });
  const refresh = useCallback(async () => {
    try {
      setState({ kind: "ready", status: await getVisionStatus(characterId) });
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
    ? "unable to verify"
    : connected
      ? "authenticated"
      : "awaiting authenticated heartbeat";

  return (
    <section aria-label="Ascend Vision connection" className="automation-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-700 bg-[#121d2b] px-4 py-3">
        <div className="flex items-center gap-2 text-amber-200">
          <Radio className="h-4 w-4" aria-hidden="true" />
          <h2 className="font-pixel text-xs uppercase tracking-wide">Ascend Vision</h2>
        </div>
        <span className={`border px-2 py-1 font-mono text-[10px] font-bold uppercase ${unavailable ? "border-red-700 text-red-300" : connected ? "border-emerald-700 bg-emerald-950 text-emerald-300" : "border-amber-700 bg-amber-950 text-amber-300"}`}>
          {unavailable ? "Core unreachable" : state.kind === "loading" ? "Checking" : status?.status}
        </span>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 font-mono text-[11px]">
          <dt className="text-slate-400">Status</dt><dd className="text-slate-100">{status?.status ?? "OFFLINE"}</dd>
          <dt className="text-slate-400">Device</dt><dd className="truncate text-slate-100">{deviceId}</dd>
          <dt className="text-slate-400">Last seen</dt><dd className="text-slate-100">{relativeTime(status?.lastSeenAt ?? null)}</dd>
          <dt className="text-slate-400">Version</dt><dd className="text-slate-100">{status?.version ?? "Not reported"}</dd>
        </dl>
        <div className="grid content-start gap-2">
          <p className="flex items-center gap-2 font-mono text-[11px] text-slate-200">
            {unavailable ? <TriangleAlert className="h-4 w-4 text-red-300" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />}
            Core API: {unavailable ? "unreachable" : "reachable"}
          </p>
          <p className="font-mono text-[11px] text-slate-200">Vision authorization: {authorizationStatus}</p>
          {unavailable && <p className="font-sans text-xs text-slate-400">Re-authenticate Vision through Core’s existing Vision token handoff.</p>}
        </div>
        <div className="grid gap-2 md:col-span-2 md:grid-cols-3">
          <CopyValue label="Core URL" value={API_BASE_URL} />
          <CopyValue label="Character ID" value={characterId} />
          <CopyValue label="Device ID" value={deviceId} />
        </div>
      </div>
    </section>
  );
}
