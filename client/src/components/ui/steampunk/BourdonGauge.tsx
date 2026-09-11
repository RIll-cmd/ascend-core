"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

import { NumberTicker } from "@/components/ui/number-ticker";

export interface BourdonGaugeProps {
  label: string;
  value: string | number;
  subtext: string;
  pct?: number; // 0 to 100
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "amber" | "copper" | "gold" | "crimson" | "verdigris";
  size?: "sm" | "md" | "lg";
  enableJitter?: boolean;
  className?: string;
}

const GAUGE_THEMES = {
  amber: {
    bezelOuter: "#78350f",
    bezelMid: "#d97706",
    bezelInner: "#451a03",
    dialFace: "#140803",
    needle: "#f59e0b",
    glow: "#f59e0b",
    textValue: "text-[#fbbf24]",
    textAccent: "text-[#fde047]",
    tickColor: "#d97706",
    barGlow: "shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    badgeBorder: "border-[#78350f]",
    badgeBg: "bg-[#200c05]",
  },
  copper: {
    bezelOuter: "#92400e",
    bezelMid: "#b45309",
    bezelInner: "#3d1303",
    dialFace: "#160702",
    needle: "#ea580c",
    glow: "#ea580c",
    textValue: "text-[#fdba74]",
    textAccent: "text-[#fed7aa]",
    tickColor: "#b45309",
    barGlow: "shadow-[0_0_8px_rgba(234,88,12,0.5)]",
    badgeBorder: "border-[#92400e]",
    badgeBg: "bg-[#220d04]",
  },
  gold: {
    bezelOuter: "#b45309",
    bezelMid: "#f59e0b",
    bezelInner: "#451a03",
    dialFace: "#180d04",
    needle: "#fde047",
    glow: "#fbbf24",
    textValue: "text-[#fef08a]",
    textAccent: "text-[#ffffff]",
    tickColor: "#f59e0b",
    barGlow: "shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    badgeBorder: "border-[#b45309]",
    badgeBg: "bg-[#251204]",
  },
  crimson: {
    bezelOuter: "#7f1d1d",
    bezelMid: "#b91c1c",
    bezelInner: "#450a0a",
    dialFace: "#1a0404",
    needle: "#ef4444",
    glow: "#ef4444",
    textValue: "text-[#fca5a5]",
    textAccent: "text-[#fee2e2]",
    tickColor: "#dc2626",
    barGlow: "shadow-[0_0_8px_rgba(239,68,68,0.5)]",
    badgeBorder: "border-[#7f1d1d]",
    badgeBg: "bg-[#240606]",
  },
  verdigris: {
    bezelOuter: "#115e59",
    bezelMid: "#0f766e",
    bezelInner: "#042f2e",
    dialFace: "#031716",
    needle: "#14b8a6",
    glow: "#2dd4bf",
    textValue: "text-[#99f6e4]",
    textAccent: "text-[#ccfbf1]",
    tickColor: "#0f766e",
    barGlow: "shadow-[0_0_8px_rgba(45,212,191,0.5)]",
    badgeBorder: "border-[#115e59]",
    badgeBg: "bg-[#041a18]",
  },
};

/**
 * Authentic Victorian Bourdon Steam Manometer & Chrono-Pressure Gauge
 */
export function BourdonGauge({
  label,
  value,
  subtext,
  pct = 50,
  icon: Icon,
  variant = "amber",
  size = "md",
  enableJitter = true,
  className = "",
}: BourdonGaugeProps) {
  const gradientId = useId();
  const clampedPct = Math.min(100, Math.max(0, pct));
  // Standard manometer sweep: -125deg to +125deg (250 degree sweep)
  const needleAngle = -125 + (clampedPct / 100) * 250;
  const theme = GAUGE_THEMES[variant] || GAUGE_THEMES.amber;

  const [mousePos, setMousePos] = React.useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative w-full bg-[#160a05]/95 backdrop-blur-md border-4 border-[#3d1908] p-4 sm:p-5 lg:p-5.5 shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.08)] flex flex-col justify-between overflow-hidden group select-none min-h-[164px] transition-all hover:border-[#6b2e0f] hover:shadow-[0_16px_36px_rgba(0,0,0,0.95)]",
        className
      )}
    >
      {/* Magic Spotlight Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 0.35 : 0,
          background: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, ${theme.glow}, transparent 80%)`,
        }}
      />

      {/* 4 Corner Brass Rivets */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#d97706] border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-10" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#d97706] border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-10" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#d97706] border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-10" />
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#d97706] border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-10" />

      {/* Top Header Row with Icon and Circular Bourdon Dial */}
      <div className="flex items-center justify-between border-b border-[#4d220a]/80 pb-3 gap-3 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className="w-6 h-6 rounded-xs bg-[#241005] border border-[#5d2b10] flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_#000]">
              <Icon className="w-3.5 h-3.5 text-[#fbbf24]" />
            </div>
          )}
          <span className="text-xs sm:text-sm font-pixel font-bold text-[#fef08a] uppercase tracking-wider truncate leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {label}
          </span>
        </div>

        {/* Circular Steampunk Dial */}
        <div
          className={cn(
            "relative shrink-0 flex items-center justify-center transition-transform group-hover:scale-105",
            size === "sm" ? "w-10 h-10" : size === "lg" ? "w-14 h-14" : "w-12 h-12 sm:w-13 sm:h-13"
          )}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_4px_#000]">
            <defs>
              {/* Metallic Brass Bezel Gradient */}
              <linearGradient id={`bezel-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.bezelMid} />
                <stop offset="50%" stopColor={theme.bezelOuter} />
                <stop offset="100%" stopColor={theme.bezelInner} />
              </linearGradient>

              {/* Convex Glass Glare Reflection */}
              <linearGradient id={`glare-${gradientId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.05)" />
                <stop offset="100%" stopColor="rgba(0, 0, 0, 0.4)" />
              </linearGradient>
            </defs>

            {/* Outer Brass Bezel Ring */}
            <circle cx="50" cy="50" r="48" fill={`url(#bezel-${gradientId})`} stroke="#000" strokeWidth="2" />
            
            {/* 6 Miniature Perimeter Screws */}
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const sx = 50 + 44 * Math.cos(rad);
              const sy = 50 + 44 * Math.sin(rad);
              return (
                <g key={deg}>
                  <circle cx={sx} cy={sy} r="2.2" fill="#d97706" stroke="#000" strokeWidth="0.5" />
                  <line
                    x1={sx - 1.2}
                    y1={sy - 0.5}
                    x2={sx + 1.2}
                    y2={sy + 0.5}
                    stroke="#000"
                    strokeWidth="0.6"
                  />
                </g>
              );
            })}

            {/* Inner Dark Dial Face */}
            <circle cx="50" cy="50" r="40" fill={theme.dialFace} stroke="#000" strokeWidth="1.5" />

            {/* Radial Graduation Arc and Tick Marks */}
            {Array.from({ length: 11 }).map((_, i) => {
              const deg = -125 + i * 25;
              const rad = (deg * Math.PI) / 180;
              const x1 = 50 + 36 * Math.sin(rad);
              const y1 = 50 - 36 * Math.cos(rad);
              const x2 = 50 + (i % 2 === 0 ? 30 : 33) * Math.sin(rad);
              const y2 = 50 - (i % 2 === 0 ? 30 : 33) * Math.cos(rad);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={i % 2 === 0 ? theme.glow : theme.tickColor}
                  strokeWidth={i % 2 === 0 ? "1.8" : "1"}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Bourdon Tube Dial Center Inscription */}
            <text
              x="50"
              y="74"
              textAnchor="middle"
              fill={theme.textAccent}
              fontSize="6.5"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="0.5"
            >
              BAR
            </text>

            {/* Needle Pivot & Indicator Arm */}
            <g
              transform={`rotate(${needleAngle} 50 50)`}
              className={cn(
                "transition-transform duration-700 ease-out",
                enableJitter && clampedPct > 0 && "animate-steampunk-jitter"
              )}
            >
              {/* Needle Counterweight Teardrop */}
              <circle cx="50" cy="62" r="4" fill="#2d1306" stroke="#000" strokeWidth="0.5" />
              {/* Tapered Pointer */}
              <polygon
                points="48.5,50 51.5,50 50,18"
                fill={theme.needle}
                stroke="#000"
                strokeWidth="0.5"
              />
            </g>

            {/* Center Ruby Jewel Pivot */}
            <circle cx="50" cy="50" r="5" fill="#f59e0b" stroke="#000" strokeWidth="1" />
            <circle cx="50" cy="50" r="2.5" fill="#b91c1c" />
            <circle cx="49" cy="49" r="1" fill="#fff" />

            {/* Specular Convex Lens Highlight */}
            <circle cx="50" cy="50" r="37" fill={`url(#glare-${gradientId})`} pointerEvents="none" />
          </svg>
        </div>
      </div>

      {/* Main Metric Value, Telemetry Badge, Conduit Bar & Subtext */}
      <div className="mt-3.5 space-y-2.5 relative z-10">
        <div className="flex items-baseline justify-between gap-3">
          <div className={cn("text-2xl sm:text-3xl lg:text-[30px] font-pixel font-bold tracking-wider leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]", theme.textValue)}>
            {typeof value === "number" ? (
              <NumberTicker value={value} className={cn("font-pixel", theme.textValue)} />
            ) : typeof value === "string" && !isNaN(parseFloat(value)) && value.includes(" ") ? (
              (() => {
                const parts = value.split(" ");
                const num = parseFloat(parts[0]);
                if (!isNaN(num)) {
                  return (
                    <span>
                      <NumberTicker value={num} className={cn("font-pixel", theme.textValue)} /> {parts.slice(1).join(" ")}
                    </span>
                  );
                }
                return value;
              })()
            ) : typeof value === "string" && !isNaN(parseFloat(value)) && value.endsWith("d") ? (
              (() => {
                const num = parseFloat(value.replace("d", ""));
                if (!isNaN(num)) {
                  return (
                    <span>
                      <NumberTicker value={num} className={cn("font-pixel", theme.textValue)} />d
                    </span>
                  );
                }
                return value;
              })()
            ) : (
              value
            )}
          </div>

          {/* Steampunk Pressure Telemetry Badge */}
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 border rounded-xs shadow-[inset_0_1px_2px_#000] shrink-0", theme.badgeBg, theme.badgeBorder)}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.needle }} />
            <span className="font-mono text-xs sm:text-sm font-bold text-[#fde047] tabular-nums leading-none flex items-center">
              <NumberTicker value={Math.round(clampedPct)} className="text-[#fde047] font-mono text-xs sm:text-sm font-bold" />%
            </span>
          </div>
        </div>

        {/* Steampunk Brass Manometer Pressure Tube Conduit */}
        <div className="w-full h-1.5 bg-[#120602] border border-[#54250e] rounded-none overflow-hidden relative">
          <div
            className={cn("h-full transition-all duration-700 ease-out relative", theme.barGlow)}
            style={{
              width: `${clampedPct}%`,
              backgroundColor: theme.needle,
            }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.35)_50%,transparent_100%)] opacity-60" />
          </div>
        </div>

        {/* Informational Subtext */}
        <div className="text-xs sm:text-[13px] font-sans text-amber-200/80 font-medium leading-snug tracking-normal">
          {subtext}
        </div>
      </div>
    </div>
  );
}
