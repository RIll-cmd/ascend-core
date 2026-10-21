// @vitest-environment happy-dom
import { act, type FormEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBrowserTasks } from "./useBrowserTasks";

const mocks = vi.hoisted(() => ({
  auth: { isAuthenticated: true },
  api: Object.fromEntries(["getBrowserAvailability", "createBrowserSession", "enqueueBrowserTask",
    "getBrowserTask", "endBrowserSession", "consumeBrowserReviewAccess", "decideBrowserReview"].map((key) => [key, vi.fn()])),
}));
vi.mock("@/store/useAuthStore", () => ({ useAuthStore: Object.assign(
  (select: (state: typeof mocks.auth) => unknown) => select(mocks.auth), { getState: () => mocks.auth }) }));
vi.mock("./api", () => ({ PhoneChatApi: class { constructor() { return mocks.api; } },
  PhoneChatApiError: class extends Error { status = 0; } }));

const sessionId = "10000000-0000-4000-8000-000000000001";
const sharedTaskId = "20000000-0000-4000-8000-000000000001";
const sessionKey = "ascend.browser-tasks.session.v1";
const taskKey = "ascend.browser-tasks.active-task.v1";
const providerKey = "ascend.browser-tasks.provider.v1";
const availability = { laptopId: "laptop-1", provider: "gemini", available: true, reason: "online",
  lastHeartbeatAt: null, scopes: [{ scopeId: "public_research", version: 1, actions: [] },
    { scopeId: "form", version: 3, origin: "https://example.org", actions: ["fill"] }] };
const sharedTask = { taskId: sharedTaskId, status: "running", channel: "discord_dm", scopeId: "form",
  events: [], cursor: 0, result: null, terminalReason: null,
  createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 180000).toISOString() };

describe("useBrowserTasks authority", () => {
  let root: Root;
  let container: HTMLDivElement;
  let model: ReturnType<typeof useBrowserTasks>;
  function Probe({ reviewOnly = false, parentSessionId = "phone-session" }: { reviewOnly?: boolean; parentSessionId?: string }) {
    model = useBrowserTasks("device-1", parentSessionId, reviewOnly);
    return null;
  }
  async function render(reviewOnly = false, parentSessionId = "phone-session") {
    await act(async () => { root.render(<Probe reviewOnly={reviewOnly} parentSessionId={parentSessionId} />); });
  }
  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.resetAllMocks();
    mocks.auth.isAuthenticated = true;
    sessionStorage.clear();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    mocks.api.getBrowserAvailability.mockResolvedValue(availability);
    mocks.api.createBrowserSession.mockResolvedValue({ browserSessionId: sessionId });
    mocks.api.enqueueBrowserTask.mockResolvedValue({ status: "queued" });
    mocks.api.getBrowserTask.mockResolvedValue(sharedTask);
    mocks.api.consumeBrowserReviewAccess.mockResolvedValue({ taskId: sharedTaskId, expiresAt: sharedTask.expiresAt });
    mocks.api.endBrowserSession.mockResolvedValue(undefined);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => { root.unmount(); });
    container.remove();
    vi.unstubAllGlobals();
  });
  async function consent(goal = "Fill the reviewed field") {
    await act(async () => { model.setGoal(goal); model.setProviderConsent(true); });
  }
  const event = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;

  it("requires explicit handoff opening and leaves the source phone browser session untouched", async () => {
    sessionStorage.setItem(sessionKey, "30000000-0000-4000-8000-000000000001");
    sessionStorage.setItem(taskKey, "40000000-0000-4000-8000-000000000001");
    sessionStorage.setItem(providerKey, "gemini");
    await render(true);
    expect(mocks.api.consumeBrowserReviewAccess).not.toHaveBeenCalled();
    expect(model.browserSessionId).toBeNull();
    await consent();
    const token = "x".repeat(43);
    await act(async () => { await model.openSharedTask(token); });
    expect(mocks.api.consumeBrowserReviewAccess).toHaveBeenCalledWith("device-1", sessionId, token);
    expect(model.task?.taskId).toBe(sharedTaskId);
    expect(sessionStorage.getItem(sessionKey)).toBe("30000000-0000-4000-8000-000000000001");
    expect(sessionStorage.getItem(taskKey)).toBe("40000000-0000-4000-8000-000000000001");
    expect(sessionStorage.getItem(token)).toBeNull();
    expect(mocks.api.enqueueBrowserTask).not.toHaveBeenCalled();
  });

  it("does not enqueue or restore content when session creation resolves after logout", async () => {
    let resolve!: (value: { browserSessionId: string }) => void;
    mocks.api.createBrowserSession.mockImplementation(() => new Promise((done) => { resolve = done; }));
    await render();
    await consent();
    let pending!: Promise<void>;
    await act(async () => { pending = model.start(event); });
    mocks.auth.isAuthenticated = false;
    await render();
    await act(async () => { resolve({ browserSessionId: sessionId }); await pending; });
    expect(mocks.api.enqueueBrowserTask).not.toHaveBeenCalled();
    expect(model.task).toBeNull();
    expect(model.browserSessionId).toBeNull();
    expect(sessionStorage.getItem(sessionKey)).toBeNull();
    expect(sessionStorage.getItem(taskKey)).toBeNull();
    expect(model.goal).toBe("");
    expect(model.providerConsent).toBe(false);
    expect(model.busy).toBe(false);
  });

  it("uses only the selected locally offered scope and version", async () => {
    await render();
    await consent();
    await act(async () => { model.setSelectedScope("form"); });
    await act(async () => { await model.start(event); });
    expect(mocks.api.enqueueBrowserTask).toHaveBeenCalledWith(expect.objectContaining({
      scopeId: "form", scopeVersion: 3, laptopId: "laptop-1", browserSessionId: sessionId,
    }), "device-1");
  });

  it("clears the previous browser view when new chat has ended its source session", async () => {
    await render();
    await consent();
    await act(async () => { await model.start(event); });
    expect(model.task).not.toBeNull();
    sessionStorage.removeItem(sessionKey);
    sessionStorage.removeItem(taskKey);
    sessionStorage.removeItem(providerKey);
    await render(false, "new-phone-session");
    expect(model.task).toBeNull();
    expect(model.browserSessionId).toBeNull();
    expect(model.providerConsent).toBe(false);
  });

  it("does not restore a shared task when handoff consumption resolves after logout", async () => {
    let resolve!: (value: { taskId: string; expiresAt: string }) => void;
    mocks.api.consumeBrowserReviewAccess.mockImplementation(() => new Promise((done) => { resolve = done; }));
    await render(true);
    await consent();
    let pending!: Promise<void>;
    await act(async () => { pending = model.openSharedTask("x".repeat(43)); });
    mocks.auth.isAuthenticated = false;
    await render(true);
    await act(async () => { resolve({ taskId: sharedTaskId, expiresAt: sharedTask.expiresAt }); await pending; });
    expect(model.task).toBeNull();
    expect(mocks.api.getBrowserTask).not.toHaveBeenCalled();
    expect(model.browserSessionId).toBeNull();
  });
});
