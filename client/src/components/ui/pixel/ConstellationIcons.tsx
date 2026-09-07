import React from "react";

/* =========================================================================
   CELESTIAL CONSTELLATION ICONS
   Authentic mythic constellation iconography featuring:
   - Precise starlight node vertices (stars & 4-point diamond cross flares)
   - Connective starlight filament lines
   - Subtle celestial orbital guides
   - 100% SVG vector scalability
   ========================================================================= */

export interface ConstellationIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/* Helper 4-Point Diamond Sparkle Star Node */
function DiamondStar({ x, y, r = 1.6, color = "currentColor" }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <g>
      {/* 4-point star flare */}
      <polygon
        points={`${x},${y - r * 1.5} ${x + r * 0.75},${y} ${x},${y + r * 1.5} ${x - r * 0.75},${y}`}
        fill={color}
      />
      <polygon
        points={`${x - r * 1.5},${y} ${x},${y - r * 0.75} ${x + r * 1.5},${y} ${x},${y + r * 0.75}`}
        fill={color}
      />
      {/* Central core node */}
      <circle cx={x} cy={y} r={r * 0.65} fill="#FFFFFF" />
    </g>
  );
}

/* Helper Standard Starlight Node */
function StarNode({ x, y, r = 1.2, color = "currentColor", isMajor = false }: { x: number; y: number; r?: number; color?: string; isMajor?: boolean }) {
  return (
    <g>
      {isMajor && (
        <circle cx={x} cy={y} r={r * 1.8} fill={color} fillOpacity="0.25" />
      )}
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x} cy={y} r={r * 0.45} fill="#FFFFFF" />
    </g>
  );
}

/**
 * 1. THE FIRE DRAKE CONSTELLATION (Ignis Draconis)
 * Mythic Dragon in the stars: Horned dragon head, sweeping wings, coiled tail.
 */
export function FireDrakeConstellation({ size = 16, className = "", ...props }: ConstellationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {/* Connective Starlight Filaments */}
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85">
        {/* Head & Jaws */}
        <polyline points="17,3 15,7 20,6 19,10 15,7 11,8" />
        {/* Neck to Heart */}
        <line x1="11" y1="8" x2="8" y2="12" />
        <line x1="8" y1="12" x2="10" y2="14" />
        {/* Wing Structure */}
        <polyline points="10,14 6,10 5,4 2,8 6,10" />
        {/* Spine to Tail */}
        <polyline points="10,14 14,16 18,17 21,14 22,19 19,22 15,21 18,17" />
      </g>

      {/* Secondary Starlight Faint Guide Lines */}
      <g stroke="currentColor" strokeWidth="0.75" strokeDasharray="1.5 1.5" strokeOpacity="0.4">
        <line x1="5" y1="4" x2="15" y2="7" />
        <line x1="10" y1="14" x2="19" y2="22" />
      </g>

      {/* Star Nodes */}
      <StarNode x={17} y={3} r={1.0} />
      <StarNode x={20} y={6} r={1.2} />
      <StarNode x={19} y={10} r={1.0} />
      <StarNode x={15} y={7} r={1.3} isMajor />
      <StarNode x={11} y={8} r={1.0} />
      <StarNode x={8} y={12} r={1.0} />
      {/* Alpha Draconis - Heart of the Dragon */}
      <DiamondStar x={10} y={14} r={1.8} />
      {/* Wing Stars */}
      <StarNode x={6} y={10} r={1.1} />
      <DiamondStar x={5} y={4} r={1.4} />
      <StarNode x={2} y={8} r={1.2} />
      {/* Body & Tail Stars */}
      <StarNode x={14} y={16} r={1.0} />
      <StarNode x={18} y={17} r={1.2} />
      <StarNode x={21} y={14} r={1.1} />
      <StarNode x={22} y={19} r={1.1} />
      <DiamondStar x={19} y={22} r={1.4} />
      <StarNode x={15} y={21} r={1.0} />
    </svg>
  );
}

/**
 * 2. THE STORM ROC CONSTELLATION (Avis Tempestatis)
 * Celestial Thunderbird / Eagle with outstretched wings and radiant Altair nexus.
 */
