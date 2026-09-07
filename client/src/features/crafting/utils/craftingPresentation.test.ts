import { describe, expect, it } from "vitest";
import type { CraftingRecipe } from "../types/crafting";
import { filterCraftingRecipes, resolveSelectedRecipeId } from "./craftingPresentation";

const makeRecipe = (
  id: string,
  category: CraftingRecipe["category"],
  name: string,
  description: string,
): CraftingRecipe => ({
  id,
  title: `${name} Blueprint`,
  category,
  description,
  requiredLevel: 1,
  goldCost: 100,
  ingredients: [],
  output: {
    name,
    type: category === "ALCHEMY" ? "CONSUMABLE" : "WEAPON",
    rarity: "COMMON",
    icon: "",
    description,
    attack: 0,
    defense: 0,
    strength: 0,
    knowledge: 0,
    endurance: 0,
    recovery: 0,
    focus: 0,
    discipline: 0,
    sellValue: 0,
  },
  canCraft: true,
  missingRequirements: [],
});

const recipes = [
  makeRecipe("blade", "WEAPONS", "Royal Emberblade", "A molten-edged sword."),
  makeRecipe("rune", "ACCESSORIES", "Sunstone Rune", "A socketed lapidary rune."),
  makeRecipe("elixir", "ALCHEMY", "Smith's Elixir", "A restorative hearth draught."),
];

describe("filterCraftingRecipes", () => {
  it("maps each smithy tab to its existing recipe category", () => {
    expect(filterCraftingRecipes(recipes, "ACCESSORIES", "").map((recipe) => recipe.id)).toEqual([
      "rune",
    ]);
  });

  it("searches recipe titles, output names, and descriptions case-insensitively", () => {
    expect(filterCraftingRecipes(recipes, "WEAPONS", "MOLTEN").map((recipe) => recipe.id)).toEqual([
      "blade",
    ]);
    expect(filterCraftingRecipes(recipes, "ALCHEMY", "smith's").map((recipe) => recipe.id)).toEqual([
      "elixir",
    ]);
  });
});

describe("resolveSelectedRecipeId", () => {
  it("keeps a visible selection and otherwise selects the first visible blueprint", () => {
    expect(resolveSelectedRecipeId(recipes, "rune")).toBe("rune");
    expect(resolveSelectedRecipeId(recipes, "missing")).toBe("blade");
    expect(resolveSelectedRecipeId([], "blade")).toBeNull();
  });
});
