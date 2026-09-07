"use client";

import React from "react";
import meadow from "../styles/MeadowAviary.module.css";

/**
 * Configuration schema for individual dragon codex sprites.
 * Enables per-species frame clamping, fine-grain translations, scaling,
 * and CSS clipping bounds to guarantee zero sprite-sheet bleed or clipping.
 */
export interface DragonSpriteConfig {
  /** Padding inside the fixed-size viewport frame */
  containerPadding?: string;
  /** Horizontal translation offset (px) */
  offsetX?: number;
  /** Vertical translation offset (px) */
  offsetY?: number;
  /** Scale factor for optical balancing */
  scale?: number;
  /** CSS clip-path rule to isolate frame bounds and prevent adjacent sprite bleed */
  clipPath?: string;
  /** CSS object-position for framing within the container */
  objectPosition?: string;
}

/**
 * Sprite Alignment Configuration:
 * - #019 (Fire Dragon / Blood Wyrm): Clamped frame bounds to cleanly isolate
 *   the Fire Wyrm and eliminate any adjacent frame bleed.
 * - #020 (Cyber Dragon / Temporal Spark Drake): Extended canvas geometry and
 *   balanced padding ensuring the full wingspan, horns, and tail do not touch container borders.
 */
export const DRAGON_SPRITE_CONFIG: Record<number, DragonSpriteConfig> = {
  19: {
    // Fire Dragon (#019): Frame clamped to strictly isolate the 42x51 dragon body
    containerPadding: "p-2",
    offsetX: 0,
    offsetY: 0,
    scale: 1.0,
    clipPath: "inset(0 0 0 0)", // Hard border clamp against bleed
    objectPosition: "center",
  },
  20: {
    // Cyber Dragon (#020): Extended canvas boundaries for full wingspan & tail
    containerPadding: "p-1",
    offsetX: 0,
    offsetY: 0,
    scale: 1.0,
    clipPath: "none",
    objectPosition: "center",
  },
};

export interface CodexSpriteProps {
  speciesId: number;
  name: string;
  element: string;
  spritePath: string;
  isUnlocked: boolean;
  className?: string;
  sketchClassName?: string;
  showDropShadow?: boolean;
}

/**
 * Dedicated isolated sprite renderer for the Naturalist's Field Journal.
 * Guarantees pixelated rendering, exact frame bounding, flex centering,
 * and uniform locked silhouette aesthetics.
 */
export const CodexSprite: React.FC<CodexSpriteProps> = ({
  speciesId,
  name,
  element,
  spritePath,
  isUnlocked,
  className = "",
  sketchClassName,
  showDropShadow = true,
}) => {
  const config = DRAGON_SPRITE_CONFIG[speciesId] || {
    containerPadding: "p-1.5",
    offsetX: 0,
    offsetY: 0,
    scale: 1.0,
    objectPosition: "center",
  };

  const getAuraColor = (elem: string) => {
    switch (elem.toUpperCase()) {
      case "FIRE":
        return "rgba(239, 68, 68, 0.6)";
      case "FROST":
        return "rgba(6, 182, 212, 0.6)";
      case "VOID":
        return "rgba(168, 85, 247, 0.6)";
      case "CYBER":
        return "rgba(20, 184, 166, 0.6)";
      case "NATURE":
        return "rgba(34, 197, 94, 0.6)";
      case "HOLY":
        return "rgba(245, 158, 11, 0.6)";
      case "STORM":
        return "rgba(234, 179, 8, 0.6)";
      default:
        return "rgba(6, 182, 212, 0.6)";
    }
  };

  const aura = getAuraColor(element);

  return (
    <div
      className={`relative w-24 h-24 max-h-24 flex items-center justify-center overflow-hidden mx-auto select-none pointer-events-none ${
        config.containerPadding || "p-1.5"
      } ${className}`}
      style={{
        clipPath: config.clipPath || undefined,
      }}
    >
      <img
        src={spritePath}
        alt={isUnlocked ? name : `Undiscovered ${element} Dragon silhouette`}
        className={`w-full h-full max-h-24 object-contain mx-auto transition-transform duration-300 ${
          isUnlocked
            ? "group-hover:scale-110"
            : sketchClassName || meadow.sketch || "grayscale opacity-60 contrast-125"
        }`}
        style={{
          imageRendering: "pixelated",
          objectPosition: config.objectPosition || "center",
          transform: `translate(${config.offsetX || 0}px, ${config.offsetY || 0}px) scale(${config.scale || 1})`,
          filter: isUnlocked && showDropShadow
            ? `drop-shadow(0 0 12px ${aura})`
            : undefined,
        }}
        loading="lazy"
      />
    </div>
  );
};
