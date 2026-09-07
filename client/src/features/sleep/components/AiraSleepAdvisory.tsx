"use client";

import React from "react";
import {
  PixelMoonSleepIcon,
  PixelLightningIcon,
  PixelWaterDropIcon,
} from "@/components/ui/pixel/PixelIcons";
import { AiraAvatar } from "@/components/ui/AiraAvatar";
import { useSleepStore } from "../store/useSleepStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { cn } from "@/lib/utils";

export const AiraSleepAdvisory: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { getSleepDebt, todayLogged } = useSleepStore();
  const { character } = useCharacterStore();

  const sleepDebt = getSleepDebt();
  const recoveryStat = character?.stats?.recovery || 1.0;

  // Determine tactical advisory message
  let adviceTitle = "Optimal Cellular Homeostasis";
  let adviceDesc =
    "Your circadian rhythm is in high equilibrium. Deep delta wave regeneration is actively scaling your character's REC stat.";

  if (sleepDebt > 3.0) {
    adviceTitle = "Accumulated Fatigue Deficit Detected";
    adviceDesc = `You carry a ${sleepDebt}h sleep debt this week. Target an 8.5h recovery window tonight to clear neural metabolic waste and prevent physical stat degradation.`;
  } else if (!todayLogged) {
    adviceTitle = "Awaiting Nightly Biometric Sync";
    adviceDesc =
      "Remember to log your sleep after waking up to lock in your daily EXP bounty and boost your Recovery (REC) stat.";
  }

  return (
    <div
      className={cn(
        "relative rounded-none bg-[#140a26]/95 border-2 border-[#3c1860] p-5 sm:p-6 shadow-[0_4px_0_0_#000] overflow-hidden text-slate-100 backdrop-blur-md space-y-4 select-none",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#3c1860]/60 pb-3.5">
        <div className="flex items-center gap-3">
          <AiraAvatar
            mood={sleepDebt > 3 ? "WARNING" : "ANALYZING"}
            className="w-10 h-10 !border-0 !border-none !shadow-none !ring-0 rounded-full flex-shrink-0"
          />
          <div>
            <span className="text-xs sm:text-sm font-pixel font-bold text-[#fbbf24] block">
              AIRA Neural Diagnostics
            </span>
            <h4 className="text-base sm:text-lg font-pixel font-bold text-white tracking-wide">
              Somatic Prescription & Intel
            </h4>
          </div>
        </div>
      </div>

      {/* Body Advice (High Readability) */}
      <div className="space-y-4">
        <div className="border-l-3 border-[#f59e0b] pl-4 py-1.5 bg-black/15">
          <span className="text-sm font-pixel font-bold text-[#fef08a] block">
            {adviceTitle}
          </span>
          <p className="text-xs sm:text-sm text-slate-200 font-sans mt-1.5 leading-relaxed max-w-prose text-pretty">
            {adviceDesc}
          </p>
        </div>

        {/* 3 Biometric Micro-Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#3c1860]/40 border-y border-[#3c1860]/40 py-2.5 font-pixel text-xs sm:text-sm">
          <div className="px-3 py-1 space-y-1">
            <span className="text-[#fbbf24] font-bold block flex items-center gap-1.5">
              <PixelWaterDropIcon className="w-4 h-4 text-[#fbbf24]" />
              Optimal Temp
            </span>
            <span className="text-white font-bold block text-sm sm:text-base">18.5°C (65°F)</span>
          </div>

          <div className="px-3 py-1 space-y-1">
            <span className="text-[#fbbf24] font-bold block flex items-center gap-1.5">
              <PixelMoonSleepIcon className="w-4 h-4 text-[#fbbf24]" />
              Melatonin Gate
            </span>
            <span className="text-white font-bold block text-sm sm:text-base">22:30 – 23:00</span>
          </div>

          <div className="px-3 py-1 space-y-1">
            <span className="text-[#fbbf24] font-bold block flex items-center gap-1.5">
              <PixelLightningIcon className="w-4 h-4 text-[#fbbf24]" />
              REC Multiplier
            </span>
            <span className="text-[#34d399] font-bold block text-sm sm:text-base">
              {recoveryStat.toFixed(2)}x Boost
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiraSleepAdvisory;
