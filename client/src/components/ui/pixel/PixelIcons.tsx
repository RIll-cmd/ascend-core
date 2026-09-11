"use client";

import React from "react";

/* =====================================================================
   AUTHENTIC 8-BIT RETRO PIXEL UI ICONS
   ===================================================================== */

/* 1. 8-Bit Pixel Crosshair / Target Icon (16x16) */
export function PixelCrosshairIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="6" y="1" width="4" height="1" />
      <rect x="6" y="14" width="4" height="1" />
      <rect x="1" y="6" width="1" height="4" />
      <rect x="14" y="6" width="1" height="4" />
      <rect x="4" y="2" width="2" height="1" />
      <rect x="10" y="2" width="2" height="1" />
      <rect x="2" y="4" width="1" height="2" />
      <rect x="13" y="4" width="1" height="2" />
      <rect x="2" y="10" width="1" height="2" />
      <rect x="13" y="10" width="1" height="2" />
      <rect x="4" y="13" width="2" height="1" />
      <rect x="10" y="13" width="2" height="1" />
      <rect x="3" y="3" width="1" height="1" />
      <rect x="12" y="3" width="1" height="1" />
      <rect x="3" y="12" width="1" height="1" />
      <rect x="12" y="12" width="1" height="1" />
      <rect x="7" y="3" width="2" height="3" />
      <rect x="7" y="10" width="2" height="3" />
      <rect x="3" y="7" width="3" height="2" />
      <rect x="10" y="7" width="3" height="2" />
      <rect x="7" y="7" width="2" height="2" />
    </svg>
  );
}

/* 2. 8-Bit Pixel Skull Icon (16x16) */
export function PixelSkullIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="5" y="1" width="6" height="1" />
      <rect x="3" y="2" width="10" height="2" />
      <rect x="2" y="4" width="12" height="2" />
      <rect x="2" y="6" width="12" height="1" />
      <rect x="2" y="7" width="2" height="3" />
      <rect x="7" y="7" width="2" height="2" />
      <rect x="12" y="7" width="2" height="3" />
      <rect x="3" y="10" width="4" height="1" />
      <rect x="9" y="10" width="4" height="1" />
      <rect x="4" y="11" width="8" height="1" />
      <rect x="4" y="12" width="2" height="2" />
      <rect x="7" y="12" width="2" height="2" />
      <rect x="10" y="12" width="2" height="2" />
      <rect x="5" y="14" width="6" height="1" />
    </svg>
  );
}

/* 3. 8-Bit Pixel Hamburger Menu Icon (16x16) */
export function PixelMenuIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="1" y="3" width="14" height="2" />
      <rect x="1" y="7" width="14" height="2" />
      <rect x="1" y="11" width="14" height="2" />
    </svg>
  );
}

/* 4. 8-Bit Pixel Close / X Icon (16x16) */
export function PixelCloseIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="2" y="2" width="2" height="2" />
      <rect x="12" y="2" width="2" height="2" />
      <rect x="4" y="4" width="2" height="2" />
      <rect x="10" y="4" width="2" height="2" />
      <rect x="6" y="6" width="4" height="4" />
      <rect x="4" y="10" width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="2" y="12" width="2" height="2" />
      <rect x="12" y="12" width="2" height="2" />
    </svg>
  );
}

/* 5. 8-Bit Pixel Lightning Bolt Icon (16x16) */
export function PixelLightningIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="8" y="1" width="4" height="2" />
      <rect x="7" y="3" width="4" height="2" />
      <rect x="6" y="5" width="5" height="2" />
      <rect x="3" y="7" width="10" height="2" />
      <rect x="5" y="9" width="5" height="2" />
      <rect x="6" y="11" width="3" height="2" />
      <rect x="7" y="13" width="2" height="2" />
    </svg>
  );
}

/* 6. 8-Bit Pixel Footprints / Steps Icon (16x16) */
export function PixelFootprintsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="2" y="4" width="3" height="1" />
      <rect x="1" y="5" width="5" height="4" />
      <rect x="2" y="9" width="3" height="1" />
      <rect x="2" y="11" width="3" height="3" />
      <rect x="3" y="14" width="1" height="1" />
      <rect x="10" y="1" width="3" height="1" />
      <rect x="9" y="2" width="5" height="4" />
      <rect x="10" y="6" width="3" height="1" />
      <rect x="10" y="8" width="3" height="3" />
      <rect x="11" y="11" width="1" height="1" />
    </svg>
  );
}

/* 7. 8-Bit Pixel Activity / Bio-Recovery Pulse Icon (16x16) */
export function PixelActivityIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="1" y="8" width="4" height="2" />
      <rect x="5" y="5" width="2" height="3" />
      <rect x="6" y="2" width="2" height="3" />
      <rect x="8" y="5" width="2" height="4" />
      <rect x="9" y="9" width="2" height="5" />
      <rect x="11" y="6" width="2" height="4" />
      <rect x="13" y="8" width="3" height="2" />
    </svg>
  );
}

/* 8. 8-Bit Pixel Open Book / Lore Grimoire Icon (16x16) */
export function PixelBookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="2" y="3" width="5" height="1" />
      <rect x="9" y="3" width="5" height="1" />
      <rect x="1" y="4" width="6" height="8" />
      <rect x="9" y="4" width="6" height="8" />
      <rect x="7" y="4" width="2" height="9" />
      <rect x="2" y="12" width="5" height="2" />
      <rect x="9" y="12" width="5" height="2" />
      {/* Page lines */}
      <rect x="3" y="6" width="3" height="1" fillOpacity="0.4" />
      <rect x="3" y="8" width="3" height="1" fillOpacity="0.4" />
      <rect x="10" y="6" width="3" height="1" fillOpacity="0.4" />
      <rect x="10" y="8" width="3" height="1" fillOpacity="0.4" />
    </svg>
  );
}

/* 9. 8-Bit Pixel Info / Overview Icon (16x16) */
export function PixelInfoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="5" y="1" width="6" height="1" />
      <rect x="3" y="2" width="2" height="1" />
      <rect x="11" y="2" width="2" height="1" />
      <rect x="2" y="3" width="1" height="2" />
      <rect x="13" y="3" width="1" height="2" />
      <rect x="1" y="5" width="1" height="6" />
      <rect x="14" y="5" width="1" height="6" />
      <rect x="2" y="11" width="1" height="2" />
      <rect x="13" y="11" width="1" height="2" />
      <rect x="3" y="13" width="2" height="1" />
      <rect x="11" y="13" width="2" height="1" />
      <rect x="5" y="14" width="6" height="1" />
      {/* Dot */}
      <rect x="7" y="4" width="2" height="2" />
      {/* Stem */}
      <rect x="7" y="7" width="2" height="5" />
      <rect x="6" y="7" width="1" height="1" />
      <rect x="6" y="11" width="4" height="1" />
    </svg>
  );
}

/* 10. 8-Bit Pixel Dumbbell / Improve Icon (16x16) */
export function PixelDumbbellIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Left Weight Plates */}
      <rect x="1" y="5" width="2" height="6" />
      <rect x="3" y="4" width="2" height="8" />
      {/* Bar */}
      <rect x="5" y="7" width="6" height="2" />
      {/* Right Weight Plates */}
      <rect x="11" y="4" width="2" height="8" />
      <rect x="13" y="5" width="2" height="6" />
    </svg>
  );
}

/* 11. 8-Bit Pixel Star Icon (16x16) */
export function PixelStarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="7" y="1" width="2" height="3" />
      <rect x="6" y="4" width="4" height="2" />
      <rect x="1" y="6" width="14" height="2" />
      <rect x="3" y="8" width="10" height="2" />
      <rect x="4" y="10" width="8" height="2" />
      <rect x="3" y="12" width="3" height="3" />
      <rect x="10" y="12" width="3" height="3" />
    </svg>
  );
}

/* 12. 8-Bit Pixel Left Chevron (16x16) */
export function PixelChevronLeftIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="10" y="2" width="2" height="2" />
      <rect x="8" y="4" width="2" height="2" />
      <rect x="6" y="6" width="2" height="2" />
      <rect x="4" y="7" width="2" height="2" />
      <rect x="6" y="8" width="2" height="2" />
      <rect x="8" y="10" width="2" height="2" />
      <rect x="10" y="12" width="2" height="2" />
    </svg>
  );
}

/* 13. 8-Bit Pixel Right Chevron (16x16) */
export function PixelChevronRightIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="4" y="2" width="2" height="2" />
      <rect x="6" y="4" width="2" height="2" />
      <rect x="8" y="6" width="2" height="2" />
      <rect x="10" y="7" width="2" height="2" />
      <rect x="8" y="8" width="2" height="2" />
      <rect x="6" y="10" width="2" height="2" />
      <rect x="4" y="12" width="2" height="2" />
    </svg>
  );
}

/* 14. 8-Bit Pixel Sword / Blade Icon (16x16) */
export function PixelSwordIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="13" y="1" width="2" height="2" />
      <rect x="11" y="2" width="3" height="2" />
      <rect x="9" y="4" width="3" height="3" />
      <rect x="7" y="6" width="3" height="3" />
      <rect x="5" y="8" width="3" height="3" />
      <rect x="5" y="10" width="4" height="2" />
      <rect x="4" y="11" width="2" height="3" />
      <rect x="3" y="9" width="3" height="2" />
      <rect x="2" y="12" width="3" height="2" />
      <rect x="1" y="14" width="2" height="2" />
    </svg>
  );
}

/* 15. 8-Bit Pixel Shield Icon (16x16) */
export function PixelShieldIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="2" y="2" width="12" height="2" />
      <rect x="1" y="4" width="14" height="4" />
      <rect x="2" y="8" width="12" height="3" />
      <rect x="4" y="11" width="8" height="2" />
      <rect x="6" y="13" width="4" height="2" />
      <rect x="7" y="15" width="2" height="1" />
      {/* Inner emblem */}
      <rect x="7" y="4" width="2" height="6" fillOpacity="0.4" />
      <rect x="5" y="6" width="6" height="2" fillOpacity="0.4" />
    </svg>
  );
}

/* 16. 8-Bit Pixel Heart Icon (16x16) */
export function PixelHeartIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="2" y="2" width="4" height="2" />
      <rect x="10" y="2" width="4" height="2" />
      <rect x="1" y="4" width="6" height="4" />
      <rect x="9" y="4" width="6" height="4" />
      <rect x="2" y="8" width="12" height="2" />
      <rect x="4" y="10" width="8" height="2" />
      <rect x="6" y="12" width="4" height="2" />
      <rect x="7" y="14" width="2" height="1" />
    </svg>
  );
}

/* 17. 8-Bit Pixel Crown Icon (16x16) */
export function PixelCrownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="1" y="4" width="2" height="2" />
      <rect x="7" y="2" width="2" height="2" />
      <rect x="13" y="4" width="2" height="2" />
      <rect x="1" y="6" width="3" height="6" />
      <rect x="12" y="6" width="3" height="6" />
      <rect x="4" y="8" width="8" height="4" />
      <rect x="6" y="4" width="4" height="4" />
      <rect x="2" y="12" width="12" height="2" />
    </svg>
  );
}

/* 18. 8-Bit Pixel Award / Medal Icon (16x16) */
export function PixelAwardIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="5" y="1" width="6" height="1" />
      <rect x="3" y="2" width="10" height="6" />
      <rect x="5" y="8" width="6" height="1" />
      <rect x="7" y="4" width="2" height="2" fillOpacity="0.4" />
      {/* Ribbons */}
      <rect x="4" y="9" width="3" height="5" />
      <rect x="9" y="9" width="3" height="5" />
      <rect x="3" y="14" width="2" height="1" />
      <rect x="11" y="14" width="2" height="1" />
    </svg>
  );
}

/* 19. 8-Bit Pixel Sliders / Stat Matrix Icon (16x16) */
export function PixelSlidersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Track 1 */}
      <rect x="2" y="2" width="2" height="12" />
      <rect x="1" y="5" width="4" height="3" />
      {/* Track 2 */}
      <rect x="7" y="2" width="2" height="12" />
      <rect x="6" y="9" width="4" height="3" />
      {/* Track 3 */}
      <rect x="12" y="2" width="2" height="12" />
      <rect x="11" y="3" width="4" height="3" />
    </svg>
  );
}

