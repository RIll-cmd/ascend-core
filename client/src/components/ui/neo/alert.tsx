import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-base border-2 border-border p-3.5 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-1 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current shadow-shadow",
  {
    variants: {
      variant: {
        default: "bg-secondary-background text-foreground",
        destructive: "bg-red-500/20 text-red-200 border-red-500",
        warning: "bg-amber-400/20 text-amber-200 border-amber-400",
        optimal: "bg-emerald-400/20 text-emerald-200 border-emerald-400",
        cyan: "bg-cyan-500/20 text-cyan-200 border-cyan-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 font-heading text-xs font-bold uppercase tracking-wider",
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-xs font-base leading-relaxed text-foreground/90",
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
