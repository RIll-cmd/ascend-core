"use client";

import { useEffect, useState } from "react";
import {
  getVisionLogs, getVisionSettings, saveVisionSetting,
  type VisionBehavior, type VisionLog, type VisionSetting,
} from "../services/vision-discipline.service";

const behaviors: { key: VisionBehavior; label: string; advice: string }[] = [
  { key: "PHONE_USE", label: "Phone use", advice: "Put the phone away" },
  { key: "SLOUCHING", label: "Slouching", advice: "Correct your posture" },
  { key: "DROWSINESS", label: "Drowsiness", advice: "Get some sleep" },
];

export function VisionDisciplinePanel({ characterId }: { characterId: string }) {
  const [settings, setSettings] = useState<VisionSetting[]>([]);
  const [logs, setLogs] = useState<VisionLog[]>([]);
  const [drafts, setDrafts] = useState<Partial<Record<VisionBehavior, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<VisionBehavior | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([getVisionSettings(characterId), getVisionLogs(characterId)])
      .then(([nextSettings, nextLogs]) => {
        if (!active) return;
        setSettings(nextSettings);
        setLogs(nextLogs);
        setDrafts(Object.fromEntries(nextSettings.map((item) => [item.behavior, String(item.penaltyAmount)])));
      })
      .catch(() => { if (active) setError("Vision discipline data could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [characterId]);

  async function save(behavior: VisionBehavior) {
    const amount = Number(drafts[behavior]);
    if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
      setError("Enter a whole-number HP penalty from 1 to 100.");
      return;
    }
    setSaving(behavior);
    setError("");
    try {
      const updated = await saveVisionSetting(characterId, behavior, amount);
      setSettings((current) => current.map((item) => item.behavior === behavior ? updated : item));
    } catch {
      setError("Penalty could not be saved. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <section aria-labelledby="vision-discipline-title" className="border border-[#e05344]/40 bg-[#1c1114] p-4 text-[#fdf2e9] shadow-[3px_3px_0_0_#140b0e]">
      <div className="mb-4 border-b border-[#e05344]/30 pb-3">
        <h2 id="vision-discipline-title" className="text-sm font-bold uppercase tracking-wider text-[#fba170]">Vision discipline</h2>
        <p className="mt-1 font-mono text-xs text-[#c4b5a5]">A first detection warns you. A repeat detection within five minutes applies your configured HP penalty. No habit is created.</p>
      </div>
      {error && <p role="alert" className="mb-3 font-mono text-xs text-[#ff9188]">{error}</p>}
      {loading ? <p className="font-mono text-xs text-[#c4b5a5]">Loading Vision discipline…</p> : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {behaviors.map(({ key, label, advice }) => (
              <div key={key} className="border border-[#e05344]/25 bg-[#24171a] p-3">
                <label htmlFor={`vision-${key}`} className="block text-xs font-bold uppercase">{label}</label>
                <p className="mt-1 font-mono text-[11px] text-[#c4b5a5]">{advice}</p>
                <div className="mt-3 flex items-center gap-2">
                  <input id={`vision-${key}`} aria-label={`${label} HP penalty`} type="number" min="1" max="100" step="1" value={drafts[key] ?? settings.find((item) => item.behavior === key)?.penaltyAmount ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))} className="w-20 border border-[#e05344]/40 bg-[#170e10] px-2 py-1 font-mono text-xs text-white focus-visible:outline-[#fba170]" />
                  <span className="font-mono text-xs text-[#c4b5a5]">HP</span>
                  <button type="button" disabled={saving !== null} onClick={() => void save(key)} className="ml-auto border border-[#821e14] bg-[#e05344] px-3 py-1 text-xs font-bold text-white disabled:opacity-50 focus-visible:outline-[#fba170]">{saving === key ? "Saving…" : "Save"}</button>
                </div>
              </div>
            ))}
          </div>
          <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-[#fba170]">Warnings & penalties</h3>
          {logs.length === 0 ? <p className="font-mono text-xs text-[#c4b5a5]">No Vision discipline events yet.</p> : (
            <ol className="max-h-80 space-y-2 overflow-y-auto" aria-label="Vision discipline history">
              {logs.map((log) => (
                <li key={log.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-[#e05344]/20 bg-[#24171a] px-3 py-2 font-mono text-xs">
                  <span className={log.stage === "PENALTY" ? "text-[#ff9188]" : "text-[#ffd166]"}>{log.stage}</span>
                  <span>{behaviors.find((item) => item.key === log.behavior)?.label ?? log.behavior}</span>
                  <span className="text-[#c4b5a5]">{new Date(log.observedAt).toLocaleString()}</span>
                  {log.stage === "PENALTY" && <span className="ml-auto font-bold text-[#ff9188]">−{log.penaltyAmount ?? 0} HP</span>}
                  <span className="w-full text-[#c4b5a5]">{log.reason}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
