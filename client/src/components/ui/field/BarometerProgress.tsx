"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BarometerProgressProps {
  value: number;
  max?: number;
  variant?: "emerald" | "amber" | "crimson" | "azure";
  height?: "sm" | "md" | "lg";
  showTicks?: boolean;
  className?: string;
}

export function BarometerProgress({
  value,
  max = 100,
  variant = "emerald",
  height = "md",
  showTicks = true,
  className,
}: BarometerProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  const heightStyles = {
    sm: "h-2.5",
    md: "h-4",
    lg: "h-5",
  }[height];

  const fluidStyles = {
    emerald: "bg-gradient-to-r from-[#065f46] via-[#10b981] to-[#34d399] shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    amber: "bg-gradient-to-r from-[#92400e] via-[#f59e0b] to-[#fcd34d] shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    crimson: "bg-gradient-to-r from-[#7f1d1d] via-[#dc2626] to-[#f87171] shadow-[0_0_10px_rgba(220,38,38,0.5)]",
    azure: "bg-gradient-to-r from-[#075985] via-[#0284c7] to-[#38bdf8] shadow-[0_0_10px_rgba(2,132,199,0.5)]",
  }[variant];

  return (
    <div className={cn("relative w-full select-none", className)}>
      {/* Outer Slotted Brass Sleeve */}
      <div
        className={cn(
          "w-full rounded-sm bg-[#0e0a07] border border-[#c59b27]/60 p-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] relative overflow-hidden",
          heightStyles
        )}
      >
        {/* Glass Specimen Tube Core */}
        <div className="w-full h-full rounded-xs bg-[#16100a] relative overflow-hidden">
          {/* Fluid Liquid Column */}
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out relative rounded-xs",
              fluidStyles
            )}
            style={{ width: `${percentage}%` }}
          >
            {/* Liquid Meniscus Cap */}
            <span className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/70 shadow-[0_0_4px_#fff]" />
          </div>

          {/* Glass Reflection Highlight */}
          <div className="absolute inset-0 pointer-events-none barometer-glass-glow" />

          {/* Graduation Tick Marks */}
          {showTicks && (
            <div className="absolute inset-0 pointer-events-none flex justify-between px-2">
              <span className="h-full w-[1px] bg-[#c59b27]/30" />
              <span className="h-full w-[1px] bg-[#c59b27]/30" />
              <span className="h-full w-[1px] bg-[#c59b27]/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarometerProgress;
