"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { playUISound, playUIMenuSFX } from "@/utils/audio";
import { PixelBadge } from "./PixelBadge";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CoolMode } from "@/components/ui/cool-mode";
import { Sparkles, Shield, Flame, Zap, Waves, Crown, Eye, ArrowUpRight } from "lucide-react";

export interface StatNodeData {
  key: string;
  short: string;
  label: string;
  rune: string;
  element: string;
  baseVal: number;
  effectiveVal: number;
  multPct: number;
  lore: string;
  irlSource: string;
  angleDeg: number;
  angleRad: number;
  cx: number;
  cy: number;
  icon: any;
  color: string;
}

interface KonosubaElementalMatrixProps {
  className?: string;
  baseStats: Record<string, number> | any;
  combatStats: Record<string, number> | any;
  multipliers: Record<string, number> | any;
  availableSP?: number;
  combatPower?: number;
  characterClass?: string;
  selectedStat?: string | null;
  onSelectStat?: (statKey: string | null) => void;
}

export const getClassAbbreviation = (className?: string): string => {
  if (!className) return "ADV";
  const upper = className.toUpperCase().trim();
  if (upper.includes("ADVENTURER")) return "ADV";
  if (upper.includes("ARCH-WIZARD") || upper.includes("ARCHWIZARD") || upper.includes("ARCH WIZARD")) return "AW";
  if (upper.includes("WARRIOR")) return "WAR";
  if (upper.includes("MAGE") || upper.includes("MAGICIAN")) return "MAG";
  if (upper.includes("ROGUE") || upper.includes("THIEF")) return "ROG";
  if (upper.includes("PRIEST") || upper.includes("CLERIC") || upper.includes("ARCHPRIEST")) return "AG";
  if (upper.includes("PALADIN")) return "PAL";
  if (upper.includes("BERSERKER")) return "BER";
  if (upper.includes("STORMWEAVER")) return "STM";
  if (upper.includes("ARCANIST")) return "ARC";
  if (upper.includes("SHADOW MONARCH")) return "SHM";
  if (upper.includes("ASSASSIN")) return "ASN";
  if (upper.includes("CRUSADER")) return "CR";
  if (upper.includes("KNIGHT")) return "KNT";
  return upper.slice(0, 3);
};

