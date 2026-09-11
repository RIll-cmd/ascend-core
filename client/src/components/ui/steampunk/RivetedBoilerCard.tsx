"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RivetedBoilerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  titleBadge?: React.ReactNode;
  subtitle?: string;
  headerAction?: React.ReactNode;
  variant?: "default" | "copper" | "iron" | "gold" | "crimson";
  pipeHeader?: boolean;
  rivetDensity?: "low" | "high";
  children?: React.ReactNode;
}

const BOILER_THEMES = {
  default: {
    borderOuter: "border-[#140804]",
    borderInner: "border-[#542d17]",
    bracket: "border-[#f59e0b]",
    rivet: "bg-[#d97706]",
    titleText: "text-[#fef08a]",
    bg: "bg-[#1d0e07]/94",
    glow: "shadow-[0_12px_28px_rgba(0,0,0,0.9)]",
  },
  copper: {
    borderOuter: "border-[#1c0803]",
    borderInner: "border-[#78350f]",
    bracket: "border-[#ea580c]",
    rivet: "bg-[#b45309]",
    titleText: "text-[#fed7aa]",
    bg: "bg-[#1f0b04]/94",
    glow: "shadow-[0_12px_28px_rgba(0,0,0,0.9)]",
  },
  iron: {
    borderOuter: "border-[#09090b]",
    borderInner: "border-[#3f3f46]",
    bracket: "border-[#a1a1aa]",
    rivet: "bg-[#71717a]",
    titleText: "text-[#e4e4e7]",
    bg: "bg-[#121215]/94",
    glow: "shadow-[0_12px_28px_rgba(0,0,0,0.95)]",
  },
  gold: {
    borderOuter: "border-[#1c0d03]",
    borderInner: "border-[#92400e]",
    bracket: "border-[#fde047]",
    rivet: "bg-[#f59e0b]",
    titleText: "text-[#fef08a]",
    bg: "bg-[#211106]/94",
    glow: "shadow-[0_12px_32px_rgba(245,158,11,0.15)]",
  },
  crimson: {
    borderOuter: "border-[#1a0505]",
    borderInner: "border-[#7f1d1d]",
    bracket: "border-[#ef4444]",
    rivet: "bg-[#dc2626]",
    titleText: "text-[#fee2e2]",
    bg: "bg-[#1c0808]/94",
    glow: "shadow-[0_12px_32px_rgba(239,68,68,0.2)]",
  },
};

/**
 * Heavy Industrial Machined Boiler Plate Container with Brass Rivets & Beveled Brackets
 */
export function RivetedBoilerCard({
  title,
  titleBadge,
  subtitle,
  headerAction,
  variant = "default",
  pipeHeader = false,
  rivetDensity = "low",
  className,
  children,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}: RivetedBoilerCardProps) {
  const theme = BOILER_THEMES[variant] || BOILER_THEMES.default;
  const [mousePos, setMousePos] = React.useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (onMouseMove) onMouseMove(e);
  };

  return (
    <div
      onMouseMove={handlePointerMove}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (onMouseEnter) onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (onMouseLeave) onMouseLeave(e);
      }}
      className={cn(
        "relative backdrop-blur-md border-4 p-5 sm:p-7 select-none overflow-hidden group",
        theme.borderOuter,
        theme.bg,
        theme.glow,
        className
      )}
      {...props}
    >
      {/* Subtle Steampunk Amber Spotlight Glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 0.22 : 0,
          background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.4), transparent 80%)`,
        }}
      />

      {/* 4 Precision Beveled Brass Corner Brackets */}
      <div className={cn("absolute top-1 left-1 w-5 h-5 border-t-2 border-l-2 pointer-events-none z-10", theme.bracket)} />
      <div className={cn("absolute top-1 right-1 w-5 h-5 border-t-2 border-r-2 pointer-events-none z-10", theme.bracket)} />
      <div className={cn("absolute bottom-1 left-1 w-5 h-5 border-b-2 border-l-2 pointer-events-none z-10", theme.bracket)} />
      <div className={cn("absolute bottom-1 right-1 w-5 h-5 border-b-2 border-r-2 pointer-events-none z-10", theme.bracket)} />

      {/* Slotted Brass Rivets at Corners */}
      <div className={cn("absolute top-2 left-2 w-1.5 h-1.5 rounded-full border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-10", theme.rivet)} />
      <div className={cn("absolute top-2 right-2 w-1.5 h-1.5 rounded-full border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-10", theme.rivet)} />
      <div className={cn("absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-10", theme.rivet)} />
      <div className={cn("absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-10", theme.rivet)} />

      {/* Optional High-Density Midpoint Rivets */}
      {rivetDensity === "high" && (
        <>
          <div className={cn("absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none", theme.rivet)} />
          <div className={cn("absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none", theme.rivet)} />
          <div className={cn("absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none", theme.rivet)} />
          <div className={cn("absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none", theme.rivet)} />
        </>
      )}

      {/* Decorative Machined Copper Steam Conduit (Top Pipe Header) */}
      {pipeHeader && (
        <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-[#d97706] to-transparent opacity-70 pointer-events-none" />
      )}

      {/* Header if title exists */}
      {(title || titleBadge || headerAction) && (
        <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-5 border-b", theme.borderInner)}>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              {title && (
                <h3 className={cn("text-base sm:text-lg font-pixel font-bold uppercase tracking-wider drop-shadow-[0_2px_0_#000]", theme.titleText)}>
                  {title}
                </h3>
              )}
              {titleBadge && <div>{titleBadge}</div>}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm font-sans text-amber-100/80 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Card Body */}
      {children}
    </div>
  );
}
