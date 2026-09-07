"use client";

import React from "react";
import { PixelFlameIcon, PixelAwardIcon } from "@/components/ui/pixel/PixelIcons";
import { PomodoroTimer } from "@/features/learning/components/PomodoroTimer";
import { HabitLinkSelector } from "@/features/learning/components/HabitLinkSelector";
import { AmbientSoundPlayer } from "@/features/learning/components/AmbientSoundPlayer";
import { FocusStatistics } from "@/features/learning/components/FocusStatistics";
import { ForbiddenGrimoireCard } from "@/features/learning/components/ForbiddenGrimoireCard";
import { PixelAncientLibraryBackground } from "@/components/ui/pixel/PixelAncientLibraryBackground";
import { useLearningStore } from "@/features/learning/store/useLearningStore";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

export default function LearningPage() {
  const { completedCycles, getFocusStreak, isArchivistMode } = useLearningStore();
  const streak = getFocusStreak();

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-5 md:p-8 pb-28 space-y-6 text-slate-100 relative select-none">
      {/* 1. Realtime Animated Ancient Library Canvas Background */}
      <PixelAncientLibraryBackground />

      {/* 2. Scriptorium Master Archivist Desk Banner */}
      <div className="relative bg-[#231109] border-4 border-[#140804] p-5 sm:p-7 shadow-[0_8px_16px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300">
        {/* 4 Beveled Gold Corner Brackets */}
        <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-[#f59e0b] pointer-events-none" />

        {/* Ambient Woodgrain Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-pixel font-bold text-[#fef08a] tracking-wide drop-shadow-[0_2px_0_#000]">
              Archives & Scribe Chamber
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed text-pretty font-medium">
              Enter deep cognitive flow states beneath the towering mahogany bookshelves of the ancient library. Inscribing Pomodoro focus rites scales your character&apos;s real-world <span className="text-[#fde047] font-bold">Knowledge (KNO)</span>, <span className="text-[#38bdf8] font-bold">Focus (FOC)</span>, and <span className="text-[#fb7185] font-bold">Discipline (DIS)</span> attributes!
            </p>
          </div>

          {/* Quick HUD Telemetry Strip */}
          <div className="flex items-center gap-6 p-3 bg-[#170a04] border-2 border-[#542d17] font-pixel text-xs flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end shadow-[inset_1px_1px_0_0_#3d1d0c]">
            <div className="text-left sm:text-right">
              <span className="text-xs text-[#fbbf24] block font-bold">
                Scribe Streak
              </span>
              <span className="text-base sm:text-lg font-bold text-[#34d399] flex items-center gap-1.5 justify-start sm:justify-end tabular-nums">
                <PixelFlameIcon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    streak > 0
                      ? "text-[#f59e0b] drop-shadow-[0_0_6px_rgba(245,158,11,0.7)] animate-pulse"
                      : "text-[#78695d]"
                  )}
                />
                <NumberTicker value={streak} /> Days
              </span>
            </div>

            <div className="h-8 w-0.5 bg-[#542d17] hidden sm:block" />

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#fbbf24] block font-bold">
                Focus Blocks
              </span>
              <span className="text-base sm:text-lg font-bold text-[#fef08a] flex items-center gap-1.5 justify-start sm:justify-end tabular-nums">
                <PixelAwardIcon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    completedCycles > 0
                      ? "text-[#f59e0b] drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]"
                      : "text-[#78695d]"
                  )}
                />
                <NumberTicker value={completedCycles} /> Rites
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        {/* Left Column: Pomodoro Chrono-Desk, Habit Linker, & Ambient Soundscape */}
        <div className="lg:col-span-7 space-y-6">
          <PomodoroTimer />
          
          <div className={cn("space-y-6 transition-opacity duration-300", isArchivistMode && "opacity-25 pointer-events-none")}>
            <HabitLinkSelector />
            <AmbientSoundPlayer />
          </div>
        </div>

        {/* Right Column: Scribe Telemetry Chronicles & Forbidden Grimoire Flashcards */}
        <div className={cn("lg:col-span-5 space-y-6 transition-opacity duration-300", isArchivistMode && "opacity-25 pointer-events-none")}>
          <FocusStatistics />
          <ForbiddenGrimoireCard />
        </div>
      </div>
    </div>
  );
}
