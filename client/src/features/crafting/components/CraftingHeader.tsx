"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { playUIMenuSFX } from "@/utils/audio";
import smithy from "@/features/armory/styles/RoyalSmithy.module.css";

/* =====================================================================
   AUTHENTIC RPG BLACKSMITHING VECTOR ICONS (DEAD-CENTER 24x24 VIEWBOX)
   ===================================================================== */

/**
 * 1. Blacksmith's Heavy Forging Hammer
 * Symmetrically weighted forging sledge with chamfered steel striking face,
 * cross-peen wedge, reinforced collar, and centered ash handle.
 */
export function BlacksmithHammerIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Heavy Rectangular Sledge Head */}
      <rect x="5" y="4" width="14" height="6" rx="1.5" fill="currentColor" fillOpacity="0.22" />
      {/* Hardened Steel Striking Face (Right) */}
      <path d="M19 5v4" strokeWidth="2.5" />
      {/* Tapered Cross-Peen Wedge (Left) */}
      <path d="M5 6v2" strokeWidth="2.5" />
      {/* Central Handle Eyelet & Collar */}
      <rect x="10.5" y="3" width="3" height="8" rx="0.5" fill="currentColor" fillOpacity="0.4" />
      {/* Heavy Ash Handle */}
      <path d="M12 10v10" strokeWidth="2.75" />
      {/* Pommel Cap & Leather Wrap Notches */}
      <path d="M10.5 20h3" strokeWidth="2.5" />
      <path d="M11 13h2" strokeWidth="1.5" strokeOpacity="0.8" />
      <path d="M11 16h2" strokeWidth="1.5" strokeOpacity="0.8" />
    </svg>
  );
}

/**
 * 2. Royal Gold Sovereign Coin Stack
 * Centered relief coins with milled edge, star hallmark, and depth rim.
 */
export function GoldVaultCoinsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Base Depth Coin Rim (Shadow Tier) */}
      <ellipse cx="12" cy="14.5" rx="7.5" ry="4" fill="currentColor" fillOpacity="0.18" />
      {/* Upper Sovereign Coin Body */}
      <ellipse cx="12" cy="9.5" rx="7.5" ry="4" fill="currentColor" fillOpacity="0.28" />
      {/* Coin Stack Side Struts */}
      <path d="M4.5 9.5v5c0 2.2 3.36 4 7.5 4s7.5-1.8 7.5-4v-5" />
      {/* Embossed Center Hallmark Sigil */}
      <circle cx="12" cy="9.5" r="1.75" fill="currentColor" />
    </svg>
  );
}

/**
 * 3. Fantasy Materials Ore / Ingot Crate
 * Heavy timber cargo chest with reinforced iron corner brackets and cross strapping.
 */
export function MaterialsCrateIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Outer Crate Box Perimeter (16x16, perfectly centered at 12,12) */}
      <rect x="4" y="4" width="16" height="16" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      {/* Corner Reinforcement Brackets */}
      <path d="M4 8h4V4" />
      <path d="M20 8h-4V4" />
      <path d="M4 16h4v4" />
      <path d="M20 16h-4v4" />
      {/* Cross Diagonal Iron Straps */}
      <path d="M8 8l8 8" strokeWidth="1.5" />
      <path d="M16 8l-8 8" strokeWidth="1.5" />
      {/* Center Lock / Rivet Plate */}
      <rect x="10" y="10" width="4" height="4" rx="0.5" fill="currentColor" />
    </svg>
  );
}

/**
 * 4. Masterwork Blacksmith Anvil
 * Symmetrically aligned forge anvil with horn, working plateau, waist, and flared feet.
 */
export function BlacksmithAnvilIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Anvil Horn (Left), Working Face (Center/Right), and Hardy Step */}
      <path
        d="M3.5 10c2.5 0 3.8-1 4.5-2h11c.8 0 1.5.7 1.5 1.5s-.5 1.5-1.5 1.5c-1 0-1.8.8-2 1.8-.4 1.7-1.5 2.2-3 2.2h-4c-1.5 0-2.6-.5-3-2.2-.2-1-1-1.8-2-1.8H3.5z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      {/* Hardy / Pritchel Hole Detail */}
      <circle cx="16.5" cy="9.25" r="0.75" fill="currentColor" />
      {/* Heavy Flared Stepped Base */}
      <path d="M8.5 15.5l-2.5 4.5h12l-2.5-4.5" fill="currentColor" fillOpacity="0.25" />
      {/* Ground Plinth Lip */}
      <path d="M5 20h14" strokeWidth="2.5" />
    </svg>
  );
}

/* =====================================================================
   HEADER PROPS & COMPONENT
   ===================================================================== */

