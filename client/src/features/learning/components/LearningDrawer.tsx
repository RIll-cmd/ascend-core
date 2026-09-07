"use client";

import React, { useEffect, useState } from "react";
import { PixelCloseIcon, PixelBookIcon } from "@/components/ui/pixel/PixelIcons";
import { useLearningStore } from "../store/useLearningStore";
import { PomodoroTimer } from "./PomodoroTimer";
import { HabitLinkSelector } from "./HabitLinkSelector";
import { AmbientSoundPlayer } from "./AmbientSoundPlayer";
import { FocusStatistics } from "./FocusStatistics";
import { playUIMenuSFX } from "@/utils/audio";

export const LearningDrawer: React.FC = () => {
  const { isDrawerOpen, closeDrawer } = useLearningStore();
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
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div
        onClick={() => {
          playUIMenuSFX("confirm");
          closeDrawer();
        }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        className="relative w-full max-w-xl h-full bg-[#140a05]/98 border-l-2 border-[#542d17] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-y-auto z-10 space-y-5 animate-in slide-in-from-right duration-300 text-slate-100"
      >
        {/* Top Drawer Controls */}
        <div className="flex items-center justify-between border-b border-[#542d17]/70 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#281308] border border-[#f59e0b] text-[#fbbf24]">
              <PixelBookIcon className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <span className="text-[10px] font-pixel font-bold text-[#f59e0b] uppercase tracking-widest block">
                GRAND ARCHIVES CHRONO-CHAMBER
              </span>
              <h3 className="text-base sm:text-lg font-pixel font-bold text-white tracking-wide mt-0.5">
                Scribe Focus & Pomodoro Desk
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playUIMenuSFX("confirm");
              closeDrawer();
            }}
            className="w-8 h-8 bg-[#251208] border border-[#542d17] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <PixelCloseIcon className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-5 flex-1">
          <PomodoroTimer className="p-4 sm:p-5" />
          <HabitLinkSelector className="p-4 sm:p-5" />
          <AmbientSoundPlayer className="p-4 sm:p-5" />
          <FocusStatistics className="p-4 sm:p-5" />
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#542d17]/50 text-center font-pixel text-[10px] text-slate-400">
          Ascend OS Scribe Focus Engine • Inscribes directly to Character Stats
        </div>
      </aside>
    </div>
  );
};

export default LearningDrawer;
