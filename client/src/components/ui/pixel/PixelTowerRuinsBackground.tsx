"use client";

import React, { useEffect, useState } from "react";

/* =========================================================================
   16-BIT ENCHANTED TOWER RUINS BACKGROUND COMPONENT
   Inspired by & faithful to the retro pixel-art watchtower illustration:
   - Ancient stone tower with ivy, moss & overgrown battlements
   - Flickering amber hearth firelight in arched windows & portal lanterns
   - Luminous full moon aura in the twilight canopy sky
   - Flowing mountain stream water glints beneath the mossy bridge
   - Floating forest fireflies drifting across the wildflower meadow
   - Twinkling stardust field in the upper-left sky
   - WCAG AAA contrast vignette for UI readability
   ========================================================================= */

/* 4-Point Pixel Cross Sparkle Star */
function PixelStar({
  x,
  y,
  size = 1,
  delay = 0,
  color = "#FFFFFF",
}: {
  x: number;
  y: number;
  size?: number;
  delay?: number;
  color?: string;
}) {
  return (
    <div
      className="absolute select-none pointer-events-none animate-pixel-star z-10"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        transform: `translate(-50%, -50%) scale(${size})`,
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        style={{ imageRendering: "pixelated" }}
      >
        <rect x="6" y="6" width="3" height="3" fill={color} />
        <rect x="6" y="3" width="3" height="3" fill={color} fillOpacity="0.9" />
        <rect x="6" y="9" width="3" height="3" fill={color} fillOpacity="0.9" />
        <rect x="3" y="6" width="3" height="3" fill={color} fillOpacity="0.9" />
        <rect x="9" y="6" width="3" height="3" fill={color} fillOpacity="0.9" />
        <rect x="7" y="0" width="1" height="3" fill={color} fillOpacity="0.8" />
        <rect x="7" y="12" width="1" height="3" fill={color} fillOpacity="0.8" />
        <rect x="0" y="7" width="3" height="1" fill={color} fillOpacity="0.8" />
        <rect x="12" y="7" width="3" height="1" fill={color} fillOpacity="0.8" />
      </svg>
    </div>
  );
}

