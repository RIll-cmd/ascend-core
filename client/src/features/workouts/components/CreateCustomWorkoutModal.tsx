"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWorkoutStore, ExerciseDefinition } from "../store/useWorkoutStore";
import {
  PixelDumbbellIcon,
  PixelPlusIcon,
  PixelCheckIcon,
  PixelCloseIcon,
  PixelTrashIcon,
  PixelSparklesIcon,
  PixelActivityIcon,
  PixelLayersIcon,
} from "@/components/ui/pixel/PixelIcons";
import { toast } from "sonner";
import { FloatingRuneField } from "@/components/shared/FloatingRuneField";
import { playUIMenuSFX, playBuffSFX } from "@/utils/audio";
import { API_BASE_URL } from "@/constants";

interface CreateCustomWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCustomWorkoutModal({ isOpen, onClose }: CreateCustomWorkoutModalProps) {
  const { addCustomTemplate } = useWorkoutStore();
  const [planName, setPlanName] = useState("");
  const [targetFocus, setTargetFocus] = useState("");
  const [availableCatalog, setAvailableCatalog] = useState<ExerciseDefinition[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/workouts/exercises`);
        if (res.ok) {
          const data = await res.json();
          setAvailableCatalog(data);
        } else {
          setAvailableCatalog(DEFAULT_CATALOG);
        }
      } catch (e) {
        setAvailableCatalog(DEFAULT_CATALOG);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, [isOpen]);

  const toggleSelectExercise = (exercise: ExerciseDefinition) => {
    playUIMenuSFX("hover");
    if (selectedExercises.find((e) => e.id === exercise.id)) {
      setSelectedExercises((prev) => prev.filter((e) => e.id !== exercise.id));
    } else {
      setSelectedExercises((prev) => [...prev, exercise]);
    }
  };

  const handleSavePlan = () => {
    if (!planName.trim()) {
      toast.error("Please enter a routine name for your custom plan.");
      return;
    }
    if (selectedExercises.length === 0) {
      toast.error("Select at least 1 exercise for your custom plan.");
      return;
    }

    const defaultTarget = selectedExercises
      .map((e) => e.primaryMuscle)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(" • ");

    addCustomTemplate(planName, targetFocus.trim() || defaultTarget, selectedExercises);
    playBuffSFX("buff");
    toast.success(`Custom plan "${planName}" created successfully!`);

    // Reset and close
    setPlanName("");
    setTargetFocus("");
    setSelectedExercises([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-xl bg-[#140e0c] border-4 border-[#5c4033] text-stone-100 p-6 rounded-none select-none"
        style={{
          boxShadow: "0 0 0 2px #261914, 0 12px 0 0 #0d0807, 0 20px 30px rgba(0,0,0,0.85)",
        }}
      >
        {/* Iron Corner Studs */}
        <span className="absolute top-1 left-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
        <span className="absolute top-1 right-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
        <span className="absolute bottom-1 left-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
        <span className="absolute bottom-1 right-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>

        <DialogHeader className="border-b-2 border-[#2c1e19] pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#261914] border-2 border-[#5c4033] flex items-center justify-center text-[#f59e0b]">
              <PixelDumbbellIcon className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <div>
              <DialogTitle className="text-sm font-pixel font-bold text-white uppercase tracking-wider flex items-center gap-2">
                CREATE CUSTOM WORKOUT ROUTINE
              </DialogTitle>
              <p className="text-[10px] text-stone-400 font-pixel mt-0.5">
                Create custom exercise sequences for your workout routines
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 max-h-[60vh] overflow-y-auto pr-1 relative z-10 custom-scrollbar">
          {/* Plan Name & Target Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-pixel text-[9px] text-[#f59e0b] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <PixelSparklesIcon className="w-3 h-3 text-[#f59e0b]" />
                Routine Name
              </label>
              <Input
                placeholder="e.g. Upper Body Strength"
                className="bg-[#0c0a09] border-2 border-[#4a3830] focus:border-[#f59e0b] font-mono text-xs text-white rounded-none placeholder:text-stone-600 h-10"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-pixel text-[9px] text-[#f59e0b] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <PixelActivityIcon className="w-3 h-3 text-[#f59e0b]" />
                Target Muscle Focus (Optional)
              </label>
              <Input
                placeholder="e.g. Chest • Shoulders • Arms"
                className="bg-[#0c0a09] border-2 border-[#4a3830] focus:border-[#f59e0b] font-mono text-xs text-white rounded-none placeholder:text-stone-600 h-10"
                value={targetFocus}
                onChange={(e) => setTargetFocus(e.target.value)}
              />
            </div>
          </div>

          {/* Selected Exercises Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-[9px] text-[#f59e0b] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <PixelLayersIcon className="w-3.5 h-3.5" />
                Selected Exercises ({selectedExercises.length})
              </span>
              {selectedExercises.length > 0 && (
                <button
                  onClick={() => {
                    playUIMenuSFX("decline");
                    setSelectedExercises([]);
                  }}
                  className="font-pixel text-[8px] text-[#ef4444] hover:text-red-300 uppercase cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {selectedExercises.length === 0 ? (
              <div className="p-3 bg-[#0c0a09] border-2 border-dashed border-[#4a3830] text-center font-pixel text-[9px] text-stone-500">
                Click exercises below to add them to your routine.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 p-2.5 bg-[#0c0a09] border-2 border-[#4a3830]">
                {selectedExercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-[#261914] text-[#f59e0b] border-2 border-[#5c4033] flex items-center gap-1.5 px-2.5 py-1 font-pixel text-[9px] uppercase tracking-wider"
                    style={{
                      boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.1), inset -1px -1px 0 rgba(0,0,0,0.4)"
                    }}
                  >
                    <span>{ex.name}</span>
                    <button
                      onClick={() => toggleSelectExercise(ex)}
                      className="hover:text-[#ef4444] text-stone-400 ml-1 cursor-pointer transition-colors"
                    >
                      <PixelCloseIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Catalog Selection List */}
          <div>
            <span className="block font-pixel text-[9px] text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <PixelDumbbellIcon className="w-3.5 h-3.5 text-[#f59e0b]" />
              Exercise Catalog
            </span>

            {isLoading ? (
              <div className="text-center p-6 text-stone-500 font-pixel text-[10px]">Loading Exercises...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {availableCatalog.map((ex) => {
                  const isSelected = !!selectedExercises.find((e) => e.id === ex.id);
                  return (
                    <button
                      key={ex.id}
                      onClick={() => toggleSelectExercise(ex)}
                      className={`p-2.5 border-2 text-left flex items-center justify-between transition-all cursor-pointer rounded-none select-none ${
                        isSelected
                          ? "bg-[#261914] border-[#f59e0b] text-white"
                          : "bg-[#0c0a09] border-[#33221b] text-stone-300 hover:border-[#4a3830] hover:bg-[#140e0c]"
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? "inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.5)"
                          : undefined,
                      }}
                    >
                      <div>
                        <div className="font-pixel text-[10px] font-bold">{ex.name}</div>
                        <div className="text-[9px] text-stone-400 font-mono mt-0.5">
                          {ex.primaryMuscle} • {ex.equipment}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-none flex items-center justify-center border-2 text-xs font-bold shrink-0 ${
                          isSelected
                            ? "bg-[#b91c1c] border-[#ef4444] text-white"
                            : "border-[#4a3830] bg-[#140e0c] text-stone-500"
                        }`}
                      >
                        {isSelected ? <PixelCheckIcon className="w-3.5 h-3.5" /> : <PixelPlusIcon className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t-2 border-[#2c1e19] pt-3 flex justify-end gap-2 relative z-10">
          <button
            onClick={() => {
              playUIMenuSFX("decline");
              onClose();
            }}
            className="px-4 py-2 bg-[#261914] border-2 border-[#4a3830] hover:border-stone-400 text-stone-400 hover:text-white font-pixel text-[10px] cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={handleSavePlan}
            className="px-5 py-2 bg-[#b91c1c] border-2 border-[#ef4444] hover:bg-[#dc2626] text-white font-pixel text-[10px] font-bold uppercase tracking-wider cursor-pointer active:translate-y-0.5"
            style={{
              boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.5)",
            }}
          >
            SAVE ROUTINE
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const DEFAULT_CATALOG: ExerciseDefinition[] = [
  { id: "ex1", name: "Barbell Bench Press", primaryMuscle: "Chest", equipment: "Barbell" },
  { id: "ex2", name: "Barbell Back Squat", primaryMuscle: "Legs", equipment: "Barbell" },
  { id: "ex3", name: "Barbell Deadlift", primaryMuscle: "Back", equipment: "Barbell" },
  { id: "ex4", name: "Overhead Barbell Press", primaryMuscle: "Shoulders", equipment: "Barbell" },
  { id: "ex5", name: "Dumbbell Bicep Curl", primaryMuscle: "Arms", equipment: "Dumbbell" },
  { id: "ex6", name: "Lat Pulldown", primaryMuscle: "Back", equipment: "Cable" },
];

