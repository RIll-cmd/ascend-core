import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CompanionNotificationSettings, CompanionNotificationDetail } from "./CompanionNotificationSettings";

describe("CompanionNotificationSettings", () => {
  it("keeps delivery controls separate and explains generic lock-screen privacy", () => {
    const html = renderToStaticMarkup(<CompanionNotificationSettings deviceId={null} />);
    expect(html).toContain("aria-label=\"Companion notification preferences\"");
    expect(html).toContain("aria-pressed=\"false\"");
    expect(html).toContain("Enable this phone");
    expect(html).toContain("Enable Discord DMs");
    expect(html).toContain("Lock-screen alerts reveal no message content");
    expect(html).toContain("consent are separate and off by default");
  });

  it("does not render notification details without an opaque click-through ID", () => {
    expect(renderToStaticMarkup(<CompanionNotificationDetail deviceId={null} />)).toBe("");
  });
});
