import { describe, expect, it } from "vitest";
import { royalRarityColors } from "./royalRarityColors";

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe("royal rarity colors", () => {
  it("keeps metadata text readable on the velvet slot ground", () => {
    for (const tone of Object.values(royalRarityColors)) {
      expect(contrastRatio(tone.text, "#1e1b18")).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps the mythic border dark red without using it for tiny text", () => {
    expect(royalRarityColors.MYTHIC).toEqual({
      border: "#991b1b",
      text: "#fca5a5",
    });
  });
});
