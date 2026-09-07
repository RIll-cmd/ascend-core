import { create } from "zustand";
import { API_BASE_URL } from "@/constants";

export interface BossPhase {
  id: string;
  name: string;
  maxHp: number;
  orderIndex: number;
}

export interface BossActivity {
  id: string;
  activityType: string;
  referenceId: string | null;
  damageValue: number;
}

export interface BossDamageLog {
  id: string;
  damage: number;
  createdAt: string;
}

export interface Boss {
  id: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  archetype: string | null;
  maxHp: number;
  currentHp: number;
  rewardGold: number | null;
  rewardExp: number | null;
  rewardTitle: string | null;
  realWorldReward: string | null;
  deadline: string | null;
  status: "ACTIVE" | "DEFEATED" | "FAILED" | "ARCHIVED";
  createdAt: string;
  phases: BossPhase[];
  activities: BossActivity[];
  damageLogs: BossDamageLog[];
}

export interface CreateBossPayload {
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  archetype?: string;
  maxHp?: number;
  rewardGold?: number;
  rewardExp?: number;
  rewardTitle?: string;
  realWorldReward?: string;
  deadline?: string;
  activities: { activityType: string; referenceId?: string; damageValue: number }[];
}

interface BossState {
  bosses: Boss[];
  isLoading: boolean;
  error: string | null;
  fetchBosses: (characterId: string) => Promise<void>;
  createBoss: (characterId: string, payload: CreateBossPayload) => Promise<Boss>;
  fetchBossTrajectory: (characterId: string, bossId: string) => Promise<string | null>;
}

const API_BASE = `${API_BASE_URL}/api`;

export const useBossStore = create<BossState>((set) => ({
  bosses: [],
  isLoading: false,
  error: null,

  fetchBosses: async (characterId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/bosses/${characterId}`);
      if (!response.ok) throw new Error("Failed to fetch bosses");
      const data = await response.json();
      set({ bosses: data, isLoading: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch bosses",
        isLoading: false,
      });
    }
  },

  createBoss: async (characterId: string, payload: CreateBossPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/bosses/${characterId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail || "The summoning contract was rejected.");
      }
      const newBoss = await response.json();
      
      set((state) => ({
        bosses: [newBoss, ...state.bosses],
        isLoading: false,
      }));
      return newBoss;
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "The summoning contract failed.",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchBossTrajectory: async (characterId: string, bossId: string) => {
    try {
      const response = await fetch(`${API_BASE}/aira/boss-trajectory/${characterId}/${bossId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error("Failed to fetch boss trajectory:", error);
      return null;
    }
  },
}));
