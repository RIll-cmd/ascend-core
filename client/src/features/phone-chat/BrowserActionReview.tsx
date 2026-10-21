"use client";

import { useEffect, useState } from "react";
import type { BrowserActionReviewData, BrowserTaskView } from "./types";

export function validBrowserReview(task: BrowserTaskView, now = Date.now() / 1000): BrowserActionReviewData | null {
  const review = task.review;
  if (task.status !== "waiting_for_user" || task.waitingForUserType !== "action_review" || !review) return null;
  const p = review.proposal;
  const bounded = (value: unknown, limit: number) => typeof value === "string" && value.trim().length > 0 && value.length <= limit;
  if (!p || p.task_id !== task.taskId || !Number.isInteger(review.fence) || review.fence < 1
    || !bounded(review.laptopId, 128) || !bounded(review.brokerBootId, 128)
    || typeof p.digest !== "string" || !/^[a-f0-9]{64}$/.test(p.digest)
    || !bounded(p.owner, 128) || !bounded(p.observation_id, 128)
    || !bounded(p.action_id, 128) || !bounded(p.target_ref, 128)
    || !Number.isInteger(p.document_revision) || p.document_revision < 0
    || typeof p.target_label !== "string" || p.target_label.length > 300
    || typeof p.expected_effect !== "string" || !p.expected_effect.trim() || p.expected_effect.length > 500
    || !Number.isFinite(p.expires_at) || p.expires_at <= now
    || !Number.isFinite(Date.parse(task.expiresAt)) || Date.parse(task.expiresAt) / 1000 <= now) return null;
  try {
    const origin = new URL(p.origin);
    if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password
      || (origin.pathname !== "/" && origin.pathname !== "") || origin.search || origin.hash) return null;
  } catch { return null; }
  const entries = p.arguments && typeof p.arguments === "object" && !Array.isArray(p.arguments) && Object.entries(p.arguments);
  if (!entries || entries.some(([key, value]) => key.length > 64 || typeof value !== "string" || value.length > 2000)) return null;
  if (["fill", "select"].includes(p.action)) {
    if (entries.length !== 1 || entries[0][0] !== "value") return null;
  } else if (p.action !== "click" || entries.length !== 0) return null;
  return review;
}

export function BrowserActionReview({ task, busy, onDecision }: {
  task: BrowserTaskView; busy: boolean;
  onDecision: (review: BrowserActionReviewData, approved: boolean) => Promise<void>;
}) {
  const [now, setNow] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const review = validBrowserReview(task, now);
  if (task.status !== "waiting_for_user") return null;
  if (task.waitingForUserType === "local_takeover") return (
    <aside className="border border-amber-800/70 bg-amber-950/20 p-3 text-sm leading-6 text-amber-100">
      <p className="font-semibold">Continue on your laptop</p>
      <p>Vision needs a fresh observation or your input in the visible laptop browser. Complete the takeover there, then resume this task.</p>
    </aside>
  );
  if (!review) return <p role="status" className="text-sm text-amber-200">This action review expired or changed. Refresh task status.</p>;
  const p = review.proposal;
  return (
    <section aria-label="Review browser action" className="min-w-0 space-y-3 border-2 border-amber-600/70 bg-[#15110a] p-4 text-sm text-slate-100 [overflow-wrap:anywhere]">
      <h2 className="font-semibold text-amber-100">Review one browser action</h2>
      <dl className="space-y-2 break-words">
        <div><dt className="text-xs text-slate-400">Laptop</dt><dd>{review.laptopId}</dd></div>
        <div><dt className="text-xs text-slate-400">Website</dt><dd>{p.origin}</dd></div>
        <div><dt className="text-xs text-slate-400">Action and target</dt><dd>{p.action} · {p.target_label || p.target_ref}</dd></div>
        {Object.entries(p.arguments).map(([key, value]) => <div key={key}><dt className="text-xs text-slate-400">{key}</dt><dd className="whitespace-pre-wrap break-words border border-slate-700 p-2">{value || "(empty)"}</dd></div>)}
        <div><dt className="text-xs text-slate-400">Expected effect</dt><dd>{p.expected_effect}</dd></div>
      </dl>
      {["fill", "select"].includes(p.action) && <p className="text-xs leading-5 text-amber-200">This website may autosave as soon as Vision changes this field.</p>}
      <p className="text-xs text-slate-400">Review expires in {Math.max(0, Math.ceil(p.expires_at - now))} seconds. Approval applies once to these exact values.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void onDecision(review, false)} className="min-h-11 flex-1 border border-slate-600 px-3 focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-50">Reject action</button>
        <button type="button" disabled={busy} onClick={() => {
          if (validBrowserReview(task)) void onDecision(review, true);
        }} className="min-h-11 flex-1 border border-amber-400 bg-amber-900/40 px-3 text-amber-100 focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-50">Approve this action</button>
      </div>
    </section>
  );
}
