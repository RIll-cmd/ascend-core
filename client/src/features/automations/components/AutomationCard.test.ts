import { describe, expect, it } from "vitest";

import {
  formatAutomationCooldown,
  getActionLabel,
  getConditionValueLabel,
  getTriggerLabel,
} from "./AutomationCard";

describe("automation card presentation", () => {
  it("renders backend rule values as readable labels", () => {
    expect(getTriggerLabel("phone_usage_observed")).toBe(
      "Phone usage observed"
    );
    expect(getActionLabel("log_bad_habit")).toBe("Log bad habit");
    expect(
      getConditionValueLabel({
        field: "payload.confidence",
        operator: "greater_than",
        value: 0.8,
      })
    ).toBe("Confidence is greater than 0.8");
  });

  it("formats cooldowns without exposing raw seconds", () => {
    expect(formatAutomationCooldown(0)).toBe("No cooldown");
    expect(formatAutomationCooldown(1800)).toBe("30 minutes");
    expect(formatAutomationCooldown(7200)).toBe("2 hours");
  });
});
