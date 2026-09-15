"use client";

import React, { useState } from "react";
import { Egg } from "../types/beast";
import { useBeastStore } from "../store/useBeastStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Sparkles,
  Footprints,
  Flame,
  CheckCircle2,
  Lock,
  Plus,
  Loader2,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { playBattleSFX, playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { FloatingRuneField } from "@/components/shared/FloatingRuneField";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { EGG_LORE } from "@/features/lore/loreData";

interface EggIncubatorCardProps {
  egg: Egg | null;
  characterId: string;
  onSelectEggClick?: () => void;
}

export const EggIncubatorCard: React.FC<EggIncubatorCardProps> = ({
  egg,
  characterId,
  onSelectEggClick,
}) => {
  const { feedEnergy, hatchEgg, isFeeding, isHatching } = useBeastStore();
  const [customSteps, setCustomSteps] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  if (!egg) {
    return (
      <div className="relative rounded-[26px] bg-gradient-to-br from-[#0D152F]/95 via-[#080E22]/95 to-[#040815]/98 border border-cyan-500/30 p-8 shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col items-center justify-center text-center space-y-4 min-h-[360px]">
        <FloatingRuneField density="low" className="opacity-30" />
        <div className="w-20 h-20 rounded-full bg-cyan-950/60 border-2 border-dashed border-cyan-500/40 flex items-center justify-center text-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-pulse">
          <HelpCircle className="w-10 h-10" />
        </div>
        <div className="space-y-1 z-10">
          <h3 className="text-lg font-black font-heading text-white">
            Incubator Chamber Idle
          </h3>
          <p className="text-xs text-slate-400 font-mono max-w-sm">
            Select a Mystery Egg from your collection or purchase one in the Sanctuary Shop to start incubating with daily steps!
          </p>
        </div>
        {onSelectEggClick && (
          <Button
            onClick={onSelectEggClick}
            className="z-10 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider px-6 rounded-xl shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Select Mystery Egg
          </Button>
        )}
      </div>
    );
  }

  const currentSteps = egg.currentSteps ?? egg.currentEnergy ?? 0;
  const targetSteps = egg.targetSteps ?? egg.targetEnergy ?? 5000;
  const progress = Math.min(100, Math.floor((currentSteps / targetSteps) * 100));
  const isReady = egg.status === "READY_TO_HATCH" || progress >= 100;

  // Determine crack stage: 0 = none, 1 = faint, 2 = moderate, 3 = heavy, 4 = radiant ready
  const crackStage = isReady ? 4 : progress >= 75 ? 3 : progress >= 40 ? 2 : progress >= 15 ? 1 : 0;

  const handleQuickFeed = async (amount: number, label: string) => {
    playUIMenuSFX("confirm");
    await feedEnergy(characterId, amount, label);
  };

  const handleCustomSync = async () => {
    const val = parseInt(customSteps, 10);
    if (!val || val <= 0) return;
    setIsSyncing(true);
    await feedEnergy(characterId, val, "MANUAL_STEPS_LOG");
    setCustomSteps("");
    setIsSyncing(false);
  };

  const handleHatchClick = async () => {
    if (!isReady || isHatching) return;
    playBuffSFX("levelup");
    await hatchEgg(characterId, egg.id);
  };

  return (
    <div className="relative rounded-[28px] bg-gradient-to-br from-[#0D152F]/95 via-[#080E22]/95 to-[#040815]/98 border-2 border-cyan-500/40 p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden backdrop-blur-2xl flex flex-col justify-between space-y-6">
      {/* Background Runes */}
      <FloatingRuneField density="medium" />

      {/* Cyber Grid Lines & Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none" />
      <div className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isReady ? "bg-amber-500/25 animate-pulse" : "bg-cyan-500/15"}`} />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              BIO-KINETIC INCUBATOR
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[9.5px] font-mono font-bold">
              {egg.rarity} TIER
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide mt-0.5">
            {egg.name}
          </h2>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
            Incubation Status
          </span>
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isReady ? "text-emerald-400 animate-pulse" : "text-cyan-300"}`}>
            {isReady ? "✦ READY TO HATCH ✦" : `Crack Phase ${crackStage} / 4`}
          </span>
        </div>
      </div>

      {/* Center Egg Stage with Dynamic Cracking */}
      <div className="relative z-10 flex flex-col items-center justify-center py-4 my-2">
        {/* Glow Pedestal */}
        {(() => {
          const eggLore = EGG_LORE[egg.name] || {
            origin: "Harvested from gate rifts.",
            storyLore: "A dormant mystery egg undergoing biological bio-kinetic synthesis.",
            incubationGuide: `Accumulate ${targetSteps.toLocaleString()} steps to crack and hatch.`
          };

          return (
            <SystemTooltip
              title={egg.name}
              subtitle={`${egg.rarity} Mystery Egg • Phase ${crackStage}/4`}
              category="Incubation Chamber"
              rarity={egg.rarity as any}
              description={`Incubation Energy: ${currentSteps.toLocaleString()} / ${targetSteps.toLocaleString()} steps (${progress}%).`}
              lore={eggLore.storyLore}
              mechanics={eggLore.incubationGuide}
              howToImprove="Walk, jog, or perform cardio to generate kinetic energy and crack the outer shell."
              stats={[
                { label: "Energy Progress", value: `${progress}% (${currentSteps}/${targetSteps})`, color: "text-cyan-300" },
                { label: "Crack Stage", value: `Phase ${crackStage} / 4`, color: "text-amber-300" }
              ]}
              tags={[egg.rarity, "Incubating"]}
              delayMs={1000}
            >
              <div className="relative flex items-center justify-center cursor-pointer group">
                <div className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center transition-all duration-700 ${
                  isReady
                    ? "bg-gradient-to-t from-amber-500/30 via-cyan-500/20 to-transparent shadow-[0_0_60px_rgba(245,158,11,0.5)] animate-pulse"
                    : "bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.2)] group-hover:bg-cyan-500/20"
                }`}>
                  {/* Egg Sprite with Cracking Progression */}
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
              <img
                src={egg.sprite || "/eggs/egg_1.png"}
                alt={egg.name}
                className={`w-full h-full object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-transform duration-500 select-none ${
                  isReady
                    ? "animate-pulse scale-110"
                    : crackStage >= 2
                    ? "hover:scale-105"
                    : ""
                }`}
                style={{ imageRendering: "pixelated" }}
              />

              {/* Progressive Visual Cracks Overlay */}
              {crackStage >= 1 && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Stage 1: Fine fracture */}
                  <path
                    d="M 50 25 L 47 40 L 53 48 L 49 60"
                    stroke={isReady ? "#F59E0B" : "#38BDF8"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_6px_rgba(56,189,248,0.9)]"
                  />
                  {/* Stage 2: Lateral branch */}
                  {crackStage >= 2 && (
                    <path
                      d="M 47 40 L 35 45 L 30 55"
                      stroke={isReady ? "#F59E0B" : "#38BDF8"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_6px_rgba(56,189,248,0.9)]"
                    />
                  )}
                  {/* Stage 3: Deep rupture */}
                  {crackStage >= 3 && (
                    <path
                      d="M 53 48 L 68 52 L 72 65"
                      stroke={isReady ? "#FDE047" : "#A855F7"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_8px_rgba(234,179,8,0.9)]"
                    />
                  )}
                  {/* Stage 4: Radiant core bursting */}
                  {crackStage >= 4 && (
                    <>
                      <circle cx="50" cy="50" r="10" fill="#FDE047" fillOpacity="0.4" className="animate-ping" />
                      <path
                        d="M 49 60 L 52 75 L 48 85"
                        stroke="#F59E0B"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_10px_rgba(245,158,11,1)]"
                      />
                    </>
                  )}
                </svg>
              )}
            </div>
          </div>
        </div>
      </SystemTooltip>
    );
  })()}

        {/* Energy Progress Meter */}
        <div className="w-full max-w-md mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-1.5 font-bold">
              <Footprints className="w-4 h-4 text-cyan-400" />
              Incubation Energy
            </span>
            <span className="text-cyan-300 font-black">
              {currentSteps.toLocaleString()} / {targetSteps.toLocaleString()} Steps
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-950/80 rounded-full border border-cyan-500/30 overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] ${
                isReady
                  ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 animate-pulse"
                  : "bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>{progress}% Energy Transferred</span>
            <span>{isReady ? "Ready to Hatch!" : `${Math.max(0, targetSteps - currentSteps).toLocaleString()} steps remaining`}</span>
          </div>
        </div>
      </div>

      {/* Action Footer: Hatch Button or Energy Feeder Controls */}
      <div className="relative z-10 pt-4 border-t border-cyan-500/20 space-y-3">
        {isReady ? (
          <Button
            onClick={handleHatchClick}
            disabled={isHatching}
            className="w-full h-14 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black font-heading text-base tracking-wider rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.6)] cursor-pointer transition-all duration-300 active:scale-95 animate-pulse"
          >
            {isHatching ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
                HATCH MYSTERY BEAST NOW
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Quick Feed Chips */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                Feed Physical Steps / Activity:
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickFeed(1000, "1,000 Steps Walk")}
                  disabled={isFeeding}
                  className="h-7 text-[10px] font-mono font-bold bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 rounded-lg cursor-pointer"
                >
                  +1K Steps
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickFeed(3000, "3,000 Steps Run")}
                  disabled={isFeeding}
                  className="h-7 text-[10px] font-mono font-bold bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 rounded-lg cursor-pointer"
                >
                  +3K Steps
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickFeed(5000, "5,000 Steps Workout")}
                  disabled={isFeeding}
                  className="h-7 text-[10px] font-mono font-bold bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/60 rounded-lg cursor-pointer"
                >
                  +5K Habit
                </Button>
              </div>
            </div>

            {/* Custom Step Sync Input */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Enter steps or activity points..."
                value={customSteps}
                onChange={(e) => setCustomSteps(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomSync()}
                disabled={isFeeding || isSyncing}
                className="bg-[#050B1A] border-slate-800 text-xs font-mono text-white placeholder:text-slate-500 h-10 rounded-xl"
              />
              <Button
                onClick={handleCustomSync}
                disabled={isFeeding || isSyncing || !customSteps}
                className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-black font-mono text-xs px-5 h-10 rounded-xl shrink-0 cursor-pointer shadow-md"
              >
                {isSyncing || isFeeding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    Inject
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
