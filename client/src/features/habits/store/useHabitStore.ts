import { create } from "zustand";
import { Habit, Mission, CompletionType, HabitStatus } from "../types";
import { getBaseReward, calculateFinalReward } from "../utils";
import {
  createHabit,
  fetchHabits,
  generateTodayMissions,
  fetchTodayMissions,
  completeMission,
  updateHabitStatus,
  updateHabitDetails,
  logHabit,
  triggerHabit,
  HabitTriggerResponse,
  HabitCreatePayload,
} from "../services/habit.service";
import { eventBus } from "@/features/progression/services/EventBus";
import "@/features/progression/services/ProgressionEngine";
import { playConfirmedSound } from "@/features/audio/useSystemAudio";
import { useCharacterStore } from "@/store/useCharacterStore";

export interface HabitStore {
  habits: Habit[];
  todayMissions: Mission[];
  isLoading: boolean;
  loadHabits: (characterId?: string) => Promise<void>;
  loadTodayMissions: (characterId?: string) => Promise<void>;
  createNewHabit: (characterId: string, payload: HabitCreatePayload) => Promise<Habit | null>;
  logHabitCompletion: (
    habitId: string,
    completionType?: CompletionType,
    customValue?: number
  ) => Promise<{ success: boolean; rewards?: any }>;
  executeMissionCompletion: (
    missionId: string,
    habit: Habit,
    completionType: CompletionType
  ) => Promise<void>;
  updateHabitStatus: (habitId: string, status: HabitStatus) => Promise<void>;
  updateHabitDetails: (habitId: string, payload: Partial<HabitCreatePayload>) => Promise<Habit | null>;
  triggerBadHabit: (habitId: string) => Promise<{ success: boolean; penalty?: HabitTriggerResponse["penalty"] }>;
}

