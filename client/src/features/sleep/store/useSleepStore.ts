import { create } from "zustand";
import { toast } from "sonner";
import { useCharacterStore } from "@/store/useCharacterStore";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";

export type SleepQuality = "DEEP_REM" | "RESTFUL" | "MODERATE" | "FRAGMENTED" | "POOR";

export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD
  hoursSlept: number;
  bedtime: string; // e.g. "23:00"
  wakeTime: string; // e.g. "07:00"
  quality: SleepQuality;
  efficiencyScore: number; // 0 - 100%
  recoveryGain: number; // +REC boost
  expAwarded: number;
  goldAwarded: number;
  notes?: string;
  createdAt: string;
}

export interface SleepState {
  isDrawerOpen: boolean;
  sleepLogs: SleepLog[];
  todayLogged: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  logSleep: (data: {
    hoursSlept: number;
    bedtime: string;
    wakeTime: string;
    quality: SleepQuality;
    notes?: string;
  }) => SleepLog;
  getAverageHours: (days?: number) => number;
  getAverageEfficiency: (days?: number) => number;
  getSleepDebt: () => number; // in hours relative to 8h target
  getCurrentStreak: () => number;
}

const STORAGE_KEY = "ascend_sleep_logs_v1";

const DEFAULT_LOGS: SleepLog[] = [
  {
    id: "log-prev-6",
    date: new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0],
    hoursSlept: 7.5,
    bedtime: "23:30",
    wakeTime: "07:00",
    quality: "RESTFUL",
    efficiencyScore: 91,
    recoveryGain: 0.5,
    expAwarded: 90,
    goldAwarded: 45,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "log-prev-5",
    date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    hoursSlept: 8.0,
    bedtime: "23:00",
    wakeTime: "07:00",
    quality: "DEEP_REM",
    efficiencyScore: 100,
    recoveryGain: 0.8,
    expAwarded: 120,
    goldAwarded: 60,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "log-prev-4",
    date: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0],
    hoursSlept: 6.5,
    bedtime: "00:30",
    wakeTime: "07:00",
    quality: "MODERATE",
    efficiencyScore: 73,
    recoveryGain: 0.4,
    expAwarded: 70,
    goldAwarded: 35,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "log-prev-3",
    date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    hoursSlept: 8.2,
    bedtime: "22:50",
    wakeTime: "07:02",
    quality: "DEEP_REM",
    efficiencyScore: 96,
    recoveryGain: 0.7,
    expAwarded: 110,
    goldAwarded: 55,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "log-prev-2",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    hoursSlept: 7.8,
    bedtime: "23:15",
    wakeTime: "07:03",
    quality: "RESTFUL",
    efficiencyScore: 96,
    recoveryGain: 0.7,
    expAwarded: 105,
    goldAwarded: 50,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "log-prev-1",
    date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
    hoursSlept: 8.0,
    bedtime: "23:00",
    wakeTime: "07:00",
    quality: "DEEP_REM",
    efficiencyScore: 100,
    recoveryGain: 0.8,
    expAwarded: 120,
    goldAwarded: 60,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export function calculateSleepEfficiency(hours: number, quality: SleepQuality): {
  score: number;
  recoveryGain: number;
  exp: number;
  gold: number;
  ratingLabel: string;
} {
  // Optimal golden standard: 8.0 hours
  const diff = Math.abs(hours - 8.0);
  let baseScore = Math.max(20, Math.min(100, Math.round(100 - diff * 18)));

  // Quality multiplier
  const qualityMultipliers: Record<SleepQuality, number> = {
    DEEP_REM: 1.15,
    RESTFUL: 1.0,
    MODERATE: 0.85,
    FRAGMENTED: 0.65,
    POOR: 0.5,
  };

  const finalScore = Math.min(100, Math.round(baseScore * (qualityMultipliers[quality] || 1.0)));

  // Recovery stat gain calculation: closer to 8 hours -> up to +0.8 to +1.0 REC stat!
  const recoveryGain = parseFloat(((finalScore / 100) * 0.8).toFixed(2));
  const exp = Math.round(50 + (finalScore / 100) * 70);
  const gold = Math.round(25 + (finalScore / 100) * 35);

  let ratingLabel = "Sub-Optimal Rest";
  if (finalScore >= 95) ratingLabel = "Divine Somatic Regeneration";
  else if (finalScore >= 85) ratingLabel = "Optimal Restorative Sleep";
  else if (finalScore >= 70) ratingLabel = "Good Recovery";
  else if (finalScore >= 50) ratingLabel = "Moderate Rest";

  return { score: finalScore, recoveryGain, exp, gold, ratingLabel };
}

