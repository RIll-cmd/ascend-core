import type { CraftingRecipe } from "../types/crafting";

export type SmithyCategory = CraftingRecipe["category"];

export function filterCraftingRecipes(
  recipes: CraftingRecipe[],
  category: SmithyCategory,
  searchQuery: string,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return recipes.filter((recipe) => {
    if (recipe.category !== category) return false;
    if (normalizedQuery.length === 0) return true;

    return [recipe.title, recipe.output.name, recipe.description].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    );
  });
}

export function resolveSelectedRecipeId(
  recipes: CraftingRecipe[],
  selectedRecipeId: string | null,
) {
  if (selectedRecipeId && recipes.some((recipe) => recipe.id === selectedRecipeId)) {
    return selectedRecipeId;
  }

  return recipes[0]?.id ?? null;
}
