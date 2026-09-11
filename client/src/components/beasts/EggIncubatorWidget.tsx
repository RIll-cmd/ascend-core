"use client";

import { useState } from "react";
import {
  Flame,
  Flower2,
  Footprints,
  Loader2,
  Sparkles,
  Sprout,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Egg } from "@/features/beasts/types/beast";
import { useBeastStore } from "@/features/beasts/store/useBeastStore";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { SvgOvergrownNest } from "@/components/ui/svg/SvgOvergrownNest";
import { NumberTicker } from "@/components/ui/number-ticker";
import { MagicCard } from "@/components/ui/magic-card";
import meadow from "@/features/beasts/styles/MeadowAviary.module.css";

interface Props {
  egg: Egg | null;
  characterId: string;
  onSelectEggClick?: () => void;
}

export const EggIncubatorWidget = ({ egg, characterId, onSelectEggClick }: Props) => {
  const { syncSteps, hatchEgg, isSyncingSteps, isHatching } = useBeastStore();
  const [customSteps, setCustomSteps] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const current = egg?.currentSteps ?? egg?.currentEnergy ?? 0;
  const target = Math.max(1, egg?.targetSteps ?? egg?.targetEnergy ?? 5000);
  const progress = Math.min(100, Math.max(0, Math.floor((current / target) * 100)));
  const ready = Boolean(egg && (egg.status === "READY_TO_HATCH" || current >= target));
  const remaining = Math.max(0, target - current);

  // Daily Walking Habit progression stats
  const dailyGoal = 10000;
  const dailyProgress = Math.min(100, Math.floor((current / dailyGoal) * 100));

  const addSteps = async (amount: number, source = "SIMULATED_WALK") => {
    playUIMenuSFX("confirm");
    await syncSteps(characterId, amount, source);
  };

  const addCustom = async () => {
    const amount = Number.parseInt(customSteps, 10);
    if (!amount || amount < 1) return;
    setIsSimulating(true);
    try {
      await addSteps(amount, "PEDOMETER_SYNC");
      setCustomSteps("");
    } finally {
      setIsSimulating(false);
    }
  };

  const hatch = async () => {
    if (!egg || !ready || isHatching) return;
    playBuffSFX("levelup");
    await hatchEgg(characterId, egg.id);
  };

  return (
    <MagicCard
      className="p-6 sm:p-7 rounded-2xl border-[3px] border-[#8d784b] shadow-[0_10px_24px_rgba(0,0,0,0.3)] text-[#273d2c] flex flex-col justify-between"
      innerClassName="bg-gradient-to-b from-[#fbf5d8] to-[#e8edcc]"
      backgroundColor="transparent"
      gradientColor="rgba(34, 197, 94, 0.12)"
      gradientFrom="#10b981"
      gradientTo="#84cc16"
      gradientSize={340}
    >
      {/* Header */}
      <div className={meadow.sectionHeading}>
        <h2 className="font-pixel text-base font-bold text-[#22543d]">The Overgrown Nest</h2>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-[#e3d3a0] text-[#4a3517] border border-[#b6a775]">
          {ready ? "WILDFLOWERS BLOOMING" : "SUN-WARMED ROOST"}
        </span>
      </div>

      {/* Handcrafted Graphic SVG Overgrown Nest Stage */}
      <div className="py-2 flex items-center justify-center relative">
        <SvgOvergrownNest
          egg={egg}
          ready={ready}
          isHatching={isHatching}
          onSelectEggClick={onSelectEggClick}
        />
      </div>

      <h3 className={meadow.eggName}>{egg?.name || "The nest is waiting"}</h3>

      {!egg ? (
        <div className="space-y-4">
          <p className={meadow.centerCopy}>
            Choose an egg from the nursery stall, then let your real-world walking habits gently wake it.
          </p>
          <button className={meadow.primary} onClick={onSelectEggClick}>
            Visit the egg stall
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Step Numbers & Ticker */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e3d3a0] text-[#314f31] font-mono text-xs font-bold border border-[#b6a775]">
              <Footprints className="w-4 h-4 text-emerald-700 shrink-0 [image-rendering:auto]" aria-hidden="true" />
              <span>Steps gathered</span>
            </span>
            <strong className="font-mono text-sm sm:text-base text-[#22543d] flex items-center gap-1">
              <NumberTicker value={current} className="text-[#22543d] font-mono" />
              <span>/</span>
              <span>{target.toLocaleString()}</span>
            </strong>
          </div>

          {/* Vine Progress Bar */}
          <div
            className={meadow.vineProgress}
            role="progressbar"
            aria-label="Egg incubation progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className={meadow.vineFill} style={{ transform: `scaleX(${progress / 100})` }} />
            {[0, 25, 50, 75, 100].map((mark) => (
              <span
                key={mark}
                className={`${progress >= mark ? meadow.sprouted : meadow.dormant} [image-rendering:auto] flex items-center justify-center`}
                style={{ left: `${mark}%` }}
              >
                {ready && mark > 50 ? <Flower2 className="w-3.5 h-3.5" /> : <Sprout className="w-3.5 h-3.5" />}
              </span>
            ))}
          </div>

          {/* Progress Caption with Ticker for remaining steps */}
          <p className="text-center text-xs text-[#52603e] m-0 font-medium">
            {ready ? (
              <span className="text-emerald-800 font-bold">The nest is flowering—your familiar is ready to meet you!</span>
            ) : (
              <span className="inline-flex items-center justify-center gap-1">
                <NumberTicker value={remaining} className="text-[#52603e] font-mono font-bold" />
                <span>walking steps until hatching.</span>
              </span>
            )}
          </p>

          {/* ========================================================================= */}
          {/* HABIT TRACKER ELEMENT: Daily Walking Habit & Pedometer Sync Ribbon */}
          {/* ========================================================================= */}
          <div className="p-3.5 rounded-xl bg-[#e3d7b3]/85 border-2 border-[#ad9460] text-xs text-[#354325] space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-pixel text-xs font-bold text-[#2b442b]">
                <Activity className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Daily Walking Habit</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Active Habit Streak Chip */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#d87c32]/20 border border-[#b85a1a]/40 text-[#853905] font-mono text-[10px] font-bold">
                  <Flame className="w-3 h-3 text-orange-600 fill-orange-500 shrink-0" />
                  <span>4-Day Streak</span>
                </span>
                {/* Pedometer Synced Chip */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-700/15 border border-emerald-700/30 text-emerald-800 font-mono text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>Pedometer Synced</span>
                </span>
              </div>
            </div>

            {/* Daily Habit Mini Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#4b5b3e]">
                <span>Daily Goal (10,000 steps)</span>
                <span className="font-bold text-[#204a2c]">
                  <NumberTicker value={current} className="font-mono text-[#204a2c]" /> / 10,000 ({dailyProgress}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#c9bda0] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#5a8c3d] to-[#2e6d38] transition-all duration-300 rounded-full"
                  style={{ width: `${dailyProgress}%` }}
                />
              </div>
            </div>

            {/* Kinetic Warmth Bonus Multiplier */}
            <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-[#c5b58d] text-[#556747]">
              <span>Habit Kinetic Warmth:</span>
              <strong className="text-emerald-800 font-bold">+15% Incubation Efficiency</strong>
            </div>
          </div>

          {/* Wooden Step Markers / Simulation controls */}
          <div className={meadow.logger}>
            <p>
              <span>Wooden step markers</span>
              <span className="text-[10px] text-[#637254]">Manual simulation controls</span>
            </p>
            <div className={meadow.quickSteps}>
              {[1000, 2500, 5000].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={isSyncingSteps || isSimulating}
                  onClick={() => addSteps(n)}
                  className="cursor-pointer"
                >
                  +{n.toLocaleString()}
                </button>
              ))}
            </div>
            <div className={meadow.customSteps}>
              <label>
                <span className="sr-only">Custom step amount</span>
                <input
                  inputMode="numeric"
                  value={customSteps}
                  onChange={(e) => setCustomSteps(e.target.value)}
                  placeholder="Custom steps"
                />
              </label>
              <button
                type="button"
                disabled={isSyncingSteps || isSimulating}
                onClick={addCustom}
                className="cursor-pointer"
              >
                {isSimulating ? <Loader2 className="animate-spin w-4 h-4" /> : "Add steps"}
              </button>
            </div>
          </div>

          {/* Hatch Button */}
          <button
            type="button"
            className={meadow.primary}
            disabled={!ready || isHatching}
            onClick={hatch}
          >
            {isHatching ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{ready ? "Welcome your familiar" : "Keep walking"}</span>
          </button>
        </div>
      )}
    </MagicCard>
  );
};

export default EggIncubatorWidget;
