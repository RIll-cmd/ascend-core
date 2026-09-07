"use client";

import React, { useState, useEffect } from "react";
import { Habit, HabitDifficulty, ScheduleType } from "../types";
import { useHabitStore } from "../store/useHabitStore";
import { toast } from "sonner";
import {
  PixelXIcon,
  PixelSaveIcon,
  PixelPencilIcon,
  PixelCalendarIcon,
} from "@/components/ui/pixel/PixelIcons";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";

interface EditHabitModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

export const EditHabitModal: React.FC<EditHabitModalProps> = ({ habit, isOpen, onClose }) => {
  const { updateHabitDetails } = useHabitStore();

  const normalTier = habit.tiers?.find((t) => t.tier === "NORMAL");
  const initialTargetVal = normalTier?.targetValue || 1;
  const initialUnit = normalTier?.targetUnit || "";

  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || "");
  const [category, setCategory] = useState(habit.category || "Health");
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(habit.difficulty);
  const [primaryStat, setPrimaryStat] = useState<string>(habit.primaryStat);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(habit.scheduleType);
  const [preferredTime, setPreferredTime] = useState(habit.preferredTime || "");
  
  // Frequency & Targets
  const [targetValue, setTargetValue] = useState<number>(initialTargetVal);
  const [targetUnit, setTargetUnit] = useState<string>(initialUnit);
  const [timesPerWeek, setTimesPerWeek] = useState<number>(habit.schedule?.timesPerWeek || 3);
  const [timesPerMonth, setTimesPerMonth] = useState<number>(habit.schedule?.timesPerMonth || 10);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || "");
      setCategory(habit.category || "Health");
      setDifficulty(habit.difficulty);
      setPrimaryStat(habit.primaryStat);
      setScheduleType(habit.scheduleType);
      setPreferredTime(habit.preferredTime || "");
      const norm = habit.tiers?.find((t) => t.tier === "NORMAL");
      setTargetValue(norm?.targetValue || 1);
      setTargetUnit(norm?.targetUnit || "");
      setTimesPerWeek(habit.schedule?.timesPerWeek || 3);
      setTimesPerMonth(habit.schedule?.timesPerMonth || 10);
    }
  }, [habit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Habit name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedTiers = [
        {
          tier: "MINI" as const,
          targetType: "COUNT",
          targetValue: Math.max(1, Math.floor(targetValue / 2)),
          targetUnit: targetUnit,
          baseExp: 25,
          baseGold: 10,
          statReward: 1,
        },
        {
          tier: "NORMAL" as const,
          targetType: "COUNT",
          targetValue: targetValue,
          targetUnit: targetUnit,
          baseExp: 50,
          baseGold: 20,
          statReward: 2,
        },
        {
          tier: "ELITE" as const,
          targetType: "COUNT",
          targetValue: targetValue + 2,
          targetUnit: targetUnit,
          baseExp: 100,
          baseGold: 40,
          statReward: 4,
        },
      ];

      const payload = {
        name,
        description,
        category,
        difficulty,
        primaryStat,
        scheduleType,
        preferredTime: preferredTime || null,
        schedule: {
          timesPerWeek: scheduleType === "X_TIMES_WEEK" ? timesPerWeek : null,
          timesPerMonth: scheduleType === "MONTHLY" ? timesPerMonth : null,
        },
        tiers: updatedTiers,
      };

      const result = await updateHabitDetails(habit.id, payload);
      if (result) {
        playBuffSFX();
        toast.success("Habit updated successfully!");
        onClose();
      } else {
        toast.error("Failed to update habit.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving habit changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 font-pixel select-none animate-in fade-in duration-150">
      <div className="bg-[#1A102F] border-4 border-[#3b1861] shadow-[0_-4px_0_0_#000,0_4px_0_0_#000,-4px_0_0_0_#000,4px_0_0_0_#000] w-full max-w-xl max-h-[90vh] overflow-y-auto text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#3b1861] bg-[#120824]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1A0D2E] border-2 border-[#3b1861] flex items-center justify-center text-cyan-400">
              <PixelPencilIcon className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold pixel-text-outlined uppercase text-white">
                Edit Habit
              </h2>
              <p className="text-[9px] text-white/50 uppercase">
                Configure frequency, targets, and rewards
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playUIMenuSFX();
              onClose();
            }}
            className="w-7 h-7 bg-[#1A0D2E] border border-[#3b1861] text-white/60 hover:text-white flex items-center justify-center cursor-pointer active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Close Modal"
          >
            <PixelXIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                HABIT NAME *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#120824] border-2 border-[#3b1861] focus:border-cyan-400 px-3 py-2 text-white text-xs focus:outline-none"
                placeholder="e.g., Drink 2.5L Water"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#120824] border-2 border-[#3b1861] focus:border-cyan-400 px-3 py-2 text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="Health">Health</option>
                <option value="Fitness">Fitness</option>
                <option value="Mindset">Mindset</option>
                <option value="Productivity">Productivity</option>
                <option value="Finance">Finance</option>
                <option value="Daily Routine">Daily Routine</option>
                <option value="Learning">Learning</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
              DESCRIPTION / REASON (OPTIONAL)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#120824] border-2 border-[#3b1861] focus:border-cyan-400 px-3 py-2 text-white text-xs focus:outline-none resize-none"
              placeholder="e.g., Maintain high energy and hydration levels throughout the day."
            />
          </div>

          {/* Schedule & Target Frequency */}
          <div className="p-3 bg-[#120824] border-2 border-[#3b1861] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase">
              <PixelCalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Frequency & Schedule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-white/60 uppercase mb-1">
                  SCHEDULE INTERVAL
                </label>
                <select
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                  className="w-full bg-[#1A0D2E] border border-[#3b1861] px-2.5 py-1.5 text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
                >
                  <option value="DAILY">DAILY</option>
                  <option value="X_TIMES_WEEK">X TIMES PER WEEK</option>
                  <option value="MONTHLY">MONTHLY</option>
                  <option value="SPECIFIC_DAYS">SPECIFIC DAYS</option>
                </select>
              </div>

              {scheduleType === "DAILY" && (
                <div>
                  <label className="block text-[9px] font-bold text-white/60 uppercase mb-1">
                    TARGET DAILY AMOUNT
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#1A0D2E] border border-[#3b1861] px-2.5 py-1.5 text-cyan-300 font-bold text-xs focus:border-cyan-400 focus:outline-none"
                    placeholder="e.g., 8 (glasses of water)"
                  />
                </div>
              )}

              {scheduleType === "X_TIMES_WEEK" && (
                <div>
                  <label className="block text-[9px] font-bold text-white/60 uppercase mb-1">
                    TIMES PER WEEK
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={timesPerWeek}
                    onChange={(e) => setTimesPerWeek(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#1A0D2E] border border-[#3b1861] px-2.5 py-1.5 text-cyan-300 font-bold text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}

              {scheduleType === "MONTHLY" && (
                <div>
                  <label className="block text-[9px] font-bold text-white/60 uppercase mb-1">
                    TIMES PER MONTH
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={timesPerMonth}
                    onChange={(e) => setTimesPerMonth(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#1A0D2E] border border-[#3b1861] px-2.5 py-1.5 text-cyan-300 font-bold text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Target Unit */}
            <div>
              <label className="block text-[9px] font-bold text-white/60 uppercase mb-1">
                MEASUREMENT UNIT
              </label>
              <input
                type="text"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full bg-[#1A0D2E] border border-[#3b1861] px-2.5 py-1.5 text-white text-xs focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., Glasses, Pages, Reps, Minutes"
              />
            </div>
          </div>

          {/* Difficulty & Primary Stat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                HABIT DIFFICULTY
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as HabitDifficulty)}
                className="w-full bg-[#120824] border-2 border-[#3b1861] focus:border-cyan-400 px-3 py-2 text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="EASY">EASY (&lt; 10 mins • Standard Rewards)</option>
                <option value="MEDIUM">MEDIUM (15–30 mins • Balanced Rewards)</option>
                <option value="HARD">HARD (45+ mins • High Rewards)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                PRIMARY STAT BOOST
              </label>
              <select
                value={primaryStat}
                onChange={(e) => setPrimaryStat(e.target.value)}
                className="w-full bg-[#120824] border-2 border-[#3b1861] focus:border-cyan-400 px-3 py-2 text-white text-xs focus:outline-none cursor-pointer capitalize"
              >
                <option value="discipline">Discipline (Habit Willpower)</option>
                <option value="consistency">Consistency (Streak Stability)</option>
                <option value="focus">Focus (Deep Concentration)</option>
                <option value="strength">Strength (Physical Power)</option>
                <option value="endurance">Endurance (Stamina)</option>
                <option value="knowledge">Knowledge (Mental Acuity)</option>
                <option value="recovery">Recovery (Rest & Balance)</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-[#3b1861]">
            <PixelButton
              type="button"
              variant="dark"
              size="sm"
              onClick={() => {
                playUIMenuSFX();
                onClose();
              }}
            >
              Cancel
            </PixelButton>
            <PixelButton
              type="submit"
              variant="cyan"
              size="sm"
              disabled={isSaving}
            >
              <PixelSaveIcon className="w-3.5 h-3.5 mr-1" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </PixelButton>
          </div>
        </form>
      </div>
    </div>
  );
};
