"use client";

import React from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useInventoryStore } from "@/features/inventory/store/useInventoryStore";
import { useHabitStore } from "@/features/habits/store/useHabitStore";
import { useTowerStore } from "@/features/tower/store/useTowerStore";
import { useBossStore } from "@/features/bosses/store/useBossStore";
import { useBeastStore } from "@/features/beasts/store/useBeastStore";
import { useWorkoutStore } from "@/features/workouts/store/useWorkoutStore";
import { useKanbanMissionStore } from "@/features/habits/store/useKanbanMissionStore";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardTodayCard } from "./DashboardTodayCard";
import { DashboardCharacterCard } from "./DashboardCharacterCard";
import { DashboardActivityCard } from "./DashboardActivityCard";
import { DashboardBossCard } from "./DashboardBossCard";
import { DashboardTowerCard } from "./DashboardTowerCard";

export function DashboardOverview() {
  const { character } = useCharacterStore();
  const { items } = useInventoryStore();
  const { todayMissions, executeMissionCompletion, isLoading } = useHabitStore();
  const { floors } = useTowerStore();
  const { bosses, isLoading: isBossesLoading } = useBossStore();
  const { collection } = useBeastStore();
  const { quests } = useKanbanMissionStore();
  const { muscleRecovery } = useWorkoutStore();

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

  return (
    <div
      suppressHydrationWarning
      className="dashboard-8bit-theme relative w-full min-h-full text-foreground space-y-4 sm:space-y-5 p-2 sm:p-4 md:p-6 select-none max-w-[1600px] mx-auto"
    >
      {/* Pixel forest background — covers entire dashboard viewport */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/backgrounds/dashboard-pixel-forest.png')",
          backgroundRepeat: "repeat",
          backgroundPosition: "bottom center",
          backgroundSize: "auto 50%",
          opacity: 0.12,
          imageRendering: "pixelated",
        }}
      />
      {/* ========================================================= */}
      {/* ROW 1: DASHBOARD COMMAND CENTER HEADER (12 COLUMNS)       */}
      {/* ========================================================= */}
      <div className="relative z-10">
        <DashboardHeader
          level={character?.level || 1}
          completedCount={combinedCompletedCount}
          totalCount={combinedTotalCount}
        />
      </div>

      {/* ========================================================= */}
      {/* RESPONSIVE 12-COLUMN BENTO GRID                           */}
      {/* ========================================================= */}
      <div className="relative z-10 grid grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* ROW 2: TODAY / FIELD DISPATCH (7 COLUMNS) */}
        <div className="col-span-12 xl:col-span-7 flex flex-col min-h-[460px]">
          <DashboardTodayCard
            todayMissions={todayMissions}
            quests={quests}
            executeMissionCompletion={executeMissionCompletion}
            isLoading={isLoading}
          />
        </div>

        {/* ROW 2: CHARACTER HERO LOADOUT (5 COLUMNS) */}
        <div className="col-span-12 xl:col-span-5 flex flex-col min-h-[460px]">
          <DashboardCharacterCard
            character={character}
            items={items}
            equippedBeast={collection?.equippedBeast}
            muscleRecovery={muscleRecovery}
          />
        </div>

        {/* ROW 3: SANCTUM & ACTIVITY (4 COLUMNS) */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-4 flex flex-col min-h-[380px]">
          <DashboardActivityCard />
        </div>

        {/* ROW 3: ACTIVE BOSS (4 COLUMNS) */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-4 flex flex-col min-h-[380px]">
          <DashboardBossCard
            bosses={bosses}
            isBossesLoading={isBossesLoading}
          />
        </div>

        {/* ROW 3: TOWER OF ASCENSION (4 COLUMNS) */}
        <div className="col-span-12 lg:col-span-12 xl:col-span-4 flex flex-col min-h-[380px]">
          <DashboardTowerCard floors={floors} />
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
