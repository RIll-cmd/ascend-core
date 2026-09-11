"use client";

import React from "react";

interface ForbiddenContractIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * ForbiddenContractIcon
 * High-definition multi-tone graphic SVG icon for the Forbidden Contract Hall.
 * Features an ancient ceremonial arcane blood-oath parchment scroll,
 * an embossed crimson & gold horned demonic seal, glowing runic glyphs,
 * curled parchment rods with golden finials, and ritual wax ribbons.
 */
export function ForbiddenContractIcon({
  className = "size-7 sm:size-8",
  size,
  ...props
}: ForbiddenContractIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Parchment Warm Multi-Stop Gradient */}
        <linearGradient id="pactParchmentGrad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>

        {/* Parchment Core Inner Shade */}
        <linearGradient id="pactInnerVellum" x1="16" y1="5" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.9" />
          <stop offset="25%" stopColor="#fef3c7" stopOpacity="0.7" />
          <stop offset="80%" stopColor="#d97706" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0.8" />
        </linearGradient>

        {/* Scroll Rod Golden Metallic Gradient */}
        <linearGradient id="scrollRodGold" x1="3" y1="3" x2="29" y2="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="25%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="75%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>

        {/* Demonic Blood-Wax Radial Core */}
        <radialGradient id="pactWaxSeal" cx="16" cy="15.5" r="5.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="45%" stopColor="#991b1b" />
          <stop offset="85%" stopColor="#450a0a" />
          <stop offset="100%" stopColor="#1c0505" />
        </radialGradient>

        {/* Blood Ribbon Crimson Gradient */}
        <linearGradient id="ribbonCrimson" x1="16" y1="18" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="60%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>

        {/* Gold Trim & Runes Glow */}
        <filter id="arcaneRuneGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.6" floodColor="#f59e0b" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* 1. Deep Parchment Drop Shadow Backdrop */}
      <rect x="6.5" y="4.5" width="19" height="22" rx="1.5" fill="#0c0703" fillOpacity="0.75" />

      {/* 2. Main Parchment Sheet with Layered Vellum */}
      <rect
        x="6"
        y="4"
        width="20"
        height="23"
        rx="1.5"
        fill="url(#pactParchmentGrad)"
        stroke="#78350f"
        strokeWidth="1.2"
      />
      <rect
        x="7.5"
        y="5.5"
        width="17"
        height="20"
        rx="1"
        fill="url(#pactInnerVellum)"
      />

      {/* 3. Top Scroll Rod with Carved Finials */}
      {/* Left Finial */}
      <circle cx="4.5" cy="4" r="2" fill="url(#scrollRodGold)" stroke="#451a03" strokeWidth="0.8" />
      <circle cx="4.5" cy="4" r="0.8" fill="#fef08a" />
      {/* Main Top Rod Cylinder */}
      <rect x="4" y="2.75" width="24" height="2.5" rx="1.25" fill="url(#scrollRodGold)" stroke="#451a03" strokeWidth="0.8" />
      <line x1="5.5" y1="3.5" x2="26.5" y2="3.5" stroke="#fff" strokeWidth="0.6" strokeLinecap="round" opacity="0.7" />
      {/* Right Finial */}
      <circle cx="27.5" cy="4" r="2" fill="url(#scrollRodGold)" stroke="#451a03" strokeWidth="0.8" />
      <circle cx="27.5" cy="4" r="0.8" fill="#fef08a" />

      {/* 4. Bottom Scroll Rod with Carved Finials */}
      {/* Left Finial */}
      <circle cx="4.5" cy="27" r="2" fill="url(#scrollRodGold)" stroke="#451a03" strokeWidth="0.8" />
      <circle cx="4.5" cy="27" r="0.8" fill="#fef08a" />
      {/* Main Bottom Rod Cylinder */}
      <rect x="4" y="25.75" width="24" height="2.5" rx="1.25" fill="url(#scrollRodGold)" stroke="#451a03" strokeWidth="0.8" />
      <line x1="5.5" y1="26.5" x2="26.5" y2="26.5" stroke="#fff" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
      {/* Right Finial */}
      <circle cx="27.5" cy="27" r="2" fill="url(#scrollRodGold)" stroke="#451a03" strokeWidth="0.8" />
      <circle cx="27.5" cy="27" r="0.8" fill="#fef08a" />

      {/* 5. Inscribed Occult Runes / Arcane Clauses (Left & Right columns) */}
      <g stroke="#92400e" strokeWidth="1" strokeLinecap="round" opacity="0.85">
        <line x1="9" y1="8" x2="13.5" y2="8" />
        <line x1="9" y1="10.5" x2="12" y2="10.5" />
        <line x1="9" y1="13" x2="13" y2="13" />
        <line x1="9" y1="18" x2="12.5" y2="18" />
        <line x1="9" y1="20.5" x2="13.5" y2="20.5" />
        <line x1="9" y1="23" x2="11.5" y2="23" />

        <line x1="18.5" y1="8" x2="23" y2="8" />
        <line x1="20" y1="10.5" x2="23" y2="10.5" />
        <line x1="19" y1="13" x2="23" y2="13" />
        <line x1="19.5" y1="18" x2="23" y2="18" />
        <line x1="18.5" y1="20.5" x2="23" y2="20.5" />
        <line x1="20.5" y1="23" x2="23" y2="23" />
      </g>

      {/* 6. Trailing Crimson Ritual Blood Ribbons (draping over bottom rod) */}
      <path
        d="M13.5 19L11.5 29.5L13.8 28L15 29.5L15 19"
        fill="url(#ribbonCrimson)"
        stroke="#450a0a"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <path
        d="M17 19L17 29.5L18.2 28L20.5 29.5L18.5 19"
        fill="url(#ribbonCrimson)"
        stroke="#450a0a"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      {/* Ribbon Gilded Trim Highlights */}
      <line x1="12.2" y1="22" x2="13.2" y2="27.5" stroke="#fbbf24" strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
      <line x1="19.8" y1="22" x2="18.8" y2="27.5" stroke="#fbbf24" strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />

      {/* 7. Central Demonic Blood-Wax Seal */}
      {/* Scalloped / Irregular Wax Edge */}
      <circle cx="16" cy="15.5" r="5.8" fill="#450a0a" stroke="#fbbf24" strokeWidth="0.9" />
      <circle cx="16" cy="15.5" r="5.2" fill="url(#pactWaxSeal)" />
      {/* Dotted Inner Arcane Binding Sigil Ring */}
      <circle
        cx="16"
        cy="15.5"
        r="4.1"
        stroke="#fbbf24"
        strokeWidth="0.65"
        strokeDasharray="1.2 0.9"
        opacity="0.9"
      />

      {/* 8. Gilded Horned Demonic Crest inside Seal */}
      {/* Curved Horns */}
      <path
        d="M13.2 13.8C12.5 11.8 13.3 9.8 14.5 9C14.4 10.6 15 12 16 12.8C17 12 17.6 10.6 17.5 9C18.7 9.8 19.5 11.8 18.8 13.8"
        stroke="#fbbf24"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Brow & Occult Piercing Eye */}
      <ellipse cx="16" cy="15.2" rx="2" ry="1.1" fill="#fef08a" stroke="#78350f" strokeWidth="0.5" />
      <circle cx="16" cy="15.2" r="0.65" fill="#450a0a" />
      {/* Ritual Demon Fangs */}
      <path
        d="M14.8 17.2L16 18.4L17.2 17.2"
        stroke="#fbbf24"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ForbiddenContractIcon;
