"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface WaxSealCheckProps {
  completed?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function WaxSealCheck({
  completed = false,
  size = "md",
  className,
  onClick,
}: WaxSealCheckProps) {
  const sizeStyles = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  }[size];

  if (!completed) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "rounded-full border-2 border-dashed border-[#c59b27]/40 bg-[#17120e]/60 hover:border-[#c59b27] hover:bg-[#221a14] transition-all duration-200 flex items-center justify-center cursor-pointer group shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]",
          sizeStyles,
          className
        )}
        title="Affix Wax Seal (Complete)"
      >
        <span className="w-2 h-2 rounded-full bg-[#c59b27]/30 group-hover:bg-[#c59b27] transition-colors" />
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-full bg-gradient-to-br from-[#b91c1c] via-[#991b1b] to-[#591010] border border-[#f87171]/40 shadow-[0_2px_8px_rgba(153,27,27,0.7),inset_0_1px_2px_rgba(255,255,255,0.4)] flex items-center justify-center text-[#fde047] font-bold select-none cursor-pointer animate-wax-stamp relative overflow-hidden",
        sizeStyles,
        className
      )}
      title="Sealed & Cleared"
    >
      {/* Wax Impression Edge Details */}
      <span className="absolute inset-0 rounded-full border border-black/30 pointer-events-none" />
      <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">✓</span>
    </div>
  );
}

export default WaxSealCheck;
