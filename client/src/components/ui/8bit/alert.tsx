import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

export const alertVariants = cva(
  "relative w-full p-4 border-2 shadow-[2px_2px_0_0_#000] text-xs font-mono",
  {
    variants: {
      font: {
        normal: "",
        retro: "retro",
      },
      variant: {
        default: "bg-[#141a2e]/95 border-[#41517a] text-slate-100",
        destructive: "bg-[#2d1215]/95 border-[#ef4444] text-[#fca5a5]",
        success: "bg-[#0d2818]/95 border-[#10b981] text-[#6ee7b7]",
        warning: "bg-[#291e0a]/95 border-[#f59e0b] text-[#fcd34d]",
        dungeon: "bg-[#181d17]/95 border-[#8c7a53] text-[#fff8df]",
      },
    },
    defaultVariants: {
      variant: "default",
      font: "retro",
    },
  }
);

export interface BitAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

function Alert({
  children,
  className,
  font = "retro",
  variant = "default",
  ...props
}: BitAlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant, font }), className)}
      {...props}
    >
      {children}

      {/* 8-bit notched corner accents */}
      <div className="absolute -top-1 w-1/2 left-1 h-1 bg-inherit border-t-2 border-inherit pointer-events-none" />
      <div className="absolute -top-1 w-1/2 right-1 h-1 bg-inherit border-t-2 border-inherit pointer-events-none" />
      <div className="absolute -bottom-1 w-1/2 left-1 h-1 bg-inherit border-b-2 border-inherit pointer-events-none" />
      <div className="absolute -bottom-1 w-1/2 right-1 h-1 bg-inherit border-b-2 border-inherit pointer-events-none" />
    </div>
  );
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-bold leading-none tracking-wider text-xs", className)}
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
      className={cn("text-[10px] leading-relaxed text-slate-300/90", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
export default Alert;
