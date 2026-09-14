"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "../badge";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import "../styles/retro.css";

export interface QuestNode {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "locked";
  rank?: "BRONZE" | "SILVER" | "GOLD" | "S-RANK" | "MYTHIC";
  expReward?: number;
  category?: string;
}

export interface GameRoadmap1Props extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  quests?: QuestNode[];
  onQuestToggle?: (id: string) => void;
}

const DEFAULT_QUESTS: QuestNode[] = [
  {
    id: "q1",
    title: "Morning Sun & Hydration Protocol",
    description: "Consume 500ml water and absorb 10m outdoor daylight before screen engagement.",
    status: "completed",
    rank: "BRONZE",
    expReward: 35,
    category: "RITUAL",
  },
  {
    id: "q2",
    title: "The Iron Temple: Heavy Deadlifts",
    description: "Conquer 5 sets of 5 reps at 80% 1RM. Maintain neutral spine and explosive drive.",
    status: "completed",
    rank: "GOLD",
    expReward: 120,
    category: "WORKOUT",
  },
  {
    id: "q3",
    title: "Scribe Focus: Deep Code Sprint",
    description: "Complete 90 uninterrupted minutes of architectural refactoring with zero notifications.",
    status: "in-progress",
    rank: "SILVER",
    expReward: 85,
    category: "SCRIBE",
  },
  {
    id: "q4",
    title: "Tower of Ascension: Floor 20 Boss",
    description: "Challenge the Necromancer's Crypt. Exploit elemental vulnerabilities to advance.",
    status: "in-progress",
    rank: "S-RANK",
    expReward: 250,
    category: "TOWER",
  },
  {
    id: "q5",
    title: "Evening Digital Curfew & Review",
    description: "Log daily tonnage, record reflection in Adventurer Codex, shut down blue light at 22:00.",
    status: "locked",
    rank: "BRONZE",
    expReward: 40,
    category: "RECOVERY",
  },
];

const statusConfig = {
  completed: { badge: "CLEARED", variant: "default" as const, symbol: "✓", nodeClass: "border-[#f6c453] bg-[#f6c453] text-[#0B1020]" },
  "in-progress": { badge: "ACTIVE", variant: "secondary" as const, symbol: "▶", nodeClass: "border-[#38bdf8] bg-[#0c1222] text-[#38bdf8] animate-pulse" },
  locked: { badge: "LOCKED", variant: "destructive" as const, symbol: "×", nodeClass: "border-slate-700 bg-slate-900/60 text-slate-500" },
};

export default function GameRoadmap1({
  title = "DAILY RITUAL ROADMAP",
  description = "Chronological bounty chain — Complete each tier to maintain your ascension streak.",
  quests = DEFAULT_QUESTS,
  onQuestToggle,
  className,
  ...props
}: GameRoadmap1Props) {
  return (
    <section className={cn("w-full px-2 sm:px-4 py-6", className)} {...props}>
      <div className="mx-auto max-w-2xl">
        {(title || description) && (
          <div className="mb-8 text-center">
            {title && (
              <h2 className="retro mb-2 font-bold text-lg sm:text-xl text-[#f6c453] tracking-wide">
                {title}
              </h2>
            )}
            {description && (
              <p className="retro text-[9px] sm:text-[10px] text-slate-400 max-w-md mx-auto leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="relative">
          {/* Connecting vertical stepped line */}
          <div className="absolute top-4 bottom-4 left-5 w-0 border-l-2 border-dashed border-[#8c7a53]/40" />

          <div className="flex flex-col gap-4">
            {quests.map((quest) => {
              const config = statusConfig[quest.status];
              const isLocked = quest.status === "locked";

              return (
                <div key={quest.id} className="relative flex items-start gap-4">
                  {/* Step node pin */}
                  <button
                    type="button"
                    onClick={() => onQuestToggle?.(quest.id)}
                    aria-label={`Toggle quest ${quest.title}`}
                    className={cn(
                      "retro relative z-10 flex size-10 shrink-0 items-center justify-center border-2 text-xs font-bold shadow-[2px_2px_0_0_#000] cursor-pointer transition-transform duration-100 active:scale-95",
                      config.nodeClass
                    )}
                  >
                    {config.symbol}
                  </button>

                  {/* Quest card content */}
                  <Card
                    className={cn(
                      "flex-1 bg-[#0B1020]/90 border-2 transition-colors",
                      quest.status === "completed" && "border-[#8c7a53]/70 bg-[#141a2e]/60",
                      quest.status === "in-progress" && "border-[#38bdf8]/60 bg-[#0d172b]",
                      isLocked && "opacity-50 border-slate-800"
                    )}
                  >
                    <CardHeader className="p-3 pb-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="retro text-[10px] sm:text-xs text-white">
                            {quest.title}
                          </CardTitle>
                          {quest.rank && (
                            <Badge
                              variant={quest.rank === "S-RANK" ? "destructive" : "default"}
                              className="text-[7px] py-0 px-1"
                            >
                              {quest.rank}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {quest.expReward && (
                            <span className="retro text-[8px] text-[#f6c453] font-bold">
                              +{quest.expReward} EXP
                            </span>
                          )}
                          <Badge variant={config.variant} className="text-[8px] py-0 px-1.5">
                            {config.badge}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <p className="retro text-slate-400 text-[8px] sm:text-[9px] leading-relaxed">
                        {quest.description}
                      </p>
                      {quest.category && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="retro text-[7px] text-slate-500 uppercase tracking-widest">
                            [{quest.category}]
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export { GameRoadmap1 };
