"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PixelClockIcon, PixelGearIcon } from "@/components/ui/pixel/PixelIcons";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { KnifeSwitchToggle } from "./KnifeSwitchToggle";
import { SteamVent } from "./SteamVent";
import { NumberTicker } from "@/components/ui/number-ticker";

export interface PneumaticCanisterCardProps {
  id: string;
  title: string;
  description?: string;
  rank: string;
  dueDateStr: string;
  expReward: number;
  isCompleted: boolean;
  isToday?: boolean;
  onToggleStatus: () => void;
  className?: string;
}

const RANK_SEAL_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  S: { bg: "bg-[#381154]", border: "border-[#c084fc]", text: "text-[#f3e8ff]", glow: "shadow-[0_0_8px_#c084fc]" },
  A: { bg: "bg-[#451a03]", border: "border-[#fbbf24]", text: "text-[#fef08a]", glow: "shadow-[0_0_8px_#f59e0b]" },
  B: { bg: "bg-[#064e3b]", border: "border-[#34d399]", text: "text-[#d1fae5]", glow: "shadow-[0_0_8px_#10b981]" },
  C: { bg: "bg-[#1e293b]", border: "border-[#94a3b8]", text: "text-[#f1f5f9]", glow: "shadow-[0_0_6px_#64748b]" },
  D: { bg: "bg-[#1c1917]", border: "border-[#78716c]", text: "text-[#e7e5e4]", glow: "" },
};

/**
 * Steampunk Pneumatic Dispatch Tube Canister Cartridge
 */
export function PneumaticCanisterCard({
  id,
  title,
  description,
  rank,
  dueDateStr,
  expReward,
  isCompleted,
  isToday = false,
  onToggleStatus,
  className = "",
}: PneumaticCanisterCardProps) {
  const [steamTrigger, setSteamTrigger] = useState(0);
  const seal = RANK_SEAL_STYLES[rank] || RANK_SEAL_STYLES.C;

  const handleToggle = () => {
    if (!isCompleted) {
      setSteamTrigger((prev) => prev + 1);
    }
    onToggleStatus();
  };

  return (
    <div
      className={cn(
        "relative p-4 sm:p-4.5 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.06)] group select-none overflow-hidden",
        isCompleted
          ? "bg-[#120804]/70 border-[#381a0c] opacity-75 grayscale-[20%]"
          : isToday
          ? "bg-[#281105] border-[#f59e0b] shadow-[0_0_16px_rgba(245,158,11,0.25)]"
          : "bg-[#180c06] border-[#542d17] hover:border-[#78350f]",
        className
      )}
    >
      {/* Steam Vent burst on quest completion */}
      <SteamVent trigger={steamTrigger} particleCount={6} size="md" />

      {/* Top and Bottom Knurled Brass Canister Collars */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#78350f] via-[#fbbf24] to-[#78350f] opacity-80 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[#78350f] via-[#fbbf24] to-[#78350f] opacity-80 pointer-events-none" />

      {/* Left section: Knife-Switch + Rank Seal + Title/Description */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Knife-Switch Lever Toggle */}
        <div className="mt-0.5 shrink-0">
          <KnifeSwitchToggle
            checked={isCompleted}
            onChange={handleToggle}
            aria-label={`Toggle mission status for ${title}`}
            size="md"
          />
        </div>

        <div className="min-w-0 space-y-1.5 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Wax-Seal / Engraved Medallion Rank Badge */}
            <span
              className={cn(
                "px-2.5 py-0.5 border text-xs sm:text-sm font-pixel font-bold tracking-wider rounded-xs flex items-center gap-1.5 shrink-0",
                seal.bg,
                seal.border,
                seal.text,
                seal.glow
              )}
            >
              <PixelGearIcon className="w-3.5 h-3.5 shrink-0" />
              RANK {rank}
            </span>

            {/* Pneumatic Canister Serial Watermark */}
            <span className="text-xs font-mono text-amber-300/80 font-bold uppercase tracking-wider hidden sm:inline">
              CANISTER // #{id.slice(0, 6)}
            </span>

            {/* Title */}
            <span
              className={cn(
                "text-base sm:text-lg font-pixel font-bold truncate block",
                isCompleted ? "line-through text-slate-400" : isToday ? "text-[#fef08a]" : "text-white"
              )}
            >
              {title}
            </span>
          </div>

          {description && (
            <p className="text-sm sm:text-base text-amber-100/90 line-clamp-1 font-sans font-medium">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right section: Due Date & EXP Reward Plate */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono text-sm">
        {/* Copper-Stamped Due Date Plate */}
        <div
          className={cn(
            "px-3 py-1.5 text-xs sm:text-sm font-pixel font-bold border flex items-center gap-1.5 shadow-[inset_0_1px_2px_#000]",
            isToday
              ? "bg-[#100602] text-[#fde047] border-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.4)]"
              : "bg-[#120703] text-amber-200 border-[#542d17]"
          )}
        >
          <PixelClockIcon className="w-4 h-4 text-[#f59e0b]" />
          <span>Due: {dueDateStr}</span>
        </div>

        {/* EXP Reward Seal */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#100602] border border-[#542d17] shadow-[inset_0_1px_2px_#000]">
          <CurrencyIcon type="EXP" size="sm" />
          <span className="text-sm sm:text-base text-[#fef08a] font-bold font-pixel flex items-center">
            +<NumberTicker value={expReward} className="font-pixel text-[#fef08a]" />
          </span>
        </div>
      </div>
    </div>
  );
}
