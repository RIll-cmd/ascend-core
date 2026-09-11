"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  PixelPushpinIcon,
  PixelHeartCrestIcon,
  PixelCloverCrestIcon,
  PixelAxesCrestIcon,
  PixelWingedCrestIcon,
} from "./PixelIcons";

export interface PixelScrollCardProps extends React.HTMLAttributes<HTMLDivElement> {
  rank?: "S" | "A" | "B" | "C" | "D" | "F" | string;
  isCompleted?: boolean;
  showPin?: boolean;
  showCrest?: boolean;
  missionType?: string;
  bountyType?: string;
  variant?: "default" | "completed" | "royal";
  enableSpotlight?: boolean;
}

export const PixelScrollCard: React.FC<PixelScrollCardProps> = ({
  rank = "C",
  isCompleted = false,
  showPin = true,
  showCrest = true,
  missionType,
  bountyType,
  variant = "default",
  enableSpotlight = true,
  className,
  children,
  ...props
}) => {
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableSpotlight) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    if (!enableSpotlight) return;
    setMousePos(null);
  };
  const getCrest = () => {
    switch (rank) {
      case "S":
        return <PixelWingedCrestIcon className="w-20 h-3 text-[#5c3116]/80" />;
      case "A":
        return <PixelAxesCrestIcon className="w-20 h-3 text-[#5c2424]/80" />;
      case "B":
        return <PixelCloverCrestIcon className="w-20 h-3 text-[#2d3a54]/80" />;
      case "C":
        return <PixelHeartCrestIcon className="w-20 h-3 text-[#264426]/80" />;
      case "D":
        return <PixelCloverCrestIcon className="w-20 h-3 text-[#69431e]/70" />;
      default:
        return <PixelHeartCrestIcon className="w-20 h-3 text-[#452714]/70" />;
    }
  };

  const isCompleteVariant = isCompleted || variant === "completed";

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative flex flex-col pt-3.5 pb-4 px-4 select-none transition-none group overflow-hidden",
        isCompleteVariant ? "pixel-parchment-completed" : variant === "royal" ? "pixel-parchment-royal" : "pixel-parchment",
        className
      )}
      {...props}
    >
      {/* MagicCard Subtle Amber/Leather Hover Spotlight Overlay */}
      {enableSpotlight && mousePos && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-200"
          style={{
            background: `radial-gradient(160px circle at ${mousePos.x}px ${mousePos.y}px, rgba(254, 240, 138, 0.18), rgba(217, 119, 6, 0.08), transparent 75%)`,
          }}
        />
      )}

      {/* Torn / Jagged Paper Side Cuts */}
      <div className="absolute left-[-3px] top-8 bottom-8 w-[3px] pointer-events-none flex flex-col justify-between overflow-hidden">
        <div className="w-[3px] h-2 bg-[#2b180f]" />
        <div className="w-[2px] h-3 bg-[#4a2813]" />
        <div className="w-[3px] h-1.5 bg-[#2b180f]" />
      </div>
      <div className="absolute right-[-3px] top-6 bottom-6 w-[3px] pointer-events-none flex flex-col justify-between overflow-hidden">
        <div className="w-[2px] h-2.5 bg-[#4a2813]" />
        <div className="w-[3px] h-2 bg-[#2b180f]" />
        <div className="w-[2px] h-4 bg-[#4a2813]" />
      </div>

      {/* Center Black Iron Pushpin Tack */}
      {showPin && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <PixelPushpinIcon className="w-5 h-5 drop-shadow-[0_3px_3px_rgba(0,0,0,0.6)]" />
        </div>
      )}

      {/* Mission / Directive Type Header Title */}
      {(missionType || bountyType) && (
        <div className="text-center pt-0.5 pb-1">
          <span className="font-pixel text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#331a0a] border-b-2 border-[#5c3317]/50 pb-0.5 inline-block">
            ✦ {missionType || bountyType} ✦
          </span>
        </div>
      )}

      {/* Top Sigil Crest Decoration */}
      {showCrest && (
        <div className="flex items-center justify-center my-0.5 pointer-events-none opacity-85">
          {getCrest()}
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10">{children}</div>

      {/* Bottom Ragged Torn Edge Pixel Notches with Burn Marks */}
      <div className="absolute -bottom-[4px] left-0 right-0 h-[4px] pointer-events-none flex justify-around overflow-hidden opacity-95">
        <div className="w-3 h-[4px] bg-[#241209]" />
        <div className="w-4 h-[3px] bg-[#3e2010]" />
        <div className="w-2 h-[4px] bg-[#241209]" />
        <div className="w-5 h-[3px] bg-[#4a2613]" />
        <div className="w-3 h-[4px] bg-[#241209]" />
        <div className="w-4 h-[3px] bg-[#3e2010]" />
      </div>
    </div>
  );
};

