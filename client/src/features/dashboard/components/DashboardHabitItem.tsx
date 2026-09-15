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
  Check,
} from "lucide-react";
import { Mission, Habit, CompletionType, HabitDifficulty } from "@/features/habits/types";
import { getBaseReward, calculateFinalReward } from "@/features/habits/utils";
import { playUISound } from "@/utils/audio";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";

export interface DashboardHabitItemProps {
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

export function DashboardHabitItem({
  mission,
  onComplete,
}: DashboardHabitItemProps) {
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

  const difficultyBadgeVariant =
    difficulty === "HARD"
      ? "destructive"
      : difficulty === "MEDIUM"
      ? "secondary"
      : "outline";

  return (
    <div
      className={`relative p-3 border transition-colors select-none ${
        isCompleted
          ? "bg-muted/40 border-border opacity-85"
          : "bg-card border-border hover:border-foreground/40 shadow-[2px_2px_0_0_#000]"
      }`}
    >
      {/* Task Completion Burst Particles */}
      {showBurst && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="retro text-xs sm:text-sm font-bold text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-[pixel-burst_1.2s_steps(8)_forwards]">
            +{burstExp} EXP!
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-foreground border border-background animate-[pixel-burst_0.8s_steps(6)_forwards]"
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
        {/* Badges, Stat, & Title */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-[8px] py-0 px-1.5">
                {habit.category || "GENERAL"}
              </Badge>
              <Badge
                variant={difficultyBadgeVariant}
                className="text-[8px] py-0 px-1.5"
              >
                {difficulty}
              </Badge>
            </div>
            <h4
              className={`text-xs sm:text-sm font-bold truncate mt-1 ${
                isCompleted
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {habit.name}
            </h4>
          </div>

          <div className="flex items-center gap-1 bg-muted px-2 py-0.5 border border-border text-[9px] font-mono font-bold text-muted-foreground shrink-0">
            <StatIcon className="w-3 h-3 text-foreground" />
            <span className="capitalize">{habit.primaryStat}</span>
          </div>
        </div>

        {/* Completion status or completion tiers */}
        {isCompleted ? (
          <div className="p-2 bg-muted/60 border border-border flex items-center justify-between text-[10px] sm:text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Check className="w-3.5 h-3.5" />
              <span>CLEARED ({mission.completionType || "NORMAL"})</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-muted-foreground font-bold text-[10px]">
              <span>+{mission.expEarned || normalReward.exp} EXP</span>
              <span>+{mission.statsEarned || normalReward.stat} STAT</span>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-border space-y-1">
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleComplete("MINI", miniReward.exp)}
                className="flex flex-col py-1 h-auto text-[8px] sm:text-[9px]"
              >
                <span>MINI (40%)</span>
                <span className="font-mono text-[9px] text-muted-foreground mt-0.5">
                  +{miniReward.exp} EXP
                </span>
              </Button>

              <Button
                size="sm"
                variant="default"
                onClick={() => handleComplete("NORMAL", normalReward.exp)}
                className="flex flex-col py-1 h-auto text-[8px] sm:text-[9px]"
              >
                <span>NORMAL</span>
                <span className="font-mono text-[9px] mt-0.5">
                  +{normalReward.exp} EXP
                </span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleComplete("ELITE", eliteReward.exp)}
                className="flex flex-col py-1 h-auto text-[8px] sm:text-[9px]"
              >
                <span>ELITE (170%)</span>
                <span className="font-mono text-[9px] text-muted-foreground mt-0.5">
                  +{eliteReward.exp} EXP
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardHabitItem;
