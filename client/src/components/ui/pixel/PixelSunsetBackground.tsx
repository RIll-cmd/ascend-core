"use client";

import React, { useEffect, useRef, useState } from "react";

/* 8-Bit Sunset Gradient Palette from Reference Art */
const SUNSET_PALETTE = [
  "#2A084E", // 0: Deep Night Indigo
  "#4C1078", // 1: Royal Violet
  "#781D9E", // 2: Vibrant Purple
  "#B8248E", // 3: Violet-Magenta
  "#E83274", // 4: Neon Magenta-Pink
  "#F4554B", // 5: Coral Red
  "#F77D38", // 6: Sunset Orange
  "#FA9F36", // 7: Warm Golden Amber
];

/* 4x4 Bayer Ordered Dither Matrix */
const BAYER_4X4 = [
  [0 / 16, 8 / 16, 2 / 16, 10 / 16],
  [12 / 16, 4 / 16, 14 / 16, 6 / 16],
  [3 / 16, 11 / 16, 1 / 16, 9 / 16],
  [15 / 16, 7 / 16, 13 / 16, 5 / 16],
];

/* Hex to RGB helper */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/* Pre-parse RGB values for lightning-fast canvas pixel writes */
const PALETTE_RGB = SUNSET_PALETTE.map(hexToRgb);

/* 4-Point Cross Sparkle Star Component */
function CrossSparkle({
  x,
  y,
  size = 1,
  delay = 0,
}: {
  x: number;
  y: number;
  size?: number;
  delay?: number;
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
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        {/* Core 3x3 */}
        <rect x="7" y="7" width="3" height="3" fill="#FFFFFF" />
        {/* Inner glow points */}
        <rect x="7" y="4" width="3" height="3" fill="#FFFFFF" />
        <rect x="7" y="10" width="3" height="3" fill="#FFFFFF" />
        <rect x="4" y="7" width="3" height="3" fill="#FFFFFF" />
        <rect x="10" y="7" width="3" height="3" fill="#FFFFFF" />
        {/* Outer sharp tips */}
        <rect x="8" y="0" width="1" height="4" fill="#FFFFFF" fillOpacity="0.95" />
        <rect x="8" y="13" width="1" height="4" fill="#FFFFFF" fillOpacity="0.95" />
        <rect x="0" y="8" width="4" height="1" fill="#FFFFFF" fillOpacity="0.95" />
        <rect x="13" y="8" width="4" height="1" fill="#FFFFFF" fillOpacity="0.95" />
      </svg>
    </div>
  );
}

/* 8-Bit Authentic Pixel Moon from Reference - Bold, Large & Majestic */
function PixelMoon({
  style,
  className = "",
}: {
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`absolute select-none pointer-events-none z-10 ${className}`}
      style={style}
    >
      {/* Crisp 8-bit Circular Pixel Moon with Dark Outline & Craters */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Black / Deep Purple 1px Outline */}
        <rect x="11" y="1" width="14" height="1" fill="#1B0838" />
        <rect x="7" y="2" width="4" height="1" fill="#1B0838" />
        <rect x="25" y="2" width="4" height="1" fill="#1B0838" />
        <rect x="5" y="3" width="2" height="2" fill="#1B0838" />
        <rect x="29" y="3" width="2" height="2" fill="#1B0838" />
        <rect x="3" y="5" width="2" height="2" fill="#1B0838" />
        <rect x="31" y="5" width="2" height="2" fill="#1B0838" />
        <rect x="2" y="7" width="1" height="4" fill="#1B0838" />
        <rect x="33" y="7" width="1" height="4" fill="#1B0838" />
        <rect x="1" y="11" width="1" height="14" fill="#1B0838" />
        <rect x="34" y="11" width="1" height="14" fill="#1B0838" />
        <rect x="2" y="25" width="1" height="4" fill="#1B0838" />
        <rect x="33" y="25" width="1" height="4" fill="#1B0838" />
        <rect x="3" y="29" width="2" height="2" fill="#1B0838" />
        <rect x="31" y="29" width="2" height="2" fill="#1B0838" />
        <rect x="5" y="31" width="2" height="2" fill="#1B0838" />
        <rect x="29" y="31" width="2" height="2" fill="#1B0838" />
        <rect x="7" y="33" width="4" height="1" fill="#1B0838" />
        <rect x="25" y="33" width="4" height="1" fill="#1B0838" />
        <rect x="11" y="34" width="14" height="1" fill="#1B0838" />

        {/* White / Light Lavender Moon Core Fill */}
        <rect x="11" y="2" width="14" height="32" fill="#FFFFFF" />
        <rect x="7" y="3" width="22" height="30" fill="#FFFFFF" />
        <rect x="5" y="5" width="26" height="26" fill="#FFFFFF" />
        <rect x="3" y="7" width="30" height="22" fill="#FFFFFF" />
        <rect x="2" y="11" width="32" height="14" fill="#FFFFFF" />

        {/* Shaded Craters from Reference Art */}
        {/* Top-Right Crater */}
        <rect x="22" y="6" width="5" height="5" fill="#E2D5F8" />
        <rect x="23" y="7" width="3" height="3" fill="#C4B0E8" />
        <rect x="24" y="8" width="1" height="1" fill="#9F83DB" />

        {/* Center-Left Large Crater */}
        <rect x="7" y="13" width="7" height="6" fill="#E2D5F8" />
        <rect x="8" y="14" width="5" height="4" fill="#C4B0E8" />
        <rect x="9" y="15" width="3" height="2" fill="#9F83DB" />

        {/* Upper-Center Small Crater */}
        <rect x="15" y="8" width="4" height="4" fill="#E2D5F8" />
        <rect x="16" y="9" width="2" height="2" fill="#C4B0E8" />

        {/* Center-Right Crater */}
        <rect x="23" y="15" width="5" height="5" fill="#E2D5F8" />
        <rect x="24" y="16" width="3" height="3" fill="#C4B0E8" />

        {/* Lower Crater Cluster */}
        <rect x="11" y="23" width="8" height="5" fill="#E2D5F8" />
        <rect x="12" y="24" width="6" height="3" fill="#C4B0E8" />
        <rect x="13" y="25" width="4" height="1" fill="#9F83DB" />

        <rect x="23" y="23" width="6" height="5" fill="#E2D5F8" />
        <rect x="24" y="24" width="4" height="3" fill="#C4B0E8" />
        <rect x="25" y="25" width="2" height="1" fill="#9F83DB" />
      </svg>
    </div>
  );
}

