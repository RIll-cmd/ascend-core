"use client";

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/* =========================================================================
   01. DASHBOARD — Holographic Tactical Command HUD Matrix
   ========================================================================= */
export function GraphicDashboardIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-dash-panel-a" x1="2" y1="2" x2="10" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <linearGradient id="sb-dash-panel-b" x1="13" y1="2" x2="22" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id="sb-dash-panel-c" x1="2" y1="13" x2="10" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id="sb-dash-panel-d" x1="13" y1="13" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>
      {/* Top Left: Main Metrics Monitor */}
      <rect x="2.5" y="2.5" width="8" height="8" rx="2" fill="url(#sb-dash-panel-a)" stroke="#10b981" strokeWidth="1" />
      <path d="M4.5 6.5L6 5L7.5 7L9 5.5" stroke="#ecfdf5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="4" r="0.75" fill="#a7f3d0" />

      {/* Top Right: Realtime Data Flow */}
      <rect x="13.5" y="2.5" width="8" height="8" rx="2" fill="url(#sb-dash-panel-b)" stroke="#38bdf8" strokeWidth="1" />
      <rect x="15" y="4.5" width="5" height="1.2" rx="0.6" fill="#e0f2fe" />
      <rect x="15" y="7" width="3.5" height="1.2" rx="0.6" fill="#7dd3fc" />

      {/* Bottom Left: Hex System Core */}
      <rect x="2.5" y="13.5" width="8" height="8" rx="2" fill="url(#sb-dash-panel-c)" stroke="#8b5cf6" strokeWidth="1" />
      <circle cx="6.5" cy="17.5" r="2.2" stroke="#ede9fe" strokeWidth="1" strokeDasharray="2 1.5" />
      <circle cx="6.5" cy="17.5" r="0.8" fill="#c4b5fd" />

      {/* Bottom Right: Tactical Gauge */}
      <rect x="13.5" y="13.5" width="8" height="8" rx="2" fill="url(#sb-dash-panel-d)" stroke="#f59e0b" strokeWidth="1" />
      <path d="M15 19C15 16.5 17 14.5 19.5 14.5" stroke="#fef3c7" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="17.5" y1="17.5" x2="20" y2="15" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* =========================================================================
   02. MISSIONS — Tactical Bounty Target Crest & Crimson Crosshair
   ========================================================================= */
export function GraphicMissionsIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <radialGradient id="sb-miss-rim" cx="12" cy="12" r="11" gradientUnits="userSpaceOnUse">
          <stop offset="40%" stopColor="#fef08a" />
          <stop offset="75%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <radialGradient id="sb-miss-core" cx="12" cy="12" r="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="60%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
      </defs>
      {/* Outer Metallic Ring */}
      <circle cx="12" cy="12" r="10" fill="url(#sb-miss-rim)" stroke="#451a03" strokeWidth="1" />
      {/* Inner Shadow Chamber */}
      <circle cx="12" cy="12" r="7.5" fill="url(#sb-miss-core)" stroke="#fca5a5" strokeWidth="0.8" />
      {/* Target Reticle Rings */}
      <circle cx="12" cy="12" r="4.5" stroke="#fef2f2" strokeWidth="1" strokeDasharray="3 1.5" />
      <circle cx="12" cy="12" r="1.75" fill="#fef2f2" />
      {/* Crosshair Laser Notches */}
      <line x1="12" y1="1.5" x2="12" y2="5" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22.5" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1.5" y1="12" x2="5" y2="12" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22.5" y2="12" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* =========================================================================
   03. HABITS — Arcane Quest Scroll with Glowing Emerald Checkmarks
   ========================================================================= */
