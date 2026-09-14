"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Package,
  Swords,
  Footprints,
  Activity,
  Skull,
  Crosshair,
  Compass,
  Scroll,
  ShieldAlert,
  Flame,
  ChevronRight,
} from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useInventoryStore } from "@/features/inventory/store/useInventoryStore";
import { useHabitStore } from "@/features/habits/store/useHabitStore";
import { useTowerStore } from "@/features/tower/store/useTowerStore";
import { useBossStore } from "@/features/bosses/store/useBossStore";
import { useBeastStore } from "@/features/beasts/store/useBeastStore";
import { useWorkoutStore } from "@/features/workouts/store/useWorkoutStore";
import { useKanbanMissionStore } from "@/features/habits/store/useKanbanMissionStore";
import { getEnemySpritePath } from "@/utils/sprites";
import { PaperDoll } from "@/features/inventory/components/PaperDoll";
import { MissionCard } from "@/features/habits/components/MissionCard";
import { DashboardQuestCard } from "@/features/habits/components/DashboardQuestCard";
import { CompanionSanctumCard } from "./CompanionSanctumCard";
import { NumberTicker } from "@/components/ui/number-ticker";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Progress } from "@/components/ui/8bit/progress";
import { Button } from "@/components/ui/8bit/button";
import { EnemyHealthDisplay } from "@/components/ui/8bit/enemy-health-display";
import {
  BotanicalRadarChart,
  type BotanicalRadarStat,
} from "@/components/ui/field";

const STAT_COLORS: Record<string, string> = {
  STR: "bg-amber-500",
  END: "bg-emerald-500",
  DIS: "bg-cyan-500",
  KNO: "bg-purple-500",
  FOC: "bg-rose-500",
  REC: "bg-lime-500",
};

