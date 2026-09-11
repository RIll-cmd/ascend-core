"use client";

import React, { useState } from "react";
import {
  Target,
  Dumbbell,
  HeartPulse,
  BookOpen,
  Shield,
  Zap,
  Activity,
} from "lucide-react";
import { Mission, Habit, CompletionType, HabitDifficulty } from "../types";
import { getBaseReward, calculateFinalReward } from "../utils";
import { playUISound } from "@/utils/audio";
import { FieldBrassButton, WaxSealCheck } from "@/components/ui/field";

export interface MissionCardProps {
  mission: Mission;
  onComplete: (
    missionId: string,
    habit: Habit,
    completionType: CompletionType
  ) => void;
}

const STAT_ICONS: Record<string, any> = {
  strength: Dumbbell,
  knowledge: BookOpen,
  discipline: Shield,
  focus: Target,
  endurance: Zap,
  recovery: HeartPulse,
  consistency: Activity,
};

export function MissionCard({ mission, onComplete }: MissionCardProps) {
  const [showBurst, setShowBurst] = useState(false);
  const [burstExp, setBurstExp] = useState(0);

  const habit =
    mission.habit ||
    ({
      id: mission.habitId || "habit-default",
      characterId: mission.characterId,
      name: "Daily Routine Mission",
      category: "General",
      difficulty: "EASY" as HabitDifficulty,
      primaryStat: "discipline",
      status: "ACTIVE",
      scheduleType: "DAILY",
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Habit);

  const difficulty = (habit.difficulty || "EASY") as HabitDifficulty;
  const baseReward = getBaseReward(difficulty);
  const miniReward = calculateFinalReward(baseReward, "MINI");
  const normalReward = calculateFinalReward(baseReward, "NORMAL");
  const eliteReward = calculateFinalReward(baseReward, "ELITE");

  const StatIcon = STAT_ICONS[habit.primaryStat?.toLowerCase()] || Target;
  const isCompleted = mission.status === "COMPLETED";

  const handleComplete = (type: CompletionType, exp: number) => {
    setBurstExp(exp);
    setShowBurst(true);
    playUISound("/sounds/General/8_Buffs_Heals_SFX/02_Heal_02.wav");
    onComplete(mission.id, habit, type);
    setTimeout(() => setShowBurst(false), 2000);
  };

  return (
    <div
      className={`p-3.5 bg-[#17120c] border rounded-sm relative overflow-hidden select-none transition-all duration-200 ${
        isCompleted
          ? "border-[#10b981]/50 bg-[#0f2016]"
          : "border-[#c59b27]/30 hover:border-[#c59b27]/60 shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
      }`}
    >
      {/* Task Completion Burst Particles & Floating Text */}
      {showBurst && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="font-expedition text-sm font-bold text-[#ffd875] drop-shadow-[0_2px_4px_#000] animate-[pixel-burst_1.2s_steps(8)_forwards]">
            +{burstExp} EXP!
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#d4a373] border border-[#130f0a] animate-[pixel-burst_0.8s_steps(6)_forwards]"
              style={{
                top: `${40 + (i % 3) * 10}%`,
                left: `${30 + (i * 7) % 50}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="space-y-2.5 relative z-10">
        {/* Header Badges & Title */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-[#251c14] border border-[#c59b27]/40 text-[10px] font-expedition uppercase text-[#c59b27] font-bold rounded-xs">
                {habit.category || "General"}
              </span>
              <span
                className={`px-1.5 py-0.5 border text-[10px] font-expedition uppercase font-bold rounded-xs ${
                  difficulty === "HARD"
                    ? "bg-[#331111] border-[#ef4444]/60 text-[#fca5a5]"
                    : difficulty === "MEDIUM"
                    ? "bg-[#2d2211] border-[#f59e0b]/60 text-[#fde68a]"
                    : "bg-[#11291b] border-[#10b981]/60 text-[#a7f3d0]"
                }`}
              >
                {difficulty}
              </span>
            </div>
            <h4
              className={`font-expedition text-xs sm:text-sm font-bold truncate ${
                isCompleted ? "text-[#f5dab0]/60 line-through" : "text-[#f5dab0]"
              }`}
            >
              {habit.name}
            </h4>
          </div>

          <div className="flex items-center gap-1.5 bg-[#130f0a] px-2 py-1 border border-[#c59b27]/40 text-[11px] font-expedition text-[#ffd875] font-bold rounded-xs flex-shrink-0">
            <StatIcon className="w-3.5 h-3.5 text-[#c59b27]" />
            <span className="capitalize">{habit.primaryStat}</span>
          </div>
        </div>

        {/* COMPLETED STATE: WAX SEAL IMPRESSION */}
        {isCompleted ? (
          <div className="p-2.5 bg-[#0a1811] border border-[#10b981]/40 rounded-xs flex items-center justify-between font-expedition text-xs">
            <div className="flex items-center gap-2 text-[#a7f3d0] font-bold">
              <WaxSealCheck completed={true} size="sm" />
              <span>SEALED & CLEARED ({mission.completionType || "NORMAL"})</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[#ffd875] font-bold">
              <span>+{mission.expEarned || normalReward.exp} EXP</span>
              <span>+{mission.statsEarned || normalReward.stat} STAT</span>
            </div>
          </div>
        ) : (
          /* PENDING TIER BRASS BUTTONS */
          <div className="pt-2 border-t border-[#c59b27]/20 space-y-1">
            <div className="grid grid-cols-3 gap-2">
              <FieldBrassButton
                size="sm"
                variant="walnut"
                onClick={() => handleComplete("MINI", miniReward.exp)}
                className="flex flex-col py-1.5 h-auto text-[10px]"
              >
                <span>MINI (40%)</span>
                <span className="font-mono text-[#ffd875] mt-0.5">+{miniReward.exp} EXP</span>
              </FieldBrassButton>

              <FieldBrassButton
                size="sm"
                variant="brass"
                onClick={() => handleComplete("NORMAL", normalReward.exp)}
                className="flex flex-col py-1.5 h-auto text-[10px]"
              >
                <span>NORMAL</span>
                <span className="font-mono text-[#130f0a] font-black mt-0.5">+{normalReward.exp} EXP</span>
              </FieldBrassButton>

              <FieldBrassButton
                size="sm"
                variant="brass"
                onClick={() => handleComplete("ELITE", eliteReward.exp)}
                className="flex flex-col py-1.5 h-auto text-[10px]"
              >
                <span>ELITE (170%)</span>
                <span className="font-mono text-[#130f0a] font-black mt-0.5">+{eliteReward.exp} EXP</span>
              </FieldBrassButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MissionCard;
