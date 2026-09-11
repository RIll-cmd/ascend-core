"use client";

import React, { useState } from "react";
import { Egg, EggShopItem } from "../types/beast";
import { useBeastStore, EGG_SHOP_ITEMS } from "../store/useBeastStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { SanctuaryEggCard } from "./SanctuaryEggCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CoolMode } from "@/components/ui/cool-mode";
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
    <div className="rounded-3xl bg-gradient-to-br from-[#1b2b20]/95 via-[#132219]/95 to-[#0b1610]/98 border-2 border-[#5c4a2c] p-6 sm:p-7 shadow-[0_12px_28px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-2xl space-y-6 text-[#fef3c7]">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4d3c22] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              NURSERY & SEED STALL
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-pixel text-[#fce8bb] tracking-wide mt-1">
            Egg Market & Storage
          </h3>
        </div>

        {/* Tab Switcher with CoolMode */}
        <div className="flex items-center gap-2 bg-[#121c15] p-1.5 rounded-2xl border border-[#3d2e1b] self-start sm:self-auto shadow-inner">
          <CoolMode options={{ particle: "🍃" }}>
            <button
              type="button"
              aria-pressed={activeTab === "SHOP"}
              onClick={() => {
                playUIMenuSFX("confirm");
                setActiveTab("SHOP");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === "SHOP"
                  ? "bg-[#d8b36f] text-[#2c1d0b] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                  : "text-[#c2baa2] hover:text-white"
              }`}
            >
              Sanctuary Shop
            </button>
          </CoolMode>
          <CoolMode options={{ particle: "🪺" }}>
            <button
              type="button"
              aria-pressed={activeTab === "STORAGE"}
              onClick={() => {
                playUIMenuSFX("confirm");
                setActiveTab("STORAGE");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "STORAGE"
                  ? "bg-[#d8b36f] text-[#2c1d0b] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                  : "text-[#c2baa2] hover:text-white"
              }`}
            >
              Egg Storage ({unhatchedEggs.length})
            </button>
          </CoolMode>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SANCTUARY SHOP SHELF */}
      {/* ========================================================= */}
      {activeTab === "SHOP" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <div className="p-8 text-center bg-[#15231a] rounded-2xl border border-[#3e311d] space-y-3">
              <Package className="w-8 h-8 text-[#786b52] mx-auto" />
              <p className="text-xs text-[#b8a786] font-mono">
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
                    <MagicCard
                      className={`w-full h-full rounded-2xl p-4 border flex flex-col justify-between space-y-3 ${
                        isActive
                          ? "bg-gradient-to-br from-[#193325] to-[#0f2117] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                          : "bg-[#211b15] border-[#423223]"
                      }`}
                      gradientColor={isActive ? "rgba(16, 185, 129, 0.2)" : "rgba(217, 179, 111, 0.15)"}
                      gradientFrom={isActive ? "#10b981" : "#d8b36f"}
                      gradientTo={isActive ? "#84cc16" : "#86612c"}
                      gradientSize={220}
                    >
                      <div className="flex items-center justify-between">
                        <Badge className="bg-[#d8b36f]/20 text-[#edd095] border-[#86612c]/60 text-[9px] font-mono">
                          {egg.rarity}
                        </Badge>
                        {isActive && (
                          <span className="text-[9px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
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
                          <h5 className="font-bold text-sm text-[#fcf0d4] font-pixel truncate">{egg.name}</h5>
                          <span className="text-[10px] text-[#b4a485] font-mono block flex items-center gap-1">
                            <NumberTicker value={cSteps} className="text-[#b4a485] font-mono" />
                            <span>/</span>
                            <span>{tSteps.toLocaleString()} Steps</span>
                          </span>
                        </div>
                      </div>

                      {!isActive && (
                        <CoolMode options={{ particle: "🪺" }}>
                          <Button
                            size="sm"
                            onClick={() => handleIncubate(egg.id)}
                            className="w-full h-8 font-mono text-xs font-bold bg-[#d8b36f] hover:bg-[#edd093] text-[#332210] rounded-xl cursor-pointer"
                          >
                            Slot into Incubator
                          </Button>
                        </CoolMode>
                      )}
                    </MagicCard>
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

export default MysteryEggShop;
