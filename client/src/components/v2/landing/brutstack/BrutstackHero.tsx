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
    <section className="relative w-full overflow-hidden bg-[#1a1a1a] pt-14 pb-18 md:pt-18 md:pb-22 lg:pt-22 lg:pb-26 text-[#f9f4da]">
      {/* 8 Floating Ascend Core Attribute Badges */}
      {/* 1. STR (Strength & Iron Gym) */}
      <div
        className="pointer-events-none absolute select-none top-[8%] left-[22%] hidden md:block z-0"
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
        className="pointer-events-none absolute select-none top-[18%] left-[8%] hidden lg:block z-0"
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
        className="pointer-events-none absolute select-none top-[32%] left-[5%] hidden lg:block z-0"
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
        className="pointer-events-none absolute select-none top-[50%] left-[8%] hidden xl:block z-0"
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
        className="pointer-events-none absolute select-none top-[8%] right-[22%] hidden md:block z-0"
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
        className="pointer-events-none absolute select-none top-[18%] right-[8%] hidden lg:block z-0"
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
        className="pointer-events-none absolute select-none top-[32%] right-[5%] hidden lg:block z-0"
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
        className="pointer-events-none absolute select-none top-[50%] right-[8%] hidden xl:block z-0"
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
        {/* Headline & Description Block */}
        <div className="mb-9 space-y-4 max-w-4xl mx-auto">
          <h1 className="font-head text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight uppercase">
            LEVEL UP REALITY
            <br />
            ASCEND YOUR{" "}
            <span className="text-[#14b6e5] drop-shadow-[0_0_16px_rgba(20,182,229,0.35)]">
              ATTRIBUTES
            </span>
          </h1>
          <p className="bs-font-sans max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base md:text-lg mx-auto">
            Forge real-world discipline into RPG combat power. Conquer dungeon gates through physical volume, habit streaks, and sleep telemetry.
          </p>
        </div>

        {/* Neobrutalist Action Buttons */}
        <div className="mb-14 sm:mb-16 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={onStartBuilding}
            className="bs-retro bs-btn group relative block w-max cursor-pointer outline-none"
          >
            <div className="relative mr-3 mb-3">
              <span className="bs-retro__layer bs-retro__bottom absolute inset-0 border-2 border-black bg-[#14b6e5]" />
              <span className="bs-retro__layer bs-retro__middle absolute inset-0 border-2 border-black bg-[#fcba28]" />
              <span className="bs-retro__layer bs-retro__top relative flex items-center justify-center gap-3 border-2 border-black bg-[#f9f4da] px-8 py-3.5 text-sm font-bold tracking-widest text-[#1a1a1a]">
                AWAKEN YOUR HUNTER
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onGuestClick}
            className="bs-btn border-2 border-[#14b6e5] bg-[#141414] px-8 py-3.5 text-sm font-bold tracking-widest text-[#14b6e5] shadow-[3px_3px_0_0_#000] transition-transform duration-200 hover:-translate-y-1"
          >
            TRY AS GUEST
          </button>

          <button
            type="button"
            onClick={onReadDocs}
            className="bs-btn border-2 border-[#f9f4da] bg-[#141414] px-8 py-3.5 text-sm font-bold tracking-widest text-[#f9f4da] shadow-[3px_3px_0_0_#000] transition-transform duration-200 hover:-translate-y-1"
          >
            HUNTER CODEX
          </button>
        </div>

        {/* 4-Stat Metrics Bar */}
        <div className="flex flex-wrap justify-center divide-x-2 divide-[#f9f4da] border-2 border-[#f9f4da] bg-[#1a1a1a] shadow-[4px_4px_0_0_#000]">
          <div className="px-5 py-3 text-center md:px-8">
            <p className="bs-font-sans text-xl font-black tracking-wide md:text-2xl text-[#00ff88]">
              99.4%
            </p>
            <p className="bs-font-sans mt-1 text-[10px] tracking-widest text-neutral-400 uppercase font-bold md:text-xs">
              HABIT RETENTION
            </p>
          </div>
          <div className="px-5 py-3 text-center md:px-8">
            <p className="bs-font-sans text-xl font-black tracking-wide md:text-2xl text-[#14b6e5]">
              19
            </p>
            <p className="bs-font-sans mt-1 text-[10px] tracking-widest text-neutral-400 uppercase font-bold md:text-xs">
              SUBSYSTEMS
            </p>
          </div>
          <div className="px-5 py-3 text-center md:px-8">
            <p className="bs-font-sans text-xl font-black tracking-wide md:text-2xl text-[#fcba28]">
              20+
            </p>
            <p className="bs-font-sans mt-1 text-[10px] tracking-widest text-neutral-400 uppercase font-bold md:text-xs">
              TOWER FLOORS &amp; BOSSES
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