export function GraphicHabitsIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-hab-vellum" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="40%" stopColor="#fef3c7" />
          <stop offset="85%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="sb-hab-seal" x1="15" y1="15" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>
      {/* Parchment Base */}
      <path d="M5 3.5C5 2.67 5.67 2 6.5 2H18C18.83 2 19.5 2.67 19.5 3.5V18.5C19.5 20.43 17.93 22 16 22H6.5C5.67 22 5 21.33 5 20.5V3.5Z" fill="url(#sb-hab-vellum)" stroke="#78350f" strokeWidth="1.2" />
      {/* Scroll Roll Bottom Curl */}
      <path d="M5 19.5C5 18.12 6.12 17 7.5 17H19.5" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
      {/* Glowing Emerald Checkmark 1 */}
      <path d="M8 7L9.5 8.5L13 5" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14.5" y1="6.5" x2="17" y2="6.5" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
      {/* Glowing Emerald Checkmark 2 */}
      <path d="M8 11.5L9.5 13L13 9.5" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14.5" y1="11" x2="17" y2="11" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
      {/* Wax Seal at bottom right */}
      <circle cx="17.5" cy="18" r="3" fill="url(#sb-hab-seal)" stroke="#450a0a" strokeWidth="0.8" />
      <path d="M16.5 17L17.5 18L18.5 17" stroke="#fecaca" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

/* =========================================================================
   04. CALENDAR — Astral Chrono-Folio with Celestial Gold Grid
   ========================================================================= */
export function GraphicCalendarIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-cal-top" x1="2" y1="2" x2="22" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id="sb-cal-body" x1="3" y1="7" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      {/* Calendar Plate Body */}
      <rect x="2.5" y="4" width="19" height="17" rx="3" fill="url(#sb-cal-body)" stroke="#38bdf8" strokeWidth="1" />
      {/* Header Bar */}
      <path d="M2.5 7C2.5 5.34 3.84 4 5.5 4H18.5C20.16 4 21.5 5.34 21.5 7V8H2.5V7Z" fill="url(#sb-cal-top)" stroke="#38bdf8" strokeWidth="1" />
      {/* Golden Binding Rings */}
      <rect x="6.5" y="2" width="2" height="4" rx="1" fill="#facc15" stroke="#713f12" strokeWidth="0.8" />
      <rect x="15.5" y="2" width="2" height="4" rx="1" fill="#facc15" stroke="#713f12" strokeWidth="0.8" />
      {/* Date Grid Cells */}
      <rect x="5.5" y="11" width="2.5" height="2" rx="0.5" fill="#38bdf8" />
      <rect x="10.5" y="11" width="2.5" height="2" rx="0.5" fill="#e2e8f0" opacity="0.8" />
      <rect x="15.5" y="11" width="2.5" height="2" rx="0.5" fill="#e2e8f0" opacity="0.8" />
      <rect x="5.5" y="15" width="2.5" height="2" rx="0.5" fill="#e2e8f0" opacity="0.8" />
      {/* Active Day Star Spark */}
      <circle cx="11.75" cy="16" r="1.5" fill="#f59e0b" />
      <circle cx="11.75" cy="16" r="0.75" fill="#fef08a" />
      <rect x="15.5" y="15" width="2.5" height="2" rx="0.5" fill="#10b981" />
    </svg>
  );
}

/* =========================================================================
   05. PROFILE — Paladin Knight Helm with Glowing Emerald Visor
   ========================================================================= */
export function GraphicProfileIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-prof-helm" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="sb-prof-crest" x1="12" y1="1" x2="12" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
      </defs>
      {/* Golden Crest Feather / Plume */}
      <path d="M12 1.5C13 3 14 5 13.5 7.5H10.5C10 5 11 3 12 1.5Z" fill="url(#sb-prof-crest)" stroke="#713f12" strokeWidth="0.8" />
      {/* Helmet Shell */}
      <path d="M5 8.5C5 5.5 8 3.5 12 3.5C16 3.5 19 5.5 19 8.5V14.5C19 18 16 20.5 12 21C8 20.5 5 18 5 14.5V8.5Z" fill="url(#sb-prof-helm)" stroke="#cbd5e1" strokeWidth="1" />
      {/* Cheek & Jaw Guard */}
      <path d="M7 12V15C7 17 9 18.5 12 19C15 18.5 17 17 17 15V12" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />
      {/* Glowing Emerald Visor Slot */}
      <rect x="7" y="9" width="10" height="2.2" rx="1.1" fill="#10b981" stroke="#a7f3d0" strokeWidth="0.8" />
      <line x1="8" y1="10.1" x2="16" y2="10.1" stroke="#ecfdf5" strokeWidth="0.8" strokeLinecap="round" />
      {/* Breathing Vent Perforations */}
      <circle cx="10" cy="15" r="0.6" fill="#64748b" />
      <circle cx="12" cy="15" r="0.6" fill="#64748b" />
      <circle cx="14" cy="15" r="0.6" fill="#64748b" />
      <circle cx="11" cy="16.5" r="0.6" fill="#64748b" />
      <circle cx="13" cy="16.5" r="0.6" fill="#64748b" />
    </svg>
  );
}

