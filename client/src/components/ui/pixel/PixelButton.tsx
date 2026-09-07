"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { playUIMenuSFX } from "@/utils/audio";

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "danger"
    | "purple"
    | "gold"
    | "cyan"
    | "dark"
    | "iron"
    | "outline";
  size?: "sm" | "md" | "lg";
}

export function PixelButton({
  type = "button",
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
  disabled,
  ...props
}: PixelButtonProps) {
  const variantStyles = {
    primary: "bg-[#2563eb] text-white hover:bg-[#3b82f6] hover:brightness-110 active:bg-[#1e40af]",
    secondary: "bg-[#25133d] text-white hover:bg-[#3d1e63] hover:brightness-110 active:bg-[#1a0c2e]",
    success: "bg-[#15803d] text-white hover:bg-[#16a34a] hover:brightness-110 active:bg-[#14532d]",
    warning: "bg-[#b45309] text-white hover:bg-[#d97706] hover:brightness-110 active:bg-[#78350f]",
    error: "bg-[#b91c1c] text-white hover:bg-[#dc2626] hover:brightness-110 active:bg-[#7f1d1d]",
    danger: "bg-[#b91c1c] text-white hover:bg-[#dc2626] hover:brightness-110 active:bg-[#7f1d1d]",
    purple: "bg-[#7c3aed] text-white hover:bg-[#9333ea] hover:brightness-110 active:bg-[#5b21b6]",
    gold: "bg-[#d97706] !text-[#180b02] hover:!bg-[#f59e0b] hover:brightness-110 active:!bg-[#b45309]",
    cyan: "bg-[#0891b2] text-white hover:bg-[#06b6d4] hover:brightness-110 active:bg-[#155e75]",
    dark: "bg-[#18110e] text-stone-200 hover:bg-[#2a1d18] hover:text-white hover:brightness-115 active:bg-[#120b08]",
    iron: "bg-[#221713] text-stone-200 hover:bg-[#35251f] hover:text-white hover:brightness-110 active:bg-[#180f0c]",
    outline:
      "bg-transparent text-[#221208] border-2 border-[#4a2813] hover:bg-[#caa97e]/60 hover:border-[#221208]",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs min-h-[32px]",
    md: "px-4 py-2 text-xs sm:text-sm min-h-[38px]",
    lg: "px-5 py-2.5 text-sm min-h-[44px]",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      playUIMenuSFX("click");
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "pixel-btn font-pixel normal-case tracking-wider font-bold rounded-none active:translate-y-0.5 transition-colors cursor-pointer",
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size],
        disabled && "opacity-50 cursor-not-allowed pointer-events-none filter grayscale",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default PixelButton;
