"use client";

import React from "react";
import { PixelWaterfallSanctuaryBackground } from "@/components/ui/pixel/PixelWaterfallSanctuaryBackground";
import { PixelFireflies } from "@/components/ui/pixel/PixelFireflies";

export default function SleepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-full select-none">
      {/* 8-Bit Retro Pixel Art Waterfall Sanctuary Background & CRT Atmospheric Layer */}
      <PixelWaterfallSanctuaryBackground />

      {/* Living Forest Fireflies In Front of Bento Boxes */}
      <PixelFireflies count={22} />

      {/* Main Page Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
