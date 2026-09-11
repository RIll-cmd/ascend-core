"use client";

import { API_BASE_URL } from "@/constants";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useInventoryStore } from "@/features/inventory/store/useInventoryStore";
import { useSkillStore } from "@/features/skills/store/useSkillStore";
import { calculateTotalCombatStats } from "@/features/inventory/utils/combatStatCalculator";
import { calculateDynamicPower } from "@/features/progression/utils";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelProgress } from "@/components/ui/pixel/PixelProgress";
import { KonosubaElementalMatrix } from "@/components/ui/pixel/KonosubaElementalMatrix";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CoolMode } from "@/components/ui/cool-mode";
import {
  PixelDumbbellIcon,
  PixelBookIcon,
  PixelShieldIcon,
  PixelCrosshairIcon,
  PixelLightningIcon,
  PixelHeartIcon,
  PixelActivityIcon,
  PixelSwordIcon,
  PixelAwardIcon,
  PixelChevronRightIcon,
  PixelInfoIcon,
} from "@/components/ui/pixel/PixelIcons";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { STAT_LORE } from "@/features/lore/loreData";
import { CHARACTER_AVATAR_SPRITE } from "@/utils/sprites";

interface TitleMilestone {
  id: string;
  name: string;
  category: string;
  statRequirement: string;
  targetValue: number;
  unlocked: boolean;
}

const STAT_METADATA = [
  {
    key: "strength",
    label: "Strength",
    short: "STR",
    rune: "ᛋᛏᚱ",
    icon: PixelDumbbellIcon,
    color: "text-rose-700",
    bgColor: "bg-rose-900/20",
    loreKey: "strength",
    irlSource: "Barbell Back Squats, Deadlifts, Bench Press & Workout PRs",
    irlActionHref: "/workouts",
    irlActionText: "Train in Workouts",
    defaultTitle: "Brawler",
    defaultTarget: 10,
  },
  {
    key: "knowledge",
    label: "Knowledge",
    short: "KNW",
    rune: "ᛗᚷᚲ",
    icon: PixelBookIcon,
    color: "text-sky-700",
    bgColor: "bg-sky-900/20",
    loreKey: "knowledge",
    irlSource: "Daily non-fiction reading blocks, Study modules & Book logs",
    irlActionHref: "/habits/create",
    irlActionText: "Log Study Protocol",
    defaultTitle: "Scholar",
    defaultTarget: 10,
  },
  {
    key: "discipline",
    label: "Discipline",
    short: "DIS",
    rune: "ᛚᚲᚲ",
    icon: PixelShieldIcon,
    color: "text-amber-800",
    bgColor: "bg-amber-900/20",
    loreKey: "discipline",
    irlSource: "Fulfilling Daily Missions & protecting unbroken habit streaks",
    irlActionHref: "/missions",
    irlActionText: "View Daily Quests",
    defaultTitle: "Iron Will",
    defaultTarget: 10,
  },
  {
    key: "focus",
    label: "Focus",
    short: "FOC",
    rune: "ᛞᛪᛏ",
    icon: PixelCrosshairIcon,
    color: "text-purple-700",
    bgColor: "bg-purple-900/20",
    loreKey: "focus",
    irlSource: "Deep Work blocks, Pomodoro cycles & undistracted execution",
    irlActionHref: "/habits/create",
    irlActionText: "Log Deep Work",
    defaultTitle: "Strategist",
    defaultTarget: 10,
  },
  {
    key: "endurance",
    label: "Endurance",
    short: "END",
    rune: "ᚺᛚᛏ",
    icon: PixelLightningIcon,
    color: "text-emerald-700",
    bgColor: "bg-emerald-900/20",
    loreKey: "endurance",
    irlSource: "Cardio sessions, Daily step volume, & High-rep workout sets",
    irlActionHref: "/workouts",
    irlActionText: "Track Endurance",
    defaultTitle: "Marathoner",
    defaultTarget: 10,
  },
  {
    key: "recovery",
    label: "Recovery",
    short: "REC",
    rune: "ᚱᛖᚲ",
    icon: PixelHeartIcon,
    color: "text-pink-700",
    bgColor: "bg-pink-900/20",
    loreKey: "recovery",
    irlSource: "Sleep quality, Rest days & biological cellular repair",
    irlActionHref: "/workouts",
    irlActionText: "Check Muscle Recovery",
    defaultTitle: "Regenerator",
    defaultTarget: 10,
  },
  {
    key: "consistency",
    label: "Consistency",
    short: "CNS",
    rune: "ᛇᚷᛚ",
    icon: PixelActivityIcon,
    color: "text-indigo-700",
    bgColor: "bg-indigo-900/20",
    loreKey: "consistency",
    irlSource: "Achieving 100% Daily All-Clear habit completions across the week",
    irlActionHref: "/habits",
    irlActionText: "Review Habits",
    defaultTitle: "Ascendant",
    defaultTarget: 10,
  },
];

