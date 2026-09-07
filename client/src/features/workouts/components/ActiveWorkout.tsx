"use client";

import { useState, useEffect } from "react";
import { useWorkoutStore, ExerciseDefinition } from "../store/useWorkoutStore";
import { useUser } from "@/context/UserContext";
import { useDailyBonusStore } from "@/store/useDailyBonusStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RestTimer } from "./RestTimer";
import { VoiceLogger } from "./VoiceLogger";
import {
  Plus,
  Timer,
  Check,
  Loader2,
  Dumbbell,
  Sparkles,
  Target,
  Zap,
  Swords,
  Flame,
  Layers,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { calculateE1RM, evaluateRank } from "../utils/rankEngine";
import confetti from "canvas-confetti";
import { API_BASE_URL } from "@/constants";
import { playAIRASound, playBattleSFX, playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { FloatingRuneField } from "@/components/shared/FloatingRuneField";

export function ActiveWorkout() {
  const {
    isWorkoutActive,
    sessionId,
    startTime,
    endWorkout,
    exercises,
    addExercise,
    sets,
    logSet,
    startRestTimer,
  } = useWorkoutStore();
  const { user, refetch } = useUser();
  const [duration, setDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<ExerciseDefinition[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [activeBoss, setActiveBoss] = useState<any>(null);

  // Local state for the current inputs of each exercise
  const [inputs, setInputs] = useState<Record<string, { weight: string; reps: string; rpe: string }>>({});
  const [overloads, setOverloads] = useState<Record<string, any>>({});
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);

  // Fetch cataloged exercises from backend
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/workouts/exercises`);
        if (res.ok) {
          const data = await res.json();
          setAvailableExercises(data);
        } else {
          setAvailableExercises(FALLBACK_EXERCISES);
        }
      } catch (e) {
        setAvailableExercises(FALLBACK_EXERCISES);
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    fetchCatalog();
  }, []);

  // Fetch active boss data
  useEffect(() => {
    if (!user?.id || !isWorkoutActive) return;
    const fetchBoss = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/fitness/boss/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.isDefeated) {
            setActiveBoss(data);
          }
        }
      } catch (e) {}
    };
    fetchBoss();
  }, [user?.id, isWorkoutActive]);

  // Fetch Overload Data when exercises change
  useEffect(() => {
    if (!isWorkoutActive || exercises.length === 0 || !user?.id) return;

    const fetchOverloads = async () => {
      try {
        const exIds = exercises.map((e) => e.id);
        const res = await fetch(`${API_BASE_URL}/api/fitness/overload-batch/${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exerciseIds: exIds }),
        });
        if (res.ok) {
          const data = await res.json();
          setOverloads(data);
        }
      } catch (e) {
        console.error("Failed to load overload recommendations", e);
      }
    };

    fetchOverloads();
  }, [exercises, isWorkoutActive, user?.id]);

  // Timer interval
  useEffect(() => {
    if (!isWorkoutActive) return;
    const start = startTime || Date.now();
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutActive, startTime]);

  const handleLogSet = (exercise: ExerciseDefinition) => {
    const input = inputs[exercise.id] || { weight: "", reps: "", rpe: "" };
    const w = parseFloat(input.weight);
    const r = parseInt(input.reps, 10);
    const rpe = input.rpe ? parseFloat(input.rpe) : undefined;

    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) {
      toast.error("Please enter valid weight and reps.");
      return;
    }

    playBattleSFX("impact");

    logSet({
      exerciseId: exercise.id,
      weight: w,
      reps: r,
      rpe,
    });

    const e1rm = calculateE1RM(w, r);
    const rankInfo = evaluateRank(e1rm, exercise.name);

    // Crimson Berserker Combustion Particle Flash
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#ef4444", "#f97316", "#f59e0b", "#ffffff"],
    });

    playBattleSFX("impact");

    toast.success(
      <div className="flex items-center gap-2 font-mono">
        <span className="text-white font-bold">
          Set logged: <span className="text-amber-400">{w}kg</span> × <span className="text-amber-400">{r}</span>
        </span>
        <span className="text-xs text-red-400">({e1rm}kg e1RM)</span>
        <Badge className={`${rankInfo.badgeBg} ${rankInfo.badgeBorder} border font-bold text-xs uppercase px-2 shadow-[0_0_10px_rgba(239,68,68,0.3)]`}>
          {rankInfo.rank} RANK
        </Badge>
      </div>
    );

    // Clear inputs for this exercise (keep weight for convenience)
    setInputs((prev) => ({
      ...prev,
      [exercise.id]: { ...prev[exercise.id], reps: "" },
    }));

    // Trigger rest timer
    startRestTimer(90);
  };

  const handleVoiceParse = async (text: string) => {
    if (!sessionId) return;
    setIsVoiceProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/fitness/sessions/${sessionId}/log-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();

        // Ensure exercise is in active session
        if (!exercises.find((e) => e.id === data.exerciseId)) {
          addExercise(data.exercise);
        }

        // Add to local state
        logSet({
          exerciseId: data.exerciseId,
          weight: data.weight,
          reps: data.reps,
          rpe: data.rpe,
        });

        // Auto-fill the input fields for next set
        setInputs((prev) => ({
          ...prev,
          [data.exerciseId]: {
            weight: data.weight.toString(),
            reps: "",
            rpe: data.rpe ? data.rpe.toString() : "",
          },
        }));

        playBattleSFX("impact");
        toast.success(`Voice Logged: ${data.exercise.name} - ${data.weight}kg × ${data.reps}`);
      } else {
        const err = await res.json();
        toast.error(`Voice error: ${err.detail}`);
      }
    } catch (e) {
      toast.error("Failed to process voice log.");
    } finally {
      setIsVoiceProcessing(false);
    }
  };

  const handleFinishWorkout = async () => {
    if (sets.length === 0) {
      toast.error("Log at least one set before finishing.");
      return;
    }

    setIsSubmitting(true);
    playBuffSFX("levelup");
    try {
      const res = await fetch(`${API_BASE_URL}/api/fitness/sessions/${sessionId}/finish`, {
        method: "POST",
      });

      if (res.ok) {
        const result = await res.json();

        if (result.newPRs && result.newPRs.length > 0) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          playAIRASound("SUCCESSFUL");
          toast.success(`New PRs Achieved! ${result.newPRs.length} PRs broken!`);
        }
        if (result.bossDefeated) {
          useDailyBonusStore.getState().recordBossPrDefeat();
          confetti({
            particleCount: 150,
            spread: 100,
            colors: ["#fbbf24", "#f59e0b", "#b45309"],
            origin: { y: 0.5 },
          });
          playAIRASound("ABILITIES_IMPROVED");
          toast.success("WEEKLY BOSS DEFEATED! Weekly Quest Objective Cleared!");
        } else {
          toast.success("Workout session complete! Rewards applied.");
        }

        // Apply 2X Workout Surge Boost if charge available
        useDailyBonusStore.getState().consumeWorkoutCharge();

        await refetch();
        endWorkout();
      } else {
        toast.error("Failed to log workout to server.");
      }
    } catch (e) {
      toast.error("Network error while logging workout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!isWorkoutActive) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[#030712]/98 backdrop-blur-2xl overflow-y-auto pb-28 font-sans theme-crimson-berserker">
      {/* Background Floating Runes */}
      <FloatingRuneField density="medium" className="opacity-30" />

      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 pt-6 animate-in fade-in duration-300 relative z-10 select-none">
        {/* Sticky Header Bar */}
        <div
          className="flex items-center justify-between sticky top-0 bg-[#140e0c] py-3 px-4 z-20 border-b-4 border-[#5c4033] rounded-none"
          style={{
            boxShadow: "0 0 0 2px #261914, 0 8px 0 0 #0d0807, 0 16px 20px rgba(0,0,0,0.8)",
          }}
        >
          {/* Iron Corner Studs */}
          <span className="absolute top-1 left-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
          <span className="absolute top-1 right-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
          <span className="absolute bottom-1 left-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
          <span className="absolute bottom-1 right-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#261914] border-2 border-[#5c4033] flex items-center justify-center text-[#f59e0b]">
              <Dumbbell className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-pixel font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>COLOSSEUM BATTLE SESSION</span>
                <span className="inline-block w-2 h-2 rounded-none bg-[#ef4444] animate-pulse" />
              </h2>
              <div className="flex items-center gap-1.5 text-[#f59e0b] text-xs font-mono font-bold mt-0.5">
                <Timer className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span className="tabular-nums tracking-wider">{formatDuration(duration)}</span>
              </div>
            </div>
          </div>

          <button
            disabled={isSubmitting}
            onClick={handleFinishWorkout}
            className="bg-[#b91c1c] border-2 border-[#ef4444] hover:bg-[#dc2626] text-white font-pixel text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-none cursor-pointer active:translate-y-0.5 flex items-center gap-1.5"
            style={{
              boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.6)",
            }}
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
            FINISH WORKOUT
          </button>
        </div>

        {/* Active Boss PR Objective Banner */}
        {activeBoss && (
          <div
            className="bg-[#1c120f] border-4 border-[#b91c1c] p-4 space-y-3 relative overflow-hidden select-none"
            style={{
              boxShadow: "0 0 0 2px #450a0a, 0 8px 0 0 #0d0807",
            }}
          >
            {/* Iron Corner Studs */}
            <span className="absolute top-1 left-1 font-mono text-[9px] text-[#ef4444] leading-none select-none pointer-events-none">+</span>
            <span className="absolute top-1 right-1 font-mono text-[9px] text-[#ef4444] leading-none select-none pointer-events-none">+</span>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="bg-[#450a0a] text-[#fca5a5] border-2 border-[#ef4444] font-pixel text-[9px] uppercase px-2 py-0.5 tracking-wider flex items-center gap-1">
                  <Swords className="w-3 h-3 text-[#ef4444]" />
                  <span>BOSS PR TARGET</span>
                </div>
                <span className="font-pixel text-[10px] text-[#f59e0b] font-bold">{activeBoss.name}</span>
              </div>
              <div className="font-pixel text-[9px] text-stone-200">
                HP:{" "}
                <span className="text-[#ef4444] tabular-nums font-bold">
                  {Math.max(0, 100 - (activeBoss.currentDamage || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <p className="font-pixel text-[9.5px] text-stone-300 leading-relaxed relative z-10">
              Target: <strong className="text-white font-mono">{activeBoss.targetExercise}</strong> (
              {activeBoss.targetWeight} KG × {activeBoss.targetReps} Reps). Sets logged near or above target deal direct HP damage!
            </p>

            {/* 20-Segment Live Boss HP Bar */}
            <div className="space-y-1 relative z-10">
              <div className="grid grid-cols-20 gap-0.5 p-1 bg-[#0c0a09] border-2 border-[#450a0a]">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const bossHpPct = Math.max(0, 100 - (activeBoss.currentDamage || 0) * 100);
                  const isFilled = idx < Math.round((bossHpPct / 100) * 20);
                  return (
                    <div
                      key={idx}
                      className={`h-3 transition-colors ${
                        isFilled
                          ? "bg-[#b91c1c] border-t border-l border-[#ef4444]"
                          : "bg-[#261914] opacity-30"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Voice Logger Integration */}
        <div className="p-3 bg-[#140e0c] border-2 border-[#4a3830]">
          <VoiceLogger onParsedResult={handleVoiceParse} isProcessing={isVoiceProcessing} />
        </div>

        {/* Exercises Deck */}
        <div className="space-y-4">
          {exercises.map((ex) => {
            const exSets = sets.filter((s) => s.exerciseId === ex.id);
            const highestWeight = exSets.reduce((max, s) => Math.max(max, s.weight), 0);
            const highestReps = exSets.find((s) => s.weight === highestWeight)?.reps || 0;
            const activeE1RM = calculateE1RM(highestWeight, highestReps);

            return (
              <div
                key={ex.id}
                className="bg-[#140e0c] border-2 border-[#4a3830] overflow-hidden select-none"
                style={{
                  boxShadow: "inset 2px 2px 0 #261914, inset -2px -2px 0 #0d0807, 0 4px 0 #0a0706",
                }}
              >
                {/* Exercise Header */}
                <div className="p-3 bg-[#1c1412] border-b-2 border-[#2c1e19] flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-pixel text-xs font-bold text-white">{ex.name}</h3>
                      <div className="bg-[#261914] text-[#f59e0b] border border-[#5c4033] text-[8px] font-pixel uppercase px-1.5 py-0.2">
                        {ex.primaryMuscle}
                      </div>
                    </div>

                    {overloads[ex.id] && (
                      <div className="flex items-center gap-1.5 mt-1 font-pixel text-[9px] text-[#f59e0b]">
                        <Sparkles className="w-3 h-3 text-[#f59e0b]" />
                        <span>
                          Target: {overloads[ex.id].recommendedWeight}kg × {overloads[ex.id].suggestedReps}
                        </span>
                        <button
                          className="w-5 h-5 bg-[#261914] border border-[#5c4033] hover:border-[#f59e0b] text-[#f59e0b] flex items-center justify-center cursor-pointer ml-1"
                          onClick={() => {
                            playUIMenuSFX();
                            setInputs((prev) => ({
                              ...prev,
                              [ex.id]: {
                                weight: overloads[ex.id].recommendedWeight.toString(),
                                reps: overloads[ex.id].suggestedReps.split("-")[0] || "8",
                                rpe: "8",
                              },
                            }));
                            toast.success("Target loaded into inputs");
                          }}
                          title="Auto-fill recommended target"
                        >
                          <Zap className="w-2.5 h-2.5 text-[#f59e0b]" />
                        </button>
                      </div>
                    )}
                  </div>

                  {activeE1RM > 0 && (
                    <div className="text-right font-mono">
                      <span className="block font-pixel text-[8.5px] text-stone-400 uppercase tracking-wider">EST. 1RM</span>
                      <span className="text-sm font-black text-white tabular-nums">
                        {activeE1RM} <span className="font-pixel text-[9px] text-[#f59e0b]">KG</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-3 font-mono">
                  {/* Logged Sets List */}
                  {exSets.map((s, idx) => {
                    const setE1RM = calculateE1RM(s.weight, s.reps);
                    const setRank = evaluateRank(setE1RM, ex.name);

                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between bg-[#0c0a09] p-2.5 border-2 border-[#2c1e19] text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-pixel text-[10px] text-[#f59e0b] font-bold w-4 tabular-nums">#{idx + 1}</span>
                          <span className="font-bold text-white tabular-nums tracking-tight">
                            {s.weight} <span className="text-stone-500 font-normal text-[10px]">kg</span> × {s.reps} <span className="text-stone-500 font-normal text-[10px]">reps</span>
                          </span>
                          {s.rpe && <span className="text-[10px] text-stone-400 font-mono">@ RPE {s.rpe}</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#f59e0b] font-mono tabular-nums">{setE1RM}kg e1RM</span>
                          <div className="px-1.5 py-0.2 border border-[#5c4033] bg-[#261914] font-pixel text-[8px] text-[#f59e0b] uppercase">
                            {setRank.rank}
                          </div>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Input Row */}
                  <div className="grid grid-cols-12 gap-2 items-center pt-1">
                    <div className="col-span-4">
                      <span className="block font-pixel text-[8px] text-[#f59e0b] mb-1 uppercase tracking-wider">WEIGHT (KG)</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-10 bg-[#0c0a09] border-2 border-[#4a3830] focus:border-[#f59e0b] text-center font-mono text-sm font-bold text-white rounded-none tabular-nums"
                        value={inputs[ex.id]?.weight || ""}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            [ex.id]: { ...prev[ex.id], weight: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-3">
                      <span className="block font-pixel text-[8px] text-[#f59e0b] mb-1 uppercase tracking-wider">REPS</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-10 bg-[#0c0a09] border-2 border-[#4a3830] focus:border-[#f59e0b] text-center font-mono text-sm font-bold text-white rounded-none tabular-nums"
                        value={inputs[ex.id]?.reps || ""}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            [ex.id]: { ...prev[ex.id], reps: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-3">
                      <span className="block font-pixel text-[8px] text-[#f59e0b] mb-1 uppercase tracking-wider">RPE</span>
                      <Input
                        type="number"
                        placeholder="8"
                        className="h-10 bg-[#0c0a09] border-2 border-[#4a3830] focus:border-[#f59e0b] text-center font-mono text-sm font-bold text-white rounded-none tabular-nums"
                        value={inputs[ex.id]?.rpe || ""}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            [ex.id]: { ...prev[ex.id], rpe: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-2 pt-4">
                      <button
                        onClick={() => handleLogSet(ex)}
                        className="h-10 w-full bg-[#b91c1c] border-2 border-[#ef4444] hover:bg-[#dc2626] text-white font-pixel flex items-center justify-center cursor-pointer active:translate-y-0.5 rounded-none"
                        style={{
                          boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.6)",
                        }}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Exercise Menu */}
        <div className="pt-2 space-y-2 pb-6">
          <h3 className="font-pixel text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-[#f59e0b]" /> Add Armory Movement to Active Session
          </h3>
          {isLoadingCatalog ? (
            <div className="flex items-center justify-center p-6 text-stone-400 font-pixel text-[10px] gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#f59e0b]" />
              <span>Loading Armory Catalog...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableExercises
                .filter((mex) => !exercises.find((e) => e.id === mex.id))
                .map((mex) => (
                  <button
                    key={mex.id}
                    onClick={() => {
                      playUIMenuSFX();
                      addExercise(mex);
                    }}
                    className="p-2.5 bg-[#140e0c] border-2 border-[#33221b] hover:border-[#4a3830] text-left transition-all cursor-pointer flex items-center gap-2 rounded-none group"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#f59e0b] group-hover:scale-110 transition-transform shrink-0" />
                    <div>
                      <div className="font-pixel text-[10px] font-bold text-stone-200 group-hover:text-white">
                        {mex.name}
                      </div>
                      <div className="text-[9px] text-stone-400 font-mono uppercase mt-0.5">
                        {mex.primaryMuscle} • {mex.equipment}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      <RestTimer />
    </div>
  );
}

const FALLBACK_EXERCISES: ExerciseDefinition[] = [
  { id: "ex1", name: "Barbell Bench Press", primaryMuscle: "Chest", equipment: "Barbell" },
  { id: "ex2", name: "Barbell Back Squat", primaryMuscle: "Legs", equipment: "Barbell" },
  { id: "ex3", name: "Barbell Deadlift", primaryMuscle: "Back", equipment: "Barbell" },
  { id: "ex4", name: "Overhead Barbell Press", primaryMuscle: "Shoulders", equipment: "Barbell" },
  { id: "ex5", name: "Dumbbell Bicep Curl", primaryMuscle: "Arms", equipment: "Dumbbell" },
  { id: "ex6", name: "Barbell Row", primaryMuscle: "Back", equipment: "Barbell" },
];
