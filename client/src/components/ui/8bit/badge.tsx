import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

export const bitBadgeVariants = cva(
  "relative inline-flex items-center justify-center px-2.5 py-0.5 text-[8px] sm:text-[9px] font-bold border border-black shadow-[1px_1px_0_0_#000] tracking-wider uppercase select-none",
  {
    variants: {
      font: {
        normal: "font-mono",
        retro: "retro",
      },
      variant: {
        default: "bg-foreground text-background dark:bg-foreground dark:text-background",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground border-border",
        destructive: "bg-destructive text-destructive-foreground border-destructive",
        success: "bg-[#065f46] text-[#6ee7b7] border-[#10b981]",
        gold: "bg-[#78350f] text-[#fde047] border-[#f59e0b]",
        outline: "bg-background text-foreground border-foreground",
        mythic: "bg-[#4c0519] text-[#fda4af] border-[#f43f5e]",
      },
    },
    defaultVariants: {
      variant: "default",
      font: "retro",
    },
  }
);

export interface BitBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bitBadgeVariants> {}

function Badge({
  children,
  className = "",
  font = "retro",
  variant = "default",
  ...props
}: BitBadgeProps) {
  return (
    <div
      className={cn(bitBadgeVariants({ variant, font }), className)}
      {...props}
    >
      {/* 8bitcn Authentic Stepped side tabs */}
      <span
        aria-hidden="true"
        className="absolute -left-1.5 inset-y-[3px] w-1.5 bg-inherit border-y border-l border-black pointer-events-none"
      />
      {children}
      <span
        aria-hidden="true"
        className="absolute -right-1.5 inset-y-[3px] w-1.5 bg-inherit border-y border-r border-black pointer-events-none"
      />
    </div>
  );
}

export { Badge };
export default Badge;
