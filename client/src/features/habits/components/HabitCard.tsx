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
import { MagicCard } from "@/components/ui/magic-card";
import { CoolMode } from "@/components/ui/cool-mode";
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
        // Kyoto Dusk themed confetti burst
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.75 },
          colors: ["#f472b6", "#fba170", "#e05344", "#ffd166", "#ffffff"],
        });

        // Sync Character store currencies and stats
        gainExp(res.rewards.exp, `Ritual Fulfilled: ${habit.name}`);
        gainGold(res.rewards.gold, `Sanctuary Bounty: ${habit.name}`);
        if (res.rewards.gems > 0) gainGems(res.rewards.gems, "Elite Mastery Blessing");
        if (res.rewards.stat > 0 && res.rewards.statName) {
          addStat(res.rewards.statName, res.rewards.stat);
        }

        toast.success(`🌸 Ritual Fulfilled: ${habit.name}`, {
          description: `+${res.rewards.exp} EXP • +${res.rewards.gold} Gold • Streak: ${res.rewards.streak}d`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to log ritual.");
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
      toast.error(`${habit.name} recorded`, { description: `-${res.penalty.amount} ${res.penalty.target}` });
      window.setTimeout(() => setFloatingPenalty(null), 1200);
    } else {
      toast.error("Failed to log relapse.");
    }
    setIsLogging(false);
  };

  return (
    <MagicCard
      className={`relative select-none p-4 font-pixel transition-all duration-150 border-2 rounded-none flex flex-col justify-between space-y-3.5 backdrop-blur-md ${
        isNegative
          ? "bg-[linear-gradient(180deg,rgba(48,16,24,0.92)_0%,rgba(32,10,16,0.96)_100%)] border-[#be123c]/60 hover:border-[#f43f5e]"
          : isCompletedToday
          ? "bg-[linear-gradient(180deg,rgba(20,38,28,0.92)_0%,rgba(14,26,20,0.96)_100%)] border-emerald-500/60 shadow-[3px_3px_0_0_#0f1f17]"
          : "bg-[linear-gradient(180deg,rgba(32,20,23,0.90)_0%,rgba(20,13,16,0.96)_100%)] border-[#e05344]/30 hover:border-[#fba170]/80 shadow-[4px_4px_0_0_#140b0e]"
      }`}
      gradientColor="rgba(224, 83, 68, 0.15)"
      gradientFrom="#e05344"
      gradientTo="#fba170"
      gradientSize={260}
    >
      {floatingPenalty && (
        <div className="absolute right-5 top-10 z-30 text-xl font-black text-[#f43f5e] animate-damage-float drop-shadow-[2px_2px_0_#1a050a]">
          {floatingPenalty}
        </div>
      )}

      {/* Shoji Wood Corner Lattice Brackets */}
      <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#e05344]/50 pointer-events-none" />
      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#e05344]/50 pointer-events-none" />
      <span className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#e05344]/50 pointer-events-none" />
      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#e05344]/50 pointer-events-none" />

      <div>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5 border-b border-[#e05344]/20 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Shrine Icon Chamber */}
            <div className="w-10 h-10 bg-[#1c1114] text-[#fba170] border border-[#e05344]/40 flex items-center justify-center shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] shrink-0">
              <HabitIconRenderer habit={habit} className="w-6 h-6 text-[#fba170]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold uppercase truncate text-[#fdf2e9] tracking-wide">
                {habit.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-[9px] text-[#c4b5a5] font-bold uppercase">
                  {habit.category || "General"}
                </span>
                <span className="text-[#c4b5a5]/40 text-[9px]">•</span>
                <PixelBadge variant={diffVariant} size="sm">
                  {habit.difficulty || "MEDIUM"}
                </PixelBadge>
              </div>
            </div>
          </div>

          {/* Streak Flame Badge */}
          <div
            className={`px-2 py-0.5 border shadow-[1px_1px_0_0_#140b0e] flex items-center gap-1 shrink-0 ${
              currentStreak > 0
                ? "bg-[#29161a] border-[#fba170] text-[#fba170]"
                : "bg-[#1f1416]/80 border-[#3d2429] text-[#8c7b7d]"
            }`}
            title={`Current streak: ${currentStreak} days`}
          >
            <PixelFlameIcon
              className={`w-3.5 h-3.5 ${currentStreak > 0 ? "text-[#fba170] animate-pulse" : "text-[#8c7b7d]"}`}
            />
            <span className="text-[10px] font-bold tabular-nums font-mono">{currentStreak}d</span>
          </div>
        </div>

        {/* Description */}
        {habit.description && (
          <p className="text-[11px] text-[#c4b5a5] line-clamp-2 mb-2.5 leading-relaxed font-mono font-medium">
            {habit.description}
          </p>
        )}

        {/* Target Frequency Info */}
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#8c7b7d] mb-2 px-0.5">
          <span>Schedule: {habit.scheduleType.replace(/_/g, " ")}</span>
          {normalTier?.targetValue && (
            <span className="text-[#c4b5a5]">
              Goal: {normalTier.targetValue} {normalTier.targetUnit || "times"}
            </span>
          )}
        </div>

        {/* Habit Strength Progress Track */}
        <div className="p-2 bg-[#170e11] border border-[#e05344]/30 shadow-[inset_0_0_6px_rgba(0,0,0,0.6)] space-y-1 my-1.5">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-[#c4b5a5] font-bold uppercase flex items-center gap-1">
              <PixelAnvilIcon className="w-3 h-3 text-[#e05344]" />
              Discipline Depth
            </span>
            <span className="text-[#fba170] font-bold tabular-nums font-mono">
              {Math.round(strength)}%
            </span>
          </div>

          <div className="w-full h-2 bg-[#10090b] border border-[#2e181c] p-0.5 overflow-hidden">
            <div
              className="h-full bg-[linear-gradient(90deg,#e05344_0%,#fba170_60%,#f472b6_100%)] shadow-[0_0_8px_rgba(224,83,68,0.7)] transition-all duration-300"
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* ⚡ DIRECT HABIT LOGGING ACTION BAR                         */}
        {/* ========================================================= */}
        <div className="mt-3">
          {isNegative ? (
            <button
              type="button"
              onClick={handleTrigger}
              disabled={isLogging}
              className="w-full py-2 px-3 bg-[#9f1239] hover:bg-[#be123c] text-white font-pixel font-bold text-xs border border-[#4c1024] shadow-[2px_2px_0_0_#2b0914] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            >
              <span>☠</span>
              <span>{isLogging ? "Recording..." : "Record Relapse"}</span>
            </button>
          ) : isCompletedToday ? (
            <div className="p-2 bg-[#14281c] border border-emerald-500/70 shadow-[inset_0_0_6px_rgba(0,0,0,0.4)] flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <PixelCheckIcon className="w-4 h-4 text-emerald-400" />
                <span className="uppercase text-[10px] tracking-wider">
                  Fulfilled Today ({todayMission?.completionType || "NORMAL"})
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
                  <CoolMode options={{ particle: "🌸", speedUp: 16, size: 24 }} className="flex-1">
                    <button
                      type="button"
                      onClick={() => handleLog("NORMAL")}
                      disabled={isLogging}
                      className="w-full py-2 px-3 bg-[#e05344] hover:bg-[#ef4444] text-white font-pixel font-bold text-xs border border-[#821e14] shadow-[2px_2px_0_0_#47110c] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#fba170]"
                    >
                      <PixelCheckIcon className="w-3.5 h-3.5 text-white" />
                      <span>{isLogging ? "Fulfilling..." : "Fulfill Ritual"}</span>
                    </button>
                  </CoolMode>

                  <button
                    type="button"
                    onClick={() => {
                      playUIMenuSFX();
                      setShowTierPicker(true);
                    }}
                    className="py-2 px-2.5 bg-[#24171a] hover:bg-[#332025] text-[#fba170] font-pixel font-bold text-xs border border-[#e05344]/40 shadow-[2px_2px_0_0_#140b0e] active:translate-y-0.5 cursor-pointer flex items-center gap-1 transition-all"
                    title="Choose Completion Tier"
                  >
                    <span>Tiers</span>
                    <PixelChevronRightIcon className="w-2.5 h-2.5 rotate-90 text-[#fba170]" />
                  </button>
                </div>
              ) : (
                <div className="p-2 bg-[#1b1114] border border-[#e05344]/40 space-y-1.5 animate-in fade-in duration-100">
                  <div className="flex justify-between items-center text-[9px] text-[#c4b5a5] uppercase font-mono font-bold">
                    <span>Select Effort Tier:</span>
                    <button
                      type="button"
                      onClick={() => setShowTierPicker(false)}
                      className="text-[#fba170] hover:text-white cursor-pointer flex items-center gap-1"
                    >
                      <PixelCloseIcon className="w-2.5 h-2.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <CoolMode options={{ particle: "🍃", speedUp: 12, size: 20 }}>
                      <button
                        type="button"
                        onClick={() => handleLog("MINI")}
                        disabled={isLogging}
                        className="w-full p-1 bg-[#24171a] hover:bg-[#332025] border border-[#3d2429] text-center text-[#c4b5a5] hover:text-white cursor-pointer active:translate-y-0.5"
                      >
                        <span className="block text-[9px] font-bold">MINI</span>
                        <span className="block text-[8px] text-[#fba170] font-mono">
                          +{miniTier?.baseExp || Math.round(expReward * 0.5)} XP
                        </span>
                      </button>
                    </CoolMode>

                    <CoolMode options={{ particle: "🌸", speedUp: 16, size: 24 }}>
                      <button
                        type="button"
                        onClick={() => handleLog("NORMAL")}
                        disabled={isLogging}
                        className="w-full p-1 bg-[#e05344] hover:bg-[#ef4444] border border-[#821e14] text-center text-white cursor-pointer active:translate-y-0.5 font-bold"
                      >
                        <span className="block text-[9px]">TARGET</span>
                        <span className="block text-[8px] font-mono">+{expReward} XP</span>
                      </button>
                    </CoolMode>

                    <CoolMode options={{ particle: "✨", speedUp: 20, size: 26 }}>
                      <button
                        type="button"
                        onClick={() => handleLog("ELITE")}
                        disabled={isLogging}
                        className="w-full p-1 bg-[#f97316] hover:bg-[#fb923c] border border-[#7c2d12] text-center text-white cursor-pointer active:translate-y-0.5"
                      >
                        <span className="block text-[9px] font-bold">ELITE</span>
                        <span className="block text-[8px] text-[#fef08a] font-mono">
                          +{eliteTier?.baseExp || Math.round(expReward * 1.7)} XP
                        </span>
                      </button>
                    </CoolMode>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info & Details Link */}
      <div className="pt-2.5 border-t border-[#e05344]/20 flex items-center justify-between gap-2 text-xs">
        {/* Rewards / Stat Pill */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isNegative && (
            <span className="px-1.5 py-0.5 bg-[#1f1416] text-[#ffd166] border border-[#e05344]/30 text-[9px] font-bold shadow-[1px_1px_0_0_#140b0e] tabular-nums font-mono">
              +{expReward} EXP
            </span>
          )}

          {!isNegative && (
            <span className="px-1.5 py-0.5 bg-[#1f1416] text-[#fba170] border border-[#e05344]/30 text-[9px] font-bold flex items-center gap-0.5 shadow-[1px_1px_0_0_#140b0e] tabular-nums font-mono">
              <PixelCoinsIcon className="w-2.5 h-2.5 text-[#ffd166]" />
              +{goldReward}g
            </span>
          )}

          {isNegative ? (
            <span className="px-1.5 py-0.5 bg-[#9f1239] text-white border border-[#4c1024] text-[9px] font-bold shadow-[1px_1px_0_0_#2b0914]">
              -{habit.statModifier || 10} {(habit.affectedStat || "HP").toUpperCase()}
            </span>
          ) : (
            habit.primaryStat && (
              <span className="px-1.5 py-0.5 bg-[#29171b] text-[#fce7f3] border border-[#f472b6]/30 text-[9px] font-bold shadow-[1px_1px_0_0_#140b0e]">
                +{habit.primaryStat.substring(0, 3).toUpperCase()}
              </span>
            )
          )}
        </div>

        {/* View Details Link */}
        <Link href={`/habits/${habit.id}`} onClick={() => playUIMenuSFX("confirm")}>
          <button
            type="button"
            className="px-2.5 py-1 bg-[#24171a] hover:bg-[#332025] text-[#fba170] font-pixel font-bold text-xs border border-[#e05344]/40 shadow-[2px_2px_0_0_#140b0e] active:translate-y-0.5 cursor-pointer flex items-center gap-1 transition-all focus-visible:ring-2 focus-visible:ring-[#fba170]"
          >
            <span>Details</span>
            <PixelArrowRightIcon className="w-3 h-3 ml-0.5" />
          </button>
        </Link>
      </div>
    </MagicCard>
  );
};
