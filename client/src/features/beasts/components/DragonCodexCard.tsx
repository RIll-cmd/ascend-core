"use client";

import React from "react";
import { BestiarySpeciesSummary } from "../types/beast";
import { CodexSprite } from "./CodexSprite";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, BookOpen } from "lucide-react";
import { playUIMenuSFX } from "@/utils/audio";
import { DRAGON_LORE } from "@/features/lore/loreData";
import meadow from "../styles/MeadowAviary.module.css";

interface DragonCodexCardProps {
  beast: BestiarySpeciesSummary;
  isUnlocked: boolean;
  isEquipping: boolean;
  onEquipClick: (beast: BestiarySpeciesSummary) => void;
  onOpenLoreModal: (beast: BestiarySpeciesSummary) => void;
}

export const getRarityBadgeStyle = (rarity: string) => {
  switch (rarity) {
    case "HOLOGRAPHIC":
      return "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/60 shadow-[0_0_12px_rgba(217,70,239,0.4)]";
    case "LEGENDARY":
      return "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.4)]";
    case "EPIC":
      return "bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]";
    case "RARE":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]";
    default:
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/60";
  }
};

export const getElementBadgeStyle = (element: string) => {
  switch (element) {
    case "FIRE":
      return "text-red-400 bg-red-950/60 border-red-500/40";
    case "FROST":
      return "text-cyan-300 bg-cyan-950/60 border-cyan-500/40";
    case "VOID":
      return "text-purple-400 bg-purple-950/60 border-purple-500/40";
    case "CYBER":
      return "text-teal-300 bg-teal-950/60 border-teal-500/40";
    case "NATURE":
      return "text-emerald-400 bg-emerald-950/60 border-emerald-500/40";
    case "HOLY":
      return "text-amber-300 bg-amber-950/60 border-amber-500/40";
    case "STORM":
      return "text-yellow-400 bg-yellow-950/60 border-yellow-500/40";
    default:
      return "text-slate-400 bg-slate-900 border-slate-700";
  }
};

export const getFormattedStatLabel = (beast: BestiarySpeciesSummary) => {
  const loreEntry = DRAGON_LORE[beast.speciesId];
  if (loreEntry) {
    return `+${loreEntry.statBonusPercent.toFixed(1)}% ${beast.statBonusType.replace("_PERCENT", "").replace("_BOOST", "").replace("_", " ")}`;
  }
  return `+${beast.statBonusValue.toFixed(1)}% ${beast.statBonusType.replace("_", " ")}`;
};

