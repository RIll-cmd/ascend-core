"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdventurerStatusCardRibbonProps {
  className?: string;
  title?: string;
  subRune?: string;
}

/**
 * High-fidelity 8-Bit Pixel Art Adventurer Status Card Header Graphic SVG
 * Replaces the plain text box with a bespoke medieval fantasy guild engraved metal-plate ribbon.
 * Features:
 * - Pixelated gilded brass/gold beveled stepped borders
 * - Stepped corner brackets and rivet hardware
 * - Ancient Elder Futhark fantasy runes flanking the status title
 * - Central ornate guild crest with gem insignia and wings
 * - Crisp vector edges with shapeRendering="crispEdges"
 */
export const AdventurerStatusCardRibbon: React.FC<AdventurerStatusCardRibbonProps> = ({
  className,
  title = "ADVENTURER STATUS CARD",
  subRune = "ᚲᚨᛉᚢᛗᚨ ᛋᚨᛏᛟᚢ ᛞᚨᛉᚢᛖᛟ ᚱᚨᚲᛖ ᛫ ᛖᚢᛋᛞ ᛉ ᛖ ᚨ ᚢ ᚾ ᚺ ᛞ ᛞ ᛉ ᛖ ᚱ ᚨ ᛖ ᛋ ᛟ ᚲ ᚲ ᛉ ᛞ",
}) => {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden select-none mb-4 group drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]",
        className
      )}
    >
      <svg
        viewBox="0 0 1000 70"
        className="w-full h-auto block"
        style={{ shapeRendering: "crispEdges" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gilded Brass Ribbon Gradient */}
          <linearGradient id="ribbonBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2e1408" />
            <stop offset="25%" stopColor="#3d1b0a" />
            <stop offset="70%" stopColor="#240e04" />
            <stop offset="100%" stopColor="#140602" />
          </linearGradient>

          {/* Golden Highlights */}
          <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="20%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="80%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="rubyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>

        {/* 1. Main Background Plate */}
        <polygon
          points="8,0 992,0 1000,8 1000,62 992,70 8,70 0,62 0,8"
          fill="url(#ribbonBg)"
          stroke="#140602"
          strokeWidth="3"
        />

        {/* 2. Outer Stepped Brass Border */}
        <polyline
          points="10,4 990,4 996,10 996,60 990,66 10,66 4,60 4,10 10,4"
          fill="none"
          stroke="#854d0e"
          strokeWidth="2"
        />

        {/* 3. Inner Pixel Inset Groove */}
        <polyline
          points="14,8 986,8 992,14 992,56 986,62 14,62 8,56 8,14 14,8"
          fill="none"
          stroke="#451a03"
          strokeWidth="1.5"
        />

        {/* 4. Top Gilded Light Rim Highlight */}
        <line x1="20" y1="5" x2="980" y2="5" stroke="url(#goldHighlight)" strokeWidth="1.5" />
        <line x1="20" y1="65" x2="980" y2="65" stroke="#78350f" strokeWidth="1" />

        {/* 5. Left & Right Corner Pixel Brackets */}
        {/* Left Bracket */}
        <rect x="6" y="6" width="16" height="4" fill="#d97706" />
        <rect x="6" y="10" width="4" height="12" fill="#d97706" />
        <rect x="8" y="8" width="4" height="4" fill="#fef08a" />
        <rect x="7" y="7" width="2" height="2" fill="#fff" />
        {/* Left Bottom */}
        <rect x="6" y="60" width="16" height="4" fill="#b45309" />
        <rect x="6" y="48" width="4" height="12" fill="#b45309" />
        <rect x="8" y="58" width="4" height="4" fill="#d97706" />

        {/* Right Bracket */}
        <rect x="978" y="6" width="16" height="4" fill="#d97706" />
        <rect x="990" y="10" width="4" height="12" fill="#d97706" />
        <rect x="988" y="8" width="4" height="4" fill="#fef08a" />
        <rect x="991" y="7" width="2" height="2" fill="#fff" />
        {/* Right Bottom */}
        <rect x="978" y="60" width="16" height="4" fill="#b45309" />
        <rect x="990" y="48" width="4" height="12" fill="#b45309" />
        <rect x="988" y="58" width="4" height="4" fill="#d97706" />

        {/* 6. Precision Brass Rivets Along Rim */}
        {[36, 120, 240, 760, 880, 964].map((x) => (
          <g key={x}>
            <circle cx={x} cy="6" r="2.2" fill="#f59e0b" stroke="#000" strokeWidth="0.6" />
            <circle cx={x} cy="64" r="2.2" fill="#b45309" stroke="#000" strokeWidth="0.6" />
            <circle cx={x - 0.5} cy={5.5} r="0.8" fill="#fff" />
          </g>
        ))}

        {/* 7. Left Flank Ornate Pixel Wing Crest */}
        <g transform="translate(18, 16)">
          {/* Diamond Seal */}
          <polygon points="18,19 32,5 46,19 32,33" fill="#3a1805" stroke="#d97706" strokeWidth="1.5" />
          <polygon points="23,19 32,10 41,19 32,28" fill="#180702" stroke="#f59e0b" strokeWidth="1" />
          <rect x="29" y="16" width="6" height="6" fill="url(#rubyGlow)" stroke="#000" strokeWidth="0.6" />
          <rect x="30" y="17" width="2" height="2" fill="#ffffff" />
          {/* Horizontal Spear / Wing Filigree */}
          <line x1="48" y1="19" x2="110" y2="19" stroke="#b45309" strokeWidth="2" />
          <line x1="56" y1="16" x2="98" y2="16" stroke="#f59e0b" strokeWidth="1" />
          <line x1="56" y1="22" x2="98" y2="22" stroke="#78350f" strokeWidth="1" />
          <polygon points="112,19 104,15 104,23" fill="#f59e0b" stroke="#000" strokeWidth="0.5" />
          {/* Pixel Cross Details */}
          <rect x="74" y="14" width="3" height="11" fill="#fde047" />
          <rect x="70" y="18" width="11" height="3" fill="#fde047" />
        </g>

        {/* 8. Right Flank Ornate Pixel Wing Crest (Mirrored) */}
        <g transform="translate(854, 16)">
          <line x1="16" y1="19" x2="78" y2="19" stroke="#b45309" strokeWidth="2" />
          <line x1="28" y1="16" x2="70" y2="16" stroke="#f59e0b" strokeWidth="1" />
          <line x1="28" y1="22" x2="70" y2="22" stroke="#78350f" strokeWidth="1" />
          <polygon points="14,19 22,15 22,23" fill="#f59e0b" stroke="#000" strokeWidth="0.5" />
          {/* Pixel Cross Details */}
          <rect x="49" y="14" width="3" height="11" fill="#fde047" />
          <rect x="45" y="18" width="11" height="3" fill="#fde047" />
          {/* Diamond Seal */}
          <polygon points="80,19 94,5 108,19 94,33" fill="#3a1805" stroke="#d97706" strokeWidth="1.5" />
          <polygon points="85,19 94,10 103,19 94,28" fill="#180702" stroke="#f59e0b" strokeWidth="1" />
          <rect x="91" y="16" width="6" height="6" fill="url(#rubyGlow)" stroke="#000" strokeWidth="0.6" />
          <rect x="92" y="17" width="2" height="2" fill="#ffffff" />
        </g>

        {/* 9. Left Ancient Runes Banner */}
        <g transform="translate(130, 24)">
          <text
            x="0"
            y="7"
            fill="#d97706"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="3"
            fontWeight="bold"
            opacity="0.85"
          >
            ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇ
          </text>
        </g>

        {/* 11. Center Title Inscription (ADVENTURER STATUS CARD) */}
        <g transform="translate(500, 31)">
          {/* Drop shadow */}
          <text
            x="0"
            y="2"
            textAnchor="middle"
            fill="#000000"
            fontSize="12.5"
            fontFamily="'Press Start 2P', monospace, sans-serif"
            fontWeight="900"
            letterSpacing="2.5"
          >
            ᛫ ᛭ ᛫ {title} ᛫ ᛭ ᛫
          </text>
          {/* Golden Embossed Face */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fill="#fef08a"
            fontSize="12.5"
            fontFamily="'Press Start 2P', monospace, sans-serif"
            fontWeight="900"
            letterSpacing="2.5"
          >
            ᛫ ᛭ ᛫ {title} ᛫ ᛭ ᛫
          </text>
        </g>

        {/* 12. Right Ancient Runes Banner */}
        <g transform="translate(730, 24)">
          <text
            x="0"
            y="7"
            fill="#d97706"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="3"
            fontWeight="bold"
            opacity="0.85"
          >
            ᛋᛏᛒᛖᛗᛚᛜᛞᛟᚠᚢᚦᚨ
          </text>
        </g>

        {/* 13. Sub-Rune Inscription Banner (Centered Lower Track) */}
        <g transform="translate(500, 56)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fill="#eedcb8"
            opacity="0.7"
            fontSize="8.5"
            fontFamily="monospace"
            letterSpacing="4"
            fontWeight="bold"
          >
            {subRune}
          </text>
        </g>

        {/* Center Lower Diamond Crest */}
        <polygon points="500,60 505,64 500,68 495,64" fill="#f59e0b" stroke="#000" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

export default AdventurerStatusCardRibbon;
