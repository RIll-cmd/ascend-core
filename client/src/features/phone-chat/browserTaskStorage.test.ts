import { describe, expect, it } from "vitest";
import {
  clearBrowserTaskContent,
  pendingBrowserSessionEnds,
  removePendingBrowserSessionEnd,
} from "./browserTaskStorage";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("browser task local cleanup", () => {
  it("retains only the pending session-end ID after clearing task content", () => {
    const storage = new MemoryStorage();
    const sessionId = "65d41ed4-7a3c-4371-a019-38c1d4bd35c5";
    storage.setItem("ascend.browser-tasks.session.v1", sessionId);
    storage.setItem("ascend.browser-tasks.provider.v1", "gemini");
    storage.setItem("ascend.browser-tasks.active-task.v1", "task-id");

    clearBrowserTaskContent(storage, sessionId);

    expect(pendingBrowserSessionEnds(storage)).toEqual([sessionId]);
    expect(storage.getItem("ascend.browser-tasks.session.v1")).toBeNull();
    expect(storage.getItem("ascend.browser-tasks.provider.v1")).toBeNull();
    expect(storage.getItem("ascend.browser-tasks.active-task.v1")).toBeNull();
    expect(storage.getItem("ascend.browser-tasks.session-end.v1")).toBe(
      JSON.stringify([sessionId])
    );
  });

  it("removes a pending ID only after Core confirms session end", () => {
    const storage = new MemoryStorage();
    const sessionId = "65d41ed4-7a3c-4371-a019-38c1d4bd35c5";
    clearBrowserTaskContent(storage, sessionId);
    removePendingBrowserSessionEnd(storage, sessionId);
    expect(pendingBrowserSessionEnds(storage)).toEqual([]);
  });
});