const loadInitialLogs = (): SleepLog[] => {
  if (typeof window === "undefined") return DEFAULT_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading sleep logs from localStorage", e);
  }
  return DEFAULT_LOGS;
};

export const useSleepStore = create<SleepState>((set, get) => ({
  isDrawerOpen: false,
  sleepLogs: loadInitialLogs(),
  todayLogged: false,

  openDrawer: () => {
    playUIMenuSFX("confirm");
    set({ isDrawerOpen: true });
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false });
  },

  toggleDrawer: () => {
    playUIMenuSFX("confirm");
    set((state) => ({ isDrawerOpen: !state.isDrawerOpen }));
  },

  logSleep: ({ hoursSlept, bedtime, wakeTime, quality, notes }) => {
    const { score, recoveryGain, exp, gold, ratingLabel } = calculateSleepEfficiency(
      hoursSlept,
      quality
    );

    const todayStr = new Date().toISOString().split("T")[0];

    const newLog: SleepLog = {
      id: `sleep-${Date.now()}`,
      date: todayStr,
      hoursSlept,
      bedtime,
      wakeTime,
      quality,
      efficiencyScore: score,
      recoveryGain,
      expAwarded: exp,
      goldAwarded: gold,
      notes,
      createdAt: new Date().toISOString(),
    };

    // Filter out previous today log if updating
    const updatedLogs = [newLog, ...get().sleepLogs.filter((l) => l.date !== todayStr)];

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
      } catch (e) {
        console.error("Error saving sleep logs", e);
      }
    }

    // Award character progression & Recovery Stat (REC)
    const charStore = useCharacterStore.getState();
    charStore.gainExp(exp, `Sleep Regeneration: ${hoursSlept}h (${score}% Efficiency)`);
    charStore.gainGold(gold, "Restorative Rest Bounty");
    charStore.addStat("recovery", recoveryGain);

    playBuffSFX("levelup");

    toast.success(`Restorative Sleep Logged (${hoursSlept}h)`, {
      description: `${ratingLabel} • +${recoveryGain} Recovery Stat, +${exp} EXP, +${gold} Gold!`,
    });

    set({ sleepLogs: updatedLogs, todayLogged: true });
    return newLog;
  },

  getAverageHours: (days = 7) => {
    const logs = get().sleepLogs.slice(0, days);
    if (logs.length === 0) return 8.0;
    const sum = logs.reduce((acc, l) => acc + l.hoursSlept, 0);
    return parseFloat((sum / logs.length).toFixed(1));
  },

  getAverageEfficiency: (days = 7) => {
    const logs = get().sleepLogs.slice(0, days);
    if (logs.length === 0) return 90;
    const sum = logs.reduce((acc, l) => acc + l.efficiencyScore, 0);
    return Math.round(sum / logs.length);
  },

  getSleepDebt: () => {
    // 7 days * 8 hours = 56 hours standard
    const logs = get().sleepLogs.slice(0, 7);
    const actualTotal = logs.reduce((acc, l) => acc + l.hoursSlept, 0);
    const targetTotal = logs.length * 8.0;
    const debt = targetTotal - actualTotal;
    return parseFloat(debt.toFixed(1));
  },

  getCurrentStreak: () => {
    const logs = [...get().sleepLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date);
      logDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === i || diffDays === i + 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },
}));
