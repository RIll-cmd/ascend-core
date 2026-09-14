"use client";

import * as React from "react";
import { useStudioDrawer } from "../context/StudioDrawerContext";
import { CanvasItemRenderer } from "./CanvasItemRenderer";
import { CanvasElement } from "../types/editor";
import { generateElementJsx } from "../utils/codeGenerator";
import { Button, Badge } from "@/components/ui/8bit";
import {
  X,
  Crosshair,
  Sparkles,
  Layers,
  Copy,
  Check,
  Trash2,
  SendHorizontal,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function StudioSidebarDrawer() {
  const {
    isOpen,
    setIsOpen,
    isInspectMode,
    setIsInspectMode,
    stagedChanges,
    stageChange,
    removeStagedChange,
    clearStagedChanges,
    inspectedElement,
    currentPage,
  } = useStudioDrawer();

  const [activeTab, setActiveTab] = React.useState<"sandbox" | "inspect" | "staged">("sandbox");
  const [selectedType, setSelectedType] = React.useState<string>("button");
  const [targetLabel, setTargetLabel] = React.useState<string>("Page Button");
  const [elementProps, setElementProps] = React.useState<Record<string, any>>({
    text: "Forge New Ritual",
    variant: "gold",
    size: "md",
  });
  const [copiedPrompt, setCopiedPrompt] = React.useState(false);

  // When an element is inspected from the live page, prefill editor state
  React.useEffect(() => {
    if (inspectedElement) {
      setSelectedType(inspectedElement.suggestedType);
      setTargetLabel(inspectedElement.text || `${inspectedElement.tagName} element`);
      setElementProps((prev) => ({
        ...prev,
        ...inspectedElement.suggestedProps,
      }));
      setActiveTab("sandbox");
      toast.success(`✦ Captured "${inspectedElement.text || inspectedElement.tagName}"! ✦`, {
        description: "Configure its 8bitcn replacement style below.",
      });
    }
  }, [inspectedElement]);

  if (!isOpen) return null;

  const currentCanvasElement: CanvasElement = {
    id: "preview-element",
    type: selectedType as any,
    name: selectedType.toUpperCase(),
    category: "primitives",
    props: elementProps,
  };

  const { jsx } = generateElementJsx(currentCanvasElement);

  const handleStageCurrent = () => {
    stageChange({
      pagePath: currentPage,
      targetDescription: targetLabel,
      componentType: selectedType,
      props: { ...elementProps },
      generatedJsx: jsx,
    });
    toast.success("✦ Change added to Staged Edits! ✦");
  };

  const handleCopyAgentPrompt = () => {
    if (stagedChanges.length === 0) {
      toast.error("No staged changes yet. Customize an element and click Stage Change first!");
      return;
    }

    const promptLines = [
      `Hey, please apply these 8bitcn UI upgrades to the codebase for me:`,
      ``,
    ];

    stagedChanges.forEach((change, idx) => {
      promptLines.push(`${idx + 1}. [Page: ${change.pagePath}] Target: "${change.targetDescription}"`);
      promptLines.push(`   Replace with 8bitcn ${change.componentType.toUpperCase()}:`);
      promptLines.push(`   \`\`\`tsx`);
      promptLines.push(`   ${change.generatedJsx}`);
      promptLines.push(`   \`\`\``);
      promptLines.push(``);
    });

    navigator.clipboard.writeText(promptLines.join("\n"));
    setCopiedPrompt(true);
    toast.success("✦ Copied Change Request for AI Agent! ✦", {
      description: "Paste this directly into the chat to have the changes permanently applied.",
    });
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <div
      data-studio-drawer
      className="fixed inset-y-0 right-0 z-50 w-96 max-w-[92vw] bg-[#140b0e] border-l-4 border-[#e05344] shadow-[-8px_0_0_0_#000] flex flex-col font-pixel text-[#fdf2e9] select-none animate-in slide-in-from-right duration-200"
    >
      {/* 8bit stepped side notches */}
      <div className="absolute top-0 -left-1 w-1 h-3 bg-[#e05344] pointer-events-none" />
      <div className="absolute bottom-0 -left-1 w-1 h-3 bg-[#e05344] pointer-events-none" />

      {/* Header Bar */}
      <div className="p-3 border-b-2 border-black bg-[#1f1015] flex items-center justify-between shadow-[0_2px_0_0_#000]">
        <div className="flex items-center gap-2">
          <span className="text-sm">🕹️</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#fdf2e9]">
                8BitCN Studio
              </h2>
              <Badge variant="gold" className="text-[7px]">
                LIVE
              </Badge>
            </div>
            <div className="text-[8px] text-[#fba170] font-bold mt-0.5 flex items-center gap-1">
              <span>PAGE:</span>
              <span className="text-white underline">{currentPage}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/editor"
            title="Open Fullscreen Studio Canvas"
            className="p-1.5 bg-black border border-black text-[#c4b5a5] hover:text-[#fdf2e9] shadow-[1px_1px_0_0_#000]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close Drawer"
            className="p-1.5 bg-black border border-black text-[#c4b5a5] hover:text-red-400 shadow-[1px_1px_0_0_#000]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-black bg-[#11080a] p-1 gap-1">
        <button
          onClick={() => setActiveTab("sandbox")}
          className={cn(
            "flex-1 py-1 text-[8px] font-bold uppercase transition-colors flex items-center justify-center gap-1 border border-black",
            activeTab === "sandbox" ? "bg-[#e05344] text-white shadow-[1px_1px_0_0_#000]" : "text-[#c4b5a5] hover:bg-[#1a0c10]"
          )}
        >
          <Sparkles className="w-3 h-3" />
          <span>EDIT & TRY</span>
        </button>

        <button
          onClick={() => setActiveTab("inspect")}
          className={cn(
            "flex-1 py-1 text-[8px] font-bold uppercase transition-colors flex items-center justify-center gap-1 border border-black",
            activeTab === "inspect" ? "bg-[#e05344] text-white shadow-[1px_1px_0_0_#000]" : "text-[#c4b5a5] hover:bg-[#1a0c10]"
          )}
        >
          <Crosshair className="w-3 h-3" />
          <span>INSPECT</span>
        </button>

        <button
          onClick={() => setActiveTab("staged")}
          className={cn(
            "flex-1 py-1 text-[8px] font-bold uppercase transition-colors flex items-center justify-center gap-1 border border-black relative",
            activeTab === "staged" ? "bg-[#e05344] text-white shadow-[1px_1px_0_0_#000]" : "text-[#c4b5a5] hover:bg-[#1a0c10]"
          )}
        >
          <Layers className="w-3 h-3" />
          <span>STAGED ({stagedChanges.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {/* Tab 1: Edit & Try Sandbox */}
        {activeTab === "sandbox" && (
          <div className="space-y-3">
            {/* Target Element Name */}
            <div className="space-y-1">
              <label className="text-[8px] text-[#c4b5a5] font-bold uppercase">Target Element Description</label>
              <input
                type="text"
                value={targetLabel}
                onChange={(e) => setTargetLabel(e.target.value)}
                placeholder="e.g. Forge Ritual Button"
                className="w-full h-7 px-2 bg-[#0c0507] border-2 border-black text-[9px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170]"
              />
            </div>

            {/* Select 8bit Component Type */}
            <div className="space-y-1">
              <label className="text-[8px] text-[#c4b5a5] font-bold uppercase">8bitcn Component</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  const type = e.target.value;
                  setSelectedType(type);
                  if (type === "badge") {
                    setElementProps({ text: "[ MAIN QUEST ]", variant: "gold", font: "retro" });
                  } else if (type === "button") {
                    setElementProps({ text: "Forge Ritual", variant: "gold", size: "md" });
                  } else if (type === "health-bar") {
                    setElementProps({ currentHp: 850, maxHp: 1000, showText: true });
                  } else if (type === "alert") {
                    setElementProps({ title: "Sanctuary Alert", description: "Cadence recorded.", variant: "gold" });
                  }
                }}
                className="w-full h-7 px-2 bg-[#0c0507] border-2 border-black text-[9px] font-pixel text-[#fba170] focus:outline-none focus:border-[#fba170] cursor-pointer"
              >
                <option value="button">8-Bit Button</option>
                <option value="badge">8-Bit Badge (Notched)</option>
                <option value="health-bar">Health Bar (HP)</option>
                <option value="mana-bar">Mana Bar (MP)</option>
                <option value="alert">8-Bit Alert Banner</option>
                <option value="card">8-Bit Card Plaque</option>
                <option value="progress">Stepped Progress</option>
              </select>
            </div>

            {/* Property Controls */}
            {("text" in elementProps) && (
              <div className="space-y-1">
                <label className="text-[8px] text-[#c4b5a5] font-bold uppercase">Label / Text</label>
                <input
                  type="text"
                  value={elementProps.text}
                  onChange={(e) => setElementProps((prev) => ({ ...prev, text: e.target.value }))}
                  className="w-full h-7 px-2 bg-[#0c0507] border-2 border-black text-[9px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170]"
                />
              </div>
            )}

            {("variant" in elementProps) && (
              <div className="space-y-1">
                <label className="text-[8px] text-[#c4b5a5] font-bold uppercase">Theme Variant</label>
                <select
                  value={elementProps.variant}
                  onChange={(e) => setElementProps((prev) => ({ ...prev, variant: e.target.value }))}
                  className="w-full h-7 px-2 bg-[#0c0507] border-2 border-black text-[9px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170] cursor-pointer"
                >
                  <option value="gold">Gold / Amber (Sanctuary)</option>
                  <option value="default">Default Dark</option>
                  <option value="secondary">Secondary Moss</option>
                  <option value="destructive">Destructive Crimson</option>
                  <option value="success">Success Emerald</option>
                  <option value="dungeon">Dungeon Stone</option>
                  <option value="outline">Retro Outline</option>
                </select>
              </div>
            )}

            {("size" in elementProps) && (
              <div className="space-y-1">
                <label className="text-[8px] text-[#c4b5a5] font-bold uppercase">Size</label>
                <select
                  value={elementProps.size}
                  onChange={(e) => setElementProps((prev) => ({ ...prev, size: e.target.value }))}
                  className="w-full h-7 px-2 bg-[#0c0507] border-2 border-black text-[9px] font-pixel text-[#fdf2e9] focus:outline-none focus:border-[#fba170] cursor-pointer"
                >
                  <option value="sm">Small (Compact)</option>
                  <option value="md">Medium (Standard)</option>
                  <option value="lg">Large (Chunky)</option>
                </select>
              </div>
            )}

            {/* Live Interactive Preview Box */}
            <div className="space-y-1 pt-1">
              <label className="text-[8px] text-[#c4b5a5] font-bold uppercase flex items-center justify-between">
                <span>Interactive Preview</span>
                <span className="text-amber-400">CLICKABLE</span>
              </label>
              <div className="p-4 bg-[linear-gradient(180deg,#1b0f13_0%,#11080a_100%)] border-2 border-black shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] flex items-center justify-center min-h-[70px]">
                <CanvasItemRenderer element={currentCanvasElement} />
              </div>
            </div>

            {/* Stage Change Action Button */}
            <Button
              variant="gold"
              size="sm"
              onClick={handleStageCurrent}
              className="w-full text-[9px] mt-2 flex items-center justify-center gap-1.5 shadow-[3px_3px_0_0_#000]"
            >
              <Sparkles className="w-3 h-3" />
              <span>STAGE THIS EDIT FOR {currentPage}</span>
            </Button>
          </div>
        )}

        {/* Tab 2: Click-to-Inspect Page Mode */}
        {activeTab === "inspect" && (
          <div className="space-y-3 text-center py-2">
            <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-amber-400 mx-auto shadow-[2px_2px_0_0_#000] text-lg">
              🎯
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-[#fdf2e9]">
                Live Page Element Picker
              </h3>
              <p className="text-[9px] text-[#c4b5a5] mt-1 leading-relaxed">
                Activate inspector mode to hover and click any button, badge, or card on the current page ({currentPage}) to test 8bitcn styles on it.
              </p>
            </div>

            <Button
              variant={isInspectMode ? "destructive" : "gold"}
              size="md"
              onClick={() => {
                setIsInspectMode(!isInspectMode);
                if (!isInspectMode) {
                  setIsOpen(false);
                  toast.info("🎯 Click any element on the page to inspect it!");
                }
              }}
              className="w-full text-[9px] flex items-center justify-center gap-1.5 shadow-[3px_3px_0_0_#000]"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{isInspectMode ? "STOP INSPECTING" : "START HOVER INSPECT"}</span>
            </Button>

            {inspectedElement && (
              <div className="text-left p-2.5 bg-[#1a0e12] border-2 border-black shadow-[2px_2px_0_0_#000] space-y-1">
                <span className="text-[8px] text-[#fba170] font-bold uppercase">Last Captured:</span>
                <div className="text-[9px] font-bold text-[#fdf2e9] truncate">
                  {inspectedElement.text || inspectedElement.tagName}
                </div>
                <div className="text-[7px] text-[#8c7b7d] truncate font-mono">
                  &lt;{inspectedElement.tagName}&gt; {inspectedElement.classes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Staged Edits & Send to Agent */}
        {activeTab === "staged" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[#c4b5a5] font-bold uppercase">
                Staged Changes ({stagedChanges.length})
              </span>
              {stagedChanges.length > 0 && (
                <button
                  onClick={clearStagedChanges}
                  className="text-[8px] text-red-400 hover:text-red-300 font-bold uppercase flex items-center gap-1"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>CLEAR</span>
                </button>
              )}
            </div>

            {stagedChanges.length === 0 ? (
              <div className="p-6 text-center text-[9px] text-[#8c7b7d] border-2 border-dashed border-[#8c7a53]/40 space-y-2">
                <div>No changes staged yet.</div>
                <p className="text-[8px] text-[#c4b5a5]">
                  Go to "EDIT & TRY", configure a component for any page, and hit "STAGE THIS EDIT".
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stagedChanges.map((change) => (
                  <div
                    key={change.id}
                    className="p-2 bg-[#1b0f13] border-2 border-black shadow-[2px_2px_0_0_#000] space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[8px] px-1 bg-[#e05344] text-white font-bold">
                          {change.pagePath}
                        </span>
                        <span className="text-[9px] font-bold text-[#fdf2e9] truncate">
                          {change.targetDescription}
                        </span>
                      </div>
                      <button
                        onClick={() => removeStagedChange(change.id)}
                        className="p-0.5 text-[#8c7b7d] hover:text-red-400 shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <pre className="text-[7px] font-mono text-[#fba170] bg-[#0c0507] p-1 border border-black truncate">
                      {change.generatedJsx}
                    </pre>
                  </div>
                ))}

                {/* Big Button: Copy Prompt for AI Agent */}
                <Button
                  variant="gold"
                  size="md"
                  onClick={handleCopyAgentPrompt}
                  className="w-full text-[9px] flex items-center justify-center gap-1.5 shadow-[3px_3px_0_0_#000] mt-3"
                >
                  {copiedPrompt ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <SendHorizontal className="w-3.5 h-3.5" />
                  )}
                  <span>📋 COPY PROMPT FOR AI AGENT</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Notice */}
      <div className="p-2.5 border-t-2 border-black bg-[#11080a] text-[8px] text-[#c4b5a5] flex items-center justify-between shadow-[0_-2px_0_0_#000]">
        <span>Ascend OS 8bitcn Suite</span>
        <span className="text-[#fba170] font-bold">FEAT // AGENT COMM</span>
      </div>
    </div>
  );
}
