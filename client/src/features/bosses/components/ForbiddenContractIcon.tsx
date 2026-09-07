"use client";

import React from "react";

interface ForbiddenContractIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * ForbiddenContractIcon
 * Bespoke Occult Threat Registry & Forbidden Blood-Pact Crest.
 * Features an ancient ceremonial contract scroll centered by an embossed horned demonic wax seal,
 * ritual trailing ribbons, curled parchment rolls, and inscribed arcane script glyphs.
 */
export function ForbiddenContractIcon({
  className = "size-7 sm:size-8",
  size,
  ...props
}: ForbiddenContractIconProps) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Parchment Depth Gradient */}
        <linearGradient id="pactParchmentGrad" x1="6" y1="3" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#d97706" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0.32" />
        </linearGradient>
        {/* Wax Seal Inner Core */}
        <radialGradient id="pactSealRadial" cx="14" cy="12.5" r="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#1c0a02" />
        </radialGradient>
      </defs>

      {/* 1. Main Unrolled Parchment Sheet */}
      <rect
        x="6"
        y="4"
        width="16"
        height="17"
        rx="1"
        fill="url(#pactParchmentGrad)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 2. Top Curled Scroll Roll */}
      <path
        d="M4.5 4C4.5 2.62 5.84 1.75 7.5 1.75H20.5C22.16 1.75 23.5 2.62 23.5 4C23.5 5.38 22.16 6.25 20.5 6.25H7.5C5.84 6.25 4.5 5.38 4.5 4Z"
        fill="#1e1008"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* Scroll Roll Core Highlights */}
      <path
        d="M6 4H22"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* 3. Bottom Curled Scroll Roll */}
      <path
        d="M4.5 21C4.5 19.62 5.84 18.75 7.5 18.75H20.5C22.16 18.75 23.5 19.62 23.5 21C23.5 22.38 22.16 23.25 20.5 23.25H7.5C5.84 23.25 4.5 22.38 4.5 21Z"
        fill="#1e1008"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* Bottom Scroll Core Highlight */}
      <path
        d="M6 21H22"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* 4. Inscribed Arcane Runes (Threat Glyph Lines) */}
      {/* Left side glyphs */}
      <line x1="8" y1="9.5" x2="10" y2="9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
      <line x1="8" y1="12.5" x2="9.5" y2="12.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
      <line x1="8" y1="15.5" x2="10" y2="15.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />

      {/* Right side glyphs */}
      <line x1="18" y1="9.5" x2="20" y2="9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
      <line x1="18.5" y1="12.5" x2="20" y2="12.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
      <line x1="18" y1="15.5" x2="20" y2="15.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />

      {/* 5. Trailing Ritual Wax Ribbons (Draped over Bottom Roll) */}
      <path
        d="M12 16.5L10.5 25.5L12.5 24.2L13.5 25.5L14 16.5"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 16.5L14.5 25.5L15.5 24.2L17.5 25.5L16 16.5"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 6. Central Demonic Wax Blood Seal */}
      {/* Outer Seal Disc */}
      <circle
        cx="14"
        cy="12.5"
        r="4.8"
        fill="url(#pactSealRadial)"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* Dotted Inner Arcane Binding Ring */}
      <circle
        cx="14"
        cy="12.5"
        r="3.6"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="1.2 1"
        opacity="0.8"
      />

      {/* 7. Embossed Horned Demonic Sigil inside Seal */}
      {/* Sweeping Demonic Horns */}
      <path
        d="M11.5 11C11 9 11.6 7.5 12.8 6.8C12.7 8.2 13.2 9.5 14 10.2C14.8 9.5 15.3 8.2 15.2 6.8C16.4 7.5 17 9 16.5 11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Occult Demonic Brow & Diamond Eye */}
      <path
        d="M12.2 13.2C12.8 12.4 15.2 12.4 15.8 13.2C15.2 14 12.8 14 12.2 13.2Z"
        fill="currentColor"
      />
      {/* Ritual Lower Fang */}
      <path
        d="M13.2 14.8L14 15.8L14.8 14.8"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ForbiddenContractIcon;
