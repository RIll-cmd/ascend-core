"use client";

import * as React from "react";
import { CanvasElement, ViewportMode, CanvasGridMode } from "../types/editor";
import { CanvasItemRenderer } from "./CanvasItemRenderer";
import { ChevronUp, ChevronDown, Copy, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/8bit";
import { cn } from "@/lib/utils";

interface CanvasSandboxProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (id: string) => void;
  onUpdateProp: (id: string, key: string, value: any) => void;
  viewport: ViewportMode;
  gridMode: CanvasGridMode;
  scanlines: boolean;
  onLoadFirstPreset: () => void;
}

export function CanvasSandbox({
  elements,
  selectedId,
  onSelectElement,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onUpdateProp,
  viewport,
  gridMode,
  scanlines,
  onLoadFirstPreset,
}: CanvasSandboxProps) {
  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[390px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "max-w-4xl";
    }
  };

  const getGridBackground = () => {
    switch (gridMode) {
      case "pixel-grid":
        return "bg-[radial-gradient(#e05344_1px,transparent_1px)] [background-size:16px_16px] bg-[#140b0e]";
      case "dots":
        return "bg-[radial-gradient(#8c7a53_1.5px,transparent_1.5px)] [background-size:20px_20px] bg-[#11080a]";
      case "parchment":
        return "bg-[linear-gradient(180deg,#241419_0%,#150a0d_100%)]";
      case "clean":
      default:
        return "bg-[#140b0e]";
    }
  };

  return (
    <div className="relative flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-[#0f0709] transition-all">
      {/* CRT Scanline Overlay Texture */}
      {scanlines && (
        <div
          className="pointer-events-none fixed inset-0 z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-70"
          aria-hidden="true"
        />
      )}

      {/* Canvas Sandbox Frame */}
      <div
        className={cn(
          "w-full transition-all duration-300 relative p-5 sm:p-6 min-h-[600px] border-y-4 border-[#e05344]/50 shadow-[6px_6px_0_0_#000]",
          getViewportWidth(),
          getGridBackground()
        )}
      >
        {/* 8bitcn stepped pixel side notch borders */}
        <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/50 pointer-events-none" aria-hidden="true" />

        {/* Shoji / Pixel Corner Brackets */}
        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#fba170] pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#fba170] pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#fba170] pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#fba170] pointer-events-none" />

        {/* Empty Canvas State */}
        {elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 font-pixel select-none">
            <div className="w-16 h-16 bg-[#1c1114] border-2 border-black flex items-center justify-center text-amber-400 text-2xl shadow-[3px_3px_0_0_#000]">
              👾
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#fdf2e9]">
                Interactive Sandbox is Empty
              </h3>
              <p className="text-[10px] text-[#c4b5a5] mt-1 max-w-md mx-auto leading-relaxed">
                Click any 8bitcn element in the left Component Deck to add it, or load a pre-configured composition preset.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button variant="gold" size="sm" onClick={onLoadFirstPreset}>
                ⚡ LOAD COMBAT HUD PRESET
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {elements.map((el, index) => {
              const isSelected = el.id === selectedId;

              return (
                <div
                  key={el.id}
                  onClick={() => onSelectElement(el.id)}
                  className={cn(
                    "group relative p-3 transition-all duration-150 cursor-pointer",
                    isSelected
                      ? "bg-[#251419]/90 border-2 border-[#fba170] shadow-[0_0_15px_rgba(251,161,112,0.3)] ring-1 ring-[#fba170]"
                      : "bg-transparent hover:bg-[#1a0e12]/60 border-2 border-transparent hover:border-[#8c7a53]/50"
                  )}
                >
                  {/* Selected Indicator Anchor Notches */}
                  {isSelected && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-2 h-2 bg-[#fba170] border border-black" />
                      <div className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-[#fba170] border border-black" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-2 h-2 bg-[#fba170] border border-black" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-2 h-2 bg-[#fba170] border border-black" />
                    </>
                  )}

                  {/* Top Floating Control Bar */}
                  <div
                    className={cn(
                      "flex items-center justify-between pb-2 mb-2 border-b border-[#e05344]/30 font-pixel text-[9px]",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#fba170] font-bold uppercase">
                        #{index + 1} {el.name}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[8px] text-emerald-400 font-bold">
                          <CheckCircle2 className="w-2.5 h-2.5" /> ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveUp(index);
                        }}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 bg-black border border-black hover:bg-[#e05344] disabled:opacity-30 text-[#fdf2e9] shadow-[1px_1px_0_0_#000]"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveDown(index);
                        }}
                        disabled={index === elements.length - 1}
                        title="Move Down"
                        className="p-1 bg-black border border-black hover:bg-[#e05344] disabled:opacity-30 text-[#fdf2e9] shadow-[1px_1px_0_0_#000]"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(index);
                        }}
                        title="Duplicate Element"
                        className="p-1 bg-black border border-black hover:bg-[#fba170] hover:text-black text-[#fdf2e9] shadow-[1px_1px_0_0_#000]"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(el.id);
                        }}
                        title="Remove Element"
                        className="p-1 bg-black border border-black hover:bg-red-600 text-[#fdf2e9] shadow-[1px_1px_0_0_#000]"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Render the actual 8bitcn element */}
                  <div className="relative pointer-events-auto">
                    <CanvasItemRenderer
                      element={el}
                      onUpdateProp={(key, val) => onUpdateProp(el.id, key, val)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
