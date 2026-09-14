"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  Plus,
  Footprints,
  Flame,
  Milestone,
  Zap,
} from "lucide-react";
import { useBeastStore } from "@/features/beasts/store/useBeastStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Progress } from "@/components/ui/8bit/progress";
import { Button } from "@/components/ui/8bit/button";

export function CompanionSanctumCard() {
  const { character } = useCharacterStore();
  const {
    collection,
    syncSteps,
    upgradeBeast,
    hatchEgg,
    isSyncingSteps,
    isUpgrading,
    isHatching,
  } = useBeastStore();

  const equippedBeast = collection?.equippedBeast;
  const activeEgg = collection?.activeEgg;
  const charId = character?.id || "char-id-123";

  const dailySteps = collection?.dailySteps ?? character?.dailySteps ?? 0;
  const dailyStepGoal = collection?.dailyStepGoal ?? character?.dailyStepGoal ?? 10000;
  const dailyProgress = Math.min(100, Math.round((dailySteps / dailyStepGoal) * 100));

  // Calories & distance approximation
  const caloriesBurned = Math.round(dailySteps * 0.04);
  const distanceKm = (dailySteps * 0.00075).toFixed(2);

  // Quick step addition
  const handleQuickAddSteps = async (amount: number) => {
    playUIMenuSFX("confirm");
    await syncSteps(charId, amount, "DASHBOARD_QUICK_ADD");
  };

  // Beast level-up upgrade
  const handleUpgradeBeast = async () => {
    if (!equippedBeast || isUpgrading) return;
    await upgradeBeast(charId, equippedBeast.id);
  };

  // Hatch egg
  const handleHatchEgg = async () => {
    if (!activeEgg || isHatching) return;
    playBuffSFX("levelup");
    await hatchEgg(charId, activeEgg.id);
  };

  return (
    <Card variant="tavern" font="retro" className="shadow-[4px_4px_0_0_#000]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xs sm:text-sm text-[#f3df9d] tracking-wider">
              SANCTUM & PEDOMETER
            </CardTitle>
            <CardDescription className="text-[8px] sm:text-[9px] text-[#c59b27] mt-0.5">
              Familiar Vivarium • Step Tracker
            </CardDescription>
          </div>
          <Link
            href="/beasts"
            className="retro text-[9px] text-[#ffd875] hover:text-white flex items-center gap-1 transition-colors group"
          >
            <span>BESTIARY</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {/* 1. COMPANION VIVARIUM CLOCHE */}
        <div className="p-3 bg-[#141a2e]/90 border-2 border-[#8c7a53] shadow-[2px_2px_0_0_#000]">
          {equippedBeast ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Pixel Cloche Specimen Frame */}
                <div className="w-14 h-14 bg-[#0d1220] border-2 border-[#8c7a53] flex items-center justify-center p-1 relative flex-shrink-0 shadow-[1px_1px_0_0_#000]">
                  <img
                    src={
                      equippedBeast.spritePath
                        ? equippedBeast.spritePath.replace(".png", ".gif")
                        : "/beasts/beast_1.gif"
                    }
                    alt={equippedBeast.name}
                    className="w-full h-full object-contain pixelated animate-pixel-bob"
                  />
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="gold" className="text-[7px] px-1 py-0">
                      LV.{equippedBeast.level || 1}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="retro text-[10px] sm:text-xs font-bold text-[#f5dab0] truncate">
                      {equippedBeast.name}
                    </h3>
                    <Badge variant="secondary" className="text-[7px] py-0 px-1">
                      {equippedBeast.rarity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 retro text-[8px] text-[#10b981] font-bold">
                    <Sparkles className="w-3 h-3 text-[#10b981]" />
                    <span>
                      +{equippedBeast.statBonusValue}%{" "}
                      {equippedBeast.statBonusType?.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Level up step bar */}
              {(() => {
                const bLevel = equippedBeast.level || 1;
                const bAccum = equippedBeast.accumulatedSteps || 0;
                const effectiveSteps = Math.max(bAccum, dailySteps);
                const bStepReq = equippedBeast.stepUpgradeReq || bLevel * 5000;
                const bGoldReq = equippedBeast.goldUpgradeReq || bLevel * 1000;
                const charGold = character?.gold || 0;

                const canUpgrade =
                  effectiveSteps >= bStepReq && charGold >= bGoldReq && bLevel < 10;

                return (
                  <div className="pt-2 border-t border-[#8c7a53]/40 space-y-1.5">
                    <div className="flex items-center justify-between retro text-[8px] text-[#ffd875]">
                      <span>VIVARIUM STEPS</span>
                      <span className="font-mono">
                        {effectiveSteps.toLocaleString()} / {bStepReq.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={effectiveSteps}
                      max={bStepReq}
                      variant="retro"
                      progressBg="bg-amber-500"
                      className="h-3 border border-black"
                    />
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="retro text-[8px] text-[#d4a373]">
                        {bGoldReq.toLocaleString()} G
                      </span>
                      <Button
                        size="sm"
                        variant={canUpgrade ? "gold" : "secondary"}
                        onClick={handleUpgradeBeast}
                        disabled={!canUpgrade || isUpgrading}
                        className="text-[8px] h-6 px-2"
                      >
                        {isUpgrading
                          ? "ATTUNING..."
                          : bLevel >= 10
                          ? "MAX LEVEL"
                          : `ASCEND LV.${bLevel + 1}`}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="py-3 text-center space-y-2.5">
              <p className="retro text-[9px] text-slate-400">
                No Familiar bound to sanctum.
              </p>
              <Link href="/beasts">
                <Button size="sm" variant="secondary" className="text-[8px] h-7">
                  <Plus className="w-3 h-3 mr-1" /> Bind Familiar
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* 2. MECHANICAL POCKET PEDOMETER */}
        <div className="p-3 bg-[#141a2e]/90 border-2 border-[#8c7a53] shadow-[2px_2px_0_0_#000] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0d1220] border border-[#8c7a53] flex items-center justify-center text-[#ffd875]">
                <Footprints className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="retro text-[8px] text-[#c59b27] block">
                  PEDOMETER
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {dailySteps.toLocaleString()} / {dailyStepGoal.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 retro text-[8px] text-[#ffd875]">
              <span className="px-1.5 py-0.5 bg-[#0d1220] border border-[#8c7a53]/60 flex items-center gap-1">
                <Milestone className="w-2.5 h-2.5 text-[#c59b27]" />
                {distanceKm}km
              </span>
              <span className="px-1.5 py-0.5 bg-[#0d1220] border border-[#8c7a53]/60 flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-amber-400" />
                {caloriesBurned}kcal
              </span>
            </div>
          </div>

          {/* Step Progress Tube */}
          <Progress
            value={dailyProgress}
            max={100}
            variant="retro"
            progressBg="bg-emerald-500"
            className="h-3.5 border border-black"
          />

          <div className="flex items-center justify-between retro text-[8px] text-slate-400">
            <span>{dailyProgress}% OF EXPEDITION</span>
            <span className="text-[#ffd875]">
              {caloriesBurned} kcal
            </span>
          </div>

          {/* Quick Step Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAddSteps(500)}
              disabled={isSyncingSteps}
              className="text-[8px] h-7"
            >
              +500
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAddSteps(1000)}
              disabled={isSyncingSteps}
              className="text-[8px] h-7"
            >
              +1,000
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAddSteps(2500)}
              disabled={isSyncingSteps}
              className="text-[8px] h-7"
            >
              +2,500
            </Button>
          </div>
        </div>

        {/* 3. INCUBATION BELL JAR */}
        <div className="p-3 bg-[#141a2e]/90 border-2 border-[#8c7a53] shadow-[2px_2px_0_0_#000]">
          {activeEgg ? (
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-between retro text-[8px] text-white">
                <span className="text-[#c59b27]">BELL JAR</span>
                <span className="text-[#ffd875] font-bold">{activeEgg.name}</span>
              </div>
              <Progress
                value={activeEgg.currentSteps ?? activeEgg.current_steps ?? 0}
                max={activeEgg.targetSteps ?? activeEgg.target_steps ?? 5000}
                variant="retro"
                progressBg="bg-amber-500"
                className="h-3 border border-black"
              />
              {((activeEgg.currentSteps ?? activeEgg.current_steps ?? 0) >=
                (activeEgg.targetSteps ?? activeEgg.target_steps ?? 5000) ||
                activeEgg.status === "READY_TO_HATCH") && (
                <Button
                  size="sm"
                  variant="gold"
                  onClick={handleHatchEgg}
                  disabled={isHatching}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 text-[8px] h-7"
                >
                  {isHatching ? (
                    "HATCHING..."
                  ) : (
                    <>
                      <Zap className="w-3 h-3" />
                      <span>HATCH SPECIMEN</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="py-2 text-center space-y-2">
              <p className="retro text-[8px] text-slate-400">
                Incubation jar is empty.
              </p>
              <Link href="/beasts">
                <Button size="sm" variant="secondary" className="text-[8px] h-7">
                  <Plus className="w-3 h-3 mr-1" /> Place Egg
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CompanionSanctumCard;
