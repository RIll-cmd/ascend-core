"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useKanbanMissionStore } from "@/features/habits/store/useKanbanMissionStore";
import { CreateQuestModal } from "@/features/habits/components/CreateQuestModal";
import { KanbanQuest } from "@/features/habits/types/kanban";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { toast } from "sonner";
import {
  PixelFlameIcon,
  PixelShieldIcon,
  PixelAwardIcon,
  PixelRefreshIcon,
  PixelClockIcon,
  PixelCompassIcon,
  PixelPlusIcon,
  PixelActivityIcon,
  PixelMoonSleepIcon,
  PixelHourglassIcon,
  PixelStarIcon,
} from "@/components/ui/pixel/PixelIcons";

import { API_BASE_URL } from "@/constants";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { CURRENCY_LORE } from "@/features/lore/loreData";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CalendarSchedulePanel } from "@/features/calendar/components/CalendarSchedulePanel";
import { useCalendarScheduleStore, StoredCalendarSchedule } from "@/features/calendar/store/useCalendarScheduleStore";
import { isScheduleOnDate, formatLocalDate } from "@/features/calendar/scheduleUtils";
import {
  SteampunkCog,
  SteampunkGearTrain,
  BourdonGauge,
  RivetedBoilerCard,
  VacuumTubeBar,
  SteamVent,
  PneumaticCanisterCard,
  PunchedTapeHorizon,
  MonocleLoupeTooltip,
  ChronometerNavigator,
  ChronoIntelCard,
  SteampunkBackground,
} from "@/components/ui/steampunk";
import {
  playClockworkTick,
  playClockworkRatchet,
  playSteamRelease,
  playChronoChime,
} from "@/utils/steampunkAudio";

interface Snapshot {
  id: string;
  date: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

interface HoveredTooltipData {
  dateStr: string;
  dateObj: Date;
  snapshot?: Snapshot;
  missions: KanbanQuest[];
  schedules?: StoredCalendarSchedule[];
  x: number;
  y: number;
}

const MONTH_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/* =====================================================================
   MAIN CLOCKWORK SANCTUARY CALENDAR COMPONENT
   ===================================================================== */
export default function CalendarPage() {
  const { character, refetch } = useCharacterStore();
  const { quests, updateQuestStatus } = useKanbanMissionStore();
  const { schedules, fetchSchedules } = useCalendarScheduleStore();

  const [snapshots, setSnapshots] = useState<Record<string, Snapshot>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isBuyingShield, setIsBuyingShield] = useState(false);
  const [steamCount, setSteamCount] = useState(0);

  // Month navigation & Gear rotation state
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [gearRotation, setGearRotation] = useState<number>(0);

  // Unclipped fixed tooltip state
  const [hoveredData, setHoveredData] = useState<HoveredTooltipData | null>(null);

  // Selected date for Chrono Intel & deadline creation
  const [selectedDate, setSelectedDate] = useState<string>(
    formatLocalDate(new Date())
  );
  const [isCreateDeadlineOpen, setIsCreateDeadlineOpen] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState<"ALL" | "UPCOMING" | "TODAY" | "COMPLETED">("ALL");

  const characterId = character?.id;

