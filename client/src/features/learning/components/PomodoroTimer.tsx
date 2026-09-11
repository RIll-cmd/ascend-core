"use client";

import React, { useEffect, useState } from "react";
import {
  PixelPlayIcon,
  PixelPauseIcon,
  PixelRefreshIcon,
  PixelSkipForwardIcon,
  PixelBookIcon,
  PixelTeacupIcon,
  PixelSparklesIcon,
  PixelFlameIcon,
  PixelAwardIcon,
  PixelScrollIcon,
  PixelEyeIcon,
  PixelEyeOffIcon,
  PixelQuillIcon,
  PixelHourglassIcon,
  PixelWaxSealIcon,
} from "@/components/ui/pixel/PixelIcons";
import { useLearningStore, PomodoroMode } from "../store/useLearningStore";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelProgress } from "@/components/ui/pixel/PixelProgress";
import { NumberTicker } from "@/components/ui/number-ticker";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { cn } from "@/lib/utils";

/* =====================================================================
   1. 1:1 HANDCRAFTED ANIMATED PIXEL CANDLE (DYNAMIC MELTING PHYSICS)
   ===================================================================== */
function PixelCandle({
  isRunning,
  progressPct,
  waxDropsCount,
}: {
  isRunning: boolean;
  progressPct: number;
  waxDropsCount: number;
}) {
  const [flameFrame, setFlameFrame] = useState(0);

  // Tick 4-frame pixel flame animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setFlameFrame((prev) => (prev + 1) % 4);
    }, isRunning ? 130 : 250);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Dynamic melting height calculations: shrinks from 60px down to 16px
  const maxStemHeight = 58;
  const minStemHeight = 16;
  const currentStemHeight = Math.max(
    minStemHeight,
    Math.round(maxStemHeight - progressPct * (maxStemHeight - minStemHeight))
  );

  // Left & Right descending wax drip lengths based on progress
  const leftDripLength = Math.min(currentStemHeight - 4, Math.round(progressPct * 30));
  const rightDripLength = Math.min(currentStemHeight - 6, Math.max(0, Math.round((progressPct - 0.2) * 26)));

  // Melted wax pool expansion on the base plate
  const poolWidth = Math.min(46, Math.round(28 + progressPct * 18));

  return (
    <div className="relative flex flex-col items-center justify-end h-40 w-32 select-none py-1">
      {/* Main 100% Handcrafted Pixel Candle Assembly */}
      <div className="relative flex flex-col items-center justify-end z-10 w-full" style={{ height: "120px" }}>
        
        {/* ================= 1. ANIMATED 1:1 PIXEL FLAME & WICK ================= */}
        <div
          className="relative flex flex-col items-center shrink-0 z-20"
          style={{
            marginBottom: "-4px",
            transform: isRunning ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.2s ease-out",
          }}
        >
          {/* Flame Frame 0: Standing Tall & Centered */}
          {flameFrame === 0 && (
            <svg
              viewBox="0 0 16 24"
              fill="none"
              className="w-8 h-12"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              {/* Outer Amber/Orange Flame Contour */}
              <rect x="7" y="1" width="2" height="2" fill="#EA580C" />
              <rect x="6" y="3" width="4" height="2" fill="#EA580C" />
              <rect x="5" y="5" width="6" height="3" fill="#EA580C" />
              <rect x="4" y="8" width="8" height="6" fill="#EA580C" />
              <rect x="3" y="14" width="10" height="4" fill="#EA580C" />
              <rect x="5" y="18" width="6" height="2" fill="#EA580C" />

              {/* Mid Golden Yellow Flame */}
              <rect x="7" y="2" width="2" height="2" fill="#FDE047" />
              <rect x="6" y="4" width="4" height="3" fill="#FDE047" />
              <rect x="5" y="7" width="6" height="6" fill="#FDE047" />
              <rect x="4" y="13" width="8" height="3" fill="#FDE047" />

              {/* Inner White-Hot Core */}
              <rect x="7" y="5" width="2" height="3" fill="#FFFFFF" />
              <rect x="6" y="8" width="4" height="4" fill="#FFFFFF" />
              <rect x="6" y="12" width="4" height="2" fill="#FEF08A" />

              {/* Wick */}
              <rect x="7" y="18" width="2" height="5" fill="#18181B" />
              <rect x="7" y="17" width="2" height="1" fill="#EF4444" />

              {/* Floating Spark */}
              <rect x="8" y="0" width="1" height="1" fill="#FEF08A" />
            </svg>
          )}

          {/* Flame Frame 1: Swaying Right with Elongated Tongue */}
          {flameFrame === 1 && (
            <svg
              viewBox="0 0 16 24"
              fill="none"
              className="w-8 h-12"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              {/* Outer Amber/Orange Flame Contour */}
              <rect x="8" y="1" width="3" height="2" fill="#EA580C" />
              <rect x="7" y="3" width="5" height="3" fill="#EA580C" />
              <rect x="5" y="6" width="8" height="7" fill="#EA580C" />
              <rect x="4" y="13" width="9" height="5" fill="#EA580C" />
              <rect x="5" y="18" width="6" height="2" fill="#EA580C" />

              {/* Mid Golden Yellow */}
              <rect x="8" y="2" width="2" height="2" fill="#FDE047" />
              <rect x="7" y="4" width="4" height="3" fill="#FDE047" />
              <rect x="6" y="7" width="6" height="6" fill="#FDE047" />
              <rect x="5" y="13" width="7" height="3" fill="#FDE047" />

              {/* Inner White Core */}
              <rect x="7" y="5" width="3" height="4" fill="#FFFFFF" />
              <rect x="6" y="9" width="4" height="4" fill="#FFFFFF" />
              <rect x="6" y="13" width="4" height="2" fill="#FEF08A" />

              {/* Wick */}
              <rect x="7" y="18" width="2" height="5" fill="#18181B" />
              <rect x="8" y="17" width="1" height="1" fill="#EF4444" />

              {/* Floating Spark */}
              <rect x="10" y="0" width="1" height="1" fill="#FEF08A" />
            </svg>
          )}

          {/* Flame Frame 2: Swaying Left */}
          {flameFrame === 2 && (
            <svg
              viewBox="0 0 16 24"
              fill="none"
              className="w-8 h-12"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              {/* Outer Amber/Orange Flame Contour */}
              <rect x="5" y="1" width="3" height="2" fill="#EA580C" />
              <rect x="4" y="3" width="5" height="3" fill="#EA580C" />
              <rect x="3" y="6" width="8" height="7" fill="#EA580C" />
              <rect x="3" y="13" width="9" height="5" fill="#EA580C" />
              <rect x="5" y="18" width="6" height="2" fill="#EA580C" />

              {/* Mid Golden Yellow */}
              <rect x="6" y="2" width="2" height="2" fill="#FDE047" />
              <rect x="5" y="4" width="4" height="3" fill="#FDE047" />
              <rect x="4" y="7" width="6" height="6" fill="#FDE047" />
              <rect x="4" y="13" width="7" height="3" fill="#FDE047" />

              {/* Inner White Core */}
              <rect x="6" y="5" width="2" height="4" fill="#FFFFFF" />
              <rect x="5" y="9" width="4" height="4" fill="#FFFFFF" />
              <rect x="5" y="13" width="4" height="2" fill="#FEF08A" />

              {/* Wick */}
              <rect x="7" y="18" width="2" height="5" fill="#18181B" />
              <rect x="7" y="17" width="1" height="1" fill="#EF4444" />

              {/* Floating Spark */}
              <rect x="4" y="0" width="1" height="1" fill="#FEF08A" />
            </svg>
          )}

          {/* Flame Frame 3: Wide Vibrant Flare */}
          {flameFrame === 3 && (
            <svg
              viewBox="0 0 16 24"
              fill="none"
              className="w-8 h-12"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              {/* Outer Amber/Orange Flame Contour */}
              <rect x="7" y="2" width="3" height="2" fill="#EA580C" />
              <rect x="5" y="4" width="6" height="3" fill="#EA580C" />
              <rect x="3" y="7" width="10" height="7" fill="#EA580C" />
              <rect x="3" y="14" width="10" height="4" fill="#EA580C" />
              <rect x="5" y="18" width="6" height="2" fill="#EA580C" />

              {/* Mid Golden Yellow */}
              <rect x="7" y="3" width="2" height="2" fill="#FDE047" />
              <rect x="6" y="5" width="4" height="3" fill="#FDE047" />
              <rect x="4" y="8" width="8" height="6" fill="#FDE047" />
              <rect x="4" y="14" width="8" height="3" fill="#FDE047" />

              {/* Inner White Core */}
              <rect x="7" y="6" width="2" height="3" fill="#FFFFFF" />
              <rect x="5" y="9" width="6" height="4" fill="#FFFFFF" />
              <rect x="6" y="13" width="4" height="2" fill="#FEF08A" />

              {/* Wick */}
              <rect x="7" y="18" width="2" height="5" fill="#18181B" />
              <rect x="7" y="17" width="2" height="1" fill="#EF4444" />

              {/* Floating Spark */}
              <rect x="6" y="0" width="1" height="1" fill="#FEF08A" />
            </svg>
          )}
        </div>

        {/* ================= 2. MELTING WHITE WAX CANDLE PILLAR (PIXELATED) ================= */}
        <div
          className="relative flex flex-col items-center justify-start z-15"
          style={{
            height: `${currentStemHeight}px`,
            width: "26px",
          }}
        >
          {/* Top Melted Wax Rim & Depressed Basin (100% Pixel Art) */}
          <div className="w-full h-3 bg-[#f4f4f5] border-2 border-black relative flex items-center justify-center shrink-0 shadow-[0_1px_0_#000]">
            {/* Inner Depressed Hot Wax Pool Basin */}
            <div className="w-4 h-1 bg-[#d4d4d8] border border-black/40 flex items-center justify-between px-0.5">
              <div className="w-1 h-0.5 bg-white" />
              <div className="w-1 h-0.5 bg-[#71717a]" />
            </div>
            {/* Top Left Specular Glint */}
            <div className="absolute left-0.5 top-0.5 w-1.5 h-1 bg-white" />
            {/* Top Right Shadow Edge */}
            <div className="absolute right-0.5 top-0.5 w-1 h-1 bg-[#a1a1aa]" />
          </div>

          {/* Main White Wax Stem Pillar with 2x2 Dithered Pixel Volume */}
          <div
            className="w-full flex-1 bg-[#e4e4e7] border-x-2 border-black relative flex justify-between overflow-visible"
            style={{ imageRendering: "pixelated" }}
          >
            {/* Outer Left Specular Pure White Pixel Column */}
            <div className="w-1 h-full bg-[#ffffff]" />
            {/* Mid-Left Crisp Ivory Pixel Column */}
            <div className="w-1.5 h-full bg-[#f4f4f5]" />

            {/* Center Body with 2x2 Checkerboard Pixel Texture */}
            <div
              className="flex-1 h-full bg-[#e4e4e7] relative"
              style={{
                backgroundImage: `repeating-conic-gradient(#d4d4d8 0% 25%, transparent 0% 50%)`,
                backgroundSize: "4px 4px",
                imageRendering: "pixelated",
              }}
            />

            {/* Mid-Right Soft Shadow Column */}
            <div className="w-1.5 h-full bg-[#a1a1aa]" />
            {/* Far-Right Deep Shadow Column */}
            <div className="w-1 h-full bg-[#71717a]" />

            {/* Left Organic Pixel Wax Drip */}
            {leftDripLength > 0 && (
              <div
                className="absolute left-[-2px] top-0 w-2 bg-[#f4f4f5] border-x border-b border-black z-20 shadow-[0_1px_0_#000] flex flex-col justify-between"
                style={{ height: `${leftDripLength}px`, imageRendering: "pixelated" }}
              >
                <div className="w-full h-1 bg-white" />
                {/* Bulbous Tear at Bottom */}
                <div className="w-full h-1.5 bg-[#ffffff] border-t border-black/30" />
              </div>
            )}

            {/* Right Organic Pixel Wax Drip */}
            {rightDripLength > 0 && (
              <div
                className="absolute right-[-2px] top-0 w-2 bg-[#a1a1aa] border-x border-b border-black z-20 shadow-[0_1px_0_#000] flex flex-col justify-between"
                style={{ height: `${rightDripLength}px`, imageRendering: "pixelated" }}
              >
                <div className="w-full h-1 bg-[#d4d4d8]" />
                {/* Bulbous Tear at Bottom */}
                <div className="w-full h-1.5 bg-[#71717a] border-t border-black/30" />
              </div>
            )}
          </div>
        </div>

        {/* ================= 3. BASE MELTED WAX POOL & BRONZE PEDESTAL ================= */}
        <div className="relative flex flex-col items-center shrink-0 z-10 w-full" style={{ marginTop: "-2px" }}>
          {/* Melted White Wax Puddle on Dish (Expands with Progress) */}
          <div
            className="h-2.5 bg-[#e4e4e7] border-2 border-black relative flex items-center justify-between px-1 shadow-[0_1px_0_0_#000]"
            style={{ width: `${poolWidth}px`, imageRendering: "pixelated" }}
          >
            {/* Puddle Highlights and Shadow Steps */}
            <div className="w-2 h-1 bg-white" />
            <div className="w-1.5 h-1 bg-[#a1a1aa]" />
          </div>

          {/* Gilded Bronze Candleholder Dish Upper Lip */}
          <div className="w-16 h-2.5 bg-[#d97706] border-2 border-black relative flex items-center justify-between px-1 shadow-[0_2px_0_0_#000]">
            <div className="w-3 h-1 bg-[#fef08a]" />
            <div className="w-3 h-1 bg-[#78350f]" />
          </div>

          {/* Stepped Pedestal Base Foot */}
          <div className="w-11 h-2.5 bg-[#78350f] border-x-2 border-b-2 border-black relative shadow-[0_2px_0_0_#000]">
            <div className="absolute left-1 top-0.5 w-2 h-1 bg-[#9a3412]" />
            <div className="absolute right-1 top-0.5 w-2 h-1 bg-[#451a03]" />
          </div>
        </div>
      </div>

      {/* Accumulated 5-Minute Milestone Wax Droplets */}
      <div className="flex items-center justify-center gap-1.5 z-20 pointer-events-none mt-1">
        {Array.from({ length: 8 }).map((_, i) => {
          const isMelted = i < waxDropsCount;
          return (
            <div
              key={i}
              className={cn(
                "w-2 h-2.5 border-2 transition-all duration-300 shadow-[0_1px_0_0_#000]",
                isMelted
                  ? "bg-[#fde047] border-black shadow-[0_0_4px_#fde047]"
                  : "bg-[#2c1407]/40 border-[#542d17]/50 opacity-40"
              )}
              title={`Milestone Droplet ${i + 1} (5 mins inscribed)`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================================
   2. 1:1 HANDCRAFTED PIXEL ANTIQUE MEDIEVAL SAND HOURGLASS (OLD DESIGN)
   ===================================================================== */
function PixelHourglass({
  isRunning,
  progressPct,
}: {
  isRunning: boolean;
  progressPct: number;
}) {
  const [sandTick, setSandTick] = useState(0);

  // Animate falling sand particle stream (4-frame cycle)
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSandTick((prev) => (prev + 1) % 4);
    }, 120);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Sand level percentages (0 to 1)
  const topSandPct = Math.max(0, 1 - progressPct);
  const bottomSandPct = Math.min(1, progressPct);

  // Heights of top & bottom sand blocks (0 to 14px and 0 to 13px)
  const topSandH = Math.round(topSandPct * 14);
  const bottomSandH = Math.round(bottomSandPct * 13);

  return (
    <div className="relative flex flex-col items-center justify-center h-40 w-32 select-none py-1">
      {/* Handcrafted Pixel Antique Medieval Hourglass */}
      <div className="relative flex items-center justify-center z-10">
        <svg
          viewBox="0 0 44 60"
          fill="none"
          className="w-20 h-28 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
          style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
        >
          {/* ================= 1. TOP CARVED WALNUT & BRONZE CAP ================= */}
          {/* Top Walnut Cap Upper Bevel */}
          <rect x="10" y="2" width="24" height="1" fill="#854d0e" />
          <rect x="8" y="3" width="28" height="2" fill="#54280e" />
          <rect x="6" y="5" width="32" height="2" fill="#3a1a08" />
          {/* Top Inlaid Brass Plate */}
          <rect x="7" y="7" width="30" height="1" fill="#d97706" />
          <rect x="8" y="8" width="28" height="1" fill="#1c0a04" />

          {/* ================= 2. LEFT & RIGHT TURNED BRASS SUPPORT PILLARS ================= */}
          {/* Left Pillar: Top Finial Joint */}
          <rect x="4" y="6" width="3" height="2" fill="#f59e0b" />
          <rect x="4" y="8" width="3" height="1" fill="#b45309" />
          {/* Left Pillar: Turned Wood Shaft */}
          <rect x="4" y="9" width="3" height="40" fill="#451e08" />
          <rect x="4" y="9" width="1" height="40" fill="#783d16" />
          {/* Left Pillar: Bottom Finial Joint */}
          <rect x="4" y="49" width="3" height="1" fill="#b45309" />
          <rect x="4" y="50" width="3" height="2" fill="#f59e0b" />

          {/* Right Pillar: Top Finial Joint */}
          <rect x="37" y="6" width="3" height="2" fill="#f59e0b" />
          <rect x="37" y="8" width="3" height="1" fill="#b45309" />
          {/* Right Pillar: Turned Wood Shaft */}
          <rect x="37" y="9" width="3" height="40" fill="#2d1204" />
          <rect x="39" y="9" width="1" height="40" fill="#180702" />
          {/* Right Pillar: Bottom Finial Joint */}
          <rect x="37" y="49" width="3" height="1" fill="#b45309" />
          <rect x="37" y="50" width="3" height="2" fill="#f59e0b" />

          {/* ================= 3. ANTIQUE BLOWN GLASS AMPOULE (UPPER BULB) ================= */}
          {/* Upper Bulb Black-Charcoal Antique Glass Outline */}
          <rect x="11" y="9" width="22" height="2" fill="#1c0a04" />
          <rect x="9" y="11" width="26" height="3" fill="#1c0a04" />
          <rect x="8" y="14" width="28" height="6" fill="#1c0a04" />
          <rect x="9" y="20" width="26" height="4" fill="#1c0a04" />
          <rect x="11" y="24" width="22" height="3" fill="#1c0a04" />
          <rect x="15" y="27" width="14" height="2" fill="#1c0a04" />

          {/* Upper Glass Translucent Antique Sepia Interior */}
          <rect x="12" y="10" width="20" height="2" fill="#ebd5ab" opacity="0.25" />
          <rect x="10" y="12" width="24" height="8" fill="#ebd5ab" opacity="0.2" />
          <rect x="11" y="20" width="22" height="4" fill="#ebd5ab" opacity="0.2" />
          <rect x="13" y="24" width="18" height="3" fill="#ebd5ab" opacity="0.2" />
          <rect x="16" y="27" width="12" height="2" fill="#ebd5ab" opacity="0.2" />

          {/* Upper Glass Crisp White Specular Highlights */}
          <rect x="13" y="11" width="5" height="1" fill="#ffffff" />
          <rect x="11" y="12" width="4" height="2" fill="#ffffff" />
          <rect x="10" y="14" width="3" height="3" fill="#ffffff" />
          <rect x="11" y="17" width="2" height="2" fill="#fdfbf7" />

          {/* ================= 4. UPPER RESERVOIR SAND MASS (DRAINING) ================= */}
          {topSandH > 0 && (
            <g>
              {/* Layered Ochre/Amber Sand Body */}
              {topSandH >= 14 && <rect x="12" y="15" width="20" height="2" fill="#b45309" />}
              {topSandH >= 11 && <rect x="13" y="17" width="18" height="3" fill="#b45309" />}
              {topSandH >= 8 && <rect x="14" y="20" width="16" height="3" fill="#b45309" />}
              {topSandH >= 5 && <rect x="16" y="23" width="12" height="3" fill="#b45309" />}
              {topSandH >= 2 && <rect x="18" y="26" width="8" height="3" fill="#b45309" />}

              {/* Upper Sand Surface Meniscus (Sunlit Gold) */}
              <rect
                x={22 - Math.min(10, Math.round(topSandPct * 10))}
                y={29 - topSandH}
                width={Math.min(20, Math.round(topSandPct * 20))}
                height="2"
                fill="#78350f"
              />
              <rect
                x="20"
                y={29 - topSandH + 1}
                width="4"
                height="1"
                fill="#451a03"
              />
              <rect
                x={22 - Math.min(8, Math.round(topSandPct * 8))}
                y={29 - topSandH + 2}
                width={Math.min(16, Math.round(topSandPct * 16))}
                height="1"
                fill="#f59e0b"
              />
              <rect
                x={22 - Math.min(5, Math.round(topSandPct * 5))}
                y={29 - topSandH + 2}
                width={Math.min(10, Math.round(topSandPct * 10))}
                height="1"
                fill="#fef08a"
              />
            </g>
          )}

          {/* ================= 5. GLASS WAIST NECK & TRICKLING SAND ================= */}
          <rect x="18" y="28" width="8" height="3" fill="#1c0a04" />
          <rect x="19" y="29" width="6" height="1" fill="#ebd5ab" opacity="0.3" />

          {/* Animated Falling Sand Stream (Golden Amber Grains) */}
          {isRunning && topSandH > 0 && (
            <g>
              <rect x="21" y="28" width="2" height="18" fill="#b45309" />
              <rect x="21" y="29" width="1" height="17" fill="#f59e0b" />

              {/* Falling Sand Sparkle Particles */}
              {sandTick === 0 && (
                <>
                  <rect x="21" y="31" width="2" height="2" fill="#fef08a" />
                  <rect x="21" y="37" width="2" height="2" fill="#ffffff" />
                  <rect x="21" y="43" width="2" height="2" fill="#fde047" />
                </>
              )}
              {sandTick === 1 && (
                <>
                  <rect x="21" y="33" width="2" height="2" fill="#ffffff" />
                  <rect x="21" y="39" width="2" height="2" fill="#fef08a" />
                  <rect x="21" y="45" width="2" height="2" fill="#f59e0b" />
                </>
              )}
              {sandTick === 2 && (
                <>
                  <rect x="21" y="30" width="2" height="2" fill="#fef08a" />
                  <rect x="21" y="35" width="2" height="2" fill="#ffffff" />
                  <rect x="21" y="41" width="2" height="2" fill="#fef08a" />
                </>
              )}
              {sandTick === 3 && (
                <>
                  <rect x="21" y="32" width="2" height="2" fill="#ffffff" />
                  <rect x="21" y="38" width="2" height="2" fill="#fde047" />
                  <rect x="21" y="44" width="2" height="2" fill="#fef08a" />
                </>
              )}
            </g>
          )}

          {/* ================= 6. ANTIQUE BLOWN GLASS AMPOULE (LOWER BULB) ================= */}
          {/* Lower Bulb Black-Charcoal Antique Glass Outline */}
          <rect x="18" y="29" width="8" height="2" fill="#1c0a04" />
          <rect x="15" y="31" width="14" height="2" fill="#1c0a04" />
          <rect x="11" y="33" width="22" height="3" fill="#1c0a04" />
          <rect x="9" y="36" width="26" height="4" fill="#1c0a04" />
          <rect x="8" y="40" width="28" height="6" fill="#1c0a04" />
          <rect x="9" y="46" width="26" height="3" fill="#1c0a04" />
          <rect x="11" y="49" width="22" height="2" fill="#1c0a04" />

          {/* Lower Glass Translucent Antique Sepia Interior */}
          <rect x="16" y="31" width="12" height="2" fill="#ebd5ab" opacity="0.2" />
          <rect x="13" y="33" width="18" height="3" fill="#ebd5ab" opacity="0.2" />
          <rect x="11" y="36" width="22" height="4" fill="#ebd5ab" opacity="0.2" />
          <rect x="10" y="40" width="24" height="8" fill="#ebd5ab" opacity="0.2" />
          <rect x="12" y="48" width="20" height="2" fill="#ebd5ab" opacity="0.25" />

          {/* Lower Glass Specular White Highlight */}
          <rect x="10" y="42" width="2" height="4" fill="#ffffff" />
          <rect x="11" y="46" width="2" height="2" fill="#fdfbf7" />

          {/* ================= 7. LOWER BULB SAND PYRAMID MOUND (RISING) ================= */}
          {bottomSandH > 0 && (
            <g>
              {/* Base Sand Layer */}
              <rect x="12" y="48" width="20" height="2" fill="#78350f" />
              <rect x="11" y="47" width="22" height="2" fill="#b45309" />

              {bottomSandH >= 3 && <rect x="10" y="45" width="24" height="2" fill="#b45309" />}
              {bottomSandH >= 6 && <rect x="12" y="42" width="20" height="3" fill="#b45309" />}
              {bottomSandH >= 9 && <rect x="14" y="39" width="16" height="3" fill="#b45309" />}
              {bottomSandH >= 12 && <rect x="17" y="36" width="10" height="3" fill="#b45309" />}

              {/* Peak Cone of Sand Mound */}
              <rect
                x={22 - Math.min(6, Math.round(bottomSandPct * 6))}
                y={49 - bottomSandH}
                width={Math.min(12, Math.round(bottomSandPct * 12))}
                height="2"
                fill="#f59e0b"
              />
              <rect
                x="20"
                y={49 - bottomSandH}
                width="4"
                height="1"
                fill="#fef08a"
              />

              {/* Sand Splashes on Mound Peak */}
              {isRunning && topSandH > 0 && (
                <g>
                  <rect x="19" y={48 - bottomSandH} width="1" height="1" fill="#fef08a" />
                  <rect x="24" y={48 - bottomSandH} width="1" height="1" fill="#fef08a" />
                </g>
              )}
            </g>
          )}

          {/* ================= 8. BOTTOM CARVED WALNUT & BRONZE PEDESTAL ================= */}
          {/* Bottom Inlaid Brass Plate */}
          <rect x="8" y="50" width="28" height="1" fill="#1c0a04" />
          <rect x="7" y="51" width="30" height="1" fill="#d97706" />
          {/* Bottom Walnut Cap Bevel */}
          <rect x="6" y="52" width="32" height="2" fill="#3a1a08" />
          <rect x="8" y="54" width="28" height="2" fill="#54280e" />
          <rect x="10" y="56" width="24" height="1" fill="#291505" />
        </svg>
      </div>
    </div>
  );
}

/* =====================================================================
   3. 1:1 PIXEL-PERFECT HANDCRAFTED FEATHER QUILL IN INKWELL (USER REFERENCE)
   ===================================================================== */
function PixelQuillAndInkpot({ isRunning }: { isRunning: boolean }) {
  const [writeTick, setWriteTick] = useState(0);

  // Scribing stroke tick animation cycle when running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setWriteTick((prev) => (prev + 1) % 4);
    }, 160);
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="relative flex items-center justify-center select-none pointer-events-none shrink-0 py-1">
      {isRunning ? (
        /* ================= 1. ACTIVE SCRIBING / WRITING MODE (LEFT IMAGE) ================= */
        <div className="relative flex items-center justify-center w-24 h-20">
          <svg
            viewBox="0 0 48 40"
            fill="none"
            className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
            style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
          >
            {/* Dark Inkpot Bottle on Right */}
            {/* Cork Stopper */}
            <rect x="33" y="20" width="8" height="1" fill="#f59e0b" />
            <rect x="32" y="21" width="10" height="3" fill="#d97706" />
            <rect x="32" y="24" width="10" height="1" fill="#78350f" />
            <rect x="31" y="20" width="1" height="5" fill="#000000" />
            <rect x="42" y="20" width="1" height="5" fill="#000000" />
            <rect x="32" y="19" width="10" height="1" fill="#000000" />

            {/* Inkpot Glass Body */}
            <rect x="30" y="25" width="14" height="2" fill="#000000" />
            <rect x="29" y="27" width="16" height="8" fill="#18181b" />
            <rect x="30" y="35" width="14" height="1" fill="#09090b" />
            <rect x="28" y="27" width="1" height="8" fill="#000000" />
            <rect x="45" y="27" width="1" height="8" fill="#000000" />
            <rect x="29" y="36" width="16" height="1" fill="#000000" />

            {/* Specular White Glint Reflection */}
            <rect x="31" y="28" width="2" height="5" fill="#ffffff" />
            <rect x="32" y="27" width="1" height="1" fill="#ffffff" />
            <rect x="31" y="33" width="1" height="1" fill="#a1a1aa" />
            <rect x="40" y="28" width="4" height="7" fill="#09090b" />
            <rect x="36" y="28" width="4" height="7" fill="#27272a" />

            {/* Diagonally Angled White Feather Quill (Active Scribing) */}
            <g
              style={{
                transformOrigin: "8px 34px",
                transform:
                  writeTick === 0
                    ? "translate(0px, 0px) rotate(0deg)"
                    : writeTick === 1
                    ? "translate(2px, -1px) rotate(3deg)"
                    : writeTick === 2
                    ? "translate(4px, -2px) rotate(6deg)"
                    : "translate(1px, 0px) rotate(2deg)",
                transition: "transform 0.15s ease-out",
              }}
            >
              {/* Quill Nib */}
              <rect x="6" y="34" width="2" height="3" fill="#000000" />
              <rect x="7" y="33" width="2" height="2" fill="#52525b" />
              <rect x="8" y="31" width="2" height="3" fill="#d4d4d8" />
              <rect x="7" y="35" width="1" height="2" fill="#18181b" />

              {/* Feather Stem / Shaft */}
              <rect x="5" y="33" width="1" height="3" fill="#000000" />
              <rect x="9" y="30" width="1" height="3" fill="#000000" />

              {/* Outer Black Pixel Outline of White Feather */}
              <rect x="9" y="27" width="2" height="4" fill="#000000" />
              <rect x="10" y="24" width="2" height="4" fill="#000000" />
              <rect x="11" y="21" width="2" height="4" fill="#000000" />
              <rect x="12" y="17" width="2" height="5" fill="#000000" />
              <rect x="13" y="14" width="2" height="4" fill="#000000" />
              <rect x="15" y="10" width="2" height="5" fill="#000000" />
              <rect x="17" y="7" width="2" height="4" fill="#000000" />
              <rect x="19" y="4" width="2" height="4" fill="#000000" />
              <rect x="21" y="2" width="2" height="3" fill="#000000" />
              <rect x="23" y="1" width="2" height="2" fill="#000000" />

              <rect x="24" y="2" width="2" height="3" fill="#000000" />
              <rect x="24" y="5" width="2" height="4" fill="#000000" />
              <rect x="23" y="9" width="2" height="5" fill="#000000" />
              <rect x="21" y="14" width="2" height="5" fill="#000000" />
              <rect x="19" y="19" width="2" height="5" fill="#000000" />
              <rect x="17" y="24" width="2" height="4" fill="#000000" />
              <rect x="14" y="28" width="2" height="3" fill="#000000" />
              <rect x="11" y="30" width="2" height="2" fill="#000000" />

              {/* White Feather Vanes Fill */}
              <rect x="11" y="25" width="4" height="3" fill="#ffffff" />
              <rect x="12" y="21" width="6" height="4" fill="#ffffff" />
              <rect x="13" y="17" width="7" height="4" fill="#ffffff" />
              <rect x="15" y="13" width="7" height="4" fill="#ffffff" />
              <rect x="17" y="9" width="7" height="4" fill="#ffffff" />
              <rect x="19" y="5" width="5" height="4" fill="#ffffff" />
              <rect x="21" y="3" width="3" height="2" fill="#ffffff" />

              {/* Shading Gray Barbs */}
              <rect x="14" y="24" width="2" height="4" fill="#e4e4e7" />
              <rect x="16" y="20" width="2" height="4" fill="#e4e4e7" />
              <rect x="18" y="15" width="2" height="5" fill="#d4d4d8" />
              <rect x="20" y="10" width="2" height="5" fill="#d4d4d8" />
              <rect x="22" y="6" width="2" height="4" fill="#a1a1aa" />

              {/* Central Rachis Shaft Spine */}
              <rect x="10" y="27" width="1" height="4" fill="#d4d4d8" />
              <rect x="12" y="23" width="1" height="4" fill="#d4d4d8" />
              <rect x="14" y="18" width="1" height="5" fill="#d4d4d8" />
              <rect x="16" y="13" width="1" height="5" fill="#d4d4d8" />
              <rect x="18" y="8" width="1" height="5" fill="#d4d4d8" />
              <rect x="20" y="4" width="1" height="4" fill="#d4d4d8" />
            </g>

            {/* Scribing Ink Rune Sparkle Trail at Nib */}
            <rect x="4" y="36" width="2" height="1" fill="#b45309" />
            <rect x="2" y="37" width="3" height="1" fill="#78350f" />
            {writeTick % 2 === 0 && (
              <rect x="7" y="37" width="1" height="1" fill="#fef08a" />
            )}
            {writeTick % 2 === 1 && (
              <rect x="5" y="35" width="1" height="1" fill="#f59e0b" />
            )}
          </svg>
        </div>
      ) : (
        /* ================= 2. RESTING MODE IN INKWELL (RIGHT IMAGE) ================= */
        <div className="relative flex items-center justify-center w-20 h-20">
          <svg
            viewBox="0 0 32 40"
            fill="none"
            className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
            style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
          >
            {/* Inkpot Body (Dark Purple / Violet Tint with Cork) */}
            {/* Cork Collar */}
            <rect x="11" y="22" width="10" height="1" fill="#f59e0b" />
            <rect x="10" y="23" width="12" height="3" fill="#b45309" />
            <rect x="10" y="26" width="12" height="1" fill="#78350f" />
            <rect x="9" y="22" width="1" height="5" fill="#000000" />
            <rect x="22" y="22" width="1" height="5" fill="#000000" />
            <rect x="10" y="21" width="12" height="1" fill="#000000" />

            {/* Inkwell Bottle Base */}
            <rect x="8" y="27" width="16" height="2" fill="#000000" />
            <rect x="7" y="29" width="18" height="8" fill="#1e102e" />
            <rect x="8" y="37" width="16" height="1" fill="#0e0717" />
            <rect x="6" y="29" width="1" height="8" fill="#000000" />
            <rect x="25" y="29" width="1" height="8" fill="#000000" />
            <rect x="7" y="38" width="18" height="1" fill="#000000" />

            {/* Lavender / Purple Glass Facet & Glint */}
            <rect x="9" y="30" width="3" height="5" fill="#d8b4fe" />
            <rect x="12" y="30" width="2" height="2" fill="#c084fc" />
            <rect x="9" y="35" width="2" height="1" fill="#a855f7" />
            <rect x="15" y="30" width="5" height="7" fill="#2e1065" />
            <rect x="20" y="30" width="4" height="7" fill="#0e0717" />

            {/* Upright White Feather Quill in Inkwell */}
            {/* Quill Shaft in Neck */}
            <rect x="15" y="19" width="2" height="4" fill="#000000" />
            <rect x="15" y="20" width="1" height="3" fill="#d4d4d8" />

            {/* Left Vane Lobes */}
            <rect x="13" y="17" width="2" height="3" fill="#000000" />
            <rect x="11" y="15" width="3" height="3" fill="#000000" />
            <rect x="10" y="12" width="3" height="4" fill="#000000" />
            <rect x="11" y="9" width="3" height="4" fill="#000000" />
            <rect x="12" y="6" width="3" height="4" fill="#000000" />
            <rect x="14" y="4" width="2" height="3" fill="#000000" />

            {/* Apex Tip */}
            <rect x="15" y="3" width="2" height="2" fill="#000000" />

            {/* Right Vane Lobes */}
            <rect x="17" y="4" width="2" height="3" fill="#000000" />
            <rect x="18" y="7" width="3" height="4" fill="#000000" />
            <rect x="19" y="11" width="3" height="4" fill="#000000" />
            <rect x="18" y="15" width="3" height="3" fill="#000000" />
            <rect x="16" y="17" width="2" height="3" fill="#000000" />

            {/* Feather White Body Fill */}
            <rect x="13" y="6" width="5" height="12" fill="#ffffff" />
            <rect x="12" y="8" width="2" height="8" fill="#ffffff" />
            <rect x="17" y="9" width="3" height="7" fill="#ffffff" />

            {/* Silver-Gray Texture Barbs */}
            <rect x="16" y="8" width="2" height="4" fill="#e4e4e7" />
            <rect x="17" y="12" width="2" height="4" fill="#d4d4d8" />
            <rect x="15" y="14" width="1" height="4" fill="#a1a1aa" />

            {/* Central Spine */}
            <rect x="15" y="5" width="1" height="14" fill="#d4d4d8" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   4. CITADEL RED WAX SEAL RITE CELEBRATION BADGE
   ===================================================================== */
function CitadelWaxSealStamp() {
  return (
    <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-30 animate-in zoom-in-90 fade-in duration-300">
      <div className="relative flex flex-col items-center justify-center p-6 bg-[#2c120c] border-4 border-[#140804] text-center space-y-3 shadow-[0_16px_32px_rgba(0,0,0,0.9)] max-w-sm mx-4">
        {/* Glowing Citadel Red Wax Seal */}
        <div className="w-18 h-18 bg-[#991b1b] border-4 border-[#7f1d1d] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.7),inset_2px_2px_0_#ef4444] animate-bounce">
          <div className="w-12 h-12 border-2 border-dashed border-[#fecaca] rounded-full flex items-center justify-center">
            <PixelWaxSealIcon className="w-7 h-7 text-[#fecaca]" />
          </div>
        </div>

        <div>
          <span className="font-pixel text-xs text-[#f59e0b] uppercase tracking-widest block font-bold">
            ✦ RITE INSCRIBED ✦
          </span>
          <h3 className="font-pixel text-base sm:text-lg font-bold text-[#fef08a] mt-0.5">
            Citadel Scribe Seal Affixed!
          </h3>
          <p className="font-sans text-xs text-slate-300 mt-1">
            Focus session completed. Bounties & attributes permanently recorded in the grand archives.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   5. MAIN SCRIPTORIUM OPEN GRIMOIRE FOCUS ENGINE
   ===================================================================== */
export const PomodoroTimer: React.FC<{ className?: string }> = ({ className = "" }) => {
  const {
    mode,
    status,
    timeLeft,
    totalDuration,
    completedCycles,
    selectedCategory,
    linkedHabitName,
    isArchivistMode,
    sessionIntent,
    chronometerType,
    customTomes,
    selectedTomeId,
    toggleArchivistMode,
    setChronometerType,
    setMode,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    tick,
  } = useLearningStore();

  const activeTome = customTomes.find((t) => t.id === selectedTomeId);

  const [showCompletionSeal, setShowCompletionSeal] = useState(false);

  // Watch for session completion to trigger celebratory wax seal stamp
  useEffect(() => {
    if (status === "COMPLETED") {
      setShowCompletionSeal(true);
      const timer = setTimeout(() => setShowCompletionSeal(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Tick timer every second when RUNNING
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (status === "RUNNING") {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, tick]);

  // Format time as MM:SS with strict tabular font layout
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  const elapsedSeconds = totalDuration - timeLeft;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const waxDropsCount = Math.min(8, Math.floor(elapsedMinutes / 5));

  const progressPct = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const isBreak = mode === "SHORT_BREAK" || mode === "LONG_BREAK";

  return (
    <div
      className={cn(
        "relative select-none text-slate-900 transition-all duration-300",
        isArchivistMode && "ring-4 ring-[#f59e0b] shadow-[0_0_50px_rgba(245,158,11,0.35)]",
        className
      )}
    >
      {/* Optional Completion Wax Seal Modal */}
      {showCompletionSeal && <CitadelWaxSealStamp />}

      {/* =========================================================
          TOP SILK RIBBON BOOKMARK TABS (UNIFORM NON-OVERLAPPING TOOLBAR)
          ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 sm:px-2 mb-3 relative z-20">
        {/* Left Bookmark Ribbon Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Scholar Focus Ribbon */}
          <button
            type="button"
            onClick={() => {
              playUIMenuSFX("confirm");
              setMode("FOCUS");
            }}
            className={cn(
              "h-10 sm:h-11 px-3.5 text-xs sm:text-sm font-pixel font-bold border-2 transition-all cursor-pointer flex items-center gap-2 shadow-[0_3px_0_0_#000] shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]",
              mode === "FOCUS"
                ? "bg-[#ecd9bd] text-[#2c1407] border-[#8a4e1d] shadow-[0_3px_0_0_#451a03] font-extrabold ring-1 ring-[#f59e0b]"
                : "bg-[#251006] text-[#fde68a] border-[#542d17] hover:bg-[#3b190a] hover:text-white hover:border-[#8a4e1d]"
            )}
          >
            <PixelBookIcon className="w-4 h-4 text-[#d97706] shrink-0" />
            <span>Scholar Focus</span>
            <span
              className={cn(
                "font-mono text-xs font-bold px-1.5 py-0.5 border shrink-0",
                mode === "FOCUS"
                  ? "bg-[#2c1407]/15 border-[#8a4e1d]/40 text-[#2c1407]"
                  : "bg-[#120602] border-[#542d17] text-[#fbbf24]"
              )}
            >
              25m
            </span>
          </button>

          {/* 2. Short Respite Ribbon */}
          <button
            type="button"
            onClick={() => {
              playUIMenuSFX("confirm");
              setMode("SHORT_BREAK");
            }}
            className={cn(
              "h-10 sm:h-11 px-3.5 text-xs sm:text-sm font-pixel font-bold border-2 transition-all cursor-pointer flex items-center gap-2 shadow-[0_3px_0_0_#000] shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]",
              mode === "SHORT_BREAK"
                ? "bg-[#ecd9bd] text-[#064e3b] border-[#10b981] shadow-[0_3px_0_0_#064e3b] font-extrabold ring-1 ring-[#34d399]"
                : "bg-[#0f1f17] text-[#a7f3d0] border-[#1e3a2b] hover:bg-[#193326] hover:text-white hover:border-[#10b981]"
            )}
          >
            <PixelTeacupIcon className="w-4 h-4 text-[#10b981] shrink-0" />
            <span>Short Respite</span>
            <span
              className={cn(
                "font-mono text-xs font-bold px-1.5 py-0.5 border shrink-0",
                mode === "SHORT_BREAK"
                  ? "bg-[#064e3b]/15 border-[#10b981]/40 text-[#064e3b]"
                  : "bg-[#08120d] border-[#1e3a2b] text-[#34d399]"
              )}
            >
              5m
            </span>
          </button>

          {/* 3. Grand Rest Ribbon */}
          <button
            type="button"
            onClick={() => {
              playUIMenuSFX("confirm");
              setMode("LONG_BREAK");
            }}
            className={cn(
              "h-10 sm:h-11 px-3.5 text-xs sm:text-sm font-pixel font-bold border-2 transition-all cursor-pointer flex items-center gap-2 shadow-[0_3px_0_0_#000] shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]",
              mode === "LONG_BREAK"
                ? "bg-[#ecd9bd] text-[#581c87] border-[#a855f7] shadow-[0_3px_0_0_#581c87] font-extrabold ring-1 ring-[#c084fc]"
                : "bg-[#1c0c29] text-[#e9d5ff] border-[#401a5c] hover:bg-[#2e1342] hover:text-white hover:border-[#a855f7]"
            )}
          >
            <PixelSparklesIcon className="w-4 h-4 text-[#a855f7] shrink-0" />
            <span>Grand Rest</span>
            <span
              className={cn(
                "font-mono text-xs font-bold px-1.5 py-0.5 border shrink-0",
                mode === "LONG_BREAK"
                  ? "bg-[#581c87]/15 border-[#a855f7]/40 text-[#581c87]"
                  : "bg-[#0f0517] border-[#401a5c] text-[#c084fc]"
              )}
            >
              15m
            </span>
          </button>
        </div>

        {/* Right Archivist Strict Mode & Rites Counters */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleArchivistMode}
            className={cn(
              "h-10 sm:h-11 px-3.5 text-xs sm:text-sm font-pixel font-bold border-2 flex items-center gap-2 transition-all cursor-pointer shadow-[0_3px_0_0_#000] shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]",
              isArchivistMode
                ? "bg-[#f59e0b] text-[#1a0c05] border-[#fde047] ring-1 ring-[#fde047]"
                : "bg-[#251006] text-[#fde047] border-[#542d17] hover:bg-[#3b190a] hover:border-[#f59e0b]"
            )}
            title="Toggle Strict Archivist Sanctuary (Dim background distractions)"
          >
            {isArchivistMode ? (
              <PixelEyeOffIcon className="w-4 h-4 text-black shrink-0" />
            ) : (
              <PixelEyeIcon className="w-4 h-4 text-[#fbbf24] shrink-0" />
            )}
            <span>{isArchivistMode ? "Archivist Active" : "Archivist Mode"}</span>
          </button>

          <div className="h-10 sm:h-11 px-3.5 inline-flex items-center gap-1.5 bg-[#251006] text-[#fef08a] border-2 border-[#542d17] text-xs sm:text-sm font-pixel font-bold shrink-0 shadow-[0_3px_0_0_#000] whitespace-nowrap">
            <PixelFlameIcon className="w-4 h-4 text-[#f59e0b] shrink-0" />
            <span><NumberTicker value={completedCycles} /> Rites</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          GRAND OPEN GRIMOIRE SPREAD (LEATHER HARDCOVER & PARCHMENT)
          ========================================================= */}
      <div className="relative bg-[#2c120c] border-4 border-[#180804] p-3 sm:p-4 shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
        {/* 4 Beveled Gold Corner Brackets */}
        <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-[#f59e0b] pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-[#f59e0b] pointer-events-none" />

        {/* Parchment Book Pages Double-Spread Layout with High-Res Aged Texture */}
        <div
          className="relative bg-[#ebd5ab] text-[#231006] border-2 border-[#4a1f0a] shadow-[0_0_0_1px_#1c0a04,0_6px_16px_rgba(0,0,0,0.8),inset_0_0_32px_rgba(45,18,7,0.75),inset_0_0_12px_rgba(20,6,2,0.95)] grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden"
          style={{
            backgroundImage: `url('/textures/ancient_parchment.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Multiply Sun-Bleached & Tea-Stained Tint Overlay */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-55"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(254, 243, 199, 0.45) 0%, rgba(217, 119, 6, 0.18) 60%, rgba(69, 26, 3, 0.5) 100%)`,
            }}
          />



          {/* Faded Water Rings & Foxing Drops */}
          <div className="absolute top-3 right-6 w-20 h-20 pointer-events-none opacity-20">
            <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
              <circle cx="32" cy="32" r="26" stroke="#4a1f0a" strokeWidth="2.5" strokeDasharray="6 3 12 2" />
              <circle cx="32" cy="32" r="24" stroke="#78350f" strokeWidth="1.2" opacity="0.6" />
            </svg>
          </div>

          {/* =========================================================
              LEFT PAGE: THE SCHOLAR'S ALTAR (CANDLE / HOURGLASS)
              ========================================================= */}
          <div className="md:col-span-4 p-5 sm:p-6 flex flex-col items-center justify-between border-b-2 md:border-b-0 md:border-r-2 border-[#5c2b10]/60 relative z-10">
            {/* Left Page Heading & Chronometer Selector */}
            <div className="w-full text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setChronometerType("CANDLE")}
                  className={cn(
                    "px-3 py-1 text-xs font-pixel font-bold border transition-colors cursor-pointer shadow-[0_1px_0_0_#000] inline-flex items-center gap-1.5",
                    chronometerType === "CANDLE"
                      ? "bg-[#854d0e] text-[#fef08a] border-[#b45309]"
                      : "bg-[#dfca9f] text-[#5c2f10] border-[#9c693b]/60 hover:bg-[#caa97e]"
                  )}
                >
                  <PixelFlameIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Candle</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChronometerType("HOURGLASS")}
                  className={cn(
                    "px-3 py-1 text-xs font-pixel font-bold border transition-colors cursor-pointer shadow-[0_1px_0_0_#000] inline-flex items-center gap-1.5",
                    chronometerType === "HOURGLASS"
                      ? "bg-[#854d0e] text-[#fef08a] border-[#b45309]"
                      : "bg-[#dfca9f] text-[#5c2f10] border-[#9c693b]/60 hover:bg-[#caa97e]"
                  )}
                >
                  <PixelHourglassIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hourglass</span>
                </button>
              </div>

              <span className="font-pixel text-sm sm:text-base font-bold text-[#2b1408] block">
                {isBreak
                  ? "Respite Sanctuary"
                  : chronometerType === "CANDLE"
                  ? "Scholar's Wax Dial"
                  : "Celestial Astrolabe"}
              </span>
            </div>

            {/* Visualizer Stage (Candle or Hourglass) */}
            <div className="my-2 flex flex-col items-center justify-center p-3 bg-[#dfca9f]/60 border border-[#9c693b]/50 shadow-[inset_1px_1px_0_0_#fdf6e7] w-full max-w-[210px]">
              {chronometerType === "CANDLE" ? (
                <PixelCandle
                  isRunning={status === "RUNNING"}
                  progressPct={progressPct}
                  waxDropsCount={waxDropsCount}
                />
              ) : (
                <PixelHourglass isRunning={status === "RUNNING"} progressPct={progressPct} />
              )}

              <div className="flex flex-col items-center mt-2 space-y-0.5">
                <span className="text-xs sm:text-sm font-mono text-[#78350f] font-bold">
                  {chronometerType === "CANDLE"
                    ? `${waxDropsCount} / 8 Droplets Melted`
                    : `${Math.round(progressPct * 100)}% Sand Trickled`}
                </span>
                <span className="text-xs font-pixel text-[#92400e] font-bold">
                  {Math.round(progressPct * 100)}% Consumed
                </span>
              </div>
            </div>

            {/* Altar Motto Ribbon */}
            <div className="w-full text-center py-2 px-2 bg-[#dfca9f]/80 border-t border-[#9c693b]/40 text-xs font-pixel text-[#5c2f10] font-bold">
              {status === "RUNNING"
                ? "Flame Illuminates the Mind"
                : "Inscribe Rite to Ignite Focus"}
            </div>
          </div>

          {/* =========================================================
              CENTER SPINE BINDING CREASE
              ========================================================= */}
          <div className="hidden md:block absolute left-4/12 top-0 bottom-0 w-2.5 -ml-1.25 bg-gradient-to-r from-[#b39968]/40 via-[#4a2f17]/60 to-[#b39968]/40 pointer-events-none z-10" />

          {/* =========================================================
              RIGHT PAGE: SCRIBE DIAL, DIGITS & ACTIONS
              ========================================================= */}
          <div className="md:col-span-8 p-5 sm:p-7 flex flex-col justify-between space-y-4 relative">
            {/* Header: Domain Sphere & Scribe Intent */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#9c693b]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 bg-[#381a0c] text-[#fef08a] font-pixel font-bold text-sm flex items-center justify-center border border-[#854d0e] shadow-[0_1px_0_0_#000]">
                  {selectedCategory[0]}
                </span>
                <div>
                  <span className="text-sm sm:text-base font-pixel font-bold text-[#451f08] uppercase tracking-wider flex items-center gap-2">
                    <span>Domain: {selectedCategory}</span>
                    {activeTome && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#f59e0b] text-[#1a0c05] font-pixel font-bold border border-[#fde047]">
                        ✦ {activeTome.statBonus.slice(0, 3)}
                      </span>
                    )}
                  </span>
                  <span className="text-xs sm:text-sm font-sans font-bold text-[#78350f] block mt-0.5">
                    {activeTome
                      ? `Bound Study Tome: "${activeTome.title}"`
                      : linkedHabitName
                      ? `Inscribed to Quest: "${linkedHabitName}"`
                      : sessionIntent
                      ? `Objective: "${sessionIntent}"`
                      : "General Scriptorium Rite"}
                  </span>
                </div>
              </div>

              {/* Handcrafted Feather Quill & Brass Inkwell */}
              <PixelQuillAndInkpot isRunning={status === "RUNNING"} />
            </div>

            {/* Center Stage: Retro Pixel Digital Timer */}
            <div className="flex flex-col items-center justify-center text-center py-2 space-y-2">
              <div 
                className="flex items-center justify-center font-pixel-chunky font-bold text-6xl sm:text-7xl md:text-8xl tracking-wider text-[#1c0d05] drop-shadow-[0_2px_0_rgba(255,255,255,0.75)] tabular-nums select-none"
                style={{ fontFamily: "'Jersey 10', monospace" }}
              >
                <span className="tracking-wider">{formattedMinutes}</span>
                <div className="flex flex-col items-center justify-center gap-2 sm:gap-2.5 mx-3 sm:mx-4 shrink-0">
                  <span className={cn("w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 bg-[#5c280b] shadow-[0_1px_0_rgba(255,255,255,0.4)] shrink-0", status === "RUNNING" && "animate-pulse")} />
                  <span className={cn("w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 bg-[#5c280b] shadow-[0_1px_0_rgba(255,255,255,0.4)] shrink-0", status === "RUNNING" && "animate-pulse")} />
                </div>
                <span className="tracking-wider">{formattedSeconds}</span>
              </div>

              {/* Sub-Timer Intent Notice */}
              <div className="text-xs sm:text-sm font-sans font-bold text-[#78350f]">
                {status === "RUNNING" ? (
                  <span className="text-[#047857] flex items-center gap-1.5 justify-center">
                    <PixelQuillIcon className="w-4 h-4 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-bounce" /> Deep Scribing State Active
                  </span>
                ) : status === "PAUSED" ? (
                  <span className="text-[#b45309]">Scribe Rite Paused • Quill at Rest</span>
                ) : (
                  <span className="text-[#854d0e]">Ready to inscribe session into the Citadel Ledger</span>
                )}
              </div>

              {/* Inlaid Gilded Progress Bar */}
              <div className="w-full max-w-md pt-2">
                <PixelProgress
                  value={Math.round(progressPct * 100)}
                  max={100}
                  variant={isBreak ? "success" : "gold"}
                  height="md"
                />
              </div>
            </div>

            {/* Action Action Pixel Buttons */}
            <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto pt-1">
              {/* Reset Button */}
              <PixelButton
                type="button"
                variant="dark"
                size="md"
                onClick={() => {
                  playUIMenuSFX("confirm");
                  resetTimer();
                }}
                className="w-12 h-12 flex items-center justify-center cursor-pointer shadow-[0_3px_0_0_#000] group"
                title="Reset Scribe Rite"
              >
                <PixelRefreshIcon className="w-5 h-5 text-[#fbbf24] group-hover:text-[#ef4444] transition-colors" />
              </PixelButton>

              {/* Main Play / Pause Button */}
              {status === "RUNNING" ? (
                <PixelButton
                  type="button"
                  variant="gold"
                  size="lg"
                  onClick={pauseTimer}
                  className="flex-1 h-13 text-sm sm:text-base font-pixel font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_3px_0_0_#000]"
                >
                  <PixelPauseIcon className="w-5 h-5 fill-current" />
                  Pause Scribe Rite
                </PixelButton>
              ) : (
                <PixelButton
                  type="button"
                  variant={isBreak ? "success" : "gold"}
                  size="lg"
                  onClick={() => {
                    playBuffSFX("buff");
                    if (status === "PAUSED") resumeTimer();
                    else startTimer();
                  }}
                  className="flex-1 h-13 text-sm sm:text-base font-pixel font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_3px_0_0_#000]"
                >
                  <PixelPlayIcon className="w-5 h-5 fill-current" />
                  {status === "PAUSED" ? "Resume Scribe Rite" : "Begin Scribe Rite"}
                </PixelButton>
              )}

              {/* Skip Phase Button */}
              <PixelButton
                type="button"
                variant="dark"
                size="md"
                onClick={() => {
                  playUIMenuSFX("confirm");
                  skipTimer();
                }}
                className="w-12 h-12 flex items-center justify-center cursor-pointer shadow-[0_3px_0_0_#000] group"
                title="Skip to Next Phase"
              >
                <PixelSkipForwardIcon className="w-5 h-5 text-[#fbbf24] group-hover:text-white transition-colors" />
              </PixelButton>
            </div>

            {/* Bottom Margin Ledger: Predicted Scribe Bounties */}
            {!isArchivistMode && (
              <div className="pt-3 border-t border-[#9c693b]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-pixel text-xs sm:text-sm text-[#3a1d0b]">
                <div className="flex items-center gap-1.5 font-bold text-[#78350f]">
                  <PixelAwardIcon className="w-4 h-4 text-[#d97706]" />
                  <span>Citadel Scribe Bounty:</span>
                </div>
                <div className="flex items-center gap-3.5 font-bold font-mono text-xs sm:text-sm flex-wrap">
                  <span className="text-[#0369a1]">+0.4 FOC</span>
                  <span className="text-[#7e22ce]">+0.4 KNO</span>
                  <span className="text-[#b45309]">+0.3 DIS</span>
                  <span className="text-[#047857]">+75 EXP</span>
                  <span className="text-[#a16207]">+25 Gold</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
