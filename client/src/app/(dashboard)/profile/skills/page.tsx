"use client";

import { API_BASE_URL } from "@/constants";
import React, { useState, useEffect } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { toast } from "sonner";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import {
  PixelCrownIcon,
  PixelSparklesIcon,
  PixelBookIcon,
  PixelLockIcon,
} from "@/components/ui/pixel/PixelIcons";
import { Check, X, Shield, Swords, Sparkles, Zap, Flame, Crown } from "lucide-react";
import { AscendPendingSpinner } from "@/components/loading/AscendPendingSpinner";
import { AscendRouteSkeleton } from "@/components/loading/AscendRouteSkeleton";

export interface Specialization {
  id: string;
  name: string;
  baseClass: string;
  tier: number;
  requiredLevel: number;
  requiredStats?: string | null;
  description?: string | null;
  lore?: string | null;
  icon?: string | null;
  statBonus?: string | null;
  powerMultiplier?: number | null;
  passivePerk?: string | null;
  passiveEffect?: string | null;
}

export const DEFAULT_SPECIALIZATIONS: Specialization[] = [
  {
    id: "spec-adventurer",
    name: "Adventurer",
    baseClass: "All-Rounder",
    tier: 1,
    requiredLevel: 1,
    description: "Versatile guild baseline capable of learning skills across all elemental affinities.",
    lore: "The iconic starting class of Kazuma Satou. Adaptive, resourceful, and capable of unique synergies.",
    icon: "🗡️",
    passivePerk: "Elemental Polymath",
    passiveEffect: "Can equip and master skills from any elemental path without affinity penalties.",
  },
  {
    id: "spec-warrior",
    name: "Novice Warrior",
    baseClass: "Warrior",
    tier: 1,
    requiredLevel: 3,
    requiredStats: JSON.stringify({ strength: 5 }),
    description: "Hardened frontline brawler specializing in brute physical force and high-rep endurance.",
    lore: "Trained in heavy guild armaments and physical resistance.",
    icon: "⚔️",
    passivePerk: "Vanguard Resilience",
    passiveEffect: "+10% Strength & Endurance multiplier during heavy workout protocols.",
  },
  {
    id: "spec-mage",
    name: "Apprentice Mage",
    baseClass: "Mage",
    tier: 1,
    requiredLevel: 3,
    requiredStats: JSON.stringify({ knowledge: 5 }),
    description: "Arcane scholar channeling focused intellect and study hours into pure magical potency.",
    lore: "Dedicated to the deep codex of the Crimson Demons and ancient spellcraft.",
    icon: "🔮",
    passivePerk: "Mana Influx",
    passiveEffect: "+15% Knowledge multiplier and +10% EXP from study protocols.",
  },
  {
    id: "spec-rogue",
    name: "Shadow Rogue",
    baseClass: "Rogue",
    tier: 1,
    requiredLevel: 3,
    requiredStats: JSON.stringify({ discipline: 5 }),
    description: "Agile infiltrator maximizing unbroken habit streaks, discipline, and execution speed.",
    lore: "Master of covert movements and lightning swift completion of daily missions.",
    icon: "🗡️",
    passivePerk: "Swift Execution",
    passiveEffect: "+10% Discipline & Focus multiplier on unbroken habit streaks.",
  },
  {
    id: "spec-priest",
    name: "Acolyte Priest",
    baseClass: "Priest",
    tier: 1,
    requiredLevel: 3,
    requiredStats: JSON.stringify({ recovery: 5 }),
    description: "Divine conduit prioritizing deep cellular recovery, sleep optimization, and restorative health.",
    lore: "Blessed by the sacred waters of the Goddess Aqua.",
    icon: "✨",
    passivePerk: "Divine Purification",
    passiveEffect: "+20% Recovery multiplier and enhanced sleep score rewards.",
  },
  {
    id: "spec-paladin",
    name: "Paladin",
    baseClass: "Warrior",
    tier: 2,
    requiredLevel: 10,
    requiredStats: JSON.stringify({ endurance: 15, recovery: 10 }),
    description: "Holy defender maximizing Recovery, Endurance, and Boss Damage Reduction.",
    lore: "An armored guardian with unbreakable defensive conviction (like Darkness).",
    icon: "🛡️",
    passivePerk: "Iron Fortress",
    passiveEffect: "+25% Endurance & +20% Recovery multiplier; 15% Boss Damage Reduction.",
  },
  {
    id: "spec-berserker",
    name: "Berserker",
    baseClass: "Warrior",
    tier: 2,
    requiredLevel: 10,
    requiredStats: JSON.stringify({ strength: 15, focus: 10 }),
    description: "Fierce combatant maximizing Strength, Focus, and raw physical damage.",
    lore: "Unleashes unrestrained combat frenzy during intense workout PR sets.",
    icon: "🪓",
    passivePerk: "Blood Frenzy",
    passiveEffect: "+35% Strength multiplier and bonus combat rating on workout PRs.",
  },
  {
    id: "spec-arch-wizard",
    name: "Arch-Wizard",
    baseClass: "Mage",
    tier: 2,
    requiredLevel: 10,
    requiredStats: JSON.stringify({ knowledge: 15, focus: 10 }),
    description: "Devastating Crimson Demon spellcaster specializing in ultimate Explosion magic.",
    lore: "The supreme path of Megumin. Channels all mana into cataclysmic spell bursts.",
    icon: "💥",
    passivePerk: "Explosion Mastery",
    passiveEffect: "+40% Knowledge multiplier and massive boss burst damage.",
  },
  {
    id: "spec-stormweaver",
    name: "Stormweaver",
    baseClass: "Mage",
    tier: 2,
    requiredLevel: 10,
    requiredStats: JSON.stringify({ knowledge: 12, consistency: 10 }),
    description: "Elemental caster wielding Tempest velocity and Knowledge multipliers.",
    lore: "Channels high-velocity lightning and wind shears.",
    icon: "⚡",
    passivePerk: "Thunder Surge",
    passiveEffect: "+25% Knowledge & +20% Consistency multiplier.",
  },
  {
    id: "spec-shadow-monarch",
    name: "Shadow Monarch",
    baseClass: "Rogue",
    tier: 2,
    requiredLevel: 10,
    requiredStats: JSON.stringify({ discipline: 15, focus: 12 }),
    description: "Sovereign of shadows granting massive stat scaling and stealth crits.",
    lore: "Awakened ruler of shadows whose presence commands total discipline.",
    icon: "👑",
    passivePerk: "Sovereign Domain",
    passiveEffect: "+20% to ALL core attribute multipliers and stealth execution.",
  },
  {
    id: "spec-assassin",
    name: "Assassin",
    baseClass: "Rogue",
    tier: 2,
    requiredLevel: 10,
    requiredStats: JSON.stringify({ discipline: 12, consistency: 12 }),
    description: "Deadly striker boosting Gold rewards and execution speed.",
    lore: "Strikes with surgical precision across all daily objectives.",
    icon: "🗡️",
    passivePerk: "Lethal Precision",
    passiveEffect: "+30% Gold rewards and +25% Discipline multiplier.",
  },
];

