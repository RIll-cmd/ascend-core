import React from "react";
import {
  PixelDumbbellIcon,
  PixelBookIcon,
  PixelShieldIcon,
  PixelCrosshairIcon,
  PixelTargetIcon,
  PixelHeartIcon,
  PixelRefreshIcon,
  PixelFlameIcon,
  PixelSparklesIcon,
  PixelLightningIcon,
  PixelMoonSleepIcon,
  PixelSunriseIcon,
  PixelRunningBootIcon,
  PixelWaterDropIcon,
} from "@/components/ui/pixel/PixelIcons";

export interface WeaknessIconConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  description: string;
}

export function getAttributeWeaknessConfig(stat: string): WeaknessIconConfig {
  const norm = (stat || "").toLowerCase();
  
  if (norm.includes("str") || norm.includes("strength") || norm.includes("power") || norm.includes("melee")) {
    return {
      icon: PixelDumbbellIcon,
      label: "Strength",
      color: "text-red-400",
      bg: "bg-red-950/60",
      border: "border-red-500/50",
      glow: "drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]",
      description: "Exploit with heavy physical strikes and high-Strength melee abilities (+25% Damage).",
    };
  }
  
  if (norm.includes("knw") || norm.includes("knowledge") || norm.includes("int") || norm.includes("intelligence") || norm.includes("magic") || norm.includes("spell")) {
    return {
      icon: PixelBookIcon,
      label: "Knowledge",
      color: "text-blue-400",
      bg: "bg-blue-950/60",
      border: "border-blue-500/50",
      glow: "drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]",
      description: "Exploit with arcane spell formulas and high-Knowledge intellect tactics (+25% Damage).",
    };
  }
  
  if (norm.includes("dis") || norm.includes("discipline") || norm.includes("will") || norm.includes("defense")) {
    return {
      icon: PixelShieldIcon,
      label: "Discipline",
      color: "text-amber-400",
      bg: "bg-amber-950/60",
      border: "border-amber-500/50",
      glow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]",
      description: "Exploit with relentless counter-guards and high-Discipline endurance strikes (+25% Damage).",
    };
  }
  
  if (norm.includes("fcs") || norm.includes("focus") || norm.includes("crit") || norm.includes("agi") || norm.includes("precision")) {
    return {
      icon: PixelCrosshairIcon,
      label: "Focus",
      color: "text-purple-400",
      bg: "bg-purple-950/60",
      border: "border-purple-500/50",
      glow: "drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]",
      description: "Exploit with precision critical hits and high-Focus weakpoint analysis (+25% Damage).",
    };
  }
  
  if (norm.includes("end") || norm.includes("endurance") || norm.includes("stamina") || norm.includes("vitality")) {
    return {
      icon: PixelHeartIcon,
      label: "Endurance",
      color: "text-emerald-400",
      bg: "bg-emerald-950/60",
      border: "border-emerald-500/50",
      glow: "drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]",
      description: "Exploit through long-drawn attrition and high-Endurance sustained combos (+25% Damage).",
    };
  }
  
  if (norm.includes("rec") || norm.includes("recovery") || norm.includes("regen") || norm.includes("heal")) {
    return {
      icon: PixelRefreshIcon,
      label: "Recovery",
      color: "text-cyan-400",
      bg: "bg-cyan-950/60",
      border: "border-cyan-500/50",
      glow: "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]",
      description: "Exploit with rapid healing counter-bursts and high-Recovery surge abilities (+25% Damage).",
    };
  }
  
  if (norm.includes("con") || norm.includes("consistency") || norm.includes("streak") || norm.includes("momentum")) {
    return {
      icon: PixelFlameIcon,
      label: "Consistency",
      color: "text-orange-400",
      bg: "bg-orange-950/60",
      border: "border-orange-500/50",
      glow: "drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]",
      description: "Exploit with unbreakable routine momentum and continuous multi-hit chains (+25% Damage).",
    };
  }

  return {
    icon: PixelTargetIcon,
    label: stat || "Knowledge",
    color: "text-indigo-300",
    bg: "bg-indigo-950/60",
    border: "border-indigo-500/50",
    glow: "drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]",
    description: "Exploit with targeted tactical attribute matching (+25% Damage).",
  };
}

