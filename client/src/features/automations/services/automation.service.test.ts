import { describe, expect, it } from "vitest";

import {
  buildAutomationPayload,
  cooldownToSeconds,
} from "./automation.service";

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
