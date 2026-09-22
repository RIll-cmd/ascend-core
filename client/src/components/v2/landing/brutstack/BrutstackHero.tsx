"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import {
  GraphicWorkoutsIcon,
  GraphicHabitsIcon,
  GraphicLearningIcon,
  GraphicSleepIcon,
  GraphicAchievementsIcon,
  GraphicBeastsIcon,
  GraphicTowerIcon,
  GraphicAiraIcon,
  GraphicBossesIcon,
  GraphicBossPRIcon,
} from "@/components/ui/icons/SidebarGraphicIcons";
import { Hero1 } from "@/components/ui/8bit";
import "./BrutstackStyles.css";

interface BrutstackHeroProps {
  onStartBuilding?: () => void;
  onReadDocs?: () => void;
  onGuestClick?: () => void;
}

export function BrutstackHero({
  onStartBuilding,
  onReadDocs,
  onGuestClick,
}: BrutstackHeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[#1a1a1a] pt-16 pb-24 lg:pt-28 text-[#f9f4da]">
      {/* 8 Floating Ascend Core Attribute Badges */}
      {/* 1. STR (Strength & Iron Gym) */}
      <div
        className="pointer-events-none absolute select-none top-[7%] left-[22%] hidden md:block z-0"
        aria-hidden="true"
      >
        <div className="bs-float" style={{ animationDelay: "-1.5s" }}>
          <div className="flex h-14 w-14 flex-col items-center justify-center border-2 border-black bg-[#141414] shadow-[3px_3px_0_0_#ff3344]">
            <GraphicWorkoutsIcon className="h-6 w-6" />
            <span className="retro text-[7px] font-bold text-[#ff3344] mt-0.5">STR</span>
          </div>
        </div>
      </div>

      {/* 2. DIS (Discipline & Habit Matrix) */}
      <div
        className="pointer-events-none absolute select-none top-[17%] left-[8%] hidden lg:block z-0"
        aria-hidden="true"
      >
        <div className="bs-float" style={{ animationDelay: "-3s" }}>
          <div className="flex h-14 w-14 flex-col items-center justify-center border-2 border-black bg-[#141414] shadow-[3px_3px_0_0_#fcba28]">
            <GraphicHabitsIcon className="h-6 w-6" />
            <span className="retro text-[7px] font-bold text-[#fcba28] mt-0.5">DIS</span>
          </div>
        </div>
      </div>

      {/* 3. INT (Focus & Deep Work Sanctuary) */}
      <div
        className="pointer-events-none absolute select-none top-[27%] left-[18%] hidden lg:block z-0"
        aria-hidden="true"
      >
        <div className="bs-float" style={{ animationDelay: "-4s" }}>
          <div className="flex h-14 w-14 flex-col items-center justify-center border-2 border-black bg-[#141414] shadow-[3px_3px_0_0_#a855f7]">
            <GraphicLearningIcon className="h-6 w-6" />
            <span className="retro text-[7px] font-bold text-[#a855f7] mt-0.5">INT</span>
          </div>
        </div>
      </div>

      {/* 4. REC (Sleep Hygiene & Circadian) */}
      <div
        className="pointer-events-none absolute select-none top-[47%] left-[11%] hidden xl:block z-0"
        aria-hidden="true"
      >
        <div className="bs-float" style={{ animationDelay: "-2s" }}>
          <div className="flex h-14 w-14 flex-col items-center justify-center border-2 border-black bg-[#141414] shadow-[3px_3px_0_0_#22c55e]">
            <GraphicSleepIcon className="h-6 w-6" />
            <span className="retro text-[7px] font-bold text-[#22c55e] mt-0.5">REC</span>
          </div>
        </div>
      </div>

      {/* 5. S-RANK (Hunter Awakening & Solo Leveling) */}
      <div
        className="pointer-events-none absolute select-none top-[7%] right-[22%] hidden md:block z-0"
        aria-hidden="true"
      >
        <div className="bs-float" style={{ animationDelay: "-0.5s" }}>
          <div className="flex h-14 w-14 flex-col items-center justify-center border-2 border-black bg-[#141414] shadow-[3px_3px_0_0_#ffd700]">
            <GraphicAchievementsIcon className="h-6 w-6" />
            <span className="retro text-[7px] font-bold text-[#ffd700] mt-0.5">S-RANK</span>
          </div>
        </div>
      </div>

      {/* 6. DRAGONS (20 Step Incubators) */}
      <div
        className="pointer-events-none absolute select-none top-[17%] right-[8%] hidden lg:block z-0"
        aria-hidden="true"
      >
        <div className="bs-float" style={{ animationDelay: "-2.5s" }}>
          <div className="flex h-14 w-14 flex-col items-center justify-center border-2 border-black bg-[#141414] shadow-[3px_3px_0_0_#14b6e5]">
            <GraphicBeastsIcon className="h-6 w-6" />
            <span className="retro text-[7px] font-bold text-[#14b6e5] mt-0.5">BEAST</span>
          </div>
        </div>
      </div>

      {/* 7. END (Endurance & Cardio) */}
      <div
        className="pointer-events-none absolute select-none top-[27%] right-[18%] hidden lg:block z-0"
        aria-hidden="true"
      >
        <div className="bs-float" style={{ animationDelay: "-3.5s" }}>
          <div className="flex h-14 w-14 flex-col items-center justify-center border-2 border-black bg-[#141414] shadow-[3px_3px_0_0_#38bdf8]">
            <GraphicTowerIcon className="h-6 w-6" />
            <span className="retro text-[7px] font-bold text-[#38bdf8] mt-0.5">END</span>
          </div>
        </div>
      </div>

      {/* 8. AIRA (Neural Co-Pilot) */}
      <div
        className="pointer-events-none absolute select-none top-[47%] right-[11%] hidden xl:block z-0"
        aria-hidden="true"
      >
        <div className="bs-float" style={{ animationDelay: "-1s" }}>
          <div className="flex h-14 w-14 flex-col items-center justify-center border-2 border-black bg-[#141414] shadow-[3px_3px_0_0_#00ff88]">
            <GraphicAiraIcon className="h-6 w-6" />
            <span className="retro text-[7px] font-bold text-[#00ff88] mt-0.5">AIRA</span>
          </div>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* 8-bit Hero Block (Replaces middle text and buttons, keeping all floating badges intact) */}
        <Hero1
          badges={[
            {
              label: "// THE REALITY TO RPG OPERATING SYSTEM",
              variant: "gold",
              className:
                "retro border-2 border-black bg-[#fcba28] text-black font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000] text-[8px] sm:text-[9px] py-1 px-3 mb-2",
            },
          ]}
          title={
            <>
              LEVEL UP REALITY
              <br />
              ASCEND YOUR <span className="text-[#14b6e5] drop-shadow-[0_0_12px_rgba(20,182,229,0.35)]">ATTRIBUTES</span>
            </>
          }
          description="Forge real-world discipline into RPG combat power. Conquer dungeon gates through physical volume, habit streaks, and sleep telemetry."
          descriptionClassName="retro text-[9px] sm:text-[10px] md:text-[10px] text-neutral-400 max-w-lg leading-relaxed mx-auto px-4"
          actions={[
            {
              label: (
                <span className="retro flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-bold">
                  AWAKEN YOUR HUNTER
                  <ArrowRight className="h-4 w-4" />
                </span>
              ),
              onClick: onStartBuilding,
              variant: "gold",
              size: "lg",
              borderStyle: "retro-beveled",
              className: "bg-[#fcba28] dark:bg-[#fcba28] text-black dark:text-black hover:bg-[#ffd700] dark:hover:bg-[#ffd700] shadow-[3px_3px_0_0_#000] px-6 py-3",
            },
            {
              label: (
                <span className="retro text-[9px] sm:text-[10px] font-bold text-[#14b6e5]">
                  TRY AS GUEST
                </span>
              ),
              onClick: onGuestClick,
              variant: "outline",
              size: "lg",
              borderStyle: "retro-beveled",
              className: "border-2 border-[#14b6e5] text-[#14b6e5] hover:bg-[#14b6e5]/10 shadow-[3px_3px_0_0_#000] px-5 py-3",
            },
            {
              label: (
                <span className="retro text-[9px] sm:text-[10px] font-bold">
                  HUNTER CODEX
                </span>
              ),
              onClick: onReadDocs,
              variant: "outline",
              size: "lg",
              borderStyle: "retro-beveled",
              className: "border-2 border-[#f9f4da] text-[#f9f4da] hover:bg-[#f9f4da]/10 shadow-[3px_3px_0_0_#000] px-6 py-3",
            },
          ]}
          className="p-0 mb-14 sm:mb-20 max-w-4xl"
        />

        {/* 4-Stat Metrics Bar */}
        <div className="mb-20 sm:mb-24 flex flex-wrap justify-center divide-x-2 divide-[#f9f4da] border-2 border-[#f9f4da] bg-[#1a1a1a] shadow-[4px_4px_0_0_#000]">
          <div className="px-5 py-3 text-center md:px-8">
            <p className="retro text-base font-bold tracking-wide md:text-xl text-[#00ff88]">
              99.4%
            </p>
            <p className="retro mt-1.5 text-[8px] tracking-widest text-neutral-400 uppercase font-bold">
              HABIT RETENTION
            </p>
          </div>
          <div className="px-5 py-3 text-center md:px-8">
            <p className="retro text-base font-bold tracking-wide md:text-xl text-[#14b6e5]">
              19
            </p>
            <p className="retro mt-1.5 text-[8px] tracking-widest text-neutral-400 uppercase font-bold">
              SUBSYSTEMS
            </p>
          </div>
          <div className="px-5 py-3 text-center md:px-8">
            <p className="retro text-base font-bold tracking-wide md:text-xl text-[#fcba28]">
              20+
            </p>
            <p className="retro mt-1.5 text-[8px] tracking-widest text-neutral-400 uppercase font-bold">
              TOWER FLOORS &amp; BOSSES
            </p>
          </div>
          <div className="px-5 py-3 text-center md:px-8">
            <p className="retro text-base font-bold tracking-wide md:text-xl text-[#c084fc]">
              10K+
            </p>
            <p className="retro mt-1.5 text-[8px] tracking-widest text-neutral-400 uppercase font-bold">
              ACTIVE HUNTERS
            </p>
          </div>
        </div>

        {/* Quad-Layered Neobrutalist Dashboard Frame */}
        <div className="bs-dash group relative mx-auto w-full max-w-5xl">
          {/* 4 Offset Color Layers */}
          <div
            aria-hidden="true"
            className="bs-dash-layer bs-l1 absolute inset-0 border-2 border-black"
            style={{ backgroundColor: "#fcba28" }}
          />
          <div
            aria-hidden="true"
            className="bs-dash-layer bs-l2 absolute inset-0 border-2 border-black"
            style={{ backgroundColor: "#ff3333" }}
          />
          <div
            aria-hidden="true"
            className="bs-dash-layer bs-l3 absolute inset-0 border-2 border-black"
            style={{ backgroundColor: "#14b6e5" }}
          />
          <div
            aria-hidden="true"
            className="bs-dash-layer bs-l4 absolute inset-0 border-2 border-black"
            style={{ backgroundColor: "#f9f4da" }}
          />

          {/* Main Terminal/Dashboard Container */}
          <div className="relative border-2 border-black bg-[#141414] text-left">
            {/* Window Header */}
            <div className="flex items-center gap-2 border-b-2 border-black bg-[#1c1c1c] px-4 py-3">
              <span className="h-3 w-3 rounded-full border border-black/40 bg-[#ff3333]" />
              <span className="h-3 w-3 rounded-full border border-black/40 bg-[#fcba28]" />
              <span className="h-3 w-3 rounded-full border border-black/40 bg-[#00ff88]" />
              <span className="flex-1 text-center retro text-[8px] sm:text-[9px] font-bold text-neutral-400">
                ascend-core.os/hunter/telemetry
              </span>
            </div>

            {/* 4-Panel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Panel 1: Reality Layer Terminal */}
              <div className="space-y-3 border-b-2 border-black p-5 md:border-r-2">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 bg-[#00ff88]" />
                  <span className="retro text-[8px] sm:text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                    Reality Layer Terminal
                  </span>
                </div>
                <div className="space-y-2 retro text-[8px] sm:text-[9px] leading-relaxed">
                  <p className="text-[#00ff88]">$ ascend sync --reality-layer</p>
                  <p className="text-neutral-400">Ingesting daily biometric telemetry...</p>
                  <p className="text-[#818cf8]">Workout: Bench Press PR 225 lbs (+120 EXP, +1.8 STR)</p>
                  <p className="text-[#fcba28]">Habit Chain: Morning Routine [=========&gt;] 100%</p>
                  <p className="text-[#00d4ff]">Hunter Combat Power: 4,820 (S-Rank Monarch)</p>
                  <span className="bs-caret inline-block h-3.5 w-2 bg-[#00ff88] align-middle" />
                </div>
              </div>

              {/* Panel 2: Combat Equilibrium & Power Rating */}
              <div className="space-y-3 border-b-2 border-black p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 bg-[#818cf8]" />
                    <span className="retro text-[8px] sm:text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                      Combat Equilibrium
                    </span>
                  </div>
                  <span className="retro text-[9px] sm:text-[10px] font-bold text-[#00ff88]">
                    98.7% S-RANK
                  </span>
                </div>
                <svg
                  viewBox="0 0 444 120"
                  preserveAspectRatio="none"
                  className="h-28 w-full"
                >
                  <defs>
                    <linearGradient id="bs-perf-ascend" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#818cf8"
                        stopOpacity="0.55"
                      />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,92 C40,88 60,70 100,66 C140,62 160,52 200,54 C240,56 260,36 300,32 C340,28 380,26 444,14 L444,120 L0,120 Z"
                    fill="url(#bs-perf-ascend)"
                  />
                  <path
                    d="M0,92 C40,88 60,70 100,66 C140,62 160,52 200,54 C240,56 260,36 300,32 C340,28 380,26 444,14"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {/* Panel 3: Hunter State Inspector */}
              <div className="space-y-3 p-5 md:border-r-2 md:border-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 bg-[#c084fc]" />
                    <span className="retro text-[8px] sm:text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                      Hunter State Inspector
                    </span>
                  </div>
                  <span className="border-2 border-[#00ff88] px-2 py-0.5 retro text-[7px] font-bold text-[#00ff88]">
                    SYNCHRONIZED
                  </span>
                </div>
                <pre className="retro text-[8px] sm:text-[9px] leading-relaxed text-neutral-300">
                  {`{\n  "hunter_rank": `}
                  <span className="text-[#00ff88]">&quot;S-Rank Monarch&quot;</span>
                  {`,\n  "level": `}
                  <span className="text-[#818cf8]">42</span>
                  {`,\n  "streak_shield": `}
                  <span className="text-[#fcba28]">&quot;ACTIVE&quot;</span>
                  {`,\n  "beast": `}
                  <span className="text-[#00d4ff]">&quot;Ignis Drake (+15% STR)&quot;</span>
                  {`\n}`}
                </pre>
              </div>

              {/* Panel 4: Live Raid & Quest Feed */}
              <div className="space-y-3 p-5">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 bg-[#fcba28]" />
                  <span className="retro text-[8px] sm:text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                    Raid &amp; Quest Feed
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <GraphicBossesIcon
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <div>
                      <p className="retro text-[8px] sm:text-[9px] text-neutral-200 leading-relaxed">
                        [DUNGEON RAID] Floor 18 Void Golem defeated!
                      </p>
                      <p className="retro text-[7px] text-[#00ff88] mt-1">
                        +500 Gold, +120 EXP
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <GraphicHabitsIcon
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <div>
                      <p className="retro text-[8px] sm:text-[9px] text-neutral-200 leading-relaxed">
                        [STREAK FREEZE] Shield protected morning routine
                      </p>
                      <p className="retro text-[7px] text-neutral-500 mt-1">
                        Consistency curve preserved at 98%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <GraphicBossPRIcon
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <div>
                      <p className="retro text-[8px] sm:text-[9px] text-neutral-200 leading-relaxed">
                        [BOSS PR] Compound Deadlift milestone reached!
                      </p>
                      <p className="retro text-[7px] text-[#00ff88] mt-1">
                        405 lbs logged (+2.5 STR attribute)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Neon Pointer Cursor */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="bs-cursor pointer-events-none absolute right-8 bottom-10 z-20 h-8 w-8 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]"
          >
            <path
              d="M4 2 L4 18 L8.5 13.5 L11.5 20 L14 19 L11 12.5 L17 12.5 Z"
              fill="#00ff88"
              stroke="#000"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
