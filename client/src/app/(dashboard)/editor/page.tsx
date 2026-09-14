"use client";

import * as React from "react";
import { CanvasElement, ViewportMode, CanvasGridMode, EditorPreset, ComponentPaletteItem } from "@/features/editor/types/editor";
import { EDITOR_PRESETS } from "@/features/editor/data/editorPresets";
import { generateFullCanvasJsx } from "@/features/editor/utils/codeGenerator";
import { EditorHeader } from "@/features/editor/components/EditorHeader";
import { ComponentPalette } from "@/features/editor/components/ComponentPalette";
import { CanvasSandbox } from "@/features/editor/components/CanvasSandbox";
import { ElementInspector } from "@/features/editor/components/ElementInspector";
import { toast } from "sonner";

export default function BitcnEditorPage() {
  // Default to Combat HUD preset so the canvas is lively on first visit
  const [elements, setElements] = React.useState<CanvasElement[]>(() => {
    return JSON.parse(JSON.stringify(EDITOR_PRESETS[0].elements));
  });

  const [selectedId, setSelectedId] = React.useState<string | null>(() => {
    return EDITOR_PRESETS[0].elements[0]?.id ?? null;
  });

  const [viewport, setViewport] = React.useState<ViewportMode>("desktop");
  const [gridMode, setGridMode] = React.useState<CanvasGridMode>("pixel-grid");
  const [scanlines, setScanlines] = React.useState<boolean>(false);

  // Add Element from Palette
  const handleAddElement = React.useCallback((item: ComponentPaletteItem) => {
    const newElement: CanvasElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: item.type,
      name: item.name,
      category: item.category,
      props: JSON.parse(JSON.stringify(item.defaultProps)),
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
    toast.success(`✦ Added ${item.name} to canvas! ✦`);
  }, []);

  // Move Element Up
  const handleMoveUp = React.useCallback((index: number) => {
    if (index <= 0) return;
    setElements((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  }, []);

  // Move Element Down
  const handleMoveDown = React.useCallback((index: number) => {
    setElements((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  }, []);

  // Duplicate Element
  const handleDuplicate = React.useCallback((index: number) => {
    setElements((prev) => {
      const target = prev[index];
      if (!target) return prev;
      const duplicated: CanvasElement = {
        ...target,
        id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        props: JSON.parse(JSON.stringify(target.props)),
      };
      const next = [...prev];
      next.splice(index + 1, 0, duplicated);
      setSelectedId(duplicated.id);
      return next;
    });
    toast.success("✦ Element duplicated! ✦");
  }, []);

  // Delete Element
  const handleDelete = React.useCallback((id: string) => {
    setElements((prev) => {
      const next = prev.filter((el) => el.id !== id);
      return next;
    });
    setSelectedId((prevSelected) => (prevSelected === id ? null : prevSelected));
    toast.info("Element removed from canvas");
  }, []);

  // Update Prop of Selected Element
  const handleUpdateProp = React.useCallback((id: string, key: string, value: any) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        return {
          ...el,
          props: {
            ...el.props,
            [key]: value,
          },
        };
      })
    );
  }, []);

  // Load Preset
  const handleLoadPreset = React.useCallback((preset: EditorPreset) => {
    const freshElements = JSON.parse(JSON.stringify(preset.elements));
    setElements(freshElements);
    setSelectedId(freshElements[0]?.id ?? null);
    toast.success(`✦ Loaded "${preset.name}" ✦`);
  }, []);

  // Clear Canvas
  const handleClearCanvas = React.useCallback(() => {
    setElements([]);
    setSelectedId(null);
    toast.info("Canvas cleared");
  }, []);

  // Copy Full JSX
  const handleCopyFullJsx = React.useCallback(() => {
    const fullCode = generateFullCanvasJsx(elements);
    navigator.clipboard.writeText(fullCode);
  }, [elements]);

  const selectedElement = React.useMemo(() => {
    return elements.find((el) => el.id === selectedId) ?? null;
  }, [elements, selectedId]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] overflow-hidden">
      {/* Top Header Deck */}
      <EditorHeader
        viewport={viewport}
        onViewportChange={setViewport}
        gridMode={gridMode}
        onGridModeChange={setGridMode}
        scanlines={scanlines}
        onScanlinesToggle={() => setScanlines((prev) => !prev)}
        onLoadPreset={handleLoadPreset}
        onClearCanvas={handleClearCanvas}
        onCopyFullJsx={handleCopyFullJsx}
        elementCount={elements.length}
      />

      {/* Main 3-Column Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Component Palette (Deck) */}
        <div className="w-72 lg:w-80 shrink-0 h-full hidden md:block">
          <ComponentPalette onAddElement={handleAddElement} />
        </div>

        {/* Center: Interactive Sandbox */}
        <div className="flex-1 h-full overflow-hidden flex flex-col">
          <CanvasSandbox
            elements={elements}
            selectedId={selectedId}
            onSelectElement={setSelectedId}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onUpdateProp={handleUpdateProp}
            viewport={viewport}
            gridMode={gridMode}
            scanlines={scanlines}
            onLoadFirstPreset={() => handleLoadPreset(EDITOR_PRESETS[0])}
          />
        </div>

        {/* Right: Element Inspector & Code Generator */}
        <div className="w-72 lg:w-84 shrink-0 h-full hidden lg:block">
          <ElementInspector
            element={selectedElement}
            onUpdateProp={(key, val) => {
              if (selectedId) handleUpdateProp(selectedId, key, val);
            }}
            onDeleteElement={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
