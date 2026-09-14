"use client";

import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent as ShadcnTooltipContent,
  TooltipProvider as ShadcnTooltipProvider,
  TooltipTrigger as ShadcnTooltipTrigger,
} from "@/components/ui/tooltip";
import "./styles/retro.css";

export const tooltipVariants = cva("", {
  variants: {
    font: {
      normal: "font-mono",
      retro: "retro",
    },
    variant: {
      default: "bg-[#0b1020] text-slate-100 border-[#3b82f6]",
      gold: "bg-[#181206] text-[#fff1b5] border-[#f59e0b]",
      dungeon: "bg-[#151913] text-[#fff8df] border-[#8c7a53]",
    },
  },
  defaultVariants: {
    font: "retro",
    variant: "default",
  },
});

export interface BitTooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof ShadcnTooltipContent>,
    VariantProps<typeof tooltipVariants> {}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof ShadcnTooltipContent>,
  BitTooltipContentProps
>(({ className, children, font = "retro", variant = "default", ...props }, ref) => {
  return (
    <ShadcnTooltipContent
      ref={ref}
      className={cn(
        "rounded-none border-2 border-black p-2.5 text-[10px] shadow-[3px_3px_0_0_#000]",
        tooltipVariants({ font, variant }),
        className
      )}
      {...props}
    >
      {children}
      {/* 8-bit side notch pixels */}
      <div className="absolute top-1 bottom-1 -left-1 w-1 bg-inherit border-y border-l border-black pointer-events-none" />
      <div className="absolute top-1 bottom-1 -right-1 w-1 bg-inherit border-y border-r border-black pointer-events-none" />
    </ShadcnTooltipContent>
  );
});

TooltipContent.displayName = "TooltipContent";

const Tooltip = ShadcnTooltip;
const TooltipProvider = ShadcnTooltipProvider;
const TooltipTrigger = ShadcnTooltipTrigger;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
export default Tooltip;
