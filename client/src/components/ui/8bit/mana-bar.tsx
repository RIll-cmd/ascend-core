import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress, BitProgressProps } from "./progress";
import "./styles/retro.css";

export interface ManaBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  currentMp?: number;
  maxMp?: number;
  label?: string;
  variant?: "retro" | "default";
  showText?: boolean;
  progressProps?: Partial<BitProgressProps>;
}

export default function ManaBar({
  className,
  value,
  max = 100,
  currentMp,
  maxMp,
  label = "MP",
  variant = "retro",
  showText = false,
  progressProps,
  ...props
}: ManaBarProps) {
  const mpValue = currentMp !== undefined && maxMp !== undefined 
    ? (maxMp > 0 ? (currentMp / maxMp) * 100 : 0)
    : (value ?? 100);

  const displayCurrent = currentMp ?? Math.round(mpValue);
  const displayMax = maxMp ?? max;

  return (
    <div className={cn("relative w-full space-y-1", className)} {...props}>
      {showText && (
        <div className="flex justify-between items-center text-[8px] sm:text-[9px] retro text-cyan-400 font-bold px-0.5">
          <span>{label}</span>
          <span>
            {displayCurrent}/{displayMax}
          </span>
        </div>
      )}
      <Progress
        value={mpValue}
        max={100}
        variant={variant}
        progressBg="bg-gradient-to-r from-blue-600 to-cyan-400"
        className="h-3 sm:h-3.5"
        {...progressProps}
      />
    </div>
  );
}

export { ManaBar };