/* =========================================================================
   06. WORKOUTS — Burning Molten Barbells & Kinetic Flame Aura
   ========================================================================= */
export function GraphicWorkoutsIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-wo-bar" x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="sb-wo-plate" x1="2" y1="2" x2="10" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>
      {/* Kinetic Flame Background Glow */}
      <path d="M12 4C14 7 15 10 12 12C9 10 10 7 12 4Z" fill="#f59e0b" opacity="0.8" />
      {/* Diagonal Chrome Shaft Bar */}
      <line x1="5.5" y1="18.5" x2="18.5" y2="5.5" stroke="url(#sb-wo-bar)" strokeWidth="2.4" strokeLinecap="round" />
      {/* Bottom-Left Inner Weight Plate */}
      <rect x="4.5" y="13.5" width="6" height="3" rx="1" transform="rotate(-45 4.5 13.5)" fill="url(#sb-wo-plate)" stroke="#fca5a5" strokeWidth="0.8" />
      {/* Bottom-Left Outer Weight Plate */}
      <rect x="3" y="15" width="6" height="2.5" rx="0.8" transform="rotate(-45 3 15)" fill="#b91c1c" stroke="#f87171" strokeWidth="0.8" />
      {/* Top-Right Inner Weight Plate */}
      <rect x="13.5" y="4.5" width="6" height="3" rx="1" transform="rotate(-45 13.5 4.5)" fill="url(#sb-wo-plate)" stroke="#fca5a5" strokeWidth="0.8" />
      {/* Top-Right Outer Weight Plate */}
      <rect x="15" y="3" width="6" height="2.5" rx="0.8" transform="rotate(-45 15 3)" fill="#b91c1c" stroke="#f87171" strokeWidth="0.8" />
      {/* Central Knurled Grip */}
      <line x1="10.5" y1="13.5" x2="13.5" y2="10.5" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* =========================================================================
   07. SLEEP & REST — Crescent Dream Moon in Cosmic Stardust Aura
   ========================================================================= */
export function GraphicSleepIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <radialGradient id="sb-sl-moon" cx="13" cy="11" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#facc15" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <radialGradient id="sb-sl-aura" cx="9" cy="13" r="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#4f46e5" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Cosmic Nebula Aura */}
      <circle cx="12" cy="12" r="10" fill="url(#sb-sl-aura)" />
      {/* Golden Crescent Moon */}
      <path d="M18.5 13.5C18.5 17.64 15.14 21 11 21C7.68 21 4.86 18.84 3.9 15.82C3.73 15.29 4.19 14.77 4.75 14.85C5.7 14.99 6.69 15.02 7.7 14.86C12.35 14.12 15.93 10.38 16.48 5.7C16.6 4.67 16.47 3.68 16.21 2.74C16.06 2.18 16.6 1.7 17.13 1.9C19.8 2.92 21.68 5.56 21.68 8.65C21.68 9.38 21.57 10.09 21.36 10.76C20.65 12.87 18.5 13.5 18.5 13.5Z" fill="url(#sb-sl-moon)" stroke="#fef9c3" strokeWidth="0.8" />
      {/* Twinkling Astral Stars */}
      <path d="M8 5L8.5 6.5L10 7L8.5 7.5L8 9L7.5 7.5L6 7L7.5 6.5L8 5Z" fill="#a5f3fc" />
      <circle cx="5" cy="10" r="0.9" fill="#e0e7ff" />
      <circle cx="19" cy="18" r="1.1" fill="#fde047" />
      <circle cx="15" cy="20" r="0.75" fill="#c7d2fe" />
    </svg>
  );
}

