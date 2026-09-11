"use client";

import React, { useEffect, useState } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { API_BASE_URL } from "@/constants";
import {
  Sparkles,
  CheckCircle2,
  Target,
  Lock,
  Check,
  Flame,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  playUIMenuSFX,
  playBuffSFX,
  playAIRASound,
  playBattleSFX,
} from "@/utils/audio";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { ACHIEVEMENT_LORE } from "@/features/lore/loreData";
import {
  PixelShadowSanctuaryBackground,
  ShadowMonarchSigil,
  AllConstellationsCluster,
  StormRocConstellation,
  StoneTitanConstellation,
  FireDrakeConstellation,
  SovereignCrownConstellation,
} from "@/components/ui/pixel";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CoolMode } from "@/components/ui/cool-mode";
import { Particles } from "@/components/ui/particles";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  targetValue: number;
  currentProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  rewardGold: number;
  rewardGems: number;
  unlockRequirement?: string;
}

const CATEGORIES = ["ALL", "HABITS", "WORKOUT", "TOWER", "SOCIAL"] as const;
type CategoryType = typeof CATEGORIES[number];
type StatusFilter = "ALL" | "OBTAINED" | "NOT_OBTAINED";

const FALLBACK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    title: "First Step of Greatness",
    description: "Complete your first daily habit mission.",
    category: "HABITS",
    icon: "/achievements_icons/sliced/ach_icon_1.png",
    targetValue: 1,
    currentProgress: 1,
    isCompleted: true,
    isClaimed: true,
    rewardGold: 100,
    rewardGems: 10,
    unlockRequirement: "Complete 1 daily habit mission",
  },
  {
    id: "ach-2",
    title: "Unbroken Streak",
    description: "Maintain a 7-day habit streak.",
    category: "HABITS",
    icon: "/achievements_icons/sliced/ach_icon_2.png",
    targetValue: 7,
    currentProgress: 3,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 250,
    rewardGems: 25,
    unlockRequirement: "Maintain a 7-day habit streak",
  },
  {
    id: "ach-3",
    title: "Consistency Sovereign",
    description: "Complete 50 daily habit missions.",
    category: "HABITS",
    icon: "/achievements_icons/sliced/ach_icon_3.png",
    targetValue: 50,
    currentProgress: 12,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 500,
    rewardGems: 50,
    unlockRequirement: "Complete 50 daily habit missions",
  },
  {
    id: "ach-4",
    title: "Iron Will",
    description: "Maintain a 30-day habit streak.",
    category: "HABITS",
    icon: "/achievements_icons/sliced/ach_icon_4.png",
    targetValue: 30,
    currentProgress: 3,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 1000,
    rewardGems: 100,
    unlockRequirement: "Maintain a 30-day habit streak",
  },
  {
    id: "ach-5",
    title: "Novice Lifter",
    description: "Complete 1 workout session.",
    category: "WORKOUT",
    icon: "/achievements_icons/sliced/ach_icon_5.png",
    targetValue: 1,
    currentProgress: 1,
    isCompleted: true,
    isClaimed: true,
    rewardGold: 100,
    rewardGems: 10,
    unlockRequirement: "Log 1 workout session",
  },
  {
    id: "ach-6",
    title: "Strength Unleashed",
    description: "Log 10 workout sessions.",
    category: "WORKOUT",
    icon: "/achievements_icons/sliced/ach_icon_6.png",
    targetValue: 10,
    currentProgress: 4,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 300,
    rewardGems: 30,
    unlockRequirement: "Log 10 workout sessions",
  },
  {
    id: "ach-7",
    title: "Barbell Master",
    description: "Log 25 workout sessions.",
    category: "WORKOUT",
    icon: "/achievements_icons/sliced/ach_icon_7.png",
    targetValue: 25,
    currentProgress: 4,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 750,
    rewardGems: 75,
    unlockRequirement: "Log 25 workout sessions",
  },
  {
    id: "ach-8",
    title: "Titan of the Gym",
    description: "Achieve an S-Rank on any exercise e1RM.",
    category: "WORKOUT",
    icon: "/achievements_icons/sliced/ach_icon_8.png",
    targetValue: 1,
    currentProgress: 0,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 1500,
    rewardGems: 150,
    unlockRequirement: "Achieve S-Rank e1RM on any exercise",
  },
  {
    id: "ach-9",
    title: "Tower Challenger",
    description: "Conquer Floor 5 in the Tower.",
    category: "TOWER",
    icon: "/achievements_icons/sliced/ach_icon_9.png",
    targetValue: 5,
    currentProgress: 2,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 200,
    rewardGems: 20,
    unlockRequirement: "Clear Floor 5 in Tower of Ascension",
  },
  {
    id: "ach-10",
    title: "Floor Dominator",
    description: "Conquer Floor 15 in the Tower.",
    category: "TOWER",
    icon: "/achievements_icons/sliced/ach_icon_10.png",
    targetValue: 15,
    currentProgress: 2,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 600,
    rewardGems: 60,
    unlockRequirement: "Clear Floor 15 in Tower of Ascension",
  },
  {
    id: "ach-11",
    title: "Tower Monarch",
    description: "Conquer Floor 30 in the Tower.",
    category: "TOWER",
    icon: "/achievements_icons/sliced/ach_icon_11.png",
    targetValue: 30,
    currentProgress: 2,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 1200,
    rewardGems: 120,
    unlockRequirement: "Clear Floor 30 in Tower of Ascension",
  },
  {
    id: "ach-12",
    title: "Grandmaster Ascendant",
    description: "Reach the 50th Floor of the Tower.",
    category: "TOWER",
    icon: "/achievements_icons/sliced/ach_icon_12.png",
    targetValue: 50,
    currentProgress: 2,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 2500,
    rewardGems: 250,
    unlockRequirement: "Clear Floor 50 in Tower of Ascension",
  },
  {
    id: "ach-13",
    title: "Shadow Initiate",
    description: "Reach Character Level 5.",
    category: "SOCIAL",
    icon: "/achievements_icons/sliced/ach_icon_13.png",
    targetValue: 5,
    currentProgress: 5,
    isCompleted: true,
    isClaimed: false,
    rewardGold: 150,
    rewardGems: 15,
    unlockRequirement: "Reach Level 5",
  },
  {
    id: "ach-14",
    title: "Sanctuary Sovereign",
    description: "Reach Character Level 10.",
    category: "SOCIAL",
    icon: "/achievements_icons/sliced/ach_icon_14.png",
    targetValue: 10,
    currentProgress: 5,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 400,
    rewardGems: 40,
    unlockRequirement: "Reach Level 10",
  },
  {
    id: "ach-15",
    title: "Monarch of Will",
    description: "Reach Character Level 25.",
    category: "SOCIAL",
    icon: "/achievements_icons/sliced/ach_icon_15.png",
    targetValue: 25,
    currentProgress: 5,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 1000,
    rewardGems: 100,
    unlockRequirement: "Reach Level 25",
  },
  {
    id: "ach-16",
    title: "Shadow Monarch Ascended",
    description: "Reach Character Level 50.",
    category: "SOCIAL",
    icon: "/icons/Icon175.png",
    targetValue: 50,
    currentProgress: 5,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 3000,
    rewardGems: 300,
    unlockRequirement: "Reach Level 50",
  },
];

