import { describe, expect, it } from "vitest";

import { getFloorPresentation } from "./floorPresentation";

describe("getFloorPresentation", () => {
  it("marks the selected available floor as the current ascent", () => {
    expect(getFloorPresentation("AVAILABLE", false, true)).toEqual({
      label: "Current floor",
      tone: "current",
    });
  });

  it("keeps cleared and locked masonry states distinct", () => {
    expect(getFloorPresentation("CLEARED", false, false).tone).toBe("cleared");
    expect(getFloorPresentation("LOCKED", true, false)).toEqual({
      label: "Sealed",
      tone: "locked",
    });
  });

  it("uses a boss crest label without changing an available floor state", () => {
    expect(getFloorPresentation("AVAILABLE", true, false)).toEqual({
      label: "Boss crest",
      tone: "available",
    });
  });
});