export function StormRocConstellation({ size = 16, className = "", ...props }: ConstellationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {/* Connective Starlight Filaments */}
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85">
        {/* Beak & Head */}
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="6" x2="12" y2="10" />
        {/* Left Wing */}
        <polyline points="12,10 8,8 4,5 1,3 3,9 7,12 12,10" />
        {/* Right Wing */}
        <polyline points="12,10 16,8 20,5 23,3 21,9 17,12 12,10" />
        {/* Tail Fan */}
        <line x1="12" y1="10" x2="12" y2="15" />
        <line x1="12" y1="15" x2="8" y2="21" />
        <line x1="12" y1="15" x2="12" y2="22" />
        <line x1="12" y1="15" x2="16" y2="21" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </g>

      {/* Secondary Cosmic Lightning Filaments */}
      <g stroke="currentColor" strokeWidth="0.75" strokeDasharray="1.5 1.5" strokeOpacity="0.4">
        <line x1="4" y1="5" x2="12" y2="6" />
        <line x1="20" y1="5" x2="12" y2="6" />
      </g>

      {/* Star Nodes */}
      <StarNode x={12} y={2} r={1.0} />
      <StarNode x={12} y={6} r={1.2} />
      {/* Alpha Roc / Altair Heart Node */}
      <DiamondStar x={12} y={10} r={1.9} />
      {/* Left Wing Nodes */}
      <StarNode x={8} y={8} r={1.0} />
      <StarNode x={4} y={5} r={1.1} />
      <DiamondStar x={1} y={3} r={1.4} />
      <StarNode x={3} y={9} r={1.0} />
      <StarNode x={7} y={12} r={1.0} />
      {/* Right Wing Nodes */}
      <StarNode x={16} y={8} r={1.0} />
      <StarNode x={20} y={5} r={1.1} />
      <DiamondStar x={23} y={3} r={1.4} />
      <StarNode x={21} y={9} r={1.0} />
      <StarNode x={17} y={12} r={1.0} />
      {/* Tail Nodes */}
      <StarNode x={12} y={15} r={1.0} />
      <StarNode x={8} y={21} r={1.1} />
      <DiamondStar x={12} y={22} r={1.3} />
      <StarNode x={16} y={21} r={1.1} />
    </svg>
  );
}

/**
 * 3. THE STONE TITAN CONSTELLATION (Titan Terran)
 * Celestial Colossus / Orion & Aegis: Star-forged warrior crowned in starlight.
 */
export function StoneTitanConstellation({ size = 16, className = "", ...props }: ConstellationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {/* Connective Starlight Filaments */}
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85">
        {/* Crown to Helm */}
        <line x1="12" y1="2" x2="12" y2="5" />
        {/* Shoulder Line */}
        <line x1="6" y1="7" x2="12" y2="5" />
        <line x1="12" y1="5" x2="18" y2="7" />
        <line x1="6" y1="7" x2="18" y2="7" />
        {/* Torso & Core */}
        <line x1="6" y1="7" x2="12" y2="10" />
        <line x1="18" y1="7" x2="12" y2="10" />
        <line x1="12" y1="10" x2="8" y2="14" />
        <line x1="12" y1="10" x2="16" y2="14" />
        <line x1="8" y1="14" x2="16" y2="14" />
        {/* Pillar Legs */}
        <polyline points="8,14 6,18 4,22" />
        <polyline points="16,14 18,18 20,22" />
        {/* Raised Aegis Shield on Right */}
        <polyline points="18,7 22,10 19,15 16,14" />
      </g>

      {/* Secondary Starlight Bracing */}
      <g stroke="currentColor" strokeWidth="0.75" strokeDasharray="1.5 1.5" strokeOpacity="0.4">
        <line x1="4" y1="22" x2="20" y2="22" />
        <line x1="6" y1="18" x2="18" y2="18" />
      </g>

      {/* Star Nodes */}
      <DiamondStar x={12} y={2} r={1.3} />
      <StarNode x={12} y={5} r={1.1} />
      <DiamondStar x={6} y={7} r={1.4} />
      <DiamondStar x={18} y={7} r={1.4} />
      {/* Titan Heart Star */}
      <DiamondStar x={12} y={10} r={1.9} />
      {/* Belt Stars */}
      <StarNode x={8} y={14} r={1.1} />
      <StarNode x={16} y={14} r={1.1} />
      {/* Aegis Shield Nodes */}
      <DiamondStar x={22} y={10} r={1.4} />
      <StarNode x={19} y={15} r={1.0} />
      {/* Pillar Foot Stars */}
      <StarNode x={6} y={18} r={1.0} />
      <StarNode x={18} y={18} r={1.0} />
      <DiamondStar x={4} y={22} r={1.4} />
      <DiamondStar x={20} y={22} r={1.4} />
    </svg>
  );
}

/**
 * 4. THE SEA LEVIATHAN CONSTELLATION (Leviathan Profundis)
 * Celestial Sea Dragon / Serpent swimming through the cosmic ocean.
 */
