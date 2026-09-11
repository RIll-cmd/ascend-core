"use client";

import React, { useMemo } from "react";

/* =========================================================================
   CELESTIAL FLOATING RUNES ENGINE
   Mythic Elder Futhark runes representing the 5 astral alignments:
   - Flame (ᚠ Fehu, ᚲ Kenaz, ᛋ Sowilo) - Warm Amber & Solar Gold
   - Tempest (ᛏ Tiwaz, ᚦ Thurisaz, ᚱ Raidho) - Astral Cyan & Electric Azure
   - Earth (ᛖ Ehwaz, ᚢ Uruz, ᛃ Jera) - Bedrock Ochre & Golden Topaz
   - Tide (ᛗ Mannaz, ᛚ Laguz, ᛜ Ingwaz) - Abyssal Aquamarine & Ocean Blue
   - Ascension (ᛟ Othala, ᛞ Dagaz, ᚨ Ansuz) - Sovereign Amethyst & Royal Violet

   Motion Architecture:
   - Zero-layout-thrashing GPU-composited CSS transforms (translate3d, rotate)
   - Organic sinusoidal sway & buoyant upward drift
   - Multi-depth layering (distant ambient runes vs illuminated focal glyphs)
   - Pure pointer-events-none pass-through (100% accessible to UI)
   ========================================================================= */

interface RuneDefinition {
  glyph: string;
  name: string;
  element: "Flame" | "Tempest" | "Earth" | "Tide" | "Ascension";
  color: string;
  glowColor: string;
  size: number;
  left: number; // percentage (0-100)
  driftDuration: number; // seconds
  driftDelay: number; // seconds
  swayDuration: number; // seconds
  swayDelay: number; // seconds
  pulseDuration: number; // seconds
  baseOpacity: number;
  rotation: number;
}

const RUNE_POOL: Array<{
  glyph: string;
  name: string;
  element: "Flame" | "Tempest" | "Earth" | "Tide" | "Ascension";
  color: string;
  glowColor: string;
}> = [
  // Flame
  { glyph: "ᚠ", name: "Fehu", element: "Flame", color: "#fbbf24", glowColor: "rgba(251, 191, 36, 0.75)" },
  { glyph: "ᚲ", name: "Kenaz", element: "Flame", color: "#f59e0b", glowColor: "rgba(245, 158, 11, 0.75)" },
  { glyph: "ᛋ", name: "Sowilo", element: "Flame", color: "#fef08a", glowColor: "rgba(254, 240, 138, 0.85)" },
  // Tempest
  { glyph: "ᛏ", name: "Tiwaz", element: "Tempest", color: "#38bdf8", glowColor: "rgba(56, 189, 248, 0.8)" },
  { glyph: "ᚦ", name: "Thurisaz", element: "Tempest", color: "#06b6d4", glowColor: "rgba(6, 182, 212, 0.75)" },
  { glyph: "ᚱ", name: "Raidho", element: "Tempest", color: "#7dd3fc", glowColor: "rgba(125, 211, 252, 0.8)" },
  // Earth
  { glyph: "ᛖ", name: "Ehwaz", element: "Earth", color: "#eab308", glowColor: "rgba(234, 179, 8, 0.75)" },
  { glyph: "ᚢ", name: "Uruz", element: "Earth", color: "#d97706", glowColor: "rgba(217, 119, 6, 0.75)" },
  { glyph: "ᛃ", name: "Jera", element: "Earth", color: "#facc15", glowColor: "rgba(250, 204, 21, 0.75)" },
  // Tide
  { glyph: "ᛗ", name: "Mannaz", element: "Tide", color: "#60a5fa", glowColor: "rgba(96, 165, 250, 0.8)" },
  { glyph: "ᛚ", name: "Laguz", element: "Tide", color: "#38bdf8", glowColor: "rgba(56, 189, 248, 0.75)" },
  { glyph: "ᛜ", name: "Ingwaz", element: "Tide", color: "#818cf8", glowColor: "rgba(129, 140, 248, 0.8)" },
  // Ascension
  { glyph: "ᛟ", name: "Othala", element: "Ascension", color: "#c084fc", glowColor: "rgba(192, 132, 252, 0.85)" },
  { glyph: "ᛞ", name: "Dagaz", element: "Ascension", color: "#e879f9", glowColor: "rgba(232, 121, 249, 0.8)" },
  { glyph: "ᚨ", name: "Ansuz", element: "Ascension", color: "#f472b6", glowColor: "rgba(244, 114, 182, 0.8)" },
];

