"use client";

import React, { useState } from "react";
import { Check, ListTodo } from "lucide-react";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { KanbanQuest } from "@/features/habits/types/kanban";
import { useKanbanMissionStore } from "@/features/habits/store/useKanbanMissionStore";
import { toast } from "sonner";
import { playUISound } from "@/utils/audio";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { Progress } from "@/components/ui/8bit/progress";

export interface DashboardQuestItemProps {
  quest: KanbanQuest;
}

export const DashboardQuestItem: React.FC<DashboardQuestItemProps> = ({
  quest,
}) => {
  const { updateQuestStatus } = useKanbanMissionStore();
  const [showBurst, setShowBurst] = useState(false);
  const isCompleted = quest.status === "Completed";

  // Subtask progress
  const totalSubtasks = quest.subtasks?.length || 0;
  const completedSubtasks =
    quest.subtasks?.filter((st) => st.isCompleted).length || 0;
  const subtaskPercent =
    totalSubtasks > 0
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : 0;

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBurst(true);
    playUISound("/sounds/General/8_Buffs_Heals_SFX/02_Heal_02.wav");
    updateQuestStatus(quest.id, "Completed");
    toast.success(
      `Bounty Cleared: ${quest.title}! +${quest.expReward} EXP, +${quest.goldReward} Gold`
    );
    setTimeout(() => setShowBurst(false), 2000);
  };

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
            +{quest.expReward} EXP! +{quest.goldReward}G!
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
        {/* Header Badges & Title */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-[8px] py-0 px-1.5">
                {quest.rank}-RANK
              </Badge>
              <Badge variant="secondary" className="text-[8px] py-0 px-1.5">
                {quest.category || "BOUNTY"}
              </Badge>
            </div>

            <h3
              className={`text-xs sm:text-sm font-bold truncate mt-1 ${
                isCompleted
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {quest.title}
            </h3>
          </div>

          <div>
            {isCompleted ? (
              <Badge variant="outline" className="text-[8px] py-0 px-1.5 flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />
                <span>CLEARED</span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[8px] py-0 px-1.5">
                {quest.status}
              </Badge>
            )}
          </div>
        </div>

        {/* Subtask checklist progress */}
        {totalSubtasks > 0 && (
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1 font-bold">
                <ListTodo className="w-3 h-3 text-foreground" />
                CHECKLIST ({completedSubtasks}/{totalSubtasks})
              </span>
              <span className="font-mono">{subtaskPercent}%</span>
            </div>
            <Progress
              value={subtaskPercent}
              max={100}
              variant="retro"
              progressBg="bg-primary"
              className="h-2.5 border border-black"
            />
          </div>
        )}

        {/* Rewards & Quick Action Button */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border">
          {/* Rewards */}
          <div className="flex items-center gap-3 font-mono text-[10px] sm:text-xs text-foreground font-bold">
            <span className="flex items-center gap-1">
              <CurrencyIcon type="EXP" size="xs" /> +{quest.expReward} EXP
            </span>
            <span className="flex items-center gap-1">
              <CurrencyIcon type="GOLD" size="xs" /> +{quest.goldReward}g
            </span>
          </div>

          {/* Action Button */}
          {!isCompleted && (
            <Button
              size="sm"
              variant="default"
              onClick={handleComplete}
              className="text-[8px] sm:text-[9px] h-6 px-2.5"
            >
              <Check className="w-3 h-3 mr-1" /> Seal Bounty
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardQuestItem;
