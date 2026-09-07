"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useHabitStore } from "@/features/habits/store/useHabitStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { EditHabitModal } from "@/features/habits/components/EditHabitModal";
import { CompletionType } from "@/features/habits/types";
import {
  PixelArrowLeftIcon,
  PixelPencilIcon,
  PixelTrashIcon,
  PixelTargetIcon,
  PixelAnvilIcon,
  PixelFlameIcon,
  PixelCoinsIcon,
  PixelHourglassIcon,
  PixelCheckIcon,
  PixelGearIcon,
  PixelPauseIcon,
  PixelPlayIcon,
  PixelArchiveIcon,
} from "@/components/ui/pixel/PixelIcons";
import { HabitIconRenderer } from "@/features/habits/components/HabitIconRenderer";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.id as string;

  const { habits, loadHabits, updateHabitStatus, todayMissions, logHabitCompletion, isLoading } = useHabitStore();
  const { gainExp, gainGold, gainGems, addStat } = useCharacterStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (habits.length === 0) {
      loadHabits();
    }
  }, [habits.length, loadHabits]);

  const habit = habits.find((h) => h.id === habitId);
  const todayMission = todayMissions.find((m) => m.habitId === habitId);
  const isCompletedToday = todayMission?.status === "COMPLETED";

  if (isLoading && !habit) {
    return (
      <div className="flex justify-center items-center h-64 text-[#d1d6dc] font-pixel text-xs">
        <div className="animate-spin w-8 h-8 border-4 border-[#ffb03a] border-t-transparent mr-3" />
        Loading Habit Analytics...
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4 font-pixel text-[#1d2d2a]">
        <h2 className="text-xl font-bold uppercase">✦ Habit Not Found ✦</h2>
        <p className="text-[#5a6472] text-xs font-mono">
          This habit may have been deleted or does not exist in your active routines.
        </p>
        <Link href="/habits" onClick={() => playUIMenuSFX("confirm")}>
          <button
            type="button"
            className="px-4 py-2 bg-[#ffb03a] hover:bg-[#ffd166] text-[#1d2d2a] font-pixel font-bold text-xs border-2 border-[#1d2d2a] shadow-[3px_3px_0_0_#1d2d2a] active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 mx-auto"
          >
            <PixelArrowLeftIcon className="w-3.5 h-3.5 mr-1" />
            <span>Return to Habits</span>
          </button>
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (
    newStatus: "PAUSED" | "ACTIVE" | "ARCHIVED" | "DELETED"
  ) => {
    setIsMenuOpen(false);

    if (newStatus === "DELETED") {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this habit? This action cannot be undone."
      );
      if (!confirmDelete) return;
    }

    playBuffSFX();
    await updateHabitStatus(habit.id, newStatus);
    toast.success(`Habit status updated to ${newStatus}`);

    if (newStatus === "DELETED") {
      router.push("/habits");
    }
  };

  const handleLogHabit = async (tier: CompletionType = "NORMAL") => {
    if (isLogging) return;
    setIsLogging(true);
    try {
      playBuffSFX();
      const res = await logHabitCompletion(habit.id, tier);
      if (res.success && res.rewards) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });

        // Sync Character store currencies and stats
        gainExp(res.rewards.exp, `Habit: ${habit.name}`);
        gainGold(res.rewards.gold, `Habit: ${habit.name}`);
        if (res.rewards.gems > 0) gainGems(res.rewards.gems, "Elite Habit Completion");
        if (res.rewards.stat > 0 && res.rewards.statName) {
          addStat(res.rewards.statName, res.rewards.stat);
        }

        toast.success(`✓ ${habit.name} Logged!`, {
          description: `+${res.rewards.exp} EXP • +${res.rewards.gold} Gold • Streak: ${res.rewards.streak}d`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to log habit.");
    } finally {
      setIsLogging(false);
    }
  };

  const strength = Math.min(100, Math.max(0, habit.metrics?.habitStrength || 0));
  const currentStreak = habit.metrics?.currentStreak || 0;
  const longestStreak = habit.metrics?.longestStreak || 0;
  const consistency = habit.metrics?.currentConsistency || 0;

  return (
    <div className="max-w-5xl mx-auto py-4 px-3 sm:px-6 space-y-5 font-pixel text-[#1d2d2a] select-none animate-in fade-in duration-200">
      {/* Navigation Breadcrumb */}
      <Link
        href="/habits"
        onClick={() => playUIMenuSFX()}
        className="inline-flex items-center gap-1.5 text-xs text-[#5a6472] hover:text-[#1d2d2a] uppercase transition-colors font-bold focus-visible:ring-2 focus-visible:ring-[#ffb03a]"
      >
        <PixelArrowLeftIcon className="w-3.5 h-3.5" />
        <span>Return to Habits</span>
      </Link>

      {/* ========================================================= */}
      {/* 🏔️ 1. HABIT HEADER & CONTROLS                             */}
      {/* ========================================================= */}
      <div className="bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-4 border-[#3b424c] shadow-[6px_6px_0_0_#1d2d2a] p-5 sm:p-6 relative overflow-hidden text-[#1d2d2a]">
        {/* Quick Menu */}
        <div className="absolute top-4 right-4 z-20">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playUIMenuSFX();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="px-2.5 py-1.5 bg-[#2f3640] hover:bg-[#3b424c] text-[#ffd166] border-2 border-[#1d2d2a] shadow-[2px_2px_0_0_#111a18] active:translate-y-0.5 cursor-pointer text-xs focus-visible:ring-2 focus-visible:ring-[#ffb03a] flex items-center gap-1.5"
              aria-label="Habit Options"
            >
              <PixelGearIcon className="w-3.5 h-3.5 text-[#ffb03a]" />
              <span>Options</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#2f3640] border-2 border-[#1d2d2a] shadow-[4px_4px_0_0_#111a18] z-30 overflow-hidden text-xs">
                <button
                  onClick={() => {
                    playUIMenuSFX();
                    setIsMenuOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-[#ffd166] hover:bg-[#3b424c] flex items-center gap-2 cursor-pointer uppercase font-bold"
                >
                  <PixelPencilIcon className="w-3.5 h-3.5 text-[#ffb03a]" />
                  <span>Edit Habit</span>
                </button>

                {habit.status === "ACTIVE" ? (
                  <button
                    onClick={() => handleStatusChange("PAUSED")}
                    className="w-full text-left px-3 py-2 text-[#ffb03a] hover:bg-[#3b424c] flex items-center gap-2 cursor-pointer uppercase font-bold"
                  >
                    <PixelPauseIcon className="w-3 h-3 text-[#ffb03a]" />
                    <span>Pause Habit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange("ACTIVE")}
                    className="w-full text-left px-3 py-2 text-emerald-400 hover:bg-[#3b424c] flex items-center gap-2 cursor-pointer uppercase font-bold"
                  >
                    <PixelPlayIcon className="w-3 h-3 text-emerald-400" />
                    <span>Resume Habit</span>
                  </button>
                )}

                <button
                  onClick={() => handleStatusChange("ARCHIVED")}
                  className="w-full text-left px-3 py-2 text-[#d1d6dc] hover:bg-[#3b424c] flex items-center gap-2 cursor-pointer uppercase font-bold"
                >
                  <PixelArchiveIcon className="w-3 h-3 text-[#d1d6dc]" />
                  <span>Archive</span>
                </button>

                <button
                  onClick={() => handleStatusChange("DELETED")}
                  className="w-full text-left px-3 py-2 text-rose-400 hover:bg-[#3b424c] flex items-center gap-2 border-t border-[#1d2d2a] cursor-pointer uppercase font-bold"
                >
                  <PixelTrashIcon className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Content */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 bg-[#2f3640] border-2 border-[#1d2d2a] flex items-center justify-center shadow-[2px_2px_0_0_#1d2d2a] shrink-0">
              <HabitIconRenderer habit={habit} className="w-7 h-7 text-[#ffd166]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] text-[9px] font-bold">
                  ● {habit.status}
                </span>

                <span className="px-2 py-0.5 bg-[#2f3640] text-[#ffb03a] border border-[#1d2d2a] text-[9px] font-bold">
                  {habit.category || "General"}
                </span>

                <span className="px-2 py-0.5 bg-[#5a6472] text-white border border-[#1d2d2a] text-[9px] font-bold uppercase">
                  Stat: +{habit.primaryStat}
                </span>

                <span className="px-2 py-0.5 bg-[#2f3640] text-[#ea580c] border border-[#1d2d2a] text-[9px] font-bold uppercase">
                  {habit.difficulty}
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-bold uppercase text-[#1d2d2a]">
                {habit.name}
              </h1>
            </div>
          </div>

          {habit.description && (
            <p className="text-xs text-[#2a2b2e] max-w-2xl leading-relaxed font-mono font-medium">
              {habit.description}
            </p>
          )}

          {/* Strength Bar Inset */}
          <div className="p-3 bg-[#b0b8c4]/60 border-2 border-[#3b424c] space-y-1.5 shadow-[inset_0_0_6px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#3b424c] font-bold uppercase flex items-center gap-1">
                <PixelAnvilIcon className="w-3.5 h-3.5 text-[#ea580c]" />
                Habit Strength & Momentum
              </span>
              <span className="text-[#ea580c] font-bold text-xs tabular-nums font-mono">
                {Math.round(strength)}%
              </span>
            </div>
            <div className="w-full h-3 bg-[#2f3640] border border-[#1d2d2a] p-0.5 overflow-hidden">
              <div
                className="h-full bg-[linear-gradient(90deg,#ea580c_0%,#ffb03a_60%,#ffd166_100%)] shadow-[0_0_8px_rgba(255,176,58,0.8)] transition-all duration-200"
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ⚡ 2. TODAY'S CHECK-IN INTERACTIVE ACTION MODULE          */}
      {/* ========================================================= */}
      <div className="bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-4 border-[#3b424c] shadow-[4px_4px_0_0_#1d2d2a] p-5 space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2 border-b-2 border-[#3b424c]/20 pb-2.5">
          <h3 className="text-xs uppercase font-bold text-[#1d2d2a] tracking-wider flex items-center gap-1.5">
            <PixelCheckIcon className="w-4 h-4 text-emerald-600" />
            Today's Check-In & Action
          </h3>
          <span className="text-[10px] font-mono font-bold text-[#5a6472]">
            Schedule: {habit.scheduleType.replace(/_/g, " ")}
          </span>
        </div>

        {isCompletedToday ? (
          <div className="p-3.5 bg-[#1b3d2b] border-2 border-emerald-500 shadow-[inset_0_0_6px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500 text-[#1d2d2a] flex items-center justify-center">
                <PixelCheckIcon className="w-4 h-4 text-[#1d2d2a]" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300 uppercase">
                  Completed for Today ({todayMission?.completionType || "NORMAL"})
                </p>
                <p className="text-[10px] text-[#d1d6dc] font-mono">
                  Great job keeping your streak active! Check back tomorrow for your next check-in.
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-[#2f3640] border border-emerald-400 text-xs font-bold text-[#ffd166] font-mono">
              +{todayMission?.expEarned || 50} EXP • +{todayMission?.goldEarned || 20}g
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] text-[#3b424c] font-mono">
              Complete your daily habit target and choose your effort tier to earn scaled EXP and Gold:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(habit.tiers || []).map((t) => {
                const isMini = t.tier === "MINI";
                const isNormal = t.tier === "NORMAL";
                const isElite = t.tier === "ELITE";

                return (
                  <button
                    key={t.tier}
                    type="button"
                    onClick={() => handleLogHabit(t.tier)}
                    disabled={isLogging}
                    className={`p-3 border-2 text-left transition-all active:translate-y-0.5 cursor-pointer flex flex-col justify-between shadow-[2px_2px_0_0_#1d2d2a] ${
                      isNormal
                        ? "bg-[#ffb03a] hover:bg-[#ffd166] text-[#1d2d2a] border-[#1d2d2a]"
                        : isElite
                        ? "bg-[#ea580c] hover:bg-[#f97316] text-white border-[#1d2d2a]"
                        : "bg-[#2f3640] hover:bg-[#3b424c] text-[#ffd166] border-[#1d2d2a]"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase">
                          {isMini ? "MINIMUM" : isNormal ? "TARGET" : "OVERACHIEVE"}
                        </span>
                        <span className="text-[9px] px-1 bg-[#1d2d2a]/20 font-bold font-mono">
                          {t.tier}
                        </span>
                      </div>
                      <p className={`text-[10px] font-mono ${isNormal ? "text-[#1d2d2a]" : "text-[#d1d6dc]"}`}>
                        {t.targetValue ? `${t.targetValue} ${t.targetUnit || "times"}` : "Standard target"}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-current/20 flex justify-between items-center text-[10px] font-mono font-bold">
                      <span>+{t.baseExp} EXP</span>
                      <span>+{t.baseGold}g</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 📜 3. 3-TIER EXECUTION TARGETS DECK                       */}
      {/* ========================================================= */}
      <div>
        <h3 className="text-xs uppercase font-bold text-[#1d2d2a] tracking-wider mb-2.5 flex items-center gap-1.5">
          <PixelTargetIcon className="w-3.5 h-3.5 text-[#ea580c]" />
          Execution Target Tiers & Rewards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {(habit.tiers || [
            { tier: "MINI", targetValue: 1, baseExp: 25, baseGold: 10, statReward: 1 },
            { tier: "NORMAL", targetValue: 2, baseExp: 50, baseGold: 20, statReward: 2 },
            { tier: "ELITE", targetValue: 4, baseExp: 100, baseGold: 40, statReward: 4 },
          ]).map((t: any) => {
            return (
              <div
                key={t.tier || t.name}
                className="p-4 bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-3 border-[#3b424c] shadow-[4px_4px_0_0_#1d2d2a] space-y-3 text-[#1d2d2a]"
              >
                <div className="flex justify-between items-center border-b-2 border-[#3b424c]/20 pb-2">
                  <span className="px-2 py-0.5 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] text-xs font-bold shadow-[1px_1px_0_0_#1d2d2a]">
                    {t.tier} TIER
                  </span>
                  <span className="text-xs font-bold text-[#1d2d2a] font-mono tabular-nums">
                    Target: {t.targetValue} {t.targetUnit || "times"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#5a6472] font-bold font-mono">EXP Reward:</span>
                    <span className="text-[#1d2d2a] font-bold tabular-nums font-mono">+{t.baseExp || 50} EXP</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#5a6472] font-bold font-mono">Gold Bounty:</span>
                    <span className="text-[#ea580c] font-bold flex items-center gap-0.5 tabular-nums font-mono">
                      <PixelCoinsIcon className="w-2.5 h-2.5 text-[#ffd166]" />
                      +{t.baseGold || 20}g
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#5a6472] font-bold font-mono">Stat Boost:</span>
                    <span className="text-[#1d2d2a] font-bold tabular-nums font-mono">
                      +{t.statReward || 1} {habit.primaryStat?.substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📊 4. HISTORICAL METRICS & STREAK VOLUME                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-3 border-[#3b424c] shadow-[4px_4px_0_0_#1d2d2a] flex items-center justify-between text-[#1d2d2a]">
          <div>
            <span className="text-[10px] text-[#5a6472] font-bold uppercase font-mono block">Current Streak</span>
            <span className="text-2xl font-bold text-[#ea580c] tabular-nums font-mono">{currentStreak}d</span>
          </div>
          <div className="w-8 h-8 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] flex items-center justify-center shadow-inner">
            <PixelFlameIcon className="w-4 h-4 text-[#ffb03a]" />
          </div>
        </div>

        <div className="p-3.5 bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-3 border-[#3b424c] shadow-[4px_4px_0_0_#1d2d2a] flex items-center justify-between text-[#1d2d2a]">
          <div>
            <span className="text-[10px] text-[#5a6472] font-bold uppercase font-mono block">Best Record</span>
            <span className="text-2xl font-bold text-[#ea580c] tabular-nums font-mono">{longestStreak}d</span>
          </div>
          <div className="w-8 h-8 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] flex items-center justify-center shadow-inner">
            <PixelFlameIcon className="w-4 h-4 text-[#ffb03a]" />
          </div>
        </div>

        <div className="p-3.5 bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-3 border-[#3b424c] shadow-[4px_4px_0_0_#1d2d2a] flex items-center justify-between text-[#1d2d2a]">
          <div>
            <span className="text-[10px] text-[#5a6472] font-bold uppercase font-mono block">Consistency Rate</span>
            <span className="text-2xl font-bold text-[#1d2d2a] tabular-nums font-mono">{Math.round(consistency)}%</span>
          </div>
          <div className="w-8 h-8 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] flex items-center justify-center shadow-inner">
            <PixelHourglassIcon className="w-4 h-4 text-[#ffd166]" />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditHabitModal
          habit={habit}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

