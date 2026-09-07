"use client";

import React, { useEffect, useState } from "react";

/* =========================================================================
   16-BIT SHADOW MONARCH SANCTUARY BACKGROUND COMPONENT
   Faithful to Solo Leveling's Abyssal Realm & Monarch's Domain:
   - Colossal obsidian columns with glowing violet runic etchings
   - Cold purple soul-braziers burning with stepped retro pixel flame flicker
   - Rolling volumetric purple soul-smoke (#8B5CF6, #6366F1) pooling at the floor
   - Silent shadow soldier silhouettes standing guard in the misty background
   - Throne of the Shadow Monarch radiating cold sovereign mana
   - Floating dark-mana embers and motes
   - WCAG AAA contrast vignette for crisp achievement readability
   ========================================================================= */

export function PixelShadowSanctuaryBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      suppressHydrationWarning
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden bg-[#0A0512]"
    >
      {/* =========================================================
          1. MASTER 16-BIT RETRO PIXEL ART LAYER
          Rendered with nearest-neighbor crisp scaling anchored to
          center 36% for grand panoramic subterranean framing.
          ========================================================= */}
      <div
        className="absolute inset-0 w-full h-full bg-cover select-none pointer-events-none"
        style={{
          backgroundImage: "url('/backgrounds/shadow_monarch_sanctuary.jpg')",
          backgroundPosition: "center 36%",
          imageRendering: "pixelated",
          filter: "contrast(1.06) brightness(0.95)",
        }}
      />

      {/* =========================================================
          2. COLD PURPLE SOUL-BRAZIERS (STEPPED RETRO FLICKER)
          Pulsing cold neon purple & violet soul-fire over the
          carved stone braziers lining the cathedral floor.
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Foreground Left Brazier */}
          <div
            className="absolute w-24 h-28 bg-gradient-radial from-purple-400/70 via-fuchsia-600/35 to-transparent rounded-full blur-md animate-soulflame-1 mix-blend-screen"
            style={{
              left: "11.5%",
              top: "76.0%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Foreground Right Brazier */}
          <div
            className="absolute w-28 h-32 bg-gradient-radial from-violet-300/75 via-purple-600/40 to-transparent rounded-full blur-md animate-soulflame-2 mix-blend-screen"
            style={{
              left: "94.5%",
              top: "81.0%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Mid-Left Pillar Brazier */}
          <div
            className="absolute w-16 h-20 bg-gradient-radial from-purple-300/60 via-indigo-600/30 to-transparent rounded-full blur-[4px] animate-soulflame-3 mix-blend-screen"
            style={{
              left: "32.2%",
              top: "70.0%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Altar Left Brazier (Near Stairs) */}
          <div
            className="absolute w-12 h-16 bg-gradient-radial from-violet-300/55 via-fuchsia-600/25 to-transparent rounded-full blur-[3px] animate-soulflame-1 mix-blend-screen"
            style={{
              left: "46.2%",
              top: "69.5%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Altar Right Brazier */}
          <div
            className="absolute w-12 h-16 bg-gradient-radial from-violet-300/55 via-purple-600/25 to-transparent rounded-full blur-[3px] animate-soulflame-2 mix-blend-screen"
            style={{
              left: "77.8%",
              top: "68.5%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Small Stairway Lantern Brazier */}
          <div
            className="absolute w-10 h-12 bg-gradient-radial from-purple-300/50 via-indigo-500/20 to-transparent rounded-full blur-[2px] animate-soulflame-3 mix-blend-screen"
            style={{
              left: "54.8%",
              top: "66.5%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Distant Balcony Braziers */}
          <div
            className="absolute w-8 h-10 bg-gradient-radial from-fuchsia-400/40 via-purple-600/15 to-transparent rounded-full blur-[2px] animate-soulflame-1 mix-blend-screen"
            style={{
              left: "60.2%",
              top: "66.8%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute w-8 h-10 bg-gradient-radial from-purple-400/40 via-indigo-600/15 to-transparent rounded-full blur-[2px] animate-soulflame-2 mix-blend-screen"
            style={{
              left: "76.4%",
              top: "68.8%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Monarch's Throne Room Sovereign Aura */}
          <div
            className="absolute w-44 h-48 bg-gradient-radial from-fuchsia-500/35 via-purple-700/20 to-transparent rounded-full blur-2xl animate-throne-pulse mix-blend-screen"
            style={{
              left: "70.3%",
              top: "56.0%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}

      {/* =========================================================
          3. OBSIDIAN PILLAR RUNIC BREATHING LUMINESCENCE
          Electric violet rune glows shimmering along the giant
          cathedral support columns.
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Leftmost Pillar Glyph Glow */}
          <div
            className="absolute w-12 h-96 bg-gradient-to-b from-transparent via-purple-500/25 to-transparent rounded-full blur-lg animate-rune-breathe-1 mix-blend-screen"
            style={{
              left: "6.5%",
              top: "42.0%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Second Left Pillar Glyph Glow */}
          <div
            className="absolute w-12 h-96 bg-gradient-to-b from-transparent via-fuchsia-500/20 to-transparent rounded-full blur-lg animate-rune-breathe-2 mix-blend-screen"
            style={{
              left: "24.8%",
              top: "42.0%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Right Pillar Glyph Glow */}
          <div
            className="absolute w-12 h-96 bg-gradient-to-b from-transparent via-purple-500/25 to-transparent rounded-full blur-lg animate-rune-breathe-1 mix-blend-screen"
            style={{
              left: "94.0%",
              top: "38.0%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}

      {/* =========================================================
          4. VOLUMETRIC ROLLING SOUL-MIST (DARK MANA SMOKE)
          Ethereal violet and indigo fog layers wafting across
          the cathedral flagstone floor.
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-x-0 bottom-0 h-[48%] pointer-events-none z-15 overflow-hidden">
          {/* Primary Low-Lying Soul-Mist Ribbon */}
          <div
            className="absolute -inset-x-20 bottom-0 h-44 opacity-45 blur-2xl animate-soul-mist-slow mix-blend-screen"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 90%, rgba(139,92,246,0.45) 0%, rgba(99,102,241,0.2) 50%, transparent 85%)",
            }}
          />

          {/* Secondary Drifting Violet Veil */}
          <div
            className="absolute -inset-x-32 bottom-4 h-36 opacity-35 blur-3xl animate-soul-mist-reverse mix-blend-screen"
            style={{
              background:
                "radial-gradient(ellipse 90% 50% at 40% 85%, rgba(192,132,252,0.4) 0%, rgba(147,51,234,0.15) 60%, transparent 90%)",
            }}
          />
        </div>
      )}

      {/* =========================================================
          5. FLOATING DARK-MANA EMBERS & SOUL MOTES
          Glowing violet sparks rising gently from the braziers
          and cracks into the vaulted cathedral arches.
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[
            { left: "12%", top: "72%", delay: "0.2s", dur: "7.2s", size: "3px" },
            { left: "14%", top: "68%", delay: "1.8s", dur: "8.5s", size: "4px" },
            { left: "18%", top: "75%", delay: "3.1s", dur: "6.8s", size: "2px" },
            { left: "32%", top: "65%", delay: "0.8s", dur: "9.0s", size: "3px" },
            { left: "35%", top: "62%", delay: "2.5s", dur: "7.8s", size: "2.5px" },
            { left: "47%", top: "64%", delay: "1.2s", dur: "8.1s", size: "3px" },
            { left: "68%", top: "52%", delay: "0.5s", dur: "10.0s", size: "4px" },
            { left: "71%", top: "54%", delay: "2.9s", dur: "7.5s", size: "2.5px" },
            { left: "78%", top: "62%", delay: "1.6s", dur: "8.8s", size: "3.5px" },
            { left: "82%", top: "66%", delay: "3.6s", dur: "6.9s", size: "2px" },
            { left: "93%", top: "74%", delay: "0.9s", dur: "7.6s", size: "4px" },
            { left: "95%", top: "70%", delay: "2.1s", dur: "8.4s", size: "3px" },
          ].map((mote, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.9)] animate-soul-mote mix-blend-screen"
              style={{
                left: mote.left,
                top: mote.top,
                width: mote.size,
                height: mote.size,
                animationDelay: mote.delay,
                animationDuration: mote.dur,
              }}
            />
          ))}
        </div>
      )}

      {/* =========================================================
          6. ATMOSPHERIC CONTRAST VIGNETTE (WCAG AAA)
          Subtle darkening toward the perimeter and upper reaches,
          ensuring foreground achievement cards remain ultra-crisp.
          ========================================================= */}
      <div
        className="absolute inset-0 pointer-events-none z-25"
        style={{
          background:
            "radial-gradient(ellipse 95% 90% at 50% 40%, rgba(10,5,18,0.30) 0%, rgba(7,3,14,0.72) 75%, rgba(4,2,8,0.92) 100%)",
        }}
      />

      {/* =========================================================
          7. ANIMATION KEYFRAMES
          GPU-composited transforms and opacities only.
          Zero layout thrashing.
          ========================================================= */}
      <style jsx global>{`
        @keyframes soulflame-1 {
          0%, 100% {
            opacity: 0.82;
            transform: translate(-50%, -50%) scale(1);
          }
          25% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(1.07);
          }
          50% {
            opacity: 0.76;
            transform: translate(-50%, -50%) scale(0.96);
          }
          75% {
            opacity: 0.90;
            transform: translate(-50%, -50%) scale(1.03);
          }
        }

        @keyframes soulflame-2 {
          0%, 100% {
            opacity: 0.78;
            transform: translate(-50%, -50%) scale(0.98);
          }
          30% {
            opacity: 0.92;
            transform: translate(-50%, -50%) scale(1.06);
          }
          65% {
            opacity: 0.72;
            transform: translate(-50%, -50%) scale(0.94);
          }
          85% {
            opacity: 0.88;
            transform: translate(-50%, -50%) scale(1.02);
          }
        }

        @keyframes soulflame-3 {
          0%, 100% {
            opacity: 0.70;
            transform: translate(-50%, -50%) scale(1);
          }
          40% {
            opacity: 0.86;
            transform: translate(-50%, -50%) scale(1.05);
          }
          80% {
            opacity: 0.65;
            transform: translate(-50%, -50%) scale(0.95);
          }
        }

        @keyframes throne-pulse {
          0%, 100% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.60;
            transform: translate(-50%, -50%) scale(1.12);
          }
        }

        @keyframes rune-breathe-1 {
          0%, 100% {
            opacity: 0.40;
          }
          50% {
            opacity: 0.85;
          }
        }

        @keyframes rune-breathe-2 {
          0%, 100% {
            opacity: 0.80;
          }
          50% {
            opacity: 0.35;
          }
        }

        @keyframes soul-mist-slow {
          0%, 100% {
            transform: translateX(0) scaleY(1);
            opacity: 0.40;
          }
          50% {
            transform: translateX(20px) scaleY(1.08);
            opacity: 0.58;
          }
        }

        @keyframes soul-mist-reverse {
          0%, 100% {
            transform: translateX(0) scaleY(1);
            opacity: 0.30;
          }
          50% {
            transform: translateX(-24px) scaleY(1.12);
            opacity: 0.48;
          }
        }

        @keyframes soul-mote {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-90px) translateX(12px) scale(0.4);
            opacity: 0;
          }
        }

        .animate-soulflame-1 {
          animation: soulflame-1 1.9s steps(4) infinite;
        }

        .animate-soulflame-2 {
          animation: soulflame-2 2.3s steps(4) infinite;
        }

        .animate-soulflame-3 {
          animation: soulflame-3 1.7s steps(4) infinite;
        }

        .animate-throne-pulse {
          animation: throne-pulse 5.2s ease-in-out infinite;
        }

        .animate-rune-breathe-1 {
          animation: rune-breathe-1 4.2s ease-in-out infinite;
        }

        .animate-rune-breathe-2 {
          animation: rune-breathe-2 4.8s ease-in-out infinite;
        }

        .animate-soul-mist-slow {
          animation: soul-mist-slow 12s ease-in-out infinite;
        }

        .animate-soul-mist-reverse {
          animation: soul-mist-reverse 15s ease-in-out infinite;
        }

        .animate-soul-mote {
          animation: soul-mote linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-soulflame-1,
          .animate-soulflame-2,
          .animate-soulflame-3,
          .animate-throne-pulse,
          .animate-rune-breathe-1,
          .animate-rune-breathe-2,
          .animate-soul-mist-slow,
          .animate-soul-mist-reverse,
          .animate-soul-mote {
            animation: none !important;
            opacity: 0.6 !important;
          }
        }
      `}</style>
    </div>
  );
}
