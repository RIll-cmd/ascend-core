import { describe, it, expect } from "vitest";
import { BORDER_CODE_SNIPPETS } from "./retro-borders";

describe("8bitcn Retro Borders Extraction", () => {
  it("exports all authentic border code snippets", () => {
    expect(BORDER_CODE_SNIPPETS["retro-button"]).toBeDefined();
    expect(BORDER_CODE_SNIPPETS["stepped-box"]).toBeDefined();
    expect(BORDER_CODE_SNIPPETS["badge-tabs"]).toBeDefined();
    expect(BORDER_CODE_SNIPPETS["pill-input"]).toBeDefined();
    expect(BORDER_CODE_SNIPPETS["checkbox-square"]).toBeDefined();
  });

  it("contains authentic 8bitcn border-y-6 and -mx-1.5 in stepped-box", () => {
    const box = BORDER_CODE_SNIPPETS["stepped-box"];
    expect(box.tailwindClasses).toContain("border-y-6");
    expect(box.jsxSnippet).toContain("border-x-6 -mx-1.5");
  });

  it("contains authentic 8bitcn button corner pixel anchors in retro-button", () => {
    const btn = BORDER_CODE_SNIPPETS["retro-button"];
    expect(btn.jsxSnippet).toContain("size-1.5");
    expect(btn.jsxSnippet).toContain("h-1.5 w-1/2");
    expect(btn.jsxSnippet).toContain("h-[calc(100%-12px)]");
  });
});
