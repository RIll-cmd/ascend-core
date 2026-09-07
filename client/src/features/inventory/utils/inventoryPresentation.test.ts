import { describe, expect, it } from "vitest";
import type { ItemDefinition, PlayerItem } from "../types/inventory";
import { filterInventoryItems, getInventoryLoad } from "./inventoryPresentation";

const makeItem = (
  id: string,
  name: string,
  type: ItemDefinition["type"],
  quantity: number,
  isEquipped = false,
): PlayerItem => ({
  id,
  characterId: "character-1",
  itemDefinitionId: `definition-${id}`,
  quantity,
  isEquipped,
  isLocked: false,
  isFavorite: false,
  acquiredFrom: null,
  itemDefinition: {
    id: `definition-${id}`,
    name,
    description: null,
    type,
    rarity: "COMMON",
    icon: "",
    sellValue: 0,
    attack: 0,
    defense: 0,
    strength: 0,
    knowledge: 0,
    discipline: 0,
    focus: 0,
    endurance: 0,
    recovery: 0,
    passive: null,
  },
});

const inventory = [
  makeItem("sword", "Kingsguard Blade", "WEAPON", 1, true),
  makeItem("potion", "Ember Tonic", "CONSUMABLE", 4),
  makeItem("ore", "Blackiron Ore", "MATERIAL", 12),
];

describe("filterInventoryItems", () => {
  it("keeps equipment out of consumable and material filters", () => {
    expect(filterInventoryItems(inventory, "Equipment", "").map((item) => item.id)).toEqual([
      "sword",
    ]);
    expect(filterInventoryItems(inventory, "Consumables", "").map((item) => item.id)).toEqual([
      "potion",
    ]);
    expect(filterInventoryItems(inventory, "Materials", "").map((item) => item.id)).toEqual([
      "ore",
    ]);
  });

  it("searches names without changing the selected category", () => {
    expect(filterInventoryItems(inventory, "Materials", "IRON").map((item) => item.id)).toEqual([
      "ore",
    ]);
    expect(filterInventoryItems(inventory, "Equipment", "iron")).toEqual([]);
  });
});

describe("getInventoryLoad", () => {
  it("reports occupied slots and stack units without inventing item weight", () => {
    expect(getInventoryLoad(inventory, 500)).toEqual({
      occupiedSlots: 3,
      stackUnits: 17,
      equipmentCount: 1,
      capacity: 500,
      fillPercentage: 0.6,
    });
  });
});
