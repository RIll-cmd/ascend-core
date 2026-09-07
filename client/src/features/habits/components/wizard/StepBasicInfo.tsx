import React from "react";
import { useCreateHabitStore } from "../../store/useCreateHabitStore";
import { PenaltyTarget } from "../../types";

export const StepBasicInfo: React.FC = () => {
  const { draft, updateDraft } = useCreateHabitStore();

  return (
    <div className="space-y-4 font-pixel text-[#1d2d2a] select-none animate-in fade-in duration-150">
      <div className="text-center mb-4">
        <h2 className="text-sm sm:text-base font-bold uppercase text-[#1d2d2a]">✦ Habit Information ✦</h2>
        <p className="text-[10px] text-[#5a6472] uppercase font-mono font-bold mt-0.5">What habit do you want to build?</p>
      </div>

      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#2f3640] border-2 border-[#1d2d2a]">
          <button type="button" onClick={() => updateDraft({ type: "POSITIVE" })} className={`py-2 text-[10px] font-bold uppercase border-2 ${draft.type === "POSITIVE" ? "bg-emerald-500 text-[#102018] border-emerald-200" : "text-[#b0b8c4] border-transparent"}`}>
            + Positive Habit
          </button>
          <button type="button" onClick={() => updateDraft({ type: "NEGATIVE" })} className={`py-2 text-[10px] font-bold uppercase border-2 ${draft.type === "NEGATIVE" ? "bg-[#9f1239] text-white border-[#fecdd3]" : "text-[#b0b8c4] border-transparent"}`}>
            - Bad Habit
          </button>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#3b424c] uppercase mb-1">
            Habit Name *
          </label>
          <input
            type="text"
            className="w-full bg-[#e2e7ec] border-2 border-[#1d2d2a] focus:border-[#ffb03a] px-3 py-2 text-xs text-[#1d2d2a] placeholder-[#5a6472] font-mono font-bold focus:outline-none shadow-[inset_0_0_6px_rgba(0,0,0,0.1)]"
            placeholder="e.g., Drink 2.5L Water, Morning Exercise, Read 20 Pages, Daily Code Practice"
            value={draft.name}
            onChange={(e) => updateDraft({ name: e.target.value })}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#3b424c] uppercase mb-1">
            Description / Reason (Optional)
          </label>
          <textarea
            className="w-full bg-[#e2e7ec] border-2 border-[#1d2d2a] focus:border-[#ffb03a] px-3 py-2 text-xs text-[#1d2d2a] placeholder-[#5a6472] font-mono font-bold focus:outline-none h-20 resize-none shadow-[inset_0_0_6px_rgba(0,0,0,0.1)]"
            placeholder="e.g., Stay hydrated throughout the day to boost energy and mental clarity."
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#3b424c] uppercase mb-1">
              Category
            </label>
            <select
              className="w-full bg-[#e2e7ec] border-2 border-[#1d2d2a] focus:border-[#ffb03a] px-3 py-2 text-xs text-[#1d2d2a] font-mono font-bold focus:outline-none cursor-pointer shadow-[inset_0_0_6px_rgba(0,0,0,0.1)]"
              value={draft.category}
              onChange={(e) => updateDraft({ category: e.target.value })}
            >
              <option value="Health">Health</option>
              <option value="Fitness">Fitness</option>
              <option value="Productivity">Productivity</option>
              <option value="Learning">Learning</option>
              <option value="Mindset">Mindset</option>
              <option value="Finance">Finance</option>
              <option value="Daily Routine">Daily Routine</option>
              <option value="Sleep">Sleep</option>
              <option value="Social">Social</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#3b424c] uppercase mb-1">
              {draft.type === "NEGATIVE" ? "Penalty Target" : "Primary Stat Boost"}
            </label>
            <select
              className="w-full bg-[#e2e7ec] border-2 border-[#1d2d2a] focus:border-[#ffb03a] px-3 py-2 text-xs text-[#1d2d2a] font-mono font-bold focus:outline-none cursor-pointer capitalize shadow-[inset_0_0_6px_rgba(0,0,0,0.1)]"
              value={draft.type === "NEGATIVE" ? draft.affectedStat : draft.primaryStat}
              onChange={(e) => draft.type === "NEGATIVE" ? updateDraft({ affectedStat: e.target.value as PenaltyTarget }) : updateDraft({ primaryStat: e.target.value })}
            >
              {draft.type === "NEGATIVE" && <>
                <option value="HP">HP (Current Health)</option>
                <option value="EXP">EXP (Experience Pool)</option>
                <option value="VITALITY">Vitality (Endurance)</option>
                <option value="DISCIPLINE">Discipline</option>
                <option value="FOCUS">Focus</option>
                <option value="STRENGTH">Strength</option>
                <option value="KNOWLEDGE">Knowledge</option>
                <option value="RECOVERY">Recovery</option>
                <option value="CONSISTENCY">Consistency</option>
              </>}
              {draft.type === "POSITIVE" && <>
              <option value="discipline">Discipline (Habit Willpower)</option>
              <option value="consistency">Consistency (Streak Stability)</option>
              <option value="focus">Focus (Concentration & Deep Work)</option>
              <option value="strength">Strength (Physical Power)</option>
              <option value="endurance">Endurance (Stamina & Persistence)</option>
              <option value="knowledge">Knowledge (Mental Sharpness)</option>
              <option value="recovery">Recovery (Rest & Vitality)</option>
              </>}
            </select>
          </div>
        </div>

        {draft.type === "NEGATIVE" && (
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3 p-3 bg-[#4c1024] border-2 border-[#be123c] text-white">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 text-rose-200">Vice Preset / Custom Entry</label>
              <select className="w-full bg-[#fce7f3] text-[#3b1024] border-2 border-[#1d2d2a] px-3 py-2 text-xs font-mono font-bold" value="" onChange={(e) => {
                const presets: Record<string, { name: string; affectedStat: PenaltyTarget; statModifier: number }> = {
                  overeating: { name: "Overeating", affectedStat: "VITALITY", statModifier: 10 },
                  smoking: { name: "Smoking", affectedStat: "HP", statModifier: 15 },
                  procrastinating: { name: "Procrastinating", affectedStat: "DISCIPLINE", statModifier: 10 },
                };
                const preset = presets[e.target.value];
                if (preset) updateDraft(preset);
              }}>
                <option value="">Choose a common vice…</option>
                <option value="overeating">Overeating</option>
                <option value="smoking">Smoking</option>
                <option value="procrastinating">Procrastinating</option>
              </select>
              <p className="text-[9px] mt-1 text-rose-200">Or edit the name above for a custom bad habit.</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 text-rose-200">Penalty Amount</label>
              <input type="number" min={1} max={100000} value={draft.statModifier} onChange={(e) => updateDraft({ statModifier: Math.max(1, Number(e.target.value) || 1) })} className="w-full bg-[#fce7f3] text-[#3b1024] border-2 border-[#1d2d2a] px-3 py-2 text-xs font-mono font-bold" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
