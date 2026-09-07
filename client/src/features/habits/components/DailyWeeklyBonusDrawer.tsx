"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { useDailyBonusStore } from "@/store/useDailyBonusStore";
import { DailyWeeklyBonusQuestCard } from "./DailyWeeklyBonusQuestCard";
import { playUIMenuSFX } from "@/utils/audio";
import {
  PixelLightningIcon,
  PixelGripIcon,
  PixelChevronLeftIcon,
  PixelMinimizeIcon,
  PixelSparklesIcon,
} from "@/components/ui/pixel/PixelIcons";

export function DailyWeeklyBonusDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isDraggingRef = useRef(false);
  const { habitBoostCharges, dailyEggClaimed } = useDailyBonusStore();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ascend_bonus_drawer_minimized");
      if (saved !== null) {
        setIsMinimized(saved === "true");
      }
    } catch (e) {}
  }, []);

  const toggleMinimized = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ascend_bonus_drawer_minimized", String(next));
      } catch (e) {}
      return next;
    });
  };

  const handleButtonClick = () => {
    if (isDraggingRef.current) return;
    playUIMenuSFX("confirm");
    setIsOpen(true);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Draggable and Minimizable Floating Side Trigger */}
      <motion.div
        drag="y"
        dragConstraints={{ top: -380, bottom: 380 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 150);
        }}
        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none touch-none"
      >
        {isMinimized ? (
          /* ========================================================= */
          /* ULTRA-COMPACT MINIMIZED MODE (Docked 8-Bit Pixel Tab)   */
          /* ========================================================= */
          <div className="relative group flex items-center font-pixel">
            {/* Expand toggle on hover */}
            <button
              type="button"
              onClick={toggleMinimized}
              className="opacity-0 group-hover:opacity-100 transition-none absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#120824] border border-[#3b1861] flex items-center justify-center text-cyan-300 hover:text-white cursor-pointer active:translate-y-0.5"
              title="Expand Tab"
            >
              <PixelChevronLeftIcon className="w-3 h-3" />
            </button>

            {/* Draggable Icon Tab */}
            <button
              type="button"
              onClick={handleButtonClick}
              className="bg-[#1A102F] border-y-2 border-l-2 border-black p-2 shadow-[-2px_2px_0_0_#000] flex items-center gap-1 cursor-grab active:cursor-grabbing hover:bg-[#23153C]"
              title="Drag up/down to move. Click to open Daily Bonuses."
            >
              <div className="w-7 h-7 bg-[#120824] border border-[#3b1861] flex items-center justify-center text-amber-400">
                <PixelLightningIcon className="w-4 h-4 text-amber-400" />
              </div>
              {!dailyEggClaimed && (
                <span className="w-2 h-2 bg-amber-400 border border-black inline-block animate-pulse" />
              )}
            </button>
          </div>
        ) : (
          /* ========================================================= */
          /* EXPANDED 8-BIT RETRO TAB WITH GRIP & MINIMIZE BTN        */
          /* ========================================================= */
          <div className="relative group flex items-center font-pixel">
            <div className="bg-[#1A102F] border-y-2 border-l-2 border-black p-2 shadow-[-3px_3px_0_0_#000] flex items-center gap-2">
              {/* Drag Grip Handle */}
              <div
                className="text-white/40 hover:text-cyan-300 cursor-grab active:cursor-grabbing p-0.5"
                title="Drag up/down to reposition"
              >
                <PixelGripIcon className="w-3.5 h-3.5" />
              </div>

              {/* Main Clickable Area */}
              <button
                type="button"
                onClick={handleButtonClick}
                className="flex items-center gap-2 cursor-pointer text-left focus:outline-none active:translate-y-0.5"
              >
                {/* Static Icon */}
                <div className="w-7 h-7 bg-[#120824] border border-[#3b1861] flex items-center justify-center text-amber-400">
                  <PixelLightningIcon className="w-4 h-4 text-amber-400" />
                </div>

                {/* Compact Text Label */}
                <div className="flex flex-col items-start pr-1 text-left">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                    <span>BONUSES</span>
                    <PixelChevronLeftIcon className="w-3 h-3 text-cyan-400" />
                  </span>
                  <span className="text-xs text-white/70 flex items-center gap-1">
                    {!dailyEggClaimed ? (
                      <>
                        <PixelSparklesIcon className="w-3 h-3 text-amber-400" />
                        <span>EGG READY</span>
                      </>
                    ) : (
                      `${habitBoostCharges}/5 Charges`
                    )}
                  </span>
                </div>
              </button>

              {/* Minimize to icon toggle button */}
              <button
                type="button"
                onClick={toggleMinimized}
                className="w-5 h-5 bg-[#120824] border border-[#3b1861] hover:border-cyan-400 flex items-center justify-center text-white/60 hover:text-cyan-300 cursor-pointer active:translate-y-0.5 ml-0.5"
                title="Minimize side tab"
              >
                <PixelMinimizeIcon className="w-2.5 h-2.5" />
              </button>

              {/* Unclaimed Indicator */}
              {!dailyEggClaimed && (
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-amber-400 border border-black inline-block animate-pulse" />
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Slide-Over Command Sheet in 8-Bit Retro Styling */}
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-[#1A102F] border-l-2 border-[#3b1861] p-4 sm:p-6 text-white shadow-2xl overflow-y-auto select-none font-pixel"
      >
        <SheetHeader className="pb-3 border-b-2 border-black/40 mb-4">
          <SheetTitle className="text-base sm:text-lg font-bold pixel-text-outlined text-white flex items-center gap-2 uppercase tracking-wider">
            <PixelSparklesIcon className="w-5 h-5 text-cyan-400" />
            Daily Bonuses & Weekly Quests Hub
          </SheetTitle>
        </SheetHeader>

        {/* Embedded Full Interactive Matrix */}
        <DailyWeeklyBonusQuestCard />
      </SheetContent>
    </Sheet>
  );
}

