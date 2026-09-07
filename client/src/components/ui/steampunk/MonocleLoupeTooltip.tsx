"use client";

import React from "react";
import { PixelClockIcon, PixelGearIcon, PixelStarIcon } from "@/components/ui/pixel/PixelIcons";
import { cn } from "@/lib/utils";
import { VacuumTubeBar } from "./VacuumTubeBar";
import { MonocleLoupeTooltipData } from "./types";

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/**
 * Ornate Victorian Jeweler's Loupe & Steampunk Monocle Hover Tooltip
 */
export function MonocleLoupeTooltip({
  data,
}: {
  data: MonocleLoupeTooltipData | null;
}) {
  if (!data) return null;

  const rate = data.snapshot?.completionRate;

  return (
    <div
      style={{
        position: "fixed",
        left: `${data.x}px`,
        top: data.y < 240 ? `${data.y + 24}px` : `${data.y - 14}px`,
        transform: data.y < 240 ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
      className="w-88 p-5 bg-[#180b05]/98 backdrop-blur-2xl border-3 border-[#f59e0b] text-slate-100 font-mono shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.15)] animate-in fade-in zoom-in-95 duration-100 select-none overflow-hidden rounded-xs"
    >
      {/* 4 Corner Brass Mounting Rivets */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#fde047] border border-black shadow-[0_0.5px_0_#fff]" />
      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#fde047] border border-black shadow-[0_0.5px_0_#fff]" />
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-[#fde047] border border-black shadow-[0_0.5px_0_#fff]" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-[#fde047] border border-black shadow-[0_0.5px_0_#fff]" />

      {/* Convex Glass Specular Lens Reflection */}
      <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/15 via-white/5 to-transparent pointer-events-none" />

      {/* Loupe Header: Date & Weekday */}
      <div className="flex items-center justify-between border-b border-[#542d17] pb-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <PixelGearIcon className="w-4 h-4 text-[#f59e0b] shrink-0" />
          <span className="font-pixel text-base font-bold text-[#fef08a] tracking-wide">
            {data.dateStr}
          </span>
        </div>
        <span className="text-xs font-pixel text-[#fde047] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#120703] border border-[#542d17]">
          {WEEKDAYS[data.dateObj.getDay()]}
        </span>
      </div>

      {/* Telemetry Breakdown */}
      <div className="space-y-2.5 mb-3.5 text-sm">
        {data.snapshot ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-amber-100 font-medium">Disciplines Executed:</span>
              <strong className="text-[#fef08a] font-pixel text-sm sm:text-base font-bold">
                {data.snapshot.completedCount} / {data.snapshot.totalCount}
              </strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-amber-100 font-medium">Manifold Pressure:</span>
              <strong className="text-[#fde047] font-pixel text-sm sm:text-base font-bold">
                {Math.round(data.snapshot.completionRate)}%
              </strong>
            </div>

            {/* Steampunk Segmented Vacuum Filament Tube */}
            <div className="pt-1.5">
              <VacuumTubeBar
                percentage={data.snapshot.completionRate}
                size="md"
                variant={rate !== undefined && rate >= 100 ? "gold" : rate !== undefined && rate >= 66 ? "amber" : "copper"}
              />
            </div>
          </>
        ) : (
          <div className="text-sm text-amber-200/80 italic py-1.5">
            No chronometer telemetry recorded for this cycle.
          </div>
        )}
      </div>

      {/* Due Missions List */}
      {data.missions.length > 0 && (
        <div className="pt-3 border-t border-[#542d17] space-y-2">
          <div className="text-sm font-pixel font-bold uppercase text-[#fbbf24] flex items-center gap-1.5">
            <PixelClockIcon className="w-4 h-4 text-[#f59e0b]" />
            <span>Directives Due ({data.missions.length})</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-0.5">
            {data.missions.map((m) => (
              <div
                key={m.id}
                className="p-2 bg-[#100602] border border-[#542d17] flex items-center justify-between text-sm gap-2"
              >
                <span className="truncate text-[#fef08a] font-sans font-medium">{m.title}</span>
                <span
                  className={cn(
                    "text-xs font-pixel font-bold px-2 py-0.5 shrink-0 border",
                    m.status === "Completed"
                      ? "bg-[#381a0c] text-[#fef08a] border-[#f59e0b]"
                      : "bg-[#251006] text-[#fbbf24] border-[#78350f]"
                  )}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loupe Footer Reticle Prompt */}
      <div className="mt-3 pt-2.5 border-t border-[#45200c] text-xs font-pixel text-[#fbbf24] text-center tracking-wider font-bold flex items-center justify-center gap-2">
        <PixelStarIcon className="w-3 h-3 text-[#f59e0b] shrink-0" />
        <span>Click to calibrate date & inscribe directive</span>
        <PixelStarIcon className="w-3 h-3 text-[#f59e0b] shrink-0" />
      </div>
    </div>
  );
}
