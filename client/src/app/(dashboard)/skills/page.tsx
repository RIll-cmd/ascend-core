'use client';

import React, { useEffect, useState } from 'react';
import { useSkillStore } from '@/features/skills/store/useSkillStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { SkillNode } from '@/features/skills/components/SkillNode';
import { SkillDetailModal } from '@/features/skills/components/SkillDetailModal';
import { SkillDefinition } from '@/features/skills/types';
import { playAIRASound, playUIMenuSFX } from '@/utils/audio';
import {
  FireDrakeConstellation,
  StormRocConstellation,
  StoneTitanConstellation,
  SeaLeviathanConstellation,
  SovereignCrownConstellation,
  AllConstellationsCluster,
} from '@/components/ui/pixel';
import { FloatingRunes } from '@/features/skills/components/FloatingRunes';
import { NumberTicker } from '@/components/ui/number-ticker';
import {
  Sparkles,
  Sword,
  TrendingUp,
  Search,
  X,
  CheckCircle2,
  Lock,
  HelpCircle,
  Star,
  BookOpen,
} from 'lucide-react';

interface ElementMeta {
  id: string;
  name: string;
  constellation: string;
  latin: string;
  rune: string;
  icon: any;
  accentColor: string;
  textColor: string;
  borderColor: string;
  starlightGlow: string;
  scalingStats: string;
  tagline: string;
}

const ELEMENT_META: Record<string, ElementMeta> = {
  Flame: {
    id: 'Flame',
    name: 'Flame',
    constellation: 'The Fire Drake',
    latin: 'Ignis Draconis',
    rune: 'ᚠ',
    icon: FireDrakeConstellation,
    accentColor: 'from-amber-500 via-orange-500 to-red-600',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    starlightGlow: 'shadow-md shadow-black/80 ring-1 ring-amber-400/40',
    scalingStats: 'STR & FOC',
    tagline: 'Solar Flare & Kinetic Rupture',
  },
  Tempest: {
    id: 'Tempest',
    name: 'Tempest',
    constellation: 'The Storm Roc',
    latin: 'Avis Tempestatis',
    rune: 'ᛏ',
    icon: StormRocConstellation,
    accentColor: 'from-cyan-400 via-sky-500 to-blue-600',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    starlightGlow: 'shadow-md shadow-black/80 ring-1 ring-cyan-400/40',
    scalingStats: 'FOC & DIS',
    tagline: 'Celestial Gale & Lightning Shear',
  },
  Earth: {
    id: 'Earth',
    name: 'Earth',
    constellation: 'The Stone Titan',
    latin: 'Titan Terran',
    rune: 'ᛖ',
    icon: StoneTitanConstellation,
    accentColor: 'from-yellow-600 via-amber-600 to-stone-700',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-600/40',
    starlightGlow: 'shadow-md shadow-black/80 ring-1 ring-yellow-400/40',
    scalingStats: 'END & DIS',
    tagline: 'Meteoric Aegis & Dense Gravitas',
  },
  Tide: {
    id: 'Tide',
    name: 'Tide',
    constellation: 'The Sea Leviathan',
    latin: 'Leviathan Profundis',
    rune: 'ᛗ',
    icon: SeaLeviathanConstellation,
    accentColor: 'from-blue-500 via-indigo-500 to-teal-500',
    textColor: 'text-sky-400',
    borderColor: 'border-blue-500/40',
    starlightGlow: 'shadow-md shadow-black/80 ring-1 ring-sky-400/40',
    scalingStats: 'KNW & REC',
    tagline: 'Abyssal Current & Crystalline Restoration',
  },
  Ascension: {
    id: 'Ascension',
    name: 'Ascension',
    constellation: 'The Sovereign Crown',
    latin: 'Corona Monarchis',
    rune: 'ᛟ',
    icon: SovereignCrownConstellation,
    accentColor: 'from-purple-500 via-fuchsia-500 to-amber-400',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    starlightGlow: 'shadow-md shadow-black/80 ring-1 ring-purple-400/40',
    scalingStats: 'UNIVERSAL',
    tagline: 'Monarch Zenith & Sovereign Will',
  },
};

