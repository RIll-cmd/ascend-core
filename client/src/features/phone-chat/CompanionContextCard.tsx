"use client";

import { Laptop, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneChatApi } from "./api";
import type { CompanionContextField, CompanionContextSnapshot } from "./types";

const api = new PhoneChatApi();
const FIELDS = [
  ["deskPresence", "Desk presence"],
  ["desktopActivity", "Desktop activity"],
  ["foregroundCategory", "Foreground app category"],
  ["declaredIntent", "Your declared intent"],
] as const;

function describe(field?: CompanionContextField): string {
  if (!field || field.freshness !== "fresh") {
    return field?.freshness === "paused" ? "Paused" : "Unknown / expired";
  }
  return field.value.replaceAll("_", " ");
}

export function CompanionContextCard({ deviceId }: { deviceId: string | null }) {
  const [loaded, setLoaded] = useState<{ deviceId: string; snapshot: CompanionContextSnapshot | null } | null>(null);

  useEffect(() => {
    if (!deviceId) {
      return;
    }
    let active = true;
    let controller: AbortController | null = null;
    const refresh = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const value = await api.getCompanionContext(deviceId, { signal: controller.signal });
        if (active) setLoaded({ deviceId, snapshot: value });
      } catch {
        if (active && !controller.signal.aborted) setLoaded({ deviceId, snapshot: null });
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 15_000);
    return () => {
      active = false;
      window.clearInterval(timer);
      controller?.abort();
    };
  }, [deviceId]);

  const snapshot = loaded?.deviceId === deviceId ? loaded.snapshot : null;
  const online = snapshot?.available === true;
  return (
    <section aria-label="Shared laptop context" className="mx-auto w-full max-w-5xl border border-slate-700 bg-[#080b14]/95 px-4 py-4 shadow-[0_18px_55px_rgba(0,0,0,.25)] sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center border border-cyan-500/30 bg-cyan-950/30 text-cyan-200"><Laptop aria-hidden="true" className="h-5 w-5" /></div>
          <div>
            <h2 className="font-pixel text-xs text-slate-100">Laptop context</h2>
            <p className="mt-1 text-xs text-slate-400">Redacted current signals · no screen, audio, or transcript sharing</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${online ? "border-emerald-700/70 bg-emerald-950/40 text-emerald-300" : "border-amber-700/60 bg-amber-950/30 text-amber-300"}`}>
          <Radio aria-hidden="true" className="h-3 w-3" />{online ? "Current link" : "Unavailable / stale"}
        </span>
      </div>
      <dl aria-live="polite" className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
        {FIELDS.map(([name, label]) => {
          const field = snapshot?.fields?.[name];
          return <div key={name} className="border-l border-slate-700 pl-3">
            <dt className="font-mono text-[9px] uppercase tracking-[.15em] text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm capitalize text-slate-200">{describe(field)}</dd>
            {field?.freshness !== "fresh" && field?.ageSeconds != null && <dd className="mt-1 text-[10px] text-slate-500">Last evidence {field.ageSeconds}s ago</dd>}
          </div>;
        })}
      </dl>
      <p className="mt-4 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
        {snapshot?.lastSeenAt ? `Last laptop update received ${new Date(snapshot.lastSeenAt).toLocaleString()}.` : "No laptop update has been received. Enable context sharing on the laptop to connect."}
        {snapshot?.snapshotId ? ` Snapshot ${snapshot.snapshotId}.` : ""}
      </p>
    </section>
  );
}
