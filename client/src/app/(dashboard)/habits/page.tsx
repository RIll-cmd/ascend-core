"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useHabitStore } from "@/features/habits/store/useHabitStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { HabitCard } from "@/features/habits/components";
import { HabitHeatmap } from "@/features/habits/components/HabitHeatmap";
import {
  PixelPlusIcon,
  PixelSearchIcon,
  PixelGrimoireIcon,
  PixelAnvilIcon,
  PixelScrollIcon,
  PixelCampfireIcon,
  PixelHourglassIcon,
  PixelOpenGrimoireIcon,
  PixelCompassIcon,
  PixelPotionIcon,
  PixelCrossedSwordsIcon,
  PixelQuillIcon,
  PixelBookIcon,
  PixelLotusIcon,
  PixelCoinPouchIcon,
  PixelSunriseIcon,
  PixelMoonSleepIcon,
} from "@/components/ui/pixel/PixelIcons";
import { NumberTicker } from "@/components/ui/number-ticker";
import { playUIMenuSFX } from "@/utils/audio";

export default function HabitsDashboardPage() {
  const { habits, isLoading, loadHabits } = useHabitStore();
  const { character } = useCharacterStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const activeHabits = useMemo(
    () => habits.filter((h) => h.status === "ACTIVE"),
    [habits]
  );

  const averageStrength = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    const sum = activeHabits.reduce(
      (acc, h) => acc + (h.metrics?.habitStrength || 0),
      0
    );
    return Math.round(sum / activeHabits.length);
  }, [activeHabits]);

  const totalStreaks = useMemo(() => {
    return activeHabits.reduce(
      (acc, h) => acc + (h.metrics?.currentStreak || 0),
      0
    );
  }, [activeHabits]);

  const averageConsistency = useMemo(() => {
    if (activeHabits.length === 0) return 100;
    const sum = activeHabits.reduce(
      (acc, h) => acc + (h.metrics?.currentConsistency || 100),
      0
    );
    return Math.round(sum / activeHabits.length);
  }, [activeHabits]);

  const categories = useMemo(() => {
    const defaultCats = [
      "ALL",
      "Health",
      "Fitness",
      "Productivity",
      "Learning",
      "Mindset",
      "Finance",
      "Daily Routine",
    ];
    const cats = new Set<string>(defaultCats);
    habits.forEach((h) => {
      if (h.category) cats.add(h.category);
    });
    return Array.from(cats);
  }, [habits]);

  const filteredHabits = useMemo(() => {
    return activeHabits.filter((h) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.description &&
          h.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (h.category &&
          h.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "ALL" ||
        (h.category &&
          h.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [activeHabits, searchQuery, selectedCategory]);

  const charId =
    character?.id ||
    (typeof window !== "undefined"
      ? localStorage.getItem("ascend_character_id")
      : null) ||
    "char-id-123";

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower === "all") return <PixelCompassIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("health")) return <PixelPotionIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("fitness")) return <PixelCrossedSwordsIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("productivity")) return <PixelQuillIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("learning") || lower.includes("education"))
      return <PixelBookIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("mindset") || lower.includes("spirit"))
      return <PixelLotusIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("finance") || lower.includes("wealth"))
      return <PixelCoinPouchIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("daily") || lower.includes("routine"))
      return <PixelSunriseIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("sleep")) return <PixelMoonSleepIcon className="w-3.5 h-3.5 shrink-0" />;
    return <PixelScrollIcon className="w-3.5 h-3.5 shrink-0" />;
  };

  return (
    <div className="space-y-5 pb-14 font-pixel select-none animate-in fade-in duration-200">
      {/* ========================================================= */}
      {/* ⛩️ 1. HERO: KYOTO DUSK SANCTUARY - DAILY RITUALS          */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden backdrop-blur-md bg-[linear-gradient(180deg,rgba(32,18,22,0.92)_0%,rgba(20,11,14,0.96)_100%)] border-2 border-[#e05344]/40 shadow-[4px_4px_0_0_#140b0e] p-5 md:p-6 text-[#fdf2e9]">
        {/* Shoji Lattice Corner Brackets */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-[#fba170] pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[#fba170] pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[#fba170] pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-[#fba170] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Shrine Torii Sanctuary Icon Slot */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1c1114] border-2 border-[#e05344]/50 flex items-center justify-center shadow-[inset_0_0_12px_rgba(0,0,0,0.8),2px_2px_0_0_#140b0e] shrink-0 p-2">
              <PixelGrimoireIcon className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#e05344] rotate-45 border border-[#fba170]" />
                <h1 className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider text-[#fdf2e9]">
                  Daily Rituals & Disciplines
                </h1>
              </div>
              <p className="text-[11px] text-[#c4b5a5] max-w-xl leading-relaxed font-mono font-medium">
                Nurture unbroken daily consistency, fulfill sacred disciplines, and channel character EXP, Gold, and Stat blessings with every completed routine.
              </p>
            </div>
          </div>

          <Link href="/habits/create" onClick={() => playUIMenuSFX("confirm")}>
            <button
              type="button"
              className="px-4 py-2.5 bg-[#e05344] hover:bg-[#ef4444] text-white font-pixel font-bold text-xs border border-[#821e14] shadow-[3px_3px_0_0_#47110c] active:translate-y-0.5 cursor-pointer flex items-center gap-2 shrink-0 transition-all focus-visible:ring-2 focus-visible:ring-[#fba170]"
            >
              <PixelPlusIcon className="w-4 h-4 text-white" />
              <span>Forge New Ritual</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📜 2. TELEMETRY DECK: 4 PILLARS OF DISCIPLINE (SHOJI)     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Rituals Card */}
        <div className="p-3.5 backdrop-blur-md bg-[linear-gradient(180deg,rgba(32,20,23,0.88)_0%,rgba(20,13,16,0.95)_100%)] border border-[#e05344]/30 shadow-[3px_3px_0_0_#140b0e] flex flex-col justify-between space-y-2 text-[#fdf2e9] hover:border-[#fba170]/60 transition-colors">
          <div className="flex items-center justify-between border-b border-[#e05344]/20 pb-1.5">
            <span className="text-[11px] uppercase font-bold text-[#c4b5a5] tracking-wider">
              Active Rituals
            </span>
            <div className="w-7 h-7 bg-[#1c1114] text-[#ffd166] border border-[#e05344]/40 flex items-center justify-center shadow-inner">
              <PixelScrollIcon className="w-4 h-4 text-[#ffd166]" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#fdf2e9] tabular-nums font-mono">
              <NumberTicker value={activeHabits.length} />
            </span>
            <span className="text-[10px] text-[#8c7b7d] font-bold block mt-0.5 uppercase font-mono">
              Active daily routines
            </span>
          </div>
        </div>

        {/* Habit Strength (Mastery Depth) Card */}
        <div className="p-3.5 backdrop-blur-md bg-[linear-gradient(180deg,rgba(32,20,23,0.88)_0%,rgba(20,13,16,0.95)_100%)] border border-[#e05344]/30 shadow-[3px_3px_0_0_#140b0e] flex flex-col justify-between space-y-2 text-[#fdf2e9] hover:border-[#fba170]/60 transition-colors">
          <div className="flex items-center justify-between border-b border-[#e05344]/20 pb-1.5">
            <span className="text-[11px] uppercase font-bold text-[#c4b5a5] tracking-wider">
              Mastery Depth
            </span>
            <div className="w-7 h-7 bg-[#1c1114] text-[#fba170] border border-[#e05344]/40 flex items-center justify-center shadow-inner">
              <PixelAnvilIcon className="w-4 h-4 text-[#fba170]" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-bold text-[#fba170] tabular-nums font-mono">
              <NumberTicker value={averageStrength} />%
            </span>
            <div className="w-full h-2 bg-[#120a0d] border border-[#2e181c] p-0.5 overflow-hidden">
              <div
                className="h-full bg-[linear-gradient(90deg,#e05344_0%,#fba170_60%,#f472b6_100%)] shadow-[0_0_6px_rgba(224,83,68,0.7)] transition-all duration-300"
                style={{ width: `${averageStrength}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sacred Flame Streaks Card */}
        <div className="p-3.5 backdrop-blur-md bg-[linear-gradient(180deg,rgba(32,20,23,0.88)_0%,rgba(20,13,16,0.95)_100%)] border border-[#e05344]/30 shadow-[3px_3px_0_0_#140b0e] flex flex-col justify-between space-y-2 text-[#fdf2e9] hover:border-[#fba170]/60 transition-colors">
          <div className="flex items-center justify-between border-b border-[#e05344]/20 pb-1.5">
            <span className="text-[11px] uppercase font-bold text-[#c4b5a5] tracking-wider">
              Sacred Flame
            </span>
            <div className="w-7 h-7 bg-[#1c1114] text-[#fba170] border border-[#e05344]/40 flex items-center justify-center shadow-inner">
              <PixelCampfireIcon className="w-4 h-4 text-[#fba170]" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#fba170] tabular-nums font-mono">
              <NumberTicker value={totalStreaks} />d
            </span>
            <span className="text-[10px] text-[#8c7b7d] font-bold block mt-0.5 uppercase font-mono">
              Total cumulative days
            </span>
          </div>
        </div>

        {/* Consistency Index Card */}
        <div className="p-3.5 backdrop-blur-md bg-[linear-gradient(180deg,rgba(32,20,23,0.88)_0%,rgba(20,13,16,0.95)_100%)] border border-[#e05344]/30 shadow-[3px_3px_0_0_#140b0e] flex flex-col justify-between space-y-2 text-[#fdf2e9] hover:border-[#fba170]/60 transition-colors">
          <div className="flex items-center justify-between border-b border-[#e05344]/20 pb-1.5">
            <span className="text-[11px] uppercase font-bold text-[#c4b5a5] tracking-wider">
              Zen Adherence
            </span>
            <div className="w-7 h-7 bg-[#1c1114] text-[#34d399] border border-[#e05344]/40 flex items-center justify-center shadow-inner">
              <PixelHourglassIcon className="w-4 h-4 text-[#34d399]" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#34d399] tabular-nums font-mono">
              <NumberTicker value={averageConsistency} />%
            </span>
            <span className="text-[10px] text-[#8c7b7d] font-bold block mt-0.5 uppercase font-mono">
              Routine adherence rating
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🔍 3. SEARCH & CATEGORY FILTER TOOLBAR (SHOJI LATTICE)    */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 backdrop-blur-md bg-[linear-gradient(180deg,rgba(30,18,21,0.88)_0%,rgba(20,12,14,0.95)_100%)] border border-[#e05344]/30 p-3 shadow-[3px_3px_0_0_#140b0e]">
        {/* Search Input Inset */}
        <div className="relative flex-1">
          <PixelSearchIcon className="w-4 h-4 text-[#8c7b7d] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search rituals by name, stat, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#170e10] border border-[#e05344]/30 focus:border-[#fba170] pl-9 pr-3 py-2 text-xs text-[#fdf2e9] placeholder-[#8c7b7d] focus:outline-none font-mono font-bold shadow-[inset_0_0_8px_rgba(0,0,0,0.5)] transition-colors"
          />
        </div>

        {/* Category Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playUIMenuSFX();
                  setSelectedCategory(cat);
                }}
                className={`px-2.5 py-1.5 font-pixel font-bold text-xs uppercase border transition-all active:translate-y-0.5 cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#e05344] text-white border-[#821e14] shadow-[2px_2px_0_0_#47110c]"
                    : "bg-[#1c1114] text-[#c4b5a5] border-[#382025] hover:border-[#e05344]/60 hover:text-white"
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ⚔️ 4. ACTIVE HABITS GRID / EMPTY STATE                    */}
      {/* ========================================================= */}
      {isLoading ? (
        <div className="text-center py-16 backdrop-blur-md bg-[#1f1416]/80 border border-[#e05344]/30 p-6 shadow-[3px_3px_0_0_#140b0e]">
          <div className="inline-block animate-spin w-8 h-8 border-3 border-[#fba170] border-t-transparent mb-3" />
          <p className="text-[#c4b5a5] text-xs uppercase font-bold font-mono">
            Loading Sacred Disciplines...
          </p>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="backdrop-blur-md bg-[linear-gradient(180deg,rgba(30,18,21,0.88)_0%,rgba(20,12,14,0.95)_100%)] border-2 border-dashed border-[#e05344]/40 p-8 text-center flex flex-col items-center justify-center space-y-3 text-[#fdf2e9] shadow-[3px_3px_0_0_#140b0e]">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="w-12 h-12 bg-[#1c1114] text-[#fba170] border border-[#e05344]/40 flex items-center justify-center shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] shrink-0">
              <PixelOpenGrimoireIcon className="w-7 h-7 text-[#fba170]" />
            </div>
            <h2 className="text-sm sm:text-base font-bold uppercase text-[#fdf2e9]">
              No Sacred Disciplines Found
            </h2>
          </div>
          <p className="text-xs text-[#c4b5a5] max-w-md font-mono font-medium leading-relaxed">
            {searchQuery
              ? "No rituals matched your search query. Try changing terms or choosing another category."
              : "The sanctuary awaits your first commitment. Forge your first daily discipline to unlock character progression, stats, and sacred rewards."}
          </p>
          <Link href="/habits/create" onClick={() => playUIMenuSFX("confirm")}>
            <button
              type="button"
              className="px-4 py-2 bg-[#e05344] hover:bg-[#ef4444] text-white font-pixel font-bold text-xs border border-[#821e14] shadow-[2px_2px_0_0_#47110c] active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 mt-2 transition-all focus-visible:ring-2 focus-visible:ring-[#fba170]"
            >
              <PixelPlusIcon className="w-3.5 h-3.5 text-white" />
              <span>Forge Your First Ritual</span>
            </button>
          </Link>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredHabits.map((habit) => (
            <motion.div
              key={habit.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <HabitCard habit={habit} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 🌌 5. 365-DAY COMPLETION HEATMAP                          */}
      {/* ========================================================= */}
      <div className="mt-6">
        <HabitHeatmap characterId={charId} />
      </div>
    </div>
  );
}
