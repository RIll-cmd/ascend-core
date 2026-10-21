export type PhoneChatStatus =
  | "queued"
  | "claimed"
  | "processing"
  | "completed"
  | "failed"
  | "expired";

export interface PhoneChatMessage {
  messageId: string;
  text: string;
  status: PhoneChatStatus;
  createdAt: string;
  reply?: string;
  errorCode?: string;
  acknowledged?: boolean;
  voice?: boolean;
}

export interface PhoneChatDeviceResponse {
  deviceId: string;
}

export interface CompanionContextField {
  value: string;
  source: string;
  freshness: "fresh" | "stale" | "unavailable" | "paused";
  observedAt: string | null;
  expiresAt: string | null;
  ageSeconds: number | null;
  evidenceKind: "observation" | "user_report" | "inference";
}

export interface CompanionContextSnapshot {
  available: boolean;
  reason: "current" | "laptop_offline" | "never_published";
  deviceId: string;
  lastSeenAt: string | null;
  generatedAt?: string | null;
  snapshotId?: string | null;
  fields: Record<string, CompanionContextField>;
}

export interface PhoneChatAccepted {
  messageId: string;
  status: "queued";
  expiresAt: string;
}

export interface PhoneChatMessageResponse {
  messageId: string;
  status: PhoneChatStatus;
  expiresAt: string;
  reply?: string | null;
  errorCode?: string | null;
}

export type BrowserTaskStatus =
  | "queued" | "claimed" | "running" | "paused" | "waiting_for_user" | "stopping"
  | "completed" | "partial" | "failed" | "unknown" | "cancelled" | "expired";

export interface BrowserScopeDescriptor {
  scopeId: string;
  version: number;
  actions: string[];
  origin?: string;
}

export interface BrowserAvailability {
  available: boolean;
  reason: "online" | "busy" | "provider_unavailable" | "disabled" | "offline";
  laptopId: string | null;
  lastHeartbeatAt: string | null;
  provider: string | null;
  scopes: BrowserScopeDescriptor[];
}

export interface BrowserSessionResponse {
  browserSessionId: string;
  channel: "phone_pwa" | "discord_dm";
  parentSessionId: string | null;
  expiresAt: string;
}

export interface BrowserTaskReceipt {
  taskId: string;
  status: BrowserTaskStatus;
  expiresAt: string;
  createdAt: string;
}

export interface BrowserTaskEvent {
  sequence: number;
  eventType: string;
  summary: string | null;
  createdAt: string;
}

export interface BrowserTaskView {
  taskId: string;
  status: BrowserTaskStatus;
  channel: "phone_pwa" | "discord_dm";
  scopeId: string;
  createdAt: string;
  expiresAt: string;
  result: { status?: string; findings?: Array<{ text: string; sources: string[] }>; sources?: string[] } | null;
  terminalReason: string | null;
  events: BrowserTaskEvent[];
  cursor: number;
  nextCursor?: number;
  resetRequired?: boolean;
  waitingForUserType?: "action_review" | "local_takeover" | null;
  review?: BrowserActionReviewData | null;
}

export interface BrowserActionProposal {
  task_id: string;
  action_id: string;
  owner: string;
  observation_id: string;
  document_revision: number;
  origin: string;
  action: "fill" | "select" | "click";
  target_ref: string;
  target_label: string;
  arguments: Record<string, string>;
  expected_effect: string;
  expires_at: number;
  digest: string;
}

export interface BrowserActionReviewData {
  proposal: BrowserActionProposal;
  laptopId: string;
  brokerBootId: string;
  fence: number;
}

export interface PhoneChatSession {
  sessionId: string;
  deviceId: string | null;
  messages: PhoneChatMessage[];
}

export const isPhoneChatPending = (status: PhoneChatStatus) =>
  status === "queued" || status === "claimed" || status === "processing";

export function accessibleStatus(message: PhoneChatMessage): string {
  switch (message.status) {
    case "queued": return "Queued";
    case "claimed": return "Connecting to Vision";
    case "processing": return "Vision is thinking";
    case "completed": return "Reply received";
    case "failed": return message.errorCode === "cancelled"
      ? "Voice request cancelled"
      : message.errorCode === "send_unconfirmed"
      ? "Core didn't confirm this message"
      : "Vision couldn't complete this message";
    case "expired": return "This message expired before Vision could respond";
  }
}
