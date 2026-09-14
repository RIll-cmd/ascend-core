import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress, BitProgressProps } from "./progress";
import "./styles/retro.css";

export interface XpBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  currentExp?: number;
  expToNextLevel?: number;
  variant?: "retro" | "default";
  levelUpMessage?: string;
  showText?: boolean;
  progressProps?: Partial<BitProgressProps>;
}

export default function XpBar({
  className,
  value,
  max = 100,
  currentExp,
  expToNextLevel,
  variant = "retro",
  levelUpMessage = "LEVEL UP!",
  showText = false,
  progressProps,
  ...props
}: XpBarProps) {
  const maxVal = expToNextLevel ?? max;
  const currentVal = currentExp ?? value ?? 0;
  const expPercentage = maxVal > 0 ? (currentVal / maxVal) * 100 : 0;

  const isLevelUp = expPercentage >= 100;

  return (
    <div className={cn("relative w-full space-y-1", className)} {...props}>
      {showText && (
        <div className="flex justify-between items-center text-[8px] sm:text-[9px] retro text-amber-300 font-bold px-0.5">
          <span>EXP</span>
          <span>
            {currentExp !== undefined && expToNextLevel !== undefined
              ? `${currentExp}/${expToNextLevel}`
              : `${Math.round(expPercentage)}%`}
          </span>
        </div>
      )}

      <div className="relative">
        <Progress
          value={Math.min(100, expPercentage)}
          max={100}
          variant={variant}
          progressBg="bg-gradient-to-r from-amber-500 to-yellow-400"
          className={cn("h-3.5 sm:h-4", isLevelUp && "animate-pulse")}
          {...progressProps}
        />

        {isLevelUp && (
          <div
            className={cn(
              "retro absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "text-[8px] sm:text-[9px] font-black text-black select-none pointer-events-none whitespace-nowrap z-20",
              "drop-shadow-[1px_1px_0_#fff] [text-shadow:1px_1px_0_#fff,-1px_-1px_0_#fff,1px_-1px_0_#fff,-1px_1px_0_#fff]",
              "animate-pixel-blink"
            )}
          >
            {levelUpMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export { XpBar };
