import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

export const progressVariants = cva("", {
  variants: {
    variant: {
      default: "",
      retro: "retro",
    },
    font: {
      normal: "",
      retro: "retro",
    },
  },
  defaultVariants: {
    variant: "retro",
    font: "retro",
  },
});

export interface BitProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  segments?: number;
  progressBg?: string;
  showSegments?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, BitProgressProps>(
  (
    {
      className,
      font,
      variant = "retro",
      value = 0,
      max = 100,
      segments = 20,
      progressBg = "bg-primary",
      showSegments = true,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.max(0, Math.min(max, value || 0));
    const percentage = max > 0 ? (clampedValue / max) * 100 : 0;
    const filledSegments = Math.round((percentage / 100) * segments);

    const heightMatch = className?.match(/h-(\d+|\[.*?\])/);
    const heightClass = heightMatch ? heightMatch[0] : "h-3.5";

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn("relative w-full", className)}
        {...props}
      >
        <div
          className={cn(
            "bg-black/60 relative w-full overflow-hidden border-2 border-black",
            heightClass,
            font !== "normal" && "retro"
          )}
        >
          {showSegments && variant === "retro" ? (
            <div className="flex w-full h-full p-[2px] gap-[1px]">
              {Array.from({ length: segments }).map((_, i) => {
                const isFilled = i < filledSegments;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 h-full transition-colors duration-150",
                      isFilled ? progressBg : "bg-transparent"
                    )}
                  />
                );
              })}
            </div>
          ) : (
            <div
              className={cn(
                "h-full transition-all duration-300 ease-out",
                progressBg
              )}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>

        {/* Stepped pixel borders */}
        <div
          className="absolute inset-0 border-y-2 -my-[2px] border-foreground/80 dark:border-ring/80 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 border-x-2 -mx-[2px] border-foreground/80 dark:border-ring/80 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
export default Progress;
