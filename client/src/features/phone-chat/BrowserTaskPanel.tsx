"use client";

import { Activity, AlertTriangle, ArrowUpRight, Check, CircleHelp, Clock3, Globe2, Pause, Play, ShieldCheck, Square, WifiOff } from "lucide-react";
import type { useBrowserTasks } from "./useBrowserTasks";
import { BrowserActionReview } from "./BrowserActionReview";
import type { BrowserTaskStatus } from "./types";

type BrowserTasks = ReturnType<typeof useBrowserTasks>;

const STATUS_COPY: Record<BrowserTaskStatus, string> = {
  queued: "Queued · laptop will pick this up when available",
  claimed: "Laptop accepted · preparing a browser context",
  running: "Running on your laptop",
  paused: "Paused before the next browser step",
  waiting_for_user: "Waiting for a decision on your laptop",
  stopping: "Stop requested · waiting for laptop confirmation",
  completed: "Research finished",
  partial: "Stopped with partial findings",
  failed: "Could not complete safely",
  unknown: "Outcome unknown · check the laptop before retrying",
  cancelled: "Stopped",
  expired: "Task expired before completion",
};

const TERMINAL = new Set<BrowserTaskStatus>(["completed", "partial", "failed", "unknown", "cancelled", "expired"]);

function sourceUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch { return null; }
}

function availabilityCopy(tasks: BrowserTasks): { label: string; detail: string; tone: string } {
  const state = tasks.availability;
  if (!state) return { label: "Checking laptop", detail: "Waiting for a verified Core heartbeat.", tone: "amber" };
  if (state.reason === "online") return { label: "Laptop online", detail: `Connected to ${state.laptopId ?? "your laptop"}.`, tone: "emerald" };
  if (state.reason === "busy") return { label: "Laptop busy", detail: "Research can queue while the local browser finishes its current task.", tone: "amber" };
  if (state.reason === "offline") return { label: "Laptop offline", detail: "You can queue a task; no browser work starts until the laptop reconnects.", tone: "amber" };
  if (state.reason === "provider_unavailable") return { label: "Provider unavailable", detail: "Vision cannot confirm that the selected model provider is ready.", tone: "rose" };
  if (state.reason === "disabled") return { label: "Browser tasks disabled", detail: "Remote browser access is turned off in Core configuration.", tone: "slate" };
  return { label: "Laptop unavailable", detail: "Core has no fresh laptop status.", tone: "slate" };
}

