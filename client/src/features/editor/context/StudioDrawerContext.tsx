"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export interface StagedChange {
  id: string;
  pagePath: string;
  targetDescription: string;
  componentType: string;
  props: Record<string, any>;
  generatedJsx: string;
  timestamp: string;
}

export interface InspectedElementData {
  tagName: string;
  text: string;
  classes: string;
  suggestedType: string;
  suggestedProps: Record<string, any>;
}

interface StudioDrawerContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  isInspectMode: boolean;
  setIsInspectMode: (active: boolean) => void;
  toggleInspectMode: () => void;
  stagedChanges: StagedChange[];
  stageChange: (change: Omit<StagedChange, "id" | "timestamp">) => void;
  removeStagedChange: (id: string) => void;
  clearStagedChanges: () => void;
  inspectedElement: InspectedElementData | null;
  setInspectedElement: (data: InspectedElementData | null) => void;
  currentPage: string;
}

const StudioDrawerContext = React.createContext<StudioDrawerContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "ascend_8bit_staged_changes";

export function StudioDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isInspectMode, setIsInspectMode] = React.useState(false);
  const [inspectedElement, setInspectedElement] = React.useState<InspectedElementData | null>(null);
  const [stagedChanges, setStagedChanges] = React.useState<StagedChange[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const pathname = usePathname();

  // Sync staged changes to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stagedChanges));
    } catch {
      // ignore
    }
  }, [stagedChanges]);

  const toggleOpen = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const toggleInspectMode = React.useCallback(() => {
    setIsInspectMode((prev) => !prev);
  }, []);

  const stageChange = React.useCallback((change: Omit<StagedChange, "id" | "timestamp">) => {
    const newChange: StagedChange = {
      ...change,
      id: `change-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setStagedChanges((prev) => [newChange, ...prev]);
  }, []);

  const removeStagedChange = React.useCallback((id: string) => {
    setStagedChanges((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearStagedChanges = React.useCallback(() => {
    setStagedChanges([]);
  }, []);

  // Global Click-to-Inspect Listener when inspect mode is active
  React.useEffect(() => {
    if (!isInspectMode) return;

    let highlightedEl: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest("[data-studio-drawer]") || target.closest("[data-studio-trigger]")) {
        return;
      }

      if (highlightedEl && highlightedEl !== target) {
        highlightedEl.style.outline = "";
      }

      highlightedEl = target;
      target.style.outline = "2px dashed #fba170";
      target.style.outlineOffset = "2px";
      target.style.cursor = "crosshair";
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest("[data-studio-drawer]") || target.closest("[data-studio-trigger]")) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const text = target.innerText?.trim().slice(0, 50) || "";
      const tagName = target.tagName.toLowerCase();
      const classes = target.className || "";

      let suggestedType = "button";
      if (tagName === "button" || target.role === "button" || classes.includes("btn") || classes.includes("Button")) {
        suggestedType = "button";
      } else if (classes.includes("badge") || classes.includes("Badge") || text.startsWith("[")) {
        suggestedType = "badge";
      } else if (classes.includes("card") || classes.includes("Card")) {
        suggestedType = "card";
      }

      setInspectedElement({
        tagName,
        text,
        classes: typeof classes === "string" ? classes.slice(0, 100) : "",
        suggestedType,
        suggestedProps: {
          text: text || "Selected Element",
          variant: "gold",
          size: "md",
        },
      });

      // Clear outline and open drawer
      if (highlightedEl) {
        highlightedEl.style.outline = "";
      }
      setIsInspectMode(false);
      setIsOpen(true);
    };

    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver, true);
      document.removeEventListener("click", handleClick, true);
      if (highlightedEl) {
        highlightedEl.style.outline = "";
      }
    };
  }, [isInspectMode]);

  return (
    <StudioDrawerContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        isInspectMode,
        setIsInspectMode,
        toggleInspectMode,
        stagedChanges,
        stageChange,
        removeStagedChange,
        clearStagedChanges,
        inspectedElement,
        setInspectedElement,
        currentPage: pathname || "/",
      }}
    >
      {children}
    </StudioDrawerContext.Provider>
  );
}

export function useStudioDrawer() {
  const context = React.useContext(StudioDrawerContext);
  if (!context) {
    throw new Error("useStudioDrawer must be used within a StudioDrawerProvider");
  }
  return context;
}