/* 20. 8-Bit Pixel Tree / Skill Tree Icon (16x16) */
export function PixelTreeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="7" y="1" width="2" height="2" />
      <rect x="5" y="3" width="6" height="2" />
      <rect x="3" y="5" width="10" height="2" />
      <rect x="2" y="7" width="12" height="3" />
      <rect x="4" y="10" width="8" height="2" />
      {/* Trunk */}
      <rect x="7" y="12" width="2" height="3" />
      <rect x="5" y="15" width="6" height="1" />
    </svg>
  );
}

/* 21. 8-Bit Pixel Palette / Customization Icon (16x16) */
export function PixelPaletteIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="4" y="1" width="8" height="1" />
      <rect x="2" y="2" width="12" height="2" />
      <rect x="1" y="4" width="14" height="7" />
      <rect x="2" y="11" width="12" height="2" />
      <rect x="4" y="13" width="8" height="2" />
      {/* Paint dots */}
      <rect x="4" y="4" width="2" height="2" fillOpacity="0.4" />
      <rect x="8" y="3" width="2" height="2" fillOpacity="0.4" />
      <rect x="11" y="5" width="2" height="2" fillOpacity="0.4" />
      <rect x="3" y="8" width="2" height="2" fillOpacity="0.4" />
      {/* Thumb hole */}
      <rect x="10" y="9" width="3" height="3" fill="#000" />
    </svg>
  );
}

/* 22. 8-Bit Pixel History / Chronicles Icon (16x16) */
export function PixelHistoryIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Clock outline */}
      <rect x="5" y="1" width="6" height="1" />
      <rect x="3" y="2" width="2" height="1" />
      <rect x="11" y="2" width="2" height="1" />
      <rect x="2" y="3" width="1" height="2" />
      <rect x="13" y="3" width="1" height="2" />
      <rect x="1" y="5" width="1" height="6" />
      <rect x="14" y="5" width="1" height="6" />
      <rect x="2" y="11" width="1" height="2" />
      <rect x="13" y="11" width="1" height="2" />
      <rect x="3" y="13" width="2" height="1" />
      <rect x="11" y="13" width="2" height="1" />
      <rect x="5" y="14" width="6" height="1" />
      {/* Clock Hands */}
      <rect x="7" y="4" width="2" height="4" />
      <rect x="7" y="7" width="4" height="2" />
    </svg>
  );
}

/* 23. 8-Bit Pixel Bot / AIRA Icon (16x16) */
export function PixelBotIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Antenna */}
      <rect x="7" y="1" width="2" height="1" />
      <rect x="7" y="2" width="2" height="2" />
      {/* Head */}
      <rect x="3" y="4" width="10" height="8" />
      {/* Eyes */}
      <rect x="5" y="6" width="2" height="2" fill="#000" />
      <rect x="9" y="6" width="2" height="2" fill="#000" />
      {/* Mouth */}
      <rect x="6" y="10" width="4" height="1" fill="#000" />
      {/* Ears */}
      <rect x="1" y="7" width="2" height="3" />
      <rect x="13" y="7" width="2" height="3" />
    </svg>
  );
}

/* 24. 8-Bit Pixel Lock Icon (16x16) */
export function PixelLockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Shackle */}
      <rect x="5" y="2" width="6" height="2" />
      <rect x="4" y="4" width="2" height="4" />
      <rect x="10" y="4" width="2" height="4" />
      {/* Lock Body */}
      <rect x="2" y="7" width="12" height="8" />
      {/* Keyhole */}
      <rect x="7" y="9" width="2" height="2" fill="#000" />
      <rect x="7" y="11" width="2" height="2" fill="#000" />
    </svg>
  );
}

/* 25. 8-Bit Pixel Sparkles Icon (16x16) */
export function PixelSparklesIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Main Sparkle */}
      <rect x="7" y="1" width="2" height="10" />
      <rect x="3" y="5" width="10" height="2" />
      <rect x="6" y="4" width="4" height="4" />
      {/* Small Sparkle */}
      <rect x="12" y="10" width="2" height="5" />
      <rect x="10" y="12" width="6" height="1" />
      {/* Tiny spark */}
      <rect x="2" y="12" width="2" height="2" />
    </svg>
  );
}

/* 26. 8-Bit Pixel Plus Icon (16x16) */
export function PixelPlusIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="7" y="2" width="2" height="12" />
      <rect x="2" y="7" width="12" height="2" />
    </svg>
  );
}

/* 27. 8-Bit Pixel Checkmark Icon (16x16) */
export function PixelCheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Short Left Arm */}
      <rect x="2" y="7" width="2" height="2" />
      <rect x="4" y="9" width="2" height="2" />
      {/* Vertex */}
      <rect x="6" y="11" width="2" height="2" />
      {/* Long Right Arm */}
      <rect x="8" y="9" width="2" height="2" />
      <rect x="10" y="7" width="2" height="2" />
      <rect x="12" y="5" width="2" height="2" />
      <rect x="13" y="3" width="2" height="2" />
    </svg>
  );
}

/* 28. 8-Bit Pixel Check Square Icon (16x16) */
export function PixelCheckSquareIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Border */}
      <rect x="1" y="1" width="14" height="2" />
      <rect x="1" y="13" width="14" height="2" />
      <rect x="1" y="3" width="2" height="10" />
      <rect x="13" y="3" width="2" height="10" />
      {/* Checkmark inside */}
      <rect x="10" y="4" width="2" height="2" />
      <rect x="8" y="6" width="2" height="2" />
      <rect x="6" y="8" width="2" height="2" />
      <rect x="4" y="6" width="2" height="2" />
    </svg>
  );
}

/* 29. 8-Bit Pixel Square Box Icon (16x16) */
export function PixelSquareIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="1" y="1" width="14" height="2" />
      <rect x="1" y="13" width="14" height="2" />
      <rect x="1" y="3" width="2" height="10" />
      <rect x="13" y="3" width="2" height="10" />
    </svg>
  );
}

/* 30. 8-Bit Pixel Trash / Delete Icon (16x16) */
export function PixelTrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="6" y="1" width="4" height="2" />
      <rect x="2" y="3" width="12" height="2" />
      <rect x="3" y="5" width="10" height="9" />
      <rect x="4" y="14" width="8" height="1" />
      {/* Slots */}
      <rect x="5" y="6" width="1" height="6" fill="#000" fillOpacity="0.4" />
      <rect x="8" y="6" width="1" height="6" fill="#000" fillOpacity="0.4" />
      <rect x="10" y="6" width="1" height="6" fill="#000" fillOpacity="0.4" />
    </svg>
  );
}

/* 31. 8-Bit Pixel Pencil / Edit Icon (16x16) */
export function PixelPencilIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="11" y="1" width="3" height="3" />
      <rect x="9" y="3" width="3" height="3" />
      <rect x="7" y="5" width="3" height="3" />
      <rect x="5" y="7" width="3" height="3" />
      <rect x="3" y="9" width="3" height="3" />
      <rect x="2" y="12" width="2" height="2" />
      <rect x="1" y="14" width="1" height="1" />
    </svg>
  );
}

/* 32. 8-Bit Pixel Filter Funnel Icon (16x16) */
export function PixelFilterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="1" y="2" width="14" height="2" />
      <rect x="3" y="4" width="10" height="2" />
      <rect x="5" y="6" width="6" height="3" />
      <rect x="7" y="9" width="2" height="5" />
    </svg>
  );
}

/* 33. 8-Bit Pixel Search / Magnifier Icon (16x16) */
export function PixelSearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="4" y="1" width="6" height="2" />
      <rect x="2" y="3" width="2" height="6" />
      <rect x="10" y="3" width="2" height="6" />
      <rect x="4" y="9" width="6" height="2" />
      <rect x="9" y="9" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
      <rect x="13" y="13" width="2" height="2" />
    </svg>
  );
}

/* 34. 8-Bit Pixel Tag / Hashtag Icon (16x16) */
export function PixelTagIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="4" y="2" width="2" height="12" />
      <rect x="10" y="2" width="2" height="12" />
      <rect x="2" y="5" width="12" height="2" />
      <rect x="2" y="9" width="12" height="2" />
    </svg>
  );
}

/* 35. 8-Bit Pixel Gift Icon (16x16) */
export function PixelGiftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Ribbon Bow */}
      <rect x="4" y="1" width="3" height="2" />
      <rect x="9" y="1" width="3" height="2" />
      {/* Box Lid */}
      <rect x="2" y="3" width="12" height="3" />
      {/* Box Body */}
      <rect x="3" y="6" width="10" height="9" />
      {/* Ribbon Cross */}
      <rect x="7" y="3" width="2" height="12" fill="#000" fillOpacity="0.4" />
      <rect x="2" y="4" width="12" height="1" fill="#000" fillOpacity="0.4" />
    </svg>
  );
}

/* 36. 8-Bit Pixel Refresh / Rotate Icon (16x16) */
export function PixelRefreshIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="5" y="1" width="6" height="2" />
      <rect x="11" y="2" width="2" height="4" />
      <rect x="11" y="1" width="4" height="2" />
      <rect x="13" y="3" width="2" height="3" />
      <rect x="1" y="4" width="2" height="6" />
      <rect x="13" y="8" width="2" height="4" />
      <rect x="5" y="13" width="6" height="2" />
      <rect x="1" y="10" width="4" height="2" />
      <rect x="3" y="12" width="2" height="3" />
    </svg>
  );
}

/* 37. 8-Bit Pixel Flame Icon (16x16) */
export function PixelFlameIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="7" y="1" width="2" height="2" />
      <rect x="6" y="3" width="3" height="2" />
      <rect x="4" y="5" width="6" height="3" />
      <rect x="3" y="8" width="10" height="4" />
      <rect x="4" y="12" width="8" height="2" />
      <rect x="5" y="14" width="6" height="1" />
      {/* Inner flame */}
      <rect x="7" y="8" width="2" height="4" fillOpacity="0.4" />
    </svg>
  );
}

/* 38. 8-Bit Pixel Coins Icon (16x16) */
export function PixelCoinsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="4" y="1" width="8" height="2" />
      <rect x="2" y="3" width="12" height="3" />
      <rect x="2" y="6" width="12" height="2" />
      <rect x="2" y="9" width="12" height="2" />
      <rect x="4" y="11" width="8" height="2" />
      {/* Bottom coin stack */}
      <rect x="2" y="13" width="12" height="2" />
    </svg>
  );
}

/* 39. 8-Bit Pixel Layers Icon (16x16) */
export function PixelLayersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Top Diamond */}
      <rect x="7" y="1" width="2" height="2" />
      <rect x="5" y="2" width="6" height="2" />
      <rect x="3" y="3" width="10" height="2" />
      <rect x="1" y="4" width="14" height="2" />
      {/* Mid Layer */}
      <rect x="1" y="8" width="14" height="2" />
      {/* Bottom Layer */}
      <rect x="1" y="12" width="14" height="2" />
    </svg>
  );
}

/* 40. 8-Bit Pixel Kanban Columns Icon (16x16) */
export function PixelKanbanIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Column 1 */}
      <rect x="1" y="1" width="3" height="14" />
      {/* Column 2 */}
      <rect x="6" y="1" width="3" height="10" />
      {/* Column 3 */}
      <rect x="11" y="1" width="3" height="12" />
    </svg>
  );
}

/* 41. 8-Bit Pixel Grip / Drag Handle Icon (16x16) */
export function PixelGripIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="5" y="2" width="2" height="2" />
      <rect x="9" y="2" width="2" height="2" />
      <rect x="5" y="6" width="2" height="2" />
      <rect x="9" y="6" width="2" height="2" />
      <rect x="5" y="10" width="2" height="2" />
      <rect x="9" y="10" width="2" height="2" />
      <rect x="5" y="14" width="2" height="2" />
      <rect x="9" y="14" width="2" height="2" />
    </svg>
  );
}

