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
}

export interface PhoneChatDeviceResponse {
  deviceId: string;
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
    case "failed": return message.errorCode === "send_unconfirmed"
      ? "Core didn't confirm this message"
      : "Vision couldn't complete this message";
    case "expired": return "This message expired before Vision could respond";
  }
}