export function FloatingRunes() {
  // Generate deterministic, organic distribution across screen
  const runes = useMemo<RuneDefinition[]>(() => {
    const list: RuneDefinition[] = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      const template = RUNE_POOL[i % RUNE_POOL.length];
      // Distribute evenly horizontally across viewport with slight jitter
      const baseLeft = (i / count) * 96 + 2;
      const jitter = ((i * 17) % 7) - 3;
      const left = Math.max(2, Math.min(96, baseLeft + jitter));
      
      // Tier: small distant (40%), medium midground (40%), focal bright (20%)
      const tierRandom = (i * 13) % 10;
      let size = 16;
      let baseOpacity = 0.45;
      if (tierRandom < 4) {
        size = 12 + ((i * 3) % 3); // 12-14px
        baseOpacity = 0.22 + ((i * 5) % 10) * 0.015; // 0.22 - 0.35
      } else if (tierRandom < 8) {
        size = 18 + ((i * 5) % 5); // 18-22px
        baseOpacity = 0.45 + ((i * 7) % 15) * 0.015; // 0.45 - 0.65
      } else {
        size = 24 + ((i * 3) % 4); // 24-27px
        baseOpacity = 0.65 + ((i * 4) % 15) * 0.015; // 0.65 - 0.85
      }

      list.push({
        glyph: template.glyph,
        name: template.name,
        element: template.element,
        color: template.color,
        glowColor: template.glowColor,
        size,
        left,
        driftDuration: 20 + ((i * 11) % 16), // 20s - 36s drift
        driftDelay: -(((i * 7) % 25) + 1), // staggered negative delay so all appear immediately
        swayDuration: 4.5 + ((i * 5) % 4), // 4.5s - 8.5s sway
        swayDelay: -(((i * 3) % 5) + 0.5),
        pulseDuration: 3 + ((i * 7) % 3), // 3s - 6s pulse
        baseOpacity,
        rotation: ((i * 29) % 24) - 12, // subtle tilt between -12deg and +12deg
      });
    }

    return list;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10 select-none overflow-hidden"
    >
      <style>{`
        @keyframes rune-buoyant-drift {
          0% {
            transform: translate3d(0, 105vh, 0);
          }
          100% {
            transform: translate3d(0, -15vh, 0);
          }
        }

        @keyframes rune-sinusoidal-sway {
          0%, 100% {
            transform: translate3d(-14px, 0, 0) rotate(-6deg);
          }
          50% {
            transform: translate3d(14px, 0, 0) rotate(6deg);
          }
        }

        @keyframes rune-celestial-pulse {
          0%, 100% {
            opacity: var(--base-opacity);
            filter: drop-shadow(0 0 4px var(--rune-glow));
          }
          50% {
            opacity: calc(var(--base-opacity) * 1.4);
            filter: drop-shadow(0 0 10px var(--rune-glow)) drop-shadow(0 0 18px var(--rune-glow));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rune-drift-container,
          .rune-sway-container {
            animation: none !important;
          }
        }
      `}</style>

      {runes.map((rune, idx) => (
        <div
          key={`rune-${idx}`}
          className="rune-drift-container absolute will-change-transform"
          style={{
            left: `${rune.left}%`,
            top: 0,
            animation: `rune-buoyant-drift ${rune.driftDuration}s linear infinite`,
            animationDelay: `${rune.driftDelay}s`,
          }}
        >
          {/* Sway child container for compound smooth 2D motion */}
          <div
            className="rune-sway-container will-change-transform"
            style={{
              animation: `rune-sinusoidal-sway ${rune.swayDuration}s ease-in-out infinite`,
              animationDelay: `${rune.swayDelay}s`,
            }}
          >
            {/* Pulsing rune glyph */}
            <span
              className="inline-block font-mono select-none tracking-widest"
              style={
                {
                  "--base-opacity": rune.baseOpacity,
                  "--rune-glow": rune.glowColor,
                  fontSize: `${rune.size}px`,
                  color: rune.color,
                  animation: `rune-celestial-pulse ${rune.pulseDuration}s ease-in-out infinite`,
                  transform: `rotate(${rune.rotation}deg)`,
                  textShadow: `0 0 6px ${rune.glowColor}, 0 0 14px ${rune.glowColor}`,
                } as React.CSSProperties
              }
            >
              {rune.glyph}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FloatingRunes;
