import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-base border-2 border-border bg-secondary-background/60 shadow-shadow",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