/* =========================================================================
   08. LEARNING & FOCUS — Radiant Neural Mind Prism
   ========================================================================= */
export function GraphicLearningIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-learn-core" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      {/* Cerebral Lobes Left & Right */}
      <path d="M12 4C9.5 4 7.5 5.5 7.5 7.5C7.5 8.2 7.7 8.8 8.1 9.3C6.8 9.8 6 11 6 12.5C6 13.5 6.4 14.5 7.1 15.1C6.4 15.8 6 16.8 6 18C6 19.7 7.3 21 9 21C10.2 21 11.2 20.3 11.7 19.3L12 18.7L12.3 19.3C12.8 20.3 13.8 21 15 21C16.7 21 18 19.7 18 18C18 16.8 17.6 15.8 16.9 15.1C17.6 14.5 18 13.5 18 12.5C18 11 17.2 9.8 15.9 9.3C16.3 8.8 16.5 8.2 16.5 7.5C16.5 5.5 14.5 4 12 4Z" fill="url(#sb-learn-core)" stroke="#f0fdf4" strokeWidth="1" />
      {/* Center Neural Fissure */}
      <path d="M12 4.5V18.5" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 1.5" />
      {/* Synaptic Light Arcs */}
      <path d="M9 8.5C10 9 10.5 10 10.5 11" stroke="#f0f9ff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15 8.5C14 9 13.5 10 13.5 11" stroke="#f0f9ff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8.5 14C9.5 14.5 10 15.5 10 16.5" stroke="#f0f9ff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15.5 14C14.5 14.5 14 15.5 14 16.5" stroke="#f0f9ff" strokeWidth="1.2" strokeLinecap="round" />
      {/* Radiant Focus Core Spark */}
      <circle cx="12" cy="12" r="1.5" fill="#fef08a" />
      <circle cx="12" cy="12" r="0.75" fill="#ffffff" />
    </svg>
  );
}

/* =========================================================================
   09. SKILLS — Prismatic Elemental Lightning Storm Crystal
   ========================================================================= */
export function GraphicSkillsIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-skill-bolt" x1="13" y1="1" x2="8" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#facc15" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      {/* Background Shockwave Ring */}
      <circle cx="12" cy="12" r="8.5" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      {/* High-Energy Angular Lightning Bolt */}
      <path d="M13.5 1.5L4.5 13H11.5L9.5 22.5L19.5 10H12.5L13.5 1.5Z" fill="url(#sb-skill-bolt)" stroke="#450a0a" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Specular Core Energy Strand */}
      <path d="M12.5 3.5L6.5 12.5H11.5L10 18.5L16.5 11H12L12.5 3.5Z" fill="#ffffff" opacity="0.75" />
      {/* Electric Spark Orbs */}
      <circle cx="3.5" cy="8.5" r="1" fill="#38bdf8" />
      <circle cx="20.5" cy="15.5" r="1" fill="#38bdf8" />
    </svg>
  );
}

/* =========================================================================
   10. TOWER — Tower of Ascension Monolith Spire & Beacon Beam
   ========================================================================= */
export function GraphicTowerIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-tow-spire" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="sb-tow-beam" x1="12" y1="1" x2="12" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Skyward Beacon Light Beam */}
      <polygon points="12,1 15,9 9,9" fill="url(#sb-tow-beam)" opacity="0.65" />
      {/* Spire Monolith Base */}
      <polygon points="12,3 17,9 16,21 8,21 7,9" fill="url(#sb-tow-spire)" stroke="#7dd3fc" strokeWidth="1" strokeLinejoin="round" />
      {/* Fortress Crenellations / Battlements */}
      <rect x="6" y="20" width="12" height="2" fill="#0f172a" stroke="#0284c7" strokeWidth="0.8" />
      <rect x="8" y="10" width="8" height="1.5" rx="0.5" fill="#38bdf8" />
      <rect x="9" y="14" width="6" height="1.5" rx="0.5" fill="#38bdf8" />
      {/* Monolith Portal Arch */}
      <path d="M10.5 21V17.5C10.5 16.67 11.17 16 12 16C12.83 16 13.5 16.67 13.5 17.5V21" fill="#38bdf8" stroke="#f0f9ff" strokeWidth="0.8" />
      {/* Floating Runic Keystone Orbitals */}
      <rect x="3.5" y="11" width="1.5" height="2.5" rx="0.4" fill="#a78bfa" stroke="#6d28d9" strokeWidth="0.5" />
      <rect x="19" y="13" width="1.5" height="2.5" rx="0.4" fill="#a78bfa" stroke="#6d28d9" strokeWidth="0.5" />
    </svg>
  );
}

