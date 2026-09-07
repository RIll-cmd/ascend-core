import { API_BASE_URL } from "@/constants";
import { Habit, Mission, HabitDifficulty, ScheduleType, CompletionType, HabitStatus, HabitType, PenaltyTarget } from "../types";

export interface HabitScheduleCreatePayload {
  daysOfWeek?: string | null;
  timesPerWeek?: number | null;
  timesPerMonth?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string | null;
}

export interface HabitTierCreatePayload {
  tier: CompletionType;
  targetType?: string | null;
  targetValue?: number | null;
  targetUnit?: string | null;
  baseExp: number;
  baseGold: number;
  statReward: number;
}

export interface HabitCreatePayload {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  category: string;
  difficulty: HabitDifficulty;
  primaryStat: string;
  scheduleType: ScheduleType;
  rrule?: string | null;
  preferredTime?: string | null;
  schedule?: HabitScheduleCreatePayload | null;
  tiers: HabitTierCreatePayload[];
  type?: HabitType;
  affectedStat?: PenaltyTarget;
  statModifier?: number;
}

export interface MissionCompletePayload {
  completionType: CompletionType;
  expEarned?: number;
  statsEarned?: number;
}

export interface HabitLogResponse {
  success: boolean;
  habit: Habit;
  mission: Mission;
  rewards: {
    exp: number;
    gold: number;
    stat: number;
    statName: string;
    gems: number;
    streak: number;
    habitStrength: number;
  };
}

export interface HabitTriggerResponse {
  success: boolean;
  habit: Habit;
  character: import("@/features/character/types/character").Character;
  stats?: import("@/features/character/types/character").CharacterStats | null;
  penalty: {
    target: string;
    amount: number;
    previousValue: number;
    newValue: number;
  };
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ascend_session");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * Creates a new Habit template for a character
 */
export async function createHabit(
  characterId: string,
  payload: HabitCreatePayload
): Promise<Habit | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/habits/${characterId}`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[habit.service] Failed to create habit (HTTP ${res.status} ${res.statusText}):`,
        errorText
      );
      return null;
    }

    const data = await res.json();
    return data as Habit;
  } catch (error) {
    console.error("[habit.service] Error creating habit:", error);
    return null;
  }
}

/**
 * Fetches all habit templates for a character
 */
export async function fetchHabits(characterId: string): Promise<Habit[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/habits/${characterId}`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[habit.service] Failed to fetch habits (HTTP ${res.status} ${res.statusText}):`,
        errorText
      );
      return [];
    }

    const data = await res.json();
    return data as Habit[];
  } catch (error) {
    console.error("[habit.service] Error fetching habits:", error);
    return [];
  }
}

/**
 * Logs completion of a habit directly for today
 */
export async function logHabit(
  habitId: string,
  payload: { completionType: CompletionType; targetValue?: number | null; notes?: string | null }
): Promise<HabitLogResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}/log`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[habit.service] Failed to log habit (HTTP ${res.status} ${res.statusText}):`,
        errorText
      );
      return null;
    }

    const data = await res.json();
    return data as HabitLogResponse;
  } catch (error) {
    console.error("[habit.service] Error logging habit:", error);
    return null;
  }
}

export async function triggerHabit(habitId: string): Promise<HabitTriggerResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}/trigger`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return (await res.json()) as HabitTriggerResponse;
  } catch (error) {
    console.error("[habit.service] Error triggering habit:", error);
    return null;
  }
}

/**
 * Triggers the backend mission generator for the given character.
 */
export async function generateTodayMissions(characterId: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/habits/${characterId}/generate-missions`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      console.error(`[habit.service] Failed to generate missions (HTTP ${res.status} ${res.statusText})`);
    }
  } catch (error) {
    console.error("[habit.service] Error generating today's missions:", error);
  }
}

/**
 * Fetches today's missions for a character
 */
export async function fetchTodayMissions(characterId: string): Promise<Mission[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/missions/today/${characterId}`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[habit.service] Failed to fetch today's missions (HTTP ${res.status} ${res.statusText}):`,
        errorText
      );
      return [];
    }

    const data = await res.json();
    return data as Mission[];
  } catch (error) {
    console.error("[habit.service] Error fetching today's missions:", error);
    return [];
  }
}

/**
 * Completes a mission instance with completion tier and rewards
 */
export async function completeMission(
  missionId: string,
  payload: MissionCompletePayload
): Promise<Mission | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/missions/${missionId}/complete`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[habit.service] Failed to complete mission (HTTP ${res.status} ${res.statusText}):`,
        errorText
      );
      return null;
    }

    const data = await res.json();
    return data as Mission;
  } catch (error) {
    console.error("[habit.service] Error completing mission:", error);
    return null;
  }
}

/**
 * Updates the status of a habit (Pause, Archive, Delete, Active)
 */
export async function updateHabitStatus(
  habitId: string,
  status: HabitStatus
): Promise<Habit | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[habit.service] Failed to update habit status (HTTP ${res.status} ${res.statusText}):`,
        errorText
      );
      return null;
    }

    const data = await res.json();
    return data as Habit;
  } catch (error) {
    console.error("[habit.service] Error updating habit status:", error);
    return null;
  }
}

/**
 * Updates a habit template details, schedule, and tiers
 */
export async function updateHabitDetails(
  habitId: string,
  payload: Partial<HabitCreatePayload>
): Promise<Habit | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}`, {
      method: "PUT",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[habit.service] Failed to update habit (HTTP ${res.status}):`, errorText);
      return null;
    }

    const data = await res.json();
    return data as Habit;
  } catch (error) {
    console.error("[habit.service] Error updating habit details:", error);
    return null;
  }
}