/* 42. 8-Bit Pixel Minimize Icon (16x16) */
export function PixelMinimizeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="2" y="7" width="12" height="2" />
    </svg>
  );
}

/* 43. 8-Bit Pixel Maximize Icon (16x16) */
export function PixelMaximizeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="2" y="2" width="12" height="2" />
      <rect x="2" y="12" width="12" height="2" />
      <rect x="2" y="4" width="2" height="8" />
      <rect x="12" y="4" width="2" height="8" />
    </svg>
  );
}

/* 44. 8-Bit Pixel X / Close Icon (16x16) */
export function PixelXIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="3" y="3" width="2" height="2" />
      <rect x="5" y="5" width="2" height="2" />
      <rect x="7" y="7" width="2" height="2" />
      <rect x="9" y="5" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="5" y="9" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
      <rect x="9" y="9" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
    </svg>
  );
}

/* 45. 8-Bit Pixel Save / Floppy Disk Icon (16x16) */
export function PixelSaveIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="2" y="2" width="10" height="12" />
      <rect x="12" y="4" width="2" height="10" />
      <rect x="4" y="2" width="6" height="4" fill="#000" />
      <rect x="4" y="8" width="8" height="5" fill="#000" />
      <rect x="5" y="9" width="6" height="3" fill="currentColor" />
    </svg>
  );
}

/* 46. 8-Bit Pixel Calendar Icon (16x16) */
export function PixelCalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="4" y="1" width="2" height="2" />
      <rect x="10" y="1" width="2" height="2" />
      <rect x="2" y="3" width="12" height="12" />
      <rect x="4" y="5" width="8" height="2" fill="#000" />
      <rect x="4" y="8" width="2" height="2" fill="#000" />
      <rect x="7" y="8" width="2" height="2" fill="#000" />
      <rect x="10" y="8" width="2" height="2" fill="#000" />
      <rect x="4" y="11" width="2" height="2" fill="#000" />
      <rect x="7" y="11" width="2" height="2" fill="#000" />
      <rect x="10" y="11" width="2" height="2" fill="#000" />
    </svg>
  );
}

/* 47. 8-Bit Pixel Target Icon (16x16) */
export function PixelTargetIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="6" y="1" width="4" height="2" />
      <rect x="6" y="13" width="4" height="2" />
      <rect x="1" y="6" width="2" height="4" />
      <rect x="13" y="6" width="2" height="4" />
      <rect x="3" y="3" width="3" height="2" />
      <rect x="10" y="3" width="3" height="2" />
      <rect x="3" y="11" width="3" height="2" />
      <rect x="10" y="11" width="3" height="2" />
      <rect x="7" y="7" width="2" height="2" />
    </svg>
  );
}

/* 48. 8-Bit Pixel Arrow Right Icon (16x16) */
export function PixelArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="2" y="7" width="8" height="2" />
      <rect x="8" y="5" width="2" height="2" />
      <rect x="10" y="6" width="2" height="2" />
      <rect x="12" y="7" width="2" height="2" />
      <rect x="10" y="8" width="2" height="2" />
      <rect x="8" y="9" width="2" height="2" />
    </svg>
  );
}

/* 49. 8-Bit Pixel Arrow Left Icon (16x16) */
export function PixelArrowLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="6" y="7" width="8" height="2" />
      <rect x="6" y="5" width="2" height="2" />
      <rect x="4" y="6" width="2" height="2" />
      <rect x="2" y="7" width="2" height="2" />
      <rect x="4" y="8" width="2" height="2" />
      <rect x="6" y="9" width="2" height="2" />
    </svg>
  );
}

/* 50. 8-Bit Pixel Pushpin / Tack Icon (16x16) */
export function PixelPushpinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Drop Shadow */}
      <rect x="9" y="11" width="3" height="2" fill="#000000" opacity="0.4" />
      <rect x="10" y="13" width="2" height="1" fill="#000000" opacity="0.3" />
      {/* Pin Needle */}
      <rect x="7" y="10" width="2" height="4" fill="#94a3b8" />
      <rect x="7" y="13" width="1" height="2" fill="#cbd5e1" />
      <rect x="8" y="14" width="1" height="1" fill="#475569" />
      {/* Pin Head Rim */}
      <rect x="4" y="8" width="8" height="2" fill="#991b1b" />
      <rect x="5" y="8" width="6" height="1" fill="#dc2626" />
      <rect x="3" y="9" width="10" height="1" fill="#7f1d1d" />
      {/* Pin Head Body */}
      <rect x="5" y="4" width="6" height="4" fill="#dc2626" />
      <rect x="6" y="3" width="4" height="2" fill="#ef4444" />
      <rect x="6" y="3" width="2" height="2" fill="#fca5a5" />
      <rect x="4" y="2" width="8" height="2" fill="#b91c1c" />
      <rect x="5" y="2" width="6" height="1" fill="#ef4444" />
      <rect x="6" y="1" width="4" height="1" fill="#fca5a5" />
      {/* Dark Pixel Outline */}
      <rect x="5" y="0" width="6" height="1" fill="#450a0a" />
      <rect x="3" y="2" width="1" height="2" fill="#450a0a" />
      <rect x="12" y="2" width="1" height="2" fill="#450a0a" />
      <rect x="3" y="10" width="10" height="1" fill="#450a0a" />
      <rect x="9" y="10" width="1" height="4" fill="#334155" />
    </svg>
  );
}

/* 51. 8-Bit Pixel Tavern Hanging Lantern (24x36) */
export function PixelTavernLanternIcon({ className = "w-6 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 36"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Iron Chain Link */}
      <rect x="11" y="0" width="2" height="3" fill="#334155" />
      <rect x="10" y="2" width="4" height="2" fill="#1e293b" />
      <rect x="11" y="4" width="2" height="3" fill="#334155" />
      <rect x="10" y="6" width="4" height="2" fill="#1e293b" />
      <rect x="11" y="8" width="2" height="2" fill="#475569" />

      {/* Top Cap & Finial */}
      <rect x="11" y="9" width="2" height="2" fill="#0f172a" />
      <rect x="9" y="10" width="6" height="2" fill="#1e293b" />
      <rect x="7" y="11" width="10" height="2" fill="#334155" />
      <rect x="5" y="13" width="14" height="2" fill="#0f172a" />
      <rect x="6" y="13" width="12" height="1" fill="#64748b" />

      {/* Glowing Lantern Glass Core */}
      <rect x="6" y="15" width="12" height="13" fill="#f59e0b" />
      <rect x="8" y="17" width="8" height="9" fill="#fbbf24" />
      <rect x="10" y="19" width="4" height="5" fill="#fef08a" />
      <rect x="11" y="20" width="2" height="3" fill="#ffffff" />

      {/* Cast Iron Struts & Cross Grille */}
      <rect x="5" y="15" width="2" height="13" fill="#0f172a" />
      <rect x="17" y="15" width="2" height="13" fill="#0f172a" />
      <rect x="11" y="15" width="2" height="13" fill="#1e293b" />
      <rect x="6" y="20" width="12" height="2" fill="#0f172a" />

      {/* Bottom Base */}
      <rect x="5" y="28" width="14" height="2" fill="#0f172a" />
      <rect x="7" y="30" width="10" height="2" fill="#1e293b" />
      <rect x="10" y="32" width="4" height="2" fill="#0f172a" />
      <rect x="11" y="34" width="2" height="2" fill="#334155" />
    </svg>
  );
}

/* 52. 8-Bit Pixel Heart Crest Sigil (Image 1 Top-Left / Bottom-Right) */
export function PixelHeartCrestIcon({ className = "w-16 h-4 text-[#4a3560]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 12"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Left dashes & diamond */}
      <rect x="4" y="5" width="2" height="2" opacity="0.6" />
      <rect x="8" y="5" width="4" height="2" opacity="0.8" />
      <rect x="14" y="4" width="2" height="4" opacity="0.9" />
      <rect x="16" y="5" width="4" height="2" opacity="0.8" />

      {/* Center Heart Crest */}
      <rect x="21" y="2" width="3" height="2" />
      <rect x="25" y="2" width="3" height="2" />
      <rect x="20" y="3" width="9" height="3" />
      <rect x="21" y="6" width="7" height="2" />
      <rect x="22" y="8" width="5" height="2" />
      <rect x="23" y="10" width="3" height="1" />
      <rect x="24" y="11" width="1" height="1" />

      {/* Right dashes & diamond */}
      <rect x="29" y="5" width="4" height="2" opacity="0.8" />
      <rect x="33" y="4" width="2" height="4" opacity="0.9" />
      <rect x="37" y="5" width="4" height="2" opacity="0.8" />
      <rect x="43" y="5" width="2" height="2" opacity="0.6" />
    </svg>
  );
}

/* 53. 8-Bit Pixel Clover / Triad Crest Sigil (Image 1 Top-Right) */
export function PixelCloverCrestIcon({ className = "w-16 h-4 text-[#4a3560]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 12"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Left arrows */}
      <rect x="4" y="5" width="2" height="2" opacity="0.5" />
      <rect x="8" y="4" width="2" height="4" opacity="0.8" />
      <rect x="12" y="3" width="2" height="6" opacity="0.9" />
      <rect x="15" y="5" width="4" height="2" opacity="0.8" />

      {/* Center 3-Leaf / Triad Crest */}
      <rect x="23" y="1" width="3" height="3" />
      <rect x="19" y="5" width="4" height="3" />
      <rect x="26" y="5" width="4" height="3" />
      <rect x="22" y="4" width="5" height="5" />
      <rect x="23" y="9" width="3" height="3" />

      {/* Right arrows */}
      <rect x="30" y="5" width="4" height="2" opacity="0.8" />
      <rect x="35" y="3" width="2" height="6" opacity="0.9" />
      <rect x="39" y="4" width="2" height="4" opacity="0.8" />
      <rect x="43" y="5" width="2" height="2" opacity="0.5" />
    </svg>
  );
}

/* 54. 8-Bit Pixel Crossed Axes / X Crest Sigil (Image 1 Bottom-Left) */
export function PixelAxesCrestIcon({ className = "w-16 h-4 text-[#4a3560]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 12"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Left side flourish */}
      <rect x="5" y="5" width="2" height="2" opacity="0.5" />
      <rect x="9" y="3" width="4" height="6" opacity="0.8" />
      <rect x="10" y="2" width="2" height="8" opacity="0.8" />
      <rect x="15" y="5" width="3" height="2" opacity="0.7" />

      {/* Center Cross / X Axes */}
      <rect x="20" y="2" width="3" height="3" />
      <rect x="26" y="2" width="3" height="3" />
      <rect x="22" y="4" width="5" height="4" />
      <rect x="20" y="7" width="3" height="3" />
      <rect x="26" y="7" width="3" height="3" />

      {/* Right side flourish */}
      <rect x="31" y="5" width="3" height="2" opacity="0.7" />
      <rect x="36" y="3" width="4" height="6" opacity="0.8" />
      <rect x="37" y="2" width="2" height="8" opacity="0.8" />
      <rect x="42" y="5" width="2" height="2" opacity="0.5" />
    </svg>
  );
}

/* 55. 8-Bit Pixel Winged / Royal Crest Sigil */
export function PixelWingedCrestIcon({ className = "w-16 h-4 text-[#4a3560]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 12"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Left Wing */}
      <rect x="4" y="2" width="4" height="2" opacity="0.7" />
      <rect x="7" y="4" width="5" height="2" opacity="0.8" />
      <rect x="11" y="5" width="6" height="2" opacity="0.9" />
      <rect x="15" y="7" width="4" height="2" />

      {/* Center Crown / Gem */}
      <rect x="23" y="1" width="3" height="2" />
      <rect x="20" y="3" width="9" height="3" />
      <rect x="22" y="6" width="5" height="3" />
      <rect x="23" y="9" width="3" height="2" />

      {/* Right Wing */}
      <rect x="30" y="7" width="4" height="2" />
      <rect x="32" y="5" width="6" height="2" opacity="0.9" />
      <rect x="37" y="4" width="5" height="2" opacity="0.8" />
      <rect x="41" y="2" width="4" height="2" opacity="0.7" />
    </svg>
  );
}

