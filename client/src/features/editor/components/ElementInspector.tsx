"use client";

import * as React from "react";
import { CanvasElement } from "../types/editor";
import { generateElementJsx } from "../utils/codeGenerator";
import { Button, Badge } from "@/components/ui/8bit";
import { Sliders, Code2, Copy, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ElementInspectorProps {
  element: CanvasElement | null;
  onUpdateProp: (key: string, value: any) => void;
  onDeleteElement?: (id: string) => void;
}

export function ElementInspector({
  element,
  onUpdateProp,
  onDeleteElement,
}: ElementInspectorProps) {
  const [activeTab, setActiveTab] = React.useState<"props" | "code">("props");
  const [copied, setCopied] = React.useState(false);

  if (!element) {
    return (
      <aside className="relative flex flex-col h-full bg-[#170e11] border-y-4 border-[#e05344]/40 shadow-[4px_4px_0_0_#000] font-pixel text-[#fdf2e9] p-4 select-none">
        <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/40 pointer-events-none" aria-hidden="true" />
        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 relative z-10">
          <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-amber-400 text-xl shadow-[2px_2px_0_0_#000]">
            ⚙️
          </div>
          <h3 className="text-xs font-bold uppercase text-[#fdf2e9]">No Element Selected</h3>
          <p className="text-[9px] text-[#c4b5a5] max-w-[200px] leading-relaxed">
            Click any 8bitcn element on the canvas to inspect its props or copy its JSX code.
          </p>
        </div>
      </aside>
    );
  }

  const { imports, jsx } = generateElementJsx(element);
  const elementCode = `${imports.join("\n")}\n\n${jsx}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(elementCode);
    setCopied(true);
    toast.success("✦ Element JSX copied! ✦");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="relative flex flex-col h-full bg-[#170e11] border-y-4 border-[#e05344]/40 shadow-[4px_4px_0_0_#000] font-pixel text-[#fdf2e9] overflow-hidden select-none">
      <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/40 pointer-events-none" aria-hidden="true" />

      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#e05344]/20 relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#fba170]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#fdf2e9]">
              Inspector
            </h2>
          </div>
          <Badge variant="gold" className="text-[8px]">
            {element.type.toUpperCase()}
          </Badge>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-2 border-black bg-[#11090c] p-0.5 shadow-[2px_2px_0_0_#000]">
          <button
            onClick={() => setActiveTab("props")}
            className={cn(
              "flex-1 py-1 text-[9px] font-bold uppercase transition-colors flex items-center justify-center gap-1",
              activeTab === "props" ? "bg-[#e05344] text-white" : "text-[#c4b5a5] hover:text-[#fdf2e9]"
            )}
          >
            <Sliders className="w-3 h-3" />
            <span>PROPS</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex-1 py-1 text-[9px] font-bold uppercase transition-colors flex items-center justify-center gap-1",
              activeTab === "code" ? "bg-[#e05344] text-white" : "text-[#c4b5a5] hover:text-[#fdf2e9]"
            )}
          >
            <Code2 className="w-3 h-3" />
            <span>JSX CODE</span>
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 relative z-10 space-y-3">
        {activeTab === "props" ? (
          <div className="space-y-3">
            {/* Common Text / Label Input */}
            {("text" in element.props || "title" in element.props || "label" in element.props) && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">
                  {"text" in element.props ? "Button / Badge Text" : "title" in element.props ? "Title" : "Label"}
                </label>
                <input
                  type="text"
                  value={element.props.text ?? element.props.title ?? element.props.label ?? ""}
                  onChange={(e) => {
                    const key = "text" in element.props ? "text" : "title" in element.props ? "title" : "label";
                    onUpdateProp(key, e.target.value);
                  }}
                  className="w-full h-8 px-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170]"
                />
              </div>
            )}

            {/* Description / Subtitle Input */}
            {("description" in element.props || "subtitle" in element.props) && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">
                  {"description" in element.props ? "Description" : "Subtitle"}
                </label>
                <textarea
                  rows={2}
                  value={element.props.description ?? element.props.subtitle ?? ""}
                  onChange={(e) => {
                    const key = "description" in element.props ? "description" : "subtitle";
                    onUpdateProp(key, e.target.value);
                  }}
                  className="w-full p-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170] custom-scrollbar"
                />
              </div>
            )}

            {/* Variant Select (if supported) */}
            {"variant" in element.props && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">Theme Variant</label>
                <select
                  value={element.props.variant}
                  onChange={(e) => onUpdateProp("variant", e.target.value)}
                  className="w-full h-8 px-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170] cursor-pointer"
                >
                  <option value="gold">Gold / Amber</option>
                  <option value="default">Default Dark</option>
                  <option value="secondary">Secondary Moss</option>
                  <option value="destructive">Destructive Crimson</option>
                  <option value="success">Success Emerald</option>
                  <option value="dungeon">Dungeon Stone</option>
                  <option value="outline">Retro Outline</option>
                </select>
              </div>
            )}

            {/* Size Select (if button) */}
            {"size" in element.props && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">Button Size</label>
                <select
                  value={element.props.size}
                  onChange={(e) => onUpdateProp("size", e.target.value)}
                  className="w-full h-8 px-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170] cursor-pointer"
                >
                  <option value="sm">Small (Compact)</option>
                  <option value="md">Medium (Standard)</option>
                  <option value="lg">Large (Chunky)</option>
                </select>
              </div>
            )}

            {/* Numeric Values: HP, MP, EXP, Progress, Slider */}
            {("currentHp" in element.props || "value" in element.props || "currentMp" in element.props || "currentXp" in element.props) && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">Current Metric Value</label>
                <input
                  type="number"
                  value={
                    element.props.currentHp ??
                    element.props.currentMp ??
                    element.props.currentXp ??
                    element.props.value ??
                    0
                  }
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if ("currentHp" in element.props) onUpdateProp("currentHp", val);
                    else if ("currentMp" in element.props) onUpdateProp("currentMp", val);
                    else if ("currentXp" in element.props) onUpdateProp("currentXp", val);
                    else if ("value" in element.props) onUpdateProp("value", val);
                  }}
                  className="w-full h-8 px-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170]"
                />
              </div>
            )}

            {/* Dialogue text */}
            {"dialogueText" in element.props && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">Typewriter Line</label>
                <textarea
                  rows={3}
                  value={element.props.dialogueText}
                  onChange={(e) => onUpdateProp("dialogueText", e.target.value)}
                  className="w-full p-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170] custom-scrollbar"
                />
              </div>
            )}

            {/* Dialogue speaker */}
            {"speakerName" in element.props && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">Speaker Name</label>
                <input
                  type="text"
                  value={element.props.speakerName}
                  onChange={(e) => onUpdateProp("speakerName", e.target.value)}
                  className="w-full h-8 px-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170]"
                />
              </div>
            )}

            {/* Boss Name */}
            {"bossName" in element.props && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">Boss Name</label>
                <input
                  type="text"
                  value={element.props.bossName}
                  onChange={(e) => onUpdateProp("bossName", e.target.value)}
                  className="w-full h-8 px-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170]"
                />
              </div>
            )}

            {/* Item Rarity */}
            {"rarity" in element.props && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">Item Rarity</label>
                <select
                  value={element.props.rarity}
                  onChange={(e) => onUpdateProp("rarity", e.target.value)}
                  className="w-full h-8 px-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170] cursor-pointer"
                >
                  <option value="common">Common (Bronze)</option>
                  <option value="rare">Rare (Azure)</option>
                  <option value="epic">Epic (Purple)</option>
                  <option value="legendary">Legendary (Gold)</option>
                  <option value="mythic">Mythic (Crimson)</option>
                </select>
              </div>
            )}

            {/* Quest Rank */}
            {"rank" in element.props && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">Quest Rank</label>
                <select
                  value={element.props.rank}
                  onChange={(e) => onUpdateProp("rank", e.target.value)}
                  className="w-full h-8 px-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170] cursor-pointer"
                >
                  <option value="F-RANK">F-RANK</option>
                  <option value="E-RANK">E-RANK</option>
                  <option value="D-RANK">D-RANK</option>
                  <option value="C-RANK">C-RANK</option>
                  <option value="B-RANK">B-RANK</option>
                  <option value="A-RANK">A-RANK</option>
                  <option value="S-RANK">S-RANK</option>
                </select>
              </div>
            )}

            {/* Telemetry Value / Change */}
            {"change" in element.props && (
              <div className="space-y-1">
                <label className="text-[9px] text-[#c4b5a5] uppercase font-bold">Trend Note</label>
                <input
                  type="text"
                  value={element.props.change}
                  onChange={(e) => onUpdateProp("change", e.target.value)}
                  className="w-full h-8 px-2 bg-[#11090c] border-2 border-black text-[10px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170]"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[#c4b5a5] font-bold uppercase">React / JSX Code</span>
              <Button
                variant="gold"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[8px] h-6 px-2"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                <span>COPY</span>
              </Button>
            </div>

            <pre className="p-3 bg-[#0d0709] border-2 border-black text-[9px] font-mono text-[#fba170] overflow-x-auto custom-scrollbar leading-relaxed whitespace-pre shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]">
              {elementCode}
            </pre>

            <div className="p-2 bg-[#1c1114] border border-[#e05344]/30 flex items-start gap-1.5 text-[8px] text-[#c4b5a5]">
              <Info className="w-3 h-3 text-[#fba170] shrink-0 mt-0.5" />
              <span>
                All components use authentic 8bitcn stepped pixel borders from{" "}
                <code className="text-[#fba170]">@/components/ui/8bit</code>.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Delete */}
      {onDeleteElement && (
        <div className="p-3 border-t border-[#e05344]/20 relative z-10">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteElement(element.id)}
            className="w-full text-[9px]"
          >
            REMOVE FROM CANVAS
          </Button>
        </div>
      )}
    </aside>
  );
}
