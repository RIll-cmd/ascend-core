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
  FieldParchmentCard,
  FieldBrassButton,
  BarometerProgress,
} from "@/components/ui/field";

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
    <FieldParchmentCard
      title="BOTANICAL SANCTUM & PEDOMETER"
      subtitle="Familiar Vivarium • Mechanical Pocket Instrument"
      titleBadge={
        <Link
          href="/beasts"
          className="font-expedition text-xs text-[#c59b27] hover:text-[#f5dab0] flex items-center gap-1 font-bold transition-colors"
        >
          <span>Bestiary</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="space-y-4"
    >
      {/* 1. COMPANION VIVARIUM CLOCHE */}
      <div className="p-3 bg-[#130f0a] border border-[#c59b27]/40 rounded-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] relative">
        {equippedBeast ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Glass Cloche Specimen Frame */}
              <div className="w-14 h-14 bg-[#1b150f] border border-[#c59b27]/60 rounded-sm flex items-center justify-center p-1 relative flex-shrink-0 shadow-[inset_0_1px_4px_rgba(0,0,0,0.9)]">
                <img
                  src={
                    equippedBeast.spritePath
                      ? equippedBeast.spritePath.replace(".png", ".gif")
                      : "/beasts/beast_1.gif"
                  }
                  alt={equippedBeast.name}
                  className="w-full h-full object-contain animate-pixel-bob"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-[#2a1f16] border border-[#c59b27] text-[10px] font-expedition text-[#f5dab0] font-bold rounded-xs shadow-sm">
                  LV.{equippedBeast.level || 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-expedition text-xs sm:text-sm font-bold text-[#f5dab0] truncate">
                    {equippedBeast.name}
                  </h3>
                  <span className="px-1.5 py-0.5 bg-[#2a1f16] border border-[#c59b27]/50 text-[10px] font-expedition uppercase text-[#ffd875] rounded-xs">
                    {equippedBeast.rarity}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-field text-[#10b981] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
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
                <div className="pt-2.5 border-t border-[#c59b27]/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-expedition text-[#c59b27] font-bold">
                    <span>VIVARIUM ASCENSION STEPS</span>
                    <span className="font-mono text-[#f5dab0]">
                      {effectiveSteps.toLocaleString()} / {bStepReq.toLocaleString()}
                    </span>
                  </div>
                  <BarometerProgress
                    value={effectiveSteps}
                    max={bStepReq}
                    variant="amber"
                    height="sm"
                  />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="font-expedition text-xs text-[#d4a373] font-bold">
                      {bGoldReq.toLocaleString()} Sovereigns
                    </span>
                    <FieldBrassButton
                      size="sm"
                      variant={canUpgrade ? "brass" : "walnut"}
                      onClick={handleUpgradeBeast}
                      disabled={!canUpgrade || isUpgrading}
                    >
                      {isUpgrading
                        ? "ATTUNING..."
                        : bLevel >= 10
                        ? "MAX LEVEL"
                        : `ASCEND LV.${bLevel + 1}`}
                    </FieldBrassButton>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="py-3 text-center space-y-2.5">
            <p className="font-field text-xs text-[#c59b27]/80 italic">
              No Familiar currently bound to the sanctum cloche.
            </p>
            <Link href="/beasts">
              <FieldBrassButton size="sm" variant="walnut">
                <Plus className="w-3.5 h-3.5 mr-1" /> Bind Familiar
              </FieldBrassButton>
            </Link>
          </div>
        )}
      </div>

      {/* 2. MECHANICAL POCKET PEDOMETER */}
      <div className="p-3 bg-[#130f0a] border border-[#c59b27]/40 rounded-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1f1812] border border-[#c59b27]/60 rounded-xs flex items-center justify-center text-[#c59b27] shadow-sm">
              <Footprints className="w-4 h-4 text-[#c59b27]" />
            </div>
            <div>
              <span className="font-expedition text-xs text-[#c59b27] block uppercase tracking-wider">
                POCKET PEDOMETER
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#f5dab0]">
                {dailySteps.toLocaleString()} / {dailyStepGoal.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#c59b27] font-bold">
            <span className="px-2 py-0.5 bg-[#1b150f] border border-[#c59b27]/30 rounded-xs flex items-center gap-1">
              <Milestone className="w-3 h-3 text-[#c59b27]" />
              {distanceKm} km
            </span>
            <span className="px-2 py-0.5 bg-[#1b150f] border border-[#c59b27]/30 rounded-xs flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#f59e0b]" />
              {caloriesBurned} kcal
            </span>
          </div>
        </div>

        {/* Step Barometer Progress Tube */}
        <BarometerProgress
          value={dailyProgress}
          max={100}
          variant="emerald"
          height="md"
        />

        <div className="flex items-center justify-between font-expedition text-xs text-[#c59b27] font-bold">
          <span>{dailyProgress}% OF EXPEDITION TARGET</span>
          <span className="font-field italic font-normal text-[#f5dab0]/80">
            {caloriesBurned} kcal • {distanceKm} km
          </span>
        </div>

        {/* Knurled Brass Winding Crown Quick Adds */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <FieldBrassButton
            size="sm"
            variant="walnut"
            onClick={() => handleQuickAddSteps(500)}
            disabled={isSyncingSteps}
          >
            +500
          </FieldBrassButton>
          <FieldBrassButton
            size="sm"
            variant="walnut"
            onClick={() => handleQuickAddSteps(1000)}
            disabled={isSyncingSteps}
          >
            +1,000
          </FieldBrassButton>
          <FieldBrassButton
            size="sm"
            variant="walnut"
            onClick={() => handleQuickAddSteps(2500)}
            disabled={isSyncingSteps}
          >
            +2,500
          </FieldBrassButton>
        </div>
      </div>

      {/* 3. INCUBATION BELL JAR */}
      <div className="p-3 bg-[#130f0a] border border-[#c59b27]/40 rounded-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
        {activeEgg ? (
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-between font-expedition text-xs text-[#f5dab0] font-bold">
              <span>INCUBATION BELL JAR</span>
              <span className="text-[#ffd875]">{activeEgg.name}</span>
            </div>
            <BarometerProgress
              value={activeEgg.currentSteps ?? activeEgg.current_steps ?? 0}
              max={activeEgg.targetSteps ?? activeEgg.target_steps ?? 5000}
              variant="amber"
              height="sm"
            />
            {((activeEgg.currentSteps ?? activeEgg.current_steps ?? 0) >=
              (activeEgg.targetSteps ?? activeEgg.target_steps ?? 5000) ||
              activeEgg.status === "READY_TO_HATCH") && (
              <FieldBrassButton
                size="sm"
                variant="brass"
                onClick={handleHatchEgg}
                disabled={isHatching}
                className="w-full mt-2 flex items-center justify-center gap-1.5"
              >
                {isHatching ? (
                  "HATCHING SPECIMEN..."
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>HATCH SPECIMEN</span>
                  </>
                )}
              </FieldBrassButton>
            )}
          </div>
        ) : (
          <div className="py-2 text-center space-y-2">
            <p className="font-field text-xs text-[#c59b27]/80 italic">
              Incubation bell jar is currently empty.
            </p>
            <Link href="/beasts">
              <FieldBrassButton size="sm" variant="walnut">
                <Plus className="w-3.5 h-3.5 mr-1" /> Place Egg in Bell Jar
              </FieldBrassButton>
            </Link>
          </div>
        )}
      </div>
    </FieldParchmentCard>
  );
}

export default CompanionSanctumCard;
