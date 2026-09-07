"use client";

import React, { useEffect, useState } from "react";
import { PixelMoonSleepIcon, PixelCloseIcon } from "@/components/ui/pixel/PixelIcons";
import { useSleepStore } from "../store/useSleepStore";
import { SleepLoggerCard } from "./SleepLoggerCard";
import { SleepHistoryChart } from "./SleepHistoryChart";

export const SleepDrawer: React.FC = () => {
  const { isDrawerOpen, closeDrawer } = useSleepStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!mounted || !isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop with mist blur */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      />

      {/* Slide-out 8-Bit Retro Sidebar Drawer */}
      <aside
        className="relative w-full max-w-lg h-full bg-[#120824]/98 border-l-4 border-[#3c1860] p-5 sm:p-6 shadow-[-8px_0_0_0_#000] flex flex-col justify-between overflow-y-auto z-10 space-y-5 animate-in slide-in-from-right duration-300 text-slate-100 select-none"
      >
        {/* Top Drawer Controls */}
        <div className="flex items-center justify-between border-b-2 border-[#3c1860] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#251040] border-2 border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.4),inset_1px_1px_0_0_#fef08a] flex items-center justify-center flex-shrink-0">
              <PixelMoonSleepIcon className="w-5 h-5 text-[#fbbf24]" />
            </div>
            <div>
              <span className="text-[9px] font-pixel text-[#fbbf24] uppercase tracking-wider block">
                NIGHT PAGODA SANCTUARY
              </span>
              <h3 className="text-sm sm:text-base font-pixel font-bold text-white tracking-wide">
                SLEEP & SOMATIC RECOVERY
              </h3>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="w-8 h-8 bg-[#1f0d36] hover:bg-[#321557] active:bg-[#150924] border-2 border-[#4c1d7c] text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <PixelCloseIcon className="w-4 h-4 text-[#fbbf24]" />
          </button>
        </div>

        {/* Body Content: Interactive Sleep Logger & Live Stats */}
        <div className="space-y-5 flex-1">
          <SleepLoggerCard onLogSuccess={() => {}} className="p-4" />
          <SleepHistoryChart className="p-4" />
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t-2 border-[#3c1860] text-center font-pixel text-[9px] text-[#fbbf24]/80">
          ASCEND OS NIGHT PAGODA • GOLDEN STANDARD: 8.0H REST
        </div>
      </aside>
    </div>
  );
};

export default SleepDrawer;