/* 56. 8-Bit Pixel Wax Seal Stamp Icon (20x20) */
export function PixelWaxSealIcon({ className = "w-6 h-6 text-red-600" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Irregular Wax Edges */}
      <rect x="6" y="1" width="8" height="2" />
      <rect x="4" y="3" width="12" height="2" />
      <rect x="2" y="5" width="16" height="10" />
      <rect x="1" y="7" width="18" height="6" />
      <rect x="4" y="15" width="12" height="2" />
      <rect x="6" y="17" width="8" height="2" />
      {/* Inner Stamp Recess */}
      <rect x="5" y="5" width="10" height="10" fill="#7f1d1d" opacity="0.5" />
      <rect x="7" y="7" width="6" height="6" fill="#fef08a" opacity="0.9" />
      <rect x="8" y="8" width="4" height="4" fill="#991b1b" />
    </svg>
  );
}

/* 57. 8-Bit Roman Laurel Triumph Wreath (Corona Triumphalis) (16x16) */
export function PixelLaurelWreathIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Left Laurel Branch */}
      <rect x="1" y="4" width="2" height="2" />
      <rect x="2" y="2" width="2" height="2" />
      <rect x="4" y="1" width="2" height="2" />
      <rect x="1" y="7" width="2" height="2" />
      <rect x="2" y="10" width="2" height="2" />
      <rect x="3" y="12" width="2" height="2" />
      <rect x="5" y="13" width="2" height="2" />
      {/* Right Laurel Branch */}
      <rect x="13" y="4" width="2" height="2" />
      <rect x="12" y="2" width="2" height="2" />
      <rect x="10" y="1" width="2" height="2" />
      <rect x="13" y="7" width="2" height="2" />
      <rect x="12" y="10" width="2" height="2" />
      <rect x="11" y="12" width="2" height="2" />
      <rect x="9" y="13" width="2" height="2" />
      {/* Bottom Roman Tie Knot */}
      <rect x="7" y="14" width="2" height="2" fill="#ef4444" />
    </svg>
  );
}

/* 58. 8-Bit Roman Architecture Column / Pillar Icon (16x16) */
export function PixelRomanColumnIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Capital (Top Architrave) */}
      <rect x="1" y="1" width="14" height="2" />
      <rect x="3" y="3" width="10" height="2" />
      {/* Fluted Shaft */}
      <rect x="4" y="5" width="2" height="7" />
      <rect x="7" y="5" width="2" height="7" />
      <rect x="10" y="5" width="2" height="7" />
      {/* Base (Pedestal) */}
      <rect x="3" y="12" width="10" height="2" />
      <rect x="1" y="14" width="14" height="2" />
    </svg>
  );
}

/* =====================================================================
   COZY FANTASY RPG PIXEL ART VECTOR ICONS (16x16)
   ===================================================================== */

/* 59. 8-Bit Pixel Anvil Icon (16x16) - Habit Strength & Forging */
export function PixelAnvilIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Anvil Horn (left) */}
      <rect x="1" y="5" width="3" height="2" />
      <rect x="2" y="6" width="2" height="1" />
      {/* Anvil Face / Flat Surface (top) */}
      <rect x="4" y="4" width="10" height="3" />
      <rect x="13" y="5" width="2" height="2" />
      {/* Waist */}
      <rect x="6" y="7" width="5" height="3" />
      {/* Base Flange */}
      <rect x="4" y="10" width="9" height="2" />
      <rect x="2" y="12" width="13" height="3" />
      {/* Highlight on Face */}
      <rect x="5" y="4" width="8" height="1" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

/* 60. 8-Bit Pixel Hourglass Icon (16x16) - Consistency & Routine Adherence */
export function PixelHourglassIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Top and Bottom Wooden Plates */}
      <rect x="2" y="1" width="12" height="2" />
      <rect x="2" y="13" width="12" height="2" />
      {/* Outer Side Pillars */}
      <rect x="2" y="3" width="2" height="10" />
      <rect x="12" y="3" width="2" height="10" />
      {/* Upper Glass Bulb */}
      <rect x="4" y="3" width="8" height="1" />
      <rect x="5" y="4" width="6" height="2" />
      <rect x="6" y="6" width="4" height="1" />
      {/* Center Neck / Pinch */}
      <rect x="7" y="7" width="2" height="2" />
      {/* Lower Glass Bulb */}
      <rect x="6" y="9" width="4" height="1" />
      <rect x="5" y="10" width="6" height="2" />
      <rect x="4" y="12" width="8" height="1" />
      {/* Golden Sand Droplets */}
      <rect x="6" y="5" width="4" height="1" fill="#ffd166" />
      <rect x="7" y="7" width="2" height="2" fill="#ffd166" />
      <rect x="6" y="11" width="4" height="1" fill="#ffd166" />
    </svg>
  );
}

/* 61. 8-Bit Pixel Quest Scroll Icon (16x16) - Active Habits / Routines */
export function PixelScrollIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Top Roll Cylinder */}
      <rect x="2" y="1" width="11" height="3" />
      <rect x="13" y="2" width="2" height="2" />
      {/* Unrolled Parchment Sheet */}
      <rect x="3" y="4" width="10" height="8" />
      {/* Inscribed Runes / Quest Lines */}
      <rect x="5" y="5" width="6" height="1" fill="#1d2d2a" opacity="0.6" />
      <rect x="5" y="7" width="5" height="1" fill="#1d2d2a" opacity="0.6" />
      <rect x="5" y="9" width="4" height="1" fill="#1d2d2a" opacity="0.6" />
      {/* Bottom Roll Cylinder */}
      <rect x="3" y="12" width="11" height="3" />
      <rect x="1" y="12" width="2" height="2" />
      {/* Red Wax Seal Ribbon */}
      <rect x="10" y="4" width="2" height="4" fill="#ef4444" />
      <rect x="9" y="8" width="4" height="2" fill="#dc2626" />
    </svg>
  );
}

/* 62. 8-Bit Pixel Campfire Icon (16x16) - Combined Streaks & Fire */
export function PixelCampfireIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Stone Ring Base */}
      <rect x="2" y="13" width="12" height="2" />
      <rect x="1" y="14" width="2" height="1" />
      <rect x="13" y="14" width="2" height="1" />
      {/* Crossed Logs */}
      <rect x="3" y="11" width="10" height="2" fill="#78350f" />
      <rect x="4" y="10" width="8" height="2" fill="#92400e" />
      {/* Outer Flame (Orange) */}
      <rect x="6" y="5" width="4" height="5" fill="#ea580c" />
      <rect x="5" y="7" width="6" height="3" fill="#ea580c" />
      <rect x="7" y="3" width="2" height="3" fill="#ea580c" />
      {/* Inner Heart Flame (Gold/Yellow) */}
      <rect x="7" y="6" width="2" height="4" fill="#facc15" />
      <rect x="6" y="8" width="4" height="2" fill="#ffd166" />
      {/* Floating Embers */}
      <rect x="4" y="3" width="1" height="1" fill="#ffb03a" />
      <rect x="11" y="4" width="1" height="1" fill="#facc15" />
      <rect x="8" y="1" width="1" height="1" fill="#ea580c" />
    </svg>
  );
}

/* 63. 8-Bit Pixel Mountain Monolith Icon (16x16) - Monastery Runic Tablet */
export function PixelMonolithIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Altar Pedestal */}
      <rect x="1" y="14" width="14" height="2" />
      <rect x="3" y="12" width="10" height="2" />
      {/* Stone Obelisk Body */}
      <rect x="5" y="3" width="6" height="9" />
      {/* Triangular Obelisk Peak */}
      <rect x="6" y="2" width="4" height="1" />
      <rect x="7" y="1" width="2" height="1" />
      {/* Glowing Runic Channels (Gold) */}
      <rect x="7" y="4" width="2" height="6" fill="#ffd166" />
      <rect x="6" y="6" width="4" height="1" fill="#ffd166" />
      <rect x="6" y="8" width="4" height="1" fill="#ffd166" />
      {/* Top Cap Rune */}
      <rect x="7" y="2" width="2" height="1" fill="#ffd166" />
    </svg>
  );
}

/* 64. 8-Bit Pixel Open Grimoire Icon (16x16) - Empty State / Tome */
export function PixelOpenGrimoireIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Bottom Leather Spine Foundation */}
      <rect x="1" y="12" width="14" height="2" />
      <rect x="7" y="13" width="2" height="2" />
      {/* Left Open Page Sheet */}
      <rect x="2" y="4" width="5" height="8" fill="#f8fafc" />
      <rect x="1" y="5" width="1" height="6" fill="#f8fafc" />
      {/* Right Open Page Sheet */}
      <rect x="9" y="4" width="5" height="8" fill="#f8fafc" />
      <rect x="14" y="5" width="1" height="6" fill="#f8fafc" />
      {/* Spine Binding */}
      <rect x="7" y="3" width="2" height="10" />
      {/* Inscribed Runes on Pages */}
      <rect x="3" y="6" width="3" height="1" fill="#334155" />
      <rect x="3" y="8" width="3" height="1" fill="#334155" />
      <rect x="3" y="10" width="2" height="1" fill="#334155" />
      <rect x="10" y="6" width="3" height="1" fill="#334155" />
      <rect x="10" y="8" width="3" height="1" fill="#334155" />
      <rect x="10" y="10" width="2" height="1" fill="#334155" />
      {/* Golden Bookmark Ribbon */}
      <rect x="7" y="10" width="2" height="4" fill="#ffb03a" />
    </svg>
  );
}

/* 65. 8-Bit Pixel Kyoto Torii Shrine & Pagoda Icon (16x16) - Habits Hero */
export function PixelGrimoireIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      style={{ imageRendering: "pixelated" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Torii Top Crossbeam (Kasagi / Shimaki) - Curved vermilion roof */}
      <rect x="1" y="2" width="14" height="1" fill="#c83a2b" />
      <rect x="0" y="3" width="16" height="1" fill="#e05344" />
      {/* Roof caps on edges (Black/Charcoal accents) */}
      <rect x="0" y="2" width="1" height="2" fill="#1f1416" />
      <rect x="15" y="2" width="1" height="2" fill="#1f1416" />

      {/* Second Horizontal Tie Beam (Nuki) */}
      <rect x="2" y="5" width="12" height="1" fill="#e05344" />
      <rect x="1" y="5" width="1" height="1" fill="#7a1c14" />
      <rect x="14" y="5" width="1" height="1" fill="#7a1c14" />

      {/* Center Sacred Tablet / Plaque (Gakuzuka) */}
      <rect x="7" y="3" width="2" height="2" fill="#1f1416" />
      <rect x="7" y="4" width="2" height="1" fill="#fba170" />

      {/* Twin Supporting Pillars (Hashira) */}
      <rect x="3" y="4" width="2" height="10" fill="#e05344" />
      <rect x="4" y="4" width="1" height="10" fill="#fba170" opacity="0.6" />
      <rect x="11" y="4" width="2" height="10" fill="#e05344" />
      <rect x="11" y="4" width="1" height="10" fill="#fba170" opacity="0.6" />

      {/* Stone Pedestal Bases (Daiishi) */}
      <rect x="2" y="14" width="3" height="2" fill="#3a2528" />
      <rect x="3" y="14" width="2" height="1" fill="#634549" />
      <rect x="11" y="14" width="3" height="2" fill="#3a2528" />
      <rect x="11" y="14" width="2" height="1" fill="#634549" />

      {/* Central Sacred Flame / Golden Lantern Glow inside */}
      <rect x="7" y="8" width="2" height="3" fill="#fba170" />
      <rect x="7" y="9" width="2" height="1" fill="#ffd166" />
      <rect x="8" y="8" width="1" height="1" fill="#ffffff" />
      {/* Lantern Hanging Cord & Base */}
      <rect x="7" y="6" width="2" height="2" fill="#7a1c14" />
      <rect x="7" y="11" width="2" height="1" fill="#3a2528" />

      {/* Floating Sakura Petal Sparks */}
      <rect x="6" y="13" width="1" height="1" fill="#f472b6" />
      <rect x="9" y="12" width="1" height="1" fill="#fce7f3" />
      <rect x="1" y="8" width="1" height="1" fill="#f472b6" opacity="0.8" />
      <rect x="14" y="9" width="1" height="1" fill="#f472b6" opacity="0.8" />
    </svg>
  );
}

