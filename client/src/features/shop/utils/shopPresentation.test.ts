import { describe, expect, it } from "vitest";
import type { ShopItem } from "../types/shop";
import {
  executeSequentialPurchase,
  getMaxPurchasableQuantity,
  getShopCategory,
} from "./shopPresentation";

const makeItem = (overrides: Partial<ShopItem> = {}): ShopItem => ({
  id: "stock-1",
  itemId: "item-1",
  currencyType: "GOLD",
  price: 100,
  stock: 5,
  requiredLevel: null,
  requiredPower: null,
  name: "Test Ware",
  description: "A test fixture.",
  type: "MATERIAL",
  rarity: "COMMON",
  icon: "/icons/Icon1.png",
  canAfford: true,
  meetsRequirements: true,
  inStock: true,
  ...overrides,
});

describe("getShopCategory", () => {
  it("routes token-priced wares to special stock before checking item type", () => {
    expect(
      getShopCategory(
        makeItem({ type: "CONSUMABLE", currencyType: "TOWER_TOKENS" }),
      ),
    ).toBe("black-market");
  });

  it.each(["WEAPON", "ARMOR", "SHIELD", "RING", "ACCESSORY"])(
    "routes %s wares to arms and armor",
    (type) => {
      expect(getShopCategory(makeItem({ type }))).toBe("arms");
    },
  );

  it("routes consumables to provisions and unmatched wares to curios", () => {
    expect(getShopCategory(makeItem({ type: "CONSUMABLE" }))).toBe(
      "provisions",
    );
    expect(getShopCategory(makeItem({ type: "SKILL_BOOK" }))).toBe(
      "curios",
    );
  });
});

describe("getMaxPurchasableQuantity", () => {
  it("caps a purchase by both wallet balance and available stock", () => {
    expect(getMaxPurchasableQuantity(makeItem({ price: 75, stock: 8 }), 250)).toBe(
      3,
    );
    expect(getMaxPurchasableQuantity(makeItem({ price: 10, stock: 2 }), 250)).toBe(
      2,
    );
  });

  it("limits equipment purchases to one even if the feed reports extra stock", () => {
    expect(
      getMaxPurchasableQuantity(
        makeItem({ type: "WEAPON", price: 10, stock: 4 }),
        250,
      ),
    ).toBe(1);
  });

  it("returns zero for unavailable, unaffordable, or invalidly priced wares", () => {
    expect(getMaxPurchasableQuantity(makeItem({ inStock: false }), 500)).toBe(0);
    expect(getMaxPurchasableQuantity(makeItem({ price: 600 }), 500)).toBe(0);
    expect(getMaxPurchasableQuantity(makeItem({ price: 0 }), 500)).toBe(0);
  });

  it("caps unlimited non-equipment stock at a safe selector maximum", () => {
    expect(
      getMaxPurchasableQuantity(makeItem({ stock: null, price: 1 }), 500),
    ).toBe(99);
  });
});

describe("executeSequentialPurchase", () => {
  it.each([NaN, Infinity, -1, 0, 1.5, 100])("rejects invalid quantity %s without an API call", async (quantity) => {
    let calls = 0;
    const result = await executeSequentialPurchase(quantity, async () => { calls += 1; return "ok"; });
    expect(calls).toBe(0);
    expect(result.purchased).toBe(0);
    expect(result.error).toBeTruthy();
  });
  it("purchases every requested unit in sequence", async () => {
    let activeRequests = 0;
    let peakRequests = 0;

    const result = await executeSequentialPurchase(3, async () => {
      activeRequests += 1;
      peakRequests = Math.max(peakRequests, activeRequests);
      await Promise.resolve();
      activeRequests -= 1;
      return "Purchase successful";
    });

    expect(result).toEqual({
      purchased: 3,
      lastMessage: "Purchase successful",
      error: null,
    });
    expect(peakRequests).toBe(1);
  });

  it("stops at the first rejected unit and reports partial completion", async () => {
    let attempts = 0;

    const result = await executeSequentialPurchase(4, async () => {
      attempts += 1;
      if (attempts === 3) throw new Error("Merchant stock changed");
      return "Purchase successful";
    });

    expect(result).toEqual({
      purchased: 2,
      lastMessage: "Purchase successful",
      error: "Merchant stock changed",
    });
    expect(attempts).toBe(3);
  });
});
