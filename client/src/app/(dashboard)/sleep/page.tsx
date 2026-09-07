"use client";

import React, { useEffect, useState } from "react";
import {
  PixelWaterfallIcon,
  PixelFlameIcon,
} from "@/components/ui/pixel/PixelIcons";
import { cn } from "@/lib/utils";
import { SleepLoggerCard } from "@/features/sleep/components/SleepLoggerCard";
import { SleepHistoryChart } from "@/features/sleep/components/SleepHistoryChart";
import { WaterfallAmbientPlayer } from "@/features/sleep/components/WaterfallAmbientPlayer";
import { AiraSleepAdvisory } from "@/features/sleep/components/AiraSleepAdvisory";
import { useSleepStore } from "@/features/sleep/store/useSleepStore";
import { NumberTicker } from "@/components/ui/number-ticker";

export default function SleepPage() {
  const { getCurrentStreak } = useSleepStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const streak = getCurrentStreak();

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-5 md:p-8 pb-28 space-y-6 text-slate-100 relative select-none">
      {/* Hero Header Banner */}
      <div className="relative bg-[#140a26]/95 border-2 border-[#3c1860] p-5 sm:p-7 shadow-[0_4px_0_0_#000] overflow-hidden backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 bg-[#251040] border-2 border-[#f59e0b] flex items-center justify-center flex-shrink-0">
              <PixelWaterfallIcon className="w-8 h-8 text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-pixel font-bold text-white tracking-wide">
                Sleep Sanctuary & Somatic Restoration
              </h1>

              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-sans leading-relaxed text-pretty">
                Rest in the tranquil mists of the nocturnal waterfall. Logging restorative sleep clears metabolic fatigue, accelerates myofibril tissue recovery, and permanently scales your character&apos;s real-world <span className="text-[#fde047] font-bold">Recovery (REC)</span> stat. Target the 8.0-hour golden equinox for maximum somatic bounties!
              </p>
            </div>
          </div>

          {/* Quick HUD Telemetry Strip */}
          <div className="flex items-center gap-5 p-2 font-pixel text-xs flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t lg:border-t-0 border-[#3c1860]/40">
            <div className="text-left sm:text-right">
              <span className="text-xs text-[#fbbf24] block font-bold">
                Rest Streak
              </span>
              <span className="text-base sm:text-lg font-bold text-[#34d399] flex items-center gap-1.5 justify-start sm:justify-end tabular-nums" suppressHydrationWarning>
                <PixelFlameIcon className={cn("w-4 h-4", streak > 0 ? "text-[#f59e0b] animate-pulse" : "text-[#78695d]")} />{" "}
                {mounted ? <NumberTicker value={streak} /> : streak} Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sanctuary Soundscape Ambient Bar */}
      <WaterfallAmbientPlayer />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        {/* Left Column: Interactive Sleep Logger */}
        <div className="lg:col-span-7 space-y-6">
          <SleepLoggerCard />
        </div>

        {/* Right Column: 7-Day History & AIRA Intelligence */}
        <div className="lg:col-span-5 space-y-6">
          <SleepHistoryChart />
          <AiraSleepAdvisory />
        </div>
      </div>
    </div>
  );
}
