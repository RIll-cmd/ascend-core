"use client";

import React, { type CSSProperties } from "react";
import Image from "next/image";
import { CheckCircle2, Lock, ScrollText } from "lucide-react";
import { SystemTooltip, type SystemTooltipProps } from "@/components/ui/SystemTooltip";
import smithy from "@/features/armory/styles/RoyalSmithy.module.css";
import { royalRarityColors } from "@/features/armory/styles/royalRarityColors";
import { getItemIconPath } from "@/utils/itemIcons";
import { getItemUsageDetails } from "@/utils/itemUsageUtils";
import type { CraftingRecipe } from "../types/crafting";

interface RecipeCardProps {
  recipe: CraftingRecipe;
  isSelected: boolean;
  onSelect: (recipeId: string) => void;
}

export function RecipeCard({ recipe, isSelected, onSelect }: RecipeCardProps) {
  const { output, ingredients, requiredLevel, canCraft } = recipe;
  const rarityTone =
    royalRarityColors[output.rarity] || royalRarityColors.COMMON;
  const usageDetails = getItemUsageDetails(output);
  const satisfiedIngredients = ingredients.filter((ingredient) => ingredient.isSatisfied).length;

  return (
    <SystemTooltip
      title={output.name}
      subtitle={`${output.rarity} ${output.type} • Required Level ${requiredLevel}`}
      category="Royal forge blueprint"
      rarity={output.rarity as SystemTooltipProps["rarity"]}
      description={
        output.description ||
        recipe.description ||
        "A royal smithing pattern recorded by the quartermaster."
      }
      mechanics={
        usageDetails.hasBonuses
          ? `Forged attributes: ${usageDetails.statBonuses
              .map((stat) => `${stat.label} +${stat.value}`)
              .join(" • ")}`
          : "Select this blueprint to inspect its materials and forging fee."
      }
      stats={[
        { label: "Required level", value: requiredLevel },
        { label: "Materials ready", value: `${satisfiedIngredients}/${ingredients.length}` },
      ]}
      tags={["Blueprint", output.type, output.rarity]}
      className="w-full"
    >
      <button
        type="button"
        aria-pressed={isSelected}
        aria-label={`Inspect recipe for ${output.name}`}
        onClick={() => onSelect(recipe.id)}
        className={`${smithy.recipeCard} ${isSelected ? smithy.selectedRecipe : ""}`}
        style={{
          "--rarity-color": rarityTone.border,
          "--rarity-text": rarityTone.text,
        } as CSSProperties}
      >
        <span className={smithy.recipeThumb}>
          <Image
            src={getItemIconPath(output.name, output.type)}
            alt=""
            width={41}
            height={41}
            className={smithy.recipeIcon}
          />
        </span>

        <span className="min-w-0">
          <span className={smithy.recipeName}>{output.name}</span>
          <span className={smithy.recipeMeta}>
            <span>{output.rarity}</span>
            <span>Lv. {requiredLevel}</span>
            <span>{satisfiedIngredients}/{ingredients.length} materials</span>
          </span>
        </span>

        <span
          className={`${smithy.availability} ${canCraft ? smithy.availabilityReady : ""}`}
          aria-label={canCraft ? "Ready to forge" : "Requirements incomplete"}
        >
          {canCraft ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </button>
    </SystemTooltip>
  );
}
