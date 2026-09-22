import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

export const alertVariants = cva(
  "relative w-full p-4 rounded-none border-none text-xs",
  {
    variants: {
      font: {
        normal: "",
        retro: "retro",
      },
      variant: {
        default: "bg-[#141414] text-neutral-100",
        destructive: "bg-[#2d1215] text-[#fca5a5]",
        success: "bg-[#0d2818] text-[#6ee7b7]",
        warning: "bg-[#291e0a] text-[#fcd34d]",
        gold: "bg-[#1c1917] text-[#fde047]",
        dungeon: "bg-[#181d17] text-[#fff8df]",
        cyber: "bg-[#091e2b] text-[#38bdf8]",
      },
    },
    defaultVariants: {
      variant: "default",
      font: "normal",
    },
  }
);

const ALERT_BORDER_COLORS: Record<string, string> = {
  default: "bg-[#f9f4da] dark:bg-[#f9f4da]",
  destructive: "bg-[#ef4444]",
  success: "bg-[#10b981]",
  warning: "bg-[#f59e0b]",
  gold: "bg-[#fcba28]",
  dungeon: "bg-[#8c7a53]",
  cyber: "bg-[#14b6e5]",
};

export interface BitAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  borderColorClass?: string;
  showPixelBorders?: boolean;
}

function Alert({
  children,
  className,
  font,
  variant = "default",
  borderColorClass,
  showPixelBorders = true,
  ...props
}: BitAlertProps) {
  const borderClass =
    borderColorClass || ALERT_BORDER_COLORS[variant || "default"] || "bg-foreground dark:bg-ring";

  return (
    <div className="relative">
      <div
        role="alert"
        className={cn(alertVariants({ variant, font }), className)}
        {...props}
      >
        {children}
      </div>

      {showPixelBorders && (
        <span aria-hidden="true" className="pointer-events-none">
          {/* Top & bottom stepped borders */}
          <span className={cn("absolute -top-1.5 w-1/2 left-1.5 h-1.5", borderClass)} />
          <span className={cn("absolute -top-1.5 w-1/2 right-1.5 h-1.5", borderClass)} />
          <span className={cn("absolute -bottom-1.5 w-1/2 left-1.5 h-1.5", borderClass)} />
          <span className={cn("absolute -bottom-1.5 w-1/2 right-1.5 h-1.5", borderClass)} />
          
          {/* Corner steps */}
          <span className={cn("absolute top-0 left-0 size-1.5", borderClass)} />
          <span className={cn("absolute top-0 right-0 size-1.5", borderClass)} />
          <span className={cn("absolute bottom-0 left-0 size-1.5", borderClass)} />
          <span className={cn("absolute bottom-0 right-0 size-1.5", borderClass)} />
          
          {/* Left & right stepped bars */}
          <span className={cn("absolute top-1.5 -left-1.5 h-1/2 w-1.5", borderClass)} />
          <span className={cn("absolute bottom-1.5 -left-1.5 h-1/2 w-1.5", borderClass)} />
          <span className={cn("absolute top-1.5 -right-1.5 h-1/2 w-1.5", borderClass)} />
          <span className={cn("absolute bottom-1.5 -right-1.5 h-1/2 w-1.5", borderClass)} />
        </span>
      )}
    </div>
  );
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("retro mb-1.5 font-black text-xs sm:text-sm tracking-wider uppercase", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-xs leading-relaxed text-neutral-300", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
export default Alert;
