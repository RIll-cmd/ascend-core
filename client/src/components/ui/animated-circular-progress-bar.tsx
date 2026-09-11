"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface AnimatedCircularProgressBarProps {
  max?: number;
  min?: number;
  value: number;
  gaugePrimaryColor: string;
  gaugeSecondaryColor: string;
  className?: string;
  children?: React.ReactNode;
  showValue?: boolean;
}

export function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
  children,
  showValue = true,
}: AnimatedCircularProgressBarProps) {
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;
  const clampedValue = Math.min(Math.max(value, min), max);
  const currentPercent = Math.round(((clampedValue - min) / (max - min)) * 100);

  return (
    <div
      className={cn("relative size-24 flex items-center justify-center font-semibold select-none", className)}
      style={
        {
          "--circle-size": "100%",
          "--circumference": `${circumference}`,
          "--percent-to-px": `${percentPx}px`,
          "--gap-percent": "5",
          "--offset-factor": "0",
          "--transition-length": "1s",
          "--transition-step": "200ms",
          "--delay": "0s",
          "--percent-to-deg": "3.6deg",
          transform: "translateZ(0)",
        } as React.CSSProperties
      }
    >
      <svg
        fill="none"
        className="size-full overflow-visible"
        strokeWidth="2"
        viewBox="0 0 100 100"
      >
        {/* Background track circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="8"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
          style={
            {
              stroke: gaugeSecondaryColor,
              strokeDasharray: `${circumference} ${circumference}`,
            } as React.CSSProperties
          }
        />
        {/* Animated active progress arc */}
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="8"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100"
          style={
            {
              stroke: gaugePrimaryColor,
              "--stroke-percent": currentPercent,
              strokeDasharray: `calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)`,
              transition:
                "var(--transition-length) ease var(--delay), stroke var(--transition-length) ease var(--delay)",
              transitionProperty: "stroke-dasharray, transform",
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {children ? (
          children
        ) : showValue ? (
          <span className="font-pixel text-xs font-bold text-amber-200">
            {currentPercent}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
