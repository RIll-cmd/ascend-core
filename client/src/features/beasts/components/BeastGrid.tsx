"use client";

import React, { useState, useMemo } from "react";
import { BestiarySpeciesSummary, BeastRarity, BeastElement } from "../types/beast";
import { useBeastStore } from "../store/useBeastStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Lock,
  CheckCircle2,
  Shield,
  Flame,
  Info,
  Layers,
  Feather,
  Search,
  Filter,
  X,
  BookOpen,
  HeartPulse,
  Award,
  Footprints,
  Coins,
  ArrowUpCircle,
} from "lucide-react";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import meadow from "../styles/MeadowAviary.module.css";
import { SystemTooltip, SystemTooltipStat } from "@/components/ui/SystemTooltip";
import { DRAGON_LORE } from "@/features/lore/loreData";
import {
  DragonCodexCard,
  getRarityBadgeStyle,
  getElementBadgeStyle,
  getFormattedStatLabel,
} from "./DragonCodexCard";
import { CodexSprite } from "./CodexSprite";

interface BeastGridProps {
  bestiary: BestiarySpeciesSummary[];
  characterId: string;
  totalDiscovered: number;
  totalSpecies: number;
}

export const BeastGrid: React.FC<BeastGridProps> = ({
  bestiary,
  characterId,
  totalDiscovered,
  totalSpecies,
}) => {
  const { equipBeast, upgradeBeast, isEquipping, isUpgrading } = useBeastStore();
  const { character } = useCharacterStore();
  // Open on the complete field journal; owners can still narrow to bonded discoveries.
  const [ownershipFilter, setOwnershipFilter] = useState<"OWNED" | "ALL">("ALL");
  const [selectedRarity, setSelectedRarity] = useState<string>("ALL");
  const [selectedElement, setSelectedElement] = useState<string>("ALL");
  const [activeLoreModal, setActiveLoreModal] = useState<BestiarySpeciesSummary | null>(null);

  const rarities: BeastRarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY", "HOLOGRAPHIC"];
  const elements: BeastElement[] = ["FIRE", "FROST", "VOID", "CYBER", "NATURE", "HOLY", "STORM"];

  const filteredBeasts = useMemo(() => {
    return bestiary.filter((b) => {
      // Default: only show owned / unlocked dragons
      if (ownershipFilter === "OWNED" && !b.isUnlocked) return false;
      if (selectedRarity !== "ALL" && b.rarity !== selectedRarity) return false;
      if (selectedElement !== "ALL" && b.element !== selectedElement) return false;
      return true;
    });
  }, [bestiary, ownershipFilter, selectedRarity, selectedElement]);

  const handleEquipClick = async (b: BestiarySpeciesSummary) => {
    if (!b.isUnlocked || !b.beastInstanceId) return;
    if (b.isEquipped) {
      await equipBeast(characterId, null); // Unequip
    } else {
      await equipBeast(characterId, b.beastInstanceId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls & Discovery Meter */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0C1226]/95 via-[#080E20]/95 to-[#050914]/98 border border-cyan-500/30 p-6 shadow-xl relative overflow-hidden backdrop-blur-2xl">

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5" />
                NATURALIST&apos;S FIELD JOURNAL
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide">
              Dragon Companions & Mythic Lore
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Hatch eggs with daily steps to awaken dragons and activate percentage-based stat multipliers.
            </p>
          </div>

          {/* Discovery Progress Meter */}
          <div className="w-full md:w-64 space-y-2 bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold">Bestiary Codex</span>
              <span className="text-cyan-300 font-black">
                {totalDiscovered} / {totalSpecies} Awakened
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                style={{ width: `${Math.min(100, Math.floor((totalDiscovered / totalSpecies) * 100))}%` }}
              />
            </div>
            <div className="text-[9.5px] font-mono text-slate-500 text-right">
              {Math.floor((totalDiscovered / totalSpecies) * 100)}% Codex Completion
            </div>
          </div>
        </div>

        {/* Primary Filter Row: Owned vs All Switcher */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-cyan-500/10 mt-5">
          <div className="flex items-center gap-2 p-1 bg-black/60 border border-cyan-500/30 rounded-2xl max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                playUIMenuSFX("confirm");
                setOwnershipFilter("OWNED");
              }}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                ownershipFilter === "OWNED"
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              OWNED DRAGONS ({totalDiscovered})
            </button>

            <button
              type="button"
              onClick={() => {
                playUIMenuSFX("confirm");
                setOwnershipFilter("ALL");
              }}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                ownershipFilter === "ALL"
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              ALL CODEX ({totalSpecies})
            </button>
          </div>

          {/* Rarity & Element Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                playUIMenuSFX("confirm");
                setSelectedRarity("ALL");
                setSelectedElement("ALL");
              }}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                selectedRarity === "ALL" && selectedElement === "ALL"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              RESET FILTERS
            </button>

            {rarities.map((r) => (
              <button
                key={r}
                onClick={() => {
                  playUIMenuSFX("confirm");
                  setSelectedRarity(selectedRarity === r ? "ALL" : r);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  selectedRarity === r
                    ? "bg-[#22543d] text-[#fef3c7]"
                    : "bg-[#e0c68c] text-[#493519] hover:bg-[#f0d99e] border border-[#94773e]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State for Owned Filter */}
      {filteredBeasts.length === 0 && (
        <div className="rounded-3xl bg-gradient-to-br from-[#0B1020]/95 via-[#070C18]/95 to-[#040710]/98 border border-cyan-500/30 p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-black font-heading text-white">
              {ownershipFilter === "OWNED"
                ? "No Awakened Dragons In Sanctuary Yet"
                : "No Dragons Match Filter Criteria"}
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {ownershipFilter === "OWNED"
                ? "Accumulate real-world walking steps in the Incubator Chamber to hatch Mystery Eggs, or toggle to 'All Codex' to browse the complete bestiary."
                : "Try resetting your rarity or elemental filters to view matching dragons."}
            </p>
          </div>
          {ownershipFilter === "OWNED" && (
            <div className="pt-2">
              <Button
                onClick={() => {
                  playUIMenuSFX("confirm");
                  setOwnershipFilter("ALL");
                }}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-mono font-black text-xs uppercase tracking-wider h-10 px-6 rounded-xl cursor-pointer hover:from-cyan-400 hover:to-indigo-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <Layers className="w-4 h-4 mr-1.5" />
                BROWSE ALL 20 CODEX DRAGONS
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 20-Beast Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBeasts.map((beast) => (
          <DragonCodexCard
            key={beast.speciesId}
            beast={beast}
            isUnlocked={beast.isUnlocked}
            isEquipping={isEquipping}
            onEquipClick={handleEquipClick}
            onOpenLoreModal={setActiveLoreModal}
          />
        ))}
      </div>

      {/* Story Lore & Detail Modal */}
      {activeLoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#090E1D] border-2 border-cyan-500/40 p-6 shadow-2xl space-y-5 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                DRAGON CODEX CHRONICLE
              </span>
              <button
                onClick={() => setActiveLoreModal(null)}
                aria-label="Close familiar lore"
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-black/50 border border-cyan-500/30 p-2 flex items-center justify-center shrink-0">
                <CodexSprite
                  speciesId={activeLoreModal.speciesId}
                  name={activeLoreModal.name}
                  element={activeLoreModal.element}
                  spritePath={activeLoreModal.spritePath}
                  isUnlocked={true}
                  className="w-16 h-16"
                  showDropShadow={false}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Badge className={`${getRarityBadgeStyle(activeLoreModal.rarity)} text-[9px] font-mono font-black uppercase px-2 py-0.5`}>
                    {activeLoreModal.rarity}
                  </Badge>
                  <span className={`px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold ${getElementBadgeStyle(activeLoreModal.element)}`}>
                    {activeLoreModal.element}
                  </span>
                </div>
                <h3 className="text-xl font-black font-heading text-white mt-1">
                  {activeLoreModal.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono block">
                  {activeLoreModal.species}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                  Mythic Story Lore
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                  {DRAGON_LORE[activeLoreModal.speciesId]?.storyLore || activeLoreModal.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block mb-1">
                  Biological & Kinetic Resonance
                </span>
                <p className="text-xs text-slate-300 font-sans italic bg-black/40 p-3 rounded-xl border border-white/5 leading-relaxed">
                  &ldquo;{DRAGON_LORE[activeLoreModal.speciesId]?.biologicalResonance || activeLoreModal.lore}&rdquo;
                </p>
              </div>

              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Passive Progression Multiplier
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {activeLoreModal.statBonusType.replace("_PERCENT", "").replace("_BOOST", "").replace("_", " ")}
                  </span>
                </div>
                <span className="text-base font-mono font-black text-emerald-400">
                  {getFormattedStatLabel(activeLoreModal)}
                </span>
              </div>

              {/* Level & Ascension Upgrade Module */}
              {activeLoreModal.isUnlocked && activeLoreModal.beastInstanceId && (
                <div className="p-3.5 bg-slate-950/70 border border-cyan-500/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Ascension Level {activeLoreModal.level || 1} / 10
                    </span>
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {(activeLoreModal.goldUpgradeReq || (activeLoreModal.level || 1) * 1000).toLocaleString()} Gold
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-cyan-400" />
                      Steps Required:
                    </span>
                    <span className="text-cyan-300 font-bold">
                      {(activeLoreModal.accumulatedSteps || 0).toLocaleString()} / {(activeLoreModal.stepUpgradeReq || (activeLoreModal.level || 1) * 5000).toLocaleString()} Steps
                    </span>
                  </div>

                  <Button
                    type="button"
                    disabled={isUpgrading || (activeLoreModal.level || 1) >= 10 || (character?.gold || 0) < (activeLoreModal.goldUpgradeReq || (activeLoreModal.level || 1) * 1000)}
                    onClick={async () => {
                      if (activeLoreModal.beastInstanceId) {
                        await upgradeBeast(characterId, activeLoreModal.beastInstanceId);
                        setActiveLoreModal(null);
                      }
                    }}
                    className="w-full h-8 bg-gradient-to-r from-amber-500 via-cyan-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-mono text-xs font-black uppercase rounded-lg disabled:opacity-40 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    {isUpgrading ? "Ascending..." : (activeLoreModal.level || 1) >= 10 ? "Max Level Reached" : `⚡ Ascend to Level ${(activeLoreModal.level || 1) + 1}`}
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                onClick={() => {
                  handleEquipClick(activeLoreModal);
                  setActiveLoreModal(null);
                }}
                className={`w-full h-11 font-mono text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer ${
                  activeLoreModal.isEquipped
                    ? "bg-red-950/80 border border-red-500/40 text-red-300 hover:bg-red-900"
                    : "bg-gradient-to-r from-cyan-600 to-indigo-600 text-slate-950 hover:from-cyan-500 hover:to-indigo-500"
                }`}
              >
                {activeLoreModal.isEquipped ? "UNEQUIP COMPANION" : "EQUIP AS ACTIVE COMPANION"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
