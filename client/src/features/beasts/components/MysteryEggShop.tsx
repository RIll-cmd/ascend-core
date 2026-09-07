"use client";

import React, { useState } from "react";
import { Egg, EggShopItem } from "../types/beast";
import { useBeastStore, EGG_SHOP_ITEMS } from "../store/useBeastStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { SanctuaryEggCard } from "./SanctuaryEggCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ShoppingBag,
  Footprints,
  Check,
  Zap,
  ArrowRight,
  Package,
  Layers,
  HelpCircle,
  Leaf,
  Snowflake,
  Sun,
} from "lucide-react";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { EGG_LORE } from "@/features/lore/loreData";

interface MysteryEggShopProps {
  characterId: string;
  ownedEggs: Egg[];
  activeEggId?: string;
}

export const MysteryEggShop: React.FC<MysteryEggShopProps> = ({
  characterId,
  ownedEggs,
  activeEggId,
}) => {
  const { buyEgg, incubateEgg, isBuying } = useBeastStore();
  const { character } = useCharacterStore();
  const [activeTab, setActiveTab] = useState<"SHOP" | "STORAGE">("SHOP");

  const unhatchedEggs = ownedEggs.filter((e) => e.status !== "HATCHED");

  const handleBuy = async (item: EggShopItem, currency: "GOLD" | "GEMS") => {
    playUIMenuSFX("confirm");
    await buyEgg(characterId, item.id, currency);
  };

  const handleIncubate = async (eggId: string) => {
    playBuffSFX("speed");
    await incubateEgg(characterId, eggId);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0C1226]/95 via-[#080E20]/95 to-[#050914]/98 border border-cyan-500/30 p-6 shadow-xl relative overflow-hidden backdrop-blur-2xl space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              NURSERY & SEED STALL
            </span>
          </div>
          <h3 className="text-xl font-black font-heading text-white tracking-wide mt-0.5">
            Egg Market & Storage
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            aria-pressed={activeTab === "SHOP"}
            onClick={() => {
              playUIMenuSFX("confirm");
              setActiveTab("SHOP");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "SHOP"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sanctuary Shop
          </button>
          <button
            aria-pressed={activeTab === "STORAGE"}
            onClick={() => {
              playUIMenuSFX("confirm");
              setActiveTab("STORAGE");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "STORAGE"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Egg Storage ({unhatchedEggs.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SANCTUARY SHOP SHELF */}
      {/* ========================================================= */}
      {activeTab === "SHOP" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EGG_SHOP_ITEMS.map((item) => {
            const canAffordGold = (character?.gold || 0) >= item.goldPrice;
            const canAffordGems = item.gemPrice > 0 && (character?.gems || 0) >= item.gemPrice;

            return (
              <SanctuaryEggCard
                key={item.id}
                item={item}
                canAffordGold={canAffordGold}
                canAffordGems={canAffordGems}
                isBuying={isBuying}
                onBuyGold={(it) => handleBuy(it, "GOLD")}
                onBuyGems={(it) => handleBuy(it, "GEMS")}
              />
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: OWNED EGG STORAGE */}
      {/* ========================================================= */}
      {activeTab === "STORAGE" && (
        <div className="space-y-4">
          {unhatchedEggs.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <Package className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-mono">
                No eggs currently stored in your inventory vault. Purchase eggs in the Sanctuary Shop!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {unhatchedEggs.map((egg) => {
                const isActive = egg.id === activeEggId;
                const cSteps = egg.currentSteps ?? egg.currentEnergy ?? 0;
                const tSteps = egg.targetSteps ?? egg.targetEnergy ?? 5000;
                const eggLore = EGG_LORE[egg.name] || {
                  origin: "Harvested from gate rifts.",
                  storyLore: "A dormant mystery egg.",
                  incubationGuide: `Accumulate ${tSteps.toLocaleString()} steps to hatch.`
                };

                return (
                  <SystemTooltip
                    key={egg.id}
                    title={egg.name}
                    subtitle={`${egg.rarity} Mystery Egg • ${cSteps}/${tSteps} Steps`}
                    category="Incubating Relic"
                    rarity={egg.rarity as any}
                    description={`Current incubation energy: ${cSteps.toLocaleString()} / ${tSteps.toLocaleString()} steps.`}
                    lore={eggLore.storyLore}
                    mechanics={eggLore.incubationGuide}
                    howToImprove="Walk, jog, or perform cardio to generate kinetic incubation energy."
                    stats={[
                      { label: "Current Progress", value: `${Math.floor((cSteps / tSteps) * 100)}%`, color: "text-cyan-300" },
                      { label: "Steps Logged", value: `${cSteps} / ${tSteps}`, color: "text-amber-300" }
                    ]}
                    tags={[egg.rarity, "Incubation"]}
                    delayMs={1000}
                    className="w-full h-full"
                  >
                    <div
                      className={`w-full h-full rounded-2xl p-4 border flex flex-col justify-between space-y-3 ${
                        isActive
                          ? "bg-gradient-to-br from-[#0c2236] to-[#06121f] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                          : "bg-slate-900/80 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[9px] font-mono">
                          {egg.rarity}
                        </Badge>
                        {isActive && (
                          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            INCUBATING
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={egg.sprite}
                          alt={egg.name}
                          className="w-12 h-12 object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-sm text-white font-heading truncate">{egg.name}</h5>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {cSteps.toLocaleString()} / {tSteps.toLocaleString()} Steps
                          </span>
                        </div>
                      </div>

                      {!isActive && (
                        <Button
                          size="sm"
                          onClick={() => handleIncubate(egg.id)}
                          className="w-full h-8 font-mono text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl"
                        >
                          Slot into Incubator
                        </Button>
                      )}
                    </div>
                  </SystemTooltip>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
