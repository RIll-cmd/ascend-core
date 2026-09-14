import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

export const bitButtonVariants = cva(
  "retro relative inline-flex items-center justify-center font-bold text-center select-none uppercase tracking-wider transition-all border-2 border-black disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[3px_3px_0_0_#000] hover:bg-primary/90",
        secondary:
          "bg-[#252b21] text-[#f3df9d] border-[#8c7a53] shadow-[3px_3px_0_0_#000] hover:bg-[#2f3829] hover:border-[#f6c453]",
        gold:
          "bg-[#78350f] text-[#fde047] border-[#f59e0b] shadow-[3px_3px_0_0_#000] hover:bg-[#92400e] hover:text-[#fff]",
        destructive:
          "bg-[#991b1b] text-white border-[#f87171] shadow-[3px_3px_0_0_#000] hover:bg-[#b91c1c]",
        success:
          "bg-[#065f46] text-[#6ee7b7] border-[#10b981] shadow-[3px_3px_0_0_#000] hover:bg-[#047857]",
        dungeon:
          "bg-[#181d17] text-[#fff8df] border-[#8c7a53] shadow-[3px_3px_0_0_#000] hover:border-[#f6c453] hover:bg-[#20271f]",
        outline:
          "bg-transparent text-foreground border-foreground shadow-[3px_3px_0_0_#000] hover:bg-accent hover:text-accent-foreground",
        ghost:
          "border-transparent shadow-none hover:bg-accent/40 text-foreground active:translate-x-0 active:translate-y-0",
      },
      size: {
        sm: "h-7 px-2.5 text-[9px] sm:text-[10px]",
        md: "h-9 px-3.5 text-xs",
        lg: "h-11 px-5 text-sm",
        icon: "h-8 w-8 text-xs p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof bitButtonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, BitButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(bitButtonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "8BitButton";
export default Button;
