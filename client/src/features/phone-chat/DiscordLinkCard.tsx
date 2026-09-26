"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2, RefreshCw, ShieldCheck, Unlink2 } from "lucide-react";
import { PhoneChatApi, type DiscordPairingCode } from "./api";

const api = new PhoneChatApi();

interface VisiblePairing extends DiscordPairingCode {
  deviceId: string;
}

function countdown(expiresAt: string, now: number): string {
  const seconds = Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1_000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function DiscordLinkCard({ deviceId }: { deviceId: string | null }) {
  return <DiscordLinkCardForDevice key={deviceId ?? "not-ready"} deviceId={deviceId} />;
}

function DiscordLinkCardForDevice({ deviceId }: { deviceId: string | null }) {
  const [linked, setLinked] = useState<boolean | null>(null);
  const [pairing, setPairing] = useState<VisiblePairing | null>(null);
  const [expired, setExpired] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async (currentDevice: string, signal?: AbortSignal) => {
    try {
      const status = await api.getDiscordLink(currentDevice, { signal });
      if (signal?.aborted) return;
      setLinked(status.linked);
      if (status.linked) {
        setPairing(null);
        setExpired(false);
      }
      setError(null);
    } catch {
      if (!signal?.aborted) {
        setError("Could not check the Discord link. Try again.");
      }
    }
  }, []);

  useEffect(() => {
    if (!deviceId) return;
    const controller = new AbortController();
    void api.getDiscordLink(deviceId, { signal: controller.signal }).then((status) => {
      if (!controller.signal.aborted) setLinked(status.linked);
    }).catch(() => {
      if (!controller.signal.aborted) setError("Could not check the Discord link. Try again.");
    });
    return () => controller.abort();
  }, [deviceId]);

  useEffect(() => {
    if (!pairing || pairing.deviceId !== deviceId) return;
    const timer = window.setInterval(() => {
      const currentTime = Date.now();
      if (currentTime >= Date.parse(pairing.expiresAt)) {
        setPairing(null);
        setExpired(true);
      } else {
        setNow(currentTime);
      }
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [pairing, deviceId]);

  const visiblePairing = pairing?.deviceId === deviceId && Date.parse(pairing.expiresAt) > now ? pairing : null;

  async function createCode() {
    if (!deviceId || pending || linked !== false) return;
    const currentDevice = deviceId;
    setPending(true);
    setPairing(null);
    setExpired(false);
    setError(null);
    try {
      const result = await api.createDiscordPairing(currentDevice);
      const issuedAt = Date.now();
      if (!result.code || !Number.isFinite(Date.parse(result.expiresAt)) || Date.parse(result.expiresAt) <= issuedAt) {
        setError("Could not create a link code. Try again.");
        return;
      }
      setNow(issuedAt);
      setPairing({ ...result, deviceId: currentDevice });
    } catch {
      setError("Could not create a link code. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function refreshStatus() {
    if (!deviceId || pending) return;
    setPending(true);
    await refresh(deviceId);
    setPending(false);
  }

  async function revoke() {
    if (!deviceId || !linked || pending) return;
    if (!window.confirm("Revoke the Discord link? You will need a new code to link it again.")) return;
    const currentDevice = deviceId;
    setPending(true);
    setError(null);
    try {
      await api.revokeDiscordLink(currentDevice);
      setPairing(null);
      setExpired(false);
      setLinked(false);
      await refresh(currentDevice);
    } catch {
      setError("Could not revoke the Discord link. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-label="Discord phone link" className="mx-auto w-full max-w-5xl border border-slate-700 bg-[#0c1220] px-4 py-3 text-slate-200 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center border border-emerald-500/40 bg-emerald-950/40 text-emerald-300">
            <Link2 aria-hidden="true" className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-pixel text-xs text-white sm:text-sm">Discord link</h2>
            <p role="status" className="mt-1 text-xs text-slate-400">
              {!deviceId ? "Waiting for phone access" : linked === null ? "Checking link" : linked ? "Linked to Discord" : "Not linked"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!linked && <button type="button" onClick={createCode} disabled={!deviceId || pending || linked !== false} className="min-h-10 border border-emerald-500/60 bg-emerald-900/40 px-3 text-xs text-emerald-100 hover:bg-emerald-800/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">Create link code</button>}
          <button type="button" onClick={refreshStatus} disabled={!deviceId || pending || (linked === null && !error)} className="inline-flex min-h-10 items-center gap-1.5 border border-slate-700 px-3 text-xs text-slate-300 hover:border-emerald-600 hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"><RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />Refresh link status</button>
          {linked && <button type="button" onClick={revoke} disabled={pending} className="inline-flex min-h-10 items-center gap-1.5 border border-rose-800 px-3 text-xs text-rose-200 hover:bg-rose-950/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-40"><Unlink2 aria-hidden="true" className="h-3.5 w-3.5" />Revoke link</button>}
        </div>
      </div>
      {visiblePairing && (
        <div className="mt-3 border-l-2 border-emerald-400 bg-[#080b14] px-3 py-2.5">
          <p className="text-xs text-slate-300">In a DM with the Vision Discord bot, run <span className="font-mono text-emerald-200">/link</span> and enter this code in its code field:</p>
          <p aria-label="One-time Discord link code" className="mt-2 break-all font-mono text-base font-semibold tracking-wider text-white sm:text-lg">{visiblePairing.code}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-emerald-400" />Expires in {countdown(visiblePairing.expiresAt, now)}. This code stays in this tab.</p>
        </div>
      )}
      {expired && <p className="mt-3 text-xs text-slate-400">Link code expired. Create a new one to try again.</p>}
      {error && <p role="alert" className="mt-3 border border-amber-800/70 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">{error}</p>}
    </section>
  );
}
