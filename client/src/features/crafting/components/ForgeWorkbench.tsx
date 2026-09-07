"use client";

import React, { type CSSProperties } from "react";
import Image from "next/image";
import { CheckCircle2, Hammer, Lock, Sparkles, XCircle } from "lucide-react";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import smithy from "@/features/armory/styles/RoyalSmithy.module.css";
import { royalRarityColors } from "@/features/armory/styles/royalRarityColors";
import { getItemIconPath } from "@/utils/itemIcons";
import { getItemUsageDetails } from "@/utils/itemUsageUtils";
import type { CraftingRecipe } from "../types/crafting";

interface ForgeWorkbenchProps {
  recipe: CraftingRecipe;
  isCrafting: boolean;
  playerGold: number;
  strikeSequence: number;
  onCraft: (recipeId: string, trigger: HTMLButtonElement) => void;
}

const SPARK_CLASSES = [
  smithy.spark1,
  smithy.spark2,
  smithy.spark3,
  smithy.spark4,
  smithy.spark5,
  smithy.spark6,
  smithy.spark7,
  smithy.spark8,
];

export function ForgeWorkbench({
  recipe,
  isCrafting,
  playerGold,
  strikeSequence,
  onCraft,
}: ForgeWorkbenchProps) {
  const { output, ingredients, goldCost, requiredLevel, canCraft, missingRequirements } = recipe;
  const rarityTone =
    royalRarityColors[output.rarity] || royalRarityColors.COMMON;
  const usageDetails = getItemUsageDetails(output);
  const hasEnoughGold = playerGold >= goldCost;

  return (
    <section
      className={`${smithy.ironPanel} ${smithy.rivets} ${smithy.workbench}`}
      data-forge-workbench
      tabIndex={-1}
    >
      <div className={smithy.workbenchInner}>
        <h2 className={smithy.panelHeading}>
          Anvil workbench
          <span className={smithy.panelHint}>Selected royal pattern</span>
        </h2>

        <div className={smithy.workbenchGrid}>
          <div
            key={strikeSequence}
            className={`${smithy.anvilStage} ${strikeSequence > 0 ? smithy.striking : ""}`}
            aria-label={`${output.name} resting on the forge anvil`}
          >
            <div
              className={smithy.outputIconFrame}
              style={{
                "--rarity-color": rarityTone.border,
                "--rarity-text": rarityTone.text,
              } as CSSProperties}
            >
              <Image
                src={getItemIconPath(output.name, output.type)}
                alt={output.name}
                width={102}
                height={102}
                className={smithy.outputIcon}
              />
            </div>

            <div className={smithy.hammerArm} aria-hidden="true">
              <span className={smithy.hammerHead} />
              <span className={smithy.hammerHandle} />
            </div>

            {SPARK_CLASSES.map((sparkClass) => (
              <span key={sparkClass} className={`${smithy.spark} ${sparkClass}`} aria-hidden="true" />
            ))}

            <div className={smithy.anvil} aria-hidden="true">
              <span className={smithy.anvilTop} />
              <span className={smithy.anvilStem} />
              <span className={smithy.anvilBase} />
            </div>
          </div>

          <div className={smithy.workbenchDetails}>
            <div>
              <h3 className={smithy.recipeTitle}>{output.name}</h3>
              <div className={smithy.badgeRow}>
                <span className={smithy.smallBadge}>{output.rarity}</span>
                <span className={smithy.smallBadge}>{output.type}</span>
                <span className={smithy.smallBadge}>Level {requiredLevel}</span>
              </div>
            </div>

            <p className={smithy.recipeDescription}>
              {output.description || recipe.description}
            </p>

            {usageDetails.hasBonuses ? (
              <div className={smithy.statsGrid} aria-label="Forged attribute bonuses">
                {usageDetails.statBonuses.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className={smithy.statChip}>
                      <span className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                        {stat.shortLabel}
                      </span>
                      <strong>+{stat.value}</strong>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className={`${smithy.velvetPanel} ${smithy.materialBlock}`}>
              <h3 className={smithy.panelHeading}>
                Materials on the bench
                <span className={smithy.panelHint}>{ingredients.length} required</span>
              </h3>
              <div className={smithy.materialList}>
                {ingredients.map((ingredient) => (
                  <SystemTooltip
                    key={ingredient.name}
                    title={ingredient.name}
                    subtitle={`Smithing material • ${ingredient.quantity} required`}
                    category="Forge ingredient"
                    rarity={ingredient.isSatisfied ? "UNCOMMON" : "COMMON"}
                    description={`Required to shape ${output.name}.`}
                    mechanics={`${ingredient.ownedQuantity} held in the Oak Vault.`}
                    stats={[
                      { label: "Required", value: `${ingredient.quantity}×` },
                      { label: "In stock", value: `${ingredient.ownedQuantity}×` },
                    ]}
                    className="w-full"
                  >
                    <div
                      className={`${smithy.materialRow} ${
                        ingredient.isSatisfied ? smithy.materialReady : smithy.materialMissing
                      }`}
                    >
                      <span className={smithy.materialName}>
                        <Image
                          src={getItemIconPath(ingredient.name, "MATERIAL")}
                          alt=""
                          width={27}
                          height={27}
                          onError={(event) => {
                            event.currentTarget.src = "/icons/Icon280.png";
                          }}
                          className={smithy.materialIcon}
                        />
                        <span>{ingredient.name}</span>
                      </span>
                      <strong className="flex items-center gap-1.5">
                        {ingredient.ownedQuantity} / {ingredient.quantity}
                        {ingredient.isSatisfied ? (
                          <CheckCircle2 className="h-4 w-4" aria-label="Ready" />
                        ) : (
                          <XCircle className="h-4 w-4" aria-label="Missing" />
                        )}
                      </strong>
                    </div>
                  </SystemTooltip>
                ))}
              </div>
            </div>

            <div className={smithy.forgeFooter}>
              <div className={smithy.forgeFee}>
                <span>Royal forging fee</span>
                <strong className={hasEnoughGold ? "" : "text-red-300"}>
                  {goldCost.toLocaleString()}
                  <CurrencyIcon type="GOLD" size="xs" />
                </strong>
              </div>
              <button
                type="button"
                disabled={!canCraft || isCrafting}
                onClick={(event) => onCraft(recipe.id, event.currentTarget)}
                className={smithy.primaryButton}
                aria-live="polite"
              >
                {isCrafting ? (
                  <>
                    <span className={smithy.spinner} aria-hidden="true" />
                    Hammering the billet…
                  </>
                ) : canCraft ? (
                  <>
                    <Hammer className="h-4 w-4" />
                    Strike &amp; forge {output.type === "CONSUMABLE" ? "elixir" : "masterwork"}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Requirements incomplete
                  </>
                )}
              </button>
              {!canCraft && missingRequirements.length > 0 ? (
                <p className={smithy.missingReason}>{missingRequirements[0]}</p>
              ) : (
                <span className={smithy.panelHint}>
                  <Sparkles className="mr-1 inline h-3 w-3 text-amber-400" />
                  The hammer falls immediately; your existing forge transaction remains authoritative.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