/* 66. 8-Bit Pixel Adventurer Compass Icon (16x16) - ALL Category */
export function PixelCompassIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Top Ring Loop */}
      <rect x="7" y="0" width="2" height="2" />
      {/* Circular Brass Casing */}
      <rect x="5" y="2" width="6" height="1" />
      <rect x="3" y="3" width="10" height="1" />
      <rect x="2" y="4" width="12" height="8" />
      <rect x="3" y="12" width="10" height="1" />
      <rect x="5" y="13" width="6" height="1" />
      {/* Inner Dial (Dark) */}
      <rect x="4" y="4" width="8" height="8" fill="#1e293b" />
      {/* Cardinal Star Ticks */}
      <rect x="7" y="4" width="2" height="1" fill="#94a3b8" />
      <rect x="7" y="11" width="2" height="1" fill="#94a3b8" />
      <rect x="4" y="7" width="1" height="2" fill="#94a3b8" />
      <rect x="11" y="7" width="1" height="2" fill="#94a3b8" />
      {/* North Needle (Red) */}
      <rect x="7" y="5" width="2" height="3" fill="#ef4444" />
      {/* South Needle (Silver) */}
      <rect x="7" y="8" width="2" height="3" fill="#cbd5e1" />
      {/* Center Brass Pivot */}
      <rect x="7" y="7" width="2" height="2" fill="#ffd166" />
    </svg>
  );
}

/* 67. 8-Bit Pixel Health Potion Icon (16x16) - Health Category */
export function PixelPotionIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Wooden Cork Stopper */}
      <rect x="6" y="1" width="4" height="2" fill="#b45309" />
      {/* Bottle Lip & Neck */}
      <rect x="5" y="3" width="6" height="1" />
      <rect x="6" y="4" width="4" height="2" />
      {/* Glass Shoulders */}
      <rect x="4" y="6" width="8" height="1" />
      {/* Flask Body */}
      <rect x="3" y="7" width="10" height="6" />
      <rect x="4" y="13" width="8" height="2" />
      {/* Crimson Elixir Liquid */}
      <rect x="4" y="8" width="8" height="5" fill="#ef4444" />
      <rect x="5" y="13" width="6" height="1" fill="#dc2626" />
      {/* Highlight Bubble */}
      <rect x="5" y="9" width="1" height="2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

/* 68. 8-Bit Pixel Crossed Swords Icon (16x16) - Fitness Category */
export function PixelCrossedSwordsIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Sword 1: Top-Left to Bottom-Right */}
      <rect x="13" y="2" width="2" height="2" fill="#e2e8f0" />
      <rect x="11" y="4" width="2" height="2" fill="#cbd5e1" />
      <rect x="9" y="6" width="2" height="2" fill="#94a3b8" />
      <rect x="7" y="8" width="2" height="2" fill="#64748b" />
      <rect x="5" y="10" width="2" height="2" fill="#ffd166" />
      <rect x="3" y="10" width="2" height="2" fill="#ffd166" />
      <rect x="5" y="12" width="2" height="2" fill="#ffd166" />
      <rect x="2" y="13" width="2" height="2" fill="#78350f" />

      {/* Sword 2: Top-Right to Bottom-Left */}
      <rect x="1" y="2" width="2" height="2" fill="#e2e8f0" />
      <rect x="3" y="4" width="2" height="2" fill="#cbd5e1" />
      <rect x="5" y="6" width="2" height="2" fill="#94a3b8" />
      <rect x="9" y="10" width="2" height="2" fill="#ffd166" />
      <rect x="11" y="10" width="2" height="2" fill="#ffd166" />
      <rect x="9" y="12" width="2" height="2" fill="#ffd166" />
      <rect x="12" y="13" width="2" height="2" fill="#78350f" />
    </svg>
  );
}

/* 69. 8-Bit Pixel Quill & Inkwell Icon (16x16) - Productivity Category */
export function PixelQuillIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Feather Plume Top */}
      <rect x="12" y="1" width="3" height="3" fill="#f8fafc" />
      <rect x="10" y="3" width="3" height="3" fill="#e2e8f0" />
      <rect x="8" y="5" width="3" height="3" fill="#cbd5e1" />
      {/* Feather Vane Highlights */}
      <rect x="13" y="2" width="1" height="1" fill="#ffd166" />
      <rect x="11" y="4" width="1" height="1" fill="#ffd166" />
      {/* Quill Shaft / Nib */}
      <rect x="6" y="8" width="2" height="2" fill="#94a3b8" />
      <rect x="4" y="10" width="2" height="2" fill="#475569" />
      <rect x="3" y="12" width="1" height="2" fill="#1e293b" />
      {/* Inkwell Pot (Right) */}
      <rect x="8" y="11" width="6" height="4" />
      <rect x="9" y="10" width="4" height="1" fill="#475569" />
      <rect x="10" y="12" width="2" height="2" fill="#38bdf8" />
    </svg>
  );
}

/* 70. 8-Bit Pixel Lotus / Mindset Icon (16x16) - Mindset Category */
export function PixelLotusIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Center Petal Peak */}
      <rect x="7" y="2" width="2" height="2" fill="#f472b6" />
      <rect x="6" y="4" width="4" height="6" fill="#ec4899" />
      <rect x="7" y="5" width="2" height="4" fill="#fbcfe8" />
      {/* Left Wing Petal */}
      <rect x="3" y="5" width="2" height="2" fill="#f472b6" />
      <rect x="2" y="7" width="4" height="4" fill="#db2777" />
      {/* Right Wing Petal */}
      <rect x="11" y="5" width="2" height="2" fill="#f472b6" />
      <rect x="10" y="7" width="4" height="4" fill="#db2777" />
      {/* Base Calyx / Water Lily Pad */}
      <rect x="4" y="11" width="8" height="2" fill="#10b981" />
      <rect x="2" y="13" width="12" height="2" fill="#047857" />
    </svg>
  );
}

/* 71. 8-Bit Pixel Coin Pouch Icon (16x16) - Finance Category */
export function PixelCoinPouchIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Gathered Neck / Frill */}
      <rect x="5" y="2" width="6" height="2" fill="#b45309" />
      <rect x="6" y="1" width="4" height="1" fill="#d97706" />
      {/* Gold Drawstring Tie */}
      <rect x="4" y="4" width="8" height="1" fill="#facc15" />
      <rect x="10" y="5" width="2" height="2" fill="#facc15" />
      {/* Leather Pouch Body */}
      <rect x="3" y="5" width="10" height="2" fill="#92400e" />
      <rect x="2" y="7" width="12" height="6" fill="#78350f" />
      <rect x="4" y="13" width="8" height="2" fill="#92400e" />
      {/* Gold Coin Emboss Sigil */}
      <rect x="6" y="8" width="4" height="4" fill="#ffd166" />
      <rect x="7" y="9" width="2" height="2" fill="#f59e0b" />
    </svg>
  );
}

/* 72. 8-Bit Pixel Sunrise Dawn Icon (16x16) - Daily Routine Category */
export function PixelSunriseIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Sun Crown / Beams */}
      <rect x="7" y="1" width="2" height="2" fill="#facc15" />
      <rect x="3" y="3" width="2" height="2" fill="#facc15" />
      <rect x="11" y="3" width="2" height="2" fill="#facc15" />
      <rect x="1" y="6" width="2" height="2" fill="#facc15" />
      <rect x="13" y="6" width="2" height="2" fill="#facc15" />
      {/* Rising Sun Disk */}
      <rect x="5" y="4" width="6" height="6" fill="#f59e0b" />
      <rect x="6" y="5" width="4" height="4" fill="#fef08a" />
      {/* Mountain Ridge Horizon */}
      <rect x="0" y="10" width="4" height="6" fill="#334155" />
      <rect x="4" y="9" width="3" height="7" fill="#475569" />
      <rect x="7" y="11" width="4" height="5" fill="#1e293b" />
      <rect x="11" y="8" width="5" height="8" fill="#334155" />
    </svg>
  );
}

/* 73. 8-Bit Pixel Moon & Star Icon (16x16) - Sleep / Rest Routines */
export function PixelMoonSleepIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Crescent Moon */}
      <rect x="5" y="1" width="4" height="2" fill="#fef08a" />
      <rect x="3" y="3" width="4" height="2" fill="#fef08a" />
      <rect x="2" y="5" width="4" height="6" fill="#fde047" />
      <rect x="3" y="11" width="4" height="2" fill="#fef08a" />
      <rect x="5" y="13" width="4" height="2" fill="#fef08a" />
      {/* Deep Inner Cutout Shadow */}
      <rect x="6" y="4" width="4" height="8" fill="#0f172a" />
      <rect x="7" y="3" width="3" height="10" fill="#0f172a" />
      {/* Twinkling Star 1 */}
      <rect x="12" y="3" width="1" height="3" fill="#67e8f9" />
      <rect x="11" y="4" width="3" height="1" fill="#67e8f9" />
      {/* Twinkling Star 2 */}
      <rect x="11" y="10" width="2" height="2" fill="#a5f3fc" />
    </svg>
  );
}

/* 74. 8-Bit Pixel Water Droplet Icon (16x16) - Hydration Routines */
export function PixelWaterDropIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Teardrop Tip */}
      <rect x="7" y="1" width="2" height="2" fill="#38bdf8" />
      <rect x="6" y="3" width="4" height="2" fill="#0ea5e9" />
      {/* Droplet Expanding Belly */}
      <rect x="4" y="5" width="8" height="3" fill="#0284c7" />
      <rect x="3" y="8" width="10" height="5" fill="#0369a1" />
      {/* Droplet Rounded Base */}
      <rect x="4" y="13" width="8" height="2" fill="#075985" />
      <rect x="6" y="15" width="4" height="1" fill="#0c4a6e" />
      {/* Specular Highlight */}
      <rect x="5" y="6" width="2" height="4" fill="#e0f2fe" />
      <rect x="5" y="10" width="1" height="2" fill="#e0f2fe" />
    </svg>
  );
}

/* 75. 8-Bit Pixel Winged Adventurer Boot Icon (16x16) - Walking / Running */
export function PixelRunningBootIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Boot Shaft */}
      <rect x="4" y="2" width="5" height="7" fill="#78350f" />
      <rect x="4" y="2" width="5" height="1" fill="#b45309" />
      {/* Laces / Buckles */}
      <rect x="8" y="4" width="2" height="1" fill="#ffd166" />
      <rect x="8" y="6" width="2" height="1" fill="#ffd166" />
      {/* Heel & Sole */}
      <rect x="2" y="9" width="11" height="4" fill="#92400e" />
      <rect x="13" y="11" width="2" height="2" fill="#92400e" />
      {/* Heavy Tread Sole */}
      <rect x="2" y="13" width="13" height="2" fill="#1e293b" />
      <rect x="2" y="14" width="2" height="2" fill="#0f172a" />
      {/* Speed Wing Flutter (Top-Left) */}
      <rect x="1" y="2" width="3" height="2" fill="#38bdf8" />
      <rect x="0" y="4" width="3" height="2" fill="#bae6fd" />
    </svg>
  );
}

/* 76. 8-Bit Pixel Harvest Apple Icon (16x16) - Nutrition / Healthy Diet */
export function PixelAppleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Green Leaf */}
      <rect x="9" y="1" width="3" height="2" fill="#22c55e" />
      <rect x="8" y="2" width="2" height="1" fill="#16a34a" />
      {/* Brown Stem */}
      <rect x="7" y="2" width="2" height="3" fill="#78350f" />
      {/* Apple Shoulders */}
      <rect x="4" y="5" width="8" height="2" fill="#ef4444" />
      <rect x="3" y="6" width="10" height="6" fill="#dc2626" />
      {/* Apple Lower Base */}
      <rect x="4" y="12" width="8" height="2" fill="#b91c1c" />
      <rect x="5" y="14" width="2" height="1" fill="#991b1b" />
      <rect x="9" y="14" width="2" height="1" fill="#991b1b" />
      {/* Specular Highlight */}
      <rect x="5" y="6" width="2" height="3" fill="#fca5a5" />
    </svg>
  );
}

