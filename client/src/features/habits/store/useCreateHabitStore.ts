import { create } from "zustand";
import { HabitDifficulty, ScheduleType, CompletionType, HabitType, PenaltyTarget } from "../types";
import { HabitCreatePayload, HabitScheduleCreatePayload, HabitTierCreatePayload } from "../services/habit.service";
import { getBaseReward, calculateFinalReward } from "../utils/rewardFormula";

interface DraftHabit {
  name: string;
  description: string;
  category: string;
  primaryStat: string;
  difficulty: HabitDifficulty;
  scheduleType: ScheduleType;
  preferredTime?: string | null;
  schedule: HabitScheduleCreatePayload;
  tiers: Record<CompletionType, HabitTierCreatePayload>;
  type: HabitType;
  affectedStat: PenaltyTarget;
  statModifier: number;
}

const initialDraft: DraftHabit = {
  name: "",
  description: "",
  category: "Health",
  primaryStat: "discipline",
  difficulty: "EASY",
  scheduleType: "DAILY",
  type: "POSITIVE",
  affectedStat: "HP",
  statModifier: 10,
  schedule: {
    daysOfWeek: null,
    timesPerWeek: null,
    timesPerMonth: null,
    startTime: null,
    endTime: null,
    timezone: null,
  },
  tiers: {
    MINI: { tier: "MINI", targetType: "COUNT", targetValue: 1, targetUnit: "Times", baseExp: 15, baseGold: 5, statReward: 1 },
    NORMAL: { tier: "NORMAL", targetType: "COUNT", targetValue: 2, targetUnit: "Times", baseExp: 30, baseGold: 10, statReward: 2 },
    ELITE: { tier: "ELITE", targetType: "COUNT", targetValue: 4, targetUnit: "Times", baseExp: 60, baseGold: 20, statReward: 4 },
  },
};


export interface CreateHabitStore {
  step: number;
  draft: DraftHabit;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateDraft: (updates: Partial<DraftHabit>) => void;
  updateSchedule: (updates: Partial<HabitScheduleCreatePayload>) => void;
  updateTier: (tier: CompletionType, updates: Partial<HabitTierCreatePayload>) => void;
  recalculateRewards: () => void;
  reset: () => void;
  getPayload: () => HabitCreatePayload;
}

export const useCreateHabitStore = create<CreateHabitStore>((set, get) => ({
  step: 1,
  draft: JSON.parse(JSON.stringify(initialDraft)),

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 5) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

  updateDraft: (updates) => {
    set((state) => ({ draft: { ...state.draft, ...updates } }));
    if (updates.difficulty) {
      get().recalculateRewards();
    }
  },

  updateSchedule: (updates) =>
    set((state) => ({
      draft: {
        ...state.draft,
        schedule: { ...state.draft.schedule, ...updates },
      },
    })),

  updateTier: (tier, updates) =>
    set((state) => ({
      draft: {
        ...state.draft,
        tiers: {
          ...state.draft.tiers,
          [tier]: { ...state.draft.tiers[tier], ...updates },
        },
      },
    })),

  recalculateRewards: () => {
    const { draft } = get();
    const baseReward = getBaseReward(draft.difficulty);
    
    set((state) => {
      const newTiers = { ...state.draft.tiers };
      (["MINI", "NORMAL", "ELITE"] as CompletionType[]).forEach((tierKey) => {
        const finalReward = calculateFinalReward(baseReward, tierKey);
        newTiers[tierKey] = {
          ...newTiers[tierKey],
          baseExp: finalReward.exp,
          baseGold: finalReward.gold,
          statReward: finalReward.stat,
        };
      });
      return { draft: { ...state.draft, tiers: newTiers } };
    });
  },

  reset: () => {
    set({ step: 1, draft: JSON.parse(JSON.stringify(initialDraft)) });
    get().recalculateRewards();
  },

  getPayload: () => {
    const { draft } = get();
    
    // Convert record to array for the backend
    const tiersArray: HabitTierCreatePayload[] = [
      draft.tiers.MINI,
      draft.tiers.NORMAL,
      draft.tiers.ELITE,
    ];

    return {
      name: draft.name,
      description: draft.description,
      category: draft.category,
      difficulty: draft.difficulty,
      primaryStat: draft.primaryStat,
      scheduleType: draft.scheduleType,
      preferredTime: draft.preferredTime,
      schedule: draft.schedule,
      tiers: tiersArray,
      type: draft.type,
      affectedStat: draft.affectedStat,
      statModifier: draft.statModifier,
    };
  },
}));
