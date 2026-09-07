"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
    const defaultCats = ["ALL", "Health", "Fitness", "Productivity", "Learning", "Mindset", "Finance", "Daily Routine"];
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

  const charId = character?.id || (typeof window !== "undefined" ? localStorage.getItem("ascend_character_id") : null) || "char-id-123";

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower === "all") return <PixelCompassIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("health")) return <PixelPotionIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("fitness")) return <PixelCrossedSwordsIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("productivity")) return <PixelQuillIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("learning") || lower.includes("education")) return <PixelBookIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("mindset") || lower.includes("spirit")) return <PixelLotusIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("finance") || lower.includes("wealth")) return <PixelCoinPouchIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("daily") || lower.includes("routine")) return <PixelSunriseIcon className="w-3.5 h-3.5 shrink-0" />;
    if (lower.includes("sleep")) return <PixelMoonSleepIcon className="w-3.5 h-3.5 shrink-0" />;
    return <PixelScrollIcon className="w-3.5 h-3.5 shrink-0" />;
  };

  return (
    <div className="space-y-5 pb-12 font-pixel select-none animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* 🏔️ 1. HERO: HABITS & DAILY ROUTINES                       */}
      {/* ========================================================= */}
      <div className="bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-3 border-[#3b424c] shadow-[4px_4px_0_0_#1d2d2a] p-5 md:p-6 relative overflow-hidden text-[#1d2d2a]">
        
        {/* Stone Masonry Corner Brackets */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-[#3b424c] pointer-events-none" />
        <div className="absolute top-1 right-1 w-2 h-2 bg-[#3b424c] pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-2 h-2 bg-[#3b424c] pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-[#3b424c] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Habit Grimoire Tome Icon Slot */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#2f3640] border-2 border-[#1d2d2a] flex items-center justify-center text-[#ffb03a] shadow-[inset_0_0_8px_rgba(0,0,0,0.8),2px_2px_0_0_#1d2d2a] shrink-0">
              <PixelGrimoireIcon className="w-7 h-7 text-[#ffb03a]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#ffb03a] rotate-45 border border-[#1d2d2a]" />
                <h1 className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider text-[#1d2d2a]">
                  Habits & Daily Routines
                </h1>
              </div>
              <p className="text-[11px] text-[#2a2b2e] max-w-xl leading-relaxed font-mono font-medium">
                Build daily consistency, conquer milestones, and earn character EXP, Gold, and Stat boosts with every completed routine.
              </p>
            </div>
          </div>

          <Link href="/habits/create" onClick={() => playUIMenuSFX("confirm")}>
            <button
              type="button"
              className="px-4 py-2.5 bg-[#ffb03a] hover:bg-[#ffd166] text-[#1d2d2a] font-pixel font-bold text-xs border-2 border-[#1d2d2a] shadow-[3px_3px_0_0_#1d2d2a] active:translate-y-0.5 cursor-pointer flex items-center gap-2 shrink-0 transition-all focus-visible:ring-2 focus-visible:ring-[#ffb03a]"
            >
              <PixelPlusIcon className="w-4 h-4 text-[#1d2d2a]" />
              <span>Create New Habit</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📜 2. TELEMETRY DECK: 4 PILLARS OF DISCIPLINE (SLATE)     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Active Habits Card */}
        <div className="p-3.5 bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-3 border-[#3b424c] shadow-[4px_4px_0_0_#1d2d2a] flex flex-col justify-between space-y-2 text-[#1d2d2a]">
          <div className="flex items-center justify-between border-b-2 border-[#3b424c]/20 pb-1.5">
            <span className="text-[11px] uppercase font-bold text-[#3b424c] tracking-wider">
              Active Habits
            </span>
            <div className="w-7 h-7 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] flex items-center justify-center shadow-inner">
              <PixelScrollIcon className="w-4 h-4 text-[#ffd166]" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#1d2d2a] tabular-nums font-mono"><NumberTicker value={activeHabits.length} /></span>
            <span className="text-[10px] text-[#5a6472] font-bold block mt-0.5 uppercase font-mono">Active daily routines</span>
          </div>
        </div>

        {/* Habit Strength (Avg Strength) Card */}
        <div className="p-3.5 bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-3 border-[#3b424c] shadow-[4px_4px_0_0_#1d2d2a] flex flex-col justify-between space-y-2 text-[#1d2d2a]">
          <div className="flex items-center justify-between border-b-2 border-[#3b424c]/20 pb-1.5">
            <span className="text-[11px] uppercase font-bold text-[#3b424c] tracking-wider">
              Habit Strength
            </span>
            <div className="w-7 h-7 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] flex items-center justify-center shadow-inner">
              <PixelAnvilIcon className="w-4 h-4 text-[#ffb03a]" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-bold text-[#ea580c] tabular-nums font-mono"><NumberTicker value={averageStrength} />%</span>
            <div className="w-full h-2.5 bg-[#2f3640] border border-[#1d2d2a] p-0.5 overflow-hidden">
              <div
                className="h-full bg-[linear-gradient(90deg,#ea580c_0%,#ffb03a_60%,#ffd166_100%)] transition-all duration-200"
                style={{ width: `${averageStrength}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Streaks Card */}
        <div className="p-3.5 bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-3 border-[#3b424c] shadow-[4px_4px_0_0_#1d2d2a] flex flex-col justify-between space-y-2 text-[#1d2d2a]">
          <div className="flex items-center justify-between border-b-2 border-[#3b424c]/20 pb-1.5">
            <span className="text-[11px] uppercase font-bold text-[#3b424c] tracking-wider">
              Combined Streaks
            </span>
            <div className="w-7 h-7 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] flex items-center justify-center shadow-inner">
              <PixelCampfireIcon className="w-4 h-4 text-[#ffb03a]" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#ea580c] tabular-nums font-mono"><NumberTicker value={totalStreaks} />d</span>
            <span className="text-[10px] text-[#5a6472] font-bold block mt-0.5 uppercase font-mono">Total cumulative days</span>
          </div>
        </div>

        {/* Consistency Rating Card */}
        <div className="p-3.5 bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-3 border-[#3b424c] shadow-[4px_4px_0_0_#1d2d2a] flex flex-col justify-between space-y-2 text-[#1d2d2a]">
          <div className="flex items-center justify-between border-b-2 border-[#3b424c]/20 pb-1.5">
            <span className="text-[11px] uppercase font-bold text-[#3b424c] tracking-wider">
              Consistency Index
            </span>
            <div className="w-7 h-7 bg-[#2f3640] text-[#ffd166] border border-[#1d2d2a] flex items-center justify-center shadow-inner">
              <PixelHourglassIcon className="w-4 h-4 text-[#ffd166]" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#1d2d2a] tabular-nums font-mono"><NumberTicker value={averageConsistency} />%</span>
            <span className="text-[10px] text-[#5a6472] font-bold block mt-0.5 uppercase font-mono">Routine adherence rating</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🔍 3. SEARCH & CATEGORY FILTER TOOLBAR                    */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#2f3640] border-3 border-[#3b424c] p-3 shadow-[4px_4px_0_0_#1d2d2a]">
        {/* Search Input Inset */}
        <div className="relative flex-1">
          <PixelSearchIcon className="w-4 h-4 text-[#5a6472] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search habits by name, stat, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#e2e7ec] border-2 border-[#1d2d2a] focus:border-[#ffb03a] pl-9 pr-3 py-2 text-xs text-[#1d2d2a] placeholder-[#5a6472] focus:outline-none font-mono font-bold shadow-[inset_0_0_6px_rgba(0,0,0,0.15)]"
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
                className={`px-2.5 py-1.5 font-pixel font-bold text-xs uppercase border-2 border-[#1d2d2a] transition-all active:translate-y-0.5 cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#ffb03a] text-[#1d2d2a] shadow-[2px_2px_0_0_#111a18]"
                    : "bg-[#1f242b] text-[#b0b8c4] hover:border-[#ffb03a]/60 hover:text-white"
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
        <div className="text-center py-16 bg-[#2f3640] border-3 border-[#3b424c] p-6 shadow-[4px_4px_0_0_#1d2d2a]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#ffb03a] border-t-transparent mb-3" />
          <p className="text-[#d1d6dc] text-xs uppercase font-bold font-mono">Loading Habits...</p>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="bg-[#d1d6dc] bg-[linear-gradient(180deg,#e2e7ec_0%,#d1d6dc_50%,#b0b8c4_100%)] border-4 border-dashed border-[#3b424c] p-8 text-center flex flex-col items-center justify-center space-y-3 text-[#1d2d2a] shadow-[4px_4px_0_0_#1d2d2a]">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="w-12 h-12 bg-[#2f3640] text-[#ffd166] border-2 border-[#1d2d2a] flex items-center justify-center shadow-[2px_2px_0_0_#1d2d2a] shrink-0">
              <PixelOpenGrimoireIcon className="w-7 h-7 text-[#ffb03a]" />
            </div>
            <h2 className="text-sm sm:text-base font-bold uppercase text-[#1d2d2a]">
              No Active Habits Found
            </h2>
          </div>
          <p className="text-xs text-[#2a2b2e] max-w-md font-mono font-medium leading-relaxed">
            {searchQuery
              ? "No habits matched your search criteria. Try modifying your search query or selecting a different category."
              : "You have no active habits yet. Create your first daily habit to start building momentum and earning character progression."}
          </p>
          <Link href="/habits/create" onClick={() => playUIMenuSFX("confirm")}>
            <button
              type="button"
              className="px-4 py-2 bg-[#ffb03a] hover:bg-[#ffd166] text-[#1d2d2a] font-pixel font-bold text-xs border-2 border-[#1d2d2a] shadow-[3px_3px_0_0_#1d2d2a] active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 mt-2 transition-all focus-visible:ring-2 focus-visible:ring-[#ffb03a]"
            >
              <PixelPlusIcon className="w-3.5 h-3.5 text-[#1d2d2a]" />
              <span>Create Your First Habit</span>
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
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

