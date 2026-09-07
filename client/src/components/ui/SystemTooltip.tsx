"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  PixelInfoIcon,
  PixelBookIcon,
  PixelLightningIcon,
  PixelDumbbellIcon,
  PixelStarIcon,
  PixelChevronLeftIcon,
  PixelChevronRightIcon,
} from "./pixel/PixelIcons";
import { PixelOpenBookSvg, PixelPageLeafSvg } from "./pixel/PixelOpenBook";
import { playUIMenuSFX } from "@/utils/audio";

export interface SystemTooltipStat {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SystemTooltipProps {
  title: string;
  subtitle?: string;
  category?: string;
  lore?: string;
  description?: string;
  mechanics?: string;
  howToImprove?: string[] | string;
  stats?: SystemTooltipStat[];
  tags?: string[];
  rarity?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  accentColor?: string;
  side?: "top" | "bottom" | "left" | "right";
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  widthClass?: string;
  delayMs?: number;
}

const RARITY_INK_STYLES: Record<string, { badge: string; text: string }> = {
  COMMON: {
    badge: "border-[#64748b] bg-[#e2e8f0] text-[#334155]",
    text: "text-[#475569]",
  },
  UNCOMMON: {
    badge: "border-[#059669] bg-[#d1fae5] text-[#065f46]",
    text: "text-[#047857]",
  },
  RARE: {
    badge: "border-[#0284c7] bg-[#e0f2fe] text-[#0369a1]",
    text: "text-[#0284c7]",
  },
  EPIC: {
    badge: "border-[#9333ea] bg-[#f3e8ff] text-[#6b21a8]",
    text: "text-[#7e22ce]",
  },
  LEGENDARY: {
    badge: "border-[#d97706] bg-[#fef3c7] text-[#92400e]",
    text: "text-[#b45309]",
  },
  MYTHIC: {
    badge: "border-[#dc2626] bg-[#fee2e2] text-[#991b1b]",
    text: "text-[#b91c1c]",
  },
};

interface TabSection {
  id: "overview" | "lore" | "mechanics" | "improve" | "stats";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function SystemTooltip({
  title,
  subtitle,
  category,
  lore,
  description,
  mechanics,
  howToImprove,
  stats = [],
  tags = [],
  rarity = "RARE",
  accentColor,
  side = "top",
  icon,
  children,
  className = "",
  widthClass = "w-[360px] sm:w-[560px] md:w-[600px] max-w-[95vw]",
  delayMs = 800,
}: SystemTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState<"forward" | "backward">("forward");
  const [flipKey, setFlipKey] = useState(0);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});

  const openTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Build list of active tabs dynamically
  const availableTabs: TabSection[] = [];
  if (description) {
    availableTabs.push({ id: "overview", label: "Overview", icon: PixelInfoIcon });
  }
  if (howToImprove && (Array.isArray(howToImprove) ? howToImprove.length > 0 : Boolean(howToImprove))) {
    availableTabs.push({ id: "improve", label: "Improvement", icon: PixelDumbbellIcon });
  }
  if (lore) {
    availableTabs.push({ id: "lore", label: "Lore", icon: PixelBookIcon });
  }
  if (mechanics) {
    availableTabs.push({ id: "mechanics", label: "Mechanics", icon: PixelLightningIcon });
  }
  if (stats && stats.length > 0) {
    availableTabs.push({ id: "stats", label: "Attributes", icon: PixelStarIcon });
  }

  // Ensure index is within bounds
  const currentTab = availableTabs[activeTabIndex] || availableTabs[0];

  const triggerPageFlip = (nextIndex: number, direction: "forward" | "backward") => {
    try {
      playUIMenuSFX();
    } catch {}
    setFlipDirection(direction);
    setFlipKey((prev) => prev + 1);
    setActiveTabIndex(nextIndex);
  };

