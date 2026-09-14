"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

export interface BitSliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> {
  value?: number | number[];
  defaultValue?: number | number[];
  onChange?: (value: number) => void;
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  variant?: "default" | "retro" | "destructive";
}

const variantTracks = {
  default: "from-[#2563eb] to-[#38bdf8]",
  retro: "from-[#854d0e] to-[#f59e0b]",
  destructive: "from-[#991b1b] to-[#f43f5e]",
};

const variantThumbs = {
  default: "bg-[#38bdf8]",
  retro: "bg-[#f6c453]",
  destructive: "bg-[#ef4444]",
};

const Slider = React.forwardRef<HTMLInputElement, BitSliderProps>(
  (
    {
      className,
      value,
      defaultValue = [50],
      onChange,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      showValue = false,
      variant = "retro",
      ...props
    },
    ref
  ) => {
    const getInitialVal = () => {
      if (Array.isArray(defaultValue)) return defaultValue[0] ?? 50;
      if (typeof defaultValue === "number") return defaultValue;
      return 50;
    };

    const [internalVal, setInternalVal] = React.useState<number>(getInitialVal);

    const isControlled = value !== undefined;
    const currentVal = isControlled
      ? (Array.isArray(value) ? (value[0] ?? 0) : (typeof value === "number" ? value : 0))
      : internalVal;
    const percentage = max > min ? ((currentVal - min) / (max - min)) * 100 : 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = Number(e.target.value);
      if (!isControlled) {
        setInternalVal(newVal);
      }
      onChange?.(newVal);
      onValueChange?.([newVal]);
    };

    return (
      <div className={cn("relative w-full flex items-center gap-3", className)}>
        <div className="relative w-full h-6 flex items-center">
          {/* Retro Track */}
          <div className="w-full h-3 bg-[#0a0d18] border-2 border-black relative overflow-hidden shadow-[inset_1px_1px_0_0_#000]">
            <div
              className={cn("h-full bg-gradient-to-r transition-all duration-75", variantTracks[variant])}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Stepped pixel borders for track */}
          <div
            className="absolute inset-x-0 top-1.5 h-3 border-y-2 -my-[2px] border-foreground/60 dark:border-ring/60 pointer-events-none"
            aria-hidden="true"
          />

          {/* Range Input element */}
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentVal}
            disabled={disabled}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
            {...props}
          />

          {/* Chunky Retro Thumb Indicator */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute top-1/2 -translate-y-1/2 size-5 border-2 border-black shadow-[1px_1px_0_0_#000] pointer-events-none transition-transform z-10",
              variantThumbs[variant]
            )}
            style={{
              left: `calc(${percentage}% - 10px)`,
            }}
          >
            <div className="w-full h-full border border-white/30" />
          </div>
        </div>

        {showValue && (
          <span className="retro text-[10px] text-[#f6c453] font-mono min-w-8 text-right select-none">
            {currentVal}
          </span>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
export default Slider;
