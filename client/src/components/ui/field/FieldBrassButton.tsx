"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FieldBrassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brass" | "walnut" | "danger" | "emerald";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function FieldBrassButton({
  variant = "brass",
  size = "md",
  className,
  children,
  ...props
}: FieldBrassButtonProps) {
  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-4 py-1.5 text-xs sm:text-sm gap-2",
    lg: "px-6 py-2.5 text-sm sm:text-base gap-2.5",
  }[size];

  const variantStyles = {
    brass:
      "bg-gradient-to-b from-[#dfb958] via-[#c59b27] to-[#8c6717] text-[#1a1206] font-bold border border-[#ffd875] shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]",
    walnut:
      "bg-gradient-to-b from-[#2a1f16] to-[#17110c] text-[#e8cfab] border border-[#c59b27]/40 shadow-[0_2px_4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(245,218,143,0.1)] hover:border-[#c59b27] hover:text-[#fff] active:translate-y-[1px]",
    danger:
      "bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#591010] text-[#fef2f2] font-bold border border-[#ef4444]/60 shadow-[0_2px_4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 active:translate-y-[1px]",
    emerald:
      "bg-gradient-to-b from-[#15803d] via-[#166534] to-[#0f3d20] text-[#ecfdf5] font-bold border border-[#22c55e]/50 shadow-[0_2px_4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 active:translate-y-[1px]",
  }[variant];

  return (
    <button
      className={cn(
        "font-expedition uppercase tracking-wider rounded-sm flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
        sizeStyles,
        variantStyles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default FieldBrassButton;
