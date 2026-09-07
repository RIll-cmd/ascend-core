"use client";

import React from "react";

interface FloatingRuneFieldProps {
  density?: "low" | "medium" | "high";
  colorTheme?: "cyan" | "purple" | "amber" | "mixed";
  className?: string;
}

// Deterministic rune presets for stability & 0 hydration mismatch
const RUNE_CONFIGS = [
  { rune: "ᚠ", top: "8%", left: "6%", size: "14px", duration: "11s", delay: "0s", type: "rune-drift", color: "text-amber-500/25" },
  { rune: "ᛞ", top: "14%", right: "8%", size: "16px", duration: "14s", delay: "1.5s", type: "rune-float", color: "text-orange-400/25" },
  { rune: "ᚦ", top: "35%", left: "12%", size: "12px", duration: "9s", delay: "3s", type: "rune-static", color: "text-stone-400/20" },
  { rune: "ᛗ", top: "52%", right: "14%", size: "15px", duration: "16s", delay: "2s", type: "rune-drift", color: "text-amber-400/20" },
  { rune: "ᚲ", top: "70%", left: "8%", size: "13px", duration: "12s", delay: "4.5s", type: "rune-float", color: "text-amber-500/25" },
  { rune: "ᛟ", top: "82%", right: "6%", size: "16px", duration: "15s", delay: "1s", type: "rune-drift", color: "text-orange-400/30" },
  { rune: "ᛉ", top: "25%", right: "32%", size: "11px", duration: "10s", delay: "5s", type: "rune-static", color: "text-stone-400/20" },
  { rune: "ᚱ", top: "65%", left: "42%", size: "14px", duration: "13s", delay: "3.5s", type: "rune-drift", color: "text-amber-400/20" },
  { rune: "ᛊ", top: "18%", left: "48%", size: "12px", duration: "8s", delay: "2.5s", type: "rune-float", color: "text-emerald-400/20" },
  { rune: "ᚹ", top: "78%", left: "24%", size: "13px", duration: "14s", delay: "6s", type: "rune-drift", color: "text-amber-400/20" },
  { rune: "ᛏ", top: "42%", right: "22%", size: "15px", duration: "11s", delay: "4s", type: "rune-float", color: "text-orange-400/25" },
  { rune: "ᚷ", top: "88%", left: "60%", size: "12px", duration: "12s", delay: "0.5s", type: "rune-static", color: "text-stone-400/20" },
];

// Deterministic particle nodes - crisp pixel squares (no zero-offset blur glows)
const PARTICLE_CONFIGS = [
  { left: "5%", top: "15%", size: "3px", duration: "6s", delay: "0s", color: "bg-[#f59e0b]/50" },
  { left: "15%", top: "60%", size: "2.5px", duration: "8s", delay: "1.2s", color: "bg-[#d97706]/50" },
  { left: "28%", top: "30%", size: "3px", duration: "7s", delay: "2.5s", color: "bg-[#f59e0b]/60" },
  { left: "42%", top: "80%", size: "2px", duration: "9s", delay: "0.8s", color: "bg-[#b45309]/50" },
  { left: "55%", top: "20%", size: "3.5px", duration: "5.5s", delay: "3s", color: "bg-[#f59e0b]/50" },
  { left: "68%", top: "70%", size: "2.5px", duration: "8.5s", delay: "1.8s", color: "bg-[#ea580c]/60" },
  { left: "78%", top: "40%", size: "3px", duration: "6.5s", delay: "2.2s", color: "bg-[#f59e0b]/50" },
  { left: "88%", top: "85%", size: "2px", duration: "10s", delay: "0.4s", color: "bg-[#f59e0b]/50" },
  { left: "93%", top: "25%", size: "3px", duration: "7.5s", delay: "3.6s", color: "bg-[#d97706]/50" },
  { left: "35%", top: "92%", size: "2.5px", duration: "8s", delay: "4s", color: "bg-[#f59e0b]/50" },
  { left: "62%", top: "48%", size: "3px", duration: "6s", delay: "1.5s", color: "bg-[#22c55e]/50" },
  { left: "82%", top: "12%", size: "2.5px", duration: "9s", delay: "2.8s", color: "bg-[#f59e0b]/50" },
];

export const FloatingRuneField: React.FC<FloatingRuneFieldProps> = ({
  density = "medium",
  colorTheme = "amber",
  className = "",
}) => {
  const runeLimit = density === "high" ? RUNE_CONFIGS.length : density === "medium" ? 8 : 4;
  const particleLimit = density === "high" ? PARTICLE_CONFIGS.length : density === "medium" ? 8 : 4;

  const runesToRender = RUNE_CONFIGS.slice(0, runeLimit);
  const particlesToRender = PARTICLE_CONFIGS.slice(0, particleLimit);

  return (
    <div
      suppressHydrationWarning
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    >
      {/* Floating Arcane Runes */}
      {runesToRender.map((r, i) => (
        <span
          key={`rune-field-${i}`}
          suppressHydrationWarning
          className={`${r.type} ${r.color} font-mono select-none font-bold`}
          style={{
            top: r.top,
            left: r.left,
            right: (r as any).right,
            fontSize: r.size,
            animationDuration: r.duration,
            animationDelay: r.delay,
          }}
        >
          {r.rune}
        </span>
      ))}

      {/* Ambient Energy Sparkle Particles */}
      {particlesToRender.map((p, i) => (
        <div
          key={`particle-node-${i}`}
          suppressHydrationWarning
          className={`absolute rounded-none animate-pulse ${p.color}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};
