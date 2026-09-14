import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress, BitProgressProps } from "./progress";
import "./styles/retro.css";

export interface HealthBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  currentHp?: number;
  maxHp?: number;
  variant?: "retro" | "default";
  showText?: boolean;
  progressProps?: Partial<BitProgressProps>;
}

export default function HealthBar({
  className,
  value,
  max = 100,
  currentHp,
  maxHp,
  variant = "retro",
  showText = false,
  progressProps,
  ...props
}: HealthBarProps) {
  const hpValue = currentHp !== undefined && maxHp !== undefined 
    ? (maxHp > 0 ? (currentHp / maxHp) * 100 : 0)
    : (value ?? 100);

  const displayCurrent = currentHp ?? Math.round(hpValue);
  const displayMax = maxHp ?? max;

  return (
    <div className={cn("relative w-full space-y-1", className)} {...props}>
      {showText && (
        <div className="flex justify-between items-center text-[8px] sm:text-[9px] retro text-red-400 font-bold px-0.5">
          <span>HP</span>
          <span>
            {displayCurrent}/{displayMax}
          </span>
        </div>
      )}
      <Progress
        value={hpValue}
        max={100}
        variant={variant}
        progressBg="bg-gradient-to-r from-red-600 to-rose-500"
        className="h-3 sm:h-3.5"
        {...progressProps}
      />
    </div>
  );
}

export { HealthBar };
