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
  FieldParchmentCard,
  FieldBrassButton,
  BarometerProgress,
  BotanicalRadarChart,
  type BotanicalRadarStat,
} from "@/components/ui/field";

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
      className="space-y-6 max-w-7xl mx-auto select-none font-sans"
    >
      <div
        suppressHydrationWarning
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
      >
        {/* ========================================================= */}
        {/* COLUMN 1: NATURALIST'S WARDROBE & ASTROLABE */}
        {/* ========================================================= */}
        <div suppressHydrationWarning className="space-y-5">
          <FieldParchmentCard
            title="NATURALIST'S WARDROBE"
            subtitle="Museum Vitrine • Relics & Astrolabe"
            className="space-y-4"
          >
            {/* Museum Vitrine for PaperDoll Gear Display */}
            <div className="p-3 bg-[#130f0a] border border-[#c59b27]/40 rounded-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] relative">
              <PaperDoll equippedItems={items.filter((i) => i.isEquipped)} />
            </div>

            {/* Rotary Brass Power Index Odometer */}
            <div className="p-3.5 bg-gradient-to-b from-[#1c1611] to-[#120e0a] border border-[#c59b27]/40 rounded-sm shadow-[0_2px_6px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-2 font-expedition text-xs text-[#c59b27] uppercase tracking-widest font-bold">
                <Swords className="w-4 h-4 text-[#c59b27]" />
                <span>EXPEDITION POWER INDEX</span>
              </div>
              <div className="text-4xl sm:text-5xl font-mono font-bold text-[#f5dab0] mt-1 text-center drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                <NumberTicker value={character?.power || 97} />
              </div>
            </div>

            {/* Expedition Credentials: Title & Guild */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-[#130f0a] border border-[#c59b27]/30 rounded-sm">
              <div>
                <span className="font-expedition text-[10px] text-[#c59b27] block uppercase tracking-wider font-bold">
                  SURVEYOR TITLE
                </span>
                <span className="font-field italic text-sm text-[#f5dab0] font-bold truncate block mt-0.5">
                  {character?.title || "Hydration Monarch"}
                </span>
              </div>
              <div className="text-right">
                <span className="font-expedition text-[10px] text-[#c59b27] block uppercase tracking-wider font-bold">
                  FELLOWSHIP
                </span>
                <span className="font-field italic text-sm text-[#f5dab0] font-bold truncate block mt-0.5">
                  Lone Ascendants
                </span>
              </div>
            </div>

            {/* Familiar Link Dispatch Tag */}
            <div className="p-3 bg-[#130f0a] border border-[#c59b27]/30 rounded-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-[#1b150f] border border-[#c59b27]/40 rounded-xs flex items-center justify-center text-[#c59b27] flex-shrink-0 shadow-sm">
                  <Footprints className="w-4 h-4 text-[#c59b27]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-expedition text-[#c59b27] block uppercase tracking-wider font-bold">
                    FAMILIAR BOND
                  </span>
                  <span className="text-xs sm:text-sm font-field italic text-[#f5dab0] font-bold truncate block">
                    {collection?.equippedBeast
                      ? collection.equippedBeast.name
                      : "No Companion Linked"}
                  </span>
                </div>
              </div>
              <Link href="/beasts">
                <FieldBrassButton size="sm" variant="walnut">
                  {collection?.equippedBeast
                    ? `+${collection.equippedBeast.statBonusValue}%`
                    : "Incubate"}
                </FieldBrassButton>
              </Link>
            </div>

            {/* Bio-Recovery Telemetry Voucher */}
            <div className="p-3 bg-[#130f0a] border border-[#c59b27]/30 rounded-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-[#1b150f] border border-[#c59b27]/40 rounded-xs flex items-center justify-center text-[#10b981] flex-shrink-0 shadow-sm">
                  <Activity className="w-4 h-4 text-[#10b981]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-expedition text-[#c59b27] block uppercase tracking-wider font-bold">
                    BIO-RECOVERY VITALITY
                  </span>
                  <span className="text-xs sm:text-sm font-field italic text-[#f5dab0] font-bold block">
                    {muscleRecovery?.summary.overallFreshness ?? 100}% Fresh (
                    {muscleRecovery?.summary.freshCount ?? 16}/16 Ready)
                  </span>
                </div>
              </div>
              <Link href="/workouts">
                <FieldBrassButton size="sm" variant="walnut">
                  Scanner
                </FieldBrassButton>
              </Link>
            </div>

            {/* Botanical Attributes & Astrolabe */}
            <div className="pt-3 border-t border-[#c59b27]/20 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-expedition text-[#c59b27] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                  <span className="text-[#c59b27]">❧</span>
                  BOTANICAL ATTRIBUTES
                </h3>
                <span className="font-field text-[11px] text-[#c59b27]/70 italic">
                  Astrolabe Alignment
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                {/* Slotted Barometer Attribute Bars */}
                <div className="space-y-2">
                  {radarData.map((stat) => (
                    <div key={stat.name} className="space-y-0.5">
                      <div className="flex justify-between text-xs font-expedition text-[#f5dab0]">
                        <span className="font-bold flex items-center gap-1">
                          <span className="text-[#c59b27]">{stat.name}</span>
                          <span className="text-[9px] text-[#c59b27]/60 font-field italic font-normal">
                            ({stat.herbariumLabel})
                          </span>
                        </span>
                        <span className="font-mono text-[#ffd875] font-bold">
                          {stat.value}
                        </span>
                      </div>
                      <BarometerProgress
                        value={stat.value}
                        max={100}
                        variant="amber"
                        height="sm"
                        showTicks={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Antique Astrolabe Radar Chart */}
                <div className="flex items-center justify-center p-1 bg-[#130f0a] border border-[#c59b27]/30 rounded-sm shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                  <BotanicalRadarChart data={radarData} />
                </div>
              </div>
            </div>
          </FieldParchmentCard>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: FIELD BOUNTY DISPATCH & APEX BEAST TARGET */}
        {/* ========================================================= */}
        <div suppressHydrationWarning className="space-y-5">
          {/* Today's Missions & Habits Card */}
          <FieldParchmentCard
            title="FIELD BOUNTY DISPATCH"
            subtitle="Today's Expeditions & Daily Vouchers"
            titleBadge={
              <span className="px-2 py-0.5 bg-[#2a1f16] border border-[#c59b27]/60 text-xs font-expedition text-[#ffd875] font-bold rounded-xs shadow-sm">
                {currentCompletedCount}/{currentTotalCount} CLEARED
              </span>
            }
            className="flex flex-col min-h-[480px]"
          >
            {/* Stamped Brass Filter Index Tabs: ALL / HABITS / MISSIONS */}
            <div className="grid grid-cols-3 gap-2 mb-3.5 bg-[#130f0a] p-1 border border-[#c59b27]/30 rounded-sm">
              <FieldBrassButton
                size="sm"
                variant={missionViewFilter === "all" ? "brass" : "walnut"}
                onClick={() => setMissionViewFilter("all")}
                className="text-xs"
              >
                ALL ({combinedTotalCount})
              </FieldBrassButton>
              <FieldBrassButton
                size="sm"
                variant={missionViewFilter === "habits" ? "brass" : "walnut"}
                onClick={() => setMissionViewFilter("habits")}
                className="text-xs"
              >
                HABITS ({totalHabitsCount})
              </FieldBrassButton>
              <FieldBrassButton
                size="sm"
                variant={missionViewFilter === "missions" ? "brass" : "walnut"}
                onClick={() => setMissionViewFilter("missions")}
                className="text-xs"
              >
                MISSIONS ({totalQuestsCount})
              </FieldBrassButton>
            </div>

            {/* Scrollable Missions List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
              {isLoading ? (
                <div className="py-8 text-center font-expedition text-xs text-[#c59b27] animate-pulse">
                  Consulting field journals & dispatches...
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
                      <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-10 h-10 bg-[#1b150f] border border-[#c59b27]/40 rounded-xs flex items-center justify-center text-[#c59b27]">
                          <Scroll className="w-5 h-5 text-[#c59b27]" />
                        </div>
                        <p className="font-field text-xs text-[#c59b27]/80 italic max-w-xs">
                          {missionViewFilter === "habits"
                            ? "No active habits scheduled for this day's expedition."
                            : missionViewFilter === "missions"
                            ? "No custom bounty vouchers created yet."
                            : "No active missions or habits recorded for today."}
                        </p>
                        <Link
                          href={
                            missionViewFilter === "habits"
                              ? "/habits/create"
                              : "/missions"
                          }
                        >
                          <FieldBrassButton size="sm" variant="brass">
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            {missionViewFilter === "habits"
                              ? "Draft Habit"
                              : "Issue Mission"}
                          </FieldBrassButton>
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

            {/* Daily Barometer Completion Progress Tube */}
            <div className="mt-4 pt-3 border-t border-[#c59b27]/20 space-y-1.5">
              <div className="flex items-center justify-between font-expedition text-xs text-[#c59b27] uppercase font-bold tracking-wider">
                <span>DAILY EXPEDITION COMPLETION</span>
                <Package className="w-4 h-4 text-[#c59b27]" />
              </div>
              <BarometerProgress
                value={
                  currentTotalCount > 0
                    ? (currentCompletedCount / currentTotalCount) * 100
                    : 0
                }
                max={100}
                variant="emerald"
                height="md"
              />
            </div>
          </FieldParchmentCard>

          {/* Current Boss Danger Dossier */}
          <FieldParchmentCard
            title="APEX BEAST DANGER DOSSIER"
            subtitle="Primeval Threat Targeted"
            variant="danger"
          >
            {(() => {
              const activeBoss =
                bosses.find((b) => b.status === "ACTIVE") || bosses[0];
              if (isBossesLoading && bosses.length === 0) {
                return (
                  <div className="py-6 text-center font-expedition text-xs text-[#fca5a5] animate-pulse">
                    Scanning primeval canopy for active threats...
                  </div>
                );
              }

              if (!activeBoss) {
                return (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-[#2d0f12] border border-[#991b1b]/60 rounded-xs flex items-center justify-center text-[#fca5a5]">
                      <Skull className="w-6 h-6 text-[#ef4444]" />
                    </div>
                    <p className="font-field text-xs text-[#fca5a5]/80 italic">
                      No apex beast threat currently targeted for bounty.
                    </p>
                    <FieldBrassButton
                      size="sm"
                      variant="danger"
                      onClick={() => router.push("/bosses")}
                    >
                      <Skull className="w-3.5 h-3.5 mr-1" />
                      Target Apex Beast
                    </FieldBrassButton>
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
                  <div className="flex items-center gap-3">
                    {/* Illustrated Field Specimen Vitrine for Boss Sprite */}
                    <div className="w-16 h-16 bg-[#200b0d] border border-[#991b1b]/60 rounded-xs flex items-center justify-center flex-shrink-0 p-1 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]">
                      <img
                        src={getEnemySpritePath(activeBoss.name, 1, true)}
                        alt={activeBoss.name}
                        className="w-full h-full object-contain animate-pixel-bob"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-expedition text-sm font-bold text-[#fca5a5] truncate">
                        {activeBoss.name}
                      </h3>
                      <p className="font-field text-xs text-[#fca5a5]/80 italic mt-0.5">
                        {activeBoss.difficulty} • {activeBoss.category}
                      </p>
                      <div className="font-expedition text-xs text-[#ffd875] font-bold mt-1">
                        EXPEDITION CONTRIBUTION: {contributionPct}%
                      </div>
                    </div>
                  </div>

                  {/* Blood-Mercury Barometer Tube */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-expedition text-xs text-[#fca5a5] font-bold">
                      <span className="font-mono">
                        {activeBoss.currentHp.toLocaleString()} /{" "}
                        {activeBoss.maxHp.toLocaleString()} HP
                      </span>
                      <span className="font-mono">{hpPercent.toFixed(1)}%</span>
                    </div>
                    <BarometerProgress
                      value={hpPercent}
                      max={100}
                      variant="crimson"
                      height="sm"
                    />
                  </div>

                  <FieldBrassButton
                    size="sm"
                    variant="danger"
                    className="w-full"
                    onClick={() => router.push("/bosses")}
                  >
                    Examine Threat Dossier
                  </FieldBrassButton>
                </div>
              );
            })()}
          </FieldParchmentCard>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: BOTANICAL SANCTUM & TOPOGRAPHIC ASCENT */}
        {/* ========================================================= */}
        <div suppressHydrationWarning className="space-y-5 flex flex-col">
          {/* Companion Vivarium & Pedometer Hub */}
          <CompanionSanctumCard />

          {/* Topographic Mountain Ascent (Tower of Ascension) */}
          <FieldParchmentCard
            title="TOWER OF ASCENSION"
            subtitle="Topographic Mountain Ascent"
            titleBadge={
              <span className="px-2 py-0.5 bg-[#2a1f16] border border-[#c59b27]/60 text-xs font-expedition text-[#ffd875] font-bold rounded-xs shadow-sm">
                {(() => {
                  const sorted = [...floors].sort((a, b) => a.floorNumber - b.floorNumber);
                  const activeFloor =
                    sorted.find(
                      (f) => f.status === "AVAILABLE" || f.status === "ATTEMPTED"
                    ) || sorted[0];
                  return activeFloor ? `FLOOR ${activeFloor.floorNumber}` : "1";
                })()}
              </span>
            }
          >
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
                  <div className="py-6 text-center font-expedition text-xs text-[#c59b27] animate-pulse">
                    Consulting Topographic Survey Maps...
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
                  <div className="p-3 bg-[#130f0a] border border-[#c59b27]/30 rounded-sm space-y-2">
                    <div className="flex items-center justify-between font-expedition text-xs">
                      <span className="text-[#f5dab0] font-bold">{enemyName}</span>
                      <span className="text-[#ffd875] font-mono font-bold">
                        REQ: {activeFloor.requiredPower.toLocaleString()}
                      </span>
                    </div>

                    <p className="font-field text-xs text-[#c59b27]/80 italic line-clamp-2">
                      {enemyDesc}
                    </p>

                    <div className="flex items-center justify-between font-expedition text-xs pt-1.5 text-[#f5dab0] font-bold border-t border-[#c59b27]/20">
                      <span className="text-[#c59b27]">BOUNTY REWARD</span>
                      <span className="text-[#ffd875] font-mono">
                        +{towerTokensReward} Tokens
                      </span>
                    </div>
                  </div>

                  <Link href="/tower" className="block w-full">
                    <FieldBrassButton size="sm" variant="brass" className="w-full">
                      Ascend Floor {activeFloor.floorNumber}
                    </FieldBrassButton>
                  </Link>
                </div>
              );
            })()}
          </FieldParchmentCard>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
