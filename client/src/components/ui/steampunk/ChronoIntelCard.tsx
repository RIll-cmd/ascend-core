"use client";

import React from "react";
import { PixelClockIcon, PixelPlusIcon } from "@/components/ui/pixel/PixelIcons";
import { cn } from "@/lib/utils";
import { RivetedBoilerCard } from "./RivetedBoilerCard";
import { NixieDisplay } from "./NixieDigit";
import { VacuumTubeBar } from "./VacuumTubeBar";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { ChronoSnapshot } from "./types";
import { KanbanQuest } from "@/features/habits/types/kanban";
import { playChronoChime } from "@/utils/steampunkAudio";

export interface ChronoIntelCardProps {
  selectedDate: string;
  isToday: boolean;
  selectedSnapshot?: ChronoSnapshot;
  selectedMissions: KanbanQuest[];
  onOpenCreateDeadline: () => void;
  className?: string;
}

/**
 * Selected Date Chrono Intel Telemetry Card with Bourdon Manometer and Nixie Displays
 */
export function ChronoIntelCard({
  selectedDate,
  isToday,
  selectedSnapshot,
  selectedMissions,
  onOpenCreateDeadline,
  className = "",
}: ChronoIntelCardProps) {
  const completedCount = selectedSnapshot ? selectedSnapshot.completedCount : 0;
  const totalCount = selectedSnapshot ? selectedSnapshot.totalCount : 0;
  const completionRate = selectedSnapshot ? selectedSnapshot.completionRate : 0;

  const handleInscribe = () => {
    playChronoChime(783.99, 0.4);
    onOpenCreateDeadline();
  };

  return (
    <RivetedBoilerCard
      variant="default"
      className={cn("space-y-4 flex flex-col justify-between select-none", className)}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#542d17] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#120703] border-2 border-[#78350f] flex items-center justify-center text-[#fbbf24] shadow-[inset_0_1px_3px_#000]">
              <PixelClockIcon className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-pixel font-bold uppercase text-[#f59e0b]">
                Selected Chrono Intel
              </h4>
              <p className="text-lg sm:text-xl font-pixel font-bold text-[#fef08a]">
                {selectedDate}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "text-xs sm:text-sm font-pixel font-bold px-3 py-1 border shadow-[inset_0_1px_2px_#000]",
              isToday
                ? "bg-[#381a0c] border-[#f59e0b] text-[#fef08a] shadow-[0_0_6px_rgba(245,158,11,0.4)]"
                : "bg-[#120703] border-[#542d17] text-amber-300 font-medium"
            )}
          >
            {isToday ? "TODAY" : "ARCHIVE"}
          </span>
        </div>

        {/* Dual Nixie & Manometer Telemetry Section */}
        <div className="grid grid-cols-2 gap-3.5 mb-4">
          {/* Habits Completed Box */}
          <div className="p-3.5 bg-[#100602] border-2 border-[#45200c] shadow-[inset_0_2px_4px_#000] flex flex-col items-center justify-center text-center">
            <span className="text-xs font-mono text-[#fde047] font-bold uppercase tracking-wider mb-1.5">
              DISCIPLINES
            </span>
            <NixieDisplay
              value={`${completedCount}/${totalCount}`}
              size="md"
            />
          </div>

          {/* Manometer Quota Box */}
          <div className="p-3.5 bg-[#100602] border-2 border-[#45200c] shadow-[inset_0_2px_4px_#000] flex flex-col items-center justify-center text-center">
            <span className="text-xs font-mono text-[#fde047] font-bold uppercase tracking-wider mb-1.5">
              PRESSURE
            </span>
            <NixieDisplay
              value={`${Math.round(completionRate)}%`}
              size="md"
            />
          </div>
        </div>

        {/* Segmented Vacuum Tube Progress */}
        <div className="p-3.5 bg-[#120703] border-2 border-[#45200c] shadow-[inset_0_1px_3px_#000] space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm font-mono">
            <span className="text-amber-100 font-medium uppercase text-xs sm:text-sm">
              Manifold Core Quota:
            </span>
            <span className="text-[#fde047] font-pixel font-bold text-sm sm:text-base">
              {Math.round(completionRate)}%
            </span>
          </div>
          <VacuumTubeBar
            percentage={completionRate}
            size="md"
            variant={completionRate >= 100 ? "gold" : completionRate >= 66 ? "amber" : "copper"}
          />
        </div>

        {/* Deadlines Scheduled Count */}
        <div className="p-3.5 bg-[#120703] border-2 border-[#45200c] flex justify-between items-center text-sm font-mono mb-4">
          <span className="text-amber-100 font-pixel text-xs sm:text-sm uppercase font-bold">
            Pneumatic Directives:
          </span>
          <span className="text-[#fbbf24] font-pixel font-bold text-sm sm:text-base">
            {selectedMissions.length} Scheduled
          </span>
        </div>
      </div>

      {/* Inscribe Deadline Button */}
      <PixelButton
        variant="gold"
        size="md"
        onClick={handleInscribe}
        className="w-full font-pixel font-bold text-sm sm:text-base py-3 flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_0_#000]"
      >
        <PixelPlusIcon className="w-4.5 h-4.5" />
        <span>Inscribe Directive For {selectedDate}</span>
      </PixelButton>
    </RivetedBoilerCard>
  );
}
