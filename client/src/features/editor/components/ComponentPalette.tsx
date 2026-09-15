"use client";

import * as React from "react";
import { ComponentPaletteItem, ElementCategory } from "../types/editor";
import { PALETTE_COMPONENTS } from "../data/editorRegistry";
import { Search, Plus, Sparkles, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComponentPaletteProps {
  onAddElement: (item: ComponentPaletteItem) => void;
}

export function ComponentPalette({ onAddElement }: ComponentPaletteProps) {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<"all" | ElementCategory>("all");

  const filteredComponents = React.useMemo(() => {
    return PALETTE_COMPONENTS.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const categoryTags: { id: "all" | ElementCategory; label: string }[] = [
    { id: "all", label: "ALL" },
    { id: "borders", label: "BORDERS" },
    { id: "primitives", label: "PRIMITIVES" },
    { id: "combat", label: "COMBAT" },
    { id: "rpg", label: "RPG" },
    { id: "layout", label: "LAYOUT" },
  ];

  return (
    <aside className="relative flex flex-col h-full bg-[#170e11] border-y-4 border-[#e05344]/40 shadow-[4px_4px_0_0_#000] font-pixel text-[#fdf2e9] overflow-hidden select-none">
      {/* 8bitcn stepped pixel side notch borders */}
      <div className="absolute inset-0 border-x-4 -mx-1 border-[#e05344]/40 pointer-events-none" aria-hidden="true" />

      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#e05344]/20 relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#fba170]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#fdf2e9]">
              Component Deck
            </h2>
          </div>
          <span className="text-[9px] text-[#fba170] font-bold">
            {filteredComponents.length} AVAILABLE
          </span>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8c7b7d] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 8bit components..."
            className="w-full h-8 pl-8 pr-3 bg-[#11090c] border-2 border-black shadow-[2px_2px_0_0_#000] text-[10px] font-pixel text-[#fdf2e9] placeholder:text-[#8c7b7d] focus:outline-none focus:border-[#fba170]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1">
          {categoryTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setCategory(tag.id)}
              className={cn(
                "px-2 py-1 text-[8px] font-bold uppercase border-2 border-black shadow-[1px_1px_0_0_#000] transition-colors",
                category === tag.id
                  ? "bg-[#e05344] text-white border-black"
                  : "bg-[#1c1114] text-[#c4b5a5] hover:bg-[#28171c]"
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Component Cards Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative z-10">
        {filteredComponents.map((item) => (
          <div
            key={item.type}
            onClick={() => onAddElement(item)}
            className="group relative p-2.5 bg-[#1f1317] hover:bg-[#28171d] border-2 border-black hover:border-[#fba170] shadow-[2px_2px_0_0_#000] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-black/60 border border-black flex items-center justify-center text-amber-400 text-xs shadow-[1px_1px_0_0_#000] shrink-0">
                  ✦
                </span>
                <div>
                  <h3 className="text-[10px] font-bold text-[#fdf2e9] group-hover:text-amber-300">
                    {item.name}
                  </h3>
                  <span className="text-[8px] uppercase tracking-wider text-[#e05344] font-bold">
                    {item.category}
                  </span>
                </div>
              </div>

              <button
                className="w-5 h-5 bg-black border border-black group-hover:bg-[#e05344] group-hover:text-white flex items-center justify-center text-[10px] shadow-[1px_1px_0_0_#000] transition-colors"
                title="Add to Canvas"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <p className="text-[8px] text-[#c4b5a5] line-clamp-2 mt-1.5 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}

        {filteredComponents.length === 0 && (
          <div className="p-4 text-center text-[9px] text-[#8c7b7d] border-2 border-dashed border-[#8c7a53]/40">
            No matching 8bitcn elements found.
          </div>
        )}
      </div>
    </aside>
  );
}