const getStoredCharacterId = (): string => {
  const storeCharId = useCharacterStore.getState().character?.id;
  if (storeCharId) return storeCharId;
  if (typeof window !== "undefined") {
    return localStorage.getItem("ascend_character_id") || "char-id-123";
  }
  return "char-id-123";
};

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  todayMissions: [],
  isLoading: false,

  loadHabits: async (characterId?: string) => {
    const targetId = characterId || getStoredCharacterId();
    set({ isLoading: true });
    try {
      const habits = await fetchHabits(targetId);
      set({ habits, isLoading: false });
    } catch (error) {
      console.error("[useHabitStore] Error loading habits:", error);
      set({ isLoading: false });
    }
  },

  loadTodayMissions: async (characterId?: string) => {
    const targetId = characterId || getStoredCharacterId();
    set({ isLoading: true });
    try {
      await generateTodayMissions(targetId);
      const todayMissions = await fetchTodayMissions(targetId);
      set({ todayMissions, isLoading: false });
    } catch (error) {
      console.error("[useHabitStore] Error loading today's missions:", error);
      set({ isLoading: false });
    }
  },

  createNewHabit: async (characterId: string, payload: HabitCreatePayload) => {
    const targetId = characterId || getStoredCharacterId();
    set({ isLoading: true });
    try {
      const newHabit = await createHabit(targetId, payload);
      if (newHabit) {
        set((state) => ({
          habits: [...state.habits, newHabit],
          isLoading: false,
        }));
        await get().loadTodayMissions(targetId);
      } else {
        console.error(
          `[useHabitStore] createNewHabit failed for targetId '${targetId}'. Service returned null.`
        );
        set({ isLoading: false });
      }
      return newHabit;
    } catch (error) {
      console.error("[useHabitStore] Exception in createNewHabit:", error);
      set({ isLoading: false });
      return null;
    }
  },

  logHabitCompletion: async (
    habitId: string,
    completionType: CompletionType = "NORMAL",
    customValue?: number
  ) => {
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return { success: false };

    const baseReward = getBaseReward(habit.difficulty);
    const finalReward = calculateFinalReward(baseReward, completionType);

    playConfirmedSound();

    // Optimistic UI updates
    const currentStreakCount = habit.metrics?.currentStreak || 0;
    const newStreak = currentStreakCount + 1;
    const currentStrength = habit.metrics?.habitStrength ?? 60;
    const newStrength = Math.min(100, Math.round(currentStrength + 4));

    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              metrics: h.metrics
                ? {
                    ...h.metrics,
                    currentStreak: newStreak,
                    longestStreak: Math.max(newStreak, h.metrics.longestStreak || 0),
                    habitStrength: newStrength,
                    currentConsistency: Math.min(100, (h.metrics.currentConsistency || 50) + 5),
                  }
                : {
                    id: `m-${habitId}`,
                    habitId: habitId,
                    habitStrength: newStrength,
                    currentStreak: newStreak,
                    longestStreak: newStreak,
                    successRate: 100,
                    completionRate: 100,
                    currentConsistency: 100,
                  },
            }
          : h
      ),

      todayMissions: state.todayMissions.map((m) =>
        m.habitId === habitId
          ? {
              ...m,
              status: "COMPLETED" as const,
              completionType,
              expEarned: finalReward.exp,
              statsEarned: finalReward.stat,
              completedAt: new Date().toISOString(),
            }
          : m
      ),
    }));

    // Dispatch MISSION_COMPLETED event to central Progression Engine
    eventBus.publish("MISSION_COMPLETED", {
      baseReward,
      completionType,
      habit,
    });

    const response = await logHabit(habitId, {
      completionType,
      targetValue: customValue,
    });

    if (response && response.success) {
      if (response.habit) {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === habitId ? response.habit : h)),
        }));
      }
      return { success: true, rewards: response.rewards };
    } else {
      return {
        success: true,
        rewards: {
          exp: finalReward.exp,
          gold: finalReward.gold,
          stat: finalReward.stat,
          statName: habit.primaryStat,
          streak: newStreak,
          habitStrength: newStrength,
        },
      };
    }
  },

  triggerBadHabit: async (habitId: string) => {
    const response = await triggerHabit(habitId);
    if (!response?.success) return { success: false };
    set((state) => ({
      habits: state.habits.map((habit) => habit.id === habitId ? response.habit : habit),
    }));
    useCharacterStore.getState().setCharacter(response.character);
    return { success: true, penalty: response.penalty };
  },

  executeMissionCompletion: async (
    missionId: string,
    habit: Habit,
    completionType: CompletionType
  ) => {
    const baseReward = getBaseReward(habit.difficulty);
    const finalReward = calculateFinalReward(baseReward, completionType);

    playConfirmedSound();

    set((state) => ({
      todayMissions: state.todayMissions.map((m) =>
        m.id === missionId
          ? {
              ...m,
              status: "COMPLETED" as const,
              completionType,
              expEarned: finalReward.exp,
              statsEarned: finalReward.stat,
              completedAt: new Date().toISOString(),
            }
          : m
      ),
    }));

    // Dispatch MISSION_COMPLETED event to central Progression Engine
    eventBus.publish("MISSION_COMPLETED", {
      baseReward,
      completionType,
      habit,
    });

    completeMission(missionId, {
      completionType,
      expEarned: finalReward.exp,
      statsEarned: finalReward.stat,
    }).catch((err) => {
      console.error("[useHabitStore] Background mission completion failed:", err);
    });
  },

  updateHabitStatus: async (habitId: string, status: HabitStatus) => {
    // Optimistic update
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId ? { ...h, status } : h
      ),
    }));

    // Service call
    const updated = await updateHabitStatus(habitId, status);
    if (!updated) {
      console.error("[useHabitStore] Failed to update habit status, rolling back is not implemented yet");
    }
  },

  updateHabitDetails: async (habitId: string, payload: Partial<HabitCreatePayload>) => {
    set({ isLoading: true });
    try {
      const updated = await updateHabitDetails(habitId, payload);
      if (updated) {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === habitId ? updated : h)),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return updated;
    } catch (error) {
      console.error("[useHabitStore] Error updating habit details:", error);
      set({ isLoading: false });
      return null;
    }
  },
}));
