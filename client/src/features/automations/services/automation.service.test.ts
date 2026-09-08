import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildAutomationPayload,
  cooldownToSeconds,
  getVisionStatus,
} from "./automation.service";

afterEach(() => vi.unstubAllGlobals());

describe("automation payload mapping", () => {
  it("converts a 30-minute bad-habit rule into the Phase 4A schema", () => {
    expect(cooldownToSeconds(30, "minutes")).toBe(1800);
    expect(
      buildAutomationPayload({
        characterId: "character-1",
        name: "Phone distraction",
        enabled: true,
        triggerType: "phone_usage_observed",
        condition: {
          field: "payload.state",
          operator: "equals",
          value: "started",
        },
        habitId: "habit-1",
        cooldownAmount: 30,
        cooldownUnit: "minutes",
      })
    ).toEqual({
      characterId: "character-1",
      name: "Phone distraction",
      enabled: true,
      triggerType: "phone_usage_observed",
      conditions: [
        { field: "payload.state", operator: "equals", value: "started" },
      ],
      actions: [{ type: "log_bad_habit", habitId: "habit-1" }],
      cooldownSeconds: 1800,
    });
  });

  it("preserves advanced match mode and typed conditions", () => {
    expect(
      buildAutomationPayload({
        characterId: "character-1",
        name: "Night checks",
        enabled: true,
        triggerType: "phone_usage_observed",
        matchMode: "all",
        condition: {
          field: "payload.state",
          operator: "equals",
          value: "started",
        },
        conditions: [{ type: "time_window", start: "22:00", end: "06:00" }],
        habitId: "habit-1",
        cooldownAmount: 30,
        cooldownUnit: "minutes",
      }).matchMode
    ).toBe("all");
  });
});

describe("Vision connection status", () => {
  it("reads the owned character's safe status without sending a token in the URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: "CONNECTED",
        characterId: "character-1",
        deviceId: "ascend-vision",
        source: "ascend_vision",
        version: "1.0.0",
        lastSeenAt: "2026-09-08T09:00:00+00:00",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getVisionStatus("character-1")).resolves.toMatchObject({
      status: "CONNECTED",
      deviceId: "ascend-vision",
    });
    expect(fetchMock.mock.calls[0][0]).toContain(
      "/api/integration/vision/status?characterId=character-1"
    );
    expect(fetchMock.mock.calls[0][0]).not.toContain("Bearer");
  });
});