export interface CraftingHeaderProps {
  gold?: number;
  materialItemsCount?: number;
  craftableCount?: number;
  recipesCount?: number;
  titleRef?: React.RefObject<HTMLHeadingElement | null>;
  className?: string;
  onCrestClick?: () => void;
  onGoldClick?: () => void;
  onMaterialsClick?: () => void;
  onForgeReadyClick?: () => void;
}

export function CraftingHeader({
  gold = 0,
  materialItemsCount = 0,
  craftableCount = 0,
  recipesCount = 0,
  titleRef,
  className,
  onCrestClick,
  onGoldClick,
  onMaterialsClick,
  onForgeReadyClick,
}: CraftingHeaderProps) {
  const handleStatHover = () => {
    playUIMenuSFX("hover", 0.12);
  };

  const handleCrestClick = () => {
    playUIMenuSFX("confirm", 0.35);
    onCrestClick?.();
  };

  return (
    <header
      className={cn(
        smithy.oakPanel,
        smithy.rivets,
        smithy.forgeHeader,
        "p-4 sm:p-5 mb-4 shadow-[0_12px_28px_rgba(0,0,0,0.55)] select-none",
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5">
        {/* Left: Smithy Title & Centered Amber Crest Badge */}
        <div className="flex items-center gap-3.5 min-w-0">
          <SystemTooltip
            title="The Royal Smithy"
            subtitle="Masterwork Forging Sanctum"
            category="Blacksmithing"
            rarity="EPIC"
            description="Royal armorer's hearth equipped with an enchanted dwarven anvil. Transmute rare metal ingots and boss essences into high-tier armaments."
            mechanics="Click to inspect forging guidelines or re-focus blueprint ledger."
            tags={["Smithy", "Forge", "Armory"]}
            side="bottom"
          >
            <button
              type="button"
              onClick={handleCrestClick}
              aria-label="The Royal Smithy Crest. Click to focus forge patterns."
              className={cn(
                // Strict Flexbox Centering (Equal 12x12 / 13x13 sizing)
                "inline-flex items-center justify-center shrink-0",
                "w-12 h-12 sm:w-13 sm:h-13",
                // Standardized Amber Bevel Framing
                "rounded-md border-2 border-amber-900/60 bg-amber-600/90 text-amber-950",
                // Subtle Inset Highlight & Shadow
                "ring-1 ring-amber-300/40 inset",
                "shadow-[0_4px_12px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(255,255,255,0.35)]",
                // Micro-Interactions
                "cursor-pointer transition-all duration-150 ease-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0.5 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              )}
            >
              <BlacksmithHammerIcon className="w-6 h-6 sm:w-7 sm:h-7 text-amber-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.25)]" />
            </button>
          </SystemTooltip>

          <div className="min-w-0">
            <h1
              ref={titleRef}
              tabIndex={-1}
              className="font-pixel text-xl sm:text-2xl lg:text-3xl font-bold text-[#fff1cf] tracking-tight leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] focus:outline-none"
            >
              The Royal Smithy
            </h1>
            <p className="mt-1 text-xs text-[#dfcea7] line-clamp-1">
              Choose a royal pattern, lay out the catalysts, and bring the hammer down.
            </p>
          </div>
        </div>

        {/* Right: 3 Standardized Stat Badges with Pixel Alignment */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 shrink-0"
          aria-label="Smithy resources and status"
        >
          {/* Stat 1: Gold Vault */}
          <SystemTooltip
            title="Gold Vault"
            subtitle="Available Royal Coinage"
            category="Smithy Treasury"
            description="Gold reserve required to stoke furnace embers and cover royal forging fees."
            stats={[{ label: "Reserve", value: `${gold.toLocaleString()} Gold`, color: "text-amber-300" }]}
            tags={["Currency", "Forging Fee"]}
            side="bottom"
          >
            <div
              onClick={onGoldClick}
              onMouseEnter={handleStatHover}
              className={cn(
                "group flex items-center gap-3 min-h-[3.65rem] px-3 sm:px-3.5 py-2 sm:py-2.5",
                "rounded-lg border-2 border-[#171412] bg-[#201b17]",
                "shadow-[inset_0_0_0_1px_#4b3c2e,0_3px_8px_rgba(0,0,0,0.35)]",
                "transition-colors hover:border-[#3d2e20] cursor-help"
              )}
            >
              {/* Badge Icon Container - Strict 9x9 / 10x10 Flexbox Centering */}
              <div
                className={cn(
                  "inline-flex items-center justify-center shrink-0",
                  "w-9 h-9 sm:w-10 sm:h-10",
                  "rounded-md border-2 border-amber-900/60 bg-amber-600/90 text-amber-950",
                  "ring-1 ring-amber-300/40 inset",
                  "shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]",
                  "transition-transform duration-150 group-hover:scale-105"
                )}
              >
                <GoldVaultCoinsIcon className="w-5 h-5 text-amber-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#d9c9a2]/80 leading-none">
                  Gold vault
                </span>
                <strong className="mt-1 font-pixel text-xs sm:text-sm font-bold text-[#fff0c7] flex items-center gap-1.5 leading-snug">
                  {gold.toLocaleString()}
                  <CurrencyIcon type="GOLD" size="xs" />
                </strong>
              </div>
            </div>
          </SystemTooltip>

          {/* Stat 2: Materials In Stock */}
          <SystemTooltip
            title="Materials Stock"
            subtitle="Raw Ores, Catalysts & Essences"
            category="Inventory Cargo"
            description="Crafting components and monster fragments currently stowed in your Oak Vault rucksack."
            stats={[{ label: "Components", value: `${materialItemsCount} items`, color: "text-amber-300" }]}
            tags={["Materials", "Catalysts"]}
            side="bottom"
          >
            <div
              onClick={onMaterialsClick}
              onMouseEnter={handleStatHover}
              className={cn(
                "group flex items-center gap-3 min-h-[3.65rem] px-3 sm:px-3.5 py-2 sm:py-2.5",
                "rounded-lg border-2 border-[#171412] bg-[#201b17]",
                "shadow-[inset_0_0_0_1px_#4b3c2e,0_3px_8px_rgba(0,0,0,0.35)]",
                "transition-colors hover:border-[#3d2e20] cursor-help"
              )}
            >
              {/* Badge Icon Container - Strict 9x9 / 10x10 Flexbox Centering */}
              <div
                className={cn(
                  "inline-flex items-center justify-center shrink-0",
                  "w-9 h-9 sm:w-10 sm:h-10",
                  "rounded-md border-2 border-amber-900/60 bg-amber-600/90 text-amber-950",
                  "ring-1 ring-amber-300/40 inset",
                  "shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]",
                  "transition-transform duration-150 group-hover:scale-105"
                )}
              >
                <MaterialsCrateIcon className="w-5 h-5 text-amber-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#d9c9a2]/80 leading-none">
                  Materials
                </span>
                <strong className="mt-1 font-pixel text-xs sm:text-sm font-bold text-[#fff0c7] block leading-snug">
                  {materialItemsCount} in stock
                </strong>
              </div>
            </div>
          </SystemTooltip>

          {/* Stat 3: Forge-Ready Blueprints */}
          <SystemTooltip
            title="Forge-Ready Blueprints"
            subtitle="Actionable Crafting Patterns"
            category="Anvil Workbench"
            description="Patterns for which you possess both sufficient catalyst materials and the required guild crafting level."
            stats={[
              {
                label: "Ready",
                value: `${craftableCount} / ${recipesCount}`,
                color: craftableCount > 0 ? "text-emerald-400" : "text-amber-300",
              },
            ]}
            tags={["Craftable", "Blueprints"]}
            side="bottom"
          >
            <div
              onClick={onForgeReadyClick}
              onMouseEnter={handleStatHover}
              className={cn(
                "group flex items-center gap-3 min-h-[3.65rem] px-3 sm:px-3.5 py-2 sm:py-2.5",
                "rounded-lg border-2 border-[#171412] bg-[#201b17]",
                "shadow-[inset_0_0_0_1px_#4b3c2e,0_3px_8px_rgba(0,0,0,0.35)]",
                "transition-colors hover:border-[#3d2e20] cursor-help"
              )}
            >
              {/* Badge Icon Container - Strict 9x9 / 10x10 Flexbox Centering */}
              <div
                className={cn(
                  "inline-flex items-center justify-center shrink-0",
                  "w-9 h-9 sm:w-10 sm:h-10",
                  "rounded-md border-2 border-amber-900/60 bg-amber-600/90 text-amber-950",
                  "ring-1 ring-amber-300/40 inset",
                  "shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)]",
                  "transition-transform duration-150 group-hover:scale-105"
                )}
              >
                <BlacksmithAnvilIcon className="w-5 h-5 text-amber-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#d9c9a2]/80 leading-none">
                  Forge-ready
                </span>
                <strong
                  className={cn(
                    "mt-1 font-pixel text-xs sm:text-sm font-bold block leading-snug",
                    craftableCount > 0 ? "text-[#86efac]" : "text-[#fff0c7]"
                  )}
                >
                  {craftableCount} / {recipesCount}
                </strong>
              </div>
            </div>
          </SystemTooltip>
        </div>
      </div>
    </header>
  );
}
