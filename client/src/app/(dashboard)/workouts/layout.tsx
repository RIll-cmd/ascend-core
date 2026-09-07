"use client";

import React from "react";

export default function WorkoutsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-full select-none">
      {/* 8-Bit Roman Colosseum Arena Backdrop */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/colosseum_arena_bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 25%",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }}
      >
        {/* Atmospheric Arena Ambient Vignette & Contrast Overlay */}
        <div className="absolute inset-0 bg-[#120a07]/50 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.1)_0%,_rgba(18,10,7,0.7)_65%,_rgba(10,5,3,0.92)_100%)] backdrop-blur-[0.5px]" />

        {/* Diagonal Roman Colosseum Sunbeam (God Ray) Shaft */}
        <div className="absolute inset-0 bg-[linear-gradient(130deg,_transparent_30%,_rgba(254,240,138,0.05)_42%,_rgba(245,158,11,0.14)_49%,_rgba(254,240,138,0.07)_56%,_transparent_68%)] mix-blend-screen pointer-events-none" />

        {/* Arena Sand Pit Warm Ground Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(217,179,106,0.15)_0%,_rgba(180,83,9,0.06)_40%,_transparent_75%)] pointer-events-none" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