export const DragonCodexCard: React.FC<DragonCodexCardProps> = ({
  beast,
  isUnlocked,
  isEquipping,
  onEquipClick,
  onOpenLoreModal,
}) => {
  const loreEntry = DRAGON_LORE[beast.speciesId];
  const formattedStat = getFormattedStatLabel(beast);

  return (
    <SystemTooltip
      key={beast.speciesId}
      title={isUnlocked ? beast.name : `??? (Undiscovered ${beast.element} Dragon)`}
      subtitle={`${isUnlocked ? beast.species : "Uncharted Species"} • ${beast.element} Affinity`}
      category="Dragon Companion"
      rarity={beast.rarity === "HOLOGRAPHIC" ? "MYTHIC" : beast.rarity}
      description={isUnlocked ? (loreEntry?.storyLore || beast.description) : "This mythical companion has not yet been awakened in your bestiary."}
      lore={isUnlocked ? (loreEntry?.biologicalResonance || beast.lore) : `Incubate and hatch ${beast.element.toLowerCase()} eggs by accumulating daily walking steps to discover this dragon.`}
      mechanics={`Equipping grants a passive ${formattedStat} percentage multiplier to your actual character progression.`}
      howToImprove="Accumulate daily walking steps and workout sessions in the Incubator Chamber to hatch Mystery Eggs."
      stats={isUnlocked ? [{ label: "Passive Multiplier", value: formattedStat, color: "text-amber-300" }] : []}
      tags={[beast.element, beast.rarity, "Dragon Companion"]}
      delayMs={1000}
      className="w-full h-full"
    >
      <div
        className={`w-full h-full relative rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
          isUnlocked
            ? beast.isEquipped
              ? "bg-gradient-to-br from-[#0e2133] via-[#091524] to-[#040a12] border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.3)] scale-[1.02]"
              : "bg-gradient-to-br from-[#0B1020]/95 via-[#070C18]/95 to-[#040710]/98 border-cyan-500/25 hover:border-cyan-500/50 shadow-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            : "bg-[#050812]/90 border-slate-800/80 opacity-65"
        }`}
      >
        {/* Top Card Bar: Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 font-bold">
              #{String(beast.speciesId).padStart(3, "0")}
            </span>
            {isUnlocked && (
              <span className="px-1.5 py-0.2 rounded bg-cyan-950/90 border border-cyan-500/40 text-[9px] font-mono font-bold text-cyan-300">
                LV.{beast.level || 1}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Badge className={`${getRarityBadgeStyle(beast.rarity)} text-[9px] font-mono font-black uppercase px-2 py-0.5`}>
              {beast.rarity}
            </Badge>
            <span className={`px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold ${getElementBadgeStyle(beast.element)}`}>
              {beast.element}
            </span>
          </div>
        </div>

        {/* Dedicated Centered Sprite Stage */}
        <div className="h-32 flex flex-col items-center justify-center relative my-2 z-10 select-none">
          <CodexSprite
            speciesId={beast.speciesId}
            name={beast.name}
            element={beast.element}
            spritePath={beast.spritePath}
            isUnlocked={isUnlocked}
            sketchClassName={meadow.sketch}
          />

          {!isUnlocked && (
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mt-1">
              LOCKED
            </span>
          )}

          {/* Equipped Ribbon Badge */}
          {isUnlocked && beast.isEquipped && (
            <div className="absolute top-0 right-0 bg-emerald-500/20 border border-emerald-400/60 px-2 py-0.5 rounded-md text-[9px] font-mono font-black text-emerald-300 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ACTIVE
            </div>
          )}
        </div>

        {/* Name & Species */}
        <div className="space-y-1 my-1 relative z-10">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-black text-sm text-white tracking-wide truncate">
              {isUnlocked ? beast.name : "???"}
            </h4>
            {isUnlocked && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playUIMenuSFX("confirm");
                  onOpenLoreModal(beast);
                }}
                className="text-[#38513b] hover:text-[#173f2c] p-1 rounded-md hover:bg-[#d6e4bd] cursor-pointer transition-colors"
                aria-label={`Read the lore of ${beast.name}`}
                title="View Story Lore Chronicle"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[10.5px] font-mono text-slate-400 block truncate">
            {isUnlocked ? beast.species : `Undiscovered ${beast.element} Dragon`}
          </span>
        </div>

        {/* Passive Percentage Bonus Box */}
        <div className="mt-2 p-2 rounded-xl bg-black/40 border border-white/5 space-y-1 relative z-10">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              Passive Bonus
            </span>
            <span className="font-black text-emerald-400">
              {isUnlocked ? formattedStat : "???"}
            </span>
          </div>
        </div>

        {/* Action Button: Equip / Unequip / Locked */}
        <div className="mt-3 relative z-10">
          {isUnlocked ? (
            <Button
              type="button"
              disabled={isEquipping}
              onClick={() => onEquipClick(beast)}
              className={`w-full h-8 font-mono text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                beast.isEquipped
                  ? "bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/80 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                  : "bg-[#22543d] border border-[#78350f] text-[#fef3c7] hover:bg-[#173f2c]"
              }`}
            >
              {beast.isEquipped ? "UNEQUIP" : "EQUIP COMPANION"}
            </Button>
          ) : (
            <div className="w-full h-8 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-center text-[10px] font-mono text-slate-600 font-bold">
              INCUBATE TO UNLOCK
            </div>
          )}
        </div>
      </div>
    </SystemTooltip>
  );
};
