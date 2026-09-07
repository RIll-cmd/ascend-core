"use client";

import React from "react";
import {
  PixelChevronLeftIcon,
  PixelChevronRightIcon,
  PixelCompassIcon,
} from "@/components/ui/pixel/PixelIcons";
import { cn } from "@/lib/utils";
import { SteampunkCog } from "./SteampunkGearTrain";
import { playClockworkRatchet, playChronoChime } from "@/utils/steampunkAudio";

export interface ChronometerNavigatorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetToday: () => void;
  isTodayMonth: boolean;
  className?: string;
}

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

/**
 * Astrolabe Mechanical Month Navigator with Escapement Cogs & Ratcheting Knobs
 */
export function ChronometerNavigator({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onResetToday,
  isTodayMonth,
  className = "",
}: ChronometerNavigatorProps) {
  const monthName = MONTH_NAMES[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const handlePrev = () => {
    playClockworkRatchet(4, 0.35);
    onPrevMonth();
  };

  const handleNext = () => {
    playClockworkRatchet(4, 0.35);
    onNextMonth();
  };

  const handleToday = () => {
    playChronoChime(659.25, 0.4);
    onResetToday();
  };

  return (
    <div
      className={cn(
        "relative flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-[#140803] border-2 border-[#542d17] shadow-[inset_0_2px_6px_#000,0_4px_16px_rgba(0,0,0,0.85)] select-none",
        className
      )}
    >
      {/* 4 Corner Brass Rivets */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#fde047] border border-black pointer-events-none shadow-[0_0.5px_0_#fff]" />
      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#fde047] border border-black pointer-events-none shadow-[0_0.5px_0_#fff]" />
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-[#fde047] border border-black pointer-events-none shadow-[0_0.5px_0_#fff]" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-[#fde047] border border-black pointer-events-none shadow-[0_0.5px_0_#fff]" />

      {/* Left: Previous Month Mechanical Knob */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous Month Gear Shift"
        className="relative px-4 py-2.5 bg-[#231006] hover:bg-[#34180a] active:bg-[#120703] border-2 border-[#78350f] hover:border-[#f59e0b] text-[#fde047] font-pixel text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-[0_2px_0_#000] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] group"
      >
        <SteampunkCog
          teeth={8}
          size={18}
          variant="brass"
          className="group-hover:-rotate-90 transition-transform duration-300"
        />
        <PixelChevronLeftIcon className="w-4 h-4 text-[#f59e0b]" />
        <span>PREV CYCLE</span>
      </button>

      {/* Center: Astrolabe Stamped Brass Calender Plate */}
      <div className="flex items-center gap-3.5">
        <SteampunkCog
          teeth={12}
          size={28}
          variant="gold"
          className="animate-[gear-continuous-spin_24s_linear_infinite]"
        />

        <div className="text-center px-5 py-1.5 bg-[#0d0502] border border-[#78350f] shadow-[inset_0_1px_3px_#000]">
          <span className="text-xs font-mono text-[#f59e0b] tracking-widest uppercase block font-bold">
            CHRONO-EPHEMERIS
          </span>
          <h2 className="text-lg sm:text-2xl font-pixel font-bold text-[#fef08a] tracking-wider drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
            {monthName} {year}
          </h2>
        </div>

        <SteampunkCog
          teeth={12}
          size={28}
          variant="copper"
          className="animate-[gear-continuous-spin_24s_linear_infinite_reverse]"
        />
      </div>

      {/* Right: Next Month & Today Realignment Lever */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Month Gear Shift"
          className="relative px-4 py-2.5 bg-[#231006] hover:bg-[#34180a] active:bg-[#120703] border-2 border-[#78350f] hover:border-[#f59e0b] text-[#fde047] font-pixel text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-[0_2px_0_#000] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] group"
        >
          <span>NEXT CYCLE</span>
          <PixelChevronRightIcon className="w-4 h-4 text-[#f59e0b]" />
          <SteampunkCog
            teeth={8}
            size={18}
            variant="brass"
            className="group-hover:rotate-90 transition-transform duration-300"
          />
        </button>

        {!isTodayMonth && (
          <button
            type="button"
            onClick={handleToday}
            aria-label="Align Chronometer to Today"
            className="px-3.5 py-2.5 bg-[#381a0c] hover:bg-[#4d2410] border border-[#f59e0b] text-[#fef08a] font-pixel text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.25)] transition-all animate-pulse"
          >
            <PixelCompassIcon className="w-4 h-4 text-[#fde047]" />
            <span>TODAY</span>
          </button>
        )}
      </div>
    </div>
  );
}
