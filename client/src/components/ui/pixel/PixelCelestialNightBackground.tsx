"use client";

import React, { useEffect, useState } from "react";

/* =========================================================================
   16-BIT CELESTIAL AURORA NIGHT BACKGROUND COMPONENT
   Inspired by & faithful to the retro pixel-art starry night artwork:
   - Cosmic indigo-to-midnight night dome
   - Living dual-aurora luminescence (magenta left, cyan right)
   - Mythic constellations with starlight filaments (Phoenix & Big Dipper)
   - Dynamic Shooting Star / Meteor Shower engine
   - Countryside horizon silhouette with distant chimney & firefly twinkles
   - Zero-layout-thrashing GPU-composited animations
   ========================================================================= */

/* Crisp 4-Point Pixel Cross Sparkle Star */
function CrossSparkle({
  x,
  y,
  size = 1,
  delay = 0,
  color = "#FFFFFF",
  className = "",
}: {
  x: number;
  y: number;
  size?: number;
  delay?: number;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute select-none pointer-events-none animate-pixel-star z-10 ${className}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        transform: `translate(-50%, -50%) scale(${size})`,
      }}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 17 17"
        fill="none"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Core 3x3 */}
        <rect x="7" y="7" width="3" height="3" fill={color} />
        {/* Inner cross bars */}
        <rect x="7" y="4" width="3" height="3" fill={color} fillOpacity="0.95" />
        <rect x="7" y="10" width="3" height="3" fill={color} fillOpacity="0.95" />
        <rect x="4" y="7" width="3" height="3" fill={color} fillOpacity="0.95" />
        <rect x="10" y="7" width="3" height="3" fill={color} fillOpacity="0.95" />
        {/* Outer sharp pixel spikes */}
        <rect x="8" y="1" width="1" height="3" fill={color} fillOpacity="0.9" />
        <rect x="8" y="13" width="1" height="3" fill={color} fillOpacity="0.9" />
        <rect x="1" y="8" width="3" height="1" fill={color} fillOpacity="0.9" />
        <rect x="13" y="8" width="3" height="1" fill={color} fillOpacity="0.9" />
      </svg>
    </div>
  );
}

