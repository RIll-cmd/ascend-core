import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/audio", () => ({
  playBuffSFX: vi.fn(),
  playUIMenuSFX: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { useBeastStore } from "./useBeastStore";

describe("beast egg transactions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits an egg purchase and refreshes the collection", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Mystery Egg acquired!" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ownedEggs: [], bestiary: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const purchased = await useBeastStore
      .getState()
      .buyEgg("character-1", "WOODLAND", "GOLD");

    expect(purchased).toBe(true);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/api\/beasts\/eggs\/buy$/),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          characterId: "character-1",
          eggType: "WOODLAND",
          currencyType: "GOLD",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/api\/beasts\/collection\/character-1$/),
    );
  });
});
