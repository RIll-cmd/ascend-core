import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { AscendRouteSkeleton, routeLoadingPresets } from "./AscendRouteSkeleton";

describe("routeLoadingPresets", () => {
  it("gives the dashboard destinations their requested layouts", () => {
    expect(Object.keys(routeLoadingPresets)).toHaveLength(32);
    expect(routeLoadingPresets["/dashboard"]).toBe("command-hud");
    expect(routeLoadingPresets["/missions"]).toBe("quest-list");
    expect(routeLoadingPresets["/tower"]).toBe("tower-floors");
    expect(routeLoadingPresets["/bosses"]).toBe("raid-board");
    expect(routeLoadingPresets["/inventory"]).toBe("equipment-grid");
    expect(routeLoadingPresets["/aira"]).toBe("command-console");
    expect(routeLoadingPresets["/settings"]).toBe("preferences");
  });

  it("announces loading while hiding decorative skeleton geometry", () => {
    const markup = renderToStaticMarkup(
      createElement(AscendRouteSkeleton, { preset: "tower-floors", label: "Loading tower floors" }),
    );
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("Loading tower floors");
    expect(markup).toContain('aria-hidden="true"');
  });
});
