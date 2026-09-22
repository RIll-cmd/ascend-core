import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ButtonBorderDecorations } from "./retro-borders";
import "./styles/retro.css";

export const bitButtonVariants = cva(
  "retro relative inline-flex items-center justify-center font-bold text-center select-none uppercase tracking-wider transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:translate-y-[2px]",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background dark:bg-foreground dark:text-background hover:opacity-90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        gold:
          "bg-[#78350f] text-[#fde047] hover:bg-[#92400e] hover:text-[#fff]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success:
          "bg-[#065f46] text-[#6ee7b7] hover:bg-[#047857]",
        dungeon:
          "bg-[#181d17] text-[#fff8df] hover:bg-[#20271f]",
        outline:
          "bg-transparent text-foreground hover:bg-accent/30",
        ghost:
          "bg-transparent hover:bg-accent/40 text-foreground active:translate-y-0",
        link:
          "bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-7 px-2.5 text-[9px] sm:text-[10px]",
        md: "h-9 px-4 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "size-8 text-xs p-0",
      },
      borderStyle: {
        "retro-beveled": "border-none",
        classic: "border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      borderStyle: "retro-beveled",
    },
  }
);

const VARIANT_BORDER_COLORS: Record<string, string> = {
  default: "bg-foreground dark:bg-ring",
  secondary: "bg-foreground dark:bg-ring",
  gold: "bg-[#f59e0b]",
  destructive: "bg-foreground dark:bg-ring",
  success: "bg-[#10b981]",
  dungeon: "bg-[#8c7a53]",
  outline: "bg-foreground dark:bg-ring",
  ghost: "bg-transparent",
  link: "bg-transparent",
};

export interface BitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof bitButtonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, BitButtonProps>(
  (
    {
      children,
      className,
      variant = "default",
      size = "md",
      borderStyle = "retro-beveled",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const colorClass = VARIANT_BORDER_COLORS[variant || "default"] || "bg-foreground dark:bg-ring";
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(bitButtonVariants({ variant, size, borderStyle, className }))}
        {...props}
      >
        {children}
        {borderStyle === "retro-beveled" && (
          <ButtonBorderDecorations
            size={size || "md"}
            variant={variant || "default"}
            colorClass={colorClass}
          />
        )}
      </Comp>
    );
  }
);

Button.displayName = "8BitButton";
export default Button;
