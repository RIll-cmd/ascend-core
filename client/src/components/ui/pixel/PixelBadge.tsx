"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PixelBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "purple" | "cyan" | "gold" | "dark" | "iron" | "default";
  size?: "sm" | "md";
}

export function PixelBadge({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: PixelBadgeProps) {
  const variantStyles = {
    default: "bg-[#18110e] text-stone-200 border-[#4a3830]",
    primary: "bg-[#182a4d] text-white border-[#2b599e]",
    success: "bg-[#143324] text-white border-[#246944]",
    warning: "bg-[#382310] text-amber-200 border-[#7a481c]",
    danger: "bg-[#3a1219] text-red-200 border-[#7a2230]",
    purple: "bg-[#281545] text-purple-200 border-[#582799]",
    cyan: "bg-[#0c2438] text-cyan-300 border-cyan-500/60",
    gold: "bg-[#382405] text-amber-300 border-amber-500/60",
    dark: "bg-[#140e0c] text-stone-200 border-[#4a3830]",
    iron: "bg-[#221713] text-stone-200 border-[#5a4235]",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-xs sm:text-sm",
  };

  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-1.5 font-pixel uppercase tracking-wider text-white font-bold border-2 border-black shadow-[2px_2px_0_0_#000] select-none",
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {/* 8bitcn stepped pixel side notches */}
      <span
        aria-hidden="true"
        className="absolute -left-[3px] inset-y-[2px] w-[3px] bg-inherit border-y-2 border-l-2 border-black pointer-events-none"
      />
      {children}
      <span
        aria-hidden="true"
        className="absolute -right-[3px] inset-y-[2px] w-[3px] bg-inherit border-y-2 border-r-2 border-black pointer-events-none"
      />
    </span>
  );
}

export default PixelBadge;
