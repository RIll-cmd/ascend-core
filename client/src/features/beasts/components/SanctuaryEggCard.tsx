"use client";

import React from "react";
import { EggShopItem } from "../types/beast";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { EGG_LORE } from "@/features/lore/loreData";
import {
  Footprints,
  Coins,
  Gem,
  Flame,
  Snowflake,
  Leaf,
  Sun,
  Zap,
  Sparkles,
  CloudLightning,
} from "lucide-react";

export interface SanctuaryEggCardProps {
  item: EggShopItem;
  canAffordGold: boolean;
  canAffordGems: boolean;
  isBuying: boolean;
  onBuyGold: (item: EggShopItem) => void;
  onBuyGems: (item: EggShopItem) => void;
}

const ELEMENT_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  }
> = {
  FIRE: {
    label: "Fire Element",
    icon: Flame,
    badgeBg: "bg-red-950/70",
    badgeText: "text-red-300",
    badgeBorder: "border-red-600/40",
  },
  FROST: {
    label: "Frost Element",
    icon: Snowflake,
    badgeBg: "bg-cyan-950/70",
    badgeText: "text-cyan-300",
    badgeBorder: "border-cyan-500/40",
  },
  CRYO: {
    label: "Frost Element",
    icon: Snowflake,
    badgeBg: "bg-cyan-950/70",
    badgeText: "text-cyan-300",
    badgeBorder: "border-cyan-500/40",
  },
  NATURE: {
    label: "Nature Element",
    icon: Leaf,
    badgeBg: "bg-emerald-950/70",
    badgeText: "text-emerald-300",
    badgeBorder: "border-emerald-600/40",
  },
  SOLAR: {
    label: "Solar Element",
    icon: Sun,
    badgeBg: "bg-amber-950/70",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-500/40",
  },
  HOLY: {
    label: "Holy Element",
    icon: Sun,
    badgeBg: "bg-amber-950/70",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-500/40",
  },
  VOID: {
    label: "Void Element",
    icon: Sparkles,
    badgeBg: "bg-purple-950/70",
    badgeText: "text-purple-300",
    badgeBorder: "border-purple-600/40",
  },
  CYBER: {
    label: "Cyber Element",
    icon: Zap,
    badgeBg: "bg-sky-950/70",
    badgeText: "text-sky-300",
    badgeBorder: "border-sky-500/40",
  },
  STORM: {
    label: "Storm Element",
    icon: CloudLightning,
    badgeBg: "bg-indigo-950/70",
    badgeText: "text-indigo-300",
    badgeBorder: "border-indigo-500/40",
  },
};

const RARITY_CONFIG: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
  }
> = {
  COMMON: {
    bg: "bg-stone-800/80",
    text: "text-stone-300",
    border: "border-stone-600/50",
  },
  RARE: {
    bg: "bg-cyan-950/80",
    text: "text-cyan-300",
    border: "border-cyan-500/50",
  },
  EPIC: {
    bg: "bg-purple-950/80",
    text: "text-purple-300",
    border: "border-purple-500/50",
  },
  LEGENDARY: {
    bg: "bg-amber-950/80",
    text: "text-amber-300",
    border: "border-amber-500/60",
  },
  HOLOGRAPHIC: {
    bg: "bg-fuchsia-950/80",
    text: "text-fuchsia-300",
    border: "border-fuchsia-500/60",
  },
};