/* 77. 8-Bit Pixel Code Terminal Brackets Icon (16x16) - Programming */
export function PixelCodeBracketsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Left Angle Bracket < */}
      <rect x="4" y="3" width="2" height="2" fill="#38bdf8" />
      <rect x="2" y="5" width="2" height="2" fill="#38bdf8" />
      <rect x="1" y="7" width="2" height="2" fill="#38bdf8" />
      <rect x="2" y="9" width="2" height="2" fill="#38bdf8" />
      <rect x="4" y="11" width="2" height="2" fill="#38bdf8" />
      {/* Right Angle Bracket > */}
      <rect x="10" y="3" width="2" height="2" fill="#38bdf8" />
      <rect x="12" y="5" width="2" height="2" fill="#38bdf8" />
      <rect x="13" y="7" width="2" height="2" fill="#38bdf8" />
      <rect x="12" y="9" width="2" height="2" fill="#38bdf8" />
      <rect x="10" y="11" width="2" height="2" fill="#38bdf8" />
      {/* Slash / */}
      <rect x="8" y="5" width="2" height="2" fill="#ffd166" />
      <rect x="7" y="7" width="2" height="2" fill="#ffd166" />
      <rect x="6" y="9" width="2" height="2" fill="#ffd166" />
    </svg>
  );
}

/* 78. 8-Bit Pixel Gear Mechanism Icon (16x16) - Options Menu */
export function PixelGearIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Top and Bottom Cogs */}
      <rect x="6" y="1" width="4" height="2" />
      <rect x="6" y="13" width="4" height="2" />
      {/* Left and Right Cogs */}
      <rect x="1" y="6" width="2" height="4" />
      <rect x="13" y="6" width="2" height="4" />
      {/* Diagonal Corner Cogs */}
      <rect x="3" y="3" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
      {/* Gear Outer Disk */}
      <rect x="4" y="4" width="8" height="8" />
      {/* Axle Hole Cutout */}
      <rect x="7" y="7" width="2" height="2" fill="#0f172a" />
    </svg>
  );
}

/* 79. 8-Bit Pixel Pause Bars Icon (16x16) - Pause Action */
export function PixelPauseIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="3" y="3" width="3" height="10" />
      <rect x="10" y="3" width="3" height="10" />
    </svg>
  );
}

/* 80. 8-Bit Pixel Play Arrow Icon (16x16) - Resume Action */
export function PixelPlayIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="4" y="3" width="2" height="10" />
      <rect x="6" y="4" width="2" height="8" />
      <rect x="8" y="5" width="2" height="6" />
      <rect x="10" y="6" width="2" height="4" />
      <rect x="12" y="7" width="1" height="2" />
    </svg>
  );
}

/* 81. 8-Bit Pixel Storage Chest / Archive Icon (16x16) - Archive Action */
export function PixelArchiveIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Lid */}
      <rect x="2" y="2" width="12" height="4" />
      {/* Chest Body */}
      <rect x="3" y="6" width="10" height="7" />
      <rect x="2" y="13" width="12" height="1" />
      {/* Latch */}
      <rect x="7" y="5" width="2" height="3" fill="#ffd166" />
    </svg>
  );
}

/* 82. 8-Bit Pixel Skip Forward Icon (16x16) - Scriptorium Phase Skip */
export function PixelSkipForwardIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="3" y="3" width="2" height="10" />
      <rect x="5" y="4" width="2" height="8" />
      <rect x="7" y="5" width="2" height="6" />
      <rect x="9" y="6" width="2" height="4" />
      <rect x="11" y="7" width="1" height="2" />
      <rect x="12" y="3" width="2" height="10" />
    </svg>
  );
}

/* 83. 8-Bit Pixel Cozy Teacup & Steam Icon (16x16) - Short Respite Mode */
export function PixelTeacupIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Rising Steam */}
      <rect x="5" y="0" width="1" height="2" fill="#ffd166" opacity="0.85" />
      <rect x="6" y="1" width="1" height="1" fill="#ffd166" opacity="0.85" />
      <rect x="8" y="0" width="1" height="2" fill="#ffd166" opacity="0.85" />
      <rect x="9" y="1" width="1" height="1" fill="#ffd166" opacity="0.85" />
      {/* Teacup Rim */}
      <rect x="3" y="3" width="8" height="2" />
      {/* Teacup Basin & Brew */}
      <rect x="3" y="5" width="8" height="6" />
      <rect x="4" y="4" width="6" height="2" fill="#b45309" />
      <rect x="4" y="11" width="6" height="1" />
      {/* Teacup Handle */}
      <rect x="11" y="5" width="3" height="1" />
      <rect x="13" y="6" width="1" height="3" />
      <rect x="11" y="9" width="3" height="1" />
      {/* Saucer */}
      <rect x="2" y="12" width="10" height="2" />
    </svg>
  );
}

/* 84. 8-Bit Pixel Runic Eye Icon (16x16) - Archivist Focus Mode */
export function PixelEyeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Eye Upper Contour */}
      <rect x="6" y="3" width="4" height="2" />
      <rect x="3" y="4" width="3" height="2" />
      <rect x="10" y="4" width="3" height="2" />
      <rect x="1" y="6" width="2" height="2" />
      <rect x="13" y="6" width="2" height="2" />
      {/* Eye Lower Contour */}
      <rect x="1" y="8" width="2" height="2" />
      <rect x="13" y="8" width="2" height="2" />
      <rect x="3" y="10" width="3" height="2" />
      <rect x="10" y="10" width="3" height="2" />
      <rect x="6" y="11" width="4" height="2" />
      {/* Iris & Pupil */}
      <rect x="6" y="6" width="4" height="4" fill="#ffd166" />
      <rect x="7" y="7" width="2" height="2" fill="#140804" />
      <rect x="7" y="6" width="1" height="1" fill="#ffffff" />
    </svg>
  );
}

/* 85. 8-Bit Pixel Blinded / Eye Off Icon (16x16) - Archivist Strict Dimming */
export function PixelEyeOffIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="6" y="3" width="4" height="2" />
      <rect x="3" y="4" width="3" height="2" />
      <rect x="10" y="4" width="3" height="2" />
      <rect x="1" y="6" width="2" height="2" />
      <rect x="13" y="6" width="2" height="2" />
      <rect x="1" y="8" width="2" height="2" />
      <rect x="13" y="8" width="2" height="2" />
      <rect x="3" y="10" width="3" height="2" />
      <rect x="10" y="10" width="3" height="2" />
      <rect x="6" y="11" width="4" height="2" />
      {/* Diagonal Blindfold Strike Line */}
      <rect x="2" y="2" width="2" height="2" fill="#ef4444" />
      <rect x="4" y="4" width="2" height="2" fill="#ef4444" />
      <rect x="6" y="6" width="2" height="2" fill="#ef4444" />
      <rect x="8" y="8" width="2" height="2" fill="#ef4444" />
      <rect x="10" y="10" width="2" height="2" fill="#ef4444" />
      <rect x="12" y="12" width="2" height="2" fill="#ef4444" />
    </svg>
  );
}

/* 86. 8-Bit Pixel Cerebral Brain Icon (16x16) - Neuroscience & Flow State */
export function PixelBrainIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Left Hemisphere */}
      <rect x="3" y="3" width="4" height="2" />
      <rect x="2" y="5" width="5" height="3" />
      <rect x="2" y="8" width="5" height="3" />
      <rect x="3" y="11" width="4" height="2" />
      {/* Right Hemisphere */}
      <rect x="9" y="3" width="4" height="2" />
      <rect x="9" y="5" width="5" height="3" />
      <rect x="9" y="8" width="5" height="3" />
      <rect x="9" y="11" width="4" height="2" />
      {/* Central Division */}
      <rect x="7" y="3" width="2" height="10" fill="#140804" />
      {/* Synaptic Highlights */}
      <rect x="4" y="6" width="2" height="1" fill="#f472b6" />
      <rect x="10" y="6" width="2" height="1" fill="#f472b6" />
      <rect x="4" y="9" width="2" height="1" fill="#f472b6" />
      <rect x="10" y="9" width="2" height="1" fill="#f472b6" />
    </svg>
  );
}

/* 87. 8-Bit Pixel Guild Satchel / Briefcase Icon (16x16) - Work Discipline */
export function PixelBriefcaseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Handle */}
      <rect x="6" y="2" width="4" height="1" />
      <rect x="5" y="3" width="2" height="1" />
      <rect x="9" y="3" width="2" height="1" />
      {/* Case Body */}
      <rect x="2" y="4" width="12" height="10" />
      <rect x="3" y="14" width="10" height="1" />
      {/* Flap Divider */}
      <rect x="2" y="8" width="12" height="1" fill="#3a1a08" />
      {/* Dual Brass Buckles */}
      <rect x="4" y="7" width="2" height="3" fill="#ffd166" />
      <rect x="10" y="7" width="2" height="3" fill="#ffd166" />
    </svg>
  );
}

/* 88. 8-Bit Pixel Chain Link Icon (16x16) - Quest Tethering */
export function PixelLinkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Top-Right Loop */}
      <rect x="7" y="2" width="5" height="2" />
      <rect x="11" y="2" width="2" height="5" />
      <rect x="7" y="5" width="5" height="2" />
      <rect x="7" y="3" width="2" height="3" />
      {/* Center Tether Pin */}
      <rect x="6" y="6" width="4" height="2" fill="#ffd166" />
      {/* Bottom-Left Loop */}
      <rect x="3" y="7" width="5" height="2" />
      <rect x="2" y="7" width="2" height="5" />
      <rect x="2" y="11" width="5" height="2" />
      <rect x="7" y="9" width="2" height="3" />
    </svg>
  );
}

/* 89. 8-Bit Pixel Broken Chain / Unlink Icon (16x16) - Quest Untethering */
export function PixelUnlinkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Upper Severed Link */}
      <rect x="8" y="2" width="5" height="2" />
      <rect x="12" y="2" width="2" height="4" />
      <rect x="9" y="5" width="4" height="2" />
      <rect x="8" y="3" width="2" height="3" />
      {/* Lower Severed Link */}
      <rect x="2" y="9" width="4" height="2" />
      <rect x="2" y="9" width="2" height="4" />
      <rect x="3" y="12" width="5" height="2" />
      <rect x="6" y="10" width="2" height="3" />
      {/* Shatter Shards (Red) */}
      <rect x="6" y="6" width="2" height="2" fill="#ef4444" />
      <rect x="8" y="8" width="2" height="2" fill="#ef4444" />
    </svg>
  );
}

/* 90. 8-Bit Pixel Rain Cloud Icon (16x16) - Stained Glass Rain Soundscape */
export function PixelRainCloudIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Cloud Billows */}
      <rect x="5" y="2" width="6" height="2" fill="#94a3b8" />
      <rect x="3" y="4" width="10" height="2" fill="#94a3b8" />
      <rect x="2" y="6" width="12" height="3" fill="#64748b" />
      <rect x="3" y="9" width="10" height="1" fill="#475569" />
      {/* Rain Droplets (Cyan) */}
      <rect x="4" y="11" width="1" height="2" fill="#38bdf8" />
      <rect x="3" y="14" width="1" height="2" fill="#38bdf8" />
      <rect x="8" y="11" width="1" height="3" fill="#38bdf8" />
      <rect x="7" y="15" width="1" height="1" fill="#38bdf8" />
      <rect x="12" y="11" width="1" height="2" fill="#38bdf8" />
      <rect x="11" y="14" width="1" height="2" fill="#38bdf8" />
    </svg>
  );
}