export function SeaLeviathanConstellation({ size = 16, className = "", ...props }: ConstellationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {/* Connective Starlight Filaments */}
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85">
        {/* Leviathan Head & Maw */}
        <polyline points="2,11 6,8 10,11 6,14 2,11" />
        {/* Crown Horn */}
        <line x1="6" y1="8" x2="6" y2="4" />
        {/* Undulating Spine */}
        <polyline points="10,11 14,8 17,13 20,10" />
        {/* Dorsal Fin */}
        <polyline points="10,11 13,5 14,8" />
        {/* Tail Fluke */}
        <polyline points="20,10 23,6 22,11 23,16 20,10" />
        {/* Ventral Fin */}
        <line x1="6" y1="14" x2="9" y2="18" />
        <line x1="9" y1="18" x2="10" y2="11" />
      </g>

      {/* Wave Harmonic Guide Lines */}
      <g stroke="currentColor" strokeWidth="0.75" strokeDasharray="1.5 1.5" strokeOpacity="0.4">
        <line x1="6" y1="4" x2="13" y2="5" />
        <line x1="9" y1="18" x2="17" y2="13" />
      </g>

      {/* Star Nodes */}
      <DiamondStar x={6} y={4} r={1.3} />
      <StarNode x={2} y={11} r={1.1} />
      <StarNode x={6} y={8} r={1.1} />
      <StarNode x={6} y={14} r={1.0} />
      {/* Heart of the Leviathan */}
      <DiamondStar x={10} y={11} r={1.8} />
      <DiamondStar x={13} y={5} r={1.3} />
      <StarNode x={14} y={8} r={1.1} />
      <StarNode x={9} y={18} r={1.1} />
      <StarNode x={17} y={13} r={1.2} />
      <StarNode x={20} y={10} r={1.2} />
      <DiamondStar x={23} y={6} r={1.4} />
      <StarNode x={22} y={11} r={1.0} />
      <DiamondStar x={23} y={16} r={1.4} />
    </svg>
  );
}

/**
 * 5. THE SOVEREIGN CROWN CONSTELLATION (Corona Monarchis)
 * Corona Borealis / Celestial Diadem: Semicircular arc of starlight spires.
 */
export function SovereignCrownConstellation({ size = 16, className = "", ...props }: ConstellationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {/* Connective Starlight Filaments */}
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85">
        {/* The Crown Diadem Arc */}
        <polyline points="2,15 5,10 8,6 12,3 16,6 19,10 22,15" />
        {/* Crown Foundation Band */}
        <polyline points="2,15 6,18 12,19 18,18 22,15" />
        {/* Spire Rays to Foundation */}
        <line x1="12" y1="3" x2="12" y2="19" />
        <line x1="8" y1="6" x2="6" y2="18" />
        <line x1="16" y1="6" x2="18" y2="18" />
        {/* Central Monarch Diamond Cross Bracing */}
        <line x1="8" y1="6" x2="12" y2="11" />
        <line x1="16" y1="6" x2="12" y2="11" />
        <line x1="12" y1="11" x2="12" y2="19" />
      </g>

      {/* Radiant Aura Arc */}
      <g stroke="currentColor" strokeWidth="0.75" strokeDasharray="1.5 1.5" strokeOpacity="0.4">
        <line x1="5" y1="10" x2="12" y2="11" />
        <line x1="19" y1="10" x2="12" y2="11" />
      </g>

      {/* Jewel of the Crown: Gemma / Alphecca (Alpha Coronae) */}
      <DiamondStar x={12} y={3} r={2.0} />
      {/* Flanking Spire Jewels */}
      <DiamondStar x={8} y={6} r={1.5} />
      <DiamondStar x={16} y={6} r={1.5} />
      <StarNode x={5} y={10} r={1.1} />
      <StarNode x={19} y={10} r={1.1} />
      <DiamondStar x={12} y={11} r={1.3} />
      {/* Base Stars */}
      <StarNode x={2} y={15} r={1.2} />
      <StarNode x={6} y={18} r={1.1} />
      <DiamondStar x={12} y={19} r={1.4} />
      <StarNode x={18} y={18} r={1.1} />
      <StarNode x={22} y={15} r={1.2} />
    </svg>
  );
}

/**
 * 6. ALL CONSTELLATIONS CLUSTER (Celestial Astrolabe Sphere)
 * Interlocking starlight grid uniting all constellations.
 */
export function AllConstellationsCluster({ size = 16, className = "", ...props }: ConstellationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {/* Celestial Rings & Orbital Filaments */}
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8">
        <circle cx="12" cy="12" r="9" strokeDasharray="2 1.5" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" />
        <ellipse cx="12" cy="12" rx="3.5" ry="9" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </g>

      {/* Central Monarch Star */}
      <DiamondStar x={12} y={12} r={1.8} />

      {/* Cardinal Star Nodes */}
      <DiamondStar x={12} y={3} r={1.2} />
      <DiamondStar x={12} y={21} r={1.2} />
      <DiamondStar x={3} y={12} r={1.2} />
      <DiamondStar x={21} y={12} r={1.2} />

      {/* Quadrant Stars */}
      <StarNode x={6} y={6} r={1.0} />
      <StarNode x={18} y={6} r={1.0} />
      <StarNode x={6} y={18} r={1.0} />
      <StarNode x={18} y={18} r={1.0} />
    </svg>
  );
}