export function SanctuaryEggCard({
  item,
  canAffordGold,
  canAffordGems,
  isBuying,
  onBuyGold,
  onBuyGems,
}: SanctuaryEggCardProps) {
  const eggLore = EGG_LORE[item.name] || {
    origin: "Harvested from deep dimensional rifts.",
    storyLore: item.description,
    incubationGuide: `Accumulate ${(item.targetEnergy ?? item.targetSteps).toLocaleString()} steps to hatch this egg.`,
    potentialBeasts: ["Mystic Dragon", "Celestial Beast"],
  };

  const normElement = item.eggType?.toUpperCase() || "NATURE";
  const element = ELEMENT_CONFIG[normElement] || ELEMENT_CONFIG.NATURE;
  const ElementIcon = element.icon;

  const normRarity = item.rarity?.toUpperCase() || "COMMON";
  const rarity = RARITY_CONFIG[normRarity] || RARITY_CONFIG.COMMON;

  const targetSteps = item.targetEnergy ?? item.targetSteps ?? 5000;

  return (
    <SystemTooltip
      title={item.name}
      subtitle={`${element.label} • ${targetSteps.toLocaleString()} Steps Target`}
      category="Sanctuary Beast Egg"
      rarity={item.rarity as any}
      description={item.description}
      lore={eggLore.storyLore}
      mechanics={eggLore.incubationGuide}
      howToImprove={`Accumulate real-world walking steps (${targetSteps.toLocaleString()} steps) to feed natural bio-kinetic warmth into the incubator nest.`}
      stats={[
        {
          label: "Step Target",
          value: `${targetSteps.toLocaleString()} Steps`,
          color: "text-emerald-400",
        },
        {
          label: "Egg Element",
          value: normElement,
          color: "text-amber-300",
        },
      ]}
      tags={[normElement, normRarity, "Incubation"]}
      delayMs={600}
      className="w-full h-full"
    >
      <div className="w-full h-full rounded-2xl bg-[#261f18]/95 border-2 border-[#4a3525] p-4 flex flex-col justify-between space-y-4 hover:border-amber-600/60 transition-all duration-150 shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] group">
        <div className="space-y-3">
          {/* Centered Rarity & Element Header */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#3d2b1d]">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold tracking-wider uppercase ${element.badgeBg} ${element.badgeText} ${element.badgeBorder}`}
            >
              <ElementIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{element.label}</span>
            </div>

            <div
              className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-widest uppercase ${rarity.bg} ${rarity.text} ${rarity.border}`}
            >
              {normRarity}
            </div>
          </div>

          {/* Egg Sprite Stage */}
          <div className="py-4 flex items-center justify-center bg-black/40 rounded-xl border border-amber-900/30 group-hover:scale-105 transition-transform duration-200">
            <img
              src={item.sprite}
              alt={item.name}
              className="w-16 h-16 object-contain drop-shadow-[0_0_12px_rgba(74,222,128,0.35)]"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Title & Copy */}
          <div>
            <h4 className="text-sm font-bold font-pixel text-[#fce8bb] group-hover:text-amber-300 transition-colors">
              {item.name}
            </h4>
            <p className="text-[11px] text-amber-200/70 font-sans leading-relaxed mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Step Requirement Badge with Lucide Footprints */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-300 bg-emerald-950/50 px-3 py-2 rounded-lg border border-emerald-800/40 shadow-inner">
            <Footprints className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">
              Requires {targetSteps.toLocaleString()} Steps
            </span>
          </div>
        </div>

        {/* Currency Purchase Buttons */}
        <div className="space-y-2 pt-3 border-t border-[#3d2b1d]">
          {/* Buy with Gold Button */}
          <button
            type="button"
            onClick={() => onBuyGold(item)}
            disabled={isBuying || !canAffordGold}
            className={`w-full h-10 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-between transition-all border shadow-sm cursor-pointer ${
              canAffordGold
                ? "bg-[#382618] hover:bg-[#483220] active:translate-y-0.5 text-amber-200 border-[#6b4728] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                : "bg-[#1f1710] text-[#786450] border-[#382b20] cursor-not-allowed opacity-60"
            }`}
          >
            <span className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Buy with Gold</span>
            </span>
            <span className="font-black font-pixel text-xs text-amber-300">
              {item.goldPrice.toLocaleString()} G
            </span>
          </button>

          {/* Buy with Gems Button (if applicable) */}
          {item.gemPrice > 0 && (
            <button
              type="button"
              onClick={() => onBuyGems(item)}
              disabled={isBuying || !canAffordGems}
              className={`w-full h-10 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-between transition-all border shadow-sm cursor-pointer ${
                canAffordGems
                  ? "bg-[#2d1b33] hover:bg-[#3d2645] active:translate-y-0.5 text-purple-200 border-[#5e386e] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "bg-[#1f1710] text-[#786450] border-[#382b20] cursor-not-allowed opacity-60"
              }`}
            >
              <span className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Buy with Gems</span>
              </span>
              <span className="font-black font-pixel text-xs text-purple-300">
                {item.gemPrice} Gems
              </span>
            </button>
          )}
        </div>
      </div>
    </SystemTooltip>
  );
}

export default SanctuaryEggCard;
