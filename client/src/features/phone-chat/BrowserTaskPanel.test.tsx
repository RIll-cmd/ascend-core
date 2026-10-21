import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BrowserTaskPanel } from "./BrowserTaskPanel";
import type { BrowserTaskView } from "./types";
import type { useBrowserTasks } from "./useBrowserTasks";

const task: BrowserTaskView = {
  taskId: "task-1", status: "completed", channel: "phone_pwa", scopeId: "public_research",
  createdAt: "2026-09-28T00:00:00Z", expiresAt: "2026-09-29T00:00:00Z",
  result: { status: "completed", findings: [{ text: "Use the official installation guide.", sources: ["https://docs.example/install", "javascript:alert(1)"] }] },
  terminalReason: null, cursor: 2,
  events: [{ sequence: 1, eventType: "running", summary: "Opened the official docs.", createdAt: "2026-09-28T00:00:01Z" }],
};

function model(overrides: Partial<ReturnType<typeof useBrowserTasks>> = {}) {
  return {
    deviceId: "device-1", availability: {
      available: true, reason: "online" as const, laptopId: "laptop-1", lastHeartbeatAt: null,
      provider: "gemini", scopes: [{ scopeId: "public_research", version: 1, actions: [] }],
    }, task, browserSessionId: "session-1", consentedProvider: "gemini", goal: "", setGoal: vi.fn(),
    selectedProvider: "gemini", setSelectedProvider: vi.fn(), providerConsent: false, setProviderConsent: vi.fn(),
    busy: false, error: null, setError: vi.fn(), start: vi.fn(), control: vi.fn(), dismiss: vi.fn(),
    endSession: vi.fn(), refreshTask: vi.fn(), ...overrides,
  } as unknown as ReturnType<typeof useBrowserTasks>;
}

describe("BrowserTaskPanel", () => {
  it("does not present a stale waiting subtype as the status of a running task", () => {
    const html = renderToStaticMarkup(<BrowserTaskPanel tasks={model({ task: {
      ...task, status: "running", waitingForUserType: "action_review", result: null,
    } })} />);
    expect(html).toContain("Running on your laptop");
    expect(html).not.toContain("Waiting for your action review");
  });
  it("shows the complete current action values, target origin and execution laptop before approval", () => {
    const value = "Draft " + "x".repeat(1800) + " final line";
    const reviewTask = {
      ...task, status: "waiting_for_user" as const, result: null,
      expiresAt: new Date(Date.now() + 180000).toISOString(),
      waitingForUserType: "action_review" as const,
      review: { laptopId: "laptop-1", brokerBootId: "boot-1", fence: 2, proposal: {
        task_id: task.taskId, action_id: "action-1", owner: "owner-1", observation_id: "obs-1",
        document_revision: 2, origin: "https://example.org", action: "fill" as const,
        target_ref: "field-1", target_label: "Message", arguments: { value },
        expected_effect: "Edit the message.", expires_at: Date.now() / 1000 + 90,
        digest: "a".repeat(64),
      } },
    };
    const html = renderToStaticMarkup(<BrowserTaskPanel tasks={model({ task: reviewTask })} />);
    expect(html).toContain(value);
    expect(html).toContain("https://example.org");
    expect(html).toContain("laptop-1");
    expect(html).toContain("Message");
    expect(html).toContain("may autosave");
    expect(html).toContain("Approve this action");
  });

  it("does not offer approval for expired proposals or laptop takeover", () => {
    const html = renderToStaticMarkup(<BrowserTaskPanel tasks={model({ task: {
      ...task, status: "waiting_for_user", result: null, waitingForUserType: "local_takeover",
    } as BrowserTaskView })} />);
    expect(html).toContain("Continue on your laptop");
    expect(html).not.toContain("Approve this action");
  });
  it("shows verified findings and only renders HTTP(S) sources", () => {
    const html = renderToStaticMarkup(<BrowserTaskPanel tasks={model()} />);
    expect(html).toContain("Laptop online");
    expect(html).toContain("Research finished");
    expect(html).toContain("Use the official installation guide.");
    expect(html).toContain("https://docs.example/install");
    expect(html).not.toContain("javascript:alert(1)");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Dismiss and clear this task from Core");
  });

  it("distinguishes stopping and unknown instead of claiming success", () => {
    const stopping = renderToStaticMarkup(<BrowserTaskPanel tasks={model({ task: { ...task, status: "stopping", result: null } })} />);
    expect(stopping).toContain("Stop requested · waiting for laptop confirmation");
    const unknown = renderToStaticMarkup(<BrowserTaskPanel tasks={model({ task: { ...task, status: "unknown", result: null } })} />);
    expect(unknown).toContain("Outcome unknown · check the laptop before retrying");
    expect(unknown).toContain("Check the laptop before you start a replacement task.");
  });

  it("lets the owner queue honestly when the laptop is offline", () => {
    const html = renderToStaticMarkup(<BrowserTaskPanel tasks={model({
      availability: { available: false, reason: "offline", laptopId: "laptop-1", lastHeartbeatAt: null,
        provider: null, scopes: [{ scopeId: "public_research", version: 1, actions: [] }] },
      task: null,
    })} />);
    expect(html).toContain("Laptop offline");
    expect(html).toContain("no browser work starts until the laptop reconnects");
    expect(html).toContain("Queue research");
  });
});
