import React from "react";
import { evaluateRank } from "../utils/rankEngine";
import {
  PixelTargetIcon,
  PixelLightningIcon,
  PixelAwardIcon,
} from "@/components/ui/pixel/PixelIcons";
import { NumberTicker } from "@/components/ui/number-ticker";

interface ExerciseRankCardProps {
  exerciseName: string;
  e1rm: number;
  currentRank: string;
  nextRank: string;
  nextThreshold: number;
  progress: number;
}

export function ExerciseRankCard({
  exerciseName,
  e1rm,
  currentRank,
  nextRank,
  nextThreshold,
  progress,
}: ExerciseRankCardProps) {
  const rankInfo = evaluateRank(e1rm, exerciseName);
  const isMax = nextRank === "MAX";
  const displayRank = currentRank || rankInfo.rank;

  // Discrete 10-Segment Pixel Meter
  const totalSegments = 10;
  const filledSegments = Math.round((Math.min(100, Math.max(0, progress)) / 100) * totalSegments);

  return (
    <li
      className="relative group p-3.5 bg-[#140e0c] border-2 border-[#4a3830] hover:border-[#f59e0b] transition-colors duration-200 flex flex-col justify-between overflow-hidden select-none list-none"
      style={{
        boxShadow: "inset 2px 2px 0 #2c1e19, inset -2px -2px 0 #080605, 0 4px 0 #0a0706",
      }}
    >
      {/* Iron Corner Studs */}
      <span className="absolute top-1 left-1 font-mono text-[11px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
      <span className="absolute top-1 right-1 font-mono text-[11px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
      <span className="absolute bottom-1 left-1 font-mono text-[11px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
      <span className="absolute bottom-1 right-1 font-mono text-[11px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b-2 border-[#2c1e19]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 bg-[#261914] border-2 border-[#5c4033] flex items-center justify-center text-[#f59e0b] shrink-0">
            <PixelTargetIcon className="w-3.5 h-3.5 text-[#f59e0b]" />
          </div>
          <span className="font-sans font-bold text-xs sm:text-sm text-stone-100 truncate group-hover:text-amber-300 transition-colors">
            {exerciseName}
          </span>
        </div>

        <div
          className="px-2 py-0.5 border-2 border-[#f59e0b] bg-[#261914] font-pixel text-[11px] font-bold text-[#f59e0b] uppercase tracking-wider shrink-0"
          style={{
            boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.5)",
          }}
        >
          {displayRank} TIER
        </div>
      </div>

      {/* Stats Body */}
      <div className="pt-3 space-y-3 font-mono">
        <div className="flex justify-between items-end">
          <div>
            <span className="font-sans font-bold text-[11px] text-[#f59e0b] uppercase tracking-wider block">
              EST. 1-REP MAX (1RM)
            </span>
            <div className="text-base font-black text-white flex items-baseline gap-1 tabular-nums mt-0.5">
              <NumberTicker value={e1rm} className="tracking-tight font-sans text-lg font-black text-white" />
              <span className="font-sans font-bold text-xs text-stone-300">KG</span>
            </div>
          </div>

          {!isMax && (
            <div className="text-right">
              <span className="font-sans font-semibold text-[11px] text-stone-400 uppercase tracking-wider block">
                NEXT RANK ({nextRank})
              </span>
              <div className="text-xs font-bold text-[#f59e0b] flex items-baseline justify-end gap-1 tabular-nums mt-0.5 font-sans">
                <NumberTicker value={nextThreshold} className="font-sans font-bold text-xs text-[#f59e0b]" />
                <span className="font-sans font-semibold text-[11px] text-stone-400">KG</span>
              </div>
            </div>
          )}
        </div>

        {/* 16-Bit Segmented Progress Bar */}
        {!isMax ? (
          <div className="space-y-1.5 pt-1">
            <div className="grid grid-cols-10 gap-0.5 p-0.5 bg-[#0c0a09] border-2 border-[#4a3830]">
              {Array.from({ length: totalSegments }).map((_, idx) => {
                const isFilled = idx < filledSegments;
                return (
                  <div
                    key={idx}
                    className={`h-2.5 transition-colors duration-150 ${
                      isFilled
                        ? "bg-[#b91c1c] border-t border-l border-[#ef4444]"
                        : "bg-[#1c1412] opacity-40"
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between font-pixel text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <PixelLightningIcon className="w-2.5 h-2.5 text-[#f59e0b]" /> PROGRESS
              </span>
              <span className="text-[#f59e0b] font-bold tabular-nums flex items-center">
                <NumberTicker value={progress} className="text-[#f59e0b] font-pixel text-[11px] font-bold" />%
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            <div className="grid grid-cols-10 gap-0.5 p-0.5 bg-[#0c0a09] border-2 border-[#f59e0b]">
              {Array.from({ length: totalSegments }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-2.5 bg-[#f59e0b] border-t border-l border-[#fef08a]"
                />
              ))}
            </div>
            <div className="flex items-center justify-between font-pixel text-[11px] text-[#f59e0b] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <PixelAwardIcon className="w-3 h-3 text-[#f59e0b]" /> TOP TIER ACHIEVED
              </span>
              <span>MAX TIER</span>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

