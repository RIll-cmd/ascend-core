"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useSkillStore } from "@/features/skills/store/useSkillStore";
import { calculateLevelData } from "@/features/progression/utils";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { CHARACTER_AVATAR_SPRITE } from "@/utils/sprites";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelProgress } from "@/components/ui/pixel/PixelProgress";
import { GuildSealWatermark } from "@/components/ui/pixel/GuildSealWatermark";
import { AdventurerStatusCardRibbon } from "@/components/ui/pixel/AdventurerStatusCardRibbon";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CoolMode } from "@/components/ui/cool-mode";
import {
  PixelAwardIcon,
  PixelLightningIcon,
  PixelCrownIcon,
  PixelSlidersIcon,
  PixelTreeIcon,
  PixelPaletteIcon,
  PixelHistoryIcon,
  PixelSwordIcon,
} from "@/components/ui/pixel/PixelIcons";
import { X, Edit3, Check, Sparkles } from "lucide-react";

const AVAILABLE_CLASSES = [
  "ADVENTURER",
  "NOVICE WARRIOR",
  "APPRENTICE MAGE",
  "SHADOW ROGUE",
  "ACOLYTE PRIEST",
  "PALADIN",
  "BERSERKER",
  "ARCH-WIZARD",
  "STORMWEAVER",
  "SHADOW MONARCH",
  "ASSASSIN",
  "CRUSADER",
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { character, gainExp, updateIdentity } = useCharacterStore();
  const { definitions, playerSkills, fetchSkills } = useSkillStore();

  const totalExp = character?.exp || 0;
  const levelData = calculateLevelData(totalExp);

  const name = character?.name || "KAZUMA SATOU";
  const rank = character?.rank || "F";
  const gender = character?.gender || "M";
  const age = character?.age ?? 16;
  const race = character?.race || "HUMAN";
  const activeClass = character?.specialization?.name || (character as any)?.class || "ADVENTURER";
  const gold = character?.gold ?? 0;
  const power = character?.power || 50;

  useEffect(() => {
    if (character?.id) {
      fetchSkills(character.id);
    }
  }, [character?.id, fetchSkills]);

  // Actual unlocked skills from the Elemental Skill Matrix
  const unlockedSkills = definitions.filter((d) =>
    playerSkills.some((ps) => ps.skillDefinitionId === d.id)
  );

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editGender, setEditGender] = useState(gender);
  const [editAge, setEditAge] = useState(age);
  const [editRace, setEditRace] = useState(race);
  const [editClass, setEditClass] = useState(activeClass.toUpperCase());

  const openEditModal = () => {
    setEditName(character?.name || name);
    setEditGender(character?.gender || gender);
    setEditAge(character?.age ?? age);
    setEditRace(character?.race || race);
    setEditClass((character?.specialization?.name || (character as any)?.class || "ADVENTURER").toUpperCase());
    setIsEditing(true);
    playUIMenuSFX("confirm");
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    updateIdentity({
      name: editName.trim() || name,
      gender: editGender.trim() || gender,
      age: Number(editAge) || age,
      race: editRace.trim().toUpperCase() || race,
      class: editClass.trim().toUpperCase() || activeClass,
      specialization: {
        id: `spec-${editClass.toLowerCase().replace(/\s+/g, "-")}`,
        name: editClass.trim().toUpperCase(),
        baseClass: editClass.trim().toUpperCase(),
        tier: 1,
        requiredLevel: 1,
        passivePerk: `${editClass} Mastery`,
      },
    } as any);
    playBuffSFX();
    setIsEditing(false);
  };

  const stats = character?.stats || {
    strength: 13,
    knowledge: 15,
    discipline: 12,
    focus: 14,
    endurance: 11,
    recovery: 10,
    consistency: 99,
  };

  const tabs = [
    {
      name: "Stat Matrix",
      rune: "ᚱ",
      href: "/profile/stats",
      icon: PixelSlidersIcon,
    },
    {
      name: "Skill Tree",
      rune: "ᛋ",
      href: "/profile/skills",
      icon: PixelTreeIcon,
      badgeText: character?.availableSP ? `${character.availableSP} SP` : character?.specialization?.name || undefined,
      badgeVariant: character?.availableSP ? ("gold" as const) : ("purple" as const),
    },
    {
      name: "Customization",
      rune: "ᛏ",
      href: "/profile/customize",
      icon: PixelPaletteIcon,
    },
    {
      name: "Chronicles",
      rune: "ᚺ",
      href: "/profile/history",
      icon: PixelHistoryIcon,
    },
  ];

  return (
    <div suppressHydrationWarning className="space-y-6 pb-12 font-sans select-none relative">
      {/* Tavern Pixel Animated Background (Profile and its subroutes only) */}
      <div
        className="fixed inset-0 w-full h-full min-h-screen h-[100dvh] bg-[#0f0814] pointer-events-none z-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/tavern_background.gif')",
            imageRendering: "pixelated",
          }}
        />
        {/* Subtle Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-[#0d0517]/35 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(13,5,23,0.65)_100%)]" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* ========================================================= */}
        {/* KONOSUBA AUTHENTIC ADVENTURER STATUS GUILD CARD           */}
        {/* ========================================================= */}
        <div className="konosuba-adventurer-card p-4 sm:p-6 relative overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.9)] border-4 border-[#381e10]">
        
        {/* Double-Line Inset Engraved Inner Frame */}
        <div className="absolute inset-1.5 border-2 border-[#522e18] pointer-events-none z-20" />
        <div className="absolute inset-2.5 border border-[#8c5225]/40 pointer-events-none z-20" />
        
        {/* Corner Rivet Cornerstones */}
        <div className="absolute top-3 left-3 w-2 h-2 bg-[#381e10] border border-[#fef08a] z-30 pointer-events-none shadow-xs" />
        <div className="absolute top-3 right-3 w-2 h-2 bg-[#381e10] border border-[#fef08a] z-30 pointer-events-none shadow-xs" />
        <div className="absolute bottom-3 left-3 w-2 h-2 bg-[#381e10] border border-[#fef08a] z-30 pointer-events-none shadow-xs" />
        <div className="absolute bottom-3 right-3 w-2 h-2 bg-[#381e10] border border-[#fef08a] z-30 pointer-events-none shadow-xs" />

        {/* Background Authenticated Crimson Magic Circle & Giant Rank Watermark */}
        <GuildSealWatermark rank={rank} />

        {/* Top Ornate Runic Engraved Border Pattern Ribbon Graphic SVG (Bespoke Pixel Art) */}
        <AdventurerStatusCardRibbon />

        {/* TOP SECTION: NAME, RUNIC GLYPHS, TITLE, DEMOGRAPHICS & PORTRAIT */}
        <div className="relative z-10 flex flex-row items-start justify-between gap-3 sm:gap-4 pb-3 border-b-2 border-[#522e18]">
          
          {/* Left: Identity Details & Demographics */}
          <div className="flex-1 space-y-1.5 min-w-0">
            {/* Player Name, Active Title Badge & Serial */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-pixel text-[#241208] tracking-wider uppercase">
                {name}
              </h1>

              {/* Title Badge (Positioned at Top Header) */}
              <div className="flex items-center gap-1.5 text-xs font-pixel text-[#2b170c] bg-[#ebd099] border-2 border-[#693e15] px-2.5 py-1 shadow-[inset_1px_1px_0_0_#ffffff]">
                <span className="w-2 h-2 bg-[#b45309]" />
                <span className="font-bold">TITLE: {character?.title || "Hydration Monarch"}</span>
              </div>

              <span className="text-xs font-pixel text-[#824f2b] font-bold tracking-wider px-2 py-0.5 bg-[#ecd9b5]/60 border border-[#824f2b]/40">
                #ASC-0491
              </span>
            </div>

            {/* Translated Ancient Runic Name (Exact Anime Font Look) */}
            <div className="text-xs sm:text-sm font-mono text-[#633a20] tracking-[0.25em] font-bold select-none truncate">
              ᚲᚨᛉᚢᛗᚨ ᛋᚨᛏᛟᚢ ᛞᚨᛉᚢᛖᛟ ᚱᚨᚲᛖ
            </div>

            {/* Demographics Row (Interactive / Editable) */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-pixel font-bold text-[#361c0c] pt-0.5">
              <span className="hover:text-amber-950 cursor-pointer" onClick={openEditModal}>
                GEN: <strong>{gender}</strong>
              </span>
              <span className="text-[#6d4c3d]">|-|</span>
              <span className="hover:text-amber-950 cursor-pointer" onClick={openEditModal}>
                AGE: <strong>{age}</strong>
              </span>
              <span className="text-[#6d4c3d]">|-|</span>
              <span className="hover:text-amber-950 cursor-pointer" onClick={openEditModal}>
                RAC: <strong>{race}</strong>
              </span>
              <span className="text-[#6d4c3d]">|-|</span>
              <span className="hover:text-amber-950 cursor-pointer" onClick={openEditModal}>
                CLASS: <strong className="text-[#8c2d0f]">{activeClass.toUpperCase()}</strong>
              </span>

              {/* Edit Credentials Trigger Button */}
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex items-center gap-1.5 ml-1 px-2 py-1 bg-[#caa97e] border-2 border-[#4a2813] text-[#361c0c] text-xs font-bold hover:bg-[#dfcaac] active:translate-y-0.5 cursor-pointer shadow-[inset_0_0_6px_rgba(89,59,34,0.3)]"
                title="Edit Character Credentials & Class"
              >
                <Edit3 className="w-3 h-3" />
                <span>EDIT</span>
              </button>
            </div>

            {/* Runic Bio / Lore Script Row */}
            <div className="text-[10px] sm:text-xs font-mono text-[#6d4c3d] tracking-wider select-none truncate max-w-xl">
              ᛖᚢᛋᛞ: 7 ᛉ ᛖ ᚨ ᚢ ᚾ: ᚺ ᛞ ᛞ ᛉ ᛖ ᚱ ᚨ ᛖ: ᛋ ᛟ ᚲ ᚲ ᛉ ᛞ ᛫ ASCENDANT GUILD REGISTRY
            </div>
          </div>

          {/* Right: Character Portrait ID Box & Level Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right font-pixel">
              <div className="text-xl sm:text-2xl font-black text-[#221208] flex items-center justify-end gap-1">
                <span className="text-xs sm:text-sm text-[#6d4c3d] font-bold">LV</span>
                <span><NumberTicker value={levelData.currentLevel} /></span>
              </div>
              <div className="flex items-center justify-end gap-1 text-[8px] sm:text-[9px] text-[#9e704a] mt-0.5">
                <span>◆</span>
                <span>◆</span>
                <span>◆</span>
                <span className="text-xs text-[#361c0c] font-bold ml-1">RANK {rank.toUpperCase()}</span>
              </div>
            </div>

            {/* Portrait Frame Box */}
            <div className="w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 bg-[#caa97e] border-3 border-[#361b0c] shadow-[inset_0_0_12px_rgba(89,59,34,0.45),inset_2px_2px_4px_rgba(0,0,0,0.35)] flex items-center justify-center p-1.5 relative overflow-hidden shrink-0">
              <img
                src={character?.avatar || CHARACTER_AVATAR_SPRITE}
                alt={name}
                onError={(e) => {
                  e.currentTarget.src = CHARACTER_AVATAR_SPRITE;
                }}
                className="w-full h-full object-contain relative z-10"
                style={{ imageRendering: "pixelated" }}
              />
              {/* Corner Security Prongs */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#4a2813]" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#4a2813]" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#4a2813]" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#4a2813]" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MIDDLE SECTION: 2 BALANCED POLISHED COLUMNS               */}
        {/* ========================================================= */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 py-3 border-b-2 border-[#4a2813]">
          
          {/* COLUMN 1: STATS PARAMETER TABLE WITH LOCKED 3-COLUMN ALIGNMENT */}
          <div className="md:col-span-7 space-y-2 font-pixel text-xs">
            {/* Table Header Banner */}
            <div className="bg-[#331c0e] text-[#fef08a] px-3 py-1.5 grid grid-cols-12 items-center text-xs font-bold border border-[#180b04]">
              <div className="col-span-6 sm:col-span-6 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-400 rotate-45" />
                <span className="tracking-wider">ATTRIBUTE</span>
              </div>
              <div className="col-span-4 sm:col-span-4 text-center text-[10px] text-[#e2b17a]">
                RUNE GLYPH
              </div>
              <div className="col-span-2 sm:col-span-2 text-right text-[10px] text-[#e2b17a]">
                VALUE
              </div>
            </div>

            {/* Stat Rows with Locked Grid Layout (Zero Drift/Misalignment) */}
            <div className="space-y-1 bg-[#caa97e]/40 p-2.5 border border-[#4a2813]/50 shadow-[inset_0_0_12px_rgba(89,59,34,0.3)]">
              <div className="grid grid-cols-12 items-center py-1 border-b border-[#4a2813]/20">
                <div className="col-span-6 sm:col-span-6 text-[#221208] font-bold truncate">STRENGTH</div>
                <div className="col-span-4 sm:col-span-4 text-center font-mono text-[10px] text-[#6d4c3d]">ᛋᛏᚱ ⬦</div>
                <div className="col-span-2 sm:col-span-2 text-right font-bold text-[#221208] text-sm"><NumberTicker value={stats.strength} /></div>
              </div>
              <div className="grid grid-cols-12 items-center py-1 border-b border-[#4a2813]/20">
                <div className="col-span-6 sm:col-span-6 text-[#221208] font-bold truncate">HEALTH / ENDURANCE</div>
                <div className="col-span-4 sm:col-span-4 text-center font-mono text-[10px] text-[#6d4c3d]">ᚺᛚᛏ ⬦</div>
                <div className="col-span-2 sm:col-span-2 text-right font-bold text-[#221208] text-sm"><NumberTicker value={stats.endurance} /></div>
              </div>
              <div className="grid grid-cols-12 items-center py-1 border-b border-[#4a2813]/20">
                <div className="col-span-6 sm:col-span-6 text-[#221208] font-bold truncate">MAGIC POW / KNOWLEDGE</div>
                <div className="col-span-4 sm:col-span-4 text-center font-mono text-[10px] text-[#6d4c3d]">ᛗᚷᚲ ⬦</div>
                <div className="col-span-2 sm:col-span-2 text-right font-bold text-[#221208] text-sm"><NumberTicker value={stats.knowledge} /></div>
              </div>
              <div className="grid grid-cols-12 items-center py-1 border-b border-[#4a2813]/20">
                <div className="col-span-6 sm:col-span-6 text-[#221208] font-bold truncate">DEXTERITY / FOCUS</div>
                <div className="col-span-4 sm:col-span-4 text-center font-mono text-[10px] text-[#6d4c3d]">ᛞᛪᛏ ⬦</div>
                <div className="col-span-2 sm:col-span-2 text-right font-bold text-[#221208] text-sm"><NumberTicker value={stats.focus} /></div>
              </div>
              <div className="grid grid-cols-12 items-center py-1 border-b border-[#4a2813]/20">
                <div className="col-span-6 sm:col-span-6 text-[#221208] font-bold truncate">AGILITY / CONSISTENCY</div>
                <div className="col-span-4 sm:col-span-4 text-center font-mono text-[10px] text-[#6d4c3d]">ᛇᚷᛚ ⬦</div>
                <div className="col-span-2 sm:col-span-2 text-right font-bold text-[#221208] text-sm"><NumberTicker value={stats.consistency || 99} /></div>
              </div>
              <div className="grid grid-cols-12 items-center py-1">
                <div className="col-span-6 sm:col-span-6 text-[#221208] font-bold truncate">LUCK / DISCIPLINE</div>
                <div className="col-span-4 sm:col-span-4 text-center font-mono text-[10px] text-[#6d4c3d]">ᛚᚲᚲ ⬦</div>
                <div className="col-span-2 sm:col-span-2 text-right font-bold text-[#8c2d0f] text-sm"><NumberTicker value={stats.discipline} /></div>
              </div>
            </div>

            {/* Currencies & Power Telemetry */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[#6d4c3d] font-bold">GOLD:</span>
                <strong className="text-amber-950 font-black"><NumberTicker value={gold} />g</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#6d4c3d] font-bold">POWER:</span>
                <strong className="text-[#221208] font-black"><NumberTicker value={power} /></strong>
              </div>
            </div>
          </div>

          {/* COLUMN 2: LEARNED SKILLS & DIRECTIVES (md:col-span-5) */}
          <div className="md:col-span-5 space-y-2 font-pixel text-xs flex flex-col justify-between">
            <div className="space-y-2">
              {/* Table Header Banner */}
              <div className="bg-[#331c0e] text-[#fef08a] px-3 py-1.5 flex items-center justify-between text-xs font-bold border border-[#180b04]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-400 rotate-45" />
                  <span className="tracking-wider">ᛋᚲᛁᛚᛚ LEARNED SKILLS & ABILITIES</span>
                </div>
                <Link href="/skills" className="text-[10px] text-amber-300 underline hover:text-amber-100">
                  Matrix ({unlockedSkills.length})
                </Link>
              </div>

              {/* Dynamic Unlocked Skills List */}
              <div className="space-y-2 max-h-[170px] overflow-y-auto custom-scrollbar">
                {unlockedSkills.length > 0 ? (
                  unlockedSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-2.5 bg-[#caa97e] border-2 border-[#4a2813] shadow-[inset_0_0_8px_rgba(89,59,34,0.35)] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-[#6d4c3d] font-bold uppercase">{skill.elementPath || "SKILL"} TIER {skill.tier}</span>
                        </div>
                        <div className="text-xs font-bold text-[#221208] mt-0.5 tracking-wide">
                          ✦ {skill.name.toUpperCase()} ✦
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-900 font-bold px-2 py-0.5 bg-emerald-200/80 border border-emerald-800 shadow-xs">
                        MASTERED
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Specialization Class Perk if awakened */}
                    {character?.specialization?.passivePerk ? (
                      <div className="p-2.5 bg-[#caa97e] border-2 border-[#4a2813] shadow-[inset_0_0_8px_rgba(89,59,34,0.35)] flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-[#6d4c3d] font-bold uppercase">CLASS PASSIVE</span>
                          <div className="text-xs font-bold text-[#221208] mt-0.5 tracking-wide">
                            ✦ {character.specialization.passivePerk.toUpperCase()} ✦
                          </div>
                        </div>
                        <span className="text-[10px] text-amber-950 font-bold px-2 py-0.5 bg-amber-200/80 border border-amber-800">
                          ACTIVE
                        </span>
                      </div>
                    ) : null}

                    {/* Empty Skill Slots Ready for Unlocking in /skills */}
                    <div className="p-3 bg-[#caa97e]/30 border border-dashed border-[#4a2813]/70 text-center space-y-1">
                      <span className="text-xs text-[#593b22] uppercase font-bold block">[ EMPTY SKILL SLOT ]</span>
                      <Link
                        href="/skills"
                        className="inline-flex items-center gap-1 text-[10px] text-[#8c2d0f] font-bold underline hover:text-amber-950"
                      >
                        <span>Unlock in Elemental Skill Matrix →</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Simulate Training Action */}
            <div className="pt-2">
              <CoolMode options={{ particle: "⚡", size: 20, speedHorz: 3, speedUp: 7 }}>
                <PixelButton
                  onClick={() => {
                    gainExp(150, "Completed Training Simulation");
                    playUIMenuSFX();
                  }}
                  variant="gold"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold h-10"
                >
                  <PixelLightningIcon className="w-4 h-4 text-amber-900" />
                  <span>Simulate (+150 EXP)</span>
                </PixelButton>
              </CoolMode>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM SECTION: EXP PROGRESSION & UNIFORM SIZED TABS      */}
        {/* ========================================================= */}
        <div className="relative z-10 pt-3 space-y-3">
          {/* Level Progression */}
          <div className="flex items-center justify-between text-xs font-pixel text-[#361c0c]">
            <span className="font-bold uppercase tracking-wider flex items-center gap-2">
              <span>ᛖᛪᛈ CERTIFICATION EXP:</span>
              <strong className="text-[#221208]"><NumberTicker value={levelData.currentExpInLevel} /> / <NumberTicker value={levelData.expToNextLevel} /></strong>
            </span>
            <span className="text-[#6d4c3d] font-bold">(<NumberTicker value={levelData.progressPercentage} />%)</span>
          </div>

          <PixelProgress
            value={levelData.progressPercentage}
            color="gold"
            showShimmer
            className="h-3.5 border-2 border-[#361b0c]"
          />

          {/* ========================================================= */}
          {/* UNIFORM SIZED NAVIGATION TAB BUTTONS (EXACT SAME HEIGHT)  */}
          {/* ========================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 font-pixel text-xs">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = pathname === t.href || (pathname === "/profile" && t.href === "/profile/stats");
              return (
                <Link key={t.href} href={t.href} onClick={() => playUIMenuSFX()} className="w-full">
                  <button
                    type="button"
                    className={`w-full h-11 sm:h-12 flex items-center justify-center gap-2 px-3 py-2 uppercase font-bold transition-none cursor-pointer border-2 active:translate-y-0.5 ${
                      isActive
                        ? "bg-[#331c0e] text-[#fef08a] border-[#180b04] shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
                        : "bg-[#caa97e] text-[#221208] border-[#4a2813] hover:bg-[#dfcaac] shadow-[inset_0_0_8px_rgba(89,59,34,0.3)]"
                    }`}
                  >
                    <span className="font-mono text-[#6d4c3d] font-bold text-sm shrink-0">{t.rune}</span>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#fef08a]" : "text-[#4a2813]"}`} />
                    <span className="truncate">{t.name}</span>
                    {t.badgeText && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 font-mono font-bold shrink-0 border ${
                          isActive
                            ? "bg-amber-400 text-amber-950 border-amber-300"
                            : "bg-[#331c0e] text-[#fef08a] border-[#180b04]"
                        }`}
                      >
                        {t.badgeText}
                      </span>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* EDIT CHARACTER CREDENTIALS MODAL (NAME, GEN, AGE, RAC, CLS) */}
      {/* ========================================================= */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-pixel">
          <div className="konosuba-adventurer-card max-w-md w-full p-5 border-4 border-[#381e10] shadow-[0_16px_36px_rgba(0,0,0,0.9)] space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#522e18] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-800 rotate-45" />
                <h3 className="text-sm font-bold text-[#241208] uppercase tracking-wider">
                  Edit Adventurer Credentials
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 text-[#522e18] hover:text-[#241208] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveCredentials} className="space-y-3 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-[10px] text-[#633a20] uppercase font-bold">
                  Adventurer Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#ebd9b5] border-2 border-[#522e18] text-[#241208] font-bold focus:outline-none focus:border-amber-900"
                  required
                />
              </div>

              {/* Row: Gender & Age */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-[#633a20] uppercase font-bold">
                    Gender (GEN)
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#ebd9b5] border-2 border-[#522e18] text-[#241208] font-bold focus:outline-none focus:border-amber-900"
                  >
                    <option value="M">M (Male)</option>
                    <option value="F">F (Female)</option>
                    <option value="X">X (Other)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-[#633a20] uppercase font-bold">
                    Age (AGE)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={editAge}
                    onChange={(e) => setEditAge(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#ebd9b5] border-2 border-[#522e18] text-[#241208] font-bold focus:outline-none focus:border-amber-900"
                    required
                  />
                </div>
              </div>

              {/* Row: Race & Class */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-[#633a20] uppercase font-bold">
                    Race / Lineage (RAC)
                  </label>
                  <input
                    type="text"
                    value={editRace}
                    onChange={(e) => setEditRace(e.target.value)}
                    placeholder="e.g. HUMAN, GODDESS"
                    className="w-full px-2.5 py-1.5 bg-[#ebd9b5] border-2 border-[#522e18] text-[#241208] font-bold uppercase focus:outline-none focus:border-amber-900"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-[#633a20] uppercase font-bold">
                    Adventurer Class (CLS)
                  </label>
                  <select
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#ebd9b5] border-2 border-[#522e18] text-[#241208] font-bold uppercase focus:outline-none focus:border-amber-900"
                  >
                    {AVAILABLE_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t-2 border-[#522e18] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-[#ebd9b5] border-2 border-[#522e18] text-[#381e10] hover:bg-[#dfba7c] cursor-pointer"
                >
                  Cancel
                </button>

                <PixelButton
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-amber-900" />
                  <span>Save Credentials</span>
                </PixelButton>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* SUB-ROUTE CONTENT CONTAINER */}
      <div>{children}</div>
      </div>
    </div>
  );
}
