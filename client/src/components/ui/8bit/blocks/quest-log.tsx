"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "../badge";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import "../styles/retro.css";

export type QuestStatus = "active" | "completed" | "failed" | "pending";

export interface QuestItemData {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  category?: "DAILY" | "WEEKLY" | "TOWER" | "BOUNTY";
  expReward?: number;
  goldReward?: number;
  deadline?: string;
}

export interface QuestLogProps extends React.HTMLAttributes<HTMLDivElement> {
  quests?: QuestItemData[];
  title?: string;
  emptyStateMessage?: string;
  onClaim?: (id: string) => void;
}

const DEFAULT_QUESTS: QuestItemData[] = [
  {
    id: "ql-1",
    title: "Crab Shell Breaker",
    description: "Defeat Floor 5 Boss: Armored Crab in Tower of Ascension with zero potion consumption.",
    status: "active",
    category: "TOWER",
    expReward: 150,
    goldReward: 80,
    deadline: "Floor 5 Cleared",
  },
  {
    id: "ql-2",
    title: "10,000kg Iron Tonnage",
    description: "Log combined workout volume across compound lifts (Squat, Bench, Deadlift, OHP).",
    status: "active",
    category: "WEEKLY",
    expReward: 300,
    goldReward: 150,
    deadline: "Resets Sunday",
  },
  {
    id: "ql-3",
    title: "Scribe 4-Pomodoro Marathon",
    description: "Complete four 25-minute deep focus intervals in Scribe codex without task switching.",
    status: "completed",
    category: "DAILY",
    expReward: 100,
    goldReward: 50,
  },
  {
    id: "ql-4",
    title: "Morning Sun & Fasted Cardio",
    description: "20 minutes Zone 2 brisk walk at sunrise before breaking fast.",
    status: "completed",
    category: "DAILY",
    expReward: 60,
    goldReward: 25,
  },
];

export default function QuestLog({
  quests = DEFAULT_QUESTS,
  title = "ACTIVE QUEST LOG",
  emptyStateMessage = "No active quests in log. Inquire at Guild Hall.",
  onClaim,
  className,
  ...props
}: QuestLogProps) {
  const [activeTab, setActiveTab] = React.useState<"ALL" | "DAILY" | "TOWER" | "WEEKLY">("ALL");
  const [expandedId, setExpandedId] = React.useState<string | null>(quests[0]?.id || null);

  const filteredQuests = React.useMemo(() => {
    if (activeTab === "ALL") return quests;
    return quests.filter((q) => q.category === activeTab);
  }, [quests, activeTab]);

  const activeCount = quests.filter((q) => q.status === "active").length;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: QuestStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="text-[7px] py-0 px-1">IN PROGRESS</Badge>;
      case "completed":
        return <Badge variant="default" className="text-[7px] py-0 px-1">READY TO CLAIM</Badge>;
      case "failed":
        return <Badge variant="destructive" className="text-[7px] py-0 px-1">FAILED</Badge>;
      default:
        return <Badge variant="outline" className="text-[7px] py-0 px-1">PENDING</Badge>;
    }
  };

  return (
    <Card className={cn("bg-[#0B1020]/95 border-2 border-[#8c7a53] shadow-[3px_3px_0_0_#000]", className)} {...props}>
      <CardHeader className="p-3 sm:p-4 pb-2 border-b border-[#2d251e]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="retro text-xs sm:text-sm text-[#f6c453] tracking-wider flex items-center gap-2">
            <span>📜</span>
            <span>{title}</span>
            {activeCount > 0 && (
              <Badge variant="default" className="text-[8px] py-0 px-1.5 ml-1">
                {activeCount} ACTIVE
              </Badge>
            )}
          </CardTitle>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            {(["ALL", "DAILY", "TOWER", "WEEKLY"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "retro px-2 py-0.5 text-[8px] border transition-colors cursor-pointer",
                  activeTab === tab
                    ? "bg-[#f6c453] text-[#0B1020] border-[#f6c453] font-bold"
                    : "bg-[#141a2e] text-slate-400 border-[#2d251e] hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-3 space-y-2">
        {filteredQuests.length === 0 ? (
          <div className="py-8 text-center">
            <p className="retro text-[9px] text-slate-500">{emptyStateMessage}</p>
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const isExpanded = expandedId === quest.id;
            return (
              <div
                key={quest.id}
                className={cn(
                  "retro border-2 transition-all duration-150 overflow-hidden shadow-[2px_2px_0_0_#000]",
                  isExpanded ? "border-[#8c7a53] bg-[#141a2e]/90" : "border-[#2d251e] bg-[#0c1222]/80 hover:border-slate-700"
                )}
              >
                {/* Header Row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(quest.id)}
                  className="w-full p-2.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="retro text-[9px] text-[#f6c453] select-none">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    <span className="retro text-[9px] sm:text-xs font-bold text-white truncate">
                      {quest.title}
                    </span>
                    {quest.category && (
                      <span className="retro text-[7px] text-slate-400 hidden sm:inline-block">
                        [{quest.category}]
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusBadge(quest.status)}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-[#2d251e] space-y-3 bg-[#0B1020]/70">
                    <p className="retro text-[8px] sm:text-[9px] text-slate-300 leading-relaxed">
                      {quest.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        {quest.expReward && (
                          <span className="retro text-[8px] text-[#f6c453]">
                            +{quest.expReward} EXP
                          </span>
                        )}
                        {quest.goldReward && (
                          <span className="retro text-[8px] text-amber-400">
                            +{quest.goldReward} GOLD
                          </span>
                        )}
                        {quest.deadline && (
                          <span className="retro text-[8px] text-slate-400">
                            ⏳ {quest.deadline}
                          </span>
                        )}
                      </div>

                      {quest.status === "completed" && onClaim && (
                        <button
                          type="button"
                          onClick={() => onClaim(quest.id)}
                          className="retro px-3 py-1 text-[8px] font-bold bg-[#f6c453] text-[#0B1020] border-2 border-black hover:bg-amber-300 shadow-[1px_1px_0_0_#000] cursor-pointer"
                        >
                          CLAIM BOUNTY
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export { QuestLog };
