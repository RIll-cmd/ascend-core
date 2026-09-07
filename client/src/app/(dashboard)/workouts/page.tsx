"use client";

import { useEffect, useState } from "react";
import { useWorkoutStore } from "@/features/workouts/store/useWorkoutStore";
import { useThemeStore } from "@/store/useThemeStore";
import { ActiveWorkout } from "@/features/workouts/components/ActiveWorkout";
import { ExerciseRankCard } from "@/features/workouts/components/ExerciseRankCard";
import { CreateCustomWorkoutModal } from "@/features/workouts/components/CreateCustomWorkoutModal";
import {
  BodyHeatmap,
  MuscleRecoveryHUD,
  WorkoutLoggerModal,
} from "@/components/workout";
import { MuscleGroupKey } from "@/features/workouts/types/muscleRecovery";
import { useUser } from "@/context/UserContext";
import { AiraAvatar } from "@/components/ui/AiraAvatar";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelCard } from "@/components/ui/pixel/PixelCard";
import {
  PixelSwordIcon,
  PixelShieldIcon,
  PixelSkullIcon,
  PixelActivityIcon,
  PixelFlameIcon,
  PixelLaurelWreathIcon,
  PixelRomanColumnIcon,
  PixelDumbbellIcon,
  PixelPlusIcon,
  PixelTrashIcon,
} from "@/components/ui/pixel/PixelIcons";
import {
  Dumbbell,
  Activity,
  Trophy,
  Flame,
  Play,
  Bot,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Swords,
  Zap,
  Target,
  Layers,
  ChevronRight,
  Shield,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { API_BASE_URL } from "@/constants";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { WORKOUT_LORE } from "@/features/lore/loreData";
import {
  playUIMenuSFX,
  playBattleSFX,
  playBuffSFX,
  playAIRASound,
} from "@/utils/audio";
import Link from "next/link";

const PREDEFINED_SPLITS = [
  {
    name: "Push Split",
    target: "Chest • Shoulders • Triceps",
    statGain: "+STR & END",
    statGainFull: "+Strength & Endurance",
    accentColor: "from-amber-500/20 via-orange-600/10 to-transparent",
    borderColor: "border-amber-500/30 hover:border-amber-400/60",
    glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    badgeColor: "bg-amber-950/80 text-amber-300 border-amber-500/40",
    exercises: [
      { id: "ex1", name: "Barbell Bench Press", primaryMuscle: "Chest", equipment: "Barbell" },
      { id: "ex7", name: "Incline Dumbbell Press", primaryMuscle: "Chest", equipment: "Dumbbell" },
      { id: "ex4", name: "Overhead Barbell Press", primaryMuscle: "Shoulders", equipment: "Barbell" },
      { id: "ex11", name: "Dips", primaryMuscle: "Chest", equipment: "Bodyweight" },
      { id: "ex9", name: "Tricep Rope Pushdown", primaryMuscle: "Arms", equipment: "Cable" },
    ],
  },
  {
    name: "Pull Split",
    target: "Back • Biceps • Rear Delts",
    statGain: "+STR & END",
    statGainFull: "+Strength & Endurance",
    accentColor: "from-zinc-500/20 via-stone-600/10 to-transparent",
    borderColor: "border-zinc-500/30 hover:border-zinc-400/60",
    glowColor: "shadow-[0_0_20px_rgba(161,161,170,0.15)]",
    badgeColor: "bg-stone-900/90 text-stone-200 border-stone-600/40",
    exercises: [
      { id: "ex3", name: "Barbell Deadlift", primaryMuscle: "Back", equipment: "Barbell" },
      { id: "ex12", name: "Lat Pulldown", primaryMuscle: "Back", equipment: "Cable" },
      { id: "ex6", name: "Barbell Row", primaryMuscle: "Back", equipment: "Barbell" },
      { id: "ex8", name: "Pull Up", primaryMuscle: "Back", equipment: "Bodyweight" },
      { id: "ex5", name: "Dumbbell Bicep Curl", primaryMuscle: "Arms", equipment: "Dumbbell" },
    ],
  },
  {
    name: "Legs Split",
    target: "Quads • Hamstrings • Calves",
    statGain: "+STR & END",
    statGainFull: "+Strength & Endurance",
    accentColor: "from-emerald-500/20 via-teal-600/10 to-transparent",
    borderColor: "border-emerald-500/30 hover:border-emerald-400/60",
    glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40",
    exercises: [
      { id: "ex2", name: "Barbell Back Squat", primaryMuscle: "Legs", equipment: "Barbell" },
      { id: "ex13", name: "Romanian Deadlift", primaryMuscle: "Legs", equipment: "Barbell" },
      { id: "ex14", name: "Leg Press", primaryMuscle: "Legs", equipment: "Machine" },
      { id: "ex15", name: "Lying Leg Curl", primaryMuscle: "Legs", equipment: "Machine" },
      { id: "ex16", name: "Calf Raises", primaryMuscle: "Legs", equipment: "Machine" },
    ],
  },
  {
    name: "Core & Cardio",
    target: "Abs • Obliques • Stability",
    statGain: "+END & CON",
    statGainFull: "+Endurance & Consistency",
    accentColor: "from-red-500/20 via-amber-600/10 to-transparent",
    borderColor: "border-red-500/30 hover:border-red-400/60",
    glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    badgeColor: "bg-red-950/80 text-red-300 border-red-500/40",
    exercises: [
      { id: "ex17", name: "Cable Woodchoppers", primaryMuscle: "Core", equipment: "Cable" },
      { id: "ex18", name: "Hanging Leg Raises", primaryMuscle: "Core", equipment: "Bodyweight" },
      { id: "ex19", name: "Planks", primaryMuscle: "Core", equipment: "Bodyweight" },
      { id: "ex20", name: "Push-ups", primaryMuscle: "Chest", equipment: "Bodyweight" },
    ],
  },
];

export default function WorkoutsPage() {
  const {
    isWorkoutActive,
    startWorkout,
    startWorkoutWithTemplate,
    customTemplates,
    deleteCustomTemplate,
    muscleRecovery,
    fetchMuscleRecoveryStatus,
    resetMuscleRecovery,
    isLoadingRecovery,
  } = useWorkoutStore();
  const { workoutTheme } = useThemeStore();
  const { user } = useUser();

  const [ranks, setRanks] = useState<any[]>([]);
  const [isLoadingRanks, setIsLoadingRanks] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoggerModalOpen, setIsLoggerModalOpen] = useState(false);
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<MuscleGroupKey | null>(null);
  const [activeBoss, setActiveBoss] = useState<any>(null);

  useEffect(() => {
    useWorkoutStore.getState().hydrateTemplates();
  }, []);

  // Fetch Muscle Recovery Telemetry
  useEffect(() => {
    const charId = user?.id;
    if (charId) {
      fetchMuscleRecoveryStatus(charId);
    }
  }, [user?.id, isWorkoutActive, fetchMuscleRecoveryStatus]);

  // Fetch PR Ranks
  useEffect(() => {
    const fetchRanks = async () => {
      const charId = user?.id;
      if (!charId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/workouts/ranks/${charId}`);
        if (res.ok) {
          const data = await res.json();
          setRanks(data.ranks || []);
        }
      } catch (e) {
        console.error("Failed to fetch ranks", e);
      } finally {
        setIsLoadingRanks(false);
      }
    };
    fetchRanks();
  }, [user?.id, isWorkoutActive]);

  // Fetch Weekly Boss
  useEffect(() => {
    const fetchBoss = async () => {
      const charId = user?.id;
      if (!charId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/fitness/boss/${charId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveBoss(data);
        }
      } catch (e) {}
    };
    fetchBoss();
  }, [user?.id]);

  const handleQuickWorkout = async () => {
    const charId = user?.id;
    if (!charId) return;
    playBattleSFX("encounter");
    try {
      const res = await fetch(`${API_BASE_URL}/api/fitness/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: charId }),
      });
      if (res.ok) {
        const session = await res.json();
        startWorkout(session.id);
        playBuffSFX("speed");
      } else {
        toast.error("Failed to start workout session.");
      }
    } catch (e) {
      toast.error("Network error starting session.");
    }
  };

  const handleStartTemplate = async (name: string, exercises: any[]) => {
    const charId = user?.id;
    if (!charId) return;
    playBattleSFX("encounter");
    try {
      const res = await fetch(`${API_BASE_URL}/api/fitness/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: charId }),
      });
      if (res.ok) {
        const session = await res.json();
        startWorkoutWithTemplate(name, exercises, session.id);
        playBuffSFX("buff");
      } else {
        toast.error("Failed to start templated session.");
      }
    } catch (e) {
      toast.error("Network error starting templated session.");
    }
  };

  const handleCielAnalysis = async () => {
    const charId = user?.id;
    if (!charId) return;
    setIsAnalyzing(true);
    playAIRASound("NOTICE");
    try {
      const res = await fetch(`${API_BASE_URL}/api/aira/analyze-workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Analyze my recent workout ranks and muscle recovery telemetry.",
          characterId: charId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        playAIRASound("CONFIRMED");
        toast.info(
          <div className="flex flex-col gap-2">
            <div className="font-bold flex items-center gap-2 text-amber-400">
              <Bot className="w-4 h-4 text-amber-400 animate-pulse" /> AIRA Analysis Telemetry
            </div>
            <div className="text-xs text-slate-200">
              <ReactMarkdown>{data.analysis}</ReactMarkdown>
            </div>
          </div>,
          { duration: 15000 }
        );
      } else {
        toast.error("Analysis failed.");
      }
    } catch (e) {
      toast.error("Network error during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetRecoverySimulation = async () => {
    const charId = user?.id;
    if (!charId) return;
    playUIMenuSFX("confirm");
    await resetMuscleRecovery(charId);
    toast.success("Simulation Reset: All muscle groups refreshed to 100%!");
  };

  return (
    <div className="space-y-8 pb-16 font-sans animate-in fade-in duration-300 relative text-slate-100 max-w-6xl mx-auto p-4 md:p-6">

      {/* ========================================================= */}
      {/* 1. HERO & TOP TELEMETRY COMMAND BAR */}
      {/* ========================================================= */}
      <div className="relative pixel-stone-slab p-5 sm:p-7 select-none">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Raw Iron Pedestal */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#140e0c] border-2 border-[#4a3830] shadow-[inset_2px_2px_0_0_#2a1f1b] flex items-center justify-center text-[#f59e0b] shrink-0">
              <PixelSwordIcon className="w-8 h-8 text-[#f59e0b]" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="pixel-roman-stele px-3 py-1 text-[11px] sm:text-xs flex items-center gap-2 font-bold tracking-wider">
                  <PixelLaurelWreathIcon className="w-3.5 h-3.5 text-[#fde047]" />
                  LVDVS ARENA • PROVING GROUNDS
                </span>
              </div>
              <h1 className="font-pixel text-base sm:text-xl font-bold text-white uppercase tracking-wider">
                Workout Dashboard
              </h1>
              <p className="font-sans text-xs sm:text-sm text-stone-200 font-medium max-w-lg leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                Track muscle fatigue, recovery time, personal records, and strength progress across all your workouts.
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 z-10 w-full lg:w-auto justify-start lg:justify-end">
            <PixelButton
              variant="gold"
              size="md"
              onClick={() => {
                playUIMenuSFX("click");
                setIsLoggerModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <PixelDumbbellIcon className="w-4 h-4" />
              <span>LOG WORKOUT</span>
            </PixelButton>

            <Link href="/workouts/boss-pr">
              <PixelButton
                variant="danger"
                size="md"
                onClick={() => playBattleSFX("encounter")}
                className="flex items-center gap-2"
              >
                <PixelSwordIcon className="w-4 h-4 text-white" />
                <span>STRENGTH CHALLENGE (BOSS PR)</span>
              </PixelButton>
            </Link>

            <PixelButton
              variant="iron"
              size="md"
              onClick={handleCielAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <AiraAvatar mood="ANALYZING" className="w-4 h-4 border-none shadow-none rounded-none" />
              )}
              <span>AI COACH INSIGHTS</span>
            </PixelButton>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. RECOVERY ENGINE HUD & ANATOMICAL BODY HEATMAP */}
      {/* ========================================================= */}
      <div className="space-y-6">
        {/* Top Recovery Telemetry HUD */}
        <MuscleRecoveryHUD
          recoveryStatus={muscleRecovery}
          onOpenLogger={() => {
            playUIMenuSFX("click");
            setIsLoggerModalOpen(true);
          }}
          onResetRecovery={handleResetRecoverySimulation}
          isLoading={isLoadingRecovery}
        />

        {/* Interactive Dual-View Anatomical Heatmap */}
        <BodyHeatmap
          recoveryStatus={muscleRecovery}
          selectedMuscleKey={selectedMuscleKey}
          onSelectMuscle={(mKey) => {
            setSelectedMuscleKey(mKey);
            playUIMenuSFX("click");
          }}
          variant="full"
          defaultView="dual"
        />
      </div>

      {/* ========================================================= */}
      {/* 3. ACTIVE LIVE WORKOUT SESSION (IF ACTIVE) */}
      {/* ========================================================= */}
      {isWorkoutActive && (
        <div className="relative z-20">
          <ActiveWorkout />
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. FITNESS STATS & PR RANK MATRIX */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fitness Power Card */}
        <div className="pixel-stone-slab p-5 relative select-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <PixelBadge variant="gold" size="sm">
                <PixelActivityIcon className="w-3 h-3 mr-1 text-[#f59e0b]" />
                TOTAL POWER RATING
              </PixelBadge>
              <div className="w-7 h-7 bg-[#140e0c] border border-[#4a3830] flex items-center justify-center text-[#22c55e]">
                <PixelFlameIcon className="w-4 h-4 text-[#22c55e]" />
              </div>
            </div>

            <div className="mt-4">
              <div className="font-pixel-chunky text-5xl font-bold text-white tracking-wider">
                {user?.power || 0}
              </div>
              <div className="mt-2">
                <PixelBadge variant="success" size="sm">
                  LEVEL {user?.level || 1} ATHLETE
                </PixelBadge>
              </div>
            </div>
          </div>

          {/* Quick Boss PR Status Banner */}
          {activeBoss && (
            <div className="mt-5 pt-3 border-t-2 border-[#4a3830]">
              <Link
                href="/workouts/boss-pr"
                className="block p-3 bg-[#140e0c] border-2 border-[#4a3830] hover:border-[#f59e0b] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <PixelSwordIcon className="w-4 h-4 text-[#ef4444]" />
                  <div>
                    <div className="font-sans font-bold text-xs text-white">
                      {activeBoss.name || "Strength Challenge"}
                    </div>
                    <div className="font-sans font-semibold text-xs text-[#ef4444] uppercase">
                      {activeBoss.isDefeated ? "DEFEATED" : `Target: ${activeBoss.targetExercise}`}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Personal Records Card */}
        <div className="pixel-stone-slab p-5 relative select-none lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b-2 border-[#4a3830] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#140e0c] border border-[#4a3830] flex items-center justify-center text-[#f59e0b]">
                <Trophy className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <div>
                <h2 className="font-pixel text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Personal Records (PR)
                </h2>
                <p className="font-sans text-xs text-stone-300 mt-0.5">
                  Estimated 1-Rep Max (1RM) benchmarks & Tier Ranks
                </p>
              </div>
            </div>
            <PixelBadge variant="gold" size="sm">
              STRENGTH BENCHMARKS
            </PixelBadge>
          </div>

          <div className="mt-4">
            {isLoadingRanks ? (
              <div className="flex items-center justify-center py-10 font-sans text-xs text-stone-300 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#f59e0b]" />
                <span>Loading Personal Records...</span>
              </div>
            ) : ranks.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0">
                {ranks.map((r, i) => (
                  <ExerciseRankCard
                    key={i}
                    exerciseName={r.exerciseName}
                    e1rm={r.e1rm}
                    currentRank={r.currentRank}
                    nextRank={r.nextRank}
                    nextThreshold={r.nextThreshold}
                    progress={r.progress}
                  />
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 px-4 border border-dashed border-[#4a3830]/80 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 bg-[#1c1412] border border-[#4a3830] flex items-center justify-center text-[#f59e0b]">
                  <PixelDumbbellIcon className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="font-pixel text-xs font-bold text-white uppercase tracking-wider">
                    No Personal Records Logged Yet
                  </h3>
                  <p className="font-sans text-xs text-stone-300 leading-relaxed">
                    Record your workout sets to calculate your estimated 1-rep max (1RM), track progress, and unlock higher strength tiers.
                  </p>
                </div>
                <PixelButton
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    playUIMenuSFX("click");
                    setIsLoggerModalOpen(true);
                  }}
                  className="mt-1 text-xs flex items-center gap-1.5"
                >
                  <PixelSwordIcon className="w-3.5 h-3.5" />
                  <span>LOG FIRST WORKOUT</span>
                </PixelButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. USER CUSTOM WORKOUT PLANS */}
      {/* ========================================================= */}
      <div className="relative pixel-stone-slab p-5 sm:p-7 select-none space-y-5">
        {/* Stone Masonry Corner Brackets */}
        <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[#f59e0b] pointer-events-none" />

        {/* Unified Section Header inside Main Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#4a3830]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#140e0c] border border-[#4a3830] flex items-center justify-center text-[#f59e0b] shrink-0">
                <PixelSwordIcon className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <h2 className="font-pixel text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Custom Workout Routines ({customTemplates.length})
              </h2>
            </div>
            <p className="font-sans text-xs text-stone-300 ml-10">
              Craft, manage, and execute personalized training routines tailored to your discipline.
            </p>
          </div>

          <PixelButton
            variant="gold"
            size="sm"
            onClick={() => {
              playUIMenuSFX();
              setIsCreateModalOpen(true);
            }}
            className="text-xs shrink-0 self-start sm:self-auto"
          >
            <span className="flex items-center gap-1.5">
              <PixelPlusIcon className="w-3.5 h-3.5" /> CREATE ROUTINE
            </span>
          </PixelButton>
        </div>

        {/* Content inside Main Box */}
        {customTemplates.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
            {customTemplates.map((plan) => (
              <li
                key={plan.id}
                className="p-4 bg-[#140e0c] border-2 border-[#4a3830] hover:border-[#f59e0b]/70 transition-all flex flex-col justify-between relative select-none shadow-[inset_1px_1px_0_0_#2a1f1b]"
              >
                <div className="flex items-start justify-between pb-3 border-b-2 border-[#4a3830]">
                  <div>
                    <h3 className="font-sans font-bold text-sm text-white">
                      {plan.name}
                    </h3>
                    <p className="font-sans text-xs text-[#f59e0b] font-medium mt-0.5">{plan.target}</p>
                  </div>
                  <button
                    onClick={() => {
                      playUIMenuSFX("decline");
                      deleteCustomTemplate(plan.id);
                      toast.info(`Deleted custom routine "${plan.name}"`);
                    }}
                    className="text-stone-500 hover:text-[#ef4444] transition-colors p-1 cursor-pointer"
                    title="Delete Routine"
                  >
                    <PixelTrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="py-3 text-xs flex-1 flex flex-col justify-between">
                  <div>
                    <span className="block text-stone-300 font-sans font-bold mb-2 uppercase text-[11px] tracking-wider">
                      {plan.exercises.length} Exercises Included:
                    </span>
                    <ul className="space-y-1.5 text-stone-200 font-sans font-medium text-xs">
                      {plan.exercises.slice(0, 3).map((ex, idx) => (
                        <li key={idx} className="truncate flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#f59e0b] shrink-0" />
                          <span className="truncate">{ex.name}</span>
                        </li>
                      ))}
                      {plan.exercises.length > 3 && (
                        <li className="text-xs text-[#f59e0b] font-sans font-semibold italic pt-1">
                          + {plan.exercises.length - 3} more exercises
                        </li>
                      )}
                    </ul>
                  </div>

                  <PixelButton
                    variant="gold"
                    size="sm"
                    disabled={isWorkoutActive}
                    onClick={() => handleStartTemplate(plan.name, plan.exercises)}
                    className="w-full mt-4 text-xs"
                  >
                    START WORKOUT
                  </PixelButton>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 bg-[#140e0c]/70 border-2 border-dashed border-[#4a3830] flex flex-col items-center justify-center text-center gap-3 select-none">
            <div className="w-10 h-10 bg-[#1c1412] border border-[#4a3830] flex items-center justify-center text-[#f59e0b]">
              <PixelDumbbellIcon className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="font-pixel text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                No Custom Routines Created
              </h3>
              <p className="font-sans text-xs text-stone-300 leading-relaxed">
                Create personalized routines to target specific muscle groups and track your strength progress.
              </p>
            </div>
            <PixelButton
              variant="gold"
              size="sm"
              onClick={() => {
                playUIMenuSFX();
                setIsCreateModalOpen(true);
              }}
              className="mt-1 text-xs"
            >
              <span className="flex items-center gap-1.5">
                <PixelPlusIcon className="w-3.5 h-3.5" /> CREATE ROUTINE
              </span>
            </PixelButton>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. PREDEFINED SPLIT ROUTINES MATRIX */}
      {/* ========================================================= */}
      <div className="relative pixel-stone-slab p-5 sm:p-7 select-none space-y-5">
        {/* Stone Masonry Corner Brackets */}
        <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[#f59e0b] pointer-events-none" />

        {/* Unified Section Header inside Main Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#4a3830]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#140e0c] border border-[#4a3830] flex items-center justify-center text-[#f59e0b] shrink-0">
                <PixelShieldIcon className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <h2 className="font-pixel text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Recommended Workout Splits
              </h2>
            </div>
            <p className="font-sans text-xs text-stone-300 ml-10">
              Choose a battle-tested routine to target specific muscle groups and build strength.
            </p>
          </div>

          <PixelBadge variant="gold" size="sm" className="font-pixel text-[10px] tracking-wider uppercase shrink-0 self-start sm:self-auto">
            {PREDEFINED_SPLITS.length} TRAINING SPLITS
          </PixelBadge>
        </div>

        {/* Split Cards Grid inside Main Box */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0 m-0">
          {PREDEFINED_SPLITS.map((split, i) => (
            <li
              key={i}
              className="p-4 bg-[#140e0c] border-2 border-[#4a3830] hover:border-[#f59e0b]/70 transition-all flex flex-col justify-between relative select-none shadow-[inset_1px_1px_0_0_#2a1f1b]"
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-[#4a3830] pb-2.5 gap-2">
                  <PixelBadge
                    variant={i === 0 ? "gold" : i === 1 ? "iron" : i === 2 ? "success" : "danger"}
                    size="sm"
                    className="font-sans font-bold text-[11px] px-2 py-0.5 tracking-wide uppercase whitespace-nowrap shrink-0"
                    title={split.statGainFull}
                  >
                    {split.statGain}
                  </PixelBadge>
                  <span className="font-pixel text-[10px] text-[#fde047] bg-[#241712] px-2 py-0.5 border border-[#5c4033] shrink-0 font-bold whitespace-nowrap">
                    SPLIT {["I", "II", "III", "IV"][i]} • {split.exercises.length} EX
                  </span>
                </div>

                <h3 className="font-sans font-bold text-sm text-white">
                  {split.name}
                </h3>
                <p className="font-sans text-xs text-stone-400 mt-0.5">{split.target}</p>

                <ul className="mt-3.5 space-y-2">
                  {split.exercises.map((ex, idx) => (
                    <li key={idx} className="truncate flex items-center gap-2 font-sans font-semibold text-xs text-stone-200">
                      <span className="w-1.5 h-1.5 bg-[#f59e0b] shrink-0" />
                      <span className="truncate">{ex.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <PixelButton
                variant="gold"
                size="sm"
                disabled={isWorkoutActive}
                onClick={() => handleStartTemplate(split.name, split.exercises)}
                className="w-full mt-4 text-xs"
              >
                <PixelSwordIcon className="w-3.5 h-3.5 mr-1" />
                <span>START WORKOUT</span>
              </PixelButton>
            </li>
          ))}
        </ul>
      </div>

      {/* ========================================================= */}
      {/* 7. MODALS */}
      {/* ========================================================= */}
      <CreateCustomWorkoutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <WorkoutLoggerModal
        isOpen={isLoggerModalOpen}
        onClose={() => setIsLoggerModalOpen(false)}
        initialExerciseId={selectedMuscleKey ? undefined : undefined}
      />
    </div>
  );
}
