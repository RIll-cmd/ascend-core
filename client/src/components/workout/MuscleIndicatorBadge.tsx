"use client";

import React from "react";
import { MuscleGroupKey, RecoveryStatus } from "@/features/workouts/types/muscleRecovery";
import {
  PixelFlameIcon,
  PixelLightningIcon,
  PixelShieldIcon,
  PixelSquareIcon,
  PixelActivityIcon,
} from "@/components/ui/pixel/PixelIcons";

interface MuscleIndicatorBadgeProps {
  muscleKey: MuscleGroupKey | string;
  name?: string;
  freshness?: number;
  status?: RecoveryStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
}

export const MuscleIndicatorBadge: React.FC<MuscleIndicatorBadgeProps> = ({
  muscleKey,
  name,
  freshness = 100,
  status = "FRESH",
  size = "md",
  showIcon = true,
  className = "",
  onClick,
}) => {
  const displayName = name || muscleKey.replace("_", " ");

  // 4-Tier Dynamic RPG Color & Icon State:
  // 1. Fatigued / Failed (<40%): Colosseum Ruby Red
  // 2. Recovering / Active (40%-79%): Molten Amber Gold
  // 3. Completed / Fresh (>=80%): Gladiator Emerald Green
  // 4. Muted / Neutral / Uncompleted: Warm Muted Gray-Brown
  const getStatusStyles = () => {
    if (status === "FATIGUED" || (freshness !== undefined && freshness < 40)) {
      return {
        bg: "bg-[#2b0a0a] hover:bg-[#3d0f0f]",
        border: "border-[#ef4444]",
        text: "text-[#fca5a5]",
        glow: "shadow-[0_0_10px_rgba(239,68,68,0.25)]",
        dot: "bg-[#ef4444] animate-pulse",
        icon: PixelFlameIcon,
        iconColor: "text-[#ef4444]",
      };
    }
    if (status === "RECOVERING" || (freshness !== undefined && freshness < 80)) {
      return {
        bg: "bg-[#2a1a12] hover:bg-[#3a2419]",
        border: "border-[#f59e0b]",
        text: "text-[#fde047]",
        glow: "shadow-[0_0_10px_rgba(245,158,11,0.25)]",
        dot: "bg-[#f59e0b]",
        icon: PixelLightningIcon,
        iconColor: "text-[#f59e0b]",
      };
    }
    if (status === "FRESH" || (freshness !== undefined && freshness >= 80)) {
      return {
        bg: "bg-[#0c2615] hover:bg-[#13381f]",
        border: "border-[#22c55e]",
        text: "text-[#86efac]",
        glow: "shadow-[0_0_10px_rgba(34,197,94,0.25)]",
        dot: "bg-[#22c55e]",
        icon: PixelShieldIcon,
        iconColor: "text-[#22c55e]",
      };
    }
    return {
      bg: "bg-[#1c1412] hover:bg-[#261c19]",
      border: "border-[#4a3830]",
      text: "text-stone-400",
      glow: "shadow-none",
      dot: "bg-[#78716c]",
      icon: PixelSquareIcon,
      iconColor: "text-stone-500",
    };
  };

  const styles = getStatusStyles();
  const IconComponent = styles.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-none font-mono font-bold border-2 transition-all duration-150 select-none ${styles.bg} ${styles.border} ${styles.text} ${styles.glow} ${sizeClasses[size]} ${onClick ? "cursor-pointer hover:brightness-125 active:translate-y-0.5" : "cursor-default"} ${className}`}
      style={{
        boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.4)"
      }}
    >
      <span className={`w-2 h-2 rounded-none shrink-0 ${styles.dot}`} />
      {showIcon && <IconComponent className={`w-3 h-3 shrink-0 ${styles.iconColor}`} />}
      <span className="truncate tracking-wider">{displayName}</span>
      {freshness !== undefined && (
        <span className="opacity-90 text-[9px] font-mono ml-0.5 tabular-nums">
          [{Math.round(freshness)}%]
        </span>
      )}
    </button>
  );
};
