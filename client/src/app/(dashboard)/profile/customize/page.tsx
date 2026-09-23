"use client";

import { API_BASE_URL } from "@/constants";
import React, { useState, useEffect } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { toast } from "sonner";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import {
  PixelPaletteIcon,
  PixelCrownIcon,
  PixelAwardIcon,
  PixelLockIcon,
  PixelSparklesIcon,
} from "@/components/ui/pixel/PixelIcons";
import { Check, Sparkles, Trophy, Shield, Flame, Zap, Crown } from "lucide-react";
import { AscendPendingSpinner } from "@/components/loading/AscendPendingSpinner";
import { AscendRouteSkeleton } from "@/components/loading/AscendRouteSkeleton";

export interface TitleItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "Milestone" | "Tower" | "Habits" | "Special" | string;
  statBonus: Record<string, number>;
  powerMultiplier: number;
  requirementType: string;
  requirementValue: number;
  isUnlocked: boolean;
  isEquipped: boolean;
}

export const DEFAULT_TITLES: TitleItem[] = [
  {
    id: "title-hydration-monarch",
    name: "Hydration Monarch",
    description: "Master of physical purity and daily hydration consistency.",
    icon: "💧",
    category: "Habits",
    statBonus: { consistency: 2, recovery: 1 },
    powerMultiplier: 1.02,
    requirementType: "HABIT_STREAK",
    requirementValue: 7,
    isUnlocked: true,
    isEquipped: true,
  },
  {
    id: "title-tower-conqueror",
    name: "Tower Conqueror",
    description: "Fierce climber who conquered the upper spires of the Spire Tower.",
    icon: "⚔️",
    category: "Tower",
    statBonus: { strength: 3, knowledge: 2 },
    powerMultiplier: 1.05,
    requirementType: "TOWER_FLOOR",
    requirementValue: 5,
    isUnlocked: true,
    isEquipped: false,
  },
  {
    id: "title-consistency-sovereign",
    name: "Consistency Sovereign",
    description: "Unwavering ruler of daily routine discipline and unbroken focus.",
    icon: "👑",
    category: "Milestone",
    statBonus: { discipline: 3, consistency: 3 },
    powerMultiplier: 1.05,
    requirementType: "COMPLETED_MISSIONS",
    requirementValue: 25,
    isUnlocked: true,
    isEquipped: false,
  },
  {
    id: "title-shadow-monarch",
    name: "Shadow Monarch",
    description: "Sovereign of shadows granting massive stat scaling and stealth crits.",
    icon: "🌌",
    category: "Special",
    statBonus: { strength: 5, focus: 5, discipline: 5 },
    powerMultiplier: 1.10,
    requirementType: "LEVEL_REACHED",
    requirementValue: 10,
    isUnlocked: true,
    isEquipped: false,
  },
  {
    id: "title-early-riser",
    name: "Early Riser",
    description: "Disciplined morning warrior who conquers the day before dawn.",
    icon: "🌅",
    category: "Habits",
    statBonus: { focus: 2, discipline: 1 },
    powerMultiplier: 1.02,
    requirementType: "EARLY_MISSION",
    requirementValue: 5,
    isUnlocked: true,
    isEquipped: false,
  },
  {
    id: "title-explosion-sovereign",
    name: "Explosion Sovereign",
    description: "Crimson Demon title channeling maximum mana into high-impact feats.",
    icon: "💥",
    category: "Special",
    statBonus: { knowledge: 5, focus: 3 },
    powerMultiplier: 1.08,
    requirementType: "MANA_BURST",
    requirementValue: 1,
    isUnlocked: true,
    isEquipped: false,
  },
  {
    id: "title-iron-will",
    name: "Iron Will",
    description: "Indomitable defender enduring the heaviest resistance sessions.",
    icon: "🛡️",
    category: "Milestone",
    statBonus: { endurance: 3, recovery: 3 },
    powerMultiplier: 1.04,
    requirementType: "HEAVY_WORKOUTS",
    requirementValue: 10,
    isUnlocked: true,
    isEquipped: false,
  },
  {
    id: "title-grandmaster-ascendant",
    name: "Grandmaster Ascendant",
    description: "Legendary entity of supreme physical, mental, and habit mastery.",
    icon: "✨",
    category: "Milestone",
    statBonus: { strength: 4, knowledge: 4, discipline: 4 },
    powerMultiplier: 1.08,
    requirementType: "LEVEL_REACHED",
    requirementValue: 20,
    isUnlocked: false,
    isEquipped: false,
  },
];