/* =========================================================================
   11. BOSSES — Horned Abyssal Demon Skull & Crimson Eyes
   ========================================================================= */
export function GraphicBossesIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-boss-bone" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="45%" stopColor="#94a3b8" />
          <stop offset="85%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="sb-boss-horn" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="60%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
      </defs>
      {/* Left Horn */}
      <path d="M6 9C5 5 2 3 1.5 2C3.5 5 4.5 7.5 5.5 10Z" fill="url(#sb-boss-horn)" stroke="#ef4444" strokeWidth="0.8" />
      {/* Right Horn */}
      <path d="M18 9C19 5 22 3 22.5 2C20.5 5 19.5 7.5 18.5 10Z" fill="url(#sb-boss-horn)" stroke="#ef4444" strokeWidth="0.8" />
      {/* Skull Cranium */}
      <path d="M5 10C5 6.5 8 4 12 4C16 4 19 6.5 19 10C19 12.5 17.5 14.5 16 15.5V19.5C16 20.33 15.33 21 14.5 21H9.5C8.67 21 8 20.33 8 19.5V15.5C6.5 14.5 5 12.5 5 10Z" fill="url(#sb-boss-bone)" stroke="#cbd5e1" strokeWidth="1" />
      {/* Glowing Crimson Eye Sockets */}
      <ellipse cx="8.5" cy="11.5" rx="2" ry="2.5" fill="#450a0a" stroke="#ef4444" strokeWidth="0.8" />
      <circle cx="8.5" cy="11.5" r="1" fill="#f87171" />
      <ellipse cx="15.5" cy="11.5" rx="2" ry="2.5" fill="#450a0a" stroke="#ef4444" strokeWidth="0.8" />
      <circle cx="15.5" cy="11.5" r="1" fill="#f87171" />
      {/* Inverted Triangular Nasal Cavity */}
      <polygon points="12,13 13,15.5 11,15.5" fill="#0f172a" />
      {/* Fanged Teeth */}
      <path d="M9.5 18V20M11 18V20M13 18V20M14.5 18V20" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/* =========================================================================
   12. BOSS PR — Dual Crossed Celestial Battle Blades
   ========================================================================= */
export function GraphicBossPRIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-pr-blade1" x1="2" y1="2" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="sb-pr-blade2" x1="22" y1="2" x2="4" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
      </defs>
      {/* Blade 1 (Diagonal Top-Left to Bottom-Right) */}
      <path d="M21 3L18 3L9 12L10.5 13.5L19.5 4.5V2L21 3Z" fill="url(#sb-pr-blade1)" stroke="#1e3a8a" strokeWidth="0.8" />
      {/* Blade 1 Guard & Pommel */}
      <rect x="7" y="11" width="5" height="1.6" rx="0.6" transform="rotate(45 7 11)" fill="#fbbf24" stroke="#78350f" strokeWidth="0.7" />
      <line x1="6.5" y1="14.5" x2="4" y2="17" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="3" cy="18" r="1.4" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.6" />

      {/* Blade 2 (Diagonal Top-Right to Bottom-Left) */}
      <path d="M3 3L6 3L15 12L13.5 13.5L4.5 4.5V2L3 3Z" fill="url(#sb-pr-blade2)" stroke="#831843" strokeWidth="0.8" />
      {/* Blade 2 Guard & Pommel */}
      <rect x="15" y="11" width="5" height="1.6" rx="0.6" transform="rotate(-45 15 11)" fill="#fbbf24" stroke="#78350f" strokeWidth="0.7" />
      <line x1="17.5" y1="14.5" x2="20" y2="17" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="21" cy="18" r="1.4" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.6" />

      {/* Radiant Central Clash Spark */}
      <circle cx="12" cy="12" r="2" fill="#fef08a" />
      <circle cx="12" cy="12" r="1" fill="#ffffff" />
    </svg>
  );
}

