"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "../badge";
import "../styles/retro.css";

export interface PortalTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  travelingText?: string;
  onEnter?: () => void;
  onChooseDestination?: () => void;
  realmName?: string;
  floorLevel?: number;
}

export default function PortalTransition({
  badge = "DIMENSIONAL RIFT",
  title = "STEP INTO THE VOID PORTAL",
  description = "The astral resonance aligns. Cross the threshold into the Spire Tower of Ascension.",
  primaryLabel = "ENTER PORTAL",
  secondaryLabel = "CHANGE FLOOR",
  travelingText = "TRAVELING THROUGH ASTRAL GATEWAY...",
  realmName = "NECROMANCER'S CRYPT",
  floorLevel = 20,
  onEnter,
  onChooseDestination,
  className,
  ...props
}: PortalTransitionProps) {
  const [isTraveling, setIsTraveling] = React.useState(false);

  const handleEnter = () => {
    setIsTraveling(true);
    setTimeout(() => {
      onEnter?.();
      setIsTraveling(false);
    }, 1200);
  };

  return (
    <div
      className={cn(
        "retro relative flex w-full flex-col items-center justify-center p-6 sm:p-12 text-center bg-[#0B1020] border-2 border-[#8c7a53] shadow-[4px_4px_0_0_#000] overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Background scanline & ambient glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)]" />

      {badge && (
        <Badge variant="secondary" className="mb-4 text-[9px] py-0.5 px-2">
          {isTraveling ? "WARPING REALMS" : badge}
        </Badge>
      )}

      {/* Animated Retro Portal Ring */}
      <div className="relative my-4 flex items-center justify-center size-36 sm:size-44">
        {/* Outer rotating/pulsing ring */}
        <div
          className={cn(
            "absolute inset-0 border-4 border-dashed border-[#38bdf8] rounded-full transition-transform duration-700",
            isTraveling ? "scale-125 rotate-180 animate-spin border-amber-400" : "animate-[spin_12s_linear_infinite]"
          )}
        />
        {/* Middle ring */}
        <div
          className={cn(
            "absolute inset-3 border-2 border-double border-[#818cf8] rounded-full",
            isTraveling ? "scale-110" : "animate-[spin_8s_linear_infinite_reverse]"
          )}
        />
        {/* Core rune sphere */}
        <button
          type="button"
          onClick={handleEnter}
          disabled={isTraveling}
          aria-label="Activate portal"
          className={cn(
            "size-20 sm:size-24 rounded-full bg-[#0c1a30] border-4 border-[#38bdf8] flex flex-col items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.6)] cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95",
            isTraveling && "animate-ping bg-amber-400 border-amber-300"
          )}
        >
          <span className="retro text-2xl select-none">🌀</span>
          <span className="retro text-[7px] text-[#38bdf8] font-bold mt-1">
            F-{floorLevel}
          </span>
        </button>
      </div>

      <h2 className="retro max-w-md font-bold text-base sm:text-xl text-white tracking-wide mt-2">
        {title}
      </h2>

      <div className="retro text-[9px] text-[#f6c453] mt-1 font-bold">
        DESTINATION: {realmName} [FLOOR {floorLevel}]
      </div>

      <p className="retro max-w-sm text-slate-400 text-[8px] sm:text-[9px] leading-relaxed mt-2">
        {description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <button
          type="button"
          disabled={isTraveling}
          onClick={handleEnter}
          className="retro px-5 py-2.5 bg-[#f6c453] text-[#0B1020] font-bold text-xs border-2 border-black hover:bg-amber-300 shadow-[2px_2px_0_0_#000] cursor-pointer disabled:opacity-50 active:translate-x-[1px] active:translate-y-[1px]"
        >
          {isTraveling ? travelingText : primaryLabel}
        </button>

        {onChooseDestination && (
          <button
            type="button"
            disabled={isTraveling}
            onClick={onChooseDestination}
            className="retro px-4 py-2 bg-[#141a2e] text-slate-300 text-[9px] border-2 border-[#8c7a53] hover:text-white shadow-[1px_1px_0_0_#000] cursor-pointer"
          >
            {secondaryLabel}
          </button>
        )}
      </div>

      <p className="retro text-slate-500 text-[8px] mt-4">
        {isTraveling ? "★ TRANSCENDING REALM BARRIERS ★" : "Instantly warp between Spire floors • No cooldown"}
      </p>
    </div>
  );
}

export { PortalTransition };
