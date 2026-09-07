"use client";

import React, { useEffect, useState } from "react";

/* =========================================================================
   16-BIT ENCHANTED APOTHECARY & TAVERN BACKGROUND COMPONENT
   Inspired by & faithful to the retro pixel-art shop artwork:
   - Hand-crafted fantasy apothecary counter with spellbooks & potion vials
   - Warm hanging iron lanterns with stepped candle flame flickers
   - Cozy sleeping ginger cat on the burlap grain sack
   - Roaring stone hearth fireplace with dancing embers
   - Shimmering magical potions on wooden timber shelves
   - Floating golden ambient dust motes
   - WCAG AAA contrast vignette for shop UI legibility
   ========================================================================= */

export function PixelShopTavernBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      suppressHydrationWarning
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden bg-[#140b07]"
    >
      {/* =========================================================
          1. MASTER 16-BIT PIXEL ARTWORK LAYER
          1024x458 panoramic pixel art rendered with nearest-neighbor
          crisp scaling anchored to center for perfect wide framing.
          ========================================================= */}
      <div
        className="absolute inset-0 w-full h-full bg-cover select-none pointer-events-none"
        style={{
          backgroundImage: "url('/backgrounds/apothecary_tavern_shop.jpg')",
          backgroundPosition: "center 38%",
          imageRendering: "pixelated",
          filter: "contrast(1.04) brightness(0.96)",
        }}
      />

      {/* =========================================================
          2. LIVING LANTERN & CANDLE FLAME FLICKERING OVERLAYS
          Warm golden/amber candlelight pulsing dynamically from the
          3 grand hanging iron lanterns, chandeliers, and wall sconces.
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Hanging Iron Lantern 1 (Left) */}
          <div
            className="absolute w-20 h-28 bg-gradient-radial from-amber-300/55 via-yellow-500/25 to-transparent rounded-full blur-md animate-lantern-flicker-1 mix-blend-screen"
            style={{
              left: "15.0%",
              top: "29.5%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Hanging Iron Lantern 2 (Mid-Left) */}
          <div
            className="absolute w-24 h-32 bg-gradient-radial from-amber-300/60 via-yellow-500/30 to-transparent rounded-full blur-md animate-lantern-flicker-2 mix-blend-screen"
            style={{
              left: "26.2%",
              top: "17.9%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Hanging Iron Lantern 3 (Right) */}
          <div
            className="absolute w-22 h-30 bg-gradient-radial from-amber-300/55 via-yellow-500/25 to-transparent rounded-full blur-md animate-lantern-flicker-3 mix-blend-screen"
            style={{
              left: "76.7%",
              top: "24.0%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Far-Right Candle Chandelier */}
          <div
            className="absolute w-28 h-28 bg-gradient-radial from-yellow-300/40 via-amber-500/20 to-transparent rounded-full blur-lg animate-lantern-flicker-1 mix-blend-screen"
            style={{
              left: "90.6%",
              top: "27.3%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Wall Sconce Candle (Left Pillar) */}
          <div
            className="absolute w-10 h-10 bg-gradient-radial from-yellow-300/50 via-amber-500/20 to-transparent rounded-full blur-[2px] animate-lantern-flicker-2 mix-blend-screen"
            style={{
              left: "21.1%",
              top: "42.6%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Counter Candle (Near Ledger) */}
          <div
            className="absolute w-10 h-12 bg-gradient-radial from-yellow-200/55 via-amber-500/25 to-transparent rounded-full blur-[2px] animate-lantern-flicker-3 mix-blend-screen"
            style={{
              left: "69.3%",
              top: "64.4%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Shelf Candles */}
          <div
            className="absolute w-8 h-8 bg-gradient-radial from-yellow-300/45 via-amber-500/15 to-transparent rounded-full blur-[2px] animate-lantern-flicker-1 mix-blend-screen"
            style={{
              left: "45.1%",
              top: "33.2%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute w-8 h-8 bg-gradient-radial from-yellow-300/45 via-amber-500/15 to-transparent rounded-full blur-[2px] animate-lantern-flicker-2 mix-blend-screen"
            style={{
              left: "55.5%",
              top: "48.0%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute w-8 h-8 bg-gradient-radial from-yellow-300/45 via-amber-500/15 to-transparent rounded-full blur-[2px] animate-lantern-flicker-3 mix-blend-screen"
            style={{
              left: "72.1%",
              top: "41.5%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}

      {/* =========================================================
          3. ROARING STONE HEARTH FIREPLACE
          Dynamic warm orange/crimson ember flame dance casting
          ambient light over tavern patrons & timber floorboards.
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Fireplace Hearth Core Flames */}
          <div
            className="absolute w-24 h-24 bg-gradient-radial from-orange-400/70 via-red-600/35 to-transparent rounded-full blur-md animate-fireplace-dance mix-blend-screen"
            style={{
              left: "94.5%",
              top: "57.2%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Fireplace Ambient Hearth Glow (Floorboard Wash) */}
          <div
            className="absolute w-44 h-36 bg-gradient-radial from-amber-500/30 via-orange-600/15 to-transparent rounded-full blur-xl animate-fireplace-ambient mix-blend-screen"
            style={{
              left: "92.0%",
              top: "60.0%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Chimney Spark Embers rising from hearth */}
          {[
            { left: "93.8%", delay: "0s", dur: "3.2s" },
            { left: "95.2%", delay: "1.1s", dur: "2.8s" },
            { left: "94.5%", delay: "2.0s", dur: "3.5s" },
          ].map((spark, idx) => (
            <div
              key={`spark-${idx}`}
              className="absolute w-1 h-1 bg-[#FDE047] shadow-[0_0_3px_#F59E0B] animate-hearth-spark"
              style={{
                left: spark.left,
                top: "56%",
                animationDelay: spark.delay,
                animationDuration: spark.dur,
              }}
            />
          ))}
        </div>
      )}

      {/* =========================================================
          4. GLOWING MAGICAL POTION SHELVES
          Subtle pulsating elemental luminescence:
          Crimson (Health), Azure (Mana), Emerald (Stamina).
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Crimson Health Elixirs (Left Shelf) */}
          <div
            className="absolute w-12 h-6 bg-rose-500/25 blur-sm rounded-full animate-potion-pulse mix-blend-screen"
            style={{
              left: "35.2%",
              top: "33.5%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Azure Mana Draughts (Mid Shelf) */}
          <div
            className="absolute w-12 h-6 bg-cyan-400/25 blur-sm rounded-full animate-potion-pulse mix-blend-screen"
            style={{
              left: "37.5%",
              top: "49.5%",
              transform: "translate(-50%, -50%)",
              animationDelay: "1.2s",
            }}
          />

          {/* Emerald Stamina Phials (Upper Shelf) */}
          <div
            className="absolute w-10 h-5 bg-emerald-400/25 blur-sm rounded-full animate-potion-pulse mix-blend-screen"
            style={{
              left: "47.2%",
              top: "49.5%",
              transform: "translate(-50%, -50%)",
              animationDelay: "2.4s",
            }}
          />
        </div>
      )}

      {/* =========================================================
          5. SLEEPING CAT BREATHING MICRO-ANIMATION
          Gentle, peaceful rise and fall of the sleeping ginger cat
          curled up on the grain sack near the counter.
          ========================================================= */}
      {mounted && (
        <div
          className="absolute pointer-events-none z-10 animate-cat-breathe"
          style={{
            left: "22.7%",
            top: "86.9%",
            width: "70px",
            height: "36px",
            transform: "translate(-50%, -50%)",
            transformOrigin: "bottom center",
          }}
        >
          {/* Soft warm fur highlight aura */}
          <div className="w-full h-full bg-amber-500/10 rounded-full blur-[2px]" />
        </div>
      )}

      {/* =========================================================
          6. FLOATING TAVERN DUST MOTES
          Warm golden particles lazily suspended in the lantern beams.
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {[
            { x: 18, y: 35, s: 1.5, d: "0s", dur: "8s" },
            { x: 28, y: 25, s: 2, d: "1.5s", dur: "9.5s" },
            { x: 42, y: 40, s: 1.5, d: "3.2s", dur: "7.8s" },
            { x: 55, y: 30, s: 2, d: "0.8s", dur: "10s" },
            { x: 68, y: 50, s: 1.5, d: "2.4s", dur: "8.5s" },
            { x: 78, y: 32, s: 2, d: "1.9s", dur: "9s" },
            { x: 88, y: 45, s: 1.5, d: "3.8s", dur: "7.5s" },
          ].map((mote, i) => (
            <div
              key={`mote-${i}`}
              className="absolute rounded-none animate-dust-mote pointer-events-none"
              style={{
                left: `${mote.x}%`,
                top: `${mote.y}%`,
                width: `${mote.s}px`,
                height: `${mote.s}px`,
                backgroundColor: "#FEF08A",
                boxShadow: "0 0 3px #F59E0B",
                animationDelay: mote.d,
                animationDuration: mote.dur,
                imageRendering: "pixelated",
              }}
            />
          ))}
        </div>
      )}

      {/* =========================================================
          7. SHOP UI CONTRAST VIGNETTE
          Warm dark wood vignette preserving full legibility for
          merchant wares, item cards, tooltips, and gold prices.
          ========================================================= */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 95% 85% at 50% 38%, rgba(20, 12, 8, 0.20) 0%, rgba(16, 9, 6, 0.45) 60%, rgba(10, 5, 3, 0.76) 100%)",
        }}
      />

      {/* CRT Retro Arcade Scanline Grid */}
      <div
        className="absolute inset-0 pointer-events-none z-20 opacity-15"
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
          0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) scale(1); }
          25% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.06); }
          50% { opacity: 0.65; transform: translate(-50%, -50%) scale(0.96); }
          75% { opacity: 0.90; transform: translate(-50%, -50%) scale(1.03); }
        }

        @keyframes lantern-flicker-2 {
          0%, 100% { opacity: 0.70; transform: translate(-50%, -50%) scale(0.98); }
          30% { opacity: 0.92; transform: translate(-50%, -50%) scale(1.07); }
          60% { opacity: 0.60; transform: translate(-50%, -50%) scale(0.94); }
          85% { opacity: 0.88; transform: translate(-50%, -50%) scale(1.04); }
        }

        @keyframes lantern-flicker-3 {
          0%, 100% { opacity: 0.80; transform: translate(-50%, -50%) scale(1.02); }
          40% { opacity: 0.62; transform: translate(-50%, -50%) scale(0.95); }
          70% { opacity: 0.94; transform: translate(-50%, -50%) scale(1.08); }
        }

        @keyframes fireplace-dance-anim {
          0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) scale(1); }
          20% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.1) translateY(-2px); }
          40% { opacity: 0.70; transform: translate(-50%, -50%) scale(0.95) translateY(1px); }
          60% { opacity: 1; transform: translate(-50%, -50%) scale(1.15) translateY(-3px); }
          80% { opacity: 0.80; transform: translate(-50%, -50%) scale(1.02); }
        }

        @keyframes fireplace-ambient-pulse {
          0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.65; transform: translate(-50%, -50%) scale(1.08); }
        }

        @keyframes hearth-spark-anim {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate3d(4px, -24px, 0) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate3d(-6px, -52px, 0) scale(0.4);
            opacity: 0;
          }
        }

        @keyframes potion-glow-pulse {
          0%, 100% { opacity: 0.25; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.65; transform: translate(-50%, -50%) scale(1.12); }
        }

        @keyframes cat-peaceful-sleep {
          0%, 100% {
            transform: translate(-50%, -50%) scaleY(1);
          }
          50% {
            transform: translate(-50%, -50%) scaleY(1.04);
          }
        }

        @keyframes dust-float {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0.2;
          }
          30% {
            transform: translate3d(6px, -18px, 0);
            opacity: 0.75;
          }
          70% {
            transform: translate3d(-5px, -36px, 0);
            opacity: 0.65;
          }
          100% {
            transform: translate3d(3px, -55px, 0);
            opacity: 0;
          }
        }

        .animate-lantern-flicker-1 {
          animation: lantern-flicker-1 2.4s steps(4, jump-none) infinite;
        }

        .animate-lantern-flicker-2 {
          animation: lantern-flicker-2 3.1s steps(4, jump-none) infinite;
        }

        .animate-lantern-flicker-3 {
          animation: lantern-flicker-3 2.7s steps(4, jump-none) infinite;
        }

        .animate-fireplace-dance {
          animation: fireplace-dance-anim 1.8s ease-in-out infinite;
        }

        .animate-fireplace-ambient {
          animation: fireplace-ambient-pulse 3.5s ease-in-out infinite;
        }

        .animate-hearth-spark {
          animation: hearth-spark-anim linear infinite;
        }

        .animate-potion-pulse {
          animation: potion-glow-pulse 3s ease-in-out infinite;
        }

        .animate-cat-breathe {
          animation: cat-peaceful-sleep 3.8s ease-in-out infinite;
        }

        .animate-dust-mote {
          animation: dust-float linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-lantern-flicker-1,
          .animate-lantern-flicker-2,
          .animate-lantern-flicker-3,
          .animate-fireplace-dance,
          .animate-fireplace-ambient,
          .animate-hearth-spark,
          .animate-potion-pulse,
          .animate-cat-breathe,
          .animate-dust-mote {
            animation: none !important;
            opacity: 0.6 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PixelShopTavernBackground;
