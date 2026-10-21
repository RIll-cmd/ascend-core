import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CompanionContextCard } from "./CompanionContextCard";

describe("CompanionContextCard", () => {
  it("starts in an honest unavailable state and never fabricates current laptop facts", () => {
    const html = renderToStaticMarkup(<CompanionContextCard deviceId={null} />);

    expect(html).toContain('aria-label="Shared laptop context"');
    expect(html).toContain("Unavailable / stale");
    expect(html).toContain("Unknown / expired");
    expect(html).toContain("No laptop update has been received");
  });
});
