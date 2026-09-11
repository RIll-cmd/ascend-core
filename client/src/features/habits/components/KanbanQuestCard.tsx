import React, { useState } from "react";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { KanbanQuest, QuestRank, QuestStatus } from "../types/kanban";
import { useKanbanMissionStore } from "../store/useKanbanMissionStore";
import { EditQuestModal } from "./EditQuestModal";
import { playUIMenuSFX } from "@/utils/audio";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelProgress } from "@/components/ui/pixel/PixelProgress";
import { PixelScrollCard } from "@/components/ui/pixel/PixelScrollCard";
import { CoolMode } from "@/components/ui/cool-mode";
import { NumberTicker } from "@/components/ui/number-ticker";
import {
  PixelCheckIcon,
  PixelCheckSquareIcon,
  PixelSquareIcon,
  PixelPencilIcon,
  PixelTrashIcon,
  PixelChevronLeftIcon,
  PixelChevronRightIcon,
  PixelHistoryIcon,
  PixelWaxSealIcon,
} from "@/components/ui/pixel/PixelIcons";

export interface KanbanQuestCardProps {
  quest: KanbanQuest;
}

const RANK_BADGE_VARIANTS: Record<
  QuestRank,
  "gold" | "purple" | "primary" | "cyan" | "success" | "dark"
> = {
  S: "gold",
  A: "purple",
  B: "primary",
  C: "cyan",
  D: "success",
  F: "dark",
};

const STATUS_NEXT: Record<QuestStatus, QuestStatus | null> = {
  "To Do": "In Progress",
  "In Progress": "Review",
  Review: "Completed",
  Completed: null,
};

const STATUS_PREV: Record<QuestStatus, QuestStatus | null> = {
  "To Do": null,
  "In Progress": "To Do",
  Review: "In Progress",
  Completed: "Review",
};

