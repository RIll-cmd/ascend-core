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
        {/* 4-Stat Metrics Bar */}
        <div className="flex flex-wrap justify-center divide-x-2 divide-[#f9f4da] border-2 border-[#f9f4da] bg-[#1a1a1a] shadow-[4px_4px_0_0_#000]">
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
      </div>
    </section>
  );
}
