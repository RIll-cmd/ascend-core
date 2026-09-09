export type TriggerType =
  "phone_usage_observed" | "drowsiness_observed" | "posture_observed";
export type ConditionField =
  | "event.type"
  | "event.source"
  | "event.timestamp"
  | "payload.confidence"
  | "payload.posture"
  | "payload.state"
  | "payload.detector"
  | "payload.ear"
  | "payload.slouch_score";
export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal"
  | "contains";
export type CooldownUnit = "seconds" | "minutes" | "hours";
export type MatchMode = "all" | "any";
export type FieldCondition = {
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number | boolean | null;
};
export type TimeWindowCondition = {
  type: "time_window";
  start: string;
  end: string;
};
export type OccurrenceCountCondition = {
  type: "occurrence_count";
  count: number;
  windowSeconds: number;
};
export type AutomationCondition =
  FieldCondition | TimeWindowCondition | OccurrenceCountCondition;
export type AdvancedAutomationCondition =
  TimeWindowCondition | OccurrenceCountCondition;

export interface AutomationDraft {
  characterId: string;
  name: string;
  enabled: boolean;
  triggerType: TriggerType;
  condition: FieldCondition;
  conditions?: AdvancedAutomationCondition[];
  matchMode?: MatchMode;
  habitId: string;
  cooldownAmount: number;
  cooldownUnit: CooldownUnit;
}

export interface AutomationRule {
  id: string;
  characterId: string;
  name: string;
  enabled: boolean;
  triggerType: TriggerType;
  matchMode: MatchMode;
  conditions: AutomationCondition[];
  actions: [{ type: "log_bad_habit"; habitId: string }];
  cooldownSeconds: number;
  lastTriggeredAt?: string | null;
}

export interface VisionConnectionStatus {
  status: "CONNECTED" | "OFFLINE";
  characterId: string;
  deviceId: string | null;
  source: "ascend_vision" | null;
  version: string | null;
  lastSeenAt: string | null;
}

export const cooldownToSeconds = (amount: number, unit: CooldownUnit) =>
  Math.max(
    0,
    Math.round(amount * { seconds: 1, minutes: 60, hours: 3600 }[unit])
  );

export function buildAutomationPayload(draft: AutomationDraft) {
  const conditions = draft.conditions ?? [draft.condition];
  return {
    characterId: draft.characterId,
    name: draft.name.trim(),
    enabled: draft.enabled,
    triggerType: draft.triggerType,
    ...(draft.matchMode ? { matchMode: draft.matchMode } : {}),
    conditions,
    actions: [{ type: "log_bad_habit" as const, habitId: draft.habitId }],
    cooldownSeconds: cooldownToSeconds(
      draft.cooldownAmount,
      draft.cooldownUnit
    ),
  };
}

const headers = () => ({
  "Content-Type": "application/json",
  ...(typeof window !== "undefined" && localStorage.getItem("ascend_session")
    ? { Authorization: `Bearer ${localStorage.getItem("ascend_session")}` }
    : {}),
});
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { API_BASE_URL } = await import("@/constants");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: { ...headers(), ...(options?.headers || {}) },
  });
  if (!response.ok)
    throw new Error(
      (await response.json().catch(() => null))?.detail ||
        "Automation request failed."
    );
  return response.status === 204 ? (undefined as T) : response.json();
}
export const listAutomations = (characterId: string) =>
  request<{ automations: AutomationRule[] }>(
    `/api/automations?characterId=${encodeURIComponent(characterId)}`
  ).then((response) => response.automations);
export const getVisionStatus = (characterId: string) =>
  request<VisionConnectionStatus>(
    `/api/integration/vision/status?characterId=${encodeURIComponent(characterId)}`
  );
export const createAutomation = (draft: AutomationDraft) =>
  request<AutomationRule>("/api/automations", {
    method: "POST",
    body: JSON.stringify(buildAutomationPayload(draft)),
  });
export const updateAutomation = (
  id: string,
  payload: Partial<AutomationRule>
) =>
  request<AutomationRule>(`/api/automations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const deleteAutomation = (id: string) =>
  request<void>(`/api/automations/${id}`, { method: "DELETE" });
export const testAutomation = (
  id: string,
  observation: {
    source: "phone_cv";
    type: TriggerType;
    timestamp: string;
    payload: Record<string, string | number | boolean | null>;
  }
) =>
  request<{
    matched: boolean;
    reason?: string;
    conditions: { matched: boolean; reason?: string }[];
  }>(`/api/automations/${id}/test`, {
    method: "POST",
    body: JSON.stringify(observation),
  });