/* =========================================================================
   13. INVENTORY — Adventurer's Leather Rucksack & Brass Buckles
   ========================================================================= */
export function GraphicInventoryIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-inv-leather" x1="4" y1="4" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="45%" stopColor="#92400e" />
          <stop offset="90%" stopColor="#451a03" />
        </linearGradient>
      </defs>
      {/* Backpack Main Body */}
      <path d="M5 8C5 6.34 6.34 5 8 5H16C17.66 5 19 6.34 19 8V18C19 19.66 17.66 21 16 21H8C6.34 21 5 19.66 5 18V8Z" fill="url(#sb-inv-leather)" stroke="#271103" strokeWidth="1.2" />
      {/* Top Handle Loop */}
      <path d="M9 5V3C9 2.45 9.45 2 10 2H14C14.55 2 15 2.45 15 3V5" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
      {/* Upper Flap */}
      <path d="M4.5 8C4.5 6.5 6 5.5 8 5.5H16C18 5.5 19.5 6.5 19.5 8V11.5C19.5 12.5 18 13.5 16 13.5H8C6 13.5 4.5 12.5 4.5 11.5V8Z" fill="#b45309" stroke="#271103" strokeWidth="1" />
      {/* Golden Brass Buckle Straps */}
      <rect x="7.5" y="7" width="2" height="9" rx="0.5" fill="#78350f" />
      <rect x="7" y="11" width="3" height="2" rx="0.5" fill="#fde047" stroke="#78350f" strokeWidth="0.6" />
      <rect x="14.5" y="7" width="2" height="9" rx="0.5" fill="#78350f" />
      <rect x="14" y="11" width="3" height="2" rx="0.5" fill="#fde047" stroke="#78350f" strokeWidth="0.6" />
      {/* Potion Flask Pocket on Right */}
      <path d="M19 13H21C21.5 13 22 13.5 22 14V17C22 17.5 21.5 18 21 18H19" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
      <rect x="19.5" y="12" width="1.5" height="1" fill="#e0f2fe" />
    </svg>
  );
}

/* =========================================================================
   14. FORGE & CRAFT — Volcanic Smithing Hammer & Enchanted Anvil
   ========================================================================= */
export function GraphicCraftingIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-cr-head" x1="2" y1="2" x2="16" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="sb-cr-anvil" x1="6" y1="14" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      {/* Heavy Anvil Base */}
      <path d="M6 16H18C20 16 21 17 21 18H5C5 17 5.5 16 6 16Z" fill="url(#sb-cr-anvil)" stroke="#64748b" strokeWidth="0.8" />
      <rect x="7" y="18" width="10" height="3" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
      <rect x="5" y="21" width="14" height="2" rx="0.5" fill="#334155" />
      {/* Hammer Handle (Diagonal) */}
      <line x1="8" y1="12" x2="19" y2="2" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" />
      {/* Hammer Head */}
      <rect x="4" y="6" width="9" height="5" rx="1" transform="rotate(45 4 6)" fill="url(#sb-cr-head)" stroke="#cbd5e1" strokeWidth="1" />
      {/* Molten Strike Sparks */}
      <polygon points="9,14 11,11 12,14 14,12 13,15" fill="#f59e0b" />
      <circle cx="10" cy="12" r="0.8" fill="#fef08a" />
      <circle cx="13.5" cy="13" r="0.8" fill="#fef08a" />
    </svg>
  );
}

/* =========================================================================
   15. SHOP — Merchant's Golden Treasure Vault Chest
   ========================================================================= */