  const reloadSnapshots = useCallback(async () => {
    if (!characterId) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/habits/${characterId}/calendar-snapshots`
      );
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, Snapshot> = {};
        (data.snapshots || []).forEach((sn: Snapshot) => {
          const dateKey = formatLocalDate(new Date(sn.date));
          map[dateKey] = sn;
        });
        setSnapshots(map);
      }
    } catch (e) {
      console.error("Failed to fetch calendar snapshots", e);
    }
  }, [characterId]);

  useEffect(() => {
    let ignore = false;
    if (!characterId) return;

    fetchSchedules(characterId);

    fetch(`${API_BASE_URL}/api/habits/${characterId}/calendar-snapshots`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (ignore || !data) return;
        const map: Record<string, Snapshot> = {};
        (data.snapshots || []).forEach((sn: Snapshot) => {
          const dateKey = formatLocalDate(new Date(sn.date));
          map[dateKey] = sn;
        });
        setSnapshots(map);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error("Failed to fetch calendar snapshots", e);
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [characterId, fetchSchedules]);

  const handleSimulateDecay = async () => {
    if (!character?.id) return;
    setIsSimulating(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/habits/${character.id}/decay/simulate`,
        { method: "POST" }
      );
      if (res.ok) {
        const data = await res.json();
        playBuffSFX();
        playSteamRelease(0.5);
        setSteamCount((prev) => prev + 1);
        setGearRotation((prev) => prev + 90);
        toast.success(
          data.shieldUsed
            ? "Midnight Steam Purge: Aegis Shield auto-activated! Streak preserved."
            : "Midnight Mainspring Release executed! Habit decay evaluated."
        );
        await refetch();
        await reloadSnapshots();
      } else {
        toast.error("Decay simulation failed.");
      }
    } catch (e) {
      console.error("Simulation error", e);
      toast.error("Network error during decay simulation.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleBuyShield = async () => {
    if (!character?.id) return;
    if ((character?.gold || 0) < 300) {
      toast.error("Insufficient Gold. Aegis Decay Shield costs 300 Gold.");
      return;
    }

    setIsBuyingShield(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/habits/${character.id}/buy-streak-freeze`,
        { method: "POST" }
      );
      if (res.ok) {
        const data = await res.json();
        playBuffSFX();
        playSteamRelease(0.4);
        playChronoChime(659.25, 0.4);
        setSteamCount((prev) => prev + 1);
        setGearRotation((prev) => prev + 45);
        toast.success(`Forged 1 Aegis Decay Shield! (Total: ${data.streakFreezes})`);
        await refetch();
      } else {
        toast.error("Failed to purchase Aegis Shield.");
      }
    } catch (e) {
      console.error("Shield purchase error", e);
      toast.error("Network error forging shield.");
    } finally {
      setIsBuyingShield(false);
    }
  };

  const handlePrevMonth = () => {
    playClockworkRatchet(4, 0.35);
    setGearRotation((prev) => prev - 45);
    setActiveDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    playClockworkRatchet(4, 0.35);
    setGearRotation((prev) => prev + 45);
    setActiveDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleJumpToToday = () => {
    playChronoChime(783.99, 0.4);
    setGearRotation((prev) => prev + 90);
    const now = new Date();
    setActiveDate(now);
    setSelectedDate(formatLocalDate(now));
  };


  const questsByDueDate = useMemo(() => {
    const map: Record<string, KanbanQuest[]> = {};
    quests.forEach((q) => {
      if (q.dueDate) {
        const dateKey = q.dueDate.split("T")[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(q);
      }
    });
    return map;
  }, [quests]);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatLocalDate(new Date()), []);

  const monthGrid = useMemo(() => {
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const cells: {
      dateStr: string;
      dateObj: Date;
      dayNum: number;
      isCurrentMonth: boolean;
      snapshot?: Snapshot;
      missions: KanbanQuest[];
      schedules: StoredCalendarSchedule[];
      isToday: boolean;
      isFuture: boolean;
    }[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(year, month - 1, dayNum);
      const dateStr = formatLocalDate(d);
      const daySchedules = schedules.filter((s) => isScheduleOnDate(s, d));
      cells.push({
        dateStr,
        dateObj: d,
        dayNum,
        isCurrentMonth: false,
        snapshot: snapshots[dateStr],
        missions: questsByDueDate[dateStr] || [],
        schedules: daySchedules,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = formatLocalDate(d);
      const daySchedules = schedules.filter((s) => isScheduleOnDate(s, d));
      cells.push({
        dateStr,
        dateObj: d,
        dayNum: i,
        isCurrentMonth: true,
        snapshot: snapshots[dateStr],
        missions: questsByDueDate[dateStr] || [],
        schedules: daySchedules,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
      });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = formatLocalDate(d);
      const daySchedules = schedules.filter((s) => isScheduleOnDate(s, d));
      cells.push({
        dateStr,
        dateObj: d,
        dayNum: i,
        isCurrentMonth: false,
        snapshot: snapshots[dateStr],
        missions: questsByDueDate[dateStr] || [],
        schedules: daySchedules,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
      });
    }

    return cells;
  }, [activeDate, snapshots, questsByDueDate, schedules, todayStr]);

  const { daysGrid52, monthHeaders52 } = useMemo(() => {
    const grid: {
      dateStr: string;
      dateObj: Date;
      snapshot?: Snapshot;
      missions: KanbanQuest[];
      schedules: StoredCalendarSchedule[];
      weekIndex: number;
      dayOfWeek: number;
      isToday: boolean;
      isFuture: boolean;
    }[] = [];
    const months: { label: string; weekIndex: number; isCurrentMonth: boolean }[] = [];
    let lastMonth = -1;

    for (let i = -182; i <= 181; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = formatLocalDate(d);
      const weekIndex = Math.floor((i + 182) / 7);
      const dayOfWeek = d.getDay();
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;
      const daySchedules = schedules.filter((s) => isScheduleOnDate(s, d));

      const m = d.getMonth();
      if (m !== lastMonth && (dayOfWeek === 0 || i === -182)) {
        months.push({
          label: MONTH_SHORT[m],
          weekIndex,
          isCurrentMonth: m === today.getMonth(),
        });
        lastMonth = m;
      }

      grid.push({
        dateStr,
        dateObj: d,
        snapshot: snapshots[dateStr],
        missions: questsByDueDate[dateStr] || [],
        schedules: daySchedules,
        weekIndex,
        dayOfWeek,
        isToday,
        isFuture,
      });
    }

    return { daysGrid52: grid, monthHeaders52: months };
  }, [today, todayStr, snapshots, questsByDueDate, schedules]);

  const activeDaysCount = useMemo(
    () => Object.values(snapshots).filter((s) => (s.completedCount || 0) > 0).length,
    [snapshots]
  );
  const streakFreezes = character?.streakFreezes || 0;

  const { currentStreak, bestStreak } = useMemo(() => {
    let currS = 0;
    let bestS = 0;

    const completedDates = Object.keys(snapshots)
      .filter((d) => (snapshots[d]?.completedCount || 0) > 0)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (completedDates.length > 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const lastDate = completedDates[completedDates.length - 1];
      if (lastDate === todayStr || lastDate === yesterdayStr) {
        currS = 1;
        for (let i = completedDates.length - 1; i > 0; i--) {
          const curr = new Date(completedDates[i]);
          const prev = new Date(completedDates[i - 1]);
          const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            currS++;
          } else {
            break;
          }
        }
      }

      let tempStreak = 1;
      bestS = 1;
      for (let i = 1; i < completedDates.length; i++) {
        const prev = new Date(completedDates[i - 1]);
        const curr = new Date(completedDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        if (tempStreak > bestS) {
          bestS = tempStreak;
        }
      }
    }

    return { currentStreak: currS, bestStreak: bestS };
  }, [snapshots, todayStr]);

  const selectedSnapshot = snapshots[selectedDate];
  const selectedMissions = questsByDueDate[selectedDate] || [];
  const selectedSchedules = useMemo(() => {
    const d = new Date(`${selectedDate}T12:00:00`);
    return schedules.filter((s) => isScheduleOnDate(s, d));
  }, [schedules, selectedDate]);

  const allDeadlinesWithQuests = useMemo(() => {
    return quests.filter((q) => !!q.dueDate).sort((a, b) => {
      return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
    });
  }, [quests]);

  const filteredDeadlines = useMemo(() => {
    return allDeadlinesWithQuests.filter((q) => {
      const dateKey = q.dueDate!.split("T")[0];
      if (deadlineFilter === "TODAY") return dateKey === todayStr;
      if (deadlineFilter === "UPCOMING") return q.status !== "Completed" && dateKey >= todayStr;
      if (deadlineFilter === "COMPLETED") return q.status === "Completed";
      return true;
    });
  }, [allDeadlinesWithQuests, deadlineFilter, todayStr]);

  const getCellStyling = (rate?: number, hasDeadlines?: boolean, isSelected?: boolean, isToday?: boolean, isFuture?: boolean) => {
    if (isSelected) {
      return "bg-[#451f08] border-[#f59e0b] ring-2 ring-[#fde047] shadow-[0_0_16px_rgba(245,158,11,0.6)] z-20 scale-[1.02]";
    }
    if (isToday) {
      return "bg-[#381806] border-[#f59e0b] ring-1 ring-[#fbbf24] shadow-[0_0_12px_rgba(245,158,11,0.4)] z-10";
    }
    if (isFuture) {
      return hasDeadlines
        ? "bg-[#1e1008] border-[#d97706] shadow-[0_0_8px_rgba(217,119,6,0.3)]"
        : "bg-[#120703] border-[#381607] hover:border-[#78350f]";
    }
    if (rate === undefined || rate === null || rate === 0) {
      return hasDeadlines
        ? "bg-[#1e1008] border-[#d97706] shadow-[0_0_8px_rgba(217,119,6,0.3)]"
        : "bg-[#140803] border-[#381607] hover:border-[#6d3714]";
    }
    if (rate <= 33) return "bg-[#251006] border-[#78350f] text-[#fbbf24]";
    if (rate <= 66) return "bg-[#3a1808] border-[#b45309] text-[#fde047] shadow-[inset_0_0_8px_rgba(180,83,9,0.3)]";
    if (rate < 100) return "bg-[#4d220a] border-[#d97706] text-[#fef08a] shadow-[inset_0_0_12px_rgba(217,119,6,0.5)]";
    return "bg-[#662c0b] border-[#f59e0b] text-[#ffffff] shadow-[0_0_12px_rgba(245,158,11,0.6),inset_0_0_10px_rgba(254,240,138,0.4)]";
  };

  return (
    <div className="space-y-6 pb-16 font-sans select-none text-slate-100 relative min-h-screen">
      {/* Victorian Steampunk Clockwork Sanctuary Immersive Backdrop */}
      <SteampunkBackground />

      {/* Dynamic Steam Purge Particle Vent */}
      <SteamVent trigger={steamCount} particleCount={8} size="lg" />

      {/* =========================================================
          1. CHRONO-SANCTUARY MECHANICAL HEADER (BOILER PLATE & COGS)
          ========================================================= */}
      <RivetedBoilerCard pipeHeader variant="default" className="relative">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Animated Clockwork Sanctuary Icon Emblem */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#120703] border-3 border-[#78350f] flex items-center justify-center text-[#fbbf24] shadow-[0_0_24px_rgba(245,158,11,0.25),inset_0_2px_4px_rgba(0,0,0,0.8)] shrink-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-radial from-[#f59e0b]/15 to-transparent pointer-events-none" />
              <SteampunkCog size={46} teeth={12} rotation={gearRotation} variant="gold" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-pixel font-bold text-[#f59e0b] uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  <PixelCompassIcon className="w-4 h-4 text-[#fbbf24]" />
                  GRAND CHRONOMETER SANCTUARY
                </span>
                {isLoading && (
                  <span className="text-xs font-mono text-[#fbbf24] flex items-center gap-1.5 animate-pulse ml-2">
                    <PixelRefreshIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing Telemetry...</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-pixel font-bold text-[#fef08a] tracking-tight uppercase drop-shadow-[0_2px_0_rgba(0,0,0,0.9)] leading-tight">
                The Clockwork Calendar
              </h1>
              <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl font-sans font-medium leading-relaxed mt-1">
                Inspect multi-week habit execution density, turn the gear dials to navigate timeline horizons, schedule deadline rites, and reinforce streak freeze shields.
              </p>
            </div>
          </div>

          {/* Action Controls & Steampunk Escapement Dual-Dock */}
          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0 z-10 w-full lg:w-auto">
            {/* Top Telemetry & Synchronized Planetary Train */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-start sm:justify-end">
              <div className="hidden sm:block">
                <SteampunkGearTrain rotation={gearRotation} />
              </div>

                <button
                  type="button"
                  onClick={() => {
                    playUIMenuSFX("confirm");
                    handleBuyShield();
                  }}
                  disabled={isBuyingShield || streakFreezes >= 3}
                  className="h-11 px-4 bg-[#241006] hover:bg-[#381809] border-2 border-[#78350f] hover:border-[#f59e0b] text-[#fef08a] font-pixel text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_3px_0_0_#000] active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Forge Aegis Shield with 300 Gold"
                >
                  {isBuyingShield ? (
                    <PixelRefreshIcon className="w-4 h-4 animate-spin text-[#f59e0b]" />
                  ) : (
                    <PixelShieldIcon className={cn("w-4 h-4", streakFreezes >= 3 ? "text-[#10b981]" : "text-[#f59e0b]")} />
                  )}
                  <span>{streakFreezes >= 3 ? "Aegis Full (3/3)" : "Buy Shield (300g)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playUIMenuSFX("confirm");
                    handleSimulateDecay();
                  }}
                  disabled={isSimulating}
                  className="h-11 px-4 bg-[#381a0c] hover:bg-[#4d2410] border-2 border-[#b45309] hover:border-[#f59e0b] text-[#fef08a] font-pixel text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_3px_0_0_#000] active:translate-y-0.5 disabled:opacity-50"
                  title="Advance Chronometer to test day rollover"
                >
                  {isSimulating ? (
                    <PixelRefreshIcon className="w-4 h-4 animate-spin text-[#fbbf24]" />
                  ) : (
                    <PixelMoonSleepIcon className="w-4 h-4 text-[#fbbf24]" />
                  )}
                  <span>Simulate Midnight</span>
                </button>
            </div>

            {/* Bottom Primary Actions Dock */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-start sm:justify-end">
              <PixelButton
                variant="dark"
                size="md"
                onClick={handleJumpToToday}
                className="font-pixel text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer h-11 px-4"
              >
                <PixelCompassIcon className="w-4 h-4 text-[#fbbf24]" />
                <span>Jump Today</span>
              </PixelButton>

              <PixelButton
                variant="gold"
                size="md"
                onClick={() => {
                  playUIMenuSFX("confirm");
                  setIsCreateDeadlineOpen(true);
                }}
                className="font-pixel text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer h-11 px-5 shadow-[0_0_16px_rgba(245,158,11,0.35)]"
              >
                <PixelPlusIcon className="w-4 h-4 text-[#231006]" />
                <span>Inscribe Directive</span>
              </PixelButton>
            </div>
          </div>
        </div>
      </RivetedBoilerCard>

      {/* =========================================================
          2. 4 STEAMPUNK BOURDON PRESSURE MANOMETERS
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Active Logged Days */}
        <SystemTooltip
          title={CURRENCY_LORE.loggedDays.name}
          category={CURRENCY_LORE.loggedDays.category}
          rarity={CURRENCY_LORE.loggedDays.rarity}
          description={CURRENCY_LORE.loggedDays.description}
          lore={CURRENCY_LORE.loggedDays.lore}
          mechanics={CURRENCY_LORE.loggedDays.mechanics}
          tags={CURRENCY_LORE.loggedDays.tags}
          className="w-full flex"
        >
          <BourdonGauge
            label="Active Logged Days"
            value={`${activeDaysCount} Days`}
            subtext="Recorded Chrono-Sanctuary sessions"
            icon={PixelActivityIcon}
            variant="amber"
            pct={Math.min(100, Math.round((activeDaysCount / 365) * 100))}
            className="w-full"
          />
        </SystemTooltip>

        {/* Current Active Streak */}
        <SystemTooltip
          title={CURRENCY_LORE.activeStreak.name}
          category={CURRENCY_LORE.activeStreak.category}
          rarity={CURRENCY_LORE.activeStreak.rarity}
          description={CURRENCY_LORE.activeStreak.description}
          lore={CURRENCY_LORE.activeStreak.lore}
          mechanics={CURRENCY_LORE.activeStreak.mechanics}
          tags={CURRENCY_LORE.activeStreak.tags}
          className="w-full flex"
        >
          <BourdonGauge
            label="Current Streak"
            value={`${currentStreak}d`}
            subtext="Unhalted consecutive execution"
            icon={PixelFlameIcon}
            variant="copper"
            pct={Math.min(100, Math.round((currentStreak / 30) * 100))}
            className="w-full"
          />
        </SystemTooltip>

        {/* Record Streak */}
        <SystemTooltip
          title={CURRENCY_LORE.bestStreak.name}
          category={CURRENCY_LORE.bestStreak.category}
          rarity={CURRENCY_LORE.bestStreak.rarity}
          description={CURRENCY_LORE.bestStreak.description}
          lore={CURRENCY_LORE.bestStreak.lore}
          mechanics={CURRENCY_LORE.bestStreak.mechanics}
          tags={CURRENCY_LORE.bestStreak.tags}
          className="w-full flex"
        >
          <BourdonGauge
            label="Record Streak"
            value={`${bestStreak}d`}
            subtext="All-time peak chronometer record"
            icon={PixelAwardIcon}
            variant="gold"
            pct={Math.min(100, Math.round((bestStreak / 30) * 100))}
            className="w-full"
          />
        </SystemTooltip>

        {/* Streak Protection Shields */}
        <SystemTooltip
          title={CURRENCY_LORE.protectionShields.name}
          category={CURRENCY_LORE.protectionShields.category}
          rarity={CURRENCY_LORE.protectionShields.rarity}
          description={CURRENCY_LORE.protectionShields.description}
          lore={CURRENCY_LORE.protectionShields.lore}
          mechanics={CURRENCY_LORE.protectionShields.mechanics}
          tags={CURRENCY_LORE.protectionShields.tags}
          className="w-full flex"
        >
          <BourdonGauge
            label="Aegis Shields"
            value={`${streakFreezes} / 3`}
            subtext="Active decay buffer capacitors"
            icon={PixelShieldIcon}
            variant="crimson"
            pct={(streakFreezes / 3) * 100}
            className="w-full"
          />
        </SystemTooltip>
      </div>

      {/* =========================================================
          3. ROTATING GEAR MONTH VIEW & CHRONOMETER MATRIX
          ========================================================= */}
      <RivetedBoilerCard pipeHeader variant="default" className="space-y-6">
        {/* Month Navigator Header with Astrolabe Escapement Train */}
        <ChronometerNavigator
          currentDate={activeDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onResetToday={handleJumpToToday}
          isTodayMonth={
            activeDate.getFullYear() === today.getFullYear() &&
            activeDate.getMonth() === today.getMonth()
          }
        />

        {/* 7-Column Monthly Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs sm:text-sm font-pixel font-bold text-[#f59e0b] uppercase tracking-wider pb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1.5 bg-[#120703] border border-[#45200c] text-xs sm:text-sm text-[#fbbf24]">
                {w}
              </div>
            ))}
          </div>

          {/* Calendar Month Cells */}
          <div className="grid grid-cols-7 gap-2">
            {monthGrid.map((day, idx) => {
              const rate = day.snapshot?.completionRate;
              const hasDeadlines = day.missions.length > 0;
              const isSelected = selectedDate === day.dateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                      playClockworkTick(0.35);
                      setSelectedDate(day.dateStr);
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredData({
                        dateStr: day.dateStr,
                        dateObj: day.dateObj,
                        snapshot: day.snapshot,
                        missions: day.missions,
                        schedules: day.schedules,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredData(null)}
                    className={cn(
                      "w-full min-h-[92px] sm:min-h-[104px] p-2.5 border-2 text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden shadow-[0_2px_0_0_#000] group",
                      !day.isCurrentMonth && "opacity-35 grayscale-[50%]",
                      getCellStyling(rate, hasDeadlines, isSelected, day.isToday, day.isFuture)
                    )}
                  >
                  {/* Top Bar: Date Number & Indicators */}
                  <div className="flex items-center justify-between w-full">
                    <span className={cn("font-pixel text-base sm:text-lg font-bold", isSelected ? "text-[#fef08a]" : day.isToday ? "text-[#fde047]" : "text-slate-100")}>
                      {day.dayNum}
                    </span>

                    {/* Deadline, Schedule, or Completion Icon */}
                    <div className="flex items-center gap-1">
                      {day.schedules && day.schedules.length > 0 && (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-teal-400 border border-black shadow-[0_0_6px_#2dd4bf] animate-pulse"
                          title={`${day.schedules.length} Personal Schedules (${day.schedules.map((s) => s.title).join(", ")})`}
                        />
                      )}
                      {hasDeadlines && (
                        <span className="w-2.5 h-2.5 bg-[#f59e0b] border border-black shadow-[0_0_6px_#f59e0b] animate-pulse" title={`${day.missions.length} Deadlines`} />
                      )}
                      {rate !== undefined && rate >= 100 && (
                        <PixelStarIcon className="w-3.5 h-3.5 text-[#fef08a]" />
                      )}
                    </div>
                  </div>

                  {/* Middle / Bottom: Segmented Vacuum Filament Tube & Personal Schedules */}
                  <div className="mt-1 space-y-1">
                    {/* Compact Personal Schedule Pill */}
                    {day.schedules && day.schedules.length > 0 && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-500/40 text-[10px] font-mono text-teal-300 font-bold truncate shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                        <span className="truncate">
                          {day.schedules[0].time}{day.schedules[0].endTime ? `-${day.schedules[0].endTime}` : ''} {day.schedules[0].title}
                        </span>
                        {day.schedules.length > 1 && (
                          <span className="text-teal-400/80 text-[9px] shrink-0">+{day.schedules.length - 1}</span>
                        )}
                      </div>
                    )}

                    {day.snapshot ? (
                      <div>
                        <div className="flex justify-between items-center text-[#fef08a] font-mono text-xs sm:text-sm mb-1 font-bold">
                          <span>{day.snapshot.completedCount}/{day.snapshot.totalCount}</span>
                          <span className="text-[#fde047]">{Math.round(day.snapshot.completionRate)}%</span>
                        </div>
                        {/* Steampunk Vacuum Tube Filament Meter */}
                        <VacuumTubeBar
                          percentage={day.snapshot.completionRate || 0}
                          size="sm"
                          variant={rate !== undefined && rate >= 100 ? "gold" : rate !== undefined && rate >= 66 ? "amber" : "copper"}
                        />
                      </div>
                    ) : hasDeadlines ? (
                      <div className="text-xs sm:text-sm font-pixel text-[#fbbf24] font-bold truncate">
                        {day.missions.length} Due
                      </div>
                    ) : !day.schedules || day.schedules.length === 0 ? (
                      <div className="text-xs font-mono text-slate-500 italic">
                        —
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-[#542d17] text-xs sm:text-sm font-mono text-slate-200">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-pixel text-xs sm:text-sm text-[#f59e0b] font-bold">VACUUM RELAY DENSITY:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#140803] border border-[#381607]" />
              <span className="text-xs sm:text-sm font-sans text-amber-100 font-medium">Empty</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#251006] border border-[#78350f]" />
              <span className="text-xs sm:text-sm font-sans text-amber-100 font-medium">33%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#3a1808] border border-[#b45309]" />
              <span className="text-xs sm:text-sm font-sans text-amber-100 font-medium">66%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#662c0b] border border-[#f59e0b]" />
              <span className="text-xs sm:text-sm font-sans text-[#fef08a] font-bold">100% Overdrive</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-teal-400 font-pixel font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_6px_#2dd4bf]" />
              <span>SCHEDULED ROUTINE</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#fde047] font-pixel font-bold">
              <span className="w-3 h-3 bg-[#f59e0b] border border-[#78350f]" />
              <span>TODAY</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#fbbf24] font-pixel font-bold">
              <span className="w-2.5 h-2.5 bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]" />
              <span>DEADLINE DUE</span>
            </div>
          </div>
        </div>
      </RivetedBoilerCard>


      {/* =========================================================
          4. 52-WEEK CONTINUOUS HORIZON MATRIX (JACQUARD PUNCH-TAPE)
          ========================================================= */}
      <RivetedBoilerCard variant="default" className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#542d17] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#120703] border-2 border-[#78350f] flex items-center justify-center text-[#fbbf24] shadow-[inset_0_1px_3px_#000] shrink-0">
              <PixelHourglassIcon className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-pixel font-bold text-[#fef08a] uppercase tracking-wider">
                52-Week Jacquard Punch-Tape Horizon
              </h3>
              <p className="text-xs sm:text-sm font-sans text-amber-200/80">
                Continuous 364-day habit execution density centered on today
              </p>
            </div>
          </div>
        </div>

        {/* Punched Tape Matrix */}
        <PunchedTapeHorizon
          daysGrid={daysGrid52}
          monthHeaders={monthHeaders52}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            playUIMenuSFX("confirm");
            setSelectedDate(d);
          }}
          onHoverDate={setHoveredData}
          getCellStyling={getCellStyling}
        />
      </RivetedBoilerCard>

      {/* =========================================================
          5. UNCLIPPED JEWELER'S LOUPE & MONOCLE TOOLTIP PORTAL
          ========================================================= */}
      <MonocleLoupeTooltip data={hoveredData} />

      {/* =========================================================
          6. SELECTED DATE CHRONO INTEL & DIRECTIVES DECK
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Column: Selected Date Chrono-Telemetry */}
        <ChronoIntelCard
          selectedDate={selectedDate}
          isToday={selectedDate === todayStr}
          selectedSnapshot={selectedSnapshot}
          selectedMissions={selectedMissions}
          selectedSchedules={selectedSchedules}
          onOpenCreateDeadline={() => setIsCreateDeadlineOpen(true)}
        />


        {/* Right 2 Columns: Mission Deadlines Directive Deck */}
        <RivetedBoilerCard variant="default" className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#542d17] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#120703] border-2 border-[#78350f] flex items-center justify-center text-[#fbbf24] shadow-[inset_0_1px_3px_#000] shrink-0">
                <PixelClockIcon className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-pixel font-bold uppercase text-[#fef08a]">
                  Chrono-Directive Pneumatic Deck
                </h4>
                <p className="text-xs sm:text-sm font-sans text-amber-200/80">
                  Pneumatic canister dispatches with strict completion schedules
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#120703] border border-[#45200c] text-xs font-pixel font-bold">
              {(["ALL", "UPCOMING", "TODAY", "COMPLETED"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    playUIMenuSFX("confirm");
                    setDeadlineFilter(filter);
                  }}
                  className={cn(
                    "px-3 py-1 transition-all cursor-pointer",
                    deadlineFilter === filter
                      ? "bg-[#381a0c] text-[#fef08a] border border-[#f59e0b] shadow-sm"
                      : "text-amber-200/70 hover:text-white"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Deadlines List */}
          {filteredDeadlines.length === 0 ? (
            <div className="py-12 text-center space-y-3 font-mono">
              <PixelClockIcon className="w-8 h-8 text-[#542d17] mx-auto" />
              <p className="text-xs sm:text-sm text-slate-300">
                No pneumatic mission directives recorded for the <span className="text-[#f59e0b] font-bold">{deadlineFilter}</span> filter.
              </p>
              <PixelButton
                variant="gold"
                size="md"
                onClick={() => {
                  playUIMenuSFX("confirm");
                  setIsCreateDeadlineOpen(true);
                }}
                className="font-pixel text-xs sm:text-sm font-bold h-11 px-5"
              >
                <PixelPlusIcon className="w-4 h-4 mr-1.5" />
                <span>Inscribe New Directive Canister</span>
              </PixelButton>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {filteredDeadlines.map((q) => {
                const isCompleted = q.status === "Completed";
                const dateKey = q.dueDate!.split("T")[0];
                const isToday = dateKey === todayStr;

                return (
                  <PneumaticCanisterCard
                    key={q.id}
                    id={q.id}
                    title={q.title}
                    description={q.description}
                    rank={q.rank}
                    dueDateStr={dateKey}
                    expReward={q.expReward}
                    isCompleted={isCompleted}
                    isToday={isToday}
                    onToggleStatus={() => {
                      playUIMenuSFX("confirm");
                      updateQuestStatus(
                        q.id,
                        isCompleted ? "To Do" : "Completed"
                      );
                    }}
                  />
                );
              })}
            </div>
          )}
        </RivetedBoilerCard>
      </div>

      <CalendarSchedulePanel selectedDate={selectedDate} />

      {/* Create Deadline Modal */}
      <CreateQuestModal
        isOpen={isCreateDeadlineOpen}
        onClose={() => setIsCreateDeadlineOpen(false)}
        initialDueDate={selectedDate}
      />
    </div>
  );
}

