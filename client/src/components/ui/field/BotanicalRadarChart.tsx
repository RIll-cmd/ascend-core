"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BotanicalRadarStat {
  name: string;
  value: number;
  fullMark?: number;
  herbariumLabel?: string;
  color?: string;
}

export interface BotanicalRadarChartProps {
  data: BotanicalRadarStat[];
  className?: string;
}

const ATTRIBUTE_METADATA: Record<string, { label: string; herbarium: string; color: string }> = {
  STR: { label: "STR", herbarium: "Ironwood", color: "#f59e0b" },
  END: { label: "END", herbarium: "Briar", color: "#10b981" },
  DIS: { label: "DIS", herbarium: "Root", color: "#f97316" },
  KNO: { label: "KNO", herbarium: "Spore", color: "#38bdf8" },
  FOC: { label: "FOC", herbarium: "Hawk", color: "#eab308" },
  REC: { label: "REC", herbarium: "Dew", color: "#2dd4bf" },
};

export function BotanicalRadarChart({ data, className }: BotanicalRadarChartProps) {
  const size = 180;
  const center = size / 2;
  const radius = size * 0.36;
  const angleStep = (Math.PI * 2) / (data.length || 6);

  // Compute data polygon vertices
  const polygonPoints = data
    .map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const full = d.fullMark || 100;
      const normalizedValue = Math.min(full, Math.max(10, d.value));
      const r = (normalizedValue / full) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center select-none w-full h-[180px]",
        className
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
      >
        <defs>
          {/* Radial Gradient for Amber Parchment Fill */}
          <radialGradient id="astrolabeWebGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#c59b27" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Outer Brass Astrolabe Rim */}
        <circle
          cx={center}
          cy={center}
          r={radius + 6}
          fill="none"
          stroke="#c59b27"
          strokeWidth="1.2"
          strokeDasharray="2,3"
          opacity={0.6}
        />

        {/* Concentric Astrolabe Latitude Rings */}
        {[0.25, 0.5, 0.75, 1.0].map((scale) => {
          const webPoints = data
            .map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = radius * scale;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <polygon
              key={`ring-${scale}`}
              points={webPoints}
              fill={scale === 1.0 ? "rgba(19, 15, 10, 0.4)" : "none"}
              stroke="#c59b27"
              strokeWidth={scale === 1.0 ? "1.5" : "0.75"}
              strokeOpacity={scale === 1.0 ? 0.7 : 0.3}
              strokeDasharray={scale === 1.0 ? "none" : "2,2"}
            />
          );
        })}

        {/* Radial Axis Spokes with Degree Nodes */}
        {data.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <g key={`spoke-${i}`}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#c59b27"
                strokeWidth="1"
                strokeOpacity={0.4}
              />
              {/* Outer Spoke Tip Rivet */}
              <circle
                cx={x}
                cy={y}
                r="1.5"
                fill="#d4a373"
                stroke="#130f0a"
                strokeWidth="0.5"
              />
            </g>
          );
        })}

        {/* Dynamic Data Polygon Overlay */}
        <polygon
          points={polygonPoints}
          fill="url(#astrolabeWebGlow)"
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeLinejoin="round"
          className="transition-all duration-500 ease-out"
        />

        {/* Data Vertices & Astrolabe Star Glyphs */}
        {data.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const full = d.fullMark || 100;
          const normalizedValue = Math.min(full, Math.max(10, d.value));
          const r = (normalizedValue / full) * radius;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          const meta = ATTRIBUTE_METADATA[d.name] || {
            color: "#f5dab0",
            herbarium: "",
          };

          return (
            <g key={`vertex-${d.name}`}>
              {/* Pulsing Outer Node */}
              <circle
                cx={x}
                cy={y}
                r="3"
                fill={meta.color}
                stroke="#130f0a"
                strokeWidth="1"
                className="drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]"
              />
            </g>
          );
        })}

        {/* Perimeter Attribute Labels with Botanical Herbarium Tags */}
        {data.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelDist = radius + 18;
          const x = center + labelDist * Math.cos(angle);
          const y = center + labelDist * Math.sin(angle);
          const meta = ATTRIBUTE_METADATA[d.name] || {
            label: d.name,
            herbarium: "",
            color: "#f5dab0",
          };

          return (
            <g key={`label-${d.name}`}>
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-[#e8cfab] font-expedition text-[10px] font-bold tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
              >
                {meta.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default BotanicalRadarChart;
