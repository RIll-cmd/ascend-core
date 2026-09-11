"use client";

import React, { useEffect, useState } from "react";
import { useDailyBonusStore, getDailyEggForLevel } from "@/store/useDailyBonusStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import Link from "next/link";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelProgress } from "@/components/ui/pixel/PixelProgress";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CoolMode } from "@/components/ui/cool-mode";
import {
  PixelSparklesIcon,
  PixelLightningIcon,
  PixelCheckIcon,
  PixelDumbbellIcon,
  PixelBookIcon,
  PixelGiftIcon,
  PixelRefreshIcon,
  PixelCrownIcon,
  PixelSwordIcon,
  PixelFootprintsIcon,
  PixelHistoryIcon,
} from "@/components/ui/pixel/PixelIcons";

export const DailyWeeklyBonusQuestCard: React.FC = () => {
  const {
    habitBoostCharges,
    maxHabitBoostCharges,
    learningBoostCharges,
    maxLearningBoostCharges,
    workoutBoostCharges,
    maxWorkoutBoostCharges,
    dailyEggClaimed,
    shopRefreshCharges,
    maxShopRefreshCharges,
    weeklyBossPrDefeated,
    weeklyBonusesClaimedCount,
    weeklyTowerFloorsCleared,
    weeklyStepsAccumulated,
    claimDailyEgg,
    checkAndResetDaily,
  } = useDailyBonusStore();

  const { character, gainExp, gainGold, gainGems, gainStreakFreeze } = useCharacterStore();
  const [activeTab, setActiveTab] = useState<"DAILY_BONUSES" | "WEEKLY_QUESTS">("DAILY_BONUSES");
  const [claimedWeeklyQuests, setClaimedWeeklyQuests] = useState<Record<string, boolean>>({});
  const [isClaimingEgg, setIsClaimingEgg] = useState(false);
  const [timeLeftToMidnight, setTimeLeftToMidnight] = useState("");

  const charId = character?.id || "char-id-123";
  const charLevel = character?.level || 1;
  const scaledEgg = getDailyEggForLevel(charLevel);

  useEffect(() => {
    checkAndResetDaily();
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeftToMidnight(`${hours}h ${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [checkAndResetDaily]);

  const handleClaimEgg = async () => {
    if (dailyEggClaimed || isClaimingEgg) return;
    setIsClaimingEgg(true);
    await claimDailyEgg(charId, charLevel);
    setIsClaimingEgg(false);
  };

  const handleClaimWeeklyQuest = (questId: string, exp: number, gold: number, bonusType?: string) => {
    playBuffSFX("levelup");
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    gainExp(exp, `Weekly Quest Cleared: ${questId}`);
    gainGold(gold, `Weekly Bounty: ${questId}`);
    if (bonusType === "GEMS") gainGems(10, "Weekly Quest Bounty");
    if (bonusType === "FREEZE") gainStreakFreeze(1, "Weekly Discipline Reward");

    setClaimedWeeklyQuests((prev) => ({ ...prev, [questId]: true }));
    toast.success(`🎉 WEEKLY QUEST COMPLETED!`, {
      description: `+${exp} EXP, +${gold} Gold earned!`,
    });
  };

  return (
    <div className="p-4 sm:p-5 bg-[#1A102F] border-4 border-[#3b1861] shadow-[0_-4px_0_0_#000,0_4px_0_0_#000,-4px_0_0_0_#000,4px_0_0_0_#000] font-pixel text-white space-y-4 select-none relative overflow-hidden">
      {/* Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black/40 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <PixelBadge variant="purple" size="sm">
              <PixelLightningIcon className="w-3 h-3 text-amber-400" />
              SYSTEM SURGES & DIRECTIVES
            </PixelBadge>
            <PixelBadge variant="dark" size="sm">
              <PixelHistoryIcon className="w-3 h-3 text-cyan-400" />
              RESET IN {timeLeftToMidnight || "00:00:00"}
            </PixelBadge>
          </div>
          <h2 className="text-sm sm:text-base font-bold pixel-text-outlined uppercase tracking-wider text-white">
            Daily Bonuses & Weekly Quests
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <PixelButton
            size="sm"
            variant={activeTab === "DAILY_BONUSES" ? "cyan" : "dark"}
            onClick={() => {
              playUIMenuSFX("confirm");
              setActiveTab("DAILY_BONUSES");
            }}
            className="text-xs"
          >
            <PixelSparklesIcon className="w-3.5 h-3.5 mr-1" />
            Daily (5)
          </PixelButton>

          <PixelButton
            size="sm"
            variant={activeTab === "WEEKLY_QUESTS" ? "purple" : "dark"}
            onClick={() => {
              playUIMenuSFX("confirm");
              setActiveTab("WEEKLY_QUESTS");
            }}
            className="text-xs"
          >
            <PixelCrownIcon className="w-3.5 h-3.5 mr-1" />
            Weekly (4)
          </PixelButton>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: 5 CORE DAILY BONUSES MATRIX (8-BIT) */}
      {/* ========================================================= */}
      {activeTab === "DAILY_BONUSES" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. Habit Double Boost (5 charges) */}
          <div className="p-3.5 bg-[#1A0D2E] border-2 border-[#3b1861] hover:border-cyan-400 flex flex-col justify-between space-y-2.5 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-[#120824] border border-[#3b1861] flex items-center justify-center text-cyan-400">
                <PixelCheckIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <PixelBadge variant="cyan" size="sm">
                <NumberTicker value={habitBoostCharges} />/{maxHabitBoostCharges} CHARGES
              </PixelBadge>
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white uppercase">
                5x Habit 2x Boost
              </h4>
              <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                Doubles Gold & EXP on your next 5 completed daily habits.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 text-[10px] border-t border-[#3b1861]">
              <span className="text-white/50">Auto-applies</span>
              <span className={habitBoostCharges > 0 ? "text-emerald-400 font-bold" : "text-white/40"}>
                {habitBoostCharges > 0 ? "⚡ ACTIVE (2X)" : "EXHAUSTED"}
              </span>
            </div>
          </div>

          {/* 2. Learning Double Multiplier (1 charge) */}
          <div className="p-3.5 bg-[#1A0D2E] border-2 border-[#3b1861] hover:border-purple-400 flex flex-col justify-between space-y-2.5 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-[#120824] border border-[#3b1861] flex items-center justify-center text-purple-400">
                <PixelBookIcon className="w-4 h-4 text-purple-400" />
              </div>
              <PixelBadge variant="purple" size="sm">
                <NumberTicker value={learningBoostCharges} />/{maxLearningBoostCharges} CHARGE
              </PixelBadge>
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white uppercase">
                1x Learning 2x Boost
              </h4>
              <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                Doubles EXP & Gold on your daily study/focus session.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 text-[10px] border-t border-[#3b1861]">
              <span className="text-white/50">Auto-applies</span>
              <span className={learningBoostCharges > 0 ? "text-purple-300 font-bold" : "text-white/40"}>
                {learningBoostCharges > 0 ? "READY (2X)" : "USED TODAY"}
              </span>
            </div>
          </div>

          {/* 3. Workout Double Surge (1 charge) */}
          <div className="p-3.5 bg-[#1A0D2E] border-2 border-[#3b1861] hover:border-red-400 flex flex-col justify-between space-y-2.5 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-[#120824] border border-[#3b1861] flex items-center justify-center text-red-400">
                <PixelDumbbellIcon className="w-4 h-4 text-red-400" />
              </div>
              <PixelBadge variant="danger" size="sm">
                <NumberTicker value={workoutBoostCharges} />/{maxWorkoutBoostCharges} CHARGE
              </PixelBadge>
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white uppercase">
                1x Workout 2x Surge
              </h4>
              <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                Doubles kinetic EXP, Gold & progression on your daily workout.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 text-[10px] border-t border-[#3b1861]">
              <span className="text-white/50">Auto-applies</span>
              <span className={workoutBoostCharges > 0 ? "text-red-400 font-bold" : "text-white/40"}>
                {workoutBoostCharges > 0 ? "SURGE (2X)" : "USED TODAY"}
              </span>
            </div>
          </div>

          {/* 4. Daily Scaled Free Mystery Egg (1 claim) */}
          <div className="p-3.5 bg-[#1A0D2E] border-2 border-amber-500/60 hover:border-amber-400 flex flex-col justify-between space-y-2.5 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-[#120824] border border-amber-500/60 flex items-center justify-center text-amber-400">
                <PixelGiftIcon className="w-4 h-4 text-amber-400" />
              </div>
              <PixelBadge variant="gold" size="sm">
                LV.<NumberTicker value={charLevel} /> SCALED
              </PixelBadge>
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white uppercase leading-tight">
                {scaledEgg.name}
              </h4>
              <p className="text-[11px] text-amber-300 mt-1">
                {scaledEgg.rarity} tier companion egg!
              </p>
            </div>
            <CoolMode options={{ particle: "🥚", size: 24, speedHorz: 4, speedUp: 8 }}>
              <PixelButton
                disabled={dailyEggClaimed || isClaimingEgg}
                onClick={handleClaimEgg}
                variant={dailyEggClaimed ? "dark" : "gold"}
                size="sm"
                className="w-full text-xs"
              >
                {dailyEggClaimed ? "CLAIMED TODAY ✓" : isClaimingEgg ? "CLAIMING..." : "CLAIM FREE EGG"}
              </PixelButton>
            </CoolMode>
          </div>

          {/* 5. 5x Free Shop Refreshes (5 charges) */}
          <div className="p-3.5 bg-[#1A0D2E] border-2 border-[#3b1861] hover:border-cyan-400 flex flex-col justify-between space-y-2.5 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-[#120824] border border-[#3b1861] flex items-center justify-center text-cyan-400">
                <PixelRefreshIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <PixelBadge variant="cyan" size="sm">
                {shopRefreshCharges}/{maxShopRefreshCharges} REROLLS
              </PixelBadge>
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white uppercase">
                5x Free Shop Rerolls
              </h4>
              <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                Reroll items in Armory & Market without tokens.
              </p>
            </div>
            <Link href="/shop" className="w-full">
              <PixelButton
                variant="dark"
                size="sm"
                className="w-full text-xs"
              >
                GO TO SHOP
              </PixelButton>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: WEEKLY QUESTS BOARD (8-BIT) */}
      {/* ========================================================= */}
      {activeTab === "WEEKLY_QUESTS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Weekly Quest 1: Defeat Boss PR */}
          <div className="p-3.5 bg-[#1A0D2E] border-2 border-red-500/60 space-y-2.5 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#120824] border border-red-500/60 flex items-center justify-center text-red-400">
                  <PixelSwordIcon className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white uppercase">
                    Titan Executioner: Boss PR
                  </h4>
                  <span className="text-[10px] text-red-300 block">
                    Weekly Boss Confrontation
                  </span>
                </div>
              </div>
              <PixelBadge variant="danger" size="sm">
                WEEKLY BOSS
              </PixelBadge>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed">
              Challenge and overcome your current Weekly Boss in the Boss PR Arena by hitting target overloads.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#3b1861] text-xs">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-cyan-300 font-bold">+500 EXP</span>
                <span className="text-amber-300 font-bold">+200g</span>
                <span className="text-purple-300 font-bold">+10 Gems</span>
              </div>

              {claimedWeeklyQuests["boss_pr"] ? (
                <PixelBadge variant="success" size="sm">
                  CLEARED ✓
                </PixelBadge>
              ) : weeklyBossPrDefeated ? (
                <PixelButton
                  size="sm"
                  variant="gold"
                  onClick={() => handleClaimWeeklyQuest("boss_pr", 500, 200, "GEMS")}
                  className="text-xs"
                >
                  CLAIM REWARD
                </PixelButton>
              ) : (
                <Link href="/workouts/boss-pr">
                  <PixelButton
                    size="sm"
                    variant="danger"
                    className="text-xs"
                  >
                    ENTER ARENA
                  </PixelButton>
                </Link>
              )}
            </div>
          </div>

          {/* Weekly Quest 2: Claim daily bonus 5x across the week */}
          <div className="p-3.5 bg-[#1A0D2E] border-2 border-cyan-500/60 space-y-2.5 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#120824] border border-cyan-500/60 flex items-center justify-center text-cyan-400">
                  <PixelSparklesIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white uppercase">
                    Perfectionist Cadence
                  </h4>
                  <span className="text-[10px] text-cyan-300 block">
                    Utilize Daily System Boosts 5x
                  </span>
                </div>
              </div>
              <PixelBadge variant="cyan" size="sm">
                <NumberTicker value={weeklyBonusesClaimedCount} /> / 5 USAGES
              </PixelBadge>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed">
              Complete habits, learning sessions, workouts, and egg claims using daily bonuses 5 times across the week.
            </p>

            <PixelProgress
              value={weeklyBonusesClaimedCount}
              max={5}
              variant="primary"
              height="sm"
            />

            <div className="flex items-center justify-between pt-1 border-t border-[#3b1861] text-xs">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-cyan-300 font-bold">+400 EXP</span>
                <span className="text-amber-300 font-bold">+150g</span>
                <span className="text-blue-300 font-bold">+1 Freeze</span>
              </div>

              {claimedWeeklyQuests["daily_bonuses"] ? (
                <PixelBadge variant="success" size="sm">
                  CLEARED ✓
                </PixelBadge>
              ) : (
                <CoolMode options={{ particle: "👑", size: 22, speedHorz: 4, speedUp: 8 }}>
                  <PixelButton
                    size="sm"
                    disabled={weeklyBonusesClaimedCount < 5}
                    variant={weeklyBonusesClaimedCount >= 5 ? "gold" : "dark"}
                    onClick={() => handleClaimWeeklyQuest("daily_bonuses", 400, 150, "FREEZE")}
                    className="text-xs"
                  >
                    {weeklyBonusesClaimedCount >= 5 ? "CLAIM REWARD" : "IN PROGRESS"}
                  </PixelButton>
                </CoolMode>
              )}
            </div>
          </div>

          {/* Weekly Quest 3: Spire Conqueror (3 Tower Floors) */}
          <div className="p-3.5 bg-[#1A0D2E] border-2 border-purple-500/60 space-y-2.5 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#120824] border border-purple-500/60 flex items-center justify-center text-purple-400">
                  <PixelCrownIcon className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white uppercase">
                    Spire Conqueror
                  </h4>
                  <span className="text-[10px] text-purple-300 block">
                    Tower of Ascension Trial
                  </span>
                </div>
              </div>
              <PixelBadge variant="purple" size="sm">
                {Math.min(3, weeklyTowerFloorsCleared)} / 3 FLOORS
              </PixelBadge>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed">
              Clear or attempt at least 3 Ascension Tower floors to demonstrate unyielding spiritual mastery.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#3b1861] text-xs">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-cyan-300 font-bold">+600 EXP</span>
                <span className="text-amber-300 font-bold">+250g</span>
                <span className="text-purple-300 font-bold">+50 Tokens</span>
              </div>

              {claimedWeeklyQuests["tower"] ? (
                <PixelBadge variant="success" size="sm">
                  CLEARED ✓
                </PixelBadge>
              ) : (
                <Link href="/tower">
                  <PixelButton
                    size="sm"
                    variant="purple"
                    className="text-xs"
                  >
                    ENTER TOWER
                  </PixelButton>
                </Link>
              )}
            </div>
          </div>

          {/* Weekly Quest 4: Ascendant Stride (40,000 Steps) */}
          <div className="p-3.5 bg-[#1A0D2E] border-2 border-emerald-500/60 space-y-2.5 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#120824] border border-emerald-500/60 flex items-center justify-center text-emerald-400">
                  <PixelFootprintsIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white uppercase">
                    Ascendant Stride
                  </h4>
                  <span className="text-[10px] text-emerald-300 block">
                    Kinetic Movement Quota
                  </span>
                </div>
              </div>
              <PixelBadge variant="success" size="sm">
                {((character?.dailySteps || 0) * 4).toLocaleString()} / 40K STEPS
              </PixelBadge>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed">
              Accumulate total weekly walking steps across workouts and daily activities to strengthen companions.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#3b1861] text-xs">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-cyan-300 font-bold">+750 EXP</span>
                <span className="text-amber-300 font-bold">+300g</span>
              </div>

              {claimedWeeklyQuests["steps"] ? (
                <PixelBadge variant="success" size="sm">
                  CLEARED ✓
                </PixelBadge>
              ) : (
                <Link href="/beasts">
                  <PixelButton
                    size="sm"
                    variant="dark"
                    className="text-xs"
                  >
                    VIEW SANCTUM
                  </PixelButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