export default function StatMatrixPage() {
  const { character } = useCharacterStore();
  const { items: inventoryItems } = useInventoryStore();
  const { playerSkills } = useSkillStore();
  const [titles, setTitles] = useState<any[]>([]);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  useEffect(() => {
    if (character?.id) {
      fetch(`${API_BASE_URL}/api/character/titles/${character.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.titles) setTitles(data.titles);
        })
        .catch(console.error);
    }
  }, [character?.id]);

  const equippedItems = (inventoryItems || []).filter((i) => i.isEquipped);

  const baseStats: Record<string, number> = {
    strength: character?.stats?.strength || 1,
    knowledge: character?.stats?.knowledge || 1,
    discipline: character?.stats?.discipline || 1,
    focus: character?.stats?.focus || 1,
    endurance: character?.stats?.endurance || 1,
    recovery: character?.stats?.recovery || 1,
    consistency: character?.stats?.consistency || 1,
  };

  const combatStats = calculateTotalCombatStats(baseStats, equippedItems, playerSkills);
  const multipliers = combatStats.itemMultipliers || {
    strengthPct: 0,
    knowledgePct: 0,
    recoveryPct: 0,
    focusPct: 0,
    disciplinePct: 0,
    endurancePct: 0,
    consistencyPct: 0,
  };

  const basePower = calculateDynamicPower(character?.level || 1, baseStats);
  const effectivePower = calculateDynamicPower(character?.level || 1, {
    strength: combatStats.strength,
    knowledge: combatStats.knowledge,
    discipline: combatStats.discipline,
    focus: combatStats.focus,
    endurance: combatStats.endurance,
    recovery: combatStats.recovery,
    consistency: combatStats.consistency || 1,
  });

  const availableSP = character?.availableSP || 0;

  return (
    <div className="space-y-6 font-sans select-none">
      {/* ========================================================= */}
      {/* 1. GUILD ATTRIBUTE MATRIX HEADER PLAQUE                   */}
      {/* ========================================================= */}
      <div className="konosuba-adventurer-card p-4 sm:p-5 shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-[#ebd9b5] border-2 border-[#381e10] shadow-[2px_2px_0_0_#000] flex items-center justify-center p-1 relative shrink-0">
              <img
                src={CHARACTER_AVATAR_SPRITE}
                alt="Avatar"
                onError={(e) => {
                  e.currentTarget.src = "/Character_sprite_placeholder/cropped/player-front.png";
                }}
                className="w-full h-full object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-pixel text-[#221208] flex items-center gap-2">
                  <PixelActivityIcon className="w-4 h-4 text-amber-900" />
                  <span>ᛈᚨᚱᚨᛗᛖᛏᛖᚱ Attribute Parameter Matrix</span>
                </h2>
                <PixelBadge variant="gold">Kinetic Mastery Registry</PixelBadge>
              </div>
              <p className="text-xs font-pixel text-[#593b22] max-w-2xl leading-relaxed">
                Core parameters scale through real-world physical training, study habits, deep work blocks, and sleep quality. Equipment multipliers amplify baseline mastery.
              </p>
            </div>
          </div>

          {/* Real-Time Power Telemetry Hub */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <div className="p-3 bg-[#331c0e] text-[#fef08a] border-2 border-[#180b04] text-right font-pixel shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]">
              <span className="block text-[10px] text-[#e2b17a] uppercase font-bold">TOTAL COMBAT POWER</span>
              <div className="text-xl font-bold text-[#fef08a] flex items-center justify-end gap-1.5 mt-0.5">
                <PixelSwordIcon className="w-4 h-4 text-[#fef08a]" />
                <NumberTicker value={effectivePower} />
                {effectivePower > basePower && (
                  <span className="text-xs text-emerald-400 font-bold ml-1">
                    (+<NumberTicker value={effectivePower - basePower} /> Gear)
                  </span>
                )}
              </div>
            </div>

            {availableSP > 0 && (
              <Link href="/profile/skills">
                <CoolMode options={{ particle: "⚡", size: 20, speedHorz: 3, speedUp: 7 }}>
                  <PixelButton variant="gold" size="md" className="flex items-center gap-2 text-xs">
                    <PixelLightningIcon className="w-3.5 h-3.5 text-amber-950" />
                    <span><NumberTicker value={availableSP} /> SP Ready</span>
                  </PixelButton>
                </CoolMode>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. REAL-LIFE STAT PROGRESSION PHILOSOPHY BANNER */}
      {/* ========================================================= */}
      <div className="p-3.5 bg-[#caa97e] border-2 border-[#4a2813] shadow-[inset_0_0_12px_rgba(89,59,34,0.35),2px_2px_0_0_#221208] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-pixel text-[#221208]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#331c0e] text-[#fef08a] border border-[#180b04] flex items-center justify-center shrink-0 shadow-xs">
            <PixelInfoIcon className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-[#221208] uppercase tracking-wider block">
              Ascend OS Kinetic Growth Law
            </span>
            <span className="text-[#593b22] text-xs">
              Gear bonuses are % multipliers: a +20% Strength armament gives +0 bonus at Base 1 STR, but amplifies to +10 bonus when you train to Base 50 STR.
            </span>
          </div>
        </div>

        <Link href="/workouts">
          <PixelButton size="sm" variant="dark" className="flex items-center gap-1 shrink-0 text-xs">
            <span>Log IRL Actions</span>
            <PixelChevronRightIcon className="w-3 h-3" />
          </PixelButton>
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 3. KONOSUBA ELEMENTAL DIAL MATRIX & 7 ATTRIBUTES BREAKDOWN */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: AUTHENTIC KONOSUBA ELEMENTAL DIAL MATRIX & ACTIVE GEAR MULTIPLIERS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Authentic KonoSuba Elemental Dial Matrix with full interactive hover and live HUD */}
          <KonosubaElementalMatrix
            baseStats={baseStats}
            combatStats={combatStats}
            multipliers={multipliers}
            availableSP={availableSP}
            combatPower={effectivePower}
            characterClass={character?.specialization?.name || (character as any)?.class || "ADVENTURER"}
            selectedStat={selectedStat}
            onSelectStat={(key) => setSelectedStat(key)}
          />

          {/* Active Equipment Multipliers Overview */}
          <div className="konosuba-adventurer-card p-4 sm:p-5 shadow-[0_12px_28px_rgba(0,0,0,0.85)] space-y-3">
            <div className="flex items-center justify-between border-b border-[#4a2813]/30 pb-2">
              <span className="font-pixel text-xs font-bold text-[#221208] uppercase tracking-wider">ACTIVE GEAR CATALYZERS</span>
              <span className="font-pixel text-[11px] text-[#6d4c3d]">{equippedItems.length} Armaments</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-pixel">
              <div className="p-2 bg-[#caa97e] border border-[#4a2813] shadow-[inset_0_0_6px_rgba(89,59,34,0.3)] flex justify-between items-center">
                <span className="text-[#221208] font-bold">STR Multiplier</span>
                <span className="text-rose-800 font-bold">+{multipliers.strengthPct}%</span>
              </div>
              <div className="p-2 bg-[#caa97e] border border-[#4a2813] shadow-[inset_0_0_6px_rgba(89,59,34,0.3)] flex justify-between items-center">
                <span className="text-[#221208] font-bold">KNW Multiplier</span>
                <span className="text-sky-800 font-bold">+{multipliers.knowledgePct}%</span>
              </div>
              <div className="p-2 bg-[#caa97e] border border-[#4a2813] shadow-[inset_0_0_6px_rgba(89,59,34,0.3)] flex justify-between items-center">
                <span className="text-[#221208] font-bold">DIS Multiplier</span>
                <span className="text-amber-900 font-bold">+{multipliers.disciplinePct}%</span>
              </div>
              <div className="p-2 bg-[#caa97e] border border-[#4a2813] shadow-[inset_0_0_6px_rgba(89,59,34,0.3)] flex justify-between items-center">
                <span className="text-[#221208] font-bold">FOC Multiplier</span>
                <span className="text-purple-800 font-bold">+{multipliers.focusPct}%</span>
              </div>
              <div className="p-2 bg-[#caa97e] border border-[#4a2813] shadow-[inset_0_0_6px_rgba(89,59,34,0.3)] flex justify-between items-center">
                <span className="text-[#221208] font-bold">END Multiplier</span>
                <span className="text-emerald-800 font-bold">+{multipliers.endurancePct}%</span>
              </div>
              <div className="p-2 bg-[#caa97e] border border-[#4a2813] shadow-[inset_0_0_6px_rgba(89,59,34,0.3)] flex justify-between items-center">
                <span className="text-[#221208] font-bold">REC Multiplier</span>
                <span className="text-pink-800 font-bold">+{multipliers.recoveryPct}%</span>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-[#4a2813]/30 flex items-center justify-between text-xs font-pixel text-[#221208]">
              <span className="flex items-center gap-1.5 font-bold">
                <PixelShieldIcon className="w-3.5 h-3.5 text-amber-900" />
                Flat Combat Stats:
              </span>
              <span className="text-[#221208] font-black">
                +{combatStats.attack} ATK • +{combatStats.defense} DEF
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: THE 7 CORE KINETIC ATTRIBUTES CARDS (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {STAT_METADATA.map((meta) => {
            const Icon = meta.icon;
            const baseVal = baseStats[meta.key] || 1;
            const effectiveVal = combatStats[meta.key] || baseVal;
            const multPct = (multipliers as any)[`${meta.key}Pct`] || 0;
            const isSelected = selectedStat === meta.key;

            const lore = (STAT_LORE as any)[meta.loreKey] || {
              name: meta.label,
              meaning: "Core physical or mental capability",
              lore: "A core attribute of the Ascendant system.",
              mechanics: "Amplified through dedicated real-world daily training.",
            };

            const matchingTitle = titles.find(
              (t) => t.requirementType === `STAT_${meta.short}`
            );
            const titleTarget = matchingTitle?.requirementValue || meta.defaultTarget;
            const titleName = matchingTitle?.name || meta.defaultTitle;
            const progressPct = Math.min(100, Math.round((baseVal / titleTarget) * 100));

            return (
              <div
                key={meta.key}
                onClick={() => {
                  setSelectedStat(meta.key);
                  playUIMenuSFX("confirm");
                }}
                className={`p-3.5 bg-[#caa97e] border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-amber-950 shadow-[inset_0_0_16px_rgba(89,59,34,0.45),0_0_12px_rgba(180,83,9,0.35)] ring-2 ring-amber-900"
                    : "border-[#4a2813] shadow-[inset_0_0_12px_rgba(89,59,34,0.35),2px_2px_0_0_#221208] hover:border-amber-950"
                } space-y-3`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Left: Icon, Name & Lore Tooltip */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 ${meta.bgColor} border border-[#4a2813] flex items-center justify-center shrink-0 shadow-inner`}>
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-pixel font-bold text-sm text-[#221208]">
                          {meta.label}
                        </h4>
                        <span className="font-mono text-[11px] text-[#6d4c3d] font-bold">
                          [{meta.rune} {meta.short}]
                        </span>
                        <SystemTooltip
                          title={lore.name}
                          subtitle={`${meta.label} Matrix (${meta.short})`}
                          category="Core Attribute"
                          rarity="MYTHIC"
                          description={lore.description || lore.meaning}
                          howToImprove={lore.howToImprove || meta.irlSource}
                          lore={lore.lore}
                          mechanics={lore.combatScaling || lore.mechanics}
                          stats={[
                            { label: "Base IRL Stat", value: `${baseVal}`, color: "text-white" },
                            { label: "Gear Boost", value: `+${multPct}%`, color: "text-emerald-400" },
                            { label: "Effective Stat", value: `${effectiveVal}`, color: "text-cyan-300" }
                          ]}
                          tags={["Real-World Growth", "Multiplier Scaling", meta.short]}
                          delayMs={600}
                        >
                          <div className="p-0.5 hover:bg-[#dfcaac] transition-colors cursor-help">
                            <PixelInfoIcon className="w-3.5 h-3.5 text-amber-950" />
                          </div>
                        </SystemTooltip>
                      </div>
                      <p className="font-pixel text-xs text-[#593b22] truncate mt-0.5">
                        {meta.irlSource}
                      </p>
                    </div>
                  </div>

                  {/* Right: Base Stat & Multiplier Values */}
                  <div className="flex items-center gap-3 self-end sm:self-auto font-pixel text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-[#6d4c3d] uppercase block font-bold">Base</span>
                      <span className="text-base font-bold text-[#221208]"><NumberTicker value={baseVal} /></span>
                    </div>

                    <div className="text-[#6d4c3d] font-bold">+</div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#6d4c3d] uppercase block font-bold">Gear</span>
                      <span className={`text-xs font-bold ${multPct > 0 ? "text-emerald-800" : "text-[#6d4c3d]/70"}`}>
                        +{multPct}%
                      </span>
                    </div>

                    <div className="text-[#6d4c3d] font-bold">=</div>

                    <div className="text-right p-1.5 px-2.5 bg-[#331c0e] border border-[#180b04] shadow-xs">
                      <span className="text-[9px] text-[#fef08a] uppercase font-bold block">Total</span>
                      <span className="text-base font-bold text-white"><NumberTicker value={effectiveVal} /></span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Milestone Title Mastery Progress & IRL Action CTA */}
                <div className="pt-2 border-t border-[#4a2813]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-pixel">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-[11px] text-[#221208] flex items-center gap-1 shrink-0 font-bold">
                      <PixelAwardIcon className="w-3.5 h-3.5 text-amber-800" />
                      Title: <strong className="text-[#8c2d0f]">{titleName}</strong>
                    </span>

                    <div className="w-24 sm:w-32">
                      <PixelProgress value={progressPct} color="gold" className="h-2.5 border border-[#4a2813]" />
                    </div>

                    <span className="text-[11px] text-[#6d4c3d] shrink-0 font-bold">
                      <NumberTicker value={baseVal} />/{titleTarget}
                    </span>
                  </div>

                  <Link href={meta.irlActionHref} onClick={(e) => e.stopPropagation()}>
                    <CoolMode options={{ particle: "⚡", size: 16, speedHorz: 3, speedUp: 6 }}>
                      <PixelButton size="sm" variant="dark" className="flex items-center gap-1 text-[11px]">
                        <span>{meta.irlActionText}</span>
                        <PixelChevronRightIcon className="w-3 h-3" />
                      </PixelButton>
                    </CoolMode>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