/* 91. 8-Bit Pixel Temple Bell Icon (16x16) - Monastery 528Hz Soundscape */
export function PixelBellIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Hanger Ring */}
      <rect x="7" y="1" width="2" height="2" />
      {/* Bell Cap & Flange */}
      <rect x="6" y="3" width="4" height="2" />
      <rect x="5" y="5" width="6" height="4" />
      <rect x="4" y="9" width="8" height="2" />
      <rect x="3" y="11" width="10" height="2" />
      {/* Clapper */}
      <rect x="7" y="13" width="2" height="2" fill="#ffd166" />
      {/* Resonance Chimes */}
      <rect x="1" y="6" width="1" height="3" fill="#ffd166" opacity="0.8" />
      <rect x="14" y="6" width="1" height="3" fill="#ffd166" opacity="0.8" />
    </svg>
  );
}

/* 92. 8-Bit Pixel Volume Speaker Icon (16x16) - Soundscape Fader Active */
export function PixelVolumeHighIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Speaker Cone */}
      <rect x="1" y="6" width="3" height="4" />
      <rect x="4" y="5" width="2" height="6" />
      <rect x="6" y="4" width="2" height="8" />
      <rect x="7" y="3" width="1" height="10" />
      {/* Sound Waves */}
      <rect x="10" y="5" width="1" height="6" fill="#ffd166" />
      <rect x="12" y="3" width="1" height="10" fill="#ffd166" />
      <rect x="14" y="1" width="1" height="14" fill="#ffd166" />
    </svg>
  );
}

/* 93. 8-Bit Pixel Volume Muted Speaker Icon (16x16) - Soundscape Silence */
export function PixelVolumeMuteIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Speaker Cone */}
      <rect x="1" y="6" width="3" height="4" />
      <rect x="4" y="5" width="2" height="6" />
      <rect x="6" y="4" width="2" height="8" />
      <rect x="7" y="3" width="1" height="10" />
      {/* Red Mute X */}
      <rect x="10" y="6" width="2" height="2" fill="#ef4444" />
      <rect x="13" y="6" width="2" height="2" fill="#ef4444" />
      <rect x="11" y="7" width="3" height="2" fill="#ef4444" />
      <rect x="10" y="9" width="2" height="2" fill="#ef4444" />
      <rect x="13" y="9" width="2" height="2" fill="#ef4444" />
    </svg>
  );
}

/* 94. 8-Bit Pixel Clockwork Pocket Watch Icon (16x16) - Chronometer / Time */
export function PixelClockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Top winding crown / knob */}
      <rect x="7" y="0" width="2" height="1" fill="#f59e0b" />
      <rect x="6" y="1" width="4" height="1" fill="#b45309" />
      {/* Outer bezel ring */}
      <rect x="5" y="2" width="6" height="1" fill="#f59e0b" />
      <rect x="3" y="3" width="2" height="1" fill="#f59e0b" />
      <rect x="11" y="3" width="2" height="1" fill="#f59e0b" />
      <rect x="2" y="4" width="1" height="2" fill="#f59e0b" />
      <rect x="13" y="4" width="1" height="2" fill="#f59e0b" />
      <rect x="1" y="6" width="1" height="4" fill="#f59e0b" />
      <rect x="14" y="6" width="1" height="4" fill="#f59e0b" />
      <rect x="2" y="10" width="1" height="2" fill="#f59e0b" />
      <rect x="13" y="10" width="1" height="2" fill="#f59e0b" />
      <rect x="3" y="12" width="2" height="1" fill="#f59e0b" />
      <rect x="11" y="12" width="2" height="1" fill="#f59e0b" />
      <rect x="5" y="13" width="6" height="1" fill="#f59e0b" />
      {/* Inner dial shading */}
      <rect x="3" y="4" width="10" height="8" fill="#140803" />
      <rect x="2" y="6" width="12" height="4" fill="#140803" />
      {/* 12, 3, 6, 9 tick marks */}
      <rect x="7" y="4" width="2" height="1" fill="#ffd166" />
      <rect x="11" y="7" width="1" height="2" fill="#ffd166" />
      <rect x="7" y="11" width="2" height="1" fill="#ffd166" />
      <rect x="4" y="7" width="1" height="2" fill="#ffd166" />
      {/* Hands at center */}
      <rect x="7" y="7" width="2" height="2" fill="#f59e0b" />
      <rect x="7" y="5" width="1" height="2" fill="#fef08a" />
      <rect x="8" y="7" width="3" height="1" fill="#fef08a" />
    </svg>
  );
}

/* 95. 8-Bit Pixel Headphones Icon (16x16) - Soundscapes / Audio */
export function PixelHeadphonesIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Arch Headband */}
      <rect x="5" y="1" width="6" height="2" fill="#ffd166" />
      <rect x="3" y="2" width="2" height="2" fill="#f59e0b" />
      <rect x="11" y="2" width="2" height="2" fill="#f59e0b" />
      <rect x="2" y="4" width="2" height="4" fill="#b45309" />
      <rect x="12" y="4" width="2" height="4" fill="#b45309" />
      {/* Ear Cups */}
      <rect x="1" y="7" width="4" height="6" fill="#f59e0b" />
      <rect x="2" y="8" width="2" height="4" fill="#140803" />
      <rect x="11" y="7" width="4" height="6" fill="#f59e0b" />
      <rect x="12" y="8" width="2" height="4" fill="#140803" />
    </svg>
  );
}

/* 96. 8-Bit Pixel Minus / Decrease Icon (16x16) */
export function PixelMinusIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="3" y="7" width="10" height="2" />
    </svg>
  );
}

/* 97. 8-Bit Pixel Waterfall / Cascading Mist Icon (16x16) - Somatic Sanctuary */
export function PixelWaterfallIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Mountain rock ledge */}
      <rect x="1" y="1" width="14" height="2" fill="#543d30" />
      <rect x="3" y="3" width="10" height="1" fill="#78695d" />
      {/* Cascading water streams */}
      <rect x="3" y="4" width="2" height="8" fill="#38bdf8" />
      <rect x="7" y="4" width="2" height="9" fill="#67e8f9" />
      <rect x="11" y="4" width="2" height="7" fill="#38bdf8" />
      {/* Pool splash at bottom */}
      <rect x="1" y="12" width="14" height="3" fill="#0284c7" />
      <rect x="2" y="11" width="4" height="2" fill="#bae6fd" />
      <rect x="10" y="11" width="4" height="2" fill="#bae6fd" />
    </svg>
  );
}

/* 98. 8-Bit Pixel Victory Trophy Chalice Icon (16x16) */
export function PixelTrophyIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Top Rim */}
      <rect x="4" y="2" width="8" height="1" />
      {/* Cup Main Body */}
      <rect x="3" y="3" width="10" height="3" />
      <rect x="4" y="6" width="8" height="2" />
      <rect x="6" y="8" width="4" height="2" />
      {/* Handles */}
      <rect x="1" y="3" width="2" height="1" />
      <rect x="1" y="4" width="1" height="3" />
      <rect x="2" y="6" width="2" height="1" />
      <rect x="13" y="3" width="2" height="1" />
      <rect x="14" y="4" width="1" height="3" />
      <rect x="12" y="6" width="2" height="1" />
      {/* Stem */}
      <rect x="7" y="10" width="2" height="2" />
      {/* Pedestal Foot */}
      <rect x="5" y="12" width="6" height="2" />
      <rect x="4" y="14" width="8" height="1" />
      {/* Specular Highlight */}
      <rect x="5" y="3" width="1" height="3" fill="#ffffff" fillOpacity="0.4" />
    </svg>
  );
}

/* 99. 8-Bit Pixel Loader / Rotating Sun Wheel Icon (16x16) */
export function PixelSpinnerIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`${className} animate-spin`}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="7" y="1" width="2" height="3" />
      <rect x="11" y="2" width="2" height="2" opacity="0.85" />
      <rect x="12" y="7" width="3" height="2" opacity="0.7" />
      <rect x="11" y="11" width="2" height="2" opacity="0.55" />
      <rect x="7" y="12" width="2" height="3" opacity="0.4" />
      <rect x="3" y="11" width="2" height="2" opacity="0.3" />
      <rect x="1" y="7" width="3" height="2" opacity="0.2" />
      <rect x="3" y="3" width="2" height="2" opacity="0.15" />
      {/* Core */}
      <rect x="6" y="6" width="4" height="4" />
    </svg>
  );
}

/* 100. 8-Bit Pixel Ascend Tower Spire Logo (24x24) */
export function PixelTowerSpireLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Arcane Apex Beacon (Pulsing Gold/Amber) */}
      <rect x="11" y="1" width="2" height="2" fill="#fef08a" />
      <rect x="10" y="2" width="4" height="2" fill="#ffd166" />
      <rect x="11" y="4" width="2" height="1" fill="#f59e0b" />

      {/* Spire Roof Cone */}
      <rect x="10" y="5" width="4" height="2" fill="#d97706" />
      <rect x="9" y="7" width="6" height="2" fill="#b45309" />
      <rect x="8" y="9" width="8" height="2" fill="#92400e" />

      {/* Spire Crown & Crenellations (Battlements) */}
      <rect x="6" y="11" width="3" height="3" fill="#604735" />
      <rect x="10" y="11" width="4" height="2" fill="#433125" />
      <rect x="15" y="11" width="3" height="3" fill="#604735" />
      <rect x="6" y="13" width="12" height="2" fill="#785942" />

      {/* Tower Shaft Masonry */}
      <rect x="7" y="15" width="10" height="4" fill="#523c2d" />
      {/* Glowing Runed Slit Window */}
      <rect x="11" y="15" width="2" height="3" fill="#ffd166" />
      <rect x="11" y="15" width="2" height="1" fill="#ffffff" />

      {/* Lower Fortress Rampart */}
      <rect x="5" y="19" width="14" height="3" fill="#402f23" />
      {/* Fortress Iron Portcullis Portal */}
      <rect x="10" y="19" width="4" height="3" fill="#18110b" />
      <rect x="11" y="19" width="2" height="2" fill="#d97706" opacity="0.8" />

      {/* Solid Granite Foundation Plinth */}
      <rect x="3" y="22" width="18" height="2" fill="#2d1f16" />
      <rect x="4" y="22" width="16" height="1" fill="#604735" />
    </svg>
  );
}