export default function SkillTreePage() {
  const { character, updateIdentity, refetch } = useCharacterStore();
  const [specializations, setSpecializations] = useState<Specialization[]>(DEFAULT_SPECIALIZATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<number | "ALL">("ALL");

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/character/specializations/all`);
        if (res.ok) {
          const data = await res.json();
          if (data.specializations && data.specializations.length > 0) {
            setSpecializations(data.specializations);
          }
        }
      } catch (e) {
        console.warn("Using offline specializations fallback");
      }
    };
    fetchSpecializations();
  }, []);

  const activeSpecId = character?.specializationId || (character?.specialization?.id);
  const currentLevel = character?.level || 1;
  const playerStats = character?.stats || {
    strength: 1,
    knowledge: 1,
    discipline: 1,
    focus: 1,
    endurance: 1,
    recovery: 1,
    consistency: 1,
  };

  const handleSelectSpecialization = async (spec: Specialization) => {
    // Check Level Requirement
    if (currentLevel < spec.requiredLevel) {
      toast.error(`Requires Level ${spec.requiredLevel} to awaken ${spec.name}. (Current Level: ${currentLevel})`);
      return;
    }

    // Check Stat Requirements
    if (spec.requiredStats) {
      try {
        const reqStats = JSON.parse(spec.requiredStats);
        const unmet: string[] = [];
        for (const [statKey, minVal] of Object.entries(reqStats)) {
          const currVal = (playerStats as any)[statKey] || 1;
          if (currVal < (minVal as number)) {
            unmet.push(`${statKey.toUpperCase()}: ${currVal}/${minVal}`);
          }
        }
        if (unmet.length > 0) {
          toast.error(`Unmet Stat Requirements: ${unmet.join(", ")}`);
          return;
        }
      } catch (e) {}
    }

    setIsSelecting(spec.id);
    try {
      // Immediate local state update to ensure zero delay
      updateIdentity({
        specializationId: spec.id,
        specialization: spec,
        class: spec.name,
      } as any);

      playBuffSFX();
      toast.success(`Awakened Class: ${spec.name}! Passive Perk: ${spec.passivePerk}`);

      // Background sync to backend
      fetch(`${API_BASE_URL}/api/character/specializations/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character?.id || "char-1",
          specializationId: spec.id,
        }),
      }).catch(console.error);

    } catch (e) {
      toast.error("Error during class awakening.");
    } finally {
      setIsSelecting(null);
    }
  };

  const filteredSpecs = specializations.filter((s) => {
    if (tierFilter === "ALL") return true;
    return s.tier === tierFilter;
  });

  return (
    <div className="space-y-6 font-sans select-none">
      {/* HEADER BANNER */}
      <div className="konosuba-adventurer-card p-4 sm:p-5 shadow-[0_8px_16px_rgba(0,0,0,0.6)] space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold font-pixel text-[#241208] flex items-center gap-2">
                <PixelCrownIcon className="w-4 h-4 text-amber-800" />
                <span>ᛋᚲᛁᛚᛚ GUILD CLASS & SPELL CODEX</span>
              </h2>
              {character?.specialization || character?.specializationId ? (
                <PixelBadge variant="gold" className="flex items-center gap-1.5">
                  <PixelSparklesIcon className="w-3 h-3 text-amber-900" />
                  ACTIVE: {character?.specialization?.name || "ADVENTURER"}
                </PixelBadge>
              ) : (
                <PixelBadge variant="gold">ACTIVE: ADVENTURER</PixelBadge>
              )}
            </div>
            <p className="text-xs font-pixel text-[#633a20] max-w-2xl leading-relaxed">
              Awaken specialized guild combat masteries and ultimate spells to channel stat multipliers and passive perks into your adventurer card.
            </p>
          </div>

          {/* Tier Filter Tabs */}
          <div className="flex items-center gap-2 font-pixel text-xs">
            <button
              onClick={() => {
                playUIMenuSFX("confirm");
                setTierFilter("ALL");
              }}
              className={`px-3.5 py-1.5 font-bold uppercase transition-none border-2 cursor-pointer active:translate-y-0.5 ${
                tierFilter === "ALL"
                  ? "bg-[#381e10] text-[#fef08a] border-[#1a0c05] shadow-[inset_1px_1px_0_0_#633a20]"
                  : "bg-[#ebd9b5] text-[#381e10] border-[#522e18] hover:bg-[#dfba7c]"
              }`}
            >
              ALL ({specializations.length})
            </button>
            <button
              onClick={() => {
                playUIMenuSFX("confirm");
                setTierFilter(1);
              }}
              className={`px-3.5 py-1.5 font-bold uppercase transition-none border-2 cursor-pointer active:translate-y-0.5 ${
                tierFilter === 1
                  ? "bg-[#381e10] text-[#fef08a] border-[#1a0c05] shadow-[inset_1px_1px_0_0_#633a20]"
                  : "bg-[#ebd9b5] text-[#381e10] border-[#522e18] hover:bg-[#dfba7c]"
              }`}
            >
              TIER 1 (LV. 1+)
            </button>
            <button
              onClick={() => {
                playUIMenuSFX("confirm");
                setTierFilter(2);
              }}
              className={`px-3.5 py-1.5 font-bold uppercase transition-none border-2 cursor-pointer active:translate-y-0.5 ${
                tierFilter === 2
                  ? "bg-[#381e10] text-[#fef08a] border-[#1a0c05] shadow-[inset_1px_1px_0_0_#633a20]"
                  : "bg-[#ebd9b5] text-[#381e10] border-[#522e18] hover:bg-[#dfba7c]"
              }`}
            >
              TIER 2 (LV. 10+)
            </button>
          </div>
        </div>
      </div>

      {/* CLASS ROSTER GRID */}
      {isLoading ? (
        <AscendRouteSkeleton preset="profile-skills" label="Loading profile skills" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpecs.map((spec) => {
            const isActive = activeSpecId === spec.id || (!activeSpecId && spec.id === "spec-adventurer");
            const isLevelLocked = currentLevel < spec.requiredLevel;
            
            let isStatsLocked = false;
            let statRequirementsList: string[] = [];
            if (spec.requiredStats) {
              try {
                const reqStats = JSON.parse(spec.requiredStats);
                for (const [statKey, minVal] of Object.entries(reqStats)) {
                  const currVal = (playerStats as any)[statKey] || 1;
                  const meets = currVal >= (minVal as number);
                  if (!meets) isStatsLocked = true;
                  statRequirementsList.push(`${statKey.toUpperCase()}: ${currVal}/${minVal}`);
                }
              } catch (e) {}
            }

            const isLocked = isLevelLocked || isStatsLocked;

            return (
              <div
                key={spec.id}
                className={`p-4 transition-all duration-150 border-3 flex flex-col justify-between relative overflow-hidden font-pixel ${
                  isActive
                    ? "bg-[#caa97e] border-[#180b04] shadow-[0_12px_28px_rgba(56,30,16,0.6),inset_0_0_16px_rgba(89,59,34,0.4),inset_0_0_0_2px_#b45309]"
                    : isLocked
                    ? "bg-[#caa97e]/40 border-[#4a2813]/40 opacity-70 shadow-[inset_0_0_8px_rgba(89,59,34,0.2)]"
                    : "bg-[#caa97e] border-[#4a2813] shadow-[inset_0_0_12px_rgba(89,59,34,0.35),2px_2px_0_0_#221208] hover:border-[#b45309] hover:shadow-[0_10px_24px_rgba(180,83,9,0.35),inset_0_0_16px_rgba(89,59,34,0.4)] hover:-translate-y-1"
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#4a2813]/30 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-[#331c0e] text-[#fef08a] border border-[#180b04] flex items-center justify-center text-lg shadow-inner">
                        {spec.icon || "🛡️"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#221208]">{spec.name}</h3>
                        <span className="text-[10px] text-[#6d4c3d] font-bold block">
                          Tier {spec.tier} • {spec.baseClass}
                        </span>
                      </div>
                    </div>

                    {isActive ? (
                      <PixelBadge variant="gold">EQUIPPED</PixelBadge>
                    ) : isLocked ? (
                      <PixelBadge variant="dark" className="flex items-center gap-1">
                        <PixelLockIcon className="w-3 h-3" />
                        LOCKED
                      </PixelBadge>
                    ) : (
                      <PixelBadge variant="default">AVAILABLE</PixelBadge>
                    )}
                  </div>

                  {/* Description & Lore */}
                  <p className="text-xs text-[#221208] leading-relaxed">
                    {spec.description}
                  </p>

                  {spec.lore && (
                    <p className="text-[10px] text-[#593b22] italic bg-[#caa97e]/60 p-2 border border-[#4a2813]/30 shadow-[inset_0_0_4px_rgba(89,59,34,0.2)]">
                      &ldquo;{spec.lore}&rdquo;
                    </p>
                  )}

                  {/* Passive Perk Box */}
                  {spec.passivePerk && (
                    <div className="p-2.5 bg-[#331c0e] text-[#fef08a] border border-[#180b04] shadow-[inset_0_0_6px_rgba(0,0,0,0.7)] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-amber-400">✦ PASSIVE PERK: {spec.passivePerk}</span>
                      </div>
                      <p className="text-[10px] text-[#ebd9b5] leading-relaxed">
                        {spec.passiveEffect}
                      </p>
                    </div>
                  )}

                  {/* Prerequisites */}
                  <div className="space-y-1 text-[10px] pt-1">
                    <span className="font-bold text-[#6d4c3d] uppercase block">Awakening Prerequisites:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-1.5 py-0.5 border font-bold ${currentLevel >= spec.requiredLevel ? "bg-emerald-200/80 text-emerald-900 border-emerald-800" : "bg-rose-200/80 text-rose-900 border-rose-800"}`}>
                        Level {spec.requiredLevel}+ ({currentLevel})
                      </span>
                      {statRequirementsList.map((req, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-[#dfcaac] text-[#221208] border border-[#4a2813] font-bold">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-4 mt-3 border-t border-[#4a2813]/30">
                  {isActive ? (
                    <div className="w-full py-2 bg-[#381e10] text-[#fef08a] text-center text-xs font-bold flex items-center justify-center gap-2 border border-[#1a0c05]">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Active Class Specialization</span>
                    </div>
                  ) : (
                    <PixelButton
                      onClick={() => handleSelectSpecialization(spec)}
                      disabled={isLocked || isSelecting === spec.id}
                      variant={isLocked ? "dark" : "gold"}
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 text-xs"
                    >
                      {isSelecting === spec.id ? (
                        <>
                          <AscendPendingSpinner label="Unlocking skill" />
                          <span>Awakening Class...</span>
                        </>
                      ) : isLocked ? (
                        <>
                          <PixelLockIcon className="w-3.5 h-3.5" />
                          <span>Prerequisites Incomplete</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                          <span>Awaken Specialization</span>
                        </>
                      )}
                    </PixelButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
