"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Scroll, Plus, Package } from "lucide-react";
import { Mission, Habit, CompletionType } from "@/features/habits/types";
import { KanbanQuest } from "@/features/habits/types/kanban";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { Progress } from "@/components/ui/8bit/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/8bit/tabs";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/8bit/empty";
import { Skeleton } from "@/components/ui/8bit/skeleton";
import { DashboardHabitItem } from "./DashboardHabitItem";
import { DashboardQuestItem } from "./DashboardQuestItem";

export interface DashboardTodayCardProps {
  todayMissions: Mission[];
  quests: KanbanQuest[];
  executeMissionCompletion: (
    id: string,
    habit: Habit,
    completionType: CompletionType
  ) => void;
  isLoading: boolean;
}

export function DashboardTodayCard({
  todayMissions,
  quests,
  executeMissionCompletion,
  isLoading,
}: DashboardTodayCardProps) {
  const [filter, setFilter] = useState<"all" | "habits" | "missions">("all");

  const completedHabitsCount = todayMissions.filter(
    (m) => m.status === "COMPLETED"
  ).length;
  const totalHabitsCount = todayMissions.length;

  const completedQuestsCount = quests.filter(
    (q) => q.status === "Completed"
  ).length;
  const totalQuestsCount = quests.length;

  const combinedTotalCount = totalHabitsCount + totalQuestsCount;
  const combinedCompletedCount = completedHabitsCount + completedQuestsCount;

  const currentTotalCount =
    filter === "all"
      ? combinedTotalCount
      : filter === "habits"
      ? totalHabitsCount
      : totalQuestsCount;

  const currentCompletedCount =
    filter === "all"
      ? combinedCompletedCount
      : filter === "habits"
      ? completedHabitsCount
      : completedQuestsCount;

  const displayHabits =
    filter === "all" || filter === "habits" ? todayMissions : [];
  const displayQuests =
    filter === "all" || filter === "missions" ? quests : [];
  const hasItems = displayHabits.length > 0 || displayQuests.length > 0;

  const dailyPercent =
    currentTotalCount > 0
      ? Math.round((currentCompletedCount / currentTotalCount) * 100)
      : 0;

  return (
    <Card variant="default" className="flex flex-col h-full shadow-[4px_4px_0_0_#000]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm sm:text-base tracking-wider text-foreground">
              TODAY
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Habits & missions scheduled for today
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0.5 px-2 font-mono">
            {currentCompletedCount}/{currentTotalCount} CLEARED
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex flex-col flex-1 space-y-4">
        {/* 8-Bit Tabs */}
        <Tabs
          value={filter}
          onValueChange={(val) => setFilter(val as "all" | "habits" | "missions")}
          className="w-full flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-3 w-full h-9 bg-muted border border-border p-0.5">
            <TabsTrigger
              value="all"
              className="text-[9px] sm:text-[10px] uppercase font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              ALL ({combinedTotalCount})
            </TabsTrigger>
            <TabsTrigger
              value="habits"
              className="text-[9px] sm:text-[10px] uppercase font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              HABITS ({totalHabitsCount})
            </TabsTrigger>
            <TabsTrigger
              value="missions"
              className="text-[9px] sm:text-[10px] uppercase font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              MISSIONS ({totalQuestsCount})
            </TabsTrigger>
          </TabsList>

          <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 max-h-[380px] pr-1">
            {isLoading ? (
              <div className="space-y-2.5 py-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : !hasItems ? (
              <Empty className="my-2">
                <EmptyMedia variant="icon">
                  <Scroll className="w-5 h-5 text-foreground" />
                </EmptyMedia>
                <EmptyTitle>
                  {filter === "habits"
                    ? "No habits scheduled today."
                    : filter === "missions"
                    ? "No active missions recorded."
                    : "No dispatches active today."}
                </EmptyTitle>
                <EmptyDescription>
                  Keep your progression moving forward by scheduling a habit or initiating a new mission.
                </EmptyDescription>
                <EmptyContent>
                  <Link
                    href={filter === "habits" ? "/habits/create" : "/missions"}
                  >
                    <Button size="sm" variant="default" className="text-[9px] h-8 px-3">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      {filter === "habits" ? "Schedule Habit" : "Create Mission"}
                    </Button>
                  </Link>
                </EmptyContent>
              </Empty>
            ) : (
              <>
                {displayHabits.map((mission) => (
                  <DashboardHabitItem
                    key={`habit-${mission.id}`}
                    mission={mission}
                    onComplete={(id, habit, type) =>
                      executeMissionCompletion(id, habit, type)
                    }
                  />
                ))}

                {displayQuests.map((quest) => (
                  <DashboardQuestItem
                    key={`quest-${quest.id}`}
                    quest={quest}
                  />
                ))}
              </>
            )}
          </div>
        </Tabs>

        {/* 8-Bit Daily Completion Progress Footer */}
        <div className="mt-auto pt-3 border-t border-border space-y-1.5">
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-foreground font-bold">
            <span className="retro">DAILY PROGRESSION</span>
            <span className="flex items-center gap-1 font-mono">
              <Package className="w-3.5 h-3.5 text-foreground" />
              {dailyPercent}%
            </span>
          </div>
          <Progress
            value={dailyPercent}
            max={100}
            variant="retro"
            progressBg="bg-primary"
            className="h-3.5 border border-black"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
            <span>{currentCompletedCount} CLEARED</span>
            <span>{Math.max(0, currentTotalCount - currentCompletedCount)} REMAINING</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardTodayCard;
