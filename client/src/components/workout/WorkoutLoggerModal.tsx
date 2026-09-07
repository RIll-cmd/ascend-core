"use client";

import React, { useState, useEffect } from "react";
import {
  EnrichedExercise,
  LoggedSetInput,
  LogWorkoutPayload,
} from "@/features/workouts/types/muscleRecovery";
import { useWorkoutStore } from "@/features/workouts/store/useWorkoutStore";
import { useUser } from "@/context/UserContext";
import {
  PixelDumbbellIcon,
  PixelCloseIcon,
  PixelSearchIcon,
  PixelTrashIcon,
  PixelPlusIcon,
  PixelCheckIcon,
} from "@/components/ui/pixel/PixelIcons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { playBattleSFX, playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { MuscleIndicatorBadge } from "./MuscleIndicatorBadge";

interface WorkoutLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialExerciseId?: string;
}

interface SetEntry {
  id: string;
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
}

export const WorkoutLoggerModal: React.FC<WorkoutLoggerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialExerciseId,
}) => {
  const { user } = useUser();
  const characterId = user?.id || "guest-character";
  const {
    availableExercises,
    fetchAvailableExercises,
    logCompletedWorkout,
  } = useWorkoutStore();

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [weightUnit, setWeightUnit] = useState<"KG" | "LBS">("KG");
  const [sets, setSets] = useState<SetEntry[]>([
    { id: "set-1", weight: 60, reps: 10, rpe: 8.0, completed: true },
    { id: "set-2", weight: 65, reps: 8, rpe: 8.5, completed: true },
    { id: "set-3", weight: 70, reps: 6, rpe: 9.0, completed: true },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableExercises();
    }
  }, [isOpen, fetchAvailableExercises]);

  useEffect(() => {
    if (availableExercises.length > 0 && !selectedExerciseId) {
      if (initialExerciseId) {
        setSelectedExerciseId(initialExerciseId);
      } else {
        setSelectedExerciseId(availableExercises[0].id);
      }
    }
  }, [availableExercises, initialExerciseId, selectedExerciseId]);

  if (!isOpen) return null;

  const filteredExercises = availableExercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedExercise =
    availableExercises.find((e) => e.id === selectedExerciseId) ||
    availableExercises[0];

  const handleAddSet = () => {
    playUIMenuSFX("click");
    const lastSet = sets[sets.length - 1];
    setSets((prev) => [
      ...prev,
      {
        id: `set-${Date.now()}`,
        weight: lastSet ? lastSet.weight : 50,
        reps: lastSet ? lastSet.reps : 10,
        rpe: lastSet ? lastSet.rpe : 8.0,
        completed: true,
      },
    ]);
  };

  const handleRemoveSet = (index: number) => {
    playUIMenuSFX("click");
    if (sets.length <= 1) return;
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSet = (
    index: number,
    field: keyof SetEntry,
    value: number | boolean
  ) => {
    setSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!selectedExercise) {
      toast.error("Please select an exercise");
      return;
    }

    const validSets = sets.filter((s) => s.completed && s.reps > 0);
    if (validSets.length === 0) {
      toast.error("Please log at least one completed set");
      return;
    }

    setIsSubmitting(true);
    playBattleSFX("crit");

    try {
      const payload: LogWorkoutPayload = {
        characterId,
        durationSeconds: durationMinutes * 60,
        sets: validSets.map((s) => ({
          exerciseId: selectedExercise.id,
          weight: weightUnit === "LBS" ? Math.round(s.weight * 0.453592) : s.weight,
          reps: s.reps,
          rpe: s.rpe,
        })),
        bodyweight: 75.0,
      };

      const result = await logCompletedWorkout(payload);
      playBuffSFX("buff");

      toast.success("Workout Telemetry Logged!", {
        description: `+${result.rewards?.exp ?? 150} EXP, +${
          result.rewards?.gold ?? 50
        } Gold, and muscle fatigue applied to ${selectedExercise.primaryMuscle}!`,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to log workout session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#140e0c] border-4 border-[#5c4033] p-5 sm:p-6 text-stone-100 space-y-5 max-h-[90vh] flex flex-col rounded-none select-none"
        style={{
          boxShadow: "0 0 0 2px #261914, 0 12px 0 0 #0d0807, 0 24px 36px rgba(0,0,0,0.9)",
        }}
      >
        {/* Iron Corner Studs */}
        <span className="absolute top-1 left-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
        <span className="absolute top-1 right-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
        <span className="absolute bottom-1 left-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
        <span className="absolute bottom-1 right-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#2c1e19] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#261914] border-2 border-[#5c4033] flex items-center justify-center text-[#f59e0b]">
              <PixelDumbbellIcon className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <div>
              <span className="font-pixel text-[8.5px] text-[#f59e0b] uppercase tracking-wider block font-bold">
                WORKOUT TRACKER
              </span>
              <h3 className="font-pixel text-sm font-bold text-white tracking-tight mt-0.5">
                Log Workout & Track Recovery
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 bg-[#261914] border-2 border-[#4a3830] hover:border-[#ef4444] text-stone-400 hover:text-[#ef4444] flex items-center justify-center cursor-pointer transition-colors"
          >
            <PixelCloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {/* Exercise Search & Selection Bar */}
          <div className="space-y-2">
            <label className="font-pixel text-[9px] text-[#f59e0b] flex items-center justify-between uppercase tracking-wider">
              <span>SELECT EXERCISE</span>
              <span className="text-stone-400 font-normal">
                [{availableExercises.length} Exercises Available]
              </span>
            </label>

            <div className="relative">
              <PixelSearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="text"
                placeholder="Search by name, muscle (e.g. Chest, Quads, Back)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#0c0a09] border-2 border-[#4a3830] focus:border-[#f59e0b] font-mono text-xs text-white placeholder:text-stone-600 focus:outline-none rounded-none"
              />
            </div>

            {/* Quick Exercise Carousel/Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {filteredExercises.slice(0, 9).map((ex) => {
                const isSel = ex.id === selectedExerciseId;
                return (
                  <button
                    key={ex.id}
                    onClick={() => {
                      playUIMenuSFX("click");
                      setSelectedExerciseId(ex.id);
                    }}
                    className={`p-2 border-2 text-left transition-all cursor-pointer rounded-none select-none ${
                      isSel
                        ? "bg-[#261914] border-[#f59e0b] text-white"
                        : "bg-[#0c0a09] border-[#33221b] text-stone-300 hover:border-[#4a3830]"
                    }`}
                    style={{
                      boxShadow: isSel
                        ? "inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.5)"
                        : undefined,
                    }}
                  >
                    <div className="font-pixel text-[10px] font-bold text-white truncate">
                      {ex.name}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-pixel text-[8px] text-[#f59e0b] px-1 py-0.2 bg-[#1c1412] border border-[#5c4033]">
                        {ex.primaryMuscle}
                      </span>
                      <span className="text-[8.5px] font-mono text-stone-400">
                        {ex.equipment}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Exercise Target Telemetry Preview */}
          {selectedExercise && (
            <div className="p-3 bg-[#0c0a09] border-2 border-[#4a3830] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-pixel text-[8.5px] text-stone-400 uppercase tracking-wider block">
                  TARGET MUSCLE
                </span>
                <span className="font-pixel text-xs font-bold text-[#f59e0b] block mt-0.5">
                  {selectedExercise.name}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  <MuscleIndicatorBadge
                    muscleKey={selectedExercise.primaryMuscle}
                    name={`Primary: ${selectedExercise.primaryMuscle}`}
                    size="sm"
                    status="FATIGUED"
                  />
                  {selectedExercise.secondaryMuscles?.map((sec) => (
                    <MuscleIndicatorBadge
                      key={sec}
                      muscleKey={sec}
                      name={`Assisting: ${sec}`}
                      size="sm"
                      status="RECOVERING"
                    />
                  ))}
                </div>
              </div>

              {/* Weight Unit & Duration Setting */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center bg-[#140e0c] border-2 border-[#4a3830] p-0.5">
                  <button
                    onClick={() => setWeightUnit("KG")}
                    className={`px-2 py-0.5 font-pixel text-[9px] font-bold transition-all ${
                      weightUnit === "KG"
                        ? "bg-[#b91c1c] text-white border border-[#ef4444]"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    KG
                  </button>
                  <button
                    onClick={() => setWeightUnit("LBS")}
                    className={`px-2 py-0.5 font-pixel text-[9px] font-bold transition-all ${
                      weightUnit === "LBS"
                        ? "bg-[#b91c1c] text-white border border-[#ef4444]"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    LBS
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-[#140e0c] border-2 border-[#4a3830] px-2 py-1 font-pixel text-[9px]">
                  <span className="text-stone-400">TIME:</span>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) =>
                      setDurationMinutes(Math.max(5, parseInt(e.target.value) || 30))
                    }
                    className="w-8 bg-transparent text-[#f59e0b] font-bold text-center focus:outline-none tabular-nums font-mono text-xs"
                  />
                  <span className="text-stone-400">MIN</span>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Sets Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-pixel text-[9px] text-stone-300">
              <span className="uppercase tracking-wider">SETS LOGGED</span>
              <span className="text-[#f59e0b] tabular-nums font-bold">[{sets.length} SETS TOTAL]</span>
            </div>

            <div className="space-y-1.5">
              {sets.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 p-2 bg-[#0c0a09] border-2 border-[#2c1e19]"
                >
                  <span className="w-6 text-center font-pixel text-[10px] text-[#f59e0b] font-bold tabular-nums">
                    #{idx + 1}
                  </span>

                  {/* Weight Input */}
                  <div className="flex-1 flex items-center gap-1 bg-[#140e0c] border-2 border-[#4a3830] px-2 py-1">
                    <span className="font-pixel text-[8.5px] text-stone-400">WT:</span>
                    <input
                      type="number"
                      value={s.weight}
                      onChange={(e) =>
                        handleUpdateSet(
                          idx,
                          "weight",
                          Math.max(0, parseFloat(e.target.value) || 0)
                        )
                      }
                      className="w-full bg-transparent font-mono text-xs font-bold text-white focus:outline-none tabular-nums"
                    />
                    <span className="font-pixel text-[8.5px] text-stone-400">
                      {weightUnit}
                    </span>
                  </div>

                  {/* Reps Input */}
                  <div className="flex-1 flex items-center gap-1 bg-[#140e0c] border-2 border-[#4a3830] px-2 py-1">
                    <span className="font-pixel text-[8.5px] text-stone-400">REPS:</span>
                    <input
                      type="number"
                      value={s.reps}
                      onChange={(e) =>
                        handleUpdateSet(
                          idx,
                          "reps",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-full bg-transparent font-mono text-xs font-bold text-white focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* RPE Selector */}
                  <div className="w-20 flex items-center gap-1 bg-[#140e0c] border-2 border-[#4a3830] px-2 py-1">
                    <span className="font-pixel text-[8.5px] text-stone-400">RPE:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="6.0"
                      max="10.0"
                      value={s.rpe}
                      onChange={(e) =>
                        handleUpdateSet(
                          idx,
                          "rpe",
                          parseFloat(e.target.value) || 8.0
                        )
                      }
                      className="w-full bg-transparent font-mono text-xs font-bold text-[#f59e0b] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveSet(idx)}
                    disabled={sets.length <= 1}
                    className="p-1 text-stone-500 hover:text-[#ef4444] disabled:opacity-20 cursor-pointer"
                  >
                    <PixelTrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddSet}
              className="w-full h-8 bg-[#261914] border-2 border-dashed border-[#5c4033] hover:border-[#f59e0b] text-[#f59e0b] font-pixel text-[9px] font-bold flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <PixelPlusIcon className="w-3.5 h-3.5" />
              ADD ANOTHER SET
            </button>
          </div>
        </div>

        {/* Footer / Submit Bar */}
        <div className="pt-3 border-t-2 border-[#2c1e19] flex items-center justify-between gap-4 shrink-0">
          <div className="font-pixel text-[9px] text-stone-400">
            XP: <span className="text-[#f59e0b] font-bold">+{sets.length * 50} EXP</span> • BOSS DMG:{" "}
            <span className="text-[#ef4444] font-bold">APPLIED</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 px-5 bg-[#b91c1c] border-2 border-[#ef4444] hover:bg-[#dc2626] text-white font-pixel font-bold text-[10px] uppercase tracking-wider cursor-pointer active:translate-y-0.5 flex items-center gap-2"
            style={{
              boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.6)",
            }}
          >
            {isSubmitting ? (
              "PROCESSING..."
            ) : (
              <>
                <PixelCheckIcon className="w-3.5 h-3.5" />
                SAVE WORKOUT LOG
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