export default function CustomizePage() {
  const { character, updateIdentity, refetch } = useCharacterStore();
  const [titles, setTitles] = useState<TitleItem[]>(DEFAULT_TITLES);
  const [isLoading, setIsLoading] = useState(false);
  const [isEquipping, setIsEquipping] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const currentEquippedTitle = character?.title || "Hydration Monarch";

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/character/titles/${character?.id || "char-id-123"}`);
        if (res.ok) {
          const data = await res.json();
          if (data.titles && data.titles.length > 0) {
            setTitles(data.titles);
          }
        }
      } catch (e) {
        console.warn("Using offline titles registry");
      }
    };
    fetchTitles();
  }, [character?.id]);

  const handleEquipTitle = async (title: TitleItem) => {
    setIsEquipping(title.id);
    try {
      // Immediate optimistic update
      updateIdentity({
        title: title.name,
      } as any);

      setTitles((prev) =>
        prev.map((t) => ({
          ...t,
          isEquipped: t.name === title.name,
        }))
      );

      playBuffSFX();
      toast.success(`Equipped Title Honorific: [${title.name}]!`);

      // Backend sync
      fetch(`${API_BASE_URL}/api/character/titles/equip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character?.id || "char-id-123",
          titleId: title.id,
        }),
      }).catch(console.error);

    } catch (e) {
      toast.error("Failed to equip title.");
    } finally {
      setIsEquipping(null);
    }
  };

  const categories = ["ALL", "Milestone", "Tower", "Habits", "Special"];

  const filteredTitles = titles.filter((t) => {
    if (selectedCategory === "ALL") return true;
    return t.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 font-sans select-none">
      {/* HEADER BANNER */}
      <div className="konosuba-adventurer-card p-4 sm:p-5 shadow-[0_8px_16px_rgba(0,0,0,0.6)] space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold font-pixel text-[#241208] flex items-center gap-2">
                <PixelPaletteIcon className="w-4 h-4 text-amber-800" />
                <span>ᛏᛁᛏᛚ GUILD TITLE REGISTRY & BADGES</span>
              </h2>
              <PixelBadge variant="gold" className="flex items-center gap-1.5">
                <Crown className="w-3 h-3 text-amber-900" />
                EQUIPPED: {currentEquippedTitle}
              </PixelBadge>
            </div>
            <p className="text-xs font-pixel text-[#633a20] max-w-2xl leading-relaxed">
              Equip authenticated guild honorifics and titles earned through Tower climbs, habit streaks, and milestone achievements to activate power multipliers.
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-1.5 flex-wrap font-pixel text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playUIMenuSFX("confirm");
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 font-bold uppercase transition-none border-2 cursor-pointer active:translate-y-0.5 ${
                  selectedCategory === cat
                    ? "bg-[#381e10] text-[#fef08a] border-[#1a0c05] shadow-[inset_1px_1px_0_0_#633a20]"
                    : "bg-[#ebd9b5] text-[#381e10] border-[#522e18] hover:bg-[#dfba7c]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TITLES GRID */}
      {isLoading ? (
        <AscendRouteSkeleton preset="appearance" label="Loading appearance forge" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTitles.map((title) => {
            const isEquipped = title.name.toLowerCase() === currentEquippedTitle.toLowerCase();
            const isLocked = !title.isUnlocked;

            return (
              <div
                key={title.id}
                className={`p-4 transition-all duration-150 border-3 flex flex-col justify-between relative overflow-hidden font-pixel ${
                  isEquipped
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
                      <div className="w-10 h-10 bg-[#331c0e] text-[#fef08a] border border-[#180b04] flex items-center justify-center text-lg shadow-inner shrink-0">
                        {title.icon || "🏆"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#221208]">{title.name}</h3>
                        <span className="text-[10px] text-[#6d4c3d] font-bold block">
                          Category: {title.category}
                        </span>
                      </div>
                    </div>

                    {isEquipped ? (
                      <PixelBadge variant="gold">EQUIPPED</PixelBadge>
                    ) : isLocked ? (
                      <PixelBadge variant="dark" className="flex items-center gap-1">
                        <PixelLockIcon className="w-3 h-3" />
                        LOCKED
                      </PixelBadge>
                    ) : (
                      <PixelBadge variant="default">UNLOCKED</PixelBadge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#221208] leading-relaxed">
                    {title.description}
                  </p>

                  {/* Stat Bonuses & Power Multiplier */}
                  <div className="p-2 bg-[#dfcaac] border border-[#4a2813]/50 shadow-[inset_0_0_4px_rgba(89,59,34,0.25)] space-y-1 text-[10px]">
                    <div className="flex items-center justify-between font-bold text-[#221208]">
                      <span>✦ POWER BOOST:</span>
                      <span className="text-emerald-900 font-bold">
                        +{(Math.round((title.powerMultiplier - 1) * 100))}% Combat Multiplier
                      </span>
                    </div>

                    {title.statBonus && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[#221208] font-bold">
                        {Object.entries(title.statBonus).map(([stat, val]) => (
                          <span key={stat} className="px-1.5 py-0.5 bg-[#caa97e] border border-[#4a2813]/40">
                            +{val} {stat.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Unlock Criteria */}
                  <div className="text-[10px] text-[#593b22]">
                    <span className="font-bold uppercase">Requirement: </span>
                    <span className="font-bold">
                      {title.requirementType === "HABIT_STREAK" && `${title.requirementValue}-day unbroken habit streak`}
                      {title.requirementType === "TOWER_FLOOR" && `Clear Floor ${title.requirementValue} in Spire Tower`}
                      {title.requirementType === "COMPLETED_MISSIONS" && `Complete ${title.requirementValue} Guild Missions`}
                      {title.requirementType === "LEVEL_REACHED" && `Reach Character Level ${title.requirementValue}`}
                      {title.requirementType === "EARLY_MISSION" && `Complete ${title.requirementValue} early morning missions`}
                      {title.requirementType === "MANA_BURST" && `Channel high-intensity workout explosion`}
                      {title.requirementType === "HEAVY_WORKOUTS" && `Log ${title.requirementValue} heavy compound PR sets`}
                    </span>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-4 mt-3 border-t border-[#4a2813]/30">
                  {isEquipped ? (
                    <div className="w-full py-2 bg-[#381e10] text-[#fef08a] text-center text-xs font-bold flex items-center justify-center gap-2 border border-[#1a0c05]">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Active Honorific Title</span>
                    </div>
                  ) : (
                    <PixelButton
                      onClick={() => handleEquipTitle(title)}
                      disabled={isLocked || isEquipping === title.id}
                      variant={isLocked ? "dark" : "gold"}
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 text-xs"
                    >
                      {isEquipping === title.id ? (
                        <>
                          <AscendPendingSpinner label="Saving appearance" />
                          <span>Equipping...</span>
                        </>
                      ) : isLocked ? (
                        <>
                          <PixelLockIcon className="w-3.5 h-3.5" />
                          <span>Honorific Locked</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                          <span>Equip Title</span>
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
