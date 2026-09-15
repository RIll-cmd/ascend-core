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

export function DashboardActivityCard() {
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
  const dailyStepGoal =
    collection?.dailyStepGoal ?? character?.dailyStepGoal ?? 10000;
  const dailyProgress = Math.min(
    100,
    Math.round((dailySteps / dailyStepGoal) * 100)
  );

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
    <Card variant="default" className="flex flex-col h-full shadow-[4px_4px_0_0_#000]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm sm:text-base tracking-wider text-foreground">
              ACTIVITY & FAMILIAR
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Familiar Vivarium • Step Tracker
            </CardDescription>
          </div>
          <Link
            href="/beasts"
            className="text-[9px] sm:text-[10px] font-mono font-bold text-foreground hover:underline flex items-center gap-0.5"
          >
            <span>BESTIARY</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4 flex-1 flex flex-col">
        {/* SECTION 1: FAMILIAR VIVARIUM */}
        <div className="p-3 bg-muted border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="retro text-[9px] sm:text-[10px] font-bold text-foreground">
              FAMILIAR
            </span>
            {equippedBeast && (
              <Badge variant="outline" className="text-[8px] py-0 px-1">
                LV.{equippedBeast.level || 1}
              </Badge>
            )}
          </div>

          {equippedBeast ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Pixel Specimen Frame */}
                <div className="w-12 h-12 bg-card border-2 border-foreground dark:border-ring flex items-center justify-center p-1 relative shrink-0 shadow-[1px_1px_0_0_#000]">
                  <img
                    src={
                      equippedBeast.spritePath
                        ? equippedBeast.spritePath.replace(".png", ".gif")
                        : "/beasts/beast_1.gif"
                    }
                    alt={equippedBeast.name}
                    className="w-full h-full object-contain pixelated animate-pixel-bob"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {equippedBeast.name}
                    </h3>
                    <Badge variant="secondary" className="text-[7px] py-0 px-1">
                      {equippedBeast.rarity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground font-mono font-bold">
                    <Sparkles className="w-3 h-3 text-foreground" />
                    <span>
                      +{equippedBeast.statBonusValue}%{" "}
                      {equippedBeast.statBonusType?.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upgrade Progress & Action */}
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
                  <div className="pt-2 border-t border-border space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono">
                      <span>VIVARIUM STEPS</span>
                      <span>
                        {effectiveSteps.toLocaleString()} / {bStepReq.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={effectiveSteps}
                      max={bStepReq}
                      variant="retro"
                      progressBg="bg-primary"
                      className="h-2.5 border border-black"
                    />
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {bGoldReq.toLocaleString()} Gold
                      </span>
                      <Button
                        size="sm"
                        variant={canUpgrade ? "default" : "secondary"}
                        onClick={handleUpgradeBeast}
                        disabled={!canUpgrade || isUpgrading}
                        className="text-[8px] sm:text-[9px] h-6 px-2.5"
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
            <div className="py-3 text-center space-y-2">
              <p className="text-[10px] text-muted-foreground">
                No Familiar bound to sanctum.
              </p>
              <Link href="/beasts">
                <Button size="sm" variant="outline" className="text-[9px] h-7 px-2.5">
                  <Plus className="w-3 h-3 mr-1" /> Bind Familiar
                </Button>
              </Link>
            </div>
          )}

          {/* Active Egg Incubation */}
          {activeEgg && (
            <div className="pt-2 border-t border-border space-y-1.5">
              <div className="flex items-center justify-between text-[9px] text-foreground font-mono font-bold">
                <span>INCUBATOR</span>
                <span>{activeEgg.name}</span>
              </div>
              <Progress
                value={activeEgg.currentSteps ?? activeEgg.current_steps ?? 0}
                max={activeEgg.targetSteps ?? activeEgg.target_steps ?? 5000}
                variant="retro"
                progressBg="bg-primary"
                className="h-2.5 border border-black"
              />
              {((activeEgg.currentSteps ?? activeEgg.current_steps ?? 0) >=
                (activeEgg.targetSteps ?? activeEgg.target_steps ?? 5000) ||
                activeEgg.status === "READY_TO_HATCH") && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleHatchEgg}
                  disabled={isHatching}
                  className="w-full mt-1.5 text-[8px] sm:text-[9px] h-7"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {isHatching ? "HATCHING..." : "HATCH SPECIMEN"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: PEDOMETER ACTIVITY */}
        <div className="p-3 bg-muted border border-border space-y-2.5 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-card border border-foreground dark:border-ring flex items-center justify-center text-foreground">
                <Footprints className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] text-muted-foreground block font-bold uppercase">
                  DAILY STEPS
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-foreground">
                  {dailySteps.toLocaleString()} / {dailyStepGoal.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
              <span className="px-1.5 py-0.5 bg-card border border-border flex items-center gap-1">
                <Milestone className="w-2.5 h-2.5 text-foreground" />
                {distanceKm}km
              </span>
              <span className="px-1.5 py-0.5 bg-card border border-border flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-foreground" />
                {caloriesBurned}kcal
              </span>
            </div>
          </div>

          <Progress
            value={dailyProgress}
            max={100}
            variant="retro"
            progressBg="bg-primary"
            className="h-3 border border-black"
          />

          <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono">
            <span>{dailyProgress}% OF GOAL</span>
            <span>{caloriesBurned} kcal burned</span>
          </div>

          {/* Quick Step Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAddSteps(500)}
              disabled={isSyncingSteps}
              className="text-[9px] h-7 px-1"
            >
              +500
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAddSteps(1000)}
              disabled={isSyncingSteps}
              className="text-[9px] h-7 px-1"
            >
              +1,000
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAddSteps(2500)}
              disabled={isSyncingSteps}
              className="text-[9px] h-7 px-1"
            >
              +2,500
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardActivityCard;
