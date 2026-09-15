import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.ComponentProps<"textarea">

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "flex min-h-[80px] w-full rounded-base border-2 border-border bg-secondary-background selection:bg-main selection:text-main-foreground px-3 py-2 text-sm font-base text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 shadow-shadow",
          className,
        )}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
