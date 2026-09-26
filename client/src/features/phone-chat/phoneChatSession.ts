import type { PhoneChatMessage, PhoneChatSession, PhoneChatStatus } from "./types";

export interface PhoneChatStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const PHONE_CHAT_SESSION_KEY = "ascend.phone-chat.session.v1";
export const PHONE_CHAT_DEVICE_KEY = "ascend.phone-chat.device.v1";
export const PHONE_CHAT_MESSAGES_KEY = "ascend.phone-chat.messages.v1";
export const PHONE_CHAT_REVOCATIONS_KEY = "ascend.phone-chat.pending-revocations.v1";
const VALID_STATUSES = new Set<PhoneChatStatus>([
  "queued", "claimed", "processing", "completed", "failed", "expired",
]);
const MAX_RESTORED_MESSAGES = 200;

function safeGet(storage: PhoneChatStorage | null, key: string): string | null {
  try { return storage?.getItem(key) ?? null; } catch { return null; }
}

function validMessage(value: unknown): value is PhoneChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<PhoneChatMessage>;
  return typeof message.messageId === "string" && message.messageId.length <= 128
    && typeof message.text === "string" && message.text.length <= 4_000
    && typeof message.status === "string" && VALID_STATUSES.has(message.status as PhoneChatStatus)
    && typeof message.createdAt === "string"
    && (message.reply === undefined || (typeof message.reply === "string" && message.reply.length <= 8_000))
    && (message.errorCode === undefined || typeof message.errorCode === "string")
    && (message.acknowledged === undefined || typeof message.acknowledged === "boolean");
}

export function loadPhoneChatSession(
  storage: PhoneChatStorage | null,
  createSessionId: () => string,
): PhoneChatSession {
  const storedSessionId = safeGet(storage, PHONE_CHAT_SESSION_KEY);
  const sessionId = storedSessionId && /^[A-Za-z0-9_-]{1,128}$/.test(storedSessionId)
    ? storedSessionId
    : createSessionId();
  const rawMessages = safeGet(storage, PHONE_CHAT_MESSAGES_KEY);
  let messages: PhoneChatMessage[] = [];
  if (rawMessages) {
    try {
      const value: unknown = JSON.parse(rawMessages);
      if (Array.isArray(value) && value.every(validMessage)) {
        messages = value.slice(-MAX_RESTORED_MESSAGES);
      }
    } catch {
      messages = [];
    }
  }
  const deviceId = safeGet(storage, PHONE_CHAT_DEVICE_KEY);
  const session = { sessionId, deviceId: deviceId || null, messages };
  savePhoneChatSession(storage, session);
  return session;
}

export function savePhoneChatSession(storage: PhoneChatStorage | null, session: PhoneChatSession): void {
  try {
    storage?.setItem(PHONE_CHAT_SESSION_KEY, session.sessionId);
    storage?.setItem(PHONE_CHAT_MESSAGES_KEY, JSON.stringify(session.messages.slice(-MAX_RESTORED_MESSAGES)));
    if (session.deviceId) storage?.setItem(PHONE_CHAT_DEVICE_KEY, session.deviceId);
    else storage?.removeItem(PHONE_CHAT_DEVICE_KEY);
  } catch {
    // Private browsing can deny sessionStorage; the in-memory UI still works.
  }
}

export function startNewPhoneChat(
  storage: PhoneChatStorage | null,
  createSessionId: () => string,
): PhoneChatSession {
  const next = {
    sessionId: createSessionId(),
    deviceId: safeGet(storage, PHONE_CHAT_DEVICE_KEY),
    messages: [],
  };
  savePhoneChatSession(storage, next);
  return next;
}

export function clearPhoneChatStorage(storage: PhoneChatStorage | null): void {
  try {
    storage?.removeItem(PHONE_CHAT_SESSION_KEY);
    storage?.removeItem(PHONE_CHAT_DEVICE_KEY);
    storage?.removeItem(PHONE_CHAT_MESSAGES_KEY);
  } catch {
    // Best-effort cleanup when the browser has disabled sessionStorage.
  }
}

export function pendingPhoneChatRevocations(storage: PhoneChatStorage | null): string[] {
  const raw = safeGet(storage, PHONE_CHAT_REVOCATIONS_KEY);
  if (!raw) return [];
  try {
    const ids: unknown = JSON.parse(raw);
    return Array.isArray(ids) && ids.every((id) => typeof id === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(id))
      ? ids : [];
  } catch {
    return [];
  }
}

export function queuePhoneChatRevocation(storage: PhoneChatStorage | null, deviceId: string): void {
  if (!storage) throw new Error("Persistent storage is unavailable");
  const ids = pendingPhoneChatRevocations(storage);
  if (!ids.includes(deviceId)) storage.setItem(PHONE_CHAT_REVOCATIONS_KEY, JSON.stringify([...ids, deviceId]));
}

function clearPhoneChatRevocation(storage: PhoneChatStorage | null, deviceId: string): void {
  const remaining = pendingPhoneChatRevocations(storage).filter((id) => id !== deviceId);
  if (remaining.length) storage?.setItem(PHONE_CHAT_REVOCATIONS_KEY, JSON.stringify(remaining));
  else storage?.removeItem(PHONE_CHAT_REVOCATIONS_KEY);
}

export async function logoutPhoneChat(
  tabStorage: PhoneChatStorage | null,
  durableStorage: PhoneChatStorage | null,
  revoke: (deviceId: string) => Promise<void>,
): Promise<void> {
  const deviceId = safeGet(tabStorage, PHONE_CHAT_DEVICE_KEY);
  if (deviceId) {
    try {
      queuePhoneChatRevocation(durableStorage, deviceId);
    } catch {
      // Storage can be disabled; still attempt immediate revocation.
    }
  }
  clearPhoneChatStorage(tabStorage);
  if (!deviceId) return;
  await revoke(deviceId);
  clearPhoneChatRevocation(durableStorage, deviceId);
}

export async function retryPhoneChatRevocations(
  storage: PhoneChatStorage | null,
  revoke: (deviceId: string) => Promise<void>,
): Promise<void> {
  for (const deviceId of pendingPhoneChatRevocations(storage)) {
    await revoke(deviceId);
    clearPhoneChatRevocation(storage, deviceId);
  }
}
