"use client";

import React from "react";

/* =========================================================================
   SHADOW MONARCH SOVEREIGN SIGIL
   Bespoke, high-fidelity dark fantasy sovereign insignia:
   - Outer astral runic astrolabe with cardinal starlight diamond flares
   - Sweeping gothic abyssal monarch wings (Shadow Monarch mantle)
   - 5-spire sovereign diadem with multifaceted amethyst jewel core
   - Connective starlight constellation filaments and nexus nodes
   - Deep obsidian facets with layered neon violet & fuchsia glow
   ========================================================================= */

export interface ShadowMonarchSigilProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function ShadowMonarchSigil({
  size = 52,
  className = "",
  ...props
}: ShadowMonarchSigilProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      <defs>
        {/* Deep Sovereign Violet to Radiant Fuchsia Gradient */}
        <linearGradient id="monarchGradient" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0ABFC" />
          <stop offset="35%" stopColor="#C084FC" />
          <stop offset="70%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>

        {/* Core Jewel Glow Gradient */}
        <radialGradient id="coreJewelGlow" cx="32" cy="34" r="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#F472B6" />
          <stop offset="60%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#3B0764" stopOpacity="0" />
        </radialGradient>

        {/* Wing Shadow Obsidian Gradient */}
        <linearGradient id="wingObsidian" x1="8" y1="20" x2="56" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#381559" />
          <stop offset="50%" stopColor="#1E0B36" />
          <stop offset="100%" stopColor="#0B0314" />
        </linearGradient>

        {/* Radiant Starlight Flare Filter */}
        <filter id="sigilAura" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* =========================================================
          1. ASTRAL ASTROLABE RUNIC RING (BACKGROUND GUIDES)
          Concentric celestial circles with etched degree ticks
          ========================================================= */}
      <g opacity="0.65" stroke="url(#monarchGradient)" strokeWidth="0.8">
        {/* Outer Ring */}
        <circle cx="32" cy="32" r="28" strokeDasharray="3 2" />
        {/* Inner Concentric Ring */}
        <circle cx="32" cy="32" r="24" strokeWidth="0.5" strokeOpacity="0.5" />
        {/* Cardinal Runic Axis Lines */}
        <line x1="32" y1="2" x2="32" y2="8" strokeWidth="1.2" />
        <line x1="32" y1="56" x2="32" y2="62" strokeWidth="1.2" />
        <line x1="2" y1="32" x2="8" y2="32" strokeWidth="1.2" />
        <line x1="56" y1="32" x2="62" y2="32" strokeWidth="1.2" />
        {/* Diagonal Guideway Filaments */}
        <line x1="12" y1="12" x2="16" y2="16" strokeDasharray="1.5 1.5" />
        <line x1="52" y1="12" x2="48" y2="16" strokeDasharray="1.5 1.5" />
        <line x1="12" y1="52" x2="16" y2="48" strokeDasharray="1.5 1.5" />
        <line x1="52" y1="52" x2="48" y2="48" strokeDasharray="1.5 1.5" />
      </g>

      {/* =========================================================
          2. SWEEPING ABYSSAL MONARCH WINGS (LEFT & RIGHT)
          Layered obsidian blades arching upward with sharp plumes
          ========================================================= */}
      {/* Left Wing Silhouette */}
      <path
        d="M32 36C26 33 16 28 8 20C7 26 10 33 14 38C10 38 7 35 6 32C5 38 9 44 14 47C10 47 8 45 7 43C7 49 13 53 19 54C24 55 28 48 32 44"
        fill="url(#wingObsidian)"
        stroke="url(#monarchGradient)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Left Wing Internal Feathers */}
      <path
        d="M14 38L22 44M14 47L24 50M19 54L28 48"
        stroke="#C084FC"
        strokeWidth="0.8"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />

      {/* Right Wing Silhouette (Mirrored Symmetry) */}
      <path
        d="M32 36C38 33 48 28 56 20C57 26 54 33 50 38C54 38 57 35 58 32C59 38 55 44 50 47C54 47 56 45 57 43C57 49 51 53 45 54C40 55 36 48 32 44"
        fill="url(#wingObsidian)"
        stroke="url(#monarchGradient)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Right Wing Internal Feathers */}
      <path
        d="M50 38L42 44M50 47L40 50M45 54L36 48"
        stroke="#C084FC"
        strokeWidth="0.8"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />

      {/* =========================================================
          3. THE SOVEREIGN MONARCH DIADEM & 5 CROWN SPIRES
          Gothic sharp crown with central towering spire
          ========================================================= */}
      {/* Crown Base Structure */}
      <polygon
        points="19,41 23,31 27,37 32,24 37,37 41,31 45,41 32,45"
        fill="#18072B"
        stroke="url(#monarchGradient)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Crown Foundation Band */}
      <path
        d="M17 41C22 44 42 44 47 41L45 45C40 48 24 48 19 45Z"
        fill="url(#monarchGradient)"
        stroke="#E879F9"
        strokeWidth="0.75"
      />

      {/* Embedded Crown Band Jewels */}
      <circle cx="24" cy="43.5" r="1.2" fill="#FFFFFF" />
      <circle cx="32" cy="44.5" r="1.5" fill="#FFFFFF" />
      <circle cx="40" cy="43.5" r="1.2" fill="#FFFFFF" />

      {/* Spires Upper Connective Filaments */}
      <line x1="32" y1="13" x2="32" y2="24" stroke="#F0ABFC" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="23" y1="21" x2="23" y2="31" stroke="#C084FC" strokeWidth="1" strokeLinecap="round" />
      <line x1="41" y1="21" x2="41" y2="31" stroke="#C084FC" strokeWidth="1" strokeLinecap="round" />
      <line x1="16" y1="26" x2="19" y2="41" stroke="#A855F7" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="48" y1="26" x2="45" y2="41" stroke="#A855F7" strokeWidth="0.8" strokeLinecap="round" />

      {/* Starlight Constellation Filaments Linking Spires */}
      <line x1="23" y1="21" x2="32" y2="13" stroke="#E879F9" strokeWidth="0.75" strokeDasharray="1.5 1.5" strokeOpacity="0.7" />
      <line x1="41" y1="21" x2="32" y2="13" stroke="#E879F9" strokeWidth="0.75" strokeDasharray="1.5 1.5" strokeOpacity="0.7" />
      <line x1="16" y1="26" x2="23" y2="21" stroke="#C084FC" strokeWidth="0.75" strokeDasharray="1.5 1.5" strokeOpacity="0.7" />
      <line x1="48" y1="26" x2="41" y2="21" stroke="#C084FC" strokeWidth="0.75" strokeDasharray="1.5 1.5" strokeOpacity="0.7" />

      {/* =========================================================
          4. CENTRAL MULTIFACETED SOUL JEWEL (THE VOID HEART)
          Brilliant cut diamond crystal radiating cold mana
          ========================================================= */}
      {/* Ambient Jewel Glow */}
      <circle cx="32" cy="35" r="7" fill="url(#coreJewelGlow)" />

      {/* Multifaceted Crystal Polygon */}
      <polygon
        points="32,28 37,34 32,41 27,34"
        fill="#581C87"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Crystal Internal Facet Reflections */}
      <polyline points="27,34 32,36 37,34" stroke="#F0ABFC" strokeWidth="0.75" />
      <line x1="32" y1="28" x2="32" y2="36" stroke="#FFFFFF" strokeWidth="0.75" />
      <line x1="32" y1="36" x2="32" y2="41" stroke="#F0ABFC" strokeWidth="0.75" />

      {/* =========================================================
          5. STARLIGHT DIAMOND NODES & RADIANT CROSS FLARES
          Precise mythic celestial sparkles crowning the sigil
          ========================================================= */}
      {/* Apex Star: The Sovereign Crown Diamond (Alpha Spire) */}
      <g filter="url(#sigilAura)">
        {/* 4-Point Starlight Flare */}
        <polygon points="32,8 33.5,13 38,13 34,15.5 35.5,20 32,17 28.5,20 30,15.5 26,13 30.5,13" fill="#FFFFFF" />
        <polygon points="32,10 33,13 36,13 33.5,14.5 34.5,17.5 32,15.5 29.5,17.5 30.5,14.5 28,13 31,13" fill="#F0ABFC" />
        <circle cx="32" cy="13" r="1.5" fill="#FFFFFF" />
      </g>

      {/* Flanking Left Spire Star Node */}
      <polygon points="23,17 24,21 28,21 24.5,23 25.5,27 23,24.5 20.5,27 21.5,23 18,21 22,21" fill="#E879F9" />
      <circle cx="23" cy="21" r="1.2" fill="#FFFFFF" />

      {/* Flanking Right Spire Star Node */}
      <polygon points="41,17 42,21 46,21 42.5,23 43.5,27 41,24.5 38.5,27 39.5,23 36,21 40,21" fill="#E879F9" />
      <circle cx="41" cy="21" r="1.2" fill="#FFFFFF" />

      {/* Outer Left Feather Tip Node */}
      <circle cx="16" cy="26" r="1.4" fill="#C084FC" />
      <circle cx="16" cy="26" r="0.7" fill="#FFFFFF" />

      {/* Outer Right Feather Tip Node */}
      <circle cx="48" cy="26" r="1.4" fill="#C084FC" />
      <circle cx="48" cy="26" r="0.7" fill="#FFFFFF" />

      {/* Cardinal Ring Diamond Star Flares */}
      <polygon points="32,2 33,4 35,4 33.5,5.5 34,7.5 32,6 30,7.5 30.5,5.5 29,4 31,4" fill="#C084FC" />
      <polygon points="32,56 33,58 35,58 33.5,59.5 34,61.5 32,60 30,61.5 30.5,59.5 29,58 31,58" fill="#C084FC" />
      <polygon points="4,32 5.5,33 5.5,35 7,33.5 9,34 7.5,32 9,30 7,30.5 5.5,29 5.5,31" fill="#C084FC" />
      <polygon points="58,32 59.5,33 59.5,35 61,33.5 63,34 61.5,32 63,30 61,30.5 59.5,29 59.5,31" fill="#C084FC" />
    </svg>
  );
}
