"use client";

import React from "react";
import { SakuraFalling } from "@/components/ui/pixel/SakuraFalling";

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-full select-none">
      {/* Kyoto Dusk Pagoda Sanctuary Animated Pixel Art Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/backgrounds/habits_kyoto_dusk.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }}
      >
        {/* Warm Dusk Sanctuary Tint & Vignette Overlay */}
        <div className="absolute inset-0 bg-[#120a0d]/35 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(18,10,13,0.72)_100%)]" />
      </div>

      {/* Gentle Floating Sakura Petals (Slow & Minimal) */}
      <SakuraFalling count={14} />

      <div className="relative z-20">{children}</div>
    </div>
  );
}