export function BrowserTaskPanel({ tasks, reviewOnly = false }: { tasks: BrowserTasks; reviewOnly?: boolean }) {
  const status = availabilityCopy(tasks);
  const active = tasks.task && !TERMINAL.has(tasks.task.status);
  const canQueue = Boolean(tasks.deviceId && tasks.availability?.laptopId
    && tasks.availability.reason !== "disabled" && tasks.availability.reason !== "provider_unavailable");
  const canSubmit = canQueue && Boolean(tasks.goal.trim()) && tasks.providerConsent
    && Boolean(tasks.selectedProvider) && !tasks.busy && !active;

  return (
    <section aria-label="Vision browser tasks" className="mx-auto flex min-h-[34rem] w-full max-w-5xl flex-col overflow-hidden border border-slate-700 bg-[#080b14]/95 shadow-[0_18px_55px_rgba(0,0,0,.4)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-[#0c1220] px-4 py-4 sm:flex-nowrap sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center border border-cyan-500/40 bg-cyan-950/50 text-cyan-200 shadow-[inset_0_0_18px_rgba(34,211,238,.08)]">
            <Globe2 aria-hidden="true" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-cyan-200">Vision · laptop browser</p>
            <h1 className="font-pixel text-sm text-white sm:text-base">{reviewOnly ? "Shared Discord browser task" : "Browser tasks"}</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${status.tone === "emerald" ? "border-emerald-700/70 bg-emerald-950/40 text-emerald-300" : status.tone === "rose" ? "border-rose-700/70 bg-rose-950/40 text-rose-300" : status.tone === "amber" ? "border-amber-700/60 bg-amber-950/30 text-amber-300" : "border-slate-700 bg-slate-900 text-slate-400"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.tone === "emerald" ? "bg-emerald-400" : status.tone === "rose" ? "bg-rose-400" : "bg-amber-400"}`} aria-hidden="true" />
            {status.label}
          </span>
          {tasks.browserSessionId && <button type="button" disabled={tasks.busy} onClick={() => {
            if (active && !window.confirm("End this Browser session and request the laptop to stop its current task?")) return;
            void tasks.endSession().catch(() => {});
          }} className="min-h-11 border border-slate-700 px-2 text-[10px] text-slate-400 hover:border-rose-700 hover:text-rose-200 disabled:opacity-50">End session</button>}
        </div>
      </header>

      <div className="flex items-start gap-2 border-b border-slate-800 bg-[#090e19] px-4 py-3 text-xs leading-5 text-slate-400 sm:px-6">
        {tasks.availability?.reason === "offline" ? <WifiOff aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> : <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />}
        <p>{status.detail} The browser and page stay on your laptop; this phone sends a bounded task and receives its progress.</p>
      </div>

      <div className={`grid min-w-0 flex-1 grid-cols-1 gap-5 p-4 sm:p-6 ${reviewOnly ? "" : "sm:grid-cols-[minmax(0,1.1fr)_minmax(17rem,.9fr)]"}`}>
        {!reviewOnly && <div className="space-y-4">
          <form onSubmit={(event) => { void tasks.start(event); }} className="space-y-4">
            <label htmlFor="browser-goal" className="block font-mono text-[11px] uppercase tracking-[.16em] text-slate-300">What should Vision do in the browser?</label>
            <textarea
              id="browser-goal"
              value={tasks.goal}
              onChange={(event) => tasks.setGoal(event.target.value.slice(0, 4000))}
              maxLength={4000}
              rows={5}
              disabled={Boolean(active) || tasks.busy}
              placeholder="Find the official docs for this library and summarize the installation steps."
              className="min-h-32 w-full resize-y border border-slate-700 bg-[#060a12] p-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-500/70 disabled:opacity-60"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs text-slate-400">
                <span className="font-mono uppercase tracking-wider">Model provider</span>
                <select value={tasks.selectedProvider} onChange={(event) => tasks.setSelectedProvider(event.target.value)} disabled={Boolean(active) || tasks.busy} className="min-h-11 w-full border border-slate-700 bg-[#0a101b] px-3 text-sm text-slate-100 outline-none focus:border-cyan-500/70 disabled:opacity-60">
                  {[tasks.availability?.provider ?? tasks.selectedProvider].filter(Boolean).map((provider) => <option key={provider} value={provider}>{provider[0].toUpperCase() + provider.slice(1)}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-xs text-slate-400">
                <span className="font-mono uppercase tracking-wider">Scope</span>
                <select aria-label="Browser scope" value={tasks.selectedScope ?? "public_research"} onChange={(event) => tasks.setSelectedScope(event.target.value)} disabled={Boolean(active) || tasks.busy} className="min-h-11 w-full border border-slate-700 bg-[#0a101b] px-3 text-sm text-slate-100 outline-none focus:border-cyan-500/70 disabled:opacity-60">
                  {(tasks.availability?.scopes ?? [{ scopeId: "public_research", version: 1, actions: [] }]).map((scope) => <option key={scope.scopeId} value={scope.scopeId}>{scope.scopeId === "public_research" ? "Public web research only" : `${scope.scopeId} · ${scope.origin}`}</option>)}
                </select>
              </label>
            </div>
            <label className="flex cursor-pointer items-start gap-3 border border-slate-800 bg-[#0a101b] p-3 text-xs leading-5 text-slate-400">
              <input type="checkbox" checked={tasks.providerConsent} onChange={(event) => tasks.setProviderConsent(event.target.checked)} disabled={Boolean(active) || tasks.busy} className="mt-1 h-4 w-4 accent-cyan-400" />
              <span>I agree to send this task and the pages Vision reads to <strong className="font-semibold text-slate-200">{tasks.selectedProvider}</strong>. The provider is fixed for this Browser session.</span>
            </label>
            <button type="submit" disabled={!canSubmit} className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-cyan-500/50 bg-cyan-950/55 px-4 font-mono text-xs uppercase tracking-[.13em] text-cyan-100 transition-colors hover:bg-cyan-900/60 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-600">
              {tasks.availability?.reason === "offline" ? <Clock3 aria-hidden="true" className="h-4 w-4" /> : <Activity aria-hidden="true" className="h-4 w-4" />}
              {tasks.availability?.reason === "offline"
                ? tasks.selectedScope && tasks.selectedScope !== "public_research" ? "Queue task" : "Queue research"
                : tasks.selectedScope && tasks.selectedScope !== "public_research" ? "Start task" : "Start research"}
            </button>
          </form>

          {tasks.error && <p role="alert" className="flex gap-2 border border-rose-900/70 bg-rose-950/25 p-3 text-xs leading-5 text-rose-200"><AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{tasks.error}</p>}
        </div>}
        {reviewOnly && tasks.error && <p role="alert" className="text-sm text-rose-200">{tasks.error}</p>}

        <div className="flex min-h-64 min-w-0 flex-col border border-slate-800 bg-[#090e19]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.16em] text-slate-500">Task stream</p>
              <p className="mt-1 text-sm font-medium text-slate-100">{tasks.task?.status === "waiting_for_user" && tasks.task.waitingForUserType === "action_review" ? "Waiting for your action review" : tasks.task ? STATUS_COPY[tasks.task.status] : "Waiting for a task"}</p>
            </div>
            {tasks.task && !TERMINAL.has(tasks.task.status) && <div className="flex gap-1">
              {tasks.task.status === "paused" || tasks.task.waitingForUserType === "local_takeover" ? <button type="button" onClick={() => void tasks.control("resume")} disabled={tasks.busy} aria-label="Resume browser task" className="grid h-11 w-11 place-items-center border border-slate-700 text-slate-200 hover:border-emerald-500/60"><Play aria-hidden="true" className="h-4 w-4" /></button> : <button type="button" onClick={() => void tasks.control("pause")} disabled={tasks.busy} aria-label="Pause browser task" className="grid h-11 w-11 place-items-center border border-slate-700 text-slate-200 hover:border-amber-500/60"><Pause aria-hidden="true" className="h-4 w-4" /></button>}
              <button type="button" onClick={() => void tasks.control("stop")} disabled={tasks.busy || tasks.task.status === "stopping"} aria-label="Stop browser task" className="grid h-11 w-11 place-items-center border border-slate-700 text-slate-200 hover:border-rose-500/60"><Square aria-hidden="true" className="h-4 w-4" /></button>
            </div>}
          </div>
          <div aria-live="polite" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {!tasks.task ? <div className="grid h-full min-h-40 place-items-center text-center text-xs leading-5 text-slate-500"><p><CircleHelp aria-hidden="true" className="mx-auto mb-2 h-5 w-5 text-slate-600" />Start a public research task to see its laptop-side progress here.</p></div> : <>
              <BrowserActionReview key={`${tasks.task.taskId}:${tasks.task.review?.proposal?.digest ?? "none"}`} task={tasks.task} busy={tasks.busy} onDecision={tasks.decideReview} />
              <ol className="space-y-2">
                {tasks.task.events.slice(-8).map((event) => <li key={event.sequence} className="flex gap-2 border-l border-cyan-900/80 pl-3 text-xs leading-5 text-slate-400">
                  <span className="shrink-0 font-mono text-[10px] uppercase text-cyan-300/80">{event.eventType.replaceAll("_", " ")}</span>
                  <span>{event.summary ?? "Status updated."}</span>
                </li>)}
              </ol>
              {(tasks.task.result?.findings ?? []).map((finding, index) => <article key={index} className="border border-emerald-900/70 bg-emerald-950/15 p-3">
                <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300"><Check aria-hidden="true" className="h-3.5 w-3.5" /> Finding</div>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">{finding.text}</p>
                <ul className="mt-3 space-y-1.5 border-t border-emerald-900/50 pt-2">
                  {finding.sources.map((source) => {
                    const safe = sourceUrl(source);
                    if (!safe) return null;
                    return (
                      <li key={source}>
                        <a href={safe} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 break-all text-xs text-cyan-300 underline decoration-cyan-800 underline-offset-2 hover:text-cyan-100">
                          <span>{safe}</span><ArrowUpRight aria-hidden="true" className="h-3 w-3 shrink-0" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </article>)}
              {tasks.task.status === "unknown" && <p className="flex gap-2 border border-amber-800/70 bg-amber-950/25 p-3 text-xs leading-5 text-amber-200"><AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />The laptop or Core connection was interrupted. Check the laptop before you start a replacement task.</p>}
              {TERMINAL.has(tasks.task.status) && <button type="button" onClick={() => void tasks.dismiss()} disabled={tasks.busy} className="min-h-11 w-full border border-slate-700 text-xs text-slate-300 hover:border-cyan-700 hover:text-cyan-100 disabled:opacity-50">Dismiss and clear this task from Core</button>}
            </>}</div>
          <footer className="border-t border-slate-800 px-4 py-2 font-mono text-[10px] text-slate-600">Progress refreshes while this tab is visible · task content is not cached by the service worker</footer>
        </div>
      </div>
    </section>
  );
}
