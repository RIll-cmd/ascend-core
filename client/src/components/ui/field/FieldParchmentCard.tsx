"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FieldParchmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  titleBadge?: React.ReactNode;
  variant?: "default" | "danger" | "emerald" | "amber";
  children: React.ReactNode;
}

export function FieldParchmentCard({
  title,
  subtitle,
  titleBadge,
  variant = "default",
  className,
  children,
  ...props
}: FieldParchmentCardProps) {
  const accentBorderColor = {
    default: "border-[#c59b27]/30 hover:border-[#c59b27]/50",
    danger: "border-[#991b1b]/40 hover:border-[#dc2626]/60",
    emerald: "border-[#10b981]/40 hover:border-[#34d399]/60",
    amber: "border-[#f59e0b]/40 hover:border-[#fbbf24]/60",
  }[variant];

  const headerPlateBg = {
    default: "from-[#2e2318] to-[#1a140e] border-[#c59b27]/40 text-[#f5dab0]",
    danger: "from-[#3b1212] to-[#1c0808] border-[#991b1b]/50 text-[#fca5a5]",
    emerald: "from-[#102d20] to-[#0a1b13] border-[#10b981]/50 text-[#a7f3d0]",
    amber: "from-[#38260f] to-[#1c1205] border-[#f59e0b]/50 text-[#fde68a]",
  }[variant];

  return (
    <div
      className={cn(
        "field-parchment-card rounded-md p-4 transition-all duration-200 relative overflow-hidden",
        accentBorderColor,
        className
      )}
      {...props}
    >
      {/* Brass Ornamental Corner Brackets */}
      <span className="brass-corner-tl" />
      <span className="brass-corner-tr" />
      <span className="brass-corner-bl" />
      <span className="brass-corner-br" />

      {/* Decorative Corner Brass Rivets */}
      <span className="brass-rivet absolute top-2 left-2 z-10" />
      <span className="brass-rivet absolute top-2 right-2 z-10" />
      <span className="brass-rivet absolute bottom-2 left-2 z-10" />
      <span className="brass-rivet absolute bottom-2 right-2 z-10" />

      {/* Card Header Plate */}
      {title && (
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#c59b27]/20 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            {/* Small Botanical Leaf Icon */}
            <span className="text-[#c59b27] text-xs select-none">❧</span>
            <div className="min-w-0">
              <h2
                className={cn(
                  "font-expedition text-xs sm:text-sm font-bold tracking-widest uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] truncate",
                  headerPlateBg.split(" ").slice(-1)[0]
                )}
              >
                {title}
              </h2>
              {subtitle && (
                <p className="font-field text-[11px] text-[#c59b27]/70 italic tracking-normal -mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {titleBadge && <div className="flex-shrink-0 ml-2">{titleBadge}</div>}
        </div>
      )}

      {/* Content Body */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default FieldParchmentCard;