export function GraphicShopIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-sh-wood" x1="3" y1="8" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="sb-sh-gold" x1="2" y1="4" x2="22" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
      </defs>
      {/* Chest Lower Tub */}
      <path d="M4 11H20V18C20 19.66 18.66 21 17 21H7C5.34 21 4 19.66 4 18V11Z" fill="url(#sb-sh-wood)" stroke="#271103" strokeWidth="1.2" />
      {/* Arched Domed Chest Lid */}
      <path d="M4 11C4 7 7 4 12 4C17 4 20 7 20 11H4Z" fill="url(#sb-sh-gold)" stroke="#713f12" strokeWidth="1.2" />
      {/* Golden Reinforcing Bands */}
      <rect x="7" y="5" width="2" height="15" fill="#fde047" stroke="#854d0e" strokeWidth="0.6" />
      <rect x="15" y="5" width="2" height="15" fill="#fde047" stroke="#854d0e" strokeWidth="0.6" />
      {/* Keyhole Padlock Lockplate */}
      <rect x="10.5" y="10" width="3" height="4" rx="1" fill="#fef08a" stroke="#713f12" strokeWidth="0.8" />
      <circle cx="12" cy="11.5" r="0.75" fill="#451a03" />
      <line x1="12" y1="12" x2="12" y2="13.2" stroke="#451a03" strokeWidth="0.8" />
    </svg>
  );
}

/* =========================================================================
   16. BEASTS & PETS — Mythic Dragon Paw Crest & Spirit Emerald Claws
   ========================================================================= */
export function GraphicBeastsIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <radialGradient id="sb-bst-pad" cx="12" cy="14" r="7" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </radialGradient>
        <linearGradient id="sb-bst-claw" x1="12" y1="1" x2="12" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* Central Paw Pad */}
      <path d="M12 11C8.5 11 6.5 13.5 6.5 16C6.5 18.5 8.8 20.5 12 20.5C15.2 20.5 17.5 18.5 17.5 16C17.5 13.5 15.5 11 12 11Z" fill="url(#sb-bst-pad)" stroke="#a7f3d0" strokeWidth="1" />
      {/* Toe Claws 1 (Leftmost) */}
      <ellipse cx="5" cy="10" rx="1.8" ry="2.6" transform="rotate(-25 5 10)" fill="url(#sb-bst-claw)" stroke="#064e3b" strokeWidth="0.8" />
      {/* Toe Claws 2 (Center Left) */}
      <ellipse cx="9" cy="6.5" rx="2" ry="3" transform="rotate(-8 9 6.5)" fill="url(#sb-bst-claw)" stroke="#064e3b" strokeWidth="0.8" />
      {/* Toe Claws 3 (Center Right) */}
      <ellipse cx="15" cy="6.5" rx="2" ry="3" transform="rotate(8 15 6.5)" fill="url(#sb-bst-claw)" stroke="#064e3b" strokeWidth="0.8" />
      {/* Toe Claws 4 (Rightmost) */}
      <ellipse cx="19" cy="10" rx="1.8" ry="2.6" transform="rotate(25 19 10)" fill="url(#sb-bst-claw)" stroke="#064e3b" strokeWidth="0.8" />
      {/* Central Spirit Sparkle */}
      <circle cx="12" cy="15.5" r="1.5" fill="#ecfdf5" opacity="0.8" />
    </svg>
  );
}

/* =========================================================================
   17. AI SYSTEM / AIRA — Sentient Neural Cyber-Core & Quantum Iris
   ========================================================================= */
export function GraphicAiraIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <radialGradient id="sb-aira-core" cx="12" cy="12" r="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="35%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#082f49" />
        </radialGradient>
      </defs>
      {/* Outer Hexagonal Shield Matrix */}
      <polygon points="12,2 20.5,7 20.5,17 12,22 3.5,17 3.5,7" stroke="#38bdf8" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Concentric Neural Rings */}
      <circle cx="12" cy="12" r="6" fill="url(#sb-aira-core)" stroke="#7dd3fc" strokeWidth="1" />
      <circle cx="12" cy="12" r="3" stroke="#f0f9ff" strokeWidth="1" strokeDasharray="3 1.5" />
      {/* Quantum Iris Center */}
      <circle cx="12" cy="12" r="1.5" fill="#fef08a" />
      <circle cx="12" cy="12" r="0.75" fill="#ffffff" />
      {/* Neural Node Data Points */}
      <circle cx="12" cy="3.5" r="0.9" fill="#38bdf8" />
      <circle cx="19" cy="7.5" r="0.9" fill="#38bdf8" />
      <circle cx="19" cy="16.5" r="0.9" fill="#38bdf8" />
      <circle cx="12" cy="20.5" r="0.9" fill="#38bdf8" />
      <circle cx="5" cy="16.5" r="0.9" fill="#38bdf8" />
      <circle cx="5" cy="7.5" r="0.9" fill="#38bdf8" />
    </svg>
  );
}

