"use client";

import * as React from "react";
import { ViewportMode, CanvasGridMode, EditorPreset } from "../types/editor";
import { EDITOR_PRESETS } from "../data/editorPresets";
import { Button, Badge } from "@/components/ui/8bit";
import { toast } from "sonner";
import {
  Laptop,
  Tablet,
  Smartphone,
  Grid,
  Tv,
  Trash2,
  Copy,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  viewport: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  gridMode: CanvasGridMode;
  onGridModeChange: (mode: CanvasGridMode) => void;
  scanlines: boolean;
  onScanlinesToggle: () => void;
  onLoadPreset: (preset: EditorPreset) => void;
  onClearCanvas: () => void;
  onCopyFullJsx: () => void;
  elementCount: number;
}

export function EditorHeader({
  viewport,
  onViewportChange,
  gridMode,
  onGridModeChange,
  scanlines,
  onScanlinesToggle,
  onLoadPreset,
  onClearCanvas,
  onCopyFullJsx,
  elementCount,
}: EditorHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopyFullJsx();
    setCopied(true);
    toast.success("✦ Full Canvas JSX copied to clipboard! ✦", {
      description: "Paste directly into your React / Tailwind pages.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="relative p-3 sm:p-4 backdrop-blur-md bg-[linear-gradient(180deg,rgba(32,18,22,0.95)_0%,rgba(20,11,14,0.98)_100%)] border-y-4 border-[#e05344]/60 shadow-[4px_4px_0_0_#000] font-pixel text-[#fdf2e9] select-none z-20">
      {/* 8bitcn stepped pixel side notch borders */}
      <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/60 pointer-events-none" aria-hidden="true" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 relative z-10">
        {/* Title & Brand Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black border-2 border-black flex items-center justify-center text-amber-400 shadow-[2px_2px_0_0_#000] shrink-0 text-sm">
            🕹️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#fdf2e9]">
                8BitCN Element Studio
              </h1>
              <Badge variant="gold" className="text-[8px]">
                STUDIO v2.6
              </Badge>
            </div>
            <p className="text-[9px] text-[#c4b5a5] mt-0.5">
              Live Component Playground, Drag & Drop Sandbox & Code Generator
            </p>
          </div>
        </div>

        {/* Center Controls: Viewport, Grid, Scanlines */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 bg-[#160c0f] border-2 border-black px-2 py-1 shadow-[2px_2px_0_0_#000]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[9px] text-[#c4b5a5] font-bold uppercase">PRESETS:</span>
            <select
              defaultValue=""
              onChange={(e) => {
                const preset = EDITOR_PRESETS.find((p) => p.id === e.target.value);
                if (preset) onLoadPreset(preset);
                e.target.value = "";
              }}
              aria-label="Select 8bitcn preset composition"
              className="bg-transparent text-[9px] text-[#fba170] font-bold focus:outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#1c1114] text-[#8c7b7d]">
                Load Preset...
              </option>
              {EDITOR_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1c1114] text-[#fdf2e9]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Viewport Width Buttons */}
          <div className="flex items-center bg-[#160c0f] border-2 border-black p-0.5 shadow-[2px_2px_0_0_#000]">
            <button
              onClick={() => onViewportChange("desktop")}
              title="Desktop View (100%)"
              className={cn(
                "p-1.5 transition-colors",
                viewport === "desktop" ? "bg-amber-500/30 text-amber-400" : "text-[#8c7b7d] hover:text-[#fdf2e9]"
              )}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewportChange("tablet")}
              title="Tablet View (768px)"
              className={cn(
                "p-1.5 transition-colors",
                viewport === "tablet" ? "bg-amber-500/30 text-amber-400" : "text-[#8c7b7d] hover:text-[#fdf2e9]"
              )}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewportChange("mobile")}
              title="Mobile View (390px)"
              className={cn(
                "p-1.5 transition-colors",
                viewport === "mobile" ? "bg-amber-500/30 text-amber-400" : "text-[#8c7b7d] hover:text-[#fdf2e9]"
              )}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid Mode Toggle */}
          <button
            onClick={() => {
              const modes: CanvasGridMode[] = ["pixel-grid", "dots", "parchment", "clean"];
              const nextIdx = (modes.indexOf(gridMode) + 1) % modes.length;
              onGridModeChange(modes[nextIdx]);
            }}
            title="Toggle Canvas Grid Texture"
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 border-2 border-black text-[9px] shadow-[2px_2px_0_0_#000] transition-colors",
              gridMode !== "clean" ? "bg-[#1f1317] text-[#fba170]" : "bg-[#160c0f] text-[#8c7b7d]"
            )}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline uppercase">{gridMode}</span>
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={onScanlinesToggle}
            title="Toggle Retro CRT Scanlines"
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 border-2 border-black text-[9px] shadow-[2px_2px_0_0_#000] transition-colors",
              scanlines ? "bg-emerald-950 text-emerald-400 border-emerald-600" : "bg-[#160c0f] text-[#8c7b7d]"
            )}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CRT: {scanlines ? "ON" : "OFF"}</span>
          </button>
        </div>

        {/* Right Actions: Copy Canvas JSX & Clear */}
        <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearCanvas}
            disabled={elementCount === 0}
            className="flex items-center gap-1 text-[9px]"
          >
            <Trash2 className="w-3 h-3" />
            <span>CLEAR</span>
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[9px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>COPY CANVAS JSX</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
