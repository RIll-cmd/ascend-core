import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import HealthBar from "./health-bar";
import "./styles/retro.css";

export const enemyHealthDisplayVariants = cva("relative w-full space-y-1.5", {
  variants: {
    variant: {
      default: "",
      retro: "retro",
    },
    size: {
      sm: "text-[9px]",
      md: "text-xs",
      lg: "text-sm",
    },
    textColor: {
      red: "text-red-400",
      orange: "text-orange-400",
      yellow: "text-yellow-400",
      green: "text-green-400",
      blue: "text-blue-400",
      purple: "text-purple-400",
    },
  },
  defaultVariants: {
    variant: "retro",
    size: "md",
    textColor: "red",
  },
});

export interface EnemyHealthDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enemyHealthDisplayVariants> {
  enemyName: string;
  level?: number;
  currentHealth: number;
  maxHealth: number;
  isBoss?: boolean;
  showLevel?: boolean;
  showHealthText?: boolean;
  healthBarVariant?: "retro" | "default";
  healthBarColor?: string;
  enemyNameColor?: string;
}

export default function EnemyHealthDisplay({
  className,
  variant = "retro",
  size = "md",
  textColor = "red",
  enemyName,
  level,
  currentHealth,
  maxHealth,
  isBoss = false,
  showLevel = true,
  showHealthText = true,
  healthBarVariant = "retro",
  healthBarColor = "bg-gradient-to-r from-red-600 to-rose-500",
  enemyNameColor,
  ...props
}: EnemyHealthDisplayProps) {
  const healthPercentage = Math.max(
    0,
    Math.min(100, maxHealth > 0 ? (currentHealth / maxHealth) * 100 : 0)
  );
  const healthText = `${Math.max(0, currentHealth)}/${maxHealth}`;

  return (
    <div
      className={cn(
        enemyHealthDisplayVariants({ variant, size, textColor }),
        className
      )}
      {...props}
    >
      {/* Enemy Name, Level and Phase Skull */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2 truncate">
          {isBoss && (
            <span className="text-red-500 font-bold text-xs" title="Boss Tier">
              💀
            </span>
          )}
          <span
            className={cn(
              "font-bold truncate",
              enemyNameColor || (isBoss ? "text-[#fca5a5]" : "text-[#fff8df]")
            )}
          >
            {enemyName}
          </span>
          {showLevel && level !== undefined && (
            <span className="text-slate-400 font-mono text-[9px] shrink-0">
              Lv.{level}
            </span>
          )}
        </div>
        {showHealthText && (
          <span className="text-slate-400 font-mono text-[9px] shrink-0 tabular-nums">
            {healthText}
          </span>
        )}
      </div>

      {/* Health Bar Container */}
      <div className="relative">
        <HealthBar
          value={healthPercentage}
          variant={healthBarVariant}
          progressProps={{ progressBg: healthBarColor }}
          className="w-full"
        />

        {/* Health percentage overlay for retro variant */}
        {healthBarVariant === "retro" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[8px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] bg-black/60 px-1 rounded-xs">
              {Math.round(healthPercentage)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export { EnemyHealthDisplay };