/* =========================================================================
   18. ACHIEVEMENTS — Winged Champion's Golden Laurel Trophy Cup
   ========================================================================= */
export function GraphicAchievementsIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="sb-ach-gold" x1="4" y1="2" x2="20" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#facc15" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>
      {/* Left Trophy Wing Handle */}
      <path d="M7 6C4 6 3 8.5 3 11C3 13 4.5 14.5 7 14.5" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right Trophy Wing Handle */}
      <path d="M17 6C20 6 21 8.5 21 11C21 13 19.5 14.5 17 14.5" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
      {/* Trophy Chalice Cup */}
      <path d="M6.5 4H17.5V11C17.5 14 15 16 12 16C9 16 6.5 14 6.5 11V4Z" fill="url(#sb-ach-gold)" stroke="#78350f" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Pedestal Stem */}
      <path d="M10.5 16V18.5H13.5V16" stroke="#b45309" strokeWidth="1.5" />
      {/* Marble Pedestal Base */}
      <rect x="7" y="18.5" width="10" height="3" rx="1" fill="#1e293b" stroke="#facc15" strokeWidth="1" />
      {/* Radiant Jewel Star Inset */}
      <path d="M12 7L12.7 8.5L14.2 8.7L13.1 9.8L13.4 11.3L12 10.5L10.6 11.3L10.9 9.8L9.8 8.7L11.3 8.5L12 7Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.5" />
    </svg>
  );
}

/* =========================================================================
   19. AUTOMATIONS — Chronos Gear & Interlocking Cyber Circuit Traces
   ========================================================================= */
export function GraphicAutomationsIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <radialGradient id="sb-auto-gear" cx="12" cy="12" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#0284c7" />
          <stop offset="85%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
      {/* 8 Cog Teeth */}
      <rect x="10.5" y="1.5" width="3" height="4" rx="0.8" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.6" />
      <rect x="10.5" y="18.5" width="3" height="4" rx="0.8" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.6" />
      <rect x="1.5" y="10.5" width="4" height="3" rx="0.8" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.6" />
      <rect x="18.5" y="10.5" width="4" height="3" rx="0.8" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.6" />
      <rect x="4" y="4" width="3" height="3" rx="0.6" transform="rotate(45 4 4)" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.6" />
      <rect x="18" y="4" width="3" height="3" rx="0.6" transform="rotate(45 18 4)" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.6" />
      <rect x="4" y="18" width="3" height="3" rx="0.6" transform="rotate(45 4 18)" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.6" />
      <rect x="18" y="18" width="3" height="3" rx="0.6" transform="rotate(45 18 18)" fill="#38bdf8" stroke="#0369a1" strokeWidth="0.6" />
      {/* Main Gear Disc Wheel */}
      <circle cx="12" cy="12" r="7.5" fill="url(#sb-auto-gear)" stroke="#7dd3fc" strokeWidth="1" />
      {/* Inner Circuit Trace Center */}
      <circle cx="12" cy="12" r="3.5" fill="#030712" stroke="#38bdf8" strokeWidth="1" />
      <circle cx="12" cy="12" r="1.5" fill="#10b981" />
      {/* Circuit Nodes */}
      <line x1="12" y1="8.5" x2="12" y2="5.5" stroke="#34d399" strokeWidth="1" strokeLinecap="round" />
      <line x1="15.5" y1="12" x2="18.5" y2="12" stroke="#34d399" strokeWidth="1" strokeLinecap="round" />
      <circle cx="12" cy="5.5" r="0.75" fill="#6ee7b7" />
      <circle cx="18.5" cy="12" r="0.75" fill="#6ee7b7" />
    </svg>
  );
}
