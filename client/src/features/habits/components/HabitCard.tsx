"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Habit, CompletionType } from "../types";
import { useHabitStore } from "../store/useHabitStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import {
  PixelFlameIcon,
  PixelAnvilIcon,
  PixelArrowRightIcon,
  PixelCoinsIcon,
  PixelCheckIcon,
  PixelChevronRightIcon,
  PixelCloseIcon,
} from "@/components/ui/pixel/PixelIcons";
import { HabitIconRenderer } from "./HabitIconRenderer";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { todayMissions, logHabitCompletion, triggerBadHabit } = useHabitStore();
  const { gainExp, gainGold, gainGems, addStat } = useCharacterStore();
  const [isLogging, setIsLogging] = useState(false);
  const [showTierPicker, setShowTierPicker] = useState(false);
  const [floatingPenalty, setFloatingPenalty] = useState<string | null>(null);
  const isNegative = habit.type === "NEGATIVE";

  const todayMission = todayMissions.find((m) => m.habitId === habit.id);
  const isCompletedToday = todayMission?.status === "COMPLETED";

  const strength = Math.min(100, Math.max(0, habit.metrics?.habitStrength || 0));
  const currentStreak = habit.metrics?.currentStreak || 0;
  const normalTier = habit.tiers?.find((t) => t.tier === "NORMAL") || habit.tiers?.[0];
  const miniTier = habit.tiers?.find((t) => t.tier === "MINI");
  const eliteTier = habit.tiers?.find((t) => t.tier === "ELITE");

  const expReward = normalTier?.baseExp || 50;
  const goldReward = normalTier?.baseGold || 20;

  const diffVariant =
    habit.difficulty?.toUpperCase() === "HARD"
      ? "danger"
      : habit.difficulty?.toUpperCase() === "MEDIUM"
      ? "warning"
      : "success";

  const handleLog = async (tier: CompletionType = "NORMAL") => {
    if (isLogging) return;
    setIsLogging(true);
    try {
      playBuffSFX();
      const res = await logHabitCompletion(habit.id, tier);
      if (res.success && res.rewards) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });

        // Sync Character store currencies and stats
        gainExp(res.rewards.exp, `Habit Logged: ${habit.name}`);
        gainGold(res.rewards.gold, `Habit Bounty: ${habit.name}`);
        if (res.rewards.gems > 0) gainGems(res.rewards.gems, "Elite Habit Overachieve Bonus");
        if (res.rewards.stat > 0 && res.rewards.statName) {
          addStat(res.rewards.statName, res.rewards.stat);
        }

        toast.success(`✓ ${habit.name} Completed!`, {
          description: `+${res.rewards.exp} EXP • +${res.rewards.gold} Gold • Streak: ${res.rewards.streak}d`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to log habit.");
    } finally {
      setIsLogging(false);
      setShowTierPicker(false);
    }
  };

  const handleTrigger = async () => {
    if (isLogging) return;
    setIsLogging(true);
    const res = await triggerBadHabit(habit.id);
    if (res.success && res.penalty) {
      setFloatingPenalty(`-${res.penalty.amount} ${res.penalty.target}`);
      toast.error(`${habit.name} logged`, { description: `-${res.penalty.amount} ${res.penalty.target}` });
      window.setTimeout(() => setFloatingPenalty(null), 1200);
    } else {
      toast.error("Failed to log relapse.");
    }
    setIsLogging(false);
  };

  return (
    <div
      className={`bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-3 p-4 font-pixel text-[#1d2d2a] shadow-[4px_4px_0_0_#1d2d2a] hover:shadow-[6px_6px_0_0_#1d2d2a] transition-all duration-75 flex flex-col justify-between space-y-3 relative overflow-hidden select-none ${
        isNegative ? "border-[#be123c] bg-[linear-gradient(180deg,#ffe4e6_0%,#fecdd3_50%,#fda4af_100%)] hover:border-[#9f1239]" : isCompletedToday ? "border-emerald-600 bg-[linear-gradient(180deg,#e5f3eb_0%,#d1e7db_50%,#b8d8c6_100%)]" : "border-[#3b424c] hover:border-[#ffb03a]"
      }`}
    >
      {floatingPenalty && <div className="absolute right-5 top-10 z-20 text-xl font-black text-[#be123c] animate-damage-float drop-shadow-[2px_2px_0_#fff]">{floatingPenalty}</div>}
      {/* Slate Stone Corner Masonry Markers */}
      <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#3b424c] pointer-events-none" />
      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#3b424c] pointer-events-none" />
      <span className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#3b424c] pointer-events-none" />
      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#3b424c] pointer-events-none" />

      <div>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5 border-b-2 border-[#3b424c]/20 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Icon Chamber */}
            <div className="w-10 h-10 bg-[#2f3640] text-[#ffd166] border-2 border-[#1d2d2a] flex items-center justify-center shadow-[inset_0_0_8px_rgba(0,0,0,0.6)] shrink-0">
              <HabitIconRenderer habit={habit} className="w-6 h-6 text-[#ffd166]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold uppercase truncate text-[#1d2d2a]">
                {habit.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-[9px] text-[#5a6472] font-bold uppercase">
                  {habit.category || "General"}
                </span>
                <span className="text-[#3b424c]/40 text-[9px]">•</span>
                <PixelBadge variant={diffVariant} size="sm">
                  {habit.difficulty || "MEDIUM"}
                </PixelBadge>
              </div>
            </div>
          </div>

          {/* Streak Badge */}
          <div
            className={`px-2 py-0.5 border-2 shadow-[2px_2px_0_0_#1d2d2a] flex items-center gap-1 shrink-0 ${
              currentStreak > 0
                ? "bg-[#2f3640] border-[#ffb03a] text-[#ffd166]"
                : "bg-[#2f3640]/70 border-[#3b424c] text-[#b0b8c4]"
            }`}
            title={`Current streak: ${currentStreak} days`}
          >
            <PixelFlameIcon
              className={`w-3.5 h-3.5 ${currentStreak > 0 ? "text-[#ffb03a] animate-pulse" : "text-[#5a6472]"}`}
            />
            <span className="text-[10px] font-bold tabular-nums font-mono">{currentStreak}d</span>
          </div>
        </div>

        {/* Clean, High-Contrast Description */}
        {habit.description && (
          <p className="text-[11px] text-[#1d2d2a] line-clamp-2 mb-2.5 leading-relaxed font-mono font-medium">
            {habit.description}
          </p>
        )}

        {/* Target Frequency Info */}
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#3b424c] mb-2 px-1">
          <span>Schedule: {habit.scheduleType.replace(/_/g, " ")}</span>
          {normalTier?.targetValue && (
            <span>
              Goal: {normalTier.targetValue} {normalTier.targetUnit || "times"}
            </span>
          )}
        </div>

        {/* Habit Strength Progress Track */}
        <div className="p-2 bg-[#b0b8c4]/60 border-2 border-[#3b424c] shadow-[inset_0_0_6px_rgba(43,50,60,0.3)] space-y-1 my-1.5">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-[#3b424c] font-bold uppercase flex items-center gap-1">
              <PixelAnvilIcon className="w-3 h-3 text-[#ea580c]" />
              Habit Strength
            </span>
            <span className="text-[#1d2d2a] font-bold tabular-nums font-mono">
              {Math.round(strength)}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#2f3640] border border-[#1d2d2a] p-0.5 overflow-hidden">
            <div
              className="h-full bg-[linear-gradient(90deg,#ea580c_0%,#ffb03a_60%,#ffd166_100%)] shadow-[0_0_6px_rgba(255,176,58,0.8)] transition-all duration-200"
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* ⚡ DIRECT HABIT LOGGING ACTION BAR                         */}
        {/* ========================================================= */}
        <div className="mt-2.5">
          {isNegative ? (
            <button type="button" onClick={handleTrigger} disabled={isLogging} className="w-full py-2 px-3 bg-[#9f1239] hover:bg-[#be123c] text-white font-pixel font-bold text-xs border-2 border-[#4c1024] shadow-[2px_2px_0_0_#4c1024] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 transition-all">
              <span>☠</span><span>{isLogging ? "Logging Slip..." : "Relapse / Log Slip"}</span>
            </button>
          ) : isCompletedToday ? (
            <div className="p-2 bg-[#1b3d2b] border-2 border-emerald-500 shadow-[inset_0_0_6px_rgba(0,0,0,0.4)] flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <PixelCheckIcon className="w-4 h-4 text-emerald-400" />
                <span className="uppercase text-[10px]">
                  Completed Today ({todayMission?.completionType || "NORMAL"})
                </span>
              </div>
              <span className="text-[10px] text-[#ffd166] font-mono font-bold">
                +{todayMission?.expEarned || expReward} EXP
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {!showTierPicker ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleLog("NORMAL")}
                    disabled={isLogging}
                    className="flex-1 py-2 px-3 bg-[#ffb03a] hover:bg-[#ffd166] text-[#1d2d2a] font-pixel font-bold text-xs border-2 border-[#1d2d2a] shadow-[2px_2px_0_0_#1d2d2a] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#ffb03a]"
                  >
                    <PixelCheckIcon className="w-3.5 h-3.5 text-[#1d2d2a]" />
                    <span>{isLogging ? "Logging..." : "Log Done Today"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playUIMenuSFX();
                      setShowTierPicker(true);
                    }}
                    className="py-2 px-2.5 bg-[#2f3640] hover:bg-[#3b424c] text-[#ffd166] font-pixel font-bold text-xs border-2 border-[#1d2d2a] shadow-[2px_2px_0_0_#1d2d2a] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1 transition-all"
                    title="Choose Completion Tier"
                  >
                    <span>Tiers</span>
                    <PixelChevronRightIcon className="w-2.5 h-2.5 rotate-90 text-[#ffb03a]" />
                  </button>
                </div>
              ) : (
                <div className="p-2 bg-[#2f3640] border-2 border-[#1d2d2a] space-y-1.5 animate-in fade-in duration-100">
                  <div className="flex justify-between items-center text-[9px] text-[#d1d6dc] uppercase font-mono font-bold">
                    <span>Select Effort Tier:</span>
                    <button
                      type="button"
                      onClick={() => setShowTierPicker(false)}
                      className="text-[#ffd166] hover:text-white cursor-pointer flex items-center gap-1"
                    >
                      <PixelCloseIcon className="w-2.5 h-2.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => handleLog("MINI")}
                      disabled={isLogging}
                      className="p-1 bg-[#1f242b] hover:bg-[#3b424c] border border-[#3b424c] text-center text-[#d1d6dc] hover:text-white cursor-pointer active:translate-y-0.5"
                    >
                      <span className="block text-[9px] font-bold">MINI</span>
                      <span className="block text-[8px] text-[#ffd166] font-mono">
                        +{miniTier?.baseExp || Math.round(expReward * 0.5)} XP
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLog("NORMAL")}
                      disabled={isLogging}
                      className="p-1 bg-[#ffb03a] hover:bg-[#ffd166] border border-[#1d2d2a] text-center text-[#1d2d2a] cursor-pointer active:translate-y-0.5 font-bold"
                    >
                      <span className="block text-[9px]">TARGET</span>
                      <span className="block text-[8px] font-mono">+{expReward} XP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLog("ELITE")}
                      disabled={isLogging}
                      className="p-1 bg-[#ea580c] hover:bg-[#f97316] border border-[#1d2d2a] text-center text-white cursor-pointer active:translate-y-0.5"
                    >
                      <span className="block text-[9px] font-bold">ELITE</span>
                      <span className="block text-[8px] text-[#ffd166] font-mono">
                        +{eliteTier?.baseExp || Math.round(expReward * 1.7)} XP
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info & Details Link */}
      <div className="pt-2.5 border-t-2 border-[#3b424c]/20 flex items-center justify-between gap-2 text-xs">
        {/* Rewards / Stat Pill */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isNegative && <span className="px-1.5 py-0.5 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] text-[9px] font-bold shadow-[1px_1px_0_0_#1d2d2a] tabular-nums font-mono">
            +{expReward} EXP
          </span>}

          {!isNegative && <span className="px-1.5 py-0.5 bg-[#2f3640] text-[#ffb03a] border border-[#1d2d2a] text-[9px] font-bold flex items-center gap-0.5 shadow-[1px_1px_0_0_#1d2d2a] tabular-nums font-mono">
            <PixelCoinsIcon className="w-2.5 h-2.5 text-[#ffd166]" />
            +{goldReward}g
          </span>}

          {isNegative ? <span className="px-1.5 py-0.5 bg-[#9f1239] text-white border border-[#4c1024] text-[9px] font-bold shadow-[1px_1px_0_0_#4c1024]">-{habit.statModifier || 10} {(habit.affectedStat || "HP").toUpperCase()}</span> : habit.primaryStat && (
            <span className="px-1.5 py-0.5 bg-[#5a6472] text-white border border-[#1d2d2a] text-[9px] font-bold shadow-[1px_1px_0_0_#1d2d2a]">
              +{habit.primaryStat.substring(0, 3).toUpperCase()}
            </span>
          )}
        </div>

        {/* View Details Link */}
        <Link href={`/habits/${habit.id}`} onClick={() => playUIMenuSFX("confirm")}>
          <button
            type="button"
            className="px-2.5 py-1 bg-[#2f3640] hover:bg-[#3b424c] text-[#ffd166] font-pixel font-bold text-xs border-2 border-[#1d2d2a] shadow-[2px_2px_0_0_#1d2d2a] active:translate-y-0.5 cursor-pointer flex items-center gap-1 transition-all focus-visible:ring-2 focus-visible:ring-[#ffb03a]"
          >
            <span>Details</span>
            <PixelArrowRightIcon className="w-3 h-3 ml-0.5" />
          </button>
        </Link>
      </div>
    </div>
  );
};