/* 106. 8-Bit Pixel Adventurer Pack / Haversack Rucksack Icon (24x24) */
export function PixelAdventurerPackIcon({
  className = "w-6 h-6",
  variant = "pixel-art",
}: {
  className?: string;
  variant?: "pixel-art" | "silhouette";
}) {
  if (variant === "silhouette") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        style={{ imageRendering: "pixelated" }}
      >
        {/* Top Handle Loop */}
        <rect x="10" y="1" width="4" height="1" />
        <rect x="10" y="2" width="1" height="1" />
        <rect x="13" y="2" width="1" height="1" />

        {/* Top Bedroll Blanket Roll */}
        <rect x="4" y="2" width="16" height="4" />
        {/* Cutouts for blanket straps */}
        <rect x="8" y="2" width="1" height="4" fill="var(--bg-cutout, #f59e0b)" />
        <rect x="15" y="2" width="1" height="4" fill="var(--bg-cutout, #f59e0b)" />

        {/* Main Pack Body */}
        <rect x="4" y="6" width="16" height="15" />
        <rect x="5" y="21" width="14" height="1" />

        {/* Side Pouches */}
        <rect x="2" y="11" width="3" height="7" />
        <rect x="19" y="11" width="3" height="7" />

        {/* Flap & Straps Cutout Lines */}
        <rect x="5" y="11" width="2" height="1" fill="var(--bg-cutout, #f59e0b)" />
        <rect x="17" y="11" width="2" height="1" fill="var(--bg-cutout, #f59e0b)" />
        <rect x="7" y="10" width="2" height="3" fill="var(--bg-cutout, #f59e0b)" />
        <rect x="15" y="10" width="2" height="3" fill="var(--bg-cutout, #f59e0b)" />

        {/* Center Pouch Cutouts */}
        <rect x="9" y="13" width="6" height="1" fill="var(--bg-cutout, #f59e0b)" />
        <rect x="9" y="18" width="6" height="1" fill="var(--bg-cutout, #f59e0b)" />
        <rect x="11" y="14" width="2" height="1" fill="var(--bg-cutout, #f59e0b)" />

        {/* Lower Strap Tips */}
        <rect x="7" y="18" width="2" height="2" fill="var(--bg-cutout, #f59e0b)" />
        <rect x="15" y="18" width="2" height="2" fill="var(--bg-cutout, #f59e0b)" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* 1. Top Leather Carry Handle */}
      <rect x="10" y="0" width="4" height="1" fill="#2d1508" />
      <rect x="9" y="1" width="2" height="1" fill="#2d1508" />
      <rect x="13" y="1" width="2" height="1" fill="#2d1508" />
      <rect x="11" y="1" width="2" height="1" fill="#8c3e0c" />

      {/* 2. Rolled Traveler's Bedroll / Wool Blanket */}
      {/* Bedroll Outline */}
      <rect x="4" y="2" width="16" height="4" fill="#181310" />
      {/* Blanket Fabric (Weathered Slate Wool) */}
      <rect x="5" y="3" width="14" height="2" fill="#44403c" />
      {/* Blanket Top Highlight */}
      <rect x="5" y="2" width="14" height="1" fill="#78716c" />
      {/* Left Blanket Spiral Roll End */}
      <rect x="4" y="3" width="2" height="2" fill="#292524" />
      <rect x="5" y="3" width="1" height="1" fill="#a8a29e" />
      {/* Right Blanket Spiral Roll End */}
      <rect x="18" y="3" width="2" height="2" fill="#292524" />
      <rect x="18" y="3" width="1" height="1" fill="#a8a29e" />
      {/* Blanket Tie Straps */}
      <rect x="8" y="2" width="2" height="4" fill="#542306" />
      <rect x="14" y="2" width="2" height="4" fill="#542306" />
      {/* Blanket Brass Buckle Pins */}
      <rect x="8" y="3" width="2" height="1" fill="#fde047" />
      <rect x="14" y="3" width="2" height="1" fill="#fde047" />

      {/* 3. Main Rucksack Silhouette & Outer Shadow */}
      <rect x="3" y="6" width="18" height="15" fill="#1c0d02" />
      <rect x="4" y="21" width="16" height="1" fill="#1c0d02" />

      {/* 4. Side Equipment Pouches / Canteen Ties */}
      {/* Left Pouch */}
      <rect x="2" y="11" width="3" height="7" fill="#1c0d02" />
      <rect x="2" y="12" width="2" height="5" fill="#78350f" />
      <rect x="2" y="14" width="3" height="1" fill="#d97706" />
      {/* Right Pouch */}
      <rect x="19" y="11" width="3" height="7" fill="#1c0d02" />
      <rect x="20" y="12" width="2" height="5" fill="#78350f" />
      <rect x="19" y="14" width="3" height="1" fill="#d97706" />

      {/* 5. Main Pack Body Leather */}
      <rect x="4" y="6" width="16" height="14" fill="#5c2406" />
      <rect x="5" y="7" width="14" height="13" fill="#78350f" />

      {/* 6. Waxed Leather Top Flap (Main Hood) */}
      <rect x="4" y="6" width="16" height="4" fill="#8c3e0c" />
      <rect x="5" y="6" width="14" height="1" fill="#d97706" />
      <rect x="5" y="10" width="14" height="1" fill="#8c3e0c" />
      {/* Center scalloped flap drop & brass eyelet */}
      <rect x="10" y="11" width="4" height="1" fill="#8c3e0c" />
      <rect x="11" y="11" width="2" height="1" fill="#fde047" />

      {/* 7. Twin Vertical Harness Straps */}
      <rect x="7" y="6" width="2" height="12" fill="#381403" />
      <rect x="15" y="6" width="2" height="12" fill="#381403" />

      {/* 8. Twin Gleaming Brass Buckles */}
      {/* Left Buckle */}
      <rect x="6" y="9" width="4" height="3" fill="#b45309" />
      <rect x="7" y="9" width="2" height="3" fill="#fde047" />
      <rect x="7" y="10" width="2" height="1" fill="#fef08a" />
      <rect x="8" y="10" width="1" height="1" fill="#1c0d02" />
      {/* Right Buckle */}
      <rect x="14" y="9" width="4" height="3" fill="#b45309" />
      <rect x="15" y="9" width="2" height="3" fill="#fde047" />
      <rect x="15" y="10" width="2" height="1" fill="#fef08a" />
      <rect x="15" y="10" width="1" height="1" fill="#1c0d02" />

      {/* 9. Center Auxiliary Gear Pouch */}
      <rect x="9" y="13" width="6" height="6" fill="#1c0d02" />
      {/* Pouch Flap */}
      <rect x="9" y="13" width="6" height="2" fill="#92400e" />
      {/* Pouch Brass Buckle Stud */}
      <rect x="11" y="14" width="2" height="1" fill="#fde047" />
      {/* Pouch Inner Body */}
      <rect x="10" y="15" width="4" height="3" fill="#6b2c0b" />
      <rect x="10" y="17" width="4" height="1" fill="#78350f" />

      {/* 10. Strap Brass Chape Tips */}
      <rect x="7" y="17" width="2" height="2" fill="#d97706" />
      <rect x="7" y="18" width="2" height="1" fill="#fde047" />
      <rect x="15" y="17" width="2" height="2" fill="#d97706" />
      <rect x="15" y="18" width="2" height="1" fill="#fde047" />

      {/* 11. Bottom Reinforced Leather Welt & Corner Brass Rivets */}
      <rect x="5" y="20" width="14" height="1" fill="#381403" />
      <rect x="5" y="19" width="1" height="1" fill="#ffd166" />
      <rect x="18" y="19" width="1" height="1" fill="#ffd166" />
    </svg>
  );
}

/* 107. 8-Bit Pixel Gladiator Barbell & Olympic Weight Plates Icon (16x16) - Workout Dashboard */
export function PixelBarbellPlateIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Heavy Olympic Iron Bar (Steel) */}
      <rect x="1" y="7" width="14" height="2" fill="#d4d4d8" />
      <rect x="2" y="7" width="12" height="1" fill="#ffffff" />
      <rect x="1" y="8" width="14" height="1" fill="#71717a" />
      {/* Knurling center marks */}
      <rect x="7" y="7" width="2" height="2" fill="#e4e4e7" />

      {/* Left Plate Collar / Sleeve */}
      <rect x="2" y="6" width="1" height="4" fill="#a1a1aa" />
      {/* Left Big 20kg Gold/Amber Iron Plate */}
      <rect x="3" y="2" width="2" height="12" fill="#b45309" />
      <rect x="3" y="2" width="1" height="12" fill="#fde047" />
      <rect x="4" y="3" width="1" height="10" fill="#f59e0b" />
      {/* Left Outer Plate Ring Rim */}
      <rect x="5" y="3" width="1" height="10" fill="#78350f" />
      <rect x="5" y="4" width="1" height="8" fill="#d97706" />

      {/* Right Big 20kg Gold/Amber Iron Plate */}
      <rect x="10" y="3" width="1" height="10" fill="#78350f" />
      <rect x="10" y="4" width="1" height="8" fill="#d97706" />
      <rect x="11" y="2" width="2" height="12" fill="#b45309" />
      <rect x="11" y="3" width="1" height="10" fill="#f59e0b" />
      <rect x="12" y="2" width="1" height="12" fill="#fde047" />
      {/* Right Plate Collar */}
      <rect x="13" y="6" width="1" height="4" fill="#a1a1aa" />
    </svg>
  );
}

/* 108. 8-Bit Pixel Anatomical Bicep & Bio-Pulse Icon (16x16) - Muscle Recovery & Readiness */
export function PixelMuscleRecoveryIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Golden Muscle Flex Peak */}
      <rect x="6" y="2" width="4" height="2" fill="#fde047" />
      <rect x="5" y="3" width="6" height="3" fill="#f59e0b" />
      <rect x="4" y="5" width="8" height="3" fill="#d97706" />
      {/* Forearm & Fist Base */}
      <rect x="3" y="8" width="5" height="4" fill="#b45309" />
      <rect x="2" y="10" width="4" height="3" fill="#92400e" />
      <rect x="2" y="12" width="3" height="2" fill="#78350f" />
      {/* Inner Arm Joint */}
      <rect x="8" y="8" width="5" height="4" fill="#b45309" />
      <rect x="10" y="10" width="4" height="3" fill="#78350f" />
      {/* Energetic Bio-Recovery Spark / Pulse Cross (Emerald Green & Gold) */}
      <rect x="11" y="2" width="3" height="1" fill="#22c55e" />
      <rect x="12" y="1" width="1" height="3" fill="#4ade80" />
      <rect x="12" y="2" width="1" height="1" fill="#ffffff" />
      {/* Lower Pulse Spark */}
      <rect x="13" y="6" width="2" height="1" fill="#22c55e" />
      <rect x="13" y="5" width="1" height="2" fill="#4ade80" />
    </svg>
  );
}

/* 109. 8-Bit Pixel Gladiator Training Scroll & Quill Icon (16x16) - Custom Routines */
export function PixelTrainingRoutinesIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Parchment Scroll Board */}
      <rect x="2" y="2" width="10" height="12" fill="#ecd9b5" />
      <rect x="2" y="1" width="10" height="2" fill="#c4976a" />
      <rect x="2" y="13" width="10" height="2" fill="#c4976a" />
      <rect x="1" y="2" width="1" height="12" fill="#8c582f" />
      <rect x="12" y="2" width="1" height="12" fill="#8c582f" />
      {/* Inscribed Routine Lines */}
      <rect x="4" y="4" width="6" height="1" fill="#542d17" />
      <rect x="4" y="6" width="6" height="1" fill="#542d17" />
      <rect x="4" y="8" width="4" height="1" fill="#542d17" />
      <rect x="4" y="10" width="5" height="1" fill="#542d17" />
      {/* Golden Quill Pen across the board */}
      <rect x="10" y="7" width="2" height="2" fill="#fde047" />
      <rect x="11" y="6" width="2" height="2" fill="#f59e0b" />
      <rect x="12" y="5" width="2" height="2" fill="#d97706" />
      <rect x="13" y="4" width="2" height="2" fill="#b45309" />
      <rect x="14" y="3" width="2" height="2" fill="#fde047" />
      {/* Ink Tip */}
      <rect x="9" y="9" width="1" height="1" fill="#180702" />
    </svg>
  );
}

/* 110. 8-Bit Pixel Gladius Split Matrix / Golden Roman Shield Icon (16x16) - Recommended Workout Splits */
export function PixelGladiusShieldSplitIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Roman Legion Scutum Curved Golden Top */}
      <rect x="3" y="1" width="10" height="2" fill="#f59e0b" />
      <rect x="4" y="1" width="8" height="1" fill="#fde047" />
      {/* Shield Main Body (Deep Imperial Crimson & Gilded Amber) */}
      <rect x="2" y="3" width="12" height="8" fill="#991b1b" />
      <rect x="3" y="3" width="10" height="8" fill="#b91c1c" />
      <rect x="3" y="11" width="10" height="2" fill="#991b1b" />
      <rect x="4" y="13" width="8" height="1" fill="#7f1d1d" />
      <rect x="5" y="14" width="6" height="1" fill="#f59e0b" />
      {/* Gilded Border Rims */}
      <rect x="2" y="3" width="1" height="8" fill="#f59e0b" />
      <rect x="13" y="3" width="1" height="8" fill="#f59e0b" />
      {/* Central Golden Boss (Umbo) */}
      <rect x="7" y="6" width="2" height="3" fill="#fde047" />
      <rect x="6" y="7" width="4" height="1" fill="#fde047" />
      <rect x="7" y="7" width="2" height="1" fill="#ffffff" />
      {/* Golden Thunderbolt Wing Lightning Emblems */}
      <rect x="4" y="5" width="2" height="1" fill="#fde047" />
      <rect x="10" y="5" width="2" height="1" fill="#fde047" />
      <rect x="4" y="9" width="2" height="1" fill="#fde047" />
      <rect x="10" y="9" width="2" height="1" fill="#fde047" />
    </svg>
  );
}