export default function SkillsPage() {
  const { definitions, playerSkills, fetchSkills, unlockSkill, loading: skillsLoading } = useSkillStore();
  const { character, loadCharacter } = useCharacterStore();
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [showSPGuide, setShowSPGuide] = useState(false);

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  useEffect(() => {
    if (character?.id) {
      fetchSkills(character.id);
    }
  }, [character?.id, fetchSkills]);

  const checkAvailability = (skill: SkillDefinition) => {
    try {
      const reqs = JSON.parse(skill.statRequirements);
      
      if (reqs.skills) {
        for (const reqSkillId of reqs.skills) {
          if (!playerSkills.find(ps => ps.skillDefinitionId === reqSkillId)) {
            return { available: false, reason: `Missing prerequisite star.` };
          }
        }
      }
      
      if (character && character.stats) {
        const statMap: Record<string, number> = {
          "Strength": character.stats.strength || 1,
          "Knowledge": character.stats.knowledge || 1,
          "Endurance": character.stats.endurance || 1,
          "Recovery": character.stats.recovery || 1,
          "Focus": character.stats.focus || 1,
          "Discipline": character.stats.discipline || 1,
          "Consistency": character.stats.consistency || 1,
        };
        
        for (const [key, val] of Object.entries(reqs)) {
          if (key !== 'skills' && statMap[key] < (val as number)) {
            return { available: false, reason: `Requires ${val} ${key}` };
          }
        }
      }

      if (character && character.availableSP < skill.baseCostSP) {
        return { available: false, reason: `Insufficient Astral Essence (SP).` };
      }

      return { available: true };
    } catch {
      return { available: true };
    }
  };

  const handleUnlock = async () => {
    if (!character || !selectedSkill) return;
    setUnlockLoading(true);
    try {
      await unlockSkill(character.id, selectedSkill.id);
      playAIRASound("NEW_SKILL");
    } catch (e) {
      // Error handled by store toast
    } finally {
      setUnlockLoading(false);
    }
  };

  if (skillsLoading && definitions.length === 0) {
    return (
      <div className="p-12 text-center text-[#d4b277] font-pixel flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-amber-500/40 border-t-amber-300 rounded-none rotate-45 animate-spin mb-4" />
        <span className="text-xs tracking-widest uppercase text-[#fef08a] animate-pulse">
          Aligning Astronomical Astrolabe & Constellations...
        </span>
      </div>
    );
  }

  const elements = ['Flame', 'Tempest', 'Earth', 'Tide', 'Ascension'];
  const totalMastered = playerSkills.length;
  const totalDefinitions = definitions.length;

  const readySkills = definitions.filter(d => !playerSkills.some(ps => ps.skillDefinitionId === d.id) && checkAvailability(d).available);
  const masteredSkills = playerSkills;
  const lockedSkills = definitions.filter(d => !playerSkills.some(ps => ps.skillDefinitionId === d.id) && !checkAvailability(d).available);

  const filterSkill = (skill: SkillDefinition) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = skill.name.toLowerCase().includes(q);
      const matchDesc = (skill.description || '').toLowerCase().includes(q);
      const matchElem = (skill.elementPath || '').toLowerCase().includes(q);
      const matchType = (skill.skillType || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchElem && !matchType) return false;
    }

    if (statusFilter !== 'ALL') {
      const isUnlocked = playerSkills.some(ps => ps.skillDefinitionId === skill.id);
      if (statusFilter === 'UNLOCKED' && !isUnlocked) return false;
      if (statusFilter === 'READY') {
        if (isUnlocked || !checkAvailability(skill).available) return false;
      }
      if (statusFilter === 'LOCKED') {
        if (isUnlocked || checkAvailability(skill).available) return false;
      }
    }

    return true;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-16 font-sans select-none relative">
      {/* ========================================================= */}
      {/* 0. CELESTIAL FLOATING RUNES (MYTHIC ELEMENTAL AURA)       */}
      {/* ========================================================= */}
      <FloatingRunes />

      {/* ========================================================= */}
      {/* 1. CELESTIAL OBSERVATORY & ASTROLABE HERO HEADER         */}
      {/* ========================================================= */}
      <div className="celestial-observatory-panel p-6 relative rounded-none shadow-[4px_4px_0_0_#000]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#fef08a] font-pixel tracking-wide flex items-center gap-2.5">
              <span>Celestial Starchart</span>
            </h1>
            <p className="text-sm text-slate-300 font-sans leading-relaxed max-w-prose">
              Unlock and empower abilities across 5 mythic constellations. Spend your available Skill Points (SP) to activate combat skills, tactical stances, and permanent monarch passives.
            </p>

            <div className="flex items-center gap-6 pt-2 text-xs font-mono text-slate-300 flex-wrap">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Stars Awakened:</span>
                <strong className="text-[#fef08a] font-bold text-sm">
                  <NumberTicker value={totalMastered} />
                </strong>
                <span className="text-slate-400">/ {totalDefinitions}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sword className="w-4 h-4 text-amber-400" />
                <span>Combat Power:</span>
                <strong className="text-[#fef08a] font-bold text-sm">
                  <NumberTicker value={character?.power || 50} /> CP
                </strong>
              </div>
            </div>
          </div>

          {/* ASTROLABE ASTRAL ESSENCE (SP) VAULT - INTERACTIVE POP-GUIDE TRIGGER */}
          <div 
            onClick={() => {
              playUIMenuSFX('confirm');
              setShowSPGuide(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowSPGuide(true);
              }
            }}
            tabIndex={0}
            role="button"
            title="Click for Astral Essence (SP) Guide"
            className="lg:border-l border-[#785a28]/40 lg:pl-8 py-2 flex items-center gap-5 shrink-0 cursor-pointer group/sp transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            {/* Rotating Armillary Rings Gimbal - Pixelated Diamond Astrolabe Gears */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rotate-45 rounded-none border-2 border-[#ca9e54]/70 border-dashed animate-astrolabe-spin group-hover/sp:border-yellow-400 transition-colors" />
              <div className="absolute inset-2 rounded-none border-2 border-cyan-400/50 animate-astrolabe-reverse shadow-[2px_2px_0_0_#000]" />
              <div className="w-9 h-9 rounded-none rotate-45 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center text-slate-950 shadow-[2px_2px_0_0_#000] border-2 border-[#ca9e54] group-hover/sp:brightness-110">
                <Sparkles className="w-5 h-5 -rotate-45 text-slate-950" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase font-mono font-bold text-[#ca9e54] group-hover/sp:text-[#fef08a] transition-colors tracking-wider">
                <span>Available Skill Points</span>
                <HelpCircle className="w-3.5 h-3.5 text-[#ca9e54] group-hover/sp:text-yellow-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-[#fef08a] font-pixel tracking-tight">
                  <NumberTicker value={character?.availableSP || 0} />
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">SP</span>
              </div>
              <span className="block text-xs text-slate-400 font-sans mt-1 group-hover/sp:text-slate-300 transition-colors">
                Gain 1 SP on level-up • Tap for Guide
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs (Brass Astrolabe Dial Selectors) */}
        <div className="flex items-center gap-2.5 mt-6 pt-3 border-t border-[#785a28]/40 overflow-x-auto pb-1 font-sans text-xs custom-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveFilter('ALL');
              playUIMenuSFX('confirm');
            }}
            className={`px-4 py-2 font-semibold tracking-wide flex items-center gap-2 cursor-pointer whitespace-nowrap rounded-none shadow-[2px_2px_0_0_#000] transition-colors ${
              activeFilter === 'ALL'
                ? 'astrolabe-tab-btn-active'
                : 'astrolabe-tab-btn'
            }`}
          >
            <AllConstellationsCluster size={16} className={`w-4 h-4 ${activeFilter === 'ALL' ? 'text-amber-300' : 'text-amber-400/80'}`} />
            <span>All Constellations</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-none font-mono font-bold ${activeFilter === 'ALL' ? 'bg-amber-500/25 text-amber-200' : 'bg-slate-900/90 text-amber-100/70'}`}>
              {totalDefinitions}
            </span>
          </button>

          {elements.map((elem) => {
            const meta = ELEMENT_META[elem];
            const Icon = meta.icon;
            const count = definitions.filter(d => d.elementPath === elem).length;
            const isSelected = activeFilter === elem;

            return (
              <button
                key={elem}
                type="button"
                onClick={() => {
                  setActiveFilter(elem);
                  playUIMenuSFX('confirm');
                }}
                className={`px-4 py-2 font-semibold tracking-wide flex items-center gap-2 cursor-pointer whitespace-nowrap rounded-none shadow-[2px_2px_0_0_#000] transition-colors ${
                  isSelected
                    ? 'astrolabe-tab-btn-active'
                    : 'astrolabe-tab-btn'
                }`}
              >
                <Icon size={16} className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#fef08a] scale-110 drop-shadow-[0_0_4px_rgba(254,240,138,0.7)]' : meta.textColor}`} />
                <span>{meta.constellation}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-none font-mono font-bold ${isSelected ? 'bg-amber-500/25 text-amber-200' : 'bg-slate-900/90 text-amber-100/70'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Search & Status Filtering Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-4 pt-3 border-t border-[#785a28]/40">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ca9e54] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search abilities, elements, or effects..."
              className="w-full bg-[#080d1a] border border-[#785a28]/60 focus:border-[#ca9e54] text-xs font-mono text-[#fef08a] placeholder:text-slate-500 pl-9 pr-8 py-2 rounded-none shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#fef08a] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Badges */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                playUIMenuSFX('confirm');
              }}
              className={`px-2.5 py-1.5 rounded-none border transition-colors cursor-pointer shadow-[1px_1px_0_0_#000] ${
                statusFilter === 'ALL'
                  ? 'bg-amber-950/80 border-amber-400 text-amber-200 font-bold'
                  : 'bg-[#090f1d] border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({definitions.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('READY');
                playUIMenuSFX('confirm');
              }}
              className={`px-2.5 py-1.5 rounded-none border transition-colors cursor-pointer shadow-[1px_1px_0_0_#000] flex items-center gap-1 ${
                statusFilter === 'READY'
                  ? 'bg-yellow-950/80 border-yellow-400 text-yellow-300 font-bold'
                  : 'bg-[#090f1d] border-slate-700 text-slate-400 hover:text-yellow-300'
              }`}
            >
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>Ready ({readySkills.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('UNLOCKED');
                playUIMenuSFX('confirm');
              }}
              className={`px-2.5 py-1.5 rounded-none border transition-colors cursor-pointer shadow-[1px_1px_0_0_#000] flex items-center gap-1 ${
                statusFilter === 'UNLOCKED'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-[#090f1d] border-slate-700 text-slate-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Mastered ({masteredSkills.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('LOCKED');
                playUIMenuSFX('confirm');
              }}
              className={`px-2.5 py-1.5 rounded-none border transition-colors cursor-pointer shadow-[1px_1px_0_0_#000] flex items-center gap-1 ${
                statusFilter === 'LOCKED'
                  ? 'bg-slate-900 border-slate-500 text-slate-200 font-bold'
                  : 'bg-[#090f1d] border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Dormant ({lockedSkills.length})</span>
            </button>
          </div>
        </div>
      </div>


      {/* ========================================================= */}
      {/* 2. CONSTELLATION DISPLAY: DUAL-PANEL FOCUS VS 5-COL GRID */}
      {/* ========================================================= */}
      {activeFilter !== 'ALL' ? (
        /* SINGLE CONSTELLATION SHOWCASE LAYOUT (EXPANSIVE DUAL PANEL) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Constellation Dossier */}
          {(() => {
            const meta = ELEMENT_META[activeFilter] || ELEMENT_META.Ascension;
            const Icon = meta.icon;
            const allElemSkills = definitions.filter(d => d.elementPath === activeFilter);
            const pathSkills = allElemSkills.filter(filterSkill).sort((a, b) => a.tier - b.tier);
            const elemMastered = allElemSkills.filter(s => playerSkills.some(ps => ps.skillDefinitionId === s.id)).length;
            const progressPercent = allElemSkills.length > 0 ? Math.round((elemMastered / allElemSkills.length) * 100) : 0;

            return (
              <div className="celestial-observatory-panel p-6 space-y-5 rounded-none shadow-[3px_3px_0_0_#000]">
                <div className="flex items-center gap-3.5 pb-4 border-b border-[#785a28]/50">
                  <div className={`w-14 h-14 rounded-none border-2 ${meta.borderColor} bg-[#080d1a] flex items-center justify-center shadow-[2px_2px_0_0_#000]`}>
                    <Icon className={`w-7 h-7 ${meta.textColor}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#fef08a] font-heading tracking-wide">
                      {meta.constellation}
                    </h2>
                    <span className="text-xs font-mono text-slate-400 italic">
                      {meta.latin} • {meta.scalingStats}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#ca9e54] tracking-wider block">
                    Celestial Affinity
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {meta.tagline}. Channeling this astral path grants mastery over elemental strikes and passive enhancements.
                  </p>
                </div>

                {/* Progress Card */}
                <div className="bg-[#080d1a] p-4 border border-[#785a28]/40 rounded-none shadow-[2px_2px_0_0_#000] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Constellation Awakening:</span>
                    <span className="text-[#fef08a] font-bold">
                      <NumberTicker value={elemMastered} /> / {allElemSkills.length} Stars ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#020409] border border-[#785a28]/60 overflow-hidden rounded-none">
                    <div
                      className={`h-full w-full bg-gradient-to-r ${meta.accentColor} origin-left transition-transform duration-500 ease-out`}
                      style={{ transform: `scaleX(${progressPercent / 100})` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('ALL');
                    playUIMenuSFX('confirm');
                  }}
                  className="w-full py-2.5 px-4 bg-[#0d1527] border border-[#ca9e54]/60 text-[#fef08a] hover:bg-[#152038] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors rounded-none shadow-[2px_2px_0_0_#000]"
                >
                  <AllConstellationsCluster size={16} className="w-4 h-4 text-amber-400" />
                  <span>View All 5 Constellations</span>
                </button>
              </div>
            );
          })()}

          {/* Right Columns: Spacious Star Grid with Full Details */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(() => {
              const allElemSkills = definitions.filter(d => d.elementPath === activeFilter);
              const pathSkills = allElemSkills.filter(filterSkill).sort((a, b) => a.tier - b.tier);

              if (pathSkills.length === 0) {
                return (
                  <div className="sm:col-span-2 celestial-observatory-panel p-8 text-center flex flex-col items-center justify-center rounded-none shadow-[3px_3px_0_0_#000] space-y-3">
                    <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-[#fef08a] font-pixel">No Stars Found in This Alignment</h3>
                    <p className="text-xs text-slate-300 max-w-sm font-sans">
                      No abilities match your current search query &ldquo;{searchQuery}&rdquo; or status filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                        playUIMenuSFX('confirm');
                      }}
                      className="px-4 py-1.5 bg-[#121c32] hover:bg-[#1a2846] border border-[#ca9e54] text-[#fef08a] text-xs font-mono font-bold uppercase rounded-none shadow-[2px_2px_0_0_#000] cursor-pointer transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                );
              }

              return pathSkills.map((skill) => {
                const pSkill = playerSkills.find(ps => ps.skillDefinitionId === skill.id);
                const { available } = checkAvailability(skill);
                let status: 'locked' | 'available' | 'unlocked' = 'locked';
                if (pSkill) status = 'unlocked';
                else if (available) status = 'available';

                return (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className={`
                      celestial-observatory-panel p-4 flex gap-4 items-start cursor-pointer hover:border-[#facc15] transition-colors rounded-none shadow-[3px_3px_0_0_#000]
                      ${status === 'unlocked' ? 'border-[#ca9e54]' : status === 'available' ? 'border-yellow-400/80 shadow-[3px_3px_0_0_#000] ring-1 ring-yellow-400/40' : 'border-[#334155]/60 opacity-80 hover:opacity-100'}
                    `}
                  >
                    <div className="shrink-0 pt-0.5">
                      <SkillNode
                        skill={skill}
                        playerSkill={pSkill}
                        status={status}
                        onClick={() => setSelectedSkill(skill)}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-[#fef08a] font-heading truncate">
                          {skill.name}
                        </h3>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-none bg-[#080d1a] border border-[#785a28]/60 text-amber-300 font-bold shrink-0">
                          Tier {skill.tier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                        {skill.description}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                        <span className="text-amber-400/90 font-semibold">Cost: {skill.baseCostSP} SP</span>
                        <span className={`font-bold inline-flex items-center gap-1 ${status === 'unlocked' ? 'text-amber-300' : status === 'available' ? 'text-yellow-400' : 'text-slate-400'}`}>
                          {status === 'unlocked' ? (
                            <>
                              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                              <span>Mastered Lv.{pSkill?.currentLevel}</span>
                            </>
                          ) : status === 'available' ? (
                            <>
                              <Sparkles className="w-3 h-3 text-yellow-400" />
                              <span>Ready to Awaken</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-slate-500" />
                              <span>Locked</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      ) : (
        /* ALL CONSTELLATIONS 5-COLUMN OVERVIEW GRID */
        <div>
          {definitions.filter(filterSkill).length === 0 ? (
            <div className="celestial-observatory-panel p-10 text-center flex flex-col items-center justify-center rounded-none shadow-[4px_4px_0_0_#000] space-y-3">
              <Sparkles className="w-10 h-10 text-amber-400 animate-pulse" />
              <h3 className="text-base font-bold text-[#fef08a] font-pixel">No Stars Align With Your Filters</h3>
              <p className="text-xs text-slate-300 max-w-md font-sans">
                No celestial abilities match your search query &ldquo;{searchQuery}&rdquo; or current filter settings.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  playUIMenuSFX('confirm');
                }}
                className="px-5 py-2 bg-[#121c32] hover:bg-[#1a2846] border-2 border-[#ca9e54] text-[#fef08a] text-xs font-mono font-bold uppercase rounded-none shadow-[2px_2px_0_0_#000] cursor-pointer transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-start">
              {elements.map((elem) => {
                const meta = ELEMENT_META[elem] || ELEMENT_META.Ascension;
                const Icon = meta.icon;
                const allPathSkills = definitions.filter(d => d.elementPath === elem);
                const pathSkills = allPathSkills.filter(filterSkill).sort((a, b) => a.tier - b.tier);
                
                if (allPathSkills.length === 0) return null;

                const elemMastered = allPathSkills.filter(s => playerSkills.some(ps => ps.skillDefinitionId === s.id)).length;
                const progressPercent = allPathSkills.length > 0 ? Math.round((elemMastered / allPathSkills.length) * 100) : 0;

                return (
                  <div
                    key={elem}
                    className="celestial-observatory-panel p-4 flex flex-col items-center relative rounded-none shadow-[3px_3px_0_0_#000]"
                  >
                    {/* Constellation Chamber Header Banner */}
                    <div className="w-full text-center pb-3 border-b border-[#785a28]/50 mb-5 relative">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <Icon className={`w-4 h-4 ${meta.textColor}`} />
                        <h2 className="text-sm font-bold text-[#fef08a] font-heading tracking-wide">
                          {meta.constellation}
                        </h2>
                      </div>
                      <span className="block text-[11px] font-mono text-slate-400 italic tracking-wider mb-1.5">
                        {meta.latin}
                      </span>

                      <div className="flex items-center justify-between text-[11px] text-[#ca9e54] px-1 font-mono">
                        <span className="bg-[#0a0f1d] px-1.5 py-0.5 rounded-none border border-[#785a28]/40 text-amber-300 font-semibold">{meta.scalingStats}</span>
                        <span className="text-[#fef08a] font-bold">
                          <NumberTicker value={elemMastered} />/{allPathSkills.length} Awakened
                        </span>
                      </div>

                      {/* Starlight Progress Bar */}
                      <div className="w-full h-1.5 bg-[#080d1a] border border-[#785a28]/60 mt-2.5 overflow-hidden rounded-none shadow-[1px_1px_0_0_#000]">
                        <div
                          className={`h-full w-full bg-gradient-to-r ${meta.accentColor} origin-left transition-transform duration-500 ease-out`}
                          style={{ transform: `scaleX(${progressPercent / 100})` }}
                        />
                      </div>
                    </div>
                    
                    {/* Star Nodes Vertical Pathway */}
                    {pathSkills.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-[11px] font-mono">
                        No stars match filter
                      </div>
                    ) : (
                      <div className="flex flex-col items-center w-full relative space-y-4">
                        {pathSkills.map((skill, index) => {
                          const pSkill = playerSkills.find(ps => ps.skillDefinitionId === skill.id);
                          const { available } = checkAvailability(skill);
                          let status: 'locked' | 'available' | 'unlocked' = 'locked';
                          
                          if (pSkill) status = 'unlocked';
                          else if (available) status = 'available';

                          const isLast = index === pathSkills.length - 1;
                          const isNodeUnlocked = status === 'unlocked';

                          return (
                            <React.Fragment key={skill.id}>
                              <SkillNode
                                skill={skill}
                                playerSkill={pSkill}
                                status={status}
                                onClick={() => setSelectedSkill(skill)}
                              />

                              {/* Constellation Starlight Filament Connection Line */}
                              {!isLast && (
                                <div className="h-5 flex items-center justify-center my-0.5">
                                  <div
                                    className={`w-1 h-full transition-colors duration-700 ${
                                      isNodeUnlocked
                                        ? 'bg-gradient-to-b from-amber-300 to-yellow-500 animate-constellation-beam'
                                        : 'bg-[#1e293b] border-x border-[#334155]/40'
                                    }`}
                                  />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. SKILL DETAIL MODAL WITH DEEP-LINKING */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          allSkills={definitions}
          playerSkill={playerSkills.find(ps => ps.skillDefinitionId === selectedSkill.id)}
          available={checkAvailability(selectedSkill).available}
          unmetReason={checkAvailability(selectedSkill).reason}
          onClose={() => setSelectedSkill(null)}
          onUnlock={handleUnlock}
          onSelectSkill={(s) => {
            setSelectedSkill(s);
            if (s.elementPath && activeFilter !== 'ALL' && activeFilter !== s.elementPath) {
              setActiveFilter(s.elementPath);
            }
          }}
          loading={unlockLoading}
        />
      )}

      {/* 4. ASTRAL ESSENCE (SP) ASTROLABE GUIDE MODAL */}
      {showSPGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              playUIMenuSFX('decline');
              setShowSPGuide(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#070c18]/98 border-4 border-[#ca9e54] shadow-[8px_8px_0_0_#000] max-w-md w-full overflow-hidden text-[#e2e8f0] relative rounded-none">
            <div className="w-full bg-[#0d1424] border-b border-[#785a28]/60 text-[#ca9e54] text-[11px] font-mono px-3 py-1 flex items-center justify-between tracking-wider">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#ca9e54]" />
                <span>OBSERVATORY CHRONICLES • ASTRAL ESSENCE CODEX</span>
              </span>
              <span className="text-[#fef08a]">SP GUIDE</span>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rotate-45 border-2 border-[#ca9e54] bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-slate-950 shadow-[2px_2px_0_0_#000] shrink-0">
                  <Sparkles className="w-6 h-6 -rotate-45" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#fef08a] font-pixel">Astral Essence (SP)</h3>
                  <p className="text-xs text-slate-300 font-sans">
                    Skill Points represent concentrated astral power used to awaken and empower constellation stars.
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-[#090f1d] border border-[#785a28]/50 p-3 rounded-none shadow-[2px_2px_0_0_#000] text-xs font-mono">
                <span className="text-[11px] font-bold text-[#ca9e54] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#ca9e54]" />
                  <span>How to Attain Astral Essence:</span>
                </span>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-none bg-amber-400 inline-block shadow-[1px_1px_0_0_#000] shrink-0 mt-1" />
                    <span><strong>Character Level-Ups:</strong> Earn 1 SP automatically every time you level up from workouts, habits, and focus sessions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-none bg-cyan-400 inline-block shadow-[1px_1px_0_0_#000] shrink-0 mt-1" />
                    <span><strong>Tower of Ascension:</strong> Conquering milestone floors unlocks concentrated astral crystals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-none bg-yellow-400 inline-block shadow-[1px_1px_0_0_#000] shrink-0 mt-1" />
                    <span><strong>Boss PR Encounters:</strong> Shattering personal records and triumphing over Raid Bosses grants ancient essences.</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between bg-[#0c1424] border border-[#785a28]/40 p-3 rounded-none">
                <span className="text-xs font-mono text-slate-300">Your Current Astral Essence:</span>
                <span className="text-sm font-bold font-mono text-[#fef08a]">
                  <NumberTicker value={character?.availableSP || 0} /> SP Available
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    playUIMenuSFX('confirm');
                    setShowSPGuide(false);
                  }}
                  className="px-5 py-2 bg-[#121c32] hover:bg-[#1c2c4e] border-2 border-[#ca9e54] text-[#fef08a] text-xs font-mono font-bold uppercase tracking-wider rounded-none shadow-[2px_2px_0_0_#000] transition-colors cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
