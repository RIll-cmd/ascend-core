"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../card";
import { Badge } from "../badge";
import "../styles/retro.css";

export interface DifficultyOption {
  id: string;
  name: string;
  badge?: string;
  multiplier?: string;
  description?: string;
  color?: "default" | "secondary" | "destructive" | "warning";
}

export const DEFAULT_DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: "easy",
    name: "RECRUIT / DELOAD",
    badge: "CASUAL",
    multiplier: "0.8x EXP",
    description: "Low strain, recovery pace. Ideal for injury prevention or active rest.",
    color: "secondary",
  },
  {
    id: "normal",
    name: "VETERAN / HYPERTROPHY",
    badge: "STANDARD",
    multiplier: "1.0x EXP",
    description: "Standard progression intensity. Balanced volume and challenge.",
    color: "default",
  },
  {
    id: "hard",
    name: "HEROIC / PR MAX OUT",
    badge: "HEAVY",
    multiplier: "1.5x EXP",
    description: "Maximum exertion. High fatigue rating, massive stat gains.",
    color: "warning",
  },
  {
    id: "mythic",
    name: "NIGHTMARE / ASCENDANT",
    badge: "LETHAL",
    multiplier: "2.5x EXP",
    description: "Unforgiving dungeon boss rules. Only for master ascendants.",
    color: "destructive",
  },
];

export interface DifficultySelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  options?: DifficultyOption[];
  title?: string;
  description?: string;
  layout?: "vertical" | "horizontal" | "grid";
}

export default function DifficultySelect({
  value,
  defaultValue = "normal",
  onChange,
  options = DEFAULT_DIFFICULTY_OPTIONS,
  title = "CHALLENGE TIER",
  description = "Select session exertion or dungeon difficulty level",
  layout = "grid",
  className,
  ...props
}: DifficultySelectProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue);

  const selected = isControlled ? value : internalValue;

  const handleSelect = (id: string) => {
    if (!isControlled) setInternalValue(id);
    onChange?.(id);
  };

  const getBorderColor = (opt: DifficultyOption, isSelected: boolean) => {
    if (!isSelected) return "border-[#2d251e] hover:border-[#8c7a53] bg-[#0c1222]/80";
    switch (opt.color) {
      case "destructive":
        return "border-[#ef4444] bg-[#450a0a]/50 ring-1 ring-red-500/50";
      case "warning":
        return "border-[#f59e0b] bg-[#451a03]/50 ring-1 ring-amber-500/50";
      case "secondary":
        return "border-[#0ea5e9] bg-[#082f49]/50 ring-1 ring-sky-500/50";
      default:
        return "border-[#f6c453] bg-[#1a1410] ring-1 ring-[#f6c453]/60";
    }
  };

  return (
    <Card className={cn("bg-[#0B1020]/95 border-[#8c7a53]", className)} {...props}>
      <CardHeader className="text-center pb-3">
        <CardTitle className="retro text-sm sm:text-base text-[#f6c453] tracking-wider">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="retro text-[9px] text-slate-400">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "gap-3",
            layout === "grid" && "grid grid-cols-1 sm:grid-cols-2",
            layout === "vertical" && "flex flex-col",
            layout === "horizontal" && "flex flex-wrap sm:flex-nowrap"
          )}
        >
          {options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                aria-pressed={isSelected}
                className={cn(
                  "retro group relative p-3 text-left transition-all duration-150 rounded-none border-2 shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px]",
                  getBorderColor(opt, isSelected),
                  isSelected && "shadow-[3px_3px_0_0_#000]"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 inline-block transition-colors",
                        isSelected ? "bg-[#f6c453]" : "bg-slate-600 group-hover:bg-slate-400"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] sm:text-xs font-bold tracking-wide",
                        isSelected ? "text-white" : "text-slate-300"
                      )}
                    >
                      {opt.name}
                    </span>
                  </div>
                  {opt.badge && (
                    <Badge
                      variant={isSelected ? "default" : "secondary"}
                      className="text-[8px] py-0 px-1.5"
                    >
                      {opt.badge}
                    </Badge>
                  )}
                </div>

                {opt.description && (
                  <p className="retro text-[8px] sm:text-[9px] text-slate-400 line-clamp-2 leading-relaxed">
                    {opt.description}
                  </p>
                )}

                {opt.multiplier && (
                  <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5">
                    <span className="retro text-[8px] text-slate-500">REWARD BONUS</span>
                    <span
                      className={cn(
                        "retro text-[8px] font-bold",
                        isSelected ? "text-[#f6c453]" : "text-slate-400"
                      )}
                    >
                      {opt.multiplier}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export { DifficultySelect };
