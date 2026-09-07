"use client";

import React, { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Anvil,
  FlaskConical,
  Gem,
  Hammer,
  Search,
  RefreshCcw,
  Shield,
  Sword,
} from "lucide-react";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import smithy from "@/features/armory/styles/RoyalSmithy.module.css";
import { CraftSuccessModal } from "@/features/crafting/components/CraftSuccessModal";
import { ForgeWorkbench } from "@/features/crafting/components/ForgeWorkbench";
import { RecipeCard } from "@/features/crafting/components/RecipeCard";
import { CraftingHeader } from "@/features/crafting/components/CraftingHeader";
import { useCraftingStore } from "@/features/crafting/store/useCraftingStore";
import {
  filterCraftingRecipes,
  resolveSelectedRecipeId,
  type SmithyCategory,
} from "@/features/crafting/utils/craftingPresentation";
import { useInventoryStore } from "@/features/inventory/store/useInventoryStore";
import { useCharacterStore } from "@/store/useCharacterStore";

const CATEGORY_TABS: Array<{
  id: SmithyCategory;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "WEAPONS", label: "Heavy Armaments", icon: Sword },
  { id: "ARMOR", label: "Plate & Mail", icon: Shield },
  { id: "ACCESSORIES", label: "Lapidary", icon: Gem },
  { id: "ALCHEMY", label: "Alchemist's Hearth", icon: FlaskConical },
];

const EMBERS = [
  ["8%", "9s", "-2s"],
  ["15%", "12s", "-7s"],
  ["28%", "10s", "-4s"],
  ["38%", "14s", "-10s"],
  ["52%", "11s", "-6s"],
  ["64%", "13s", "-1s"],
  ["75%", "9s", "-5s"],
  ["86%", "15s", "-11s"],
  ["94%", "12s", "-8s"],
] as const;

