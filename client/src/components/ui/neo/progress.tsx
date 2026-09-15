"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-base border-2 border-border bg-secondary-background shadow-shadow",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full border-r-2 border-border bg-main transition-all duration-300",
            percentage === 100 && "border-r-0",
            indicatorClassName,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  },
)
Progress.displayName = "Progress"

export { Progress }