/* 8-Bit Shaded Pixel Cloud from Reference */
function ShadedPixelCloud({
  style,
  className = "",
}: {
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`absolute select-none pointer-events-none z-10 ${className}`}
      style={style}
    >
      <svg
        viewBox="0 0 28 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        style={{ imageRendering: "pixelated" }}
      >
        {/* White Top / Highlight Cloud Puffs */}
        <rect x="8" y="1" width="7" height="3" fill="#FFFFFF" />
        <rect x="10" y="0" width="4" height="1" fill="#FFFFFF" />
        <rect x="15" y="2" width="7" height="3" fill="#FFFFFF" />
        <rect x="3" y="3" width="7" height="3" fill="#FFFFFF" />
        <rect x="2" y="4" width="24" height="3" fill="#FFFFFF" />

        {/* Baby Blue Mid Shadow */}
        <rect x="1" y="7" width="26" height="2" fill="#BCE3FF" />
        <rect x="3" y="9" width="22" height="1" fill="#88CBFF" />
        <rect x="7" y="10" width="14" height="1" fill="#60B5FF" />
      </svg>
    </div>
  );
}

export function PixelSunsetBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Draw Pixel-Perfect Bayer Dither Sunset on Canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const pixelSize = 4; // Exact 4px retro pixel square
      const width = Math.ceil(window.innerWidth / pixelSize);
      const height = Math.ceil(window.innerHeight / pixelSize);

      canvas.width = width;
      canvas.height = height;

      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      const numBands = PALETTE_RGB.length;
      // Total band slots: N solid bands + (N-1) dither transitions
      const totalSteps = numBands + (numBands - 1);
      const stepHeight = height / totalSteps;

      for (let y = 0; y < height; y++) {
        // Find which step we are in
        const stepIndex = Math.floor(y / stepHeight);
        const clampedStep = Math.min(stepIndex, totalSteps - 1);

        const isDither = clampedStep % 2 === 1;
        const bandIndex = Math.floor(clampedStep / 2);

        let r = 0;
        let g = 0;
        let b = 0;

        if (!isDither || bandIndex >= numBands - 1) {
          // Solid Band
          const col = PALETTE_RGB[Math.min(bandIndex, numBands - 1)];
          r = col[0];
          g = col[1];
          b = col[2];
        } else {
          // Dither Transition Band between bandIndex and bandIndex + 1
          const colA = PALETTE_RGB[bandIndex];
          const colB = PALETTE_RGB[bandIndex + 1];

          // Progress ratio within the dither band (0 -> 1)
          const localY = y - clampedStep * stepHeight;
          const t = localY / stepHeight;

          for (let x = 0; x < width; x++) {
            const threshold = BAYER_4X4[y % 4][x % 4];
            const useB = t > threshold;
            const chosen = useB ? colB : colA;

            const idx = (y * width + x) * 4;
            data[idx] = chosen[0];
            data[idx + 1] = chosen[1];
            data[idx + 2] = chosen[2];
            data[idx + 3] = 255;
          }
          continue;
        }

        // Fill solid line
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, []);

  return (
    <div
      suppressHydrationWarning
      className="fixed inset-0 pointer-events-none z-0 select-none"
    >
      {/* 1. PIXEL-PERFECT BAYER DITHERED CANVAS */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover absolute inset-0"
        style={{
          imageRendering: "pixelated",
          filter: "contrast(1.02)",
        }}
      />

      {/* 2. AUTHENTIC 8-BIT PIXEL MOON - PROPORTIONALLY SIZED & POSITIONED IN UPPER-LEFT SKY */}
      <div className="absolute top-[84px] sm:top-[92px] left-[6%] sm:left-[10%] md:left-[12%] z-10">
        <PixelMoon className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64" />
        {/* Prominent 4-Point Star right at bottom-right rim of Moon */}
        <div className="absolute -bottom-2 -right-2">
          <CrossSparkle x={0} y={0} size={1.4} delay={0.2} />
        </div>
      </div>

      {/* 3. SHADED 8-BIT PIXEL CLOUDS (Upper Right & Drifting Across Sky) */}
      {mounted && (
        <>
          {/* Main Primary Cloud from Reference Art */}
          <div className="absolute top-[22%] left-[62%] sm:left-[66%] md:left-[70%] z-10">
            <ShadedPixelCloud className="w-36 h-14 sm:w-44 sm:h-16 md:w-52 md:h-20" />
            {/* Sparkle star right above the Cloud */}
            <div className="absolute -top-4 right-4">
              <CrossSparkle x={0} y={0} size={1.3} delay={0.8} />
            </div>
          </div>

          {/* Gentle background drifting clouds for ambient motion */}
          <ShadedPixelCloud
            className="animate-pixel-cloud-2 top-[40%] w-36 h-14 sm:w-44 sm:h-16"
            style={{ animationDelay: "-14s", transform: "scale(0.85)" }}
          />
          <ShadedPixelCloud
            className="animate-pixel-cloud-3 top-[60%] w-40 h-16 sm:w-48 sm:h-18"
            style={{ animationDelay: "-28s", transform: "scale(1.1)" }}
          />
        </>
      )}

      {/* 4. COMPREHENSIVE 8-BIT STARFIELD (COVERING SIDES, TOP, MIDDLE & BOTTOM) */}
      {mounted && (
        <>
          {/* FAR LEFT MARGIN STARS */}
          <CrossSparkle x={3} y={14} size={1.2} delay={0.4} />
          <CrossSparkle x={7} y={32} size={0.9} delay={1.1} />
          <CrossSparkle x={4} y={54} size={1.2} delay={1.7} />
          <CrossSparkle x={6} y={76} size={0.85} delay={2.3} />
          <CrossSparkle x={2} y={88} size={1.05} delay={0.9} />

          {/* FAR RIGHT MARGIN STARS */}
          <CrossSparkle x={96} y={12} size={1.2} delay={0.6} />
          <CrossSparkle x={93} y={34} size={0.95} delay={1.4} />
          <CrossSparkle x={97} y={58} size={1.15} delay={2.0} />
          <CrossSparkle x={92} y={74} size={0.9} delay={1.2} />
          <CrossSparkle x={95} y={88} size={1.1} delay={0.7} />

          {/* CENTER & INNER SKY SPARKLES */}
          <CrossSparkle x={38} y={14} size={0.85} delay={1.5} />
          <CrossSparkle x={52} y={18} size={0.75} delay={2.2} />
          <CrossSparkle x={86} y={22} size={1.0} delay={0.3} />
          <CrossSparkle x={44} y={36} size={0.9} delay={1.9} />
          <CrossSparkle x={30} y={48} size={0.8} delay={1.3} />
          <CrossSparkle x={58} y={58} size={0.75} delay={2.5} />
          <CrossSparkle x={18} y={80} size={1.25} delay={1.6} />
          <CrossSparkle x={42} y={86} size={0.8} delay={0.5} />
          <CrossSparkle x={72} y={84} size={1.2} delay={2.1} />

          {/* SINGLE PIXEL TWINKLE STARS DISTRIBUTED ACROSS ENTIRE VIEWPORT */}
          {[
            // Left region
            { x: 2, y: 22 },
            { x: 5, y: 40 },
            { x: 8, y: 64 },
            { x: 3, y: 82 },
            { x: 9, y: 92 },
            // Upper center region
            { x: 28, y: 10 },
            { x: 34, y: 20 },
            { x: 48, y: 12 },
            { x: 58, y: 26 },
            // Middle region
            { x: 26, y: 40 },
            { x: 48, y: 48 },
            { x: 62, y: 44 },
            { x: 78, y: 50 },
            // Right region
            { x: 88, y: 16 },
            { x: 94, y: 28 },
            { x: 90, y: 46 },
            { x: 98, y: 68 },
            { x: 89, y: 82 },
            { x: 94, y: 94 },
            // Lower sunset bands
            { x: 22, y: 70 },
            { x: 36, y: 76 },
            { x: 50, y: 80 },
            { x: 65, y: 74 },
            { x: 80, y: 78 },
            { x: 26, y: 94 },
            { x: 54, y: 92 },
            { x: 68, y: 96 },
          ].map((dot, i) => (
            <div
              key={`dot-${i}`}
              className="absolute w-1.5 h-1.5 bg-white shadow-[1px_1px_0_0_#000] animate-pixel-star pointer-events-none"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                animationDelay: `${(i * 0.25) % 3}s`,
                opacity: 0.85,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default PixelSunsetBackground;
