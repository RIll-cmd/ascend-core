"use client";

import React, { useState } from "react";
import { Check, ListTodo } from "lucide-react";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { KanbanQuest } from "../types/kanban";
import { useKanbanMissionStore } from "../store/useKanbanMissionStore";
import { toast } from "sonner";
import { playUISound } from "@/utils/audio";
import { FieldBrassButton, BarometerProgress, WaxSealCheck } from "@/components/ui/field";

export interface DashboardQuestCardProps {
  quest: KanbanQuest;
}

export const DashboardQuestCard: React.FC<DashboardQuestCardProps> = ({
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
      `Bounty Cleared: ${quest.title}! +${quest.expReward} EXP, +${quest.goldReward} Sovereigns`
    );
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
          <div className="font-expedition text-xs sm:text-sm font-bold text-[#ffd875] drop-shadow-[0_2px_4px_#000] animate-[pixel-burst_1.2s_steps(8)_forwards]">
            +{quest.expReward} EXP! +{quest.goldReward} Sovereigns!
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
              <span className="px-1.5 py-0.5 bg-[#2d2211] border border-[#c59b27]/50 text-[10px] font-expedition uppercase text-[#ffd875] font-bold rounded-xs">
                {quest.rank}-RANK
              </span>
              <span className="px-1.5 py-0.5 bg-[#251c14] border border-[#c59b27]/40 text-[10px] font-expedition uppercase text-[#c59b27] font-bold rounded-xs">
                {quest.category || "Bounty"}
              </span>
            </div>

            <h3
              className={`font-expedition text-xs sm:text-sm font-bold truncate ${
                isCompleted ? "text-[#f5dab0]/60 line-through" : "text-[#f5dab0]"
              }`}
            >
              {quest.title}
            </h3>
          </div>

          <div>
            {isCompleted ? (
              <div className="flex items-center gap-1 font-expedition text-xs text-[#a7f3d0] font-bold bg-[#0a1811] border border-[#10b981]/40 px-2 py-0.5 rounded-xs">
                <WaxSealCheck completed={true} size="sm" />
                <span>CLEARED</span>
              </div>
            ) : (
              <span className="font-expedition text-[10px] text-[#c59b27] font-bold bg-[#130f0a] border border-[#c59b27]/40 px-2 py-0.5 rounded-xs">
                {quest.status}
              </span>
            )}
          </div>
        </div>

        {/* Subtask checklist progress */}
        {totalSubtasks > 0 && (
          <div className="space-y-1 font-expedition text-xs text-[#f5dab0] font-bold">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#c59b27]">
                <ListTodo className="w-3.5 h-3.5 text-[#c59b27]" />
                CHECKLIST ({completedSubtasks}/{totalSubtasks})
              </span>
              <span className="font-mono text-[#ffd875]">{subtaskPercent}%</span>
            </div>
            <BarometerProgress
              value={subtaskPercent}
              max={100}
              variant="amber"
              height="sm"
            />
          </div>
        )}

        {/* Rewards & Quick Action Button */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#c59b27]/20">
          {/* Rewards */}
          <div className="flex items-center gap-3 font-mono text-xs text-[#ffd875] font-bold">
            <span className="flex items-center gap-1">
              <CurrencyIcon type="EXP" size="xs" /> +{quest.expReward} EXP
            </span>
            <span className="flex items-center gap-1">
              <CurrencyIcon type="GOLD" size="xs" /> +{quest.goldReward}g
            </span>
          </div>

          {/* Action Button */}
          {!isCompleted && (
            <FieldBrassButton
              size="sm"
              variant="brass"
              onClick={handleComplete}
              className="text-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Seal Bounty
            </FieldBrassButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardQuestCard;