export function DashboardOverview() {
  const router = useRouter();
  const { character } = useCharacterStore();
  const { items } = useInventoryStore();
  const { todayMissions, executeMissionCompletion, isLoading } =
    useHabitStore();
  const { floors } = useTowerStore();
  const { bosses, isLoading: isBossesLoading } = useBossStore();
  const { collection } = useBeastStore();
  const { quests } = useKanbanMissionStore();
  const { muscleRecovery } = useWorkoutStore();

  const [missionViewFilter, setMissionViewFilter] = useState<
    "all" | "habits" | "missions"
  >("all");

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
    missionViewFilter === "all"
      ? combinedTotalCount
      : missionViewFilter === "habits"
      ? totalHabitsCount
      : totalQuestsCount;

  const currentCompletedCount =
    missionViewFilter === "all"
      ? combinedCompletedCount
      : missionViewFilter === "habits"
      ? completedHabitsCount
      : completedQuestsCount;

  const radarData: BotanicalRadarStat[] = [
    {
      name: "STR",
      value: character?.stats?.strength || 18,
      fullMark: 100,
      herbariumLabel: "Ironwood",
    },
    {
      name: "END",
      value: character?.stats?.endurance || 15,
      fullMark: 100,
      herbariumLabel: "Briar",
    },
    {
      name: "DIS",
      value: character?.stats?.discipline || 22,
      fullMark: 100,
      herbariumLabel: "Root",
    },
    {
      name: "KNO",
      value: character?.stats?.knowledge || 14,
      fullMark: 100,
      herbariumLabel: "Spore",
    },
    {
      name: "FOC",
      value: character?.stats?.focus || 16,
      fullMark: 100,
      herbariumLabel: "Hawk",
    },
    {
      name: "REC",
      value: character?.stats?.recovery || 20,
      fullMark: 100,
      herbariumLabel: "Dew",
    },
  ];

  return (
    <div
      suppressHydrationWarning
      className="space-y-6 max-w-7xl mx-auto select-none"
    >
      <div
        suppressHydrationWarning
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      >
        {/* ========================================================= */}
        {/* COLUMN 1: HERO VITRINE & ARMORY */}
        {/* ========================================================= */}
        <div suppressHydrationWarning className="space-y-6">
          <Card
            variant="tavern"
            font="retro"
            className="shadow-[4px_4px_0_0_#000]"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xs sm:text-sm text-[#f3df9d] tracking-wider">
                    HERO LOADOUT & ARMORY
                  </CardTitle>
                  <CardDescription className="text-[8px] sm:text-[9px] text-[#c59b27] mt-0.5">
                    Equipment Vitrine • Kinetic Astrolabe
                  </CardDescription>
                </div>
                <Badge variant="gold" className="text-[7px]">
                  LV.{character?.level || 1}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-4">
              {/* Retro Chamber for PaperDoll Gear Display */}
              <div className="p-3 bg-[#0f1424] border-2 border-[#8c7a53] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),2px_2px_0_0_#000] relative">
                <PaperDoll equippedItems={items.filter((i) => i.isEquipped)} />
              </div>

              {/* 8-Bit Power Index Odometer */}
              <div className="p-3 bg-[#141a2e]/90 border-2 border-[#8c7a53] shadow-[2px_2px_0_0_#000] flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center gap-2 retro text-[9px] sm:text-[10px] text-[#c59b27] uppercase tracking-wider font-bold">
                  <Swords className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>EXPEDITION POWER INDEX</span>
                </div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-[#ffd875] mt-1 text-center drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  <NumberTicker value={character?.power || 97} />
                </div>
              </div>

              {/* Expedition Credentials: Title & Guild */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#141a2e]/90 border-2 border-[#8c7a53] shadow-[2px_2px_0_0_#000]">
                <div>
                  <span className="retro text-[8px] text-[#c59b27] block font-bold">
                    TITLE
                  </span>
                  <span className="retro text-[9px] sm:text-[10px] text-[#f5dab0] font-bold truncate block mt-1">
                    {character?.title || "Ascendant"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="retro text-[8px] text-[#c59b27] block font-bold">
                    FELLOWSHIP
                  </span>
                  <span className="retro text-[9px] sm:text-[10px] text-[#f5dab0] font-bold truncate block mt-1">
                    Lone Ascendants
                  </span>
                </div>
              </div>

              {/* Familiar Link Dispatch Tag */}
              <div className="p-2.5 bg-[#141a2e]/90 border-2 border-[#8c7a53] shadow-[2px_2px_0_0_#000] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 bg-[#0d1220] border border-[#8c7a53] flex items-center justify-center text-[#ffd875] shrink-0">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="retro text-[8px] text-[#c59b27] block font-bold">
                      FAMILIAR
                    </span>
                    <span className="retro text-[9px] text-[#f5dab0] font-bold truncate block">
                      {collection?.equippedBeast
                        ? collection.equippedBeast.name
                        : "No Companion"}
                    </span>
                  </div>
                </div>
                <Link href="/beasts">
                  <Button size="sm" variant="gold" className="text-[8px] h-6 px-2">
                    {collection?.equippedBeast
                      ? `+${collection.equippedBeast.statBonusValue}%`
                      : "Incubate"}
                  </Button>
                </Link>
              </div>

              {/* Bio-Recovery Telemetry Voucher */}
              <div className="p-2.5 bg-[#141a2e]/90 border-2 border-[#8c7a53] shadow-[2px_2px_0_0_#000] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 bg-[#0d1220] border border-[#8c7a53] flex items-center justify-center text-[#10b981] shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="retro text-[8px] text-[#c59b27] block font-bold">
                      BIO-VITALITY
                    </span>
                    <span className="retro text-[8px] sm:text-[9px] text-[#10b981] font-bold block">
                      {muscleRecovery?.summary.overallFreshness ?? 100}% Ready
                    </span>
                  </div>
                </div>
                <Link href="/workouts">
                  <Button size="sm" variant="secondary" className="text-[8px] h-6 px-2">
                    Scanner
                  </Button>
                </Link>
              </div>

              {/* 8-Bit Segmented Attributes & Astrolabe */}
              <div className="pt-3 border-t border-[#8c7a53]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="retro text-[9px] text-[#ffd875] tracking-wider flex items-center gap-1 font-bold">
                    <span>⚔</span>
                    ATTRIBUTES
                  </h3>
                  <Badge variant="secondary" className="text-[7px]">
                    RADAR SYNC
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  {/* Segmented Retro Attribute Bars */}
                  <div className="space-y-2">
                    {radarData.map((stat) => (
                      <div key={stat.name} className="space-y-0.5">
                        <div className="flex justify-between retro text-[8px] text-[#f5dab0]">
                          <span className="font-bold">{stat.name}</span>
                          <span className="font-mono text-[#ffd875]">
                            {stat.value}
                          </span>
                        </div>
                        <Progress
                          value={stat.value}
                          max={100}
                          variant="retro"
                          progressBg={STAT_COLORS[stat.name] || "bg-amber-500"}
                          className="h-2.5 border border-black"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Antique Astrolabe Radar Chart */}
                  <div className="flex items-center justify-center p-1 bg-[#0f1424] border-2 border-[#8c7a53]/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),2px_2px_0_0_#000]">
                    <BotanicalRadarChart data={radarData} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: FIELD BOUNTY DISPATCH & APEX BEAST TARGET */}
        {/* ========================================================= */}
        <div suppressHydrationWarning className="space-y-6">
          {/* Today's Missions & Habits Card */}
          <Card
            variant="default"
            font="retro"
            className="shadow-[4px_4px_0_0_#000] flex flex-col min-h-[490px]"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-xs sm:text-sm text-white tracking-wider">
                    FIELD BOUNTY DISPATCH
                  </CardTitle>
                  <CardDescription className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">
                    Today's Expeditions & Quests
                  </CardDescription>
                </div>
                <Badge variant="gold" className="text-[8px]">
                  {currentCompletedCount}/{currentTotalCount} CLEARED
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex flex-col flex-1 space-y-3">
              {/* 8-Bit Tab Switchers */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0b101c] border-2 border-[#8c7a53] shadow-[2px_2px_0_0_#000]">
                <Button
                  size="sm"
                  variant={missionViewFilter === "all" ? "gold" : "ghost"}
                  onClick={() => setMissionViewFilter("all")}
                  className="text-[8px] h-7"
                >
                  ALL ({combinedTotalCount})
                </Button>
                <Button
                  size="sm"
                  variant={missionViewFilter === "habits" ? "gold" : "ghost"}
                  onClick={() => setMissionViewFilter("habits")}
                  className="text-[8px] h-7"
                >
                  HABITS ({totalHabitsCount})
                </Button>
                <Button
                  size="sm"
                  variant={missionViewFilter === "missions" ? "gold" : "ghost"}
                  onClick={() => setMissionViewFilter("missions")}
                  className="text-[8px] h-7"
                >
                  QUESTS ({totalQuestsCount})
                </Button>
              </div>

              {/* Scrollable Missions List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
                {isLoading ? (
                  <div className="py-8 text-center retro text-[9px] text-[#c59b27] animate-pulse">
                    Scanning field dispatches...
                  </div>
                ) : (
                  (() => {
                    const displayHabits =
                      missionViewFilter === "all" || missionViewFilter === "habits"
                        ? todayMissions
                        : [];
                    const displayQuests =
                      missionViewFilter === "all" || missionViewFilter === "missions"
                        ? quests
                        : [];
                    const hasAny = displayHabits.length > 0 || displayQuests.length > 0;

                    if (!hasAny) {
                      return (
                        <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 bg-[#0d1322]/50 border-2 border-dashed border-slate-700 p-4">
                          <div className="w-10 h-10 bg-[#141a2e] border-2 border-[#8c7a53] flex items-center justify-center text-[#ffd875] shadow-[2px_2px_0_0_#000]">
                            <Scroll className="w-5 h-5" />
                          </div>
                          <p className="retro text-[8px] sm:text-[9px] text-slate-400 max-w-xs">
                            {missionViewFilter === "habits"
                              ? "No active habits scheduled for today."
                              : missionViewFilter === "missions"
                              ? "No active bounty quests recorded."
                              : "No missions or habits active today."}
                          </p>
                          <Link
                            href={
                              missionViewFilter === "habits"
                                ? "/habits/create"
                                : "/missions"
                            }
                          >
                            <Button size="sm" variant="gold" className="text-[8px] h-7">
                              <Plus className="w-3 h-3 mr-1" />
                              {missionViewFilter === "habits"
                                ? "Draft Habit"
                                : "Issue Mission"}
                            </Button>
                          </Link>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Habit Mission Cards */}
                        {displayHabits.map((mission) => (
                          <div key={`habit-${mission.id}`}>
                            <MissionCard
                              mission={mission}
                              onComplete={(id, habit, completionType) =>
                                executeMissionCompletion(id, habit, completionType)
                              }
                            />
                          </div>
                        ))}

                        {/* Custom Kanban Mission Cards */}
                        {displayQuests.map((quest) => (
                          <div key={`quest-${quest.id}`}>
                            <DashboardQuestCard quest={quest} />
                          </div>
                        ))}
                      </>
                    );
                  })()
                )}
              </div>

              {/* 8-Bit Daily Completion Progress */}
              <div className="mt-auto pt-3 border-t border-[#8c7a53]/40 space-y-1.5">
                <div className="flex items-center justify-between retro text-[8px] text-[#ffd875]">
                  <span>DAILY EXPEDITION COMPLETION</span>
                  <Package className="w-3.5 h-3.5 text-[#ffd875]" />
                </div>
                <Progress
                  value={
                    currentTotalCount > 0
                      ? (currentCompletedCount / currentTotalCount) * 100
                      : 0
                  }
                  max={100}
                  variant="retro"
                  progressBg="bg-emerald-500"
                  className="h-3.5 border border-black"
                />
                <div className="flex justify-between retro text-[7px] text-slate-400">
                  <span>PROGRESS</span>
                  <span>
                    {currentTotalCount > 0
                      ? Math.round((currentCompletedCount / currentTotalCount) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Boss Danger Dossier */}
          <Card
            variant="dungeon"
            font="retro"
            className="shadow-[4px_4px_0_0_#000] border-[#991b1b]"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xs sm:text-sm text-red-400 tracking-wider">
                    APEX BEAST DANGER DOSSIER
                  </CardTitle>
                  <CardDescription className="text-[8px] sm:text-[9px] text-red-300/80 mt-0.5">
                    Primeval Threat Targeted
                  </CardDescription>
                </div>
                <Badge variant="destructive" className="text-[7px]">
                  BOUNTY
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
              {(() => {
                const activeBoss =
                  bosses.find((b) => b.status === "ACTIVE") || bosses[0];
                if (isBossesLoading && bosses.length === 0) {
                  return (
                    <div className="py-6 text-center retro text-[9px] text-red-300 animate-pulse">
                      Scanning primeval canopy for active threats...
                    </div>
                  );
                }

                if (!activeBoss) {
                  return (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 bg-[#1d0a0d] border-2 border-[#991b1b] p-4 shadow-[2px_2px_0_0_#000]">
                      <div className="w-10 h-10 bg-[#2d0f12] border-2 border-[#ef4444] flex items-center justify-center text-[#ef4444] shadow-[1px_1px_0_0_#000]">
                        <Skull className="w-5 h-5" />
                      </div>
                      <p className="retro text-[8px] sm:text-[9px] text-red-200">
                        No apex threat currently targeted.
                      </p>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => router.push("/bosses")}
                        className="text-[8px] h-7"
                      >
                        <Skull className="w-3 h-3 mr-1" />
                        Target Apex Beast
                      </Button>
                    </div>
                  );
                }

                const hpPercent = Math.max(
                  0,
                  Math.min(100, (activeBoss.currentHp / activeBoss.maxHp) * 100)
                );
                const damageDealt = activeBoss.maxHp - activeBoss.currentHp;
                const contributionPct =
                  activeBoss.maxHp > 0
                    ? ((damageDealt / activeBoss.maxHp) * 100).toFixed(1)
                    : "0.0";

                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-[#200b0d] border-2 border-[#991b1b] shadow-[2px_2px_0_0_#000]">
                      {/* Boss Sprite Vitrine */}
                      <div className="w-14 h-14 bg-[#120507] border border-[#ef4444]/60 flex items-center justify-center flex-shrink-0 p-1 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]">
                        <img
                          src={getEnemySpritePath(activeBoss.name, 1, true)}
                          alt={activeBoss.name}
                          className="w-full h-full object-contain pixelated animate-pixel-bob"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="retro text-[10px] sm:text-xs font-bold text-red-200 truncate">
                            {activeBoss.name}
                          </h3>
                        </div>
                        <p className="retro text-[8px] text-red-300/80 mt-0.5">
                          {activeBoss.difficulty} • {activeBoss.category}
                        </p>
                        <div className="retro text-[8px] text-[#ffd875] font-bold mt-1">
                          CONTRIBUTION: {contributionPct}%
                        </div>
                      </div>
                    </div>

                    {/* Integrated 8-Bit EnemyHealthDisplay */}
                    <div className="p-2 bg-[#120507] border border-[#991b1b]">
                      <EnemyHealthDisplay
                        enemyName={activeBoss.name}
                        isBoss={true}
                        currentHealth={activeBoss.currentHp}
                        maxHealth={activeBoss.maxHp}
                        textColor="red"
                        healthBarColor="bg-red-600"
                        showLevel={false}
                        size="sm"
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full text-[8px] h-7"
                      onClick={() => router.push("/bosses")}
                    >
                      Examine Threat Dossier
                    </Button>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: BOTANICAL SANCTUM & TOPOGRAPHIC ASCENT */}
        {/* ========================================================= */}
        <div suppressHydrationWarning className="space-y-6 flex flex-col">
          {/* Companion Vivarium & Pedometer Hub */}
          <CompanionSanctumCard />

          {/* Topographic Mountain Ascent (Tower of Ascension) */}
          <Card
            variant="dungeon"
            font="retro"
            className="shadow-[4px_4px_0_0_#000]"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-xs sm:text-sm text-[#fff8df] tracking-wider">
                    TOWER OF ASCENSION
                  </CardTitle>
                  <CardDescription className="text-[8px] sm:text-[9px] text-[#8c7a53] mt-0.5">
                    Spire Mountain Ascent
                  </CardDescription>
                </div>
                {(() => {
                  const sorted = [...floors].sort(
                    (a, b) => a.floorNumber - b.floorNumber
                  );
                  const activeFloor =
                    sorted.find(
                      (f) => f.status === "AVAILABLE" || f.status === "ATTEMPTED"
                    ) || sorted[0];
                  return (
                    <Badge variant="gold" className="text-[8px]">
                      {activeFloor ? `F${activeFloor.floorNumber}` : "F1"}
                    </Badge>
                  );
                })()}
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
              {(() => {
                const sortedTowerFloors = [...floors].sort(
                  (a, b) => a.floorNumber - b.floorNumber
                );
                const activeFloor =
                  sortedTowerFloors.find(
                    (f) => f.status === "AVAILABLE" || f.status === "ATTEMPTED"
                  ) || sortedTowerFloors[0];

                if (!activeFloor) {
                  return (
                    <div className="py-6 text-center retro text-[9px] text-[#c59b27] animate-pulse">
                      Consulting Tower Maps...
                    </div>
                  );
                }

                const enemyName =
                  activeFloor.enemy?.name ||
                  `Floor ${activeFloor.floorNumber} Guardian`;
                const enemyDesc = `Level ${
                  activeFloor.enemy?.level || activeFloor.floorNumber
                } ${
                  activeFloor.isBoss ? "Apex Sentinel" : "Canopy Guardian"
                }. Overcome to claim botanical ascent tokens.`;
                const towerTokensReward =
                  activeFloor.towerTokensReward ||
                  activeFloor.floorNumber * 10 * (activeFloor.isBoss ? 3 : 1);

                return (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#111611] border-2 border-[#8c7a53] shadow-[2px_2px_0_0_#000] space-y-2">
                      <div className="flex items-center justify-between retro text-[9px]">
                        <span className="text-[#f5dab0] font-bold">
                          {enemyName}
                        </span>
                        <span className="text-[#ffd875] font-mono">
                          REQ: {activeFloor.requiredPower.toLocaleString()}
                        </span>
                      </div>

                      <p className="retro text-[8px] text-slate-300 line-clamp-2">
                        {enemyDesc}
                      </p>

                      <div className="flex items-center justify-between retro text-[8px] pt-1.5 text-[#f5dab0] border-t border-[#8c7a53]/30">
                        <span className="text-[#c59b27]">BOUNTY</span>
                        <span className="text-[#ffd875] font-mono">
                          +{towerTokensReward} Tokens
                        </span>
                      </div>
                    </div>

                    <Link href="/tower" className="block w-full">
                      <Button
                        size="sm"
                        variant="gold"
                        className="w-full text-[8px] sm:text-[9px] h-8"
                      >
                        Ascend Floor {activeFloor.floorNumber}
                      </Button>
                    </Link>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
