"use client";

import React from "react";
import {
  PixelScrollIcon,
  PixelCodeBracketsIcon,
  PixelBookIcon,
  PixelBriefcaseIcon,
  PixelPaletteIcon,
  PixelSparklesIcon,
  PixelQuillIcon,
  PixelLinkIcon,
  PixelUnlinkIcon,
} from "@/components/ui/pixel/PixelIcons";
import { useHabitStore } from "@/features/habits/store";
import { useLearningStore, FocusCategory } from "../store/useLearningStore";
import { playUIMenuSFX } from "@/utils/audio";
import { cn } from "@/lib/utils";

interface DomainSphere {
  id: FocusCategory;
  label: string;
  sublabel: string;
  sealIcon: React.ComponentType<{ className?: string }>;
  statBonus: string;
}

const DOMAINS: DomainSphere[] = [
  {
    id: "STUDY",
    label: "Ancient Lore & Study",
    sublabel: "Knowledge",
    sealIcon: PixelScrollIcon,
    statBonus: "+0.4 KNO",
  },
  {
    id: "CODING",
    label: "Arcane Code & Logic",
    sublabel: "Intelligence",
    sealIcon: PixelCodeBracketsIcon,
    statBonus: "+0.4 INT",
  },
  {
    id: "READING",
    label: "Grimoire Reading",
    sublabel: "Perception",
    sealIcon: PixelBookIcon,
    statBonus: "+0.4 FOC",
  },
  {
    id: "WORK",
    label: "Citadel Guild Work",
    sublabel: "Discipline",
    sealIcon: PixelBriefcaseIcon,
    statBonus: "+0.3 DIS",
  },
  {
    id: "CREATIVE",
    label: "Artisan & Creative",
    sublabel: "Charisma",
    sealIcon: PixelPaletteIcon,
    statBonus: "+0.4 CHA",
  },
  {
    id: "GENERAL",
    label: "Meditation & Core Flow",
    sublabel: "Recovery",
    sealIcon: PixelSparklesIcon,
    statBonus: "+0.3 REC",
  },
];

