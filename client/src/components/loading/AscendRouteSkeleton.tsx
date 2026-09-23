import { Skeleton } from "@/components/ui/8bit/skeleton";
import { cn } from "@/lib/utils";

export type LoadingPreset =
  | "command-hud" | "quest-list" | "quest-editor" | "habit-grid" | "habit-detail"
  | "habit-wizard" | "calendar-grid" | "hunter-sheet" | "stat-bars"
  | "history-timeline" | "profile-skills" | "appearance" | "training-session"
  | "benchmark-table" | "recovery" | "focus-library" | "skill-tree"
  | "tower-floors" | "raid-board" | "equipment-grid" | "forge" | "merchant"
  | "stable" | "command-console" | "medal-cabinet" | "automation-rules"
  | "telemetry" | "reward-track" | "character-sheet" | "studio" | "preferences";

export interface AscendRouteSkeletonProps {
  preset: LoadingPreset;
  label?: string;
  className?: string;
}

export const routeLoadingPresets: Record<string, LoadingPreset> = {
  "/dashboard": "command-hud",
  "/missions": "quest-list",
  "/missions/create": "quest-editor",
  "/habits": "habit-grid",
  "/habits/[id]": "habit-detail",
  "/habits/create": "habit-wizard",
  "/calendar": "calendar-grid",
  "/profile": "hunter-sheet",
  "/profile/stats": "stat-bars",
  "/profile/history": "history-timeline",
  "/profile/skills": "profile-skills",
  "/profile/customize": "appearance",
  "/workouts": "training-session",
  "/workouts/boss-pr": "benchmark-table",
  "/sleep": "recovery",
  "/learning": "focus-library",
  "/skills": "skill-tree",
  "/tower": "tower-floors",
  "/bosses": "raid-board",
  "/inventory": "equipment-grid",
  "/crafting": "forge",
  "/shop": "merchant",
  "/beasts": "stable",
  "/beasts-and-pets": "stable",
  "/aira": "command-console",
  "/achievements": "medal-cabinet",
  "/automations": "automation-rules",
  "/analytics": "telemetry",
  "/season-pass": "reward-track",
  "/character": "character-sheet",
  "/editor": "studio",
  "/settings": "preferences",
};

type Shape = "stat" | "row" | "card" | "square" | "chart" | "editor";
type Recipe = { title: string; accent: string; columns: string; shapes: readonly Shape[] };