export function PixelCelestialNightBackground() {
  const [mounted, setMounted] = useState(false);
  const [shootingStarKey, setShootingStarKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Periodic Shooting Star / Meteor Trigger
  useEffect(() => {
    if (!mounted) return;

    // First meteor triggers quickly after mount (1.2s), then organic intervals between 6s and 10s
    let timeoutId: NodeJS.Timeout;
    const scheduleNextMeteor = (isInitial = false) => {
      const delay = isInitial ? 1200 : 6500 + Math.random() * 3500;
      timeoutId = setTimeout(() => {
        setShootingStarKey((prev) => prev + 1);
        scheduleNextMeteor(false);
      }, delay);
    };

    scheduleNextMeteor(true);
    return () => clearTimeout(timeoutId);
  }, [mounted]);

  return (
    <div
      suppressHydrationWarning
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden bg-[#060412]"
    >
      {/* =========================================================
          1. MASTER PIXEL ARTWORK LAYER
          Nearest-neighbor 16-bit rendering framed at 40% vertical
          to keep constellations, shooting star, auroras, and hills
          in clear view across any display resolution.
          ========================================================= */}
      <div
        className="absolute inset-0 w-full h-full bg-cover select-none pointer-events-none"
        style={{
          backgroundImage: "url('/backgrounds/celestial_aurora_night.jpg')",
          backgroundPosition: "center 40%",
          imageRendering: "pixelated",
          filter: "contrast(1.04) brightness(1.02)",
        }}
      />

      {/* =========================================================
          2. LIVING DUAL-AURORA LUMINESCENCE (AMBIENT BREATH OVERLAYS)
          Soft undulating cosmic glow on the left magenta nebula
          and right teal aurora, composited with GPU blend-mode screen.
          ========================================================= */}
      {/* Left Aurora (Vibrant Magenta/Crimson Cosmic Nebula) */}
      <div
        className="absolute bottom-0 left-0 w-[55vw] h-[55vh] pointer-events-none opacity-45 animate-aurora-magenta mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at bottom left, rgba(244, 63, 122, 0.45) 0%, rgba(184, 36, 110, 0.22) 40%, rgba(110, 20, 70, 0.08) 65%, transparent 80%)",
        }}
      />

      {/* Right Aurora (Glowing Cyan/Teal Ribbons) */}
      <div
        className="absolute bottom-0 right-0 w-[55vw] h-[55vh] pointer-events-none opacity-40 animate-aurora-teal mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at bottom right, rgba(45, 226, 166, 0.40) 0%, rgba(20, 160, 133, 0.20) 40%, rgba(10, 90, 80, 0.07) 65%, transparent 80%)",
        }}
      />

      {/* =========================================================
          3. MYTHIC CONSTELLATIONS (STARLIGHT FILAMENTS & GLOW NODES)
          Coordinates mapped to the two prominent constellations
          in the reference art with pulsing starlight lines.
          ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* SVG Connective Filaments */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* --- Left Constellation (Phoenix / Cygnus Form) --- */}
            <g className="animate-constellation-pulse" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.12" strokeDasharray="0.6 0.3">
              {/* Apex to upper wing */}
              <line x1="29" y1="18" x2="23.5" y2="25" />
              {/* Upper wing to far wing */}
              <line x1="23.5" y1="25" x2="15.5" y2="25" />
              {/* Far wing down to wingtip */}
              <line x1="15.5" y1="25" x2="16" y2="43.5" />
              {/* Wingtip to bottom talon */}
              <line x1="16" y1="43.5" x2="10" y2="39" />
              {/* Upper wing to central chest star */}
              <line x1="23.5" y1="25" x2="35" y2="28.5" />
              {/* Chest to lower abdomen */}
              <line x1="35" y1="28.5" x2="34" y2="36" />
              {/* Chest to right wing / tail */}
              <line x1="35" y1="28.5" x2="45.5" y2="28" />
            </g>

            {/* --- Right Constellation (Ursa Major / The Big Dipper) --- */}
            <g className="animate-constellation-pulse" style={{ animationDelay: "1.5s" }} stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.12" strokeDasharray="0.6 0.3">
              {/* Handle stars */}
              <line x1="46.5" y1="12" x2="51.5" y2="17.5" />
              <line x1="51.5" y1="17.5" x2="56" y2="20.5" />
              <line x1="56" y1="20.5" x2="62" y2="23" />
              {/* The Dipper Bowl Quadrilateral */}
              <line x1="62" y1="23" x2="67.5" y2="24.5" />
              <line x1="67.5" y1="24.5" x2="81.5" y2="20.5" />
              <line x1="81.5" y1="20.5" x2="82.5" y2="14.5" />
              <line x1="82.5" y1="14.5" x2="70.5" y2="12.5" />
              <line x1="70.5" y1="12.5" x2="62" y2="23" />
            </g>
          </svg>

          {/* Sparkle Nodes for Left Constellation */}
          <CrossSparkle x={29} y={18} size={1.25} delay={0.2} />
          <CrossSparkle x={23.5} y={25} size={1.1} delay={1.1} />
          <CrossSparkle x={15.5} y={25} size={0.95} delay={0.6} />
          <CrossSparkle x={16} y={43.5} size={1.2} delay={1.8} />
          <CrossSparkle x={10} y={39} size={1.05} delay={2.3} />
          <CrossSparkle x={35} y={28.5} size={1.3} delay={0.4} />
          <CrossSparkle x={34} y={36} size={1.15} delay={1.4} />
          <CrossSparkle x={45.5} y={28} size={1.0} delay={2.0} />

          {/* Sparkle Nodes for Right Constellation (Big Dipper) */}
          <CrossSparkle x={46.5} y={12} size={1.25} delay={0.5} />
          <CrossSparkle x={51.5} y={17.5} size={1.05} delay={1.2} />
          <CrossSparkle x={56} y={20.5} size={1.0} delay={1.9} />
          <CrossSparkle x={62} y={23} size={1.15} delay={0.3} />
          <CrossSparkle x={67.5} y={24.5} size={1.3} delay={1.6} />
          <CrossSparkle x={70.5} y={12.5} size={1.1} delay={2.2} />
          <CrossSparkle x={82.5} y={14.5} size={1.2} delay={0.8} />
          <CrossSparkle x={81.5} y={20.5} size={1.1} delay={1.7} />
        </div>
      )}

      {/* =========================================================
          4. DYNAMIC SHOOTING STAR (METEOR SHOWER ENGINE)
          Streaks diagonally down-left from the cosmic zenith
          with a 4-point cross star head & a fiery magenta-white tail.
          ========================================================= */}
      {mounted && (
        <div
          key={`meteor-${shootingStarKey}`}
          className="absolute pointer-events-none z-20 animate-shooting-meteor"
          style={{
            top: "16%",
            left: "66%",
          }}
        >
          {/* Diagonal Container rotated at 135deg (downwards to the left) */}
          <div className="relative flex items-center transform -rotate-[135deg]">
            {/* Blazing 4-Point Star Head */}
            <div className="relative z-10">
              <svg width="21" height="21" viewBox="0 0 17 17" fill="none" style={{ imageRendering: "pixelated" }}>
                <rect x="7" y="7" width="3" height="3" fill="#FFFFFF" />
                <rect x="7" y="5" width="3" height="2" fill="#FEF08A" />
                <rect x="7" y="10" width="3" height="2" fill="#FEF08A" />
                <rect x="5" y="7" width="2" height="3" fill="#FEF08A" />
                <rect x="10" y="7" width="2" height="3" fill="#FEF08A" />
                <rect x="8" y="1" width="1" height="4" fill="#FFFFFF" />
                <rect x="8" y="12" width="1" height="4" fill="#FFFFFF" />
                <rect x="1" y="8" width="4" height="1" fill="#FFFFFF" />
                <rect x="12" y="8" width="4" height="1" fill="#FFFFFF" />
              </svg>
            </div>

            {/* Stepped Pixel Flame Exhaust Tail */}
            <div
              className="h-2 w-36 -ml-2 select-none"
              style={{
                background:
                  "linear-gradient(to right, #FFFFFF 0%, #FEF08A 18%, #F43F5E 55%, #881337 80%, transparent 100%)",
                clipPath: "polygon(0 30%, 100% 0%, 100% 100%, 0 70%)",
              }}
            />

            {/* Trailing Pixel Stardust Sparks */}
            <div className="absolute left-16 -top-2 w-1.5 h-1.5 bg-[#FEF08A] opacity-80" />
            <div className="absolute left-28 top-3 w-1.5 h-1.5 bg-[#F43F5E] opacity-70" />
          </div>
        </div>
      )}

      {/* Occasional Faint Secondary Cyan Micro-Meteor (Right Sky) */}
      {mounted && (
        <div
          className="absolute pointer-events-none z-20 animate-micro-meteor"
          style={{
            top: "28%",
            left: "82%",
          }}
        >
          <div className="relative flex items-center transform -rotate-[140deg]">
            <div className="w-1.5 h-1.5 bg-white shadow-[0_0_4px_#2DE2A6]" />
            <div
              className="h-1 w-20 select-none"
              style={{
                background: "linear-gradient(to right, #FFFFFF, #2DE2A6 40%, transparent 100%)",
              }}
            />
          </div>
        </div>
      )}

      {/* =========================================================
          5. COMPREHENSIVE TWINKLING STARFIELD
          Natural distribution of 4-point cross sparkles and crisp
          1x1 & 2x2 pixel dots across the upper cosmic dome.
          ========================================================= */}
      {mounted && (
        <>
          {/* Deep Space Cross Sparkles */}
          <CrossSparkle x={5} y={15} size={1.15} delay={0.7} />
          <CrossSparkle x={8} y={32} size={0.9} delay={1.4} />
          <CrossSparkle x={38} y={10} size={1.05} delay={2.1} />
          <CrossSparkle x={75} y={8} size={1.2} delay={0.9} />
          <CrossSparkle x={88} y={26} size={0.95} delay={1.8} />
          <CrossSparkle x={94} y={14} size={1.1} delay={2.4} />
          <CrossSparkle x={92} y={38} size={1.2} delay={0.4} />
          <CrossSparkle x={62} y={34} size={0.9} delay={1.3} />
          <CrossSparkle x={48} y={38} size={1.0} delay={2.2} />

          {/* Organic Stardust Pixel Squares */}
          {[
            { x: 3, y: 22, s: 2, d: 0.3 },
            { x: 7, y: 12, s: 1.5, d: 1.1 },
            { x: 12, y: 19, s: 2, d: 2.0 },
            { x: 20, y: 12, s: 1.5, d: 0.8 },
            { x: 32, y: 8, s: 2, d: 1.7 },
            { x: 42, y: 15, s: 1.5, d: 2.5 },
            { x: 54, y: 10, s: 2, d: 0.4 },
            { x: 65, y: 16, s: 1.5, d: 1.3 },
            { x: 72, y: 6, s: 2, d: 2.2 },
            { x: 80, y: 18, s: 1.5, d: 0.9 },
            { x: 86, y: 10, s: 2, d: 1.8 },
            { x: 96, y: 24, s: 1.5, d: 2.6 },
            { x: 90, y: 44, s: 2, d: 0.5 },
            { x: 78, y: 42, s: 1.5, d: 1.5 },
            { x: 24, y: 46, s: 2, d: 2.3 },
            { x: 6, y: 48, s: 1.5, d: 1.0 },
            { x: 14, y: 56, s: 2, d: 0.6 },
            { x: 88, y: 54, s: 1.5, d: 2.1 },
          ].map((star, idx) => (
            <div
              key={`star-dot-${idx}`}
              className="absolute bg-white animate-pixel-star pointer-events-none"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.s}px`,
                height: `${star.s}px`,
                animationDelay: `${star.d}s`,
                boxShadow: "0 0 1px rgba(255, 255, 255, 0.8)",
                imageRendering: "pixelated",
              }}
            />
          ))}
        </>
      )}

      {/* =========================================================
          6. COUNTRYSIDE HORIZON MICRO-DETAILS
          Distant cottage chimney firefly twinkles and warm lights
          along the dark rolling hill silhouettes at the bottom.
          ========================================================= */}
      {mounted && (
        <div className="absolute bottom-0 inset-x-0 h-16 pointer-events-none z-10">
          {/* Cottage 1 warm window light */}
          <div
            className="absolute bottom-5 left-[24.5%] w-1.5 h-1.5 bg-[#FEF08A] shadow-[0_0_4px_#FACC15] animate-pulse"
            style={{ animationDuration: "3.2s" }}
          />
          {/* Cottage 2 warm hearth light */}
          <div
            className="absolute bottom-4 left-[29.8%] w-1 h-1 bg-[#F59E0B] shadow-[0_0_3px_#D97706] animate-pulse"
            style={{ animationDuration: "2.8s", animationDelay: "1.1s" }}
          />
          {/* Distant farm silo beacon light */}
          <div
            className="absolute bottom-6 left-[41.2%] w-1 h-1 bg-[#EF4444] shadow-[0_0_3px_#DC2626] animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0.5s" }}
          />
          {/* Right hamlet cottage light */}
          <div
            className="absolute bottom-4 right-[28.5%] w-1.5 h-1.5 bg-[#FEF08A] shadow-[0_0_4px_#FACC15] animate-pulse"
            style={{ animationDuration: "3.6s", animationDelay: "1.8s" }}
          />
          {/* Right mill cottage light */}
          <div
            className="absolute bottom-5 right-[24.2%] w-1 h-1 bg-[#FDE047] shadow-[0_0_3px_#EAB308] animate-pulse"
            style={{ animationDuration: "2.4s", animationDelay: "0.7s" }}
          />
        </div>
      )}

      {/* =========================================================
          7. DASHBOARD CONTRAST VIGNETTE LAYER
          Carefully tuned cosmic gradient ensuring all foreground
          cards, text, and icons maintain pristine WCAG AAA contrast
          while preserving the vibrant beauty of the celestial sky.
          ========================================================= */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 75% at 50% 35%, rgba(6, 4, 18, 0.15) 0%, rgba(5, 3, 15, 0.40) 65%, rgba(4, 2, 10, 0.72) 100%)",
        }}
      />

      {/* CRT Retro Scanline & Raster Grid Overlay */}
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
          GPU-composited transforms & opacities for silky-smooth
          60fps rendering without layout recalculations.
          ========================================================= */}
      <style jsx>{`
        @keyframes aurora-breathe-magenta {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(1) translateY(0);
          }
          50% {
            opacity: 0.65;
            transform: scale(1.05) translateY(-6px);
          }
        }

        @keyframes aurora-breathe-teal {
          0%,
          100% {
            opacity: 0.32;
            transform: scale(1) translateY(0);
          }
          50% {
            opacity: 0.60;
            transform: scale(1.06) translateY(-8px);
          }
        }

        @keyframes constellation-glow {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.85;
          }
        }

        @keyframes shooting-meteor-streak {
          0% {
            transform: translate3d(220px, -180px, 0) scale(0.6);
            opacity: 0;
          }
          6% {
            opacity: 1;
            transform: translate3d(160px, -130px, 0) scale(1);
          }
          24% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1.1);
          }
          38% {
            opacity: 0;
            transform: translate3d(-180px, 150px, 0) scale(0.7);
          }
          100% {
            opacity: 0;
            transform: translate3d(-180px, 150px, 0) scale(0.7);
          }
        }

        @keyframes micro-meteor-streak {
          0%,
          82% {
            transform: translate3d(120px, -90px, 0);
            opacity: 0;
          }
          85% {
            opacity: 0.9;
            transform: translate3d(60px, -45px, 0);
          }
          90% {
            opacity: 0;
            transform: translate3d(-100px, 75px, 0);
          }
          100% {
            opacity: 0;
            transform: translate3d(-100px, 75px, 0);
          }
        }

        .animate-aurora-magenta {
          animation: aurora-breathe-magenta 8s ease-in-out infinite;
        }

        .animate-aurora-teal {
          animation: aurora-breathe-teal 10s ease-in-out infinite;
        }

        .animate-constellation-pulse {
          animation: constellation-glow 4s ease-in-out infinite;
        }

        .animate-shooting-meteor {
          animation: shooting-meteor-streak 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-micro-meteor {
          animation: micro-meteor-streak 14s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-aurora-magenta,
          .animate-aurora-teal,
          .animate-constellation-pulse,
          .animate-shooting-meteor,
          .animate-micro-meteor {
            animation: none !important;
            opacity: 0.5 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PixelCelestialNightBackground;
