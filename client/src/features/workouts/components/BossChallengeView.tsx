"use client";

import React from "react";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelProgress } from "@/components/ui/pixel/PixelProgress";
import {
  PixelSwordIcon,
  PixelFlameIcon,
} from "@/components/ui/pixel/PixelIcons";
import {
  Trophy,
  Crosshair,
  Sparkles,
  Shield,
  Zap,
  Target,
  Crown,
  Info,
} from "lucide-react";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { getEnemySpriteUrl } from "@/utils/spriteUtils";

interface BossChallengeViewProps {
  boss: {
    id?: string;
    name: string;
    bossSprite?: string;
    isDefeated?: boolean;
    currentDamage: number;
    targetExercise: string;
    targetWeight: number;
    targetReps: number;
    expiresAt: string;
    rewards?: any;
  };
  isWorkoutActive: boolean;
  onStartChallenge: () => void;
}

export function BossChallengeView({
  boss,
  isWorkoutActive,
  onStartChallenge,
}: BossChallengeViewProps) {
  const hpPercent = boss.isDefeated
    ? 0
    : Math.max(0, 100 - (boss.currentDamage || 0) * 100);

  const rewards =
    typeof boss.rewards === "string"
      ? JSON.parse(boss.rewards)
      : boss.rewards || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch w-full">
      {/* ========================================================= */}
      {/* 1. LEFT COLUMN: BOSS ARENA STAGE DAIS                     */}
      {/* ========================================================= */}
      <div className="pixel-stone-slab p-5 sm:p-6 select-none flex flex-col justify-between relative border-2 border-[#5a3e30] h-full">
        {/* Boss Header & Ribbon */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <span className="pixel-imperial-ribbon px-3 py-1 text-xs font-bold shadow-[0_2px_8px_rgba(185,28,28,0.5)] flex items-center gap-1.5">
              <PixelSwordIcon className="w-3.5 h-3.5 text-[#fca5a5]" />
              {boss.name}
            </span>
          </div>

          {/* Elevated Boss Sprite Arena Sand Pit */}
          <div className="pixel-arena-dirt border-2 border-[#6b4d32] min-h-[260px] h-[270px] flex items-center justify-center my-3 relative overflow-hidden shadow-[inset_0_0_34px_rgba(0,0,0,0.85)]">
            {/* Roman Portcullis Iron Bars Backdrop */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_18px,rgba(20,14,12,0.65)_18px,rgba(20,14,12,0.65)_21px)] pointer-events-none" />
            {/* Arena Sand Pit Warm Sunlight Radial Focus */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18)_0%,transparent_72%)] pointer-events-none" />

            {boss.name || boss.bossSprite ? (
              <img
                src={getEnemySpriteUrl(
                  boss.name || boss.bossSprite || "Gym Behemoth",
                  {
                    isBoss: true,
                    preferAnimated: true,
                  }
                )}
                alt={boss.name || "Colosseum Titan"}
                onError={(e) => {
                  e.currentTarget.src = "/bosses/gollux.gif";
                }}
                className={`h-52 object-contain relative z-10 ${
                  boss.isDefeated
                    ? "grayscale opacity-40"
                    : "drop-shadow-[0_0_22px_rgba(239,68,68,0.75)] hover:scale-105 transition-transform duration-200"
                }`}
              />
            ) : (
              <Crown className="w-28 h-28 text-[#f59e0b] relative z-10" />
            )}
          </div>
        </div>

        {/* HP Bar & Win Condition Directive */}
        <div className="space-y-4 pt-2">
          {/* Boss HP Bar */}
          <div className="space-y-1.5 font-pixel text-[10px]">
            <div className="flex justify-between font-bold">
              <span className="text-[#ef4444] flex items-center gap-1.5">
                <PixelFlameIcon className="w-3.5 h-3.5 text-[#ef4444]" />
                BOSS HEALTH (HP)
              </span>
              <span className="text-white font-pixel-chunky text-sm tabular-nums">
                {hpPercent.toFixed(1)}% HP
              </span>
            </div>
            <PixelProgress
              value={hpPercent}
              max={100}
              variant={
                hpPercent < 25
                  ? "danger"
                  : hpPercent < 60
                  ? "warning"
                  : "danger"
              }
              height="lg"
            />
          </div>

          {/* Win Condition Directive Card */}
          <div className="p-3.5 bg-[#140e0c] border-2 border-[#4a3830] text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-pixel text-[10px] text-stone-400 uppercase tracking-wider">
              <Crosshair className="w-3.5 h-3.5 text-[#ef4444]" />
              <span>TARGET CHALLENGE GOAL</span>
            </div>
            <div className="font-pixel text-xs font-bold text-white uppercase">
              {boss.targetExercise}
            </div>
            <div className="font-pixel-chunky text-2xl text-[#f59e0b] tracking-wider font-bold">
              {boss.targetWeight} KG × {boss.targetReps} REPS
            </div>
            <p className="font-pixel text-[9px] text-stone-400 mt-1">
              *Damage dealt scales with weight and reps logged on the target exercise.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. RIGHT COLUMN: UNIFIED COMMAND & DIRECTIVE PANEL        */}
      {/* ========================================================= */}
      <div className="pixel-stone-slab p-5 sm:p-6 select-none flex flex-col justify-between relative border-2 border-[#5a3e30] h-full">
        {/* Top & Middle Sections Wrapper */}
        <div className="space-y-5">
          {/* Top Section: Challenge Completion Rewards */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b-2 border-[#4a3830]/80">
              <div className="w-8 h-8 bg-[#140e0c] border border-[#4a3830] flex items-center justify-center text-[#f59e0b]">
                <Trophy className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <div>
                <h3 className="font-pixel text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Challenge Completion Rewards
                </h3>
                <p className="font-pixel text-[9px] text-stone-400">
                  Claimed upon victory over the weekly guardian
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3.5">
              <PixelBadge variant="iron" size="sm">
                <Sparkles className="w-3 h-3 text-stone-300 mr-1" />
                +{rewards.exp || 2500} EXP
              </PixelBadge>

              <PixelBadge variant="gold" size="sm">
                <CurrencyIcon type="GOLD" size="xs" />
                <span className="ml-1">+{rewards.gold || 1000} GOLD</span>
              </PixelBadge>

              <PixelBadge variant="danger" size="sm">
                <CurrencyIcon type="GEMS" size="xs" />
                <span className="ml-1">+{rewards.gems || 50} GEMS</span>
              </PixelBadge>

              <PixelBadge variant="warning" size="sm">
                <CurrencyIcon type="TOWER_TOKENS" size="xs" />
                <span className="ml-1">
                  +{rewards.towerTokens || 100} TOKENS
                </span>
              </PixelBadge>

              <PixelBadge variant="success" size="sm">
                <Zap className="w-3 h-3 text-emerald-400 mr-1" />
                +{rewards.statAmount || 2} {rewards.stat || "STRENGTH"}
              </PixelBadge>
            </div>
          </div>

          {/* Clean Pixel Divider */}
          <div className="border-t border-[#4a3830]/80" />

          {/* Middle Section: Encounter Directives / How It Works */}
          <div className="space-y-3 font-pixel text-[10px] text-stone-300">
            <div className="text-white uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Target className="w-3.5 h-3.5 text-[#ef4444]" />
              <span>Encounter Directives</span>
            </div>

            <div className="space-y-2 bg-[#140e0c]/80 border border-[#3e2b20] p-3 rounded-none">
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-none bg-[#241510] border border-[#ef4444]/60 text-[#ef4444] font-bold flex items-center justify-center shrink-0 text-[9px]">
                  1
                </span>
                <span className="leading-tight text-stone-200">
                  Start a workout and log your sets for{" "}
                  <strong className="text-white underline decoration-[#ef4444]/60 underline-offset-2">
                    {boss.targetExercise}
                  </strong>
                  .
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-none bg-[#241510] border border-[#ef4444]/60 text-[#ef4444] font-bold flex items-center justify-center shrink-0 text-[9px]">
                  2
                </span>
                <span className="leading-tight text-stone-200">
                  Damage dealt is automatically calculated from your logged
                  weight and completed reps.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-none bg-[#241510] border border-[#ef4444]/60 text-[#ef4444] font-bold flex items-center justify-center shrink-0 text-[9px]">
                  3
                </span>
                <span className="leading-tight text-stone-200">
                  Damage accumulates throughout the cycle until the weekly reset on{" "}
                  <strong
                    suppressHydrationWarning
                    className="text-[#f59e0b]"
                  >
                    {new Date(boss.expiresAt).toLocaleDateString()}
                  </strong>
                  .
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] text-stone-400 pt-0.5">
              <Info className="w-3 h-3 text-[#f59e0b] shrink-0" />
              <span>
                Personal records (PRs) trigger critical damage multipliers.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Primary Action Button - Flush with Left Card Bottom */}
        <div className="pt-5 mt-4 border-t-2 border-[#4a3830]/80">
          <PixelButton
            variant={boss.isDefeated ? "dark" : "danger"}
            size="lg"
            disabled={boss.isDefeated || isWorkoutActive}
            onClick={onStartChallenge}
            className="w-full h-13 py-3.5 text-xs font-pixel uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(185,28,28,0.35)]"
          >
            {boss.isDefeated ? (
              <>
                <Trophy className="w-4 h-4 text-[#f59e0b]" />
                <span>BOSS DEFEATED THIS WEEK</span>
              </>
            ) : isWorkoutActive ? (
              <>
                <Shield className="w-4 h-4 text-white" />
                <span>SESSION ACTIVE (CHECK HUD)</span>
              </>
            ) : (
              <>
                <PixelSwordIcon className="w-4 h-4 text-white" />
                <span>START BOSS WORKOUT</span>
              </>
            )}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
