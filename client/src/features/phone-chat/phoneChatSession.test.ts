import { describe, expect, it, vi } from "vitest";
import {
  clearPhoneChatStorage,
  loadPhoneChatSession,
  logoutPhoneChat,
  pendingPhoneChatRevocations,
  retryPhoneChatRevocations,
  savePhoneChatSession,
  startNewPhoneChat,
  type PhoneChatStorage,
} from "./phoneChatSession";
import type { PhoneChatMessage } from "./types";

class MemoryStorage implements PhoneChatStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

describe("phone chat tab session storage", () => {
  it("restores one tab's session and transcript without sharing another tab", () => {
    const tabA = new MemoryStorage();
    const tabB = new MemoryStorage();
    const message: PhoneChatMessage = {
      messageId: "message-a",
      text: "What is the Hub status?",
      status: "processing",
      createdAt: "2026-09-26T12:00:00.000Z",
    };

    savePhoneChatSession(tabA, { sessionId: "session-a", deviceId: "device-a", messages: [message] });
    const restored = loadPhoneChatSession(tabA, () => "unused-session");
    const freshTab = loadPhoneChatSession(tabB, () => "session-b");

    expect(restored).toEqual({ sessionId: "session-a", deviceId: "device-a", messages: [message] });
    expect(freshTab).toEqual({ sessionId: "session-b", deviceId: null, messages: [] });
    expect(tabA.getItem("ascend.phone-chat.messages.v1")).toContain(message.text);
    expect(tabB.getItem("ascend.phone-chat.messages.v1")).toBe("[]");
  });

  it("starts a fresh chat but keeps this tab's device registration", () => {
    const storage = new MemoryStorage();
    savePhoneChatSession(storage, { sessionId: "old-session", deviceId: "device-a", messages: [
      { messageId: "m1", text: "private text", status: "completed", reply: "answer", createdAt: "now" },
    ] });

    const next = startNewPhoneChat(storage, () => "new-session");

    expect(next).toEqual({ sessionId: "new-session", deviceId: "device-a", messages: [] });
    expect(storage.getItem("ascend.phone-chat.messages.v1")).toBe("[]");
  });

  it("clears all phone data on logout and safely ignores malformed stored transcripts", () => {
    const storage = new MemoryStorage();
    storage.setItem("ascend.phone-chat.session.v1", "session-a");
    storage.setItem("ascend.phone-chat.device.v1", "device-a");
    storage.setItem("ascend.phone-chat.messages.v1", "not-json");

    const recovered = loadPhoneChatSession(storage, () => "recovered-session");
    expect(recovered).toEqual({ sessionId: "session-a", deviceId: "device-a", messages: [] });

    clearPhoneChatStorage(storage);
    expect(storage.getItem("ascend.phone-chat.session.v1")).toBeNull();
    expect(storage.getItem("ascend.phone-chat.device.v1")).toBeNull();
    expect(storage.getItem("ascend.phone-chat.messages.v1")).toBeNull();
  });

  it("retains only a device ID after offline logout and retries revocation on the next sign-in", async () => {
    const tab = new MemoryStorage();
    const durable = new MemoryStorage();
    savePhoneChatSession(tab, { sessionId: "tab-a", deviceId: "device-a", messages: [
      { messageId: "m1", text: "private prompt", reply: "private answer", status: "completed", createdAt: "now" },
    ] });
    const offline = vi.fn().mockRejectedValue(new Error("offline"));

    await expect(logoutPhoneChat(tab, durable, offline)).rejects.toThrow("offline");
    expect(pendingPhoneChatRevocations(durable)).toEqual(["device-a"]);
    expect(durable.getItem("ascend.phone-chat.pending-revocations.v1")).toBe('["device-a"]');
    expect(tab.getItem("ascend.phone-chat.device.v1")).toBeNull();
    expect(tab.getItem("ascend.phone-chat.messages.v1")).toBeNull();

    const online = vi.fn().mockResolvedValue(undefined);
    await retryPhoneChatRevocations(durable, online);
    expect(online).toHaveBeenCalledExactlyOnceWith("device-a");
    expect(pendingPhoneChatRevocations(durable)).toEqual([]);
  });
});
