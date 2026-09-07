"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { PixelAdventurerPackIcon } from "@/components/ui/pixel/PixelIcons";
import { playUIMenuSFX } from "@/utils/audio";

export interface InventoryBadgeButtonProps {
  /** Optional click callback */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Visual variant for the adventurer's pack icon */
  iconVariant?: "pixel-art" | "silhouette";
  /** Badge dimensional scale */
  size?: "sm" | "md" | "lg";
  /** Whether the button should render an interactive SystemTooltip on hover */
  tooltip?: boolean;
  /** Custom tooltip title (defaults to "The Oak Vault") */
  tooltipTitle?: string;
  /** Custom tooltip subtitle */
  tooltipSubtitle?: string;
  /** Custom tooltip description */
  tooltipDescription?: string;
  /** Optional capacity counter to display inside the tooltip (e.g., { occupied: 12, total: 500 }) */
  capacity?: {
    occupied: number;
    total: number;
  };
  /** Additional container / button CSS classes */
  className?: string;
  /** Additional icon CSS classes */
  iconClassName?: string;
  /** Accessible label */
  ariaLabel?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Whether to play tactile UI audio on click / hover */
  enableAudio?: boolean;
  /** Optional child elements rendered beside or inside the badge */
  children?: React.ReactNode;
}

const SIZE_VARIANTS = {
  sm: {
    container: "w-9 h-9 rounded-lg border-2",
    icon: "w-5 h-5",
  },
  md: {
    container: "w-11 h-11 rounded-[10px] border-[2.5px]",
    icon: "w-6 h-6",
  },
  lg: {
    container: "w-[52px] h-[52px] rounded-[10px] border-3",
    icon: "w-7 h-7",
  },
};

/**
 * InventoryBadgeButton
 *
 * Authentic 16-bit retro RPG inventory badge button.
 * Features an adventurer's haversack / gear rucksack with brass buckles,
 * encased within a tactile amber-bronze beveled plaque with gold inset highlights.
 */
export function InventoryBadgeButton({
  onClick,
  iconVariant = "pixel-art",
  size = "lg",
  tooltip = true,
  tooltipTitle = "The Oak Vault",
  tooltipSubtitle = "Adventurer's Rucksack & Armory",
  tooltipDescription = "Heavy-duty waxed leather haversack fitted with brass cinch buckles and an oiled wool bedroll. Holds equipped armaments, field supplies, and gathered materials.",
  capacity,
  className,
  iconClassName,
  ariaLabel = "Open Inventory and Equipment Vault",
  disabled = false,
  enableAudio = true,
  children,
}: InventoryBadgeButtonProps) {
  const sizeConfig = SIZE_VARIANTS[size] || SIZE_VARIANTS.lg;
  const isInteractive = Boolean(onClick);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (enableAudio) {
      playUIMenuSFX("equip", 0.4);
    }
    onClick?.(e);
  };

  const handleMouseEnter = () => {
    if (!disabled && enableAudio && isInteractive) {
      playUIMenuSFX("hover", 0.15);
    }
  };

  const badgeContent = (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        // Base Layout & Sizing
        "relative inline-grid place-items-center shrink-0 select-none overflow-hidden",
        sizeConfig.container,
        // Thematic Bevel Framing (Dark Wood/Leather Outer Border)
        "border-[#7c2d12] text-[#1a0d05]",
        // Warm Amber / Bronze Gradient
        "bg-gradient-to-br from-[#f59e0b] via-[#d97706] to-[#b45309]",
        // Inset 1.5px Gold Highlight & Tactile Drop Shadow
        "shadow-[0_5px_14px_rgba(0,0,0,0.5),inset_0_0_0_2px_#ffd58a,inset_0_1px_2px_rgba(255,255,255,0.4)]",
        // Interactive States
        isInteractive
          ? "cursor-pointer transition-all duration-150 ease-out hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(245,158,11,0.45),inset_0_0_0_2px_#ffe29a] active:translate-y-0.5 active:brightness-95 active:shadow-[0_2px_6px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(0,0,0,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd58a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1917]"
          : "cursor-default",
        disabled && "opacity-60 cursor-not-allowed filter grayscale-[0.4]",
        className
      )}
    >
      {/* Adventurer's Haversack Icon */}
      <PixelAdventurerPackIcon
        variant={iconVariant}
        className={cn(
          sizeConfig.icon,
          "drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]",
          iconClassName
        )}
      />

      {children}
    </button>
  );

  if (!tooltip) {
    return badgeContent;
  }

  const tooltipStats = capacity
    ? [
        {
          label: "Capacity",
          value: `${capacity.occupied} / ${capacity.total}`,
          color: "text-amber-300",
        },
      ]
    : undefined;

  return (
    <SystemTooltip
      title={tooltipTitle}
      subtitle={tooltipSubtitle}
      category="Inventory & Armory"
      rarity="EPIC"
      description={tooltipDescription}
      mechanics="Access stored equipment, field rations, and socketed relics. Items inside preserve weight-to-power encumbrance."
      stats={tooltipStats}
      tags={["Vault", "Armory", "Rucksack"]}
      side="bottom"
    >
      {badgeContent}
    </SystemTooltip>
  );
}

export { PixelAdventurerPackIcon };