export function PixelTowerRuinsBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      suppressHydrationWarning
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden bg-[#0a141c]"
    >
      {/* =========================================================
          1. MASTER PIXEL ARTWORK LAYER
          1024x571 pixel art rendered with nearest-neighbor crispness
          and anchored to bottom-center for perfect 16:9 framing.
          ========================================================= */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-bottom select-none pointer-events-none"
        style={{
          backgroundImage: "url('/backgrounds/tower_ancient_ruins.jpg')",
          imageRendering: "pixelated",
          filter: "contrast(1.05) brightness(0.98)",
        }}
      />

      {/* =========================================================
          2. LIVING HEARTH & WINDOW LANTERN FLICKERING OVERLAYS
          Warm golden/amber candlelight pulsing dynamically from the
          portal window, flanking lanterns, mid chamber & belfry.
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Ground Portal Main Arched Window Glow */}
          <div
            className="absolute w-14 h-20 bg-gradient-radial from-amber-300/45 via-amber-500/20 to-transparent rounded-full blur-md animate-lantern-flicker-1 mix-blend-screen"
            style={{
              left: "55.0%",
              top: "56.9%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Left Portal Lantern Flare */}
          <div
            className="absolute w-6 h-6 bg-gradient-radial from-yellow-300/60 via-amber-500/25 to-transparent rounded-full blur-[2px] animate-lantern-flicker-2 mix-blend-screen"
            style={{
              left: "51.8%",
              top: "73.5%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Right Portal Lantern Flare */}
          <div
            className="absolute w-6 h-6 bg-gradient-radial from-yellow-300/60 via-amber-500/25 to-transparent rounded-full blur-[2px] animate-lantern-flicker-3 mix-blend-screen"
            style={{
              left: "58.4%",
              top: "73.5%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Mid-Tower Arched Chamber Window */}
          <div
            className="absolute w-10 h-16 bg-gradient-radial from-amber-300/40 via-amber-500/15 to-transparent rounded-full blur-sm animate-lantern-flicker-2 mix-blend-screen"
            style={{
              left: "54.7%",
              top: "18.4%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Upper Belfry Chamber Window */}
          <div
            className="absolute w-8 h-12 bg-gradient-radial from-amber-200/45 via-yellow-500/15 to-transparent rounded-full blur-sm animate-lantern-flicker-1 mix-blend-screen"
            style={{
              left: "46.1%",
              top: "19.3%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Right Stone Ruin Window Hearth */}
          <div
            className="absolute w-12 h-16 bg-gradient-radial from-amber-300/45 via-amber-600/15 to-transparent rounded-full blur-md animate-lantern-flicker-3 mix-blend-screen"
            style={{
              left: "75.2%",
              top: "68.3%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}

      {/* =========================================================
          3. MYSTIC FULL MOON LUMINESCENCE
          Pale gold & soft cyan lunar aura around the moon in the
          upper-right sky behind the tower spire.
          ========================================================= */}
      {mounted && (
        <div
          className="absolute w-32 h-32 pointer-events-none z-10 animate-lunar-breath mix-blend-screen"
          style={{
            left: "61.1%",
            top: "13.7%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(56, 189, 248, 0.20) 45%, transparent 75%)",
          }}
        />
      )}

      {/* =========================================================
          4. MOUNTAIN STREAM WATER GLINTS (UNDER BRIDGE)
          Faint shimmering water glints in the stream under the
          mossy stone arch on the bottom-left.
          ========================================================= */}
      {mounted && (
        <div className="absolute left-[10%] bottom-[6%] w-[12%] h-[6%] pointer-events-none z-10">
          <div
            className="absolute left-2 top-2 w-3 h-0.5 bg-cyan-200/70 shadow-[0_0_2px_#38BDF8] animate-water-shimmer"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="absolute left-8 top-5 w-4 h-0.5 bg-sky-200/80 shadow-[0_0_2px_#38BDF8] animate-water-shimmer"
            style={{ animationDelay: "0.8s" }}
          />
          <div
            className="absolute left-14 top-3 w-3 h-0.5 bg-cyan-100/75 shadow-[0_0_2px_#38BDF8] animate-water-shimmer"
            style={{ animationDelay: "1.4s" }}
          />
        </div>
      )}

      {/* =========================================================
          5. ENCHANTED FOREST FIREFLIES (FLOATING SPORE PARTICLES)
          Golden & emerald fireflies lazily drifting across the
          wildflower meadow, ancient ruins, and mossy bridge.
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {[
            { x: 12, y: 78, s: 2, c: "#FDE047", d: "0s", dur: "7s" },
            { x: 22, y: 72, s: 2.5, c: "#34D399", d: "1.2s", dur: "8.5s" },
            { x: 32, y: 84, s: 2, c: "#FBBF24", d: "2.5s", dur: "6.8s" },
            { x: 42, y: 76, s: 2.5, c: "#6EE7B7", d: "0.7s", dur: "9s" },
            { x: 50, y: 88, s: 2, c: "#FDE047", d: "3.1s", dur: "7.2s" },
            { x: 64, y: 80, s: 2.5, c: "#FBBF24", d: "1.8s", dur: "8s" },
            { x: 72, y: 86, s: 2, c: "#34D399", d: "4.0s", dur: "7.5s" },
            { x: 82, y: 75, s: 2.5, c: "#FDE047", d: "2.1s", dur: "8.2s" },
            { x: 90, y: 82, s: 2, c: "#6EE7B7", d: "0.5s", dur: "6.5s" },
            { x: 95, y: 70, s: 2, c: "#FBBF24", d: "3.5s", dur: "7.8s" },
          ].map((spore, i) => (
            <div
              key={`firefly-${i}`}
              className="absolute rounded-none animate-firefly-drift pointer-events-none"
              style={{
                left: `${spore.x}%`,
                top: `${spore.y}%`,
                width: `${spore.s}px`,
                height: `${spore.s}px`,
                backgroundColor: spore.c,
                boxShadow: `0 0 4px ${spore.c}`,
                animationDelay: spore.d,
                animationDuration: spore.dur,
                imageRendering: "pixelated",
              }}
            />
          ))}
        </div>
      )}

      {/* =========================================================
          6. TWINKLING STARDUST FIELD (UPPER-LEFT SKY POCKET)
          Colorful 8-bit stardust dots (cyan, pink, gold, white)
          twinkling in the open night sky to the left of the tower.
          ========================================================= */}
      {mounted && (
        <div className="absolute top-0 left-0 w-[42%] h-[32%] pointer-events-none z-10">
          <PixelStar x={48} y={32} size={1.1} delay={0.4} color="#FDE047" />
          <PixelStar x={68} y={22} size={0.9} delay={1.6} color="#38BDF8" />
          <PixelStar x={82} y={38} size={1.0} delay={0.9} color="#F43F5E" />
          <PixelStar x={92} y={18} size={1.2} delay={2.1} color="#FFFFFF" />

          {/* Stardust pixel squares */}
          {[
            { x: 44, y: 20, c: "#38BDF8", d: 0.2 },
            { x: 52, y: 26, c: "#F43F5E", d: 1.1 },
            { x: 58, y: 16, c: "#FDE047", d: 0.7 },
            { x: 62, y: 32, c: "#FFFFFF", d: 1.8 },
            { x: 74, y: 18, c: "#38BDF8", d: 0.5 },
            { x: 78, y: 28, c: "#F43F5E", d: 1.4 },
            { x: 86, y: 24, c: "#FDE047", d: 2.2 },
            { x: 88, y: 34, c: "#38BDF8", d: 0.9 },
            { x: 96, y: 28, c: "#FFFFFF", d: 1.5 },
          ].map((dot, idx) => (
            <div
              key={`stardust-${idx}`}
              className="absolute w-1 h-1 animate-pixel-star pointer-events-none"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                backgroundColor: dot.c,
                boxShadow: `0 0 2px ${dot.c}`,
                animationDelay: `${dot.d}s`,
                imageRendering: "pixelated",
              }}
            />
          ))}
        </div>
      )}

      {/* =========================================================
          7. TOWER UI CONTRAST VIGNETTE
          Carefully tuned dark forest vignette ensuring floor cards
          and battle briefing remain legible while framing the art.
          ========================================================= */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 95% 85% at 50% 40%, rgba(10, 20, 28, 0.25) 0%, rgba(8, 16, 24, 0.45) 60%, rgba(5, 10, 16, 0.75) 100%)",
        }}
      />

      {/* CRT Retro Arcade Scanline Grid */}
      <div
        className="absolute inset-0 pointer-events-none z-20 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.75) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 255, 0, 0.03))",
          backgroundSize: "100% 3px, 4px 100%",
        }}
      />

      {/* =========================================================
          COMPONENT-SCOPED CSS ANIMATIONS
          GPU-composited transforms & opacities.
          ========================================================= */}
      <style jsx>{`
        @keyframes lantern-flicker-1 {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          25% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.08); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.96); }
          75% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.04); }
        }

        @keyframes lantern-flicker-2 {
          0%, 100% { opacity: 0.65; transform: translate(-50%, -50%) scale(0.98); }
          30% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.06); }
          60% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.94); }
          85% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.1); }
        }

        @keyframes lantern-flicker-3 {
          0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.02); }
          40% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.95); }
          70% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.07); }
        }

        @keyframes lunar-glow-breath {
          0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.65; transform: translate(-50%, -50%) scale(1.1); }
        }

        @keyframes water-shimmer-anim {
          0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
          50% { opacity: 0.9; transform: scaleX(1.2); }
        }

        @keyframes firefly-wander {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0.3;
          }
          25% {
            transform: translate3d(8px, -14px, 0);
            opacity: 0.9;
          }
          50% {
            transform: translate3d(-6px, -28px, 0);
            opacity: 0.4;
          }
          75% {
            transform: translate3d(10px, -42px, 0);
            opacity: 0.85;
          }
          100% {
            transform: translate3d(0, -56px, 0);
            opacity: 0;
          }
        }

        .animate-lantern-flicker-1 {
          animation: lantern-flicker-1 2.2s steps(4, jump-none) infinite;
        }

        .animate-lantern-flicker-2 {
          animation: lantern-flicker-2 2.8s steps(4, jump-none) infinite;
        }

        .animate-lantern-flicker-3 {
          animation: lantern-flicker-3 3.4s steps(4, jump-none) infinite;
        }

        .animate-lunar-breath {
          animation: lunar-glow-breath 7s ease-in-out infinite;
        }

        .animate-water-shimmer {
          animation: water-shimmer-anim 2.5s ease-in-out infinite;
        }

        .animate-firefly-drift {
          animation: firefly-wander linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-lantern-flicker-1,
          .animate-lantern-flicker-2,
          .animate-lantern-flicker-3,
          .animate-lunar-breath,
          .animate-water-shimmer,
          .animate-firefly-drift {
            animation: none !important;
            opacity: 0.6 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PixelTowerRuinsBackground;
