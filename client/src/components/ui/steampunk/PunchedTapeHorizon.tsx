"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChronoSnapshot, HorizonDayData } from "./types";
import { KanbanQuest } from "@/features/habits/types/kanban";

export interface PunchedTapeHorizonProps {
  daysGrid: HorizonDayData[];
  monthHeaders: { label: string; weekIndex: number; isCurrentMonth: boolean }[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onHoverDate: (data: {
    dateStr: string;
    dateObj: Date;
    snapshot?: ChronoSnapshot;
    missions: KanbanQuest[];
    schedules?: any[];
    x: number;
    y: number;
  } | null) => void;
  getCellStyling: (
    rate?: number,
    hasDeadlines?: boolean,
    isSelected?: boolean,
    isToday?: boolean,
    isFuture?: boolean
  ) => string;
  className?: string;
}

/**
 * 52-Week Continuous Punched Brass Jacquard Ribbon & Chrono Ticker Tape
 */
export function PunchedTapeHorizon({
  daysGrid,
  monthHeaders,
  selectedDate,
  onSelectDate,
  onHoverDate,
  getCellStyling,
  className = "",
}: PunchedTapeHorizonProps) {
  return (
    <div className={cn("relative p-4 sm:p-5 bg-[#140803] border-2 border-[#542d17] shadow-[inset_0_2px_8px_#000,0_4px_16px_rgba(0,0,0,0.9)] overflow-hidden select-none", className)}>
      {/* Top Sprocket Feed Tape Track */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#381607] mb-3 overflow-hidden opacity-90">
        <span className="text-xs font-mono text-[#f59e0b] font-bold uppercase tracking-wider shrink-0 mr-3">
          JACQUARD SPROCKET TAPE // 364-DAY CHRONO MATRIX
        </span>
        <div className="flex gap-2 flex-1 justify-around overflow-hidden">
          {Array.from({ length: 26 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#100602] border border-[#78350f] shrink-0" />
          ))}
        </div>
      </div>

      {/* Main Heatmap Punch-Tape Container with Left/Right Feed Rollers */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="min-w-[780px]">
          {/* Stamped Month Markers */}
          <div className="grid grid-cols-52 gap-1.5 mb-2 pl-8 pr-2 text-xs sm:text-sm font-pixel select-none">
            {monthHeaders.map((mh, idx) => (
              <div
                key={idx}
                style={{ gridColumnStart: mh.weekIndex + 1 }}
                className={cn(
                  "truncate font-bold tracking-wider",
                  mh.isCurrentMonth ? "text-[#fde047] drop-shadow-[0_0_4px_#f59e0b]" : "text-[#fbbf24]"
                )}
              >
                {mh.label}
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 items-start">
            {/* Stamped Weekday Feed Track (MON, WED, FRI) */}
            <div className="grid grid-rows-7 gap-1 text-xs sm:text-sm font-pixel text-[#fbbf24] pt-0.5 select-none w-8 text-right font-bold">
              <span className="h-3.5 leading-none"></span>
              <span className="h-3.5 leading-none">MON</span>
              <span className="h-3.5 leading-none"></span>
              <span className="h-3.5 leading-none">WED</span>
              <span className="h-3.5 leading-none"></span>
              <span className="h-3.5 leading-none">FRI</span>
              <span className="h-3.5 leading-none"></span>
            </div>

            {/* 52 Columns x 7 Rows Punched Aperture Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-1 flex-1">
              {daysGrid.map((day, idx) => {
                const rate = day.snapshot?.completionRate;
                const hasDeadlines = day.missions.length > 0;
                const isSelected = selectedDate === day.dateStr;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectDate(day.dateStr)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      onHoverDate({
                        dateStr: day.dateStr,
                        dateObj: day.dateObj,
                        snapshot: day.snapshot,
                        missions: day.missions,
                        schedules: day.schedules,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => onHoverDate(null)}
                    aria-label={`Inspect ${day.dateStr} - ${Math.round(rate || 0)}% completed`}
                    className={cn(
                      "w-3.5 h-3.5 border cursor-pointer transition-transform duration-100 relative rounded-xs",
                      getCellStyling(rate, hasDeadlines, isSelected, day.isToday, day.isFuture),
                      "hover:scale-160 hover:z-30 hover:border-[#fde047] hover:shadow-[0_0_8px_#f59e0b]"
                    )}
                  >
                    {/* Pulsing deadline pin */}
                    {hasDeadlines && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#f59e0b] shadow-[0_0_6px_#f59e0b] pointer-events-none rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sprocket Feed Tape Track */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#381607] mt-3 overflow-hidden opacity-90">
        <div className="flex gap-2 flex-1 justify-around overflow-hidden">
          {Array.from({ length: 26 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#100602] border border-[#78350f] shrink-0" />
          ))}
        </div>
        <span className="text-xs font-mono text-[#f59e0b] font-bold uppercase tracking-wider shrink-0 ml-3">
          CONTINUOUS MECHANICAL FEED BUFFER
        </span>
      </div>
    </div>
  );
}