export const KanbanQuestCard: React.FC<KanbanQuestCardProps> = ({ quest }) => {
  const { updateQuestStatus, toggleSubtask, deleteQuest } = useKanbanMissionStore();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const totalSubtasks = quest.subtasks?.length || 0;
  const completedSubtasks = quest.subtasks ? quest.subtasks.filter((st) => st.isCompleted).length : 0;
  const autoProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const progressPercent =
    quest.progressOverride !== undefined
      ? quest.progressOverride
      : quest.status === "Completed"
      ? 100
      : autoProgress;

  let dueDateLabel: string | null = null;
  let isOverdue = false;
  if (quest.dueDate) {
    const dueTime = new Date(quest.dueDate).getTime();
    const diffHours = Math.round((dueTime - Date.now()) / (1000 * 60 * 60));
    if (diffHours < 0) {
      dueDateLabel = `OVERDUE (${Math.abs(diffHours)}h)`;
      isOverdue = true;
    } else if (diffHours <= 24) {
      dueDateLabel = `DUE IN ${diffHours}h`;
    } else {
      dueDateLabel = `DUE IN ${Math.round(diffHours / 24)}d`;
    }
  }

  const isCompleted = quest.status === "Completed";
  const rankVariant = RANK_BADGE_VARIANTS[quest.rank] || "cyan";

  return (
    <PixelScrollCard
      rank={quest.rank}
      isCompleted={isCompleted}
      showPin={true}
      showCrest={true}
      missionType="MISSION"
      className="mt-4 mb-3 shadow-[0_6px_12px_-2px_rgba(0,0,0,0.65),0_3px_6px_-3px_rgba(0,0,0,0.5)] hover:rotate-0 transition-transform duration-100"
    >
      {/* Header Row: Rank Badge, Category Ink Stamp, & Action Buttons */}
      <div className="flex items-start justify-between gap-2 mb-2 pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <PixelBadge variant={rankVariant} size="sm" className="font-bold tracking-wider text-[10px]">
            {quest.rank}-RANK
          </PixelBadge>
          <span className="font-pixel text-[10px] text-[#4a2612] font-bold uppercase bg-[#dfba7c]/70 border border-[#8a572c]/60 px-1.5 py-0.5 shadow-[1px_1px_0_0_rgba(0,0,0,0.1)]">
            {quest.category}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              playUIMenuSFX();
              setIsEditOpen(true);
            }}
            title="Edit Directive"
            className="text-[#542d17] hover:text-[#2b170c] p-1 border border-transparent hover:border-[#8a572c]/50 hover:bg-[#ebd099] active:translate-y-0.5 cursor-pointer"
          >
            <PixelPencilIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              playUIMenuSFX();
              deleteQuest(quest.id);
            }}
            title="Delete Directive"
            className="text-red-700 hover:text-red-900 p-1 border border-transparent hover:border-red-800/40 hover:bg-red-200/40 active:translate-y-0.5 cursor-pointer"
          >
            <PixelTrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quest Title (Ink on Parchment) */}
      <h4
        className={`font-pixel text-xs sm:text-sm font-bold leading-snug mb-1 line-clamp-2 ${
          isCompleted ? "text-[#55694a] line-through" : "text-[#2b170c]"
        }`}
      >
        {quest.title}
      </h4>

      {/* Quest Description */}
      {quest.description && (
        <p className="font-pixel text-[11px] text-[#4a2e1b] line-clamp-2 mb-2 leading-relaxed opacity-90">
          {quest.description}
        </p>
      )}

      {/* Hashtags as Pinned Paper Slips */}
      {quest.tags && quest.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {quest.tags.map((tag) => (
            <span
              key={tag}
              className="font-pixel text-[9px] text-[#452714] bg-[#ebd198] border border-[#a8743e]/50 px-1 py-0.2 shadow-[1px_1px_0_0_rgba(0,0,0,0.15)] lowercase"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Checklist / Progress Section */}
      <div className="my-2 space-y-1 bg-[#ecd39b]/60 border border-[#b3854d]/40 p-2 shadow-[inset_1px_1px_0_0_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between font-pixel text-xs">
          <button
            type="button"
            onClick={() => {
              playUIMenuSFX();
              setShowSubtasks(!showSubtasks);
            }}
            className="text-[#3b2010] hover:text-[#1a0c05] flex items-center gap-1.5 cursor-pointer font-bold active:translate-y-0.5"
          >
            <PixelCheckSquareIcon className="w-3.5 h-3.5 text-[#8c5225]" />
            <span className="text-[11px]">
              Checklist ({completedSubtasks}/{totalSubtasks})
            </span>
          </button>
          <span className="text-[#2b170c] font-bold font-pixel text-[11px]">
            <NumberTicker value={progressPercent} />%
          </span>
        </div>

        <PixelProgress
          value={progressPercent}
          max={100}
          variant={isCompleted ? "success" : "primary"}
          height="sm"
        />
      </div>

      {/* Expandable Subtasks Checklist */}
      {showSubtasks && totalSubtasks > 0 && (
        <div className="my-2 p-2 bg-[#f4e2b6] border border-[#a8743e] space-y-1.5 shadow-[inset_1px_1px_0_0_rgba(0,0,0,0.15)]">
          {quest.subtasks.map((st) => (
            <CoolMode key={st.id} options={{ particle: "⚔️", size: 18, speedHorz: 3, speedUp: 7 }}>
              <div
                onClick={() => {
                  playUIMenuSFX();
                  toggleSubtask(quest.id, st.id);
                }}
                className="flex items-center gap-2 font-pixel text-xs text-[#2b170c] hover:text-black cursor-pointer select-none py-0.5 active:translate-y-0.5"
              >
                {st.isCompleted ? (
                  <PixelCheckSquareIcon className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                ) : (
                  <PixelSquareIcon className="w-3.5 h-3.5 text-[#8c5225] hover:text-[#2b170c] shrink-0" />
                )}
                <span className={st.isCompleted ? "line-through text-[#6e7d62]" : "font-pixel text-[11px]"}>
                  {st.title}
                </span>
              </div>
            </CoolMode>
          ))}
        </div>
      )}

      {/* Rewards & Due Date Footer */}
      <div className="pt-2 border-t border-[#a8743e]/50 flex items-center justify-between font-pixel text-xs">
        <div className="flex items-center gap-2 flex-wrap text-[#2b170c] font-bold">
          <span className="flex items-center gap-1 text-[11px]">
            <CurrencyIcon type="EXP" size="xs" /> +<NumberTicker value={quest.expReward} /> EXP
          </span>
          {quest.goldReward > 0 && (
            <span className="flex items-center gap-1 text-[#854d0e] text-[11px]">
              <CurrencyIcon type="GOLD" size="xs" /> +<NumberTicker value={quest.goldReward} />g
            </span>
          )}
        </div>

        {dueDateLabel && (
          <PixelBadge
            variant={isOverdue ? "danger" : "dark"}
            size="sm"
            className={isOverdue ? "animate-pulse" : ""}
          >
            <PixelHistoryIcon className="w-3 h-3" />
            <span className="text-[10px]">{dueDateLabel}</span>
          </PixelBadge>
        )}
      </div>

      {/* Status Transition Navigation Controls */}
      <div className="mt-2.5 pt-2 border-t border-[#a8743e]/50 flex items-center justify-between">
        {STATUS_PREV[quest.status] ? (
          <PixelButton
            size="sm"
            variant="dark"
            onClick={() => {
              playUIMenuSFX();
              updateQuestStatus(quest.id, STATUS_PREV[quest.status]!);
            }}
            className="text-[10px] py-1 px-2 min-h-[26px]"
          >
            <PixelChevronLeftIcon className="w-3 h-3 mr-1" />
            <span>{STATUS_PREV[quest.status]}</span>
          </PixelButton>
        ) : (
          <div />
        )}

        {STATUS_NEXT[quest.status] ? (
          <CoolMode options={{ particle: STATUS_NEXT[quest.status] === "Completed" ? "👑" : "✨", size: 20, speedHorz: 4, speedUp: 9 }}>
            <PixelButton
              size="sm"
              variant={STATUS_NEXT[quest.status] === "Completed" ? "success" : "primary"}
              onClick={() => {
                playUIMenuSFX();
                updateQuestStatus(quest.id, STATUS_NEXT[quest.status]!);
              }}
              className="text-[10px] py-1 px-2.5 min-h-[26px]"
            >
              <span>{STATUS_NEXT[quest.status]}</span>
              <PixelChevronRightIcon className="w-3 h-3 ml-1" />
            </PixelButton>
          </CoolMode>
        ) : (
          <div className="flex items-center gap-1.5 font-pixel text-[11px] font-bold text-emerald-800 bg-[#d5e6c3] border border-emerald-700/60 px-2 py-0.5 shadow-[1px_1px_0_0_#000]">
            <PixelWaxSealIcon className="w-4 h-4 text-emerald-700" />
            <span>CLEARED</span>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && <EditQuestModal quest={quest} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />}
    </PixelScrollCard>
  );
};


