"use client";

import React from "react";
import {
  PixelActivityIcon,
  PixelFlameIcon,
  PixelWaterfallIcon,
  PixelMoonSleepIcon,
} from "@/components/ui/pixel/PixelIcons";
import { useSleepStore } from "../store/useSleepStore";
import { cn } from "@/lib/utils";

export const SleepHistoryChart: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { sleepLogs, getAverageHours, getAverageEfficiency, getSleepDebt, getCurrentStreak } =
    useSleepStore();

  const avgHours = getAverageHours(7);
  const avgEfficiency = getAverageEfficiency(7);
  const sleepDebt = getSleepDebt();
  const streak = getCurrentStreak();

  // Get past 7 days logs
  const last7Logs = sleepLogs.slice(0, 7).reverse();

  return (
    <div
      className={cn(
        "relative rounded-none bg-[#140a26]/95 border-2 border-[#3c1860] p-5 sm:p-7 shadow-[0_4px_0_0_#000] overflow-visible text-slate-100 backdrop-blur-md space-y-5 select-none",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#3c1860]/60 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-[#251040] border-2 border-[#f59e0b] flex items-center justify-center flex-shrink-0">
            <PixelActivityIcon className="w-5 h-5 text-[#fbbf24]" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-pixel font-bold text-[#fbbf24] block">
              Somatic Telemetry
            </span>
            <h3 className="text-lg sm:text-xl font-pixel font-bold text-white tracking-wide">
              7-Day Sanctuary Flow
            </h3>
          </div>
        </div>
      </div>

      {/* 4 Telemetry Metrics (Flat Divided Strip - High Readability) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#3c1860]/50 border-y border-[#3c1860]/40 py-3.5">
        {/* Metric 1: Avg Duration */}
        <div className="px-3 py-1 space-y-1">
          <span className="text-xs sm:text-sm font-pixel text-slate-300 block font-bold">
            7-Day Avg
          </span>
          <div className="flex items-baseline gap-1 font-pixel">
            <span className="text-2xl sm:text-3xl font-bold text-[#fef08a] tabular-nums">
              {avgHours}
            </span>
            <span className="text-xs sm:text-sm text-[#fbbf24] font-bold">hrs</span>
          </div>
          <span className="text-xs sm:text-sm font-pixel font-bold text-[#34d399] block truncate">
            {avgHours >= 7.5 && avgHours <= 8.5 ? "Golden Equinox" : "Goal: 8.0h"}
          </span>
        </div>

        {/* Metric 2: Avg Efficiency */}
        <div className="px-3 py-1 space-y-1">
          <span className="text-xs sm:text-sm font-pixel text-slate-300 block font-bold">
            Regen Yield
          </span>
          <div className="flex items-baseline gap-1 font-pixel">
            <span className="text-2xl sm:text-3xl font-bold text-[#fef08a] tabular-nums">
              {avgEfficiency}%
            </span>
          </div>
          <span className="text-xs sm:text-sm font-pixel font-bold text-[#fbbf24] block truncate">
            Cellular Score
          </span>
        </div>

        {/* Metric 3: Sleep Debt */}
        <div className="px-3 py-1 space-y-1">
          <span className="text-xs sm:text-sm font-pixel text-slate-300 block font-bold">
            Sleep Debt
          </span>
          <div className="flex items-baseline gap-1 font-pixel">
            <span
              className={cn(
                "text-2xl sm:text-3xl font-bold tabular-nums",
                sleepDebt <= 0
                  ? "text-[#34d399]"
                  : sleepDebt > 5
                  ? "text-[#fb7185]"
                  : "text-[#fbbf24]"
              )}
            >
              {sleepDebt > 0 ? `-${sleepDebt}` : `+${Math.abs(sleepDebt)}`}
            </span>
            <span className="text-xs sm:text-sm text-slate-300 font-bold">hrs</span>
          </div>
          <span className="text-xs sm:text-sm font-pixel font-bold text-slate-300 block truncate">
            {sleepDebt <= 0 ? "Restored" : "Fatigue"}
          </span>
        </div>

        {/* Metric 4: Sleep Streak */}
        <div className="px-3 py-1 space-y-1">
          <span className="text-xs sm:text-sm font-pixel text-slate-300 block font-bold">
            Rest Streak
          </span>
          <div className="flex items-baseline gap-1 font-pixel">
            <span className="text-2xl sm:text-3xl font-bold text-[#facc15] tabular-nums">
              {streak}
            </span>
            <span className="text-xs sm:text-sm text-slate-300 font-bold">days</span>
          </div>
          <span className="text-xs sm:text-sm font-pixel font-bold text-[#f59e0b] flex items-center gap-1 truncate">
            <PixelFlameIcon className="w-4 h-4 flex-shrink-0" /> Unbroken
          </span>
        </div>
      </div>

      {/* 7-Day Waterfall Flow Chart Area */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-pixel font-bold text-[#fbbf24] flex items-center gap-2">
            <PixelWaterfallIcon className="w-4 h-4 text-[#f59e0b]" />
            7-Day Rest Duration vs 8.0h Target
          </span>
          <span className="text-xs sm:text-sm font-pixel text-[#fef08a] font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#f59e0b]" />
            8.0h Target Equinox
          </span>
        </div>

        {/* Visual Cascade Bars Area with Generous Headroom for Tooltips */}
        <div className="pt-8 pb-1 relative">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-3.5 relative">
            {/* 8.0h Golden Dashed Equinox Line */}
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-[#f59e0b]/70 pointer-events-none z-0"
              style={{ bottom: `${(8.0 / 12.0) * 100}%` }}
            />

            {last7Logs.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs sm:text-sm font-pixel">
                <PixelMoonSleepIcon className="w-8 h-8 mb-2 text-[#f59e0b]" />
                No sleep telemetry recorded yet.
              </div>
            ) : (
              last7Logs.map((log, idx) => {
                const heightPct = Math.min(100, Math.max(16, (log.hoursSlept / 12.0) * 100));
                const isTarget = Math.abs(log.hoursSlept - 8.0) <= 0.5;

                // Smart tooltip positioning so left/right edges are NEVER clipped
                const isFirst = idx === 0;
                const isLast = idx === last7Logs.length - 1;
                const tooltipAlignment = isFirst
                  ? "left-0"
                  : isLast
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";

                return (
                  <div
                    key={log.id}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer z-10"
                  >
                    {/* Floating Telemetry Tooltip (100% Fully Visible, Smart Boundary Aligned) */}
                    <div
                      className={cn(
                        "absolute -top-16 bg-[#160b2b] border-2 border-[#f59e0b] text-white text-xs sm:text-sm font-pixel p-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.9)]",
                        tooltipAlignment
                      )}
                    >
                      <div className="font-bold text-[#fef08a] text-xs sm:text-sm">
                        {log.hoursSlept}h Slept ({log.efficiencyScore}% Regen)
                      </div>
                      <div className="text-[#34d399] font-bold flex items-center gap-1.5 mt-1 text-xs">
                        <span>+{log.recoveryGain} REC</span> • <span>+{log.expAwarded} XP</span>
                      </div>
                    </div>

                    {/* The 8-Bit Pixel Waterfall Bar */}
                    <div
                      className={cn(
                        "w-full max-w-[36px] border-2 relative overflow-hidden",
                        isTarget
                          ? "bg-[#059669] border-[#34d399]"
                          : log.hoursSlept < 6
                          ? "bg-[#be123c] border-[#fb7185]"
                          : "bg-[#312e81] border-[#818cf8]"
                      )}
                      style={{ height: `${heightPct}%` }}
                    >
                      {/* Top Pixel White Water Foam */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-white/80 border-b border-black/40" />
                    </div>

                    {/* Day Label */}
                    <span className="text-xs sm:text-sm font-pixel font-bold text-slate-200 mt-2.5 truncate max-w-full group-hover:text-[#fef08a]">
                      {new Date(log.date).toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="text-xs sm:text-sm font-pixel font-bold text-white tabular-nums">
                      {log.hoursSlept}h
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Biometric Sleep Chronicle Table (Larger readable font) */}
      <div className="space-y-2.5 pt-2 border-t border-[#3c1860]/40">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-pixel font-bold text-[#fbbf24] block">
            Biometric Sleep Chronicle
          </span>
          <span className="text-xs sm:text-sm font-pixel text-slate-300">Past Rest Encounters</span>
        </div>

        <div className="divide-y divide-[#3c1860]/30 max-h-52 overflow-y-auto pr-1">
          {sleepLogs.length === 0 ? (
            <div className="text-center py-4 text-slate-400 text-xs sm:text-sm font-pixel">
              No historical sleep records available.
            </div>
          ) : (
            sleepLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="py-3 px-2.5 flex items-center justify-between text-xs sm:text-sm font-mono transition-colors hover:bg-[#180b2e]/60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#fef08a] font-pixel text-xs sm:text-sm font-bold">{log.date}</span>
                  <span className="px-2.5 py-1 bg-[#251040] text-[#fef08a] border border-[#3b1861] text-xs font-pixel font-bold">
                    {log.quality.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3.5 font-pixel text-xs sm:text-sm font-bold">
                  <span className="text-white tabular-nums">{log.hoursSlept}h</span>
                  <span className="text-[#34d399] tabular-nums">+{log.recoveryGain} REC</span>
                  <span className="text-[#facc15] tabular-nums">+{log.expAwarded} XP</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SleepHistoryChart;
