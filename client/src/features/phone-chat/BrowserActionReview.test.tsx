// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrowserActionReview, validBrowserReview } from "./BrowserActionReview";
import type { BrowserTaskView } from "./types";

function reviewTask(): BrowserTaskView {
  return { taskId: "task-1", status: "waiting_for_user", channel: "phone_pwa", scopeId: "form",
    createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 180000).toISOString(),
    result: null, terminalReason: null, cursor: 0, events: [], waitingForUserType: "action_review",
    review: { laptopId: "laptop-1", brokerBootId: "boot-1", fence: 1, proposal: {
      task_id: "task-1", action_id: "action-1", owner: "owner-1", observation_id: "obs-1",
      document_revision: 1, origin: "https://example.org", action: "fill", target_ref: "field-1",
      target_label: "Message", arguments: { value: "Exact text" }, expected_effect: "Edit the message",
      expires_at: Date.now() / 1000 + 90, digest: "a".repeat(64),
    } } };
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe("BrowserActionReview", () => {
  it.each(["owner", "observation_id", "action_id", "target_ref", "digest"] as const)("fails closed for a non-string %s", (field) => {
    const task = reviewTask();
    Object.assign(task.review!.proposal, { [field]: [] });
    expect(validBrowserReview(task)).toBeNull();
  });
  it("does not allow approval after review expiration, even before the timer repaints", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.useFakeTimers();
    const task = reviewTask();
    const decision = vi.fn().mockResolvedValue(undefined);
    const container = document.createElement("div");
    const root = createRoot(container);
    try {
      await act(async () => { root.render(<BrowserActionReview task={task} busy={false} onDecision={decision} />); });
      const approve = [...container.querySelectorAll("button")].find((button) => button.textContent === "Approve this action")!;
      expect(approve).toBeDefined();
      vi.setSystemTime(Date.now() + 91000);
      await act(async () => { approve.click(); });
      expect(decision).not.toHaveBeenCalled();
      await act(async () => { vi.advanceTimersByTime(1000); });
      expect(container.textContent).toContain("expired or changed");
      expect(container.querySelector("button")).toBeNull();
    } finally { await act(async () => { root.unmount(); }); }
  });
  it("returns the exact current proposal and distinct approve/reject decisions", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const task = reviewTask();
    const decision = vi.fn().mockResolvedValue(undefined);
    const container = document.createElement("div");
    const root = createRoot(container);
    try {
      await act(async () => { root.render(<BrowserActionReview task={task} busy={false} onDecision={decision} />); });
      await act(async () => { [...container.querySelectorAll("button")].find((b) => b.textContent === "Approve this action")!.click(); });
      expect(decision).toHaveBeenLastCalledWith(task.review, true);
      await act(async () => { [...container.querySelectorAll("button")].find((b) => b.textContent === "Reject action")!.click(); });
      expect(decision).toHaveBeenLastCalledWith(task.review, false);
    } finally { await act(async () => { root.unmount(); }); }
  });
});
