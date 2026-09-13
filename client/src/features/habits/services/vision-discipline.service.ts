import { API_BASE_URL } from "@/constants";

export type VisionBehavior = "PHONE_USE" | "SLOUCHING" | "DROWSINESS";
export type VisionStage = "WARNING" | "PENALTY";
export interface VisionSetting { behavior: VisionBehavior; penaltyAmount: number }
export interface VisionLog {
  id: string;
  behavior: VisionBehavior;
  stage: VisionStage;
  reason: string;
  observedAt: string;
  penaltyAmount: number | null;
  configuredAmount: number | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("ascend_session");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) throw new Error(`Vision discipline request failed (${response.status})`);
  return response.json() as Promise<T>;
}

function root(characterId: string): string {
  return `/api/habits/${encodeURIComponent(characterId)}/vision-discipline`;
}

export const getVisionSettings = (characterId: string) =>
  request<VisionSetting[]>(`${root(characterId)}/settings`);
export const getVisionLogs = (characterId: string) =>
  request<VisionLog[]>(`${root(characterId)}/logs`);
export const saveVisionSetting = (characterId: string, behavior: VisionBehavior, penaltyAmount: number) =>
  request<VisionSetting>(`${root(characterId)}/settings/${behavior}`, {
    method: "PUT", body: JSON.stringify({ penaltyAmount }),
  });
