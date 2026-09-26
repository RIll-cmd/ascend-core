import { afterEach, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/useAuthStore";
import { PhoneChatApi } from "./api";
import { pendingPhoneChatRevocations, retryPhoneChatRevocations, savePhoneChatSession } from "./phoneChatSession";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("revokes a phone device on logout even when the chat page is not mounted", async () => {
  const tab = new MemoryStorage();
  const durable = new MemoryStorage();
  vi.stubGlobal("window", { sessionStorage: tab, localStorage: durable });
  vi.stubGlobal("localStorage", durable);
  savePhoneChatSession(tab, { sessionId: "tab-a", deviceId: "device-a", messages: [
    { messageId: "m1", text: "private prompt", status: "queued", createdAt: "now" },
  ] });
  const offline = vi.spyOn(PhoneChatApi.prototype, "revokeDevice").mockRejectedValue(new Error("offline"));
  useAuthStore.setState({ token: "memory-token", isAuthenticated: true });

  useAuthStore.getState().logout();
  await vi.waitFor(() => expect(offline).toHaveBeenCalledWith("device-a", { bearerToken: "memory-token" }));
  expect(tab.getItem("ascend.phone-chat.messages.v1")).toBeNull();
  expect(tab.getItem("ascend.phone-chat.device.v1")).toBeNull();
  expect(durable.getItem("ascend.phone-chat.pending-revocations.v1")).toBe('["device-a"]');
  expect(durable.getItem("ascend_session")).toBeNull();

  await retryPhoneChatRevocations(durable, vi.fn().mockResolvedValue(undefined));
  expect(pendingPhoneChatRevocations(durable)).toEqual([]);
});
