import { describe, expect, it } from "vitest";

import { createTestObservation } from "./AutomationTestDialog";

describe("automation dry-run observation", () => {
  it("creates a harmless observation for the chosen trigger", () => {
    expect(createTestObservation("drowsiness_observed")).toMatchObject({
      source: "phone_cv",
      type: "drowsiness_observed",
      payload: { state: "started" },
    });
  });
});