function getRarity(ach: Achievement): "COMMON" | "RARE" | "EPIC" | "LEGENDARY" {
  if (ach.targetValue >= 30 || ach.rewardGold >= 1000) return "LEGENDARY";
  if (ach.targetValue >= 15 || ach.rewardGold >= 500) return "EPIC";
  if (ach.targetValue >= 7 || ach.rewardGold >= 250) return "RARE";
  return "COMMON";
}

const getRarityGlow = (rarity: string) => {
  switch (rarity) {
    case "LEGENDARY":
      return {
        from: "#d946ef",
        to: "#a855f7",
        color: "rgba(217, 70, 239, 0.18)",
      };
    case "EPIC":
      return {
        from: "#a855f7",
        to: "#7c3aed",
        color: "rgba(168, 85, 247, 0.16)",
      };
    case "RARE":
      return {
        from: "#06b6d4",
        to: "#3b82f6",
        color: "rgba(6, 182, 212, 0.16)",
      };
    default:
      return {
        from: "#64748b",
        to: "#94a3b8",
        color: "rgba(148, 163, 184, 0.12)",
      };
  }
};

export default function AchievementsPage() {
  const { character, loadCharacter } = useCharacterStore();
  const [achievements, setAchievements] = useState<Achievement[]>(FALLBACK_ACHIEVEMENTS);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [recentlyClaimedId, setRecentlyClaimedId] = useState<string | null>(null);

  const characterId = character?.id || "char-id-123";

  useEffect(() => {
    fetchAchievements();
  }, [characterId]);

  const fetchAchievements = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/achievements/${characterId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.achievements && data.achievements.length > 0) {
          setAchievements(data.achievements);
        }
      }
    } catch (err) {
      console.error("Error fetching achievements", err);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (achId: string) => {
    try {
      setClaimingId(achId);
      playBattleSFX("magic", 0.7);
      playBuffSFX("levelup", 0.85);
      playAIRASound("NEW_RESISTANCE", 0.9);

      const res = await fetch(`${API_BASE_URL}/api/achievements/claim/${characterId}/${achId}`, {
        method: "POST",
      });

      if (res.ok) {
        setRecentlyClaimedId(achId);
        setTimeout(() => setRecentlyClaimedId(null), 3000);
        await fetchAchievements();
        await loadCharacter();
      }
    } catch (err) {
      console.error("Error claiming reward", err);
    } finally {
      setClaimingId(null);
    }
  };

  // Filter achievements by category and status
  const filteredAchievements = achievements.filter((a) => {
    const matchesCategory = activeCategory === "ALL" || a.category === activeCategory;
    const isUnlocked = a.isCompleted || a.isClaimed;

    let matchesStatus = true;
    if (statusFilter === "OBTAINED") {
      matchesStatus = isUnlocked;
    } else if (statusFilter === "NOT_OBTAINED") {
      matchesStatus = !isUnlocked;
    }

    return matchesCategory && matchesStatus;
  });

  // Calculate summary metrics
  const totalCount = achievements.length;
  const obtainedCount = achievements.filter((a) => a.isCompleted || a.isClaimed).length;
  const completionPercent = totalCount > 0 ? Math.round((obtainedCount / totalCount) * 100) : 0;
  const totalGoldEarned = achievements
    .filter((a) => a.isClaimed)
    .reduce((sum, a) => sum + a.rewardGold, 0);

  return (
    <>
      {/* === 16-BIT SHADOW MONARCH SANCTUARY BACKGROUND === */}
      <PixelShadowSanctuaryBackground />

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8 pb-24 space-y-6 text-slate-100">
        {/* =========================================================
            HEADER BANNER: CHRONICLES OF THE SHADOW MONARCH
            ========================================================= */}
        <MagicCard
          className="relative rounded-3xl border border-purple-500/40 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-md overflow-hidden"
          innerClassName="bg-gradient-to-r from-[#120722]/95 via-[#1a0c32]/90 to-[#0e051c]/95"
          backgroundColor="transparent"
          gradientColor="rgba(192, 132, 252, 0.15)"
          gradientFrom="#a855f7"
          gradientTo="#c084fc"
          gradientSize={380}
        >
          {/* Subtle Ambient Shadow Mana Particles */}
          <Particles
            className="absolute inset-0 pointer-events-none z-10"
            quantity={28}
            color="#c084fc"
            size={0.6}
            staticity={35}
            ease={50}
          />

          {/* Ambient Ethereal Glow Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Runic Trim Watermark */}
          <div className="absolute -top-10 -right-10 w-44 h-44 border border-purple-500/15 rounded-full pointer-events-none" />

          <div className="relative z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative p-2.5 rounded-2xl bg-gradient-to-b from-[#240c42]/90 via-[#15072b]/95 to-[#090214]/95 border-2 border-purple-400/60 shadow-[0_0_25px_rgba(192,132,252,0.4)] shrink-0 group">
                <div className="absolute inset-0 rounded-2xl bg-fuchsia-500/10 blur-md pointer-events-none group-hover:bg-fuchsia-500/20 transition-all" />
                <ShadowMonarchSigil size={60} className="relative z-10 drop-shadow-[0_0_14px_rgba(232,121,249,0.85)]" />
              </div>
              <div>
                <div>
                  <span className="text-xs font-pixel font-bold text-purple-400 uppercase tracking-widest">
                    SHADOW MONARCH CHRONICLES
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-pixel text-white tracking-wide mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  The Monarch&apos;s Shadow Sanctuary
                </h1>
                <p className="text-sm text-purple-200/80 mt-1 max-w-xl font-sans leading-relaxed">
                  Ancient obsidian monuments memorializing your feats of willpower. Complete daily trials to unlock permanent sovereign rewards in Gold and Gems.
                </p>
              </div>
            </div>

            {/* High-Contrast Telemetry Stats Pill Box with NumberTicker */}
            <div className="flex items-center gap-4 bg-[#090314]/95 border border-purple-500/30 p-4 rounded-2xl shadow-2xl backdrop-blur-md shrink-0 relative z-20">
              <div className="text-center px-3">
                <span className="block text-xs font-bold font-pixel text-purple-300/80 uppercase tracking-widest">
                  UNLOCKED
                </span>
                <span className="text-2xl font-black font-pixel text-purple-300 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)] flex items-center justify-center gap-1">
                  <NumberTicker value={obtainedCount} className="text-purple-300 font-pixel" />
                  <span className="text-sm font-normal font-sans text-purple-400/60">/ {totalCount}</span>
                </span>
              </div>

              <div className="h-10 w-px bg-purple-900/60" />

              <div className="text-center px-3">
                <span className="block text-xs font-bold font-pixel text-cyan-300/80 uppercase tracking-widest">
                  PROGRESS
                </span>
                <span className="text-2xl font-black font-pixel text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] flex items-center justify-center">
                  <NumberTicker value={completionPercent} className="text-cyan-400 font-pixel" />
                  <span>%</span>
                </span>
              </div>

              <div className="h-10 w-px bg-purple-900/60" />

              <div className="text-center px-3">
                <span className="block text-xs font-bold font-pixel text-amber-300/80 uppercase tracking-widest">
                  TRIBUTE
                </span>
                <span className="text-2xl font-black font-pixel text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] flex items-center justify-center">
                  <span>+</span>
                  <NumberTicker value={totalGoldEarned} className="text-amber-400 font-pixel" />
                  <span>g</span>
                </span>
              </div>
            </div>
          </div>
        </MagicCard>

        {/* =========================================================
            HABIT TRACKER ELEMENT: STORM ROC'S WILLPOWER RESONANCE
            ========================================================= */}
        <MagicCard
          className="rounded-2xl border border-cyan-500/35 p-4 sm:p-5 shadow-[0_8px_25px_rgba(6,182,212,0.15)] relative overflow-hidden backdrop-blur-md"
          innerClassName="bg-gradient-to-r from-[#0a1020]/95 via-[#0e1628]/95 to-[#070b16]/95"
          backgroundColor="transparent"
          gradientColor="rgba(6, 182, 212, 0.14)"
          gradientFrom="#06b6d4"
          gradientTo="#3b82f6"
          gradientSize={300}
        >
          <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <StormRocConstellation size={28} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    STORM ROC HABIT RESONANCE
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[9.5px] font-bold">
                    <Zap className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Habit Engine Synced</span>
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold font-pixel text-white tracking-wide">
                  Habit Willpower & Streak Milestones
                </h2>
                <p className="text-xs text-cyan-200/70 font-sans max-w-xl leading-relaxed">
                  Daily consistency charges the Monarch&apos;s habit monuments. Complete consecutive habit missions to unlock rare sovereign tribute.
                </p>
              </div>
            </div>

            {/* Habit Quick Metrics & Progress to Next Milestone */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
              <div className="px-3.5 py-2 rounded-xl bg-[#060c18] border border-cyan-500/30 text-center">
                <span className="block text-[10px] font-mono uppercase text-cyan-400/80 font-bold">Active Streak</span>
                <span className="font-pixel text-sm font-bold text-amber-300 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                  <span>4-Day Streak</span>
                </span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#060c18] border border-cyan-500/30 text-center">
                <span className="block text-[10px] font-mono uppercase text-cyan-400/80 font-bold">Willpower Yield</span>
                <span className="font-pixel text-sm font-bold text-emerald-400">
                  +10% Tribute
                </span>
              </div>

              <CoolMode options={{ particle: "⚡" }}>
                <button
                  type="button"
                  onClick={() => {
                    playUIMenuSFX("confirm");
                    setActiveCategory("HABITS");
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-pixel text-xs font-black tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer whitespace-nowrap"
                >
                  VIEW HABIT MONUMENTS
                </button>
              </CoolMode>
            </div>
          </div>
        </MagicCard>

        {/* =========================================================
            FILTER TOOLBAR: STATUS TOGGLES & MYTHIC CONSTELLATIONS
            ========================================================= */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0e061c]/90 border border-purple-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          {/* Status Filters with CoolMode */}
          <div className="flex items-center gap-1.5 font-pixel text-xs bg-[#070210] p-1.5 rounded-xl border border-purple-900/40">
            <CoolMode options={{ particle: "✨" }}>
              <button
                type="button"
                onClick={() => {
                  playUIMenuSFX("confirm");
                  setStatusFilter("ALL");
                }}
                className={`px-3 py-1.5 rounded-lg font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.5)]"
                    : "text-purple-300/70 hover:text-white"
                }`}
              >
                <AllConstellationsCluster size={15} className="text-purple-200" />
                <span>ALL</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${statusFilter === "ALL" ? "bg-purple-800 text-purple-100" : "bg-purple-950/60 text-purple-300"}`}>
                  <NumberTicker value={achievements.length} className="font-mono text-xs font-bold" />
                </span>
              </button>
            </CoolMode>

            <CoolMode options={{ particle: "✨" }}>
              <button
                type="button"
                onClick={() => {
                  playUIMenuSFX("confirm");
                  setStatusFilter("OBTAINED");
                }}
                className={`px-3 py-1.5 rounded-lg font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "OBTAINED"
                    ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    : "text-purple-300/70 hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>OBTAINED</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${statusFilter === "OBTAINED" ? "bg-emerald-800 text-emerald-100" : "bg-emerald-950/60 text-emerald-300"}`}>
                  <NumberTicker value={obtainedCount} className="font-mono text-xs font-bold" />
                </span>
              </button>
            </CoolMode>

            <CoolMode options={{ particle: "✨" }}>
              <button
                type="button"
                onClick={() => {
                  playUIMenuSFX("confirm");
                  setStatusFilter("NOT_OBTAINED");
                }}
                className={`px-3 py-1.5 rounded-lg font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "NOT_OBTAINED"
                    ? "bg-amber-600 text-white shadow-[0_0_12px_rgba(217,119,6,0.5)]"
                    : "text-purple-300/70 hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>LOCKED</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${statusFilter === "NOT_OBTAINED" ? "bg-amber-800 text-amber-100" : "bg-amber-950/60 text-amber-300"}`}>
                  <NumberTicker value={totalCount - obtainedCount} className="font-mono text-xs font-bold" />
                </span>
              </button>
            </CoolMode>
          </div>

          {/* Category Tabs with Mythic Constellation SVG Emblems and CoolMode */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 font-pixel text-xs">
            {CATEGORIES.map((cat) => (
              <CoolMode key={cat} options={{ particle: "✨" }}>
                <button
                  type="button"
                  onClick={() => {
                    playUIMenuSFX("confirm");
                    setActiveCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold tracking-wider transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
                    activeCategory === cat
                      ? "bg-purple-600/30 text-purple-200 border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.35)]"
                      : "bg-[#0a0314]/80 text-purple-300/60 border-purple-900/30 hover:text-white hover:border-purple-600/40"
                  }`}
                >
                  {cat === "ALL" && (
                    <>
                      <AllConstellationsCluster size={16} className="text-purple-300" />
                      <span>ALL MONUMENTS</span>
                    </>
                  )}
                  {cat === "HABITS" && (
                    <>
                      <StormRocConstellation size={16} className="text-cyan-300" />
                      <span>HABITS</span>
                      <span className="text-[11px] opacity-80 tracking-normal font-sans font-medium">STORM ROC</span>
                    </>
                  )}
                  {cat === "WORKOUT" && (
                    <>
                      <StoneTitanConstellation size={16} className="text-amber-300" />
                      <span>WORKOUT</span>
                      <span className="text-[11px] opacity-80 tracking-normal font-sans font-medium">STONE TITAN</span>
                    </>
                  )}
                  {cat === "TOWER" && (
                    <>
                      <FireDrakeConstellation size={16} className="text-red-400" />
                      <span>TOWER</span>
                      <span className="text-[11px] opacity-80 tracking-normal font-sans font-medium">FIRE DRAKE</span>
                    </>
                  )}
                  {cat === "SOCIAL" && (
                    <>
                      <SovereignCrownConstellation size={16} className="text-fuchsia-300" />
                      <span>SOCIAL</span>
                      <span className="text-[11px] opacity-80 tracking-normal font-sans font-medium">MONARCH CROWN</span>
                    </>
                  )}
                </button>
              </CoolMode>
            ))}
          </div>
        </div>

        {/* =========================================================
            ACHIEVEMENT SOUL-MONOLITHS GRID WITH MAGICCARDS
            ========================================================= */}
        {loading ? (
          <div className="py-20 text-center text-purple-300/80 font-pixel tracking-wider text-base animate-pulse bg-[#0a0314]/80 rounded-2xl border border-purple-900/40">
            Unsealing the Monarch&apos;s Memory Vault...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((ach) => {
              const isUnlocked = ach.isCompleted || ach.isClaimed;
              const unlockHow = ach.unlockRequirement || ach.description;
              const rarity = getRarity(ach);
              const isClaimingThis = claimingId === ach.id;
              const justClaimedThis = recentlyClaimedId === ach.id;
              const rarityGlow = getRarityGlow(rarity);

              // Rarity-based background and border classes
              let innerBg = "bg-gradient-to-b from-[#121420]/95 via-[#0c0d18]/95 to-[#070810]/95";
              let borderClass = "border-slate-700/60 shadow-[0_0_10px_rgba(30,41,59,0.15)]";
              let badgeColor = "text-slate-300 bg-slate-900/80 border-slate-700";
              let auraClass = "";

              if (rarity === "LEGENDARY") {
                innerBg = "bg-gradient-to-b from-[#1c0b33]/95 via-[#110722]/95 to-[#090314]/95";
                borderClass = "border-fuchsia-500/60 shadow-[0_0_24px_rgba(217,70,239,0.22)]";
                badgeColor = "text-fuchsia-300 bg-fuchsia-950/80 border-fuchsia-500/50";
              } else if (rarity === "EPIC") {
                innerBg = "bg-gradient-to-b from-[#160a2c]/95 via-[#0e071e]/95 to-[#070312]/95";
                borderClass = "border-purple-500/50 shadow-[0_0_18px_rgba(168,85,247,0.18)]";
                badgeColor = "text-purple-300 bg-purple-950/80 border-purple-500/50";
              } else if (rarity === "RARE") {
                innerBg = "bg-gradient-to-b from-[#0c142c]/95 via-[#070e20]/95 to-[#040816]/95";
                borderClass = "border-cyan-500/45 shadow-[0_0_16px_rgba(6,182,212,0.15)]";
                badgeColor = "text-cyan-300 bg-cyan-950/80 border-cyan-500/50";
              }

              if (ach.isCompleted && !ach.isClaimed) {
                auraClass = "ring-2 ring-purple-400/80 shadow-[0_0_28px_rgba(192,132,252,0.45)] animate-pulse";
              }

              return (
                <MagicCard
                  key={ach.id}
                  className={`relative rounded-2xl border p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 group ${borderClass} ${auraClass} ${
                    !isUnlocked ? "opacity-80 hover:opacity-100" : ""
                  }`}
                  innerClassName={innerBg}
                  backgroundColor="transparent"
                  gradientColor={rarityGlow.color}
                  gradientFrom={rarityGlow.from}
                  gradientTo={rarityGlow.to}
                  gradientSize={260}
                >
                  {/* Ready to claim pulsing ambient overlay */}
                  {ach.isCompleted && !ach.isClaimed && (
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/15 via-purple-600/10 to-transparent pointer-events-none animate-pulse z-10" />
                  )}

                  {/* Just Claimed Shockwave Ripple */}
                  {justClaimedThis && (
                    <div className="absolute inset-0 rounded-2xl bg-purple-500/25 border-2 border-fuchsia-400 animate-ping pointer-events-none z-10" />
                  )}

                  {/* Header: Icon, Title & Status */}
                  {(() => {
                    const loreEntry = ACHIEVEMENT_LORE[ach.title] || {
                      storyLore: "An ancient testament of hunter willpower preserved within the System Chronicles.",
                      historicalContext: "Forged during the primordial awakening of Ascend OS to reward kinetic momentum.",
                      unlockWisdom: unlockHow,
                    };

                    return (
                      <div className="flex gap-4 items-start relative z-20 mb-3">
                        <SystemTooltip
                          title={ach.title}
                          subtitle={`Monarch Soul Monolith • ${ach.category}`}
                          category="System Chronicle"
                          rarity={rarity}
                          description={ach.description}
                          lore={loreEntry.storyLore}
                          mechanics={loreEntry.historicalContext}
                          howToImprove={loreEntry.unlockWisdom}
                          stats={[
                            {
                              label: "Current Progress",
                              value: `${Math.min(ach.currentProgress, ach.targetValue)} / ${ach.targetValue}`,
                            },
                            {
                              label: "Status",
                              value: ach.isClaimed ? "Claimed" : isUnlocked ? "Unlocked" : "Locked",
                              color: isUnlocked ? "text-emerald-400" : "text-amber-400",
                            },
                            {
                              label: "Gold Bounty",
                              value: `+${ach.rewardGold}g`,
                              color: "text-amber-400",
                            },
                            {
                              label: "Gems Bounty",
                              value: `+${ach.rewardGems}`,
                              color: "text-cyan-400",
                            },
                          ]}
                          tags={["Achievement", ach.category, rarity, isUnlocked ? "Unlocked" : "Locked"]}
                          delayMs={600}
                        >
                          <div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-b from-[#180928] to-[#090212] border flex items-center justify-center shrink-0 p-2 relative shadow-inner cursor-help group-hover:scale-105 transition-all duration-300 ${
                              isUnlocked
                                ? "border-purple-400/60 shadow-[0_0_16px_rgba(192,132,252,0.35)]"
                                : "border-purple-900/40"
                            }`}
                          >
                            <img
                              src={ach.icon}
                              alt={ach.title}
                              onError={(e) => {
                                e.currentTarget.src = "/achievements_icons/sliced/ach_icon_1.png";
                              }}
                              className={`w-12 h-12 object-contain transition-all duration-300 ${
                                !isUnlocked
                                  ? "opacity-60 filter grayscale contrast-125 brightness-90"
                                  : "drop-shadow-[0_0_12px_rgba(192,132,252,0.8)] scale-105"
                              }`}
                            />

                            {ach.isClaimed ? (
                              <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-emerald-950 rounded-full p-0.5 shadow-lg border border-emerald-300">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : !isUnlocked ? (
                              <div className="absolute -bottom-1 -right-1 bg-slate-950/90 text-purple-300 rounded-md p-1 border border-purple-800 shadow">
                                <Lock className="w-2.5 h-2.5" />
                              </div>
                            ) : null}
                          </div>
                        </SystemTooltip>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                              {rarity}
                            </span>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-300/80 bg-purple-950/60 border border-purple-500/30 px-1.5 py-0.5 rounded">
                              {ach.category}
                            </span>
                            {isUnlocked ? (
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                                UNLOCKED
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded">
                                LOCKED
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-white font-pixel tracking-wide leading-snug truncate drop-shadow">
                            {ach.title}
                          </h3>
                          <p className="text-xs text-purple-200/80 mt-1 line-clamp-2 leading-relaxed font-sans">
                            {ach.description}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Clear Unlock Requirement Callout Box */}
                  <div className="my-2 p-2.5 rounded-xl bg-[#080210]/90 border border-purple-900/40 text-[11px] flex items-start gap-2 relative z-20">
                    <Target className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-bold text-purple-300 uppercase font-pixel tracking-wider">TRIAL REQUIREMENT:</span>
                      <span className="text-slate-200 font-sans text-xs leading-normal">{unlockHow}</span>
                    </div>
                  </div>

                  {/* Progress Tracker with Liquid Mana Bar & NumberTicker */}
                  <div className="my-3 relative z-20">
                    <div className="flex justify-between text-[11px] text-purple-300/80 mb-1">
                      <span className="font-pixel text-xs tracking-wider">MONUMENT CHARGE</span>
                      <span className="font-pixel text-xs font-bold text-slate-100 tracking-wide flex items-center gap-1">
                        <NumberTicker
                          value={Math.min(ach.currentProgress, ach.targetValue)}
                          className="font-pixel text-xs font-bold text-slate-100"
                        />
                        <span>/</span>
                        <span>{ach.targetValue}</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-purple-900/30">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          ach.isCompleted || ach.isClaimed
                            ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                            : "bg-gradient-to-r from-purple-700 via-fuchsia-600 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                        }`}
                        style={{
                          width: `${Math.min((ach.currentProgress / ach.targetValue) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer: Rewards & Extraction Action */}
                  <div className="mt-auto pt-3 border-t border-purple-900/30 flex items-center justify-between relative z-20">
                    <div className="flex gap-3">
                      {ach.rewardGold > 0 && (
                        <span className="text-xs font-bold font-pixel tracking-wide text-amber-400 flex items-center gap-1">
                          <span>+</span>
                          <NumberTicker value={ach.rewardGold} className="font-pixel text-xs text-amber-400" />
                          <span>g Gold</span>
                        </span>
                      )}
                      {ach.rewardGems > 0 && (
                        <span className="text-xs font-bold font-pixel tracking-wide text-cyan-400 flex items-center gap-1">
                          <span>+</span>
                          <NumberTicker value={ach.rewardGems} className="font-pixel text-xs text-cyan-400" />
                          <span>Gems</span>
                        </span>
                      )}
                    </div>

                    {ach.isClaimed ? (
                      <span className="text-xs font-bold font-pixel tracking-wider text-emerald-300 px-3 py-1 bg-emerald-950/60 rounded-lg border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> SOVEREIGN SEALED
                      </span>
                    ) : ach.isCompleted ? (
                      <CoolMode options={{ particle: "👑" }}>
                        <button
                          type="button"
                          onClick={() => claimReward(ach.id)}
                          disabled={isClaimingThis}
                          className="text-xs font-black font-pixel tracking-wider text-slate-950 bg-gradient-to-r from-fuchsia-400 via-purple-300 to-amber-300 hover:from-fuchsia-300 hover:to-amber-200 px-4 py-1.5 rounded-lg shadow-[0_0_20px_rgba(217,70,239,0.6)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {isClaimingThis ? "EXTRACTING..." : "EXTRACT TRIBUTE"}
                        </button>
                      </CoolMode>
                    ) : (
                      <span className="text-[11px] font-bold font-pixel tracking-wider text-purple-300/60 flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-md border border-purple-900/40">
                        <Lock className="w-3 h-3" /> IN TRIAL
                      </span>
                    )}
                  </div>
                </MagicCard>
              );
            })}

            {filteredAchievements.length === 0 && (
              <div className="col-span-full py-16 text-center text-purple-300/70 bg-[#0c0518]/90 border border-purple-900/40 rounded-2xl space-y-3">
                <ShadowMonarchSigil size={56} className="mx-auto opacity-50 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]" />
                <p className="text-lg font-bold font-pixel tracking-wide text-white">No Soul Monuments Found</p>
                <p className="text-xs text-purple-200/80 font-sans">Try selecting another constellation category or status filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
