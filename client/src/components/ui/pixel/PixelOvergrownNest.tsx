"use client";

import React from "react";
import { Egg as EggIcon, Sparkles } from "lucide-react";
import { Egg } from "@/features/beasts/types/beast";

interface PixelOvergrownNestProps {
  egg: Egg | null;
  ready?: boolean;
  isHatching?: boolean;
  onSelectEggClick?: () => void;
  className?: string;
}

export const PixelOvergrownNest: React.FC<PixelOvergrownNestProps> = ({
  egg,
  ready = false,
  isHatching = false,
  onSelectEggClick,
  className = "",
}) => {
  return (
    <div
      className={`relative w-full max-w-[340px] sm:max-w-[370px] aspect-square mx-auto flex items-center justify-center select-none ${className}`}
    >
      {/* Background Layer: Foliage, supporting branch, and shaded nest hollow cup */}
      <img
        src="/beasts/pixel_overgrown_nest.png"
        alt="Overgrown pixel art aviary nest"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
        style={{ imageRendering: "pixelated" }}
        width={370}
        height={370}
      />

      {/* Atmospheric Nest Warmth Glow */}
      <div
        className={`absolute left-1/2 top-[41%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none transition-all duration-700 ${
          ready
            ? "bg-amber-300/40 blur-xl scale-125 animate-pulse"
            : egg
            ? "bg-amber-400/20 blur-lg"
            : "bg-emerald-950/20 blur-md"
        }`}
      />

      {/* Middle Layer: Incubated Egg or Cozy Empty Hollow Slot */}
      <div className="absolute left-[51.5%] top-[41%] -translate-x-1/2 -translate-y-1/2 z-[5] flex items-center justify-center">
        {egg ? (
          <div className="relative group flex items-center justify-center">
            <img
              src={egg.sprite || "/eggs/egg_1.png"}
              alt={egg.name}
              width={160}
              height={160}
              className={`w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-[0_8px_16px_rgba(15,10,5,0.7)] transition-transform duration-300 ${
                isHatching
                  ? "animate-bounce scale-110"
                  : ready
                  ? "animate-[wiggle_1.6s_ease-in-out_infinite] scale-105 cursor-pointer"
                  : "hover:scale-105"
              }`}
              style={{ imageRendering: "pixelated" }}
            />

            {/* Ready to hatch glowing aura badge */}
            {ready && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </span>
              </span>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onSelectEggClick}
            className="group flex flex-col items-center justify-center p-3.5 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            title="Place an egg in the overgrown nest"
            aria-label="Empty overgrown nest hollow. Click to visit the nursery stall."
          >
            <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-2 border-dashed border-[#8d784b]/60 group-hover:border-emerald-600 bg-amber-900/10 group-hover:bg-emerald-900/20 flex flex-col items-center justify-center transition-colors shadow-inner">
              <EggIcon className="w-7 h-7 text-[#8d784b]/70 group-hover:text-emerald-700 transition-colors" />
              <span className="text-[9px] font-pixel text-[#8d784b] group-hover:text-emerald-800 tracking-wider uppercase mt-1">
                Roost
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Foreground Layer: Front woven twig rim & overlapping bark for true 2.5D physical depth */}
      <img
        src="/beasts/pixel_overgrown_nest_foreground.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
        style={{ imageRendering: "pixelated" }}
        width={370}
        height={370}
      />

      {/* Hatching / Ready Wildflower Sparkle Particles */}
      {ready && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <span className="absolute left-[20%] top-[25%] text-xs animate-bounce opacity-85">🌸</span>
          <span className="absolute right-[22%] top-[28%] text-xs animate-[bounce_2s_infinite_0.4s] opacity-85">✨</span>
          <span className="absolute left-[30%] bottom-[20%] text-xs animate-[bounce_2.2s_infinite_0.8s] opacity-85">🌱</span>
          <span className="absolute right-[26%] bottom-[22%] text-xs animate-[bounce_1.8s_infinite_0.2s] opacity-85">🌼</span>
        </div>
      )}
    </div>
  );
};