  const handleNextTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (availableTabs.length > 1) {
      const next = (activeTabIndex + 1) % availableTabs.length;
      triggerPageFlip(next, "forward");
    }
  };

  const handlePrevTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (availableTabs.length > 1) {
      const prev = (activeTabIndex - 1 + availableTabs.length) % availableTabs.length;
      triggerPageFlip(prev, "backward");
    }
  };

  const handleSelectTab = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (idx === activeTabIndex) return;
    triggerPageFlip(idx, idx > activeTabIndex ? "forward" : "backward");
  };

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl?.offsetWidth || 580;
    const tooltipHeight = tooltipEl?.offsetHeight || 380;
    const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const padding = 16;

    // Horizontal centering over the trigger
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    let left = triggerCenterX - tooltipWidth / 2;

    // Clamp horizontal position strictly within viewport
    if (left < padding) {
      left = padding;
    } else if (left + tooltipWidth > windowWidth - padding) {
      left = windowWidth - tooltipWidth - padding;
    }

    // Vertical positioning with smart auto-flip
    const spaceAbove = triggerRect.top;
    const spaceBelow = windowHeight - triggerRect.bottom;
    let top = 0;

    if (side === "bottom") {
      if (spaceBelow >= tooltipHeight + 12 || spaceBelow >= spaceAbove) {
        top = triggerRect.bottom + 8;
      } else {
        top = triggerRect.top - tooltipHeight - 8;
      }
    } else {
      // Default: side === "top"
      if (spaceAbove >= tooltipHeight + 12 || spaceAbove >= spaceBelow) {
        top = triggerRect.top - tooltipHeight - 8;
      } else {
        top = triggerRect.bottom + 8;
      }
    }

    // Clamp vertical position so it never overflows viewport
    if (top < padding) {
      top = padding;
    } else if (top + tooltipHeight > windowHeight - padding) {
      top = windowHeight - tooltipHeight - padding;
    }

    setPositionStyle({
      position: "fixed",
      left: `${Math.round(left)}px`,
      top: `${Math.round(top)}px`,
      zIndex: 999999,
      maxHeight: `min(600px, ${windowHeight - padding * 2}px)`,
    });
  }, [side]);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (!isOpen && !openTimerRef.current) {
      openTimerRef.current = setTimeout(() => {
        setIsOpen(true);
        openTimerRef.current = null;
      }, delayMs);
    }
  };

  const handleMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (isOpen) {
      closeTimerRef.current = setTimeout(() => {
        setIsOpen(false);
        closeTimerRef.current = null;
      }, 150);
    }
  };

  const handleTooltipMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 150);
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      const handleScrollOrResize = () => {
        calculatePosition();
      };
      window.addEventListener("scroll", handleScrollOrResize, { passive: true, capture: true });
      window.addEventListener("resize", handleScrollOrResize, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [isOpen, calculatePosition]);

  const rarityStyle = RARITY_INK_STYLES[rarity] || RARITY_INK_STYLES.COMMON;

  return (
    <div
      ref={triggerRef}
      className={cn("relative inline-flex items-center focus-within:outline-none", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {/* 8-BIT AUTHENTIC OPEN PARCHMENT BOOK HOVER DESCRIPTION (CLEAN WITHOUT BLACK OUTER BORDER) */}
      {mounted && isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={tooltipRef}
          tabIndex={-1}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          className={`pointer-events-auto ${widthClass} select-none text-left relative animate-in fade-in-0 duration-150`}
          style={{
            ...positionStyle,
          }}
        >
          {/* Programmatically Recreated 8-Bit Pixel Art Book Vector Background */}
          <div className="relative w-full aspect-[408/276] min-h-[300px] sm:min-h-[340px] drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
            <PixelOpenBookSvg className="absolute inset-0 w-full h-full pointer-events-none z-0" />

            {/* TWO-PAGE SPREAD CONTENT LAYER OVER PARCHMENT */}
            <div className="relative z-10 w-full h-full p-4 sm:p-6 md:p-7 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 box-border">
              {/* =========================================================
                  LEFT PAGE: BOOK TITLE, METADATA & CHAPTER INDEX
                  ========================================================= */}
              <div className="sm:col-span-6 flex flex-col justify-between pl-1 sm:pl-2 pr-1 sm:pr-3 py-1">
                {/* Header: Badges & Title */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {category && (
                      <span className="font-pixel text-[10px] sm:text-[11px] uppercase font-bold text-[#3B1E12] bg-[#E5D2A8] border border-[#8C6B3C] px-1.5 py-0.5 shadow-[1px_1px_0_0_#8C6B3C]">
                        {category}
                      </span>
                    )}
                    {rarity && (
                      <span className={`font-pixel text-[10px] sm:text-[11px] uppercase font-bold border ${rarityStyle.badge} px-1.5 py-0.5 shadow-[1px_1px_0_0_rgba(0,0,0,0.15)]`}>
                        {rarity}
                      </span>
                    )}
                  </div>

                  <h4 className="font-pixel font-bold text-xs sm:text-sm text-[#2A160E] tracking-wide leading-tight break-words pt-1">
                    {title}
                  </h4>

                  {subtitle && (
                    <p className="font-pixel text-[10px] sm:text-xs text-[#5C3826] leading-snug break-words">
                      {subtitle}
                    </p>
                  )}
                </div>

                {/* Chapter Table of Contents on Parchment with Polished Vertical Alignment */}
                {availableTabs.length > 1 && (
                  <div className="mt-2 pt-2 border-t border-[#B89F70] space-y-1">
                    <span className="font-pixel text-[9px] uppercase text-[#7C5A32] block font-bold tracking-wider mb-1">
                      TABLE OF CONTENTS
                    </span>
                    <div className="flex flex-col gap-1">
                      {availableTabs.map((tab, idx) => {
                        const IconComponent = tab.icon;
                        const isActive = idx === activeTabIndex;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={(e) => handleSelectTab(idx, e)}
                            className={`flex items-center justify-between px-2 py-1 font-pixel text-[10px] sm:text-xs uppercase font-bold transition-all cursor-pointer border ${
                              isActive
                                ? "bg-[#DFCB9C] text-[#2A160E] border-[#8C6B3C] shadow-[1px_1px_0_0_#8C6B3C]"
                                : "text-[#664627] hover:text-[#2A160E] hover:bg-[#E9DAC0] border-transparent"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#2A160E]" : "text-[#7C5A32]"}`} />
                              <span className="leading-none pt-0.5">{tab.label}</span>
                            </span>
                            <span className="text-[9px] text-[#8C6B3C] font-mono leading-none pt-0.5">p.{idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tags Footer on Left Page */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-[#B89F70]">
                    {tags.map((t, i) => (
                      <span
                        key={i}
                        className="font-pixel text-[9px] text-[#4A2D1B] bg-[#E2CF9F] px-1.5 py-0.5 border border-[#B89F70]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* =========================================================
                  RIGHT PAGE: THE TURNING READING PAGE LEAF (3D FLIP)
                  ========================================================= */}
              <div className="sm:col-span-6 flex flex-col justify-between pl-1 sm:pl-3 pr-1 sm:pr-2 py-1 relative overflow-hidden">
                {/* 3D Flipping Page Leaf Container */}
                <div
                  key={flipKey}
                  className={`flex-1 flex flex-col justify-between relative ${
                    flipDirection === "forward"
                      ? "animate-page-flip-forward"
                      : "animate-page-flip-backward"
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: 900,
                  }}
                >
                  {/* Subtle Page Leaf Vector Underlay */}
                  <PixelPageLeafSvg className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-70" />

                  {/* Page Header: Current Chapter & Page Counter */}
                  <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#B89F70]">
                    <div className="flex items-center gap-1.5 font-pixel text-[11px] sm:text-xs font-bold text-[#2A160E] uppercase tracking-wider">
                      {currentTab?.icon && React.createElement(currentTab.icon, { className: "w-3.5 h-3.5 text-[#3B1E12] flex-shrink-0" })}
                      <span className="leading-none pt-0.5">{currentTab?.label}</span>
                    </div>
                    <span className="font-pixel text-[10px] text-[#7C5A32] font-mono leading-none pt-0.5">
                      p. {activeTabIndex + 1} of {availableTabs.length}
                    </span>
                  </div>

                  {/* Page Body Text on Antique Parchment */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[140px] sm:max-h-[170px] space-y-1.5">
                    {currentTab?.id === "overview" && description && (
                      <p className="font-pixel text-xs text-[#2A160E] leading-relaxed whitespace-pre-line break-words font-medium">
                        {description}
                      </p>
                    )}

                    {currentTab?.id === "improve" && howToImprove && (
                      <div className="space-y-1">
                        {Array.isArray(howToImprove) ? (
                          <ul className="space-y-1">
                            {howToImprove.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 font-pixel text-xs text-[#2A160E] leading-relaxed">
                                <span className="w-1.5 h-1.5 bg-[#3B1E12] mt-1.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="font-pixel text-xs text-[#2A160E] leading-relaxed font-medium">
                            {howToImprove}
                          </p>
                        )}
                      </div>
                    )}

                    {currentTab?.id === "lore" && lore && (
                      <p className="font-pixel text-xs text-[#381E13] italic leading-relaxed whitespace-normal break-words font-medium">
                        &ldquo;{lore}&rdquo;
                      </p>
                    )}

                    {currentTab?.id === "mechanics" && mechanics && (
                      <p className="font-pixel text-xs text-[#2A160E] leading-relaxed whitespace-normal break-words font-medium">
                        {mechanics}
                      </p>
                    )}

                    {currentTab?.id === "stats" && stats && stats.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {stats.map((s, idx) => {
                          const IconComponent = s.icon || PixelStarIcon;
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 p-1 bg-[#E4D1A4] border border-[#B89F70] font-pixel text-[11px] sm:text-xs text-[#2A160E]"
                            >
                              <span className="text-[#4A2D1B] flex items-center gap-1.5 flex-shrink-0">
                                <IconComponent className="w-3.5 h-3.5 text-[#3B1E12] flex-shrink-0" />
                                <span>{s.label}</span>
                              </span>
                              <span className="font-bold text-right text-[#2A160E]">
                                {s.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Page Turning Interactive Navigation with Polished Positions */}
                  {availableTabs.length > 1 && (
                    <div className="pt-1.5 mt-1.5 border-t border-[#B89F70] flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevTab}
                          className="w-6 h-6 bg-[#421B1A] border border-[#2C1111] text-[#FDE68A] hover:bg-[#5C2C2B] transition-colors cursor-pointer shadow-[1px_1px_0_0_#000] flex items-center justify-center"
                          title="Previous Page"
                        >
                          <PixelChevronLeftIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextTab}
                          className="w-6 h-6 bg-[#421B1A] border border-[#2C1111] text-[#FDE68A] hover:bg-[#5C2C2B] transition-colors cursor-pointer shadow-[1px_1px_0_0_#000] flex items-center justify-center"
                          title="Next Page"
                        >
                          <PixelChevronRightIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleNextTab}
                        className="flex items-center gap-1.5 font-pixel text-[10px] sm:text-xs text-[#FDE68A] bg-[#421B1A] border border-[#2C1111] px-2.5 py-1 shadow-[1px_1px_0_0_#000] hover:bg-[#5C2C2B] transition-colors cursor-pointer group active:translate-y-0.5"
                      >
                        <span className="leading-none pt-0.5">Turn Page: {availableTabs[(activeTabIndex + 1) % availableTabs.length]?.label}</span>
                        <PixelChevronRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default SystemTooltip;
