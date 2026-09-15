import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-base border-2 border-border px-2.5 py-0.5 text-xs font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none select-none",
  {
    variants: {
      variant: {
        default: "bg-main text-main-foreground",
        neutral: "bg-secondary-background text-foreground",
        cyan: "bg-cyan-400 text-slate-950 font-black",
        emerald: "bg-emerald-400 text-slate-950 font-black",
        amber: "bg-amber-400 text-slate-950 font-black",
        destructive: "bg-red-500 text-white font-black",
        outline: "bg-transparent text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