export function getElementalVulnerabilityConfig(element: string): WeaknessIconConfig {
  const norm = (element || "").toLowerCase();

  if (norm.includes("flame") || norm.includes("fire") || norm.includes("pyro") || norm.includes("burn") || norm.includes("infernal")) {
    return {
      icon: PixelFlameIcon,
      label: "Flame",
      color: "text-orange-400",
      bg: "bg-orange-950/60",
      border: "border-orange-500/50",
      glow: "drop-shadow-[0_0_10px_rgba(249,115,22,0.9)]",
      description: "Highly susceptible to thermal combustion and fire-based skills (+25% Damage).",
    };
  }

  if (norm.includes("frost") || norm.includes("ice") || norm.includes("cryo") || norm.includes("freeze") || norm.includes("cold") || norm.includes("water") || norm.includes("hydro")) {
    return {
      icon: PixelSparklesIcon,
      label: "Frost",
      color: "text-cyan-400",
      bg: "bg-cyan-950/60",
      border: "border-cyan-500/50",
      glow: "drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]",
      description: "Vulnerable to sub-zero cryo-stasis and thermal shock freezing (+25% Damage).",
    };
  }

  if (norm.includes("zap") || norm.includes("lightning") || norm.includes("thunder") || norm.includes("electric") || norm.includes("shock") || norm.includes("volt")) {
    return {
      icon: PixelLightningIcon,
      label: "Lightning",
      color: "text-yellow-400",
      bg: "bg-yellow-950/60",
      border: "border-yellow-500/50",
      glow: "drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]",
      description: "Conductive target: high-voltage electromagnetic surges bypass enemy armor (+25% Damage).",
    };
  }

  if (norm.includes("shadow") || norm.includes("dark") || norm.includes("void") || norm.includes("abyss") || norm.includes("necrotic")) {
    return {
      icon: PixelMoonSleepIcon,
      label: "Shadow",
      color: "text-purple-400",
      bg: "bg-purple-950/60",
      border: "border-purple-500/50",
      glow: "drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]",
      description: "Susceptible to void spatial fractures and abyssal darkness ether (+25% Damage).",
    };
  }

  if (norm.includes("holy") || norm.includes("light") || norm.includes("radiant") || norm.includes("solar") || norm.includes("aether") || norm.includes("celestial")) {
    return {
      icon: PixelSunriseIcon,
      label: "Holy",
      color: "text-amber-300",
      bg: "bg-amber-950/60",
      border: "border-amber-500/50",
      glow: "drop-shadow-[0_0_10px_rgba(252,211,77,0.9)]",
      description: "Corrupted soul structure: incinerated by pure celestial radiance (+25% Damage).",
    };
  }

  if (norm.includes("wind") || norm.includes("air") || norm.includes("gale") || norm.includes("storm") || norm.includes("aero")) {
    return {
      icon: PixelRunningBootIcon,
      label: "Wind",
      color: "text-teal-400",
      bg: "bg-teal-950/60",
      border: "border-teal-500/50",
      glow: "drop-shadow-[0_0_10px_rgba(45,212,191,0.9)]",
      description: "Aerodynamic instability: high-velocity gale slices deal bonus penetration (+25% Damage).",
    };
  }

  if (norm.includes("poison") || norm.includes("acid") || norm.includes("nature") || norm.includes("earth") || norm.includes("toxin")) {
    return {
      icon: PixelWaterDropIcon,
      label: "Poison",
      color: "text-lime-400",
      bg: "bg-lime-950/60",
      border: "border-lime-500/50",
      glow: "drop-shadow-[0_0_10px_rgba(163,230,53,0.9)]",
      description: "Cellular vulnerability: corrosive acid and neuro-toxins degrade vital organs (+25% Damage).",
    };
  }

  return {
    icon: PixelFlameIcon,
    label: element || "Flame",
    color: "text-amber-400",
    bg: "bg-amber-950/60",
    border: "border-amber-500/50",
    glow: "drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]",
    description: "Elemental vulnerability: exploit elemental affinity to deal bonus damage (+25% Damage).",
  };
}