export const HabitLinkSelector: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { habits } = useHabitStore();
  const {
    selectedCategory,
    setCategory,
    linkedHabitId,
    linkedHabitName,
    setLinkedHabit,
    sessionIntent,
    setSessionIntent,
  } = useLearningStore();

  return (
    <div
      className={cn(
        "rounded-none bg-[#1d0e07] border-4 border-[#140804] p-5 sm:p-6 shadow-[0_8px_16px_rgba(0,0,0,0.85)] space-y-5 text-slate-100 select-none relative overflow-hidden",
        className
      )}
    >
      {/* 4 Beveled Gold Corner Brackets */}
      <div className="absolute top-1 left-1 w-5 h-5 border-t-2 border-l-2 border-[#f59e0b] pointer-events-none" />
      <div className="absolute top-1 right-1 w-5 h-5 border-t-2 border-r-2 border-[#f59e0b] pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-5 h-5 border-b-2 border-l-2 border-[#f59e0b] pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-5 h-5 border-b-2 border-r-2 border-[#f59e0b] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#542d17]/80 pb-3 relative z-10">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-pixel font-bold text-[#fef08a] uppercase tracking-wider">
            Scholastic Focus Domains & Discipline Seals
          </h2>
          <span className="text-xs sm:text-sm font-sans font-medium text-slate-300 block">
            Select your active discipline sphere to channel character attribute gains
          </span>
        </div>
      </div>

      {/* Domain Seals Grid (Wax-Sealed Tablets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {DOMAINS.map((domain) => {
          const isSelected = selectedCategory === domain.id;

          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => {
                playUIMenuSFX("confirm");
                setCategory(domain.id);
              }}
              className={cn(
                "p-3.5 sm:p-4 border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] sm:min-h-[100px] h-full shadow-[0_3px_0_0_#000] relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]",
                isSelected
                  ? "bg-[#381a0c] border-[#f59e0b] text-[#fef08a] translate-y-0.5 shadow-[inset_0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-[#fde047]"
                  : "bg-[#180a04] hover:bg-[#251006] border-[#45200c] hover:border-[#78350f] text-slate-200 hover:text-white"
              )}
            >
              {/* Top Row: Icon Seal & Title */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "w-8 h-8 border-2 flex items-center justify-center text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] shrink-0 transition-colors",
                      isSelected
                        ? "bg-[#2a1308] border-[#f59e0b] text-[#fef08a] shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                        : "bg-[#120703] border-[#542d17] text-[#fbbf24] group-hover:border-[#854d0e]"
                    )}
                  >
                    <domain.sealIcon className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-xs sm:text-sm font-pixel font-bold tracking-wide leading-tight text-pretty text-[#fef08a]">
                    {domain.label}
                  </span>
                </div>

                {isSelected && (
                  <span className="w-2.5 h-2.5 bg-[#f59e0b] border border-[#78350f] shadow-[0_1px_2px_rgba(0,0,0,0.5)] shrink-0 mt-0.5" />
                )}
              </div>

              {/* Bottom Row: Stat Bonus */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#45200c]/70 text-xs font-mono">
                <span className="text-[#a88260] font-pixel text-[11px] uppercase tracking-wide truncate">
                  {domain.sublabel}
                </span>
                <span className="text-[#fde047] font-bold tracking-wider shrink-0 tabular-nums">
                  {domain.statBonus}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scriptorium Session Objective Line */}
      <div className="p-4 bg-[#120703] border-2 border-[#45200c] space-y-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-pixel font-bold text-[#fbbf24]">
          <PixelQuillIcon className="w-4 h-4 text-[#f59e0b]" />
          <span>Inscribe Session Objective into Ledger:</span>
        </div>
        <input
          type="text"
          placeholder="e.g. Inscribe 2 chapters of system design, solve 3 algorithms, draft essay..."
          value={sessionIntent}
          onChange={(e) => setSessionIntent(e.target.value)}
          className="w-full bg-[#1e0d06] border-2 border-[#542d17] p-2.5 text-xs sm:text-sm font-sans font-semibold text-[#fef08a] placeholder-slate-400 focus:outline-none focus:border-[#f59e0b]"
        />
      </div>

      {/* Daily Habit Quest Linker Section */}
      <div className="pt-3 border-t border-[#542d17]/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-pixel font-bold text-[#fbbf24] flex items-center gap-2">
            <PixelLinkIcon className="w-4 h-4 text-[#f59e0b]" />
            Inscribe Directly to Daily Quest / Habit
          </label>
          {linkedHabitId && (
            <button
              type="button"
              onClick={() => {
                playUIMenuSFX("confirm");
                setLinkedHabit(null);
              }}
              className="text-xs sm:text-sm font-pixel text-[#ef4444] hover:text-[#f87171] flex items-center gap-1.5 cursor-pointer font-bold transition-colors"
            >
              <PixelUnlinkIcon className="w-4 h-4 text-[#ef4444]" /> Unlink Quest
            </button>
          )}
        </div>

        <select
          value={linkedHabitId || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              setLinkedHabit(null);
            } else {
              const found = habits.find((h) => h.id === val);
              setLinkedHabit(val, found?.name || "Habit");
            }
          }}
          className="w-full bg-[#180b05] border-2 border-[#542d17] p-3 text-xs sm:text-sm font-sans font-bold text-white focus:border-[#f59e0b] focus:outline-none"
        >
          <option value="" className="bg-[#180b05] text-white">-- No Linked Habit (General Scriptorium Rite) --</option>
          {habits.map((habit) => (
            <option key={habit.id} value={habit.id} className="bg-[#180b05] text-white">
              {habit.name} ({habit.category})
            </option>
          ))}
        </select>

        {/* Golden Tether Ribbon Indicator */}
        {linkedHabitId && (
          <div className="p-2.5 bg-[#381a0c] border-2 border-[#f59e0b] flex items-center gap-2 text-xs sm:text-sm font-sans text-[#fef08a] shadow-[inset_0_0_12px_rgba(245,158,11,0.2)] animate-in fade-in duration-200 font-bold">
            <PixelSparklesIcon className="w-4 h-4 text-[#f59e0b] shrink-0" />
            <span>Chrono-Chamber tethered to &quot;{linkedHabitName}&quot; — completing this rite advances daily quest streaks!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitLinkSelector;
