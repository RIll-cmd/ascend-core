export type ElementTypeId =
  // Primitives
  | "button"
  | "badge"
  | "card"
  | "input"
  | "select"
  | "progress"
  | "slider"
  | "switch"
  | "kbd"
  | "alert"
  | "empty"
  // Combat & Progression
  | "health-bar"
  | "mana-bar"
  | "xp-bar"
  | "enemy-health"
  // RPG & Lore
  | "item-slot"
  | "dialogue"
  | "quest-card"
  | "save-slot"
  | "difficulty-select"
  // Authentic 8bitcn Showcase & Border Elements
  | "date-picker"
  | "checkbox-label"
  | "card-form"
  // Compound / Layout
  | "telemetry-card"
  | "container-plaque"
  | "input-group";

export type ElementCategory = "primitives" | "borders" | "combat" | "rpg" | "layout";

export interface ComponentPaletteItem {
  type: ElementTypeId;
  name: string;
  category: ElementCategory;
  description: string;
  iconName: string;
  defaultProps: Record<string, any>;
}

export interface CanvasElement {
  id: string;
  type: ElementTypeId;
  name: string;
  category: ElementCategory;
  props: Record<string, any>;
}

export interface EditorPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  elements: CanvasElement[];
}

export type ViewportMode = "desktop" | "tablet" | "mobile";
export type CanvasGridMode = "dots" | "pixel-grid" | "parchment" | "clean";