export default function CraftingPage() {
  const { character } = useCharacterStore();
  const { items, fetchInventory } = useInventoryStore();
  const {
    recipes,
    isLoading,
    isCrafting,
    error: craftingError,
    fetchRecipes,
    craftRecipe,
    lastCraftedResult,
    clearLastCrafted,
  } = useCraftingStore();

  const [activeCategory, setActiveCategory] = useState<SmithyCategory>("WEAPONS");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [strikeSequence, setStrikeSequence] = useState(0);
  const smithyTitleRef = React.useRef<HTMLHeadingElement>(null);
  const craftTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const shouldRestoreCraftFocusRef = React.useRef(false);

  const charId = character?.id;

  useEffect(() => {
    if (charId) {
      void fetchRecipes(charId);
      void fetchInventory(charId);
    }
  }, [charId, fetchRecipes, fetchInventory]);

  useEffect(() => {
    if (lastCraftedResult || !shouldRestoreCraftFocusRef.current) return;

    shouldRestoreCraftFocusRef.current = false;
    const animationFrame = requestAnimationFrame(() => {
      const trigger = craftTriggerRef.current;
      if (trigger?.isConnected && !trigger.disabled) {
        trigger.focus();
      } else {
        smithyTitleRef.current?.focus();
      }
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [lastCraftedResult]);

  const filteredRecipes = useMemo(
    () => filterCraftingRecipes(recipes, activeCategory, searchQuery),
    [recipes, activeCategory, searchQuery],
  );

  const activeRecipeId = resolveSelectedRecipeId(filteredRecipes, selectedRecipeId);
  const activeRecipe = filteredRecipes.find((recipe) => recipe.id === activeRecipeId) ?? null;

  const craftableCount = useMemo(
    () => recipes.filter((recipe) => recipe.canCraft).length,
    [recipes],
  );
  const materialItemsCount = useMemo(
    () => items.filter((item) => item.itemDefinition.type === "MATERIAL").length,
    [items],
  );

  const handleCraft = async (recipeId: string, trigger: HTMLButtonElement) => {
    if (!charId) return;
    craftTriggerRef.current = trigger;
    setStrikeSequence((sequence) => sequence + 1);
    await craftRecipe(charId, recipeId);
  };

  const handleCloseCraftResult = () => {
    shouldRestoreCraftFocusRef.current = true;
    clearLastCrafted();
  };

  return (
    <div className={`${smithy.surface} ${smithy.craftingSurface}`}>
      <div className={smithy.emberField} aria-hidden="true">
        {EMBERS.map(([left, duration, delay]) => (
          <span
            key={left}
            className={smithy.ember}
            style={
              {
                left,
                "--ember-duration": duration,
                "--ember-delay": delay,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className={smithy.smokeField} aria-hidden="true">
        <span
          className={smithy.smoke}
          style={
            {
              "--smoke-left": "14%",
              "--smoke-duration": "13s",
              "--smoke-delay": "-4s",
            } as CSSProperties
          }
        />
        <span
          className={smithy.smoke}
          style={
            {
              "--smoke-left": "76%",
              "--smoke-duration": "16s",
              "--smoke-delay": "-11s",
            } as CSSProperties
          }
        />
      </div>

      <div className={smithy.content}>
        <CraftingHeader
          gold={character?.gold || 0}
          materialItemsCount={materialItemsCount}
          craftableCount={craftableCount}
          recipesCount={recipes.length}
          titleRef={smithyTitleRef}
        />

        <section className={`${smithy.ironPanel} ${smithy.rivets} ${smithy.categoryBar}`}>
          <div className={smithy.categoryTabs} role="group" aria-label="Smithy disciplines">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`${smithy.categoryTab} ${isActive ? smithy.activeTab : ""}`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <label className={smithy.searchWrap}>
            <span className="sr-only">Search smithy blueprints</span>
            <Search className={smithy.searchIcon} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search blueprints…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={smithy.searchInput}
            />
          </label>
        </section>

        {craftingError ? (
          <div className={smithy.errorPanel} role="alert">
            <div className={smithy.errorCopy}>
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              <div>
                <strong>The forge ledger reported a fault.</strong>
                <span>{craftingError}</span>
              </div>
            </div>
            <button
              type="button"
              className={smithy.secondaryButton}
              disabled={!charId}
              onClick={() => {
                if (!charId) return;
                void fetchRecipes(charId);
                void fetchInventory(charId);
              }}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Refresh ledgers
            </button>
          </div>
        ) : null}

        {!charId ? (
          <div className={`${smithy.ironPanel} ${smithy.statePanel}`}>
            <div className={smithy.stateInner}>
              <Anvil className="h-10 w-10" aria-hidden="true" />
              <h2 className={smithy.recipeTitle}>Awaiting the royal seal</h2>
              <p className={smithy.subtitle}>Select or load a character to open their smithy ledger.</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className={`${smithy.ironPanel} ${smithy.statePanel}`}>
            <div className={smithy.stateInner}>
              <span className={smithy.spinner} aria-hidden="true" />
              <span className={smithy.brassBadge}>Heating the royal forge</span>
            </div>
          </div>
        ) : filteredRecipes.length > 0 && activeRecipe ? (
          <div className={smithy.blueprintLayout}>
            <aside className={`${smithy.oakPanel} ${smithy.rivets} ${smithy.blueprintRail}`}>
              <h2 className={smithy.panelHeading}>
                Blueprint folio
                <span className={smithy.panelHint}>{filteredRecipes.length} patterns</span>
              </h2>
              <div className={smithy.blueprintList}>
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isSelected={activeRecipeId === recipe.id}
                    onSelect={setSelectedRecipeId}
                  />
                ))}
              </div>
            </aside>

            <ForgeWorkbench
              recipe={activeRecipe}
              isCrafting={isCrafting}
              playerGold={character?.gold || 0}
              strikeSequence={strikeSequence}
              onCraft={handleCraft}
            />
          </div>
        ) : (
          <div className={`${smithy.oakPanel} ${smithy.emptyWorkbench}`}>
            <div className={smithy.stateInner}>
              <Hammer className="h-10 w-10" aria-hidden="true" />
              <h2 className={smithy.recipeTitle}>No pattern on the bench</h2>
              <p className={smithy.subtitle}>
                Search another smithing discipline or clear the blueprint inscription.
              </p>
            </div>
          </div>
        )}
      </div>

      <CraftSuccessModal result={lastCraftedResult} onClose={handleCloseCraftResult} />
    </div>
  );
}