const recipes: Record<LoadingPreset, Recipe> = {
  "command-hud": { title: "COMMAND HUD", accent: "text-cyan-400", columns: "lg:grid-cols-3", shapes: ["stat", "stat", "stat", "chart", "card", "card"] },
  "quest-list": { title: "MISSION DIRECTIVES", accent: "text-amber-400", columns: "lg:grid-cols-2", shapes: ["row", "row", "row", "row", "card"] },
  "quest-editor": { title: "MISSION EDITOR", accent: "text-amber-400", columns: "lg:grid-cols-2", shapes: ["editor", "card", "row"] },
  "habit-grid": { title: "HABIT MATRIX", accent: "text-emerald-400", columns: "lg:grid-cols-3", shapes: ["card", "card", "card", "card", "card", "card"] },
  "habit-detail": { title: "HABIT RECORD", accent: "text-emerald-400", columns: "lg:grid-cols-2", shapes: ["stat", "chart", "row", "row"] },
  "habit-wizard": { title: "HABIT FORGE", accent: "text-emerald-400", columns: "lg:grid-cols-2", shapes: ["editor", "stat", "row"] },
  "calendar-grid": { title: "CALENDAR MATRIX", accent: "text-cyan-400", columns: "lg:grid-cols-4", shapes: ["square", "square", "square", "square", "square", "square", "square", "row"] },
  "hunter-sheet": { title: "HUNTER PROFILE", accent: "text-violet-400", columns: "lg:grid-cols-3", shapes: ["square", "stat", "stat", "card", "chart"] },
  "stat-bars": { title: "ATTRIBUTE TELEMETRY", accent: "text-violet-400", columns: "lg:grid-cols-2", shapes: ["stat", "stat", "row", "row", "row"] },
  "history-timeline": { title: "HUNTER HISTORY", accent: "text-violet-400", columns: "lg:grid-cols-2", shapes: ["row", "row", "row", "row"] },
  "profile-skills": { title: "PROFILE SKILLS", accent: "text-violet-400", columns: "lg:grid-cols-3", shapes: ["square", "square", "square", "chart"] },
  appearance: { title: "APPEARANCE FORGE", accent: "text-violet-400", columns: "lg:grid-cols-2", shapes: ["square", "editor", "card"] },
  "training-session": { title: "TRAINING SESSION", accent: "text-orange-400", columns: "lg:grid-cols-2", shapes: ["stat", "stat", "row", "row", "row"] },
  "benchmark-table": { title: "BOSS BENCHMARKS", accent: "text-red-400", columns: "lg:grid-cols-2", shapes: ["chart", "row", "row", "row"] },
  recovery: { title: "RECOVERY TELEMETRY", accent: "text-indigo-400", columns: "lg:grid-cols-2", shapes: ["chart", "stat", "stat", "row"] },
  "focus-library": { title: "FOCUS LIBRARY", accent: "text-sky-400", columns: "lg:grid-cols-3", shapes: ["card", "card", "card", "row"] },
  "skill-tree": { title: "SKILL TREE", accent: "text-fuchsia-400", columns: "lg:grid-cols-3", shapes: ["square", "square", "square", "square", "square", "square"] },
  "tower-floors": { title: "TOWER FLOORS", accent: "text-amber-400", columns: "lg:grid-cols-2", shapes: ["stat", "row", "row", "row", "card"] },
  "raid-board": { title: "RAID BOARD", accent: "text-red-400", columns: "lg:grid-cols-2", shapes: ["card", "chart", "card", "row"] },
  "equipment-grid": { title: "EQUIPMENT INVENTORY", accent: "text-cyan-400", columns: "lg:grid-cols-4", shapes: ["square", "square", "square", "square", "square", "square", "square", "square"] },
  forge: { title: "FORGE", accent: "text-orange-400", columns: "lg:grid-cols-3", shapes: ["square", "square", "square", "card", "editor"] },
  merchant: { title: "MERCHANT STOCK", accent: "text-amber-400", columns: "lg:grid-cols-4", shapes: ["card", "card", "card", "card", "card", "card"] },
  stable: { title: "COMPANION STABLE", accent: "text-emerald-400", columns: "lg:grid-cols-3", shapes: ["card", "card", "card", "square"] },
  "command-console": { title: "AIRA CONSOLE", accent: "text-cyan-400", columns: "lg:grid-cols-2", shapes: ["row", "row", "row", "editor"] },
  "medal-cabinet": { title: "MEDAL CABINET", accent: "text-yellow-400", columns: "lg:grid-cols-4", shapes: ["square", "square", "square", "square", "square", "square"] },
  "automation-rules": { title: "AUTOMATION RULES", accent: "text-cyan-400", columns: "lg:grid-cols-2", shapes: ["row", "row", "row", "stat"] },
  telemetry: { title: "ANALYTICS TELEMETRY", accent: "text-sky-400", columns: "lg:grid-cols-3", shapes: ["stat", "stat", "stat", "chart", "chart"] },
  "reward-track": { title: "REWARD TRACK", accent: "text-yellow-400", columns: "lg:grid-cols-4", shapes: ["stat", "square", "square", "square", "square", "row"] },
  "character-sheet": { title: "CHARACTER SHEET", accent: "text-purple-400", columns: "lg:grid-cols-3", shapes: ["square", "stat", "stat", "chart"] },
  studio: { title: "EDITOR STUDIO", accent: "text-pink-400", columns: "lg:grid-cols-3", shapes: ["row", "chart", "editor"] },
  preferences: { title: "PREFERENCES", accent: "text-slate-300", columns: "lg:grid-cols-2", shapes: ["row", "row", "row", "row", "row"] },
};

const heightByShape: Record<Shape, string> = {
  stat: "h-24", row: "h-16", card: "h-44", square: "aspect-square", chart: "h-52", editor: "h-72",
};

export function AscendRouteSkeleton({ preset, label, className }: AscendRouteSkeletonProps): React.JSX.Element {
  const recipe = recipes[preset];
  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-loading-preset={preset}
      className={cn("min-w-0 w-full space-y-6 bg-[#0B1020] p-4 text-slate-100 sm:p-6", className)}
    >
      <p className="sr-only">{label ?? `Loading ${recipe.title.toLowerCase()}`}</p>
      <header className="space-y-3 border-b border-white/10 pb-5">
        <p className={cn("font-mono text-[10px] tracking-[0.3em]", recipe.accent)}>ASCEND CORE // LOADING</p>
        <h2 className="font-mono text-lg font-bold tracking-wide sm:text-2xl">{recipe.title}</h2>
        <Skeleton aria-hidden="true" className="h-3 w-2/3 max-w-72 bg-[#19283b] motion-reduce:animate-none" />
      </header>
      <div aria-hidden="true" className={cn("grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2", recipe.columns)}>
        {recipe.shapes.map((shape, index) => (
          <div key={`${shape}-${index}`} className="min-w-0 space-y-4 border border-white/10 bg-[#111b2a] p-4">
            <Skeleton className="h-3 w-1/2 bg-[#233550] motion-reduce:animate-none" />
            <Skeleton className={cn("w-full bg-[#1b2b40] motion-reduce:animate-none", heightByShape[shape])} />
            {shape !== "square" && <Skeleton className="h-2 w-3/4 bg-[#233550] motion-reduce:animate-none" />}
          </div>
        ))}
      </div>
    </section>
  );
}