export const KonosubaElementalMatrix: React.FC<KonosubaElementalMatrixProps> = ({
  className,
  baseStats,
  combatStats,
  multipliers,
  availableSP = 0,
  combatPower = 50,
  characterClass = "ADVENTURER",
  selectedStat = null,
  onSelectStat,
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const classShort = getClassAbbreviation(characterClass);

  // Exact 6-fold mathematical radial symmetry around center (150, 150)
  // Distance from center for all 6 outer nodes is exactly 82.0 units
  const nodes: StatNodeData[] = [
    {
      key: "strength",
      short: "STR",
      label: "Strength",
      rune: "ᛋᛏᚱ",
      element: "Flame",
      baseVal: baseStats?.strength || 1,
      effectiveVal: combatStats?.strength || baseStats?.strength || 1,
      multPct: multipliers?.strengthPct || 0,
      lore: "Raw physical force, muscular contraction and heavy lifting capacity.",
      irlSource: "Resistance training, compound lifts & calisthenics.",
      angleDeg: -90,
      angleRad: (-90 * Math.PI) / 180,
      cx: 150,
      cy: 68,
      icon: Flame,
      color: "#DC2626",
    },
    {
      key: "endurance",
      short: "END",
      label: "Endurance",
      rune: "ᚺᛚᛏ",
      element: "Earth",
      baseVal: baseStats?.endurance || 1,
      effectiveVal: combatStats?.endurance || baseStats?.endurance || 1,
      multPct: multipliers?.endurancePct || 0,
      lore: "Cardiovascular resilience, stamina reservoir and muscular endurance.",
      irlSource: "Cardio sessions, step volume & marathon pacing.",
      angleDeg: -30,
      angleRad: (-30 * Math.PI) / 180,
      cx: 221,
      cy: 109,
      icon: Shield,
      color: "#D97706",
    },
    {
      key: "focus",
      short: "FOC",
      label: "Focus",
      rune: "ᛞᛪᛏ",
      element: "Light",
      baseVal: baseStats?.focus || 1,
      effectiveVal: combatStats?.focus || baseStats?.focus || 1,
      multPct: multipliers?.focusPct || 0,
      lore: "Undivided mental attention, flow-state immersion and tactical perception.",
      irlSource: "Deep work sessions, Pomodoro intervals & zero-distraction blocks.",
      angleDeg: 30,
      angleRad: (30 * Math.PI) / 180,
      cx: 221,
      cy: 191,
      icon: Eye,
      color: "#7C3AED",
    },
    {
      key: "recovery",
      short: "REC",
      label: "Recovery",
      rune: "ᚱᛖᚲ",
      element: "Tide",
      baseVal: baseStats?.recovery || 1,
      effectiveVal: combatStats?.recovery || baseStats?.recovery || 1,
      multPct: multipliers?.recoveryPct || 0,
      lore: "Biological restoration rate, cellular repair and sleep architecture.",
      irlSource: "Sleep quality, rest day protocols & active recovery.",
      angleDeg: 90,
      angleRad: (90 * Math.PI) / 180,
      cx: 150,
      cy: 232,
      icon: Waves,
      color: "#2563EB",
    },
    {
      key: "discipline",
      short: "DIS",
      label: "Discipline",
      rune: "ᛚᚲᚲ",
      element: "Void",
      baseVal: baseStats?.discipline || 1,
      effectiveVal: combatStats?.discipline || baseStats?.discipline || 1,
      multPct: multipliers?.disciplinePct || 0,
      lore: "Iron will adherence, resisting temptation and maintaining unbroken streaks.",
      irlSource: "Daily quests completed & protected habit streaks.",
      angleDeg: 150,
      angleRad: (150 * Math.PI) / 180,
      cx: 79,
      cy: 191,
      icon: Crown,
      color: "#B45309",
    },
    {
      key: "consistency",
      short: "CNS",
      label: "Consistency",
      rune: "ᛇᚷᛚ",
      element: "Tempest",
      baseVal: baseStats?.consistency || 1,
      effectiveVal: combatStats?.consistency || baseStats?.consistency || 1,
      multPct: multipliers?.consistencyPct || 0,
      lore: "Unshakable routine adherence and non-negotiable daily execution.",
      irlSource: "100% daily all-clear completions across consecutive weeks.",
      angleDeg: 210,
      angleRad: (210 * Math.PI) / 180,
      cx: 79,
      cy: 109,
      icon: Zap,
      color: "#059669",
    },
    {
      key: "knowledge",
      short: "KNW",
      label: "Knowledge",
      rune: "ᛗᚷᚲ",
      element: "Arcane Core",
      baseVal: baseStats?.knowledge || 1,
      effectiveVal: combatStats?.knowledge || baseStats?.knowledge || 1,
      multPct: multipliers?.knowledgePct || 0,
      lore: "Intellectual depth, skill acquisition speed and cognitive adaptability.",
      irlSource: "Reading non-fiction, study hours & strategic reflection.",
      angleDeg: 0,
      angleRad: 0,
      cx: 150,
      cy: 150,
      icon: Sparkles,
      color: "#D97706",
    },
  ];

  // Active highlighted node (null if nothing hovered/selected)
  const activeKey = hoveredKey || selectedStat;
  const activeNode = nodes.find((n) => n.key === activeKey) || null;

  // 6 Outer Nodes for Dynamic Stat Radar Web Polygon
  const outerNodes = nodes.filter((n) => n.key !== "knowledge");
  
  // Calculate dynamic stat polygon points based on actual stat progress
  const maxStatScale = Math.max(20, ...nodes.map((n) => n.effectiveVal));
  const minRadius = 24;
  const maxRadius = 82;

  const dynamicPolygonPoints = outerNodes
    .map((node) => {
      // Fraction based on real stat value (clamped between 0.15 and 1)
      const fraction = Math.min(1, Math.max(0.15, node.effectiveVal / maxStatScale));
      const currentR = minRadius + fraction * (maxRadius - minRadius);
      const px = Math.round(150 + Math.cos(node.angleRad) * currentR);
      const py = Math.round(150 + Math.sin(node.angleRad) * currentR);
      return `${px},${py}`;
    })
    .join(" ");

  // Outer reference polygon connecting all 6 outer nodes at full 100% capacity
  const outerHexagonPoints = outerNodes
    .map((node) => `${node.cx},${node.cy}`)
    .join(" ");

  return (
    /* ========================================================= */
    /* 📖 OPENED BOOK TOME - RIGHT PAGE VIEW (MATCHING REFERENCE)*/
    /* ========================================================= */
    <div
      className={cn(
        "relative rounded-sm select-none font-pixel text-[#241208] transition-all duration-200",
        className
      )}
    >
      {/* 1. AGED DARK BROWN HARDCOVER CASING & BINDING */}
      <div className="relative bg-[#583017] bg-[linear-gradient(180deg,#6b3d1f_0%,#542c14_50%,#3d1e0c_100%)] border-2 border-[#2b1408] p-2.5 sm:p-3.5 pt-3 pb-3.5 shadow-[0_20px_45px_rgba(0,0,0,0.92),inset_0_1px_2px_rgba(255,255,255,0.22),inset_0_-2px_4px_rgba(0,0,0,0.6)] rounded-r-md">
        
        {/* Brass Metal Corner Protector with Rivets - Top Right */}
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-30">
          <svg viewBox="0 0 32 32" className="w-full h-full">
            <path d="M0,0 L32,0 L32,32 L26,32 C26,14 18,6 0,6 Z" fill="#d97706" stroke="#78350f" strokeWidth="1" />
            <path d="M2,2 L30,2 L30,30 L27,30 C27,15 19,7 2,7 Z" fill="#fde047" opacity="0.65" />
            <circle cx="23" cy="9" r="2.2" fill="#78350f" stroke="#451a03" strokeWidth="0.6" />
          </svg>
        </div>

        {/* Brass Metal Corner Protector with Rivets - Bottom Right */}
        <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none z-30">
          <svg viewBox="0 0 32 32" className="w-full h-full">
            <path d="M0,32 L32,32 L32,0 L26,0 C26,18 18,26 0,26 Z" fill="#d97706" stroke="#78350f" strokeWidth="1" />
            <path d="M2,30 L30,30 L30,2 L27,2 C27,17 19,25 2,25 Z" fill="#fde047" opacity="0.65" />
            <circle cx="23" cy="23" r="2.2" fill="#78350f" stroke="#451a03" strokeWidth="0.6" />
          </svg>
        </div>

        {/* Left Center Spine Crease & Deep Gutter Gradient */}
        <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-[#180802] via-[#301407]/80 to-transparent pointer-events-none z-30" />
        
        {/* Bottom Spine V-Notch (Headband fold at bottom center) */}
        <div className="absolute -bottom-1 left-0 w-3 h-2 bg-[#241005] rotate-45 pointer-events-none z-30" />

        {/* 2. LAYERED STACKED PAPER EDGES (RIGHT & BOTTOM MARGINS) */}
        <div className="relative mr-1.5 sm:mr-2 shadow-[4px_4px_12px_rgba(0,0,0,0.65)]">
          
          {/* Layered Stacked Pages Under-Layers on Right Edge */}
          <div className="absolute top-1 -right-2 bottom-1 w-2.5 bg-[#e4cea6] border-r border-[#6e4321] shadow-xs pointer-events-none z-0" />
          <div className="absolute top-2 -right-3.5 bottom-2 w-2 bg-[#d1b587] border-r border-[#4a2813] shadow-xs pointer-events-none z-0" />
          
          {/* Layered Stacked Pages Under-Layer on Bottom Edge */}
          <div className="absolute -bottom-1.5 left-2 right-0 h-2 bg-[#d8bf92] border-b border-[#6e4321] shadow-xs pointer-events-none z-0" />

          {/* 3. OPEN RIGHT PARCHMENT BOOK PAGE (DIRECTLY INKED) */}
          <div className="relative z-10 bg-[#f3e9d2] bg-[radial-gradient(ellipse_at_65%_40%,_#fcf7ec_0%,_#f3e9d2_40%,_#e7d5b7_75%,_#dac099_100%)] p-4 sm:p-5 border border-[#8a5d3b]/40 shadow-[inset_16px_0_22px_rgba(43,20,8,0.28),inset_0_-8px_16px_rgba(69,36,16,0.18)] rounded-r-xs">
            
            {/* Subtle Inked Manuscript Horizontal Guide Rules */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(89,59,34,0.05)_1px,transparent_1px)] bg-[size:100%_18px] pointer-events-none z-0" />

            {/* Top Inked Header Title */}
            <div className="flex items-center justify-between border-b-2 border-[#4a2813]/40 pb-2 mb-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-900 rotate-45" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#221208]">
                  ᛈᚨᚱᚨᛗᛖᛏᛖᚱ KonoSuba Elemental Dial Matrix
                </h3>
              </div>
              <span className="text-[10px] text-[#6d4c3d] font-bold">
                [ HOVER/CLICK NODES ]
              </span>
            </div>

            {/* Direct-Inked Magic Compass Plate (No nested div box) */}
            <div className="relative flex flex-row items-center justify-between gap-1 py-1 z-10">
              
              {/* Left Vertical Barcode Rune Script */}
              <div className="flex flex-col items-center justify-between text-[8px] sm:text-[9px] font-bold text-[#6d4c3d] tracking-tighter h-80 px-1 border-r border-[#6d4c3d]/30 shrink-0">
                <span className="writing-vertical rotate-180">B</span>
                <span className="writing-vertical rotate-180">L</span>
                <span className="writing-vertical rotate-180">E</span>
                <span className="writing-vertical rotate-180">A</span>
                <span className="writing-vertical rotate-180">T</span>
                <span className="writing-vertical rotate-180">W</span>
                <span className="writing-vertical rotate-180">Q/O</span>
                <span className="writing-vertical rotate-180">F</span>
              </div>

              {/* Central Geometric Magic Compass SVG */}
              <div className="relative flex-1 flex items-center justify-center min-w-0">
                <svg
                  viewBox="0 0 300 320"
                  className="w-full max-w-[340px] h-auto text-[#4a2813]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ shapeRendering: "geometricPrecision" }}
                >
                  {/* Top Catalyst Key & Crosshatch Droplet Seal */}
                  <path
                    d="M150,8 L157,20 C162,28 162,38 150,46 C138,38 138,28 143,20 Z"
                    fill="#dfcaac"
                    stroke="#2a1408"
                    strokeWidth="2"
                  />
                  {/* Crosshatch in Key */}
                  <line x1="145" y1="22" x2="155" y2="34" stroke="#4a2813" strokeWidth="1" />
                  <line x1="155" y1="22" x2="145" y2="34" stroke="#4a2813" strokeWidth="1" />
                  <line x1="150" y1="46" x2="150" y2="60" stroke="#2a1408" strokeWidth="2" />
                  <circle cx="150" cy="8" r="3" fill="#2a1408" />

                  {/* Radiant Sunburst Rays (24 Fine Lines radiating from center 150, 150) */}
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i * 360) / 24;
                    const rad = (angle * Math.PI) / 180;
                    const x1 = 150 + Math.cos(rad) * 26;
                    const y1 = 150 + Math.sin(rad) * 26;
                    const x2 = 150 + Math.cos(rad) * 98;
                    const y2 = 150 + Math.sin(rad) * 98;
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#8c5225"
                        strokeWidth="0.8"
                        strokeOpacity="0.45"
                        strokeDasharray={i % 2 === 0 ? "none" : "2 3"}
                      />
                    );
                  })}

                  {/* Concentric Outer Magic Bands */}
                  <circle cx="150" cy="150" r="102" stroke="#4a2813" strokeWidth="1.2" strokeDasharray="3 3" />
                  <circle cx="150" cy="150" r="92" stroke="#2a1408" strokeWidth="1.8" />
                  <circle cx="150" cy="150" r="82" stroke="#8c5225" strokeWidth="1" strokeDasharray="4 2" />

                  {/* Outer Reference Symmetrical Hexagonal Frame */}
                  <polygon
                    points={outerHexagonPoints}
                    stroke="#4a2813"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                    fill="none"
                  />

                  {/* Radial Lines from Center to Outer Nodes */}
                  {outerNodes.map((n) => (
                    <line
                      key={`radial-${n.key}`}
                      x1={150}
                      y1={150}
                      x2={n.cx}
                      y2={n.cy}
                      stroke="#8c5225"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  ))}

                  {/* Dynamic Stat Radar Web Polygon (Expands proportionally with user stats!) */}
                  <polygon
                    points={dynamicPolygonPoints}
                    stroke="#b45309"
                    strokeWidth="2"
                    fill="rgba(180, 83, 9, 0.25)"
                  />

                  {/* Connecting Conduit to Bottom Class Plaque */}
                  <line x1="150" y1="240" x2="150" y2="268" stroke="#2a1408" strokeWidth="2.5" />
                  <polygon points="144,256 150,250 156,256 150,262" fill="#2a1408" />

                  {/* 7 Interactive Elemental Spheres with Large Hitboxes */}
                  {nodes.map((node) => {
                    const isHovered = hoveredKey === node.key;
                    const isSelected = selectedStat === node.key;
                    const isCenter = node.key === "knowledge";
                    const radius = isCenter ? 22 : 18;

                    return (
                      <g
                        key={node.key}
                        className="cursor-pointer group"
                        style={{ pointerEvents: "all" }}
                        onMouseEnter={() => {
                          setHoveredKey(node.key);
                          playUISound("/sounds/General/10_UI_Menu_SFX/001_Hover_01.wav");
                        }}
                        onMouseLeave={() => setHoveredKey(null)}
                        onClick={() => {
                          const nextVal = selectedStat === node.key ? null : node.key;
                          if (onSelectStat) onSelectStat(nextVal);
                          playUIMenuSFX("confirm");
                        }}
                      >
                        {/* Invisible generous hit target capturing all pointer events */}
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r={28}
                          fill="rgba(0,0,0,0.001)"
                          style={{ pointerEvents: "all" }}
                        />

                        {/* Outer Pulsing Aura on Hover/Select */}
                        {(isHovered || isSelected) && (
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={radius + 6}
                            fill="none"
                            stroke="#d97706"
                            strokeWidth="2.5"
                            strokeDasharray="3 2"
                            className="animate-spin"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          />
                        )}

                        {/* Node Outer Ring */}
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r={radius}
                          fill={isHovered || isSelected ? "#2a1408" : "#dfcaac"}
                          stroke="#2a1408"
                          strokeWidth="2.5"
                        />

                        {/* Inner Rune Disc */}
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r={radius - 4}
                          fill={isHovered || isSelected ? "#dfcaac" : "#ecd9bd"}
                          stroke="#4a2813"
                          strokeWidth="1"
                        />

                        {/* Text / Short Identifier in Node */}
                        <text
                          x={node.cx}
                          y={node.cy - 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#221208"
                          fontSize="7.5"
                          fontWeight="900"
                          fontFamily="monospace"
                        >
                          {node.short}
                        </text>

                        {/* Live Value Tag */}
                        <text
                          x={node.cx}
                          y={node.cy + 7}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#8c2d0f"
                          fontSize="8.5"
                          fontWeight="900"
                          fontFamily="monospace"
                        >
                          {node.effectiveVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* ========================================================= */}
                  {/* ILLUMINATED GOLD CLASS PLAQUE (HIGH CONTRAST & VISIBILITY) */}
                  {/* ========================================================= */}
                  <g transform="translate(90, 268)">
                    {/* Dark Wood Base with Golden Frame */}
                    <rect
                      x="0"
                      y="0"
                      width="120"
                      height="34"
                      rx="2"
                      fill="#261307"
                      stroke="#d97706"
                      strokeWidth="2.5"
                    />
                    <rect
                      x="3"
                      y="3"
                      width="114"
                      height="28"
                      fill="#3a1c0b"
                      stroke="#f59e0b"
                      strokeWidth="1"
                    />

                    {/* Left Diamond Accent */}
                    <polygon points="14,17 18,12 22,17 18,22" fill="#fde047" stroke="#78350f" strokeWidth="0.5" />

                    {/* Bright Illuminated Class Text */}
                    <text
                      x="60"
                      y="18"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fef08a"
                      stroke="#451a03"
                      strokeWidth="0.6"
                      fontSize="13"
                      fontWeight="900"
                      fontFamily="monospace"
                      letterSpacing="0.14em"
                      style={{ filter: "drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))" }}
                    >
                      ✦ {classShort} ✦
                    </text>

                    {/* Right Diamond Accent */}
                    <polygon points="98,17 102,12 106,17 102,22" fill="#fde047" stroke="#78350f" strokeWidth="0.5" />
                  </g>
                </svg>
              </div>

              {/* Right Vertical Barcode Rune Script */}
              <div className="flex flex-col items-center justify-between text-[8px] sm:text-[9px] font-bold text-[#6d4c3d] tracking-tighter h-80 px-1 border-l border-[#6d4c3d]/30 shrink-0">
                <span className="writing-vertical rotate-180">E</span>
                <span className="writing-vertical rotate-180">L</span>
                <span className="writing-vertical rotate-180">E</span>
                <span className="writing-vertical rotate-180">M</span>
                <span className="writing-vertical rotate-180">E</span>
                <span className="writing-vertical rotate-180">N</span>
                <span className="writing-vertical rotate-180">T</span>
                <span className="writing-vertical rotate-180">S</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* MANUSCRIPT INKED HUD DOSSIER (WRITTEN ON PARCHMENT)       */}
            {/* ========================================================= */}
            <div className="mt-2 p-3 bg-[#dfcaac]/70 border-2 border-[#4a2813] shadow-[inset_0_0_10px_rgba(89,59,34,0.3)] space-y-2 z-10 relative">
              {activeNode ? (
                <>
                  <div className="flex items-center justify-between border-b border-[#4a2813]/30 pb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-950 rotate-45" />
                      <span className="text-xs font-bold text-[#221208] uppercase tracking-wider">
                        {activeNode.rune} {activeNode.label.toUpperCase()} ({activeNode.short})
                      </span>
                      <PixelBadge variant="gold">{activeNode.element.toUpperCase()}</PixelBadge>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#6d4c3d]">Base: <strong className="text-[#221208]"><NumberTicker value={activeNode.baseVal} /></strong></span>
                      {activeNode.multPct > 0 && (
                        <span className="text-emerald-900 font-bold">
                          (+{activeNode.multPct}% Gear)
                        </span>
                      )}
                      <span className="text-[#361c0c] font-black">
                        = Total: <strong className="text-amber-950 text-sm"><NumberTicker value={activeNode.effectiveVal} /></strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#221208] leading-relaxed">
                    {activeNode.lore}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#6d4c3d] pt-1 border-t border-[#4a2813]/20 flex-wrap gap-2">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#361c0c]">IRL PROTOCOL:</span>
                      <span>{activeNode.irlSource}</span>
                    </div>

                    <CoolMode options={{ particle: "✨", size: 16, speedHorz: 3, speedUp: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectStat) onSelectStat(activeNode.key);
                          playUIMenuSFX("confirm");
                        }}
                        className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-950 hover:text-black underline cursor-pointer"
                      >
                        <span>{selectedStat === activeNode.key ? "Selected" : "Focus Attribute"}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </CoolMode>
                  </div>
                </>
              ) : (
                <div className="py-2 text-center text-xs text-[#6d4c3d] space-y-1">
                  <span className="font-bold text-[#361c0c] uppercase block">✦ ASCENDANT 7-AXIS KINETIC SYSTEM ✦</span>
                  <p className="text-[11px]">Hover or click any attribute node on the dial to inspect live formula telemetry and gear scaling.</p>
                </div>
              )}
            </div>

            {/* Bottom Telemetry Bar & Tome Folio Number Tag */}
            <div className="mt-3 flex items-center justify-between text-xs pt-1 z-10 relative">
              <div className="flex items-center gap-1.5">
                <span className="text-[#6d4c3d] font-bold">AVAILABLE SP:</span>
                <strong className="text-amber-950 font-pixel"><NumberTicker value={availableSP} /> SP</strong>
              </div>
              
              {/* Authentic Grimoire Page Folio */}
              <div className="font-mono text-xs font-bold text-[#221208] px-2.5 py-0.5 border border-[#4a2813] bg-[#dfcaac] shadow-[inset_0_0_4px_rgba(89,59,34,0.3)]">
                FOLIO 16
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#6d4c3d] font-bold">POWER:</span>
                <strong className="text-[#221208] font-pixel"><NumberTicker value={combatPower} /></strong>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
