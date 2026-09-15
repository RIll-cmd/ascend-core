"use client";

import * as React from "react";
import { useStudioDrawer } from "../context/StudioDrawerContext";
import { cn } from "@/lib/utils";
import { Crosshair } from "lucide-react";

export function StudioSidebarTrigger() {
  const { isOpen, toggleOpen, stagedChanges, isInspectMode, toggleInspectMode } = useStudioDrawer();

  if (isOpen) return null;

  return (
    <div
      data-studio-trigger
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end select-none font-pixel group"
    >
      {/* Quick Inspect Floating Button */}
      <button
        onClick={toggleInspectMode}
        title={isInspectMode ? "Exit Inspector Mode" : "Inspect Page Element (Click any button/card)"}
        className={cn(
          "mb-1.5 mr-1 p-2 border-2 border-black shadow-[2px_2px_0_0_#000] text-xs transition-all flex items-center gap-1.5",
          isInspectMode
            ? "bg-red-600 text-white animate-pulse"
            : "bg-[#1c1114] text-[#fba170] hover:bg-[#2c1a20]"
        )}
      >
        <Crosshair className={cn("w-3.5 h-3.5", isInspectMode && "animate-spin")} />
        <span className="text-[8px] font-bold hidden group-hover:inline uppercase">
          {isInspectMode ? "PICKING..." : "INSPECT"}
        </span>
      </button>

      {/* Main Studio Drawer Edge Trigger */}
      <button
        onClick={toggleOpen}
        aria-label="Open 8bitcn Studio Sidebar"
        className="relative py-3 px-2 bg-[linear-gradient(180deg,#2d151c_0%,#1a0c10_100%)] border-y-2 border-l-2 border-r-0 border-[#e05344] shadow-[-3px_3px_0_0_#000] text-[#fdf2e9] hover:bg-[#3d1c26] active:translate-x-1 transition-all flex flex-col items-center gap-1.5"
      >
        {/* Stepped pixel corner notch */}
        <div className="absolute top-0 -left-1 w-1 h-2 bg-[#e05344] pointer-events-none" />
        <div className="absolute bottom-0 -left-1 w-1 h-2 bg-[#e05344] pointer-events-none" />

        <span className="text-sm">🕹️</span>
        <span className="text-[8px] font-bold tracking-widest [writing-mode:vertical-lr] text-[#fba170] uppercase">
          8BIT STUDIO
        </span>

        {/* Staged edits badge counter */}
        {stagedChanges.length > 0 && (
          <span className="w-4 h-4 bg-emerald-500 text-black font-bold text-[8px] flex items-center justify-center border border-black shadow-[1px_1px_0_0_#000] animate-pulse mt-1">
            {stagedChanges.length}
          </span>
        )}
      </button>
    </div>
  );
}
