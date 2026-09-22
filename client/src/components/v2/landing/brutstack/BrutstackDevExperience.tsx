"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export function BrutstackDevExperience() {
  const [activeTab, setActiveTab] = useState<"workout" | "habit" | "focus">("workout");
  const [copied, setCopied] = useState(false);

  const payloads = {
    workout: `{
  "activity": "COMPOUND_BENCH_PRESS",
  "weight_lbs": 225,
  "reps": [5, 5, 5, 5, 5],
  "tonnage_lbs": 5625,
  "stat_multipliers": {
    "STR_gain": "+2.4",
    "PWR_score": "+140",
    "gold_yield": "+75"
  },
  "target_muscles": ["Pectorals", "Triceps", "Anterior Deltoid"]
}`,
    habit: `{
  "habit_title": "MORNING_DISCIPLINE_PROTOCOL",
  "completion_status": "GOLD_TIER",
  "streak_days": 84,
  "asymptotic_strength": "0.942 / 1.000",
  "streak_freeze_shields": 2,
  "buffs_active": [
    "MOMENTUM_AURA_III",
    "HYPERTROPHY_CATALYST"
  ]
}`,
    focus: `{
  "session_type": "DEEP_WORK_POMODORO",
  "duration_minutes": 90,
  "ambient_soundscape": "PERSONA_5_RAIN_CAFE",
  "focus_score": "98%",
  "stat_multipliers": {
    "INT_gain": "+3.1",
    "SP_yield": "+1.5",
    "raid_damage": "+420"
  }
}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(payloads[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="engine"
      className="w-full bg-[#1a1a1a] px-4 py-16 lg:px-12 lg:py-28 text-[#f9f4da]"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
        <span className="retro font-bold inline-flex items-center py-1.5 mb-2 bg-[#c084fc] px-3.5 text-[8px] sm:text-[9px] text-[#1a1a1a] uppercase border-2 border-black shadow-[2px_2px_0_0_#000]">
          The Reality Engine
        </span>
        <h2 className="retro text-xl sm:text-2xl md:text-3xl font-bold text-center uppercase tracking-tight leading-snug">
          One Real-World Check-In
          <br />
          <span className="text-[#c084fc]">Infinite RPG Power</span>
        </h2>
        <p className="retro text-[9px] sm:text-[10px] mx-auto mb-8 max-w-xl text-center leading-relaxed text-neutral-400">
          Log sets, habit ticks, or deep work. The engine calculates combat power instantly.
        </p>

        {/* Dual Pane Showcase */}
        <div className="grid w-full grid-cols-1 border-2 border-black shadow-[8px_8px_0_0_#000] lg:grid-cols-2">
          {/* Left Column: Reality Telemetry Payload Window */}
          <div className="bg-[#0e0e0e] lg:border-r-2 lg:border-black flex flex-col">
            {/* Header / Tabs */}
            <div className="flex items-center gap-3 border-b-2 border-black bg-[#161616] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff3333]" />
              <span className="h-3 w-3 rounded-full bg-[#fcba28]" />
              <span className="h-3 w-3 rounded-full bg-[#00ff88]" />
              <div className="ml-2 flex items-center gap-1.5 retro text-[8px] sm:text-[9px] font-bold tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveTab("workout")}
                  className={`px-2.5 py-1 cursor-pointer transition-colors ${
                    activeTab === "workout"
                      ? "border-2 border-black bg-[#f9f4da] text-[#1a1a1a]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  WORKOUT_LOG
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("habit")}
                  className={`px-2.5 py-1 cursor-pointer transition-colors ${
                    activeTab === "habit"
                      ? "border-2 border-black bg-[#f9f4da] text-[#1a1a1a]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  HABIT_STREAK
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("focus")}
                  className={`px-2.5 py-1 cursor-pointer transition-colors ${
                    activeTab === "focus"
                      ? "border-2 border-black bg-[#f9f4da] text-[#1a1a1a]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  DEEP_WORK
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="ml-auto flex items-center gap-1.5 p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Copy telemetry payload"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#00ff88]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="flex gap-4 overflow-x-auto p-5 font-mono text-[13px] leading-6 grow">
              {/* Line Numbers */}
              <div className="shrink-0 text-right text-neutral-600 select-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code Pre */}
              <pre className="whitespace-pre font-mono text-neutral-300 overflow-x-auto">
                {activeTab === "workout" && (
                  <>
                    <span className="text-[#8a8a8a]">{"{\n"}</span>
                    <span className="text-[#818cf8]">{`  "activity"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00ff88]">&quot;COMPOUND_BENCH_PRESS&quot;</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#818cf8]">{`  "weight_lbs"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#fcba28]">225</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#818cf8]">{`  "tonnage_lbs"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#fcba28]">5625</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#818cf8]">{`  "stat_multipliers"`}</span>
                    <span className="text-[#8a8a8a]">{`: {\n`}</span>
                    <span className="text-[#c084fc]">{`    "STR_gain"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00ff88]">&quot;+2.4&quot;</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#c084fc]">{`    "PWR_score"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00ff88]">&quot;+140&quot;</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#c084fc]">{`    "gold_yield"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00ff88]">&quot;+75&quot;</span>
                    {"\n"}
                    <span className="text-[#8a8a8a]">{`  }\n}`}</span>
                  </>
                )}
                {activeTab === "habit" && (
                  <>
                    <span className="text-[#8a8a8a]">{"{\n"}</span>
                    <span className="text-[#818cf8]">{`  "habit"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00ff88]">&quot;MORNING_COLD_PLUNGE&quot;</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#818cf8]">{`  "streak_days"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#fcba28]">84</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#818cf8]">{`  "asymptotic_strength"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00ff88]">&quot;0.942 / 1.000&quot;</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#818cf8]">{`  "streak_freeze_shields"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#fcba28]">2</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#818cf8]">{`  "buff_applied"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00d4ff]">&quot;MOMENTUM_AURA_III&quot;</span>
                    {"\n"}
                    <span className="text-[#8a8a8a]">{"}"}</span>
                  </>
                )}
                {activeTab === "focus" && (
                  <>
                    <span className="text-[#8a8a8a]">{"{\n"}</span>
                    <span className="text-[#818cf8]">{`  "session_type"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00ff88]">&quot;DEEP_WORK_POMODORO&quot;</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#818cf8]">{`  "duration_min"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#fcba28]">90</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#818cf8]">{`  "focus_score"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00ff88]">&quot;98%&quot;</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#818cf8]">{`  "stat_gains"`}</span>
                    <span className="text-[#8a8a8a]">{`: {\n`}</span>
                    <span className="text-[#c084fc]">{`    "INT_gain"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00ff88]">&quot;+3.1&quot;</span>
                    <span className="text-[#8a8a8a]">,{"\n"}</span>
                    <span className="text-[#c084fc]">{`    "raid_damage"`}</span>
                    <span className="text-[#8a8a8a]">: </span>
                    <span className="text-[#00ff88]">&quot;+420 HP&quot;</span>
                    {"\n"}
                    <span className="text-[#8a8a8a]">{`  }\n}`}</span>
                  </>
                )}
              </pre>
            </div>
          </div>

          {/* Right Column: Hunter Stat Yields & Live Graphs */}
          <div className="flex flex-col bg-[#141414]">
            {/* Top 4 Real-World Yield Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4">
              <div className="border-black p-4 border-b-2 sm:border-b-0 border-r-2">
                <p className="retro text-[7px] tracking-widest text-neutral-500 uppercase">
                  Fatigue Index
                </p>
                <p className="mt-1.5 retro text-xs sm:text-sm font-bold text-[#f9f4da]">
                  14% <span className="text-[8px] text-[#00ff88]">-32%</span>
                </p>
              </div>
              <div className="border-black p-4 border-b-2 sm:border-b-0 sm:border-r-2">
                <p className="retro text-[7px] tracking-widest text-neutral-500 uppercase">
                  Habit Strength
                </p>
                <p className="mt-1.5 retro text-xs sm:text-sm font-bold text-[#f9f4da]">
                  94.2% <span className="text-[8px] text-[#00ff88]">+18%</span>
                </p>
              </div>
              <div className="border-black p-4 border-r-2">
                <p className="retro text-[7px] tracking-widest text-neutral-500 uppercase">
                  Daily EXP
                </p>
                <p className="mt-1.5 retro text-xs sm:text-sm font-bold text-[#f9f4da]">
                  4,850 <span className="text-[8px] text-[#00ff88]">+24%</span>
                </p>
              </div>
              <div className="border-black p-4">
                <p className="retro text-[7px] tracking-widest text-neutral-500 uppercase">
                  Boss Damage
                </p>
                <p className="mt-1.5 retro text-xs sm:text-sm font-bold text-[#f9f4da]">
                  18.4k <span className="text-[8px] text-[#00ff88]">+52%</span>
                </p>
              </div>
            </div>

            {/* 7-Day EXP Yield Bar Chart */}
            <div className="border-y-2 border-black p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="retro text-[8px] sm:text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                  7-Day EXP Gain Yield
                </span>
                <span className="retro text-[7px] tracking-widest text-[#00ff88] uppercase">
                  Continuous Momentum
                </span>
              </div>
              <div className="flex h-28 items-end gap-2">
                {[65, 78, 92, 70, 85, 94, 98].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 border-2 border-black bg-[#818cf8] transition-all duration-300 hover:brightness-110"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span
                    key={day}
                    className="flex-1 text-center retro text-[7px] text-neutral-500"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* Circadian HRV Recovery Area SVG Chart */}
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="retro text-[8px] sm:text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                  Circadian HRV Recovery (ms)
                </span>
                <span className="flex items-center gap-1.5 retro text-[7px] text-[#00ff88]">
                  <span className="h-2 w-2 bg-[#38bdf8]" /> Optimal Parasympathetic
                </span>
              </div>
              <svg
                viewBox="0 0 440 90"
                preserveAspectRatio="none"
                className="h-24 w-full"
              >
                <defs>
                  <linearGradient id="bs-lat-ascend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,60 C60,58 90,20 150,16 C210,12 230,50 300,58 C360,64 400,68 440,70 L440,90 L0,90 Z"
                  fill="url(#bs-lat-ascend)"
                />
                <path
                  d="M0,60 C60,58 90,20 150,16 C210,12 230,50 300,58 C360,64 400,68 440,70"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
