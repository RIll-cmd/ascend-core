"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import "../styles/retro.css";

export interface SaveSlotData {
  id: string;
  slotNumber: number;
  isEmpty: boolean;
  name?: string;
  description?: string;
  exerciseCount?: number;
  lastUpdated?: string;
  tonnageRecord?: number;
}

export interface SaveSlotsProps extends React.HTMLAttributes<HTMLDivElement> {
  slots?: SaveSlotData[];
  maxSlots?: number;
  title?: string;
  onSelectSlot?: (slot: SaveSlotData) => void;
  onSaveSlot?: (slotNumber: number) => void;
  onDeleteSlot?: (id: string) => void;
}

const DEFAULT_SLOTS: SaveSlotData[] = [
  {
    id: "slot-1",
    slotNumber: 1,
    isEmpty: false,
    name: "Push Day Hypertrophy A",
    description: "Incline Barbell Bench, Overhead Dumbbell Press, Dips, Lateral Raises",
    exerciseCount: 6,
    lastUpdated: "2 days ago",
    tonnageRecord: 8450,
  },
  {
    id: "slot-2",
    slotNumber: 2,
    isEmpty: false,
    name: "Pull Day Heavy Deadlifts",
    description: "Conventional Deadlifts, Weighted Pullups, Chest-Supported T-Bar Rows",
    exerciseCount: 5,
    lastUpdated: "Yesterday",
    tonnageRecord: 11200,
  },
  {
    id: "slot-3",
    slotNumber: 3,
    isEmpty: false,
    name: "Leg Day Squat Citadel",
    description: "High-Bar Squats, Romanian Deadlifts, Bulgarian Split Squats, Calf Steppers",
    exerciseCount: 7,
    lastUpdated: "4 days ago",
    tonnageRecord: 14600,
  },
  {
    id: "slot-4",
    slotNumber: 4,
    isEmpty: true,
  },
];

function FloppyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h14V5H5zm2 2h6v4H7V7zm8 0h2v3h-2V7zm-8 6h10v4H7v-4z" />
    </svg>
  );
}

export default function SaveSlots({
  slots = DEFAULT_SLOTS,
  maxSlots = 4,
  title = "ROUTINE SAVE SLOTS",
  onSelectSlot,
  onSaveSlot,
  onDeleteSlot,
  className,
  ...props
}: SaveSlotsProps) {
  const displaySlots = React.useMemo(() => {
    const list = [...slots];
    while (list.length < maxSlots) {
      list.push({
        id: `slot-${list.length + 1}`,
        slotNumber: list.length + 1,
        isEmpty: true,
      });
    }
    return list.slice(0, maxSlots);
  }, [slots, maxSlots]);

  const savedCount = displaySlots.filter((s) => !s.isEmpty).length;

  return (
    <Card className={cn("bg-[#0B1020]/95 border-2 border-[#8c7a53] shadow-[3px_3px_0_0_#000]", className)} {...props}>
      <CardHeader className="p-4 pb-2 border-b border-[#2d251e]">
        <div className="flex items-center justify-between">
          <CardTitle className="retro text-xs sm:text-sm text-[#f6c453] tracking-wider flex items-center gap-2">
            <FloppyIcon className="size-4 text-[#f6c453]" />
            <span>{title}</span>
          </CardTitle>
          <Badge variant="default" className="text-[8px] py-0 px-1.5">
            {savedCount} / {maxSlots} USED
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-3">
        {displaySlots.map((slot) => {
          if (slot.isEmpty) {
            return (
              <div
                key={slot.id}
                onClick={() => onSaveSlot?.(slot.slotNumber)}
                className="retro border-2 border-dashed border-slate-700 hover:border-[#8c7a53] p-3 sm:p-4 flex items-center justify-between gap-4 cursor-pointer bg-[#0c1222]/40 hover:bg-[#141a2e]/60 transition-colors group shadow-[2px_2px_0_0_#000]"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 border border-dashed border-slate-600 flex items-center justify-center text-slate-600 group-hover:text-slate-400">
                    <FloppyIcon className="size-5" />
                  </div>
                  <div>
                    <p className="retro text-[10px] sm:text-xs text-slate-500 group-hover:text-slate-300">
                      [SLOT {slot.slotNumber}] EMPTY PRESET
                    </p>
                    <p className="retro text-[8px] text-slate-600">Click to save current workout routine</p>
                  </div>
                </div>
                <span className="retro text-[8px] text-slate-500 group-hover:text-[#f6c453] border border-slate-700 px-2 py-1">
                  SAVE TO SLOT
                </span>
              </div>
            );
          }

          return (
            <div
              key={slot.id}
              className="retro border-2 border-[#8c7a53] bg-[#141a2e]/90 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0_0_#000] transition-colors hover:border-[#f6c453]"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="size-10 border-2 border-[#8c7a53] bg-[#1a1410] flex flex-col items-center justify-center text-[#f6c453] shrink-0 shadow-[1px_1px_0_0_#000]">
                  <FloppyIcon className="size-4" />
                  <span className="retro text-[7px]">{slot.slotNumber}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="retro text-[10px] sm:text-xs font-bold text-white truncate">
                      {slot.name}
                    </p>
                    <Badge variant="default" className="text-[7px] py-0 px-1">
                      SAVED
                    </Badge>
                  </div>

                  {slot.description && (
                    <p className="retro text-[8px] text-slate-400 line-clamp-1 mt-0.5">
                      {slot.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-1.5 text-[7px] font-mono text-slate-400">
                    {slot.exerciseCount && <span>{slot.exerciseCount} Exercises</span>}
                    {slot.tonnageRecord && <span>• PR: {slot.tonnageRecord.toLocaleString()}kg</span>}
                    {slot.lastUpdated && <span>• {slot.lastUpdated}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onSelectSlot?.(slot)}
                  className="retro px-3 py-1.5 text-[8px] font-bold bg-[#f6c453] text-[#0B1020] border-2 border-black hover:bg-amber-300 shadow-[1px_1px_0_0_#000] cursor-pointer"
                >
                  LOAD PRESET
                </button>
                {onDeleteSlot && (
                  <button
                    type="button"
                    onClick={() => onDeleteSlot(slot.id)}
                    className="retro px-2 py-1.5 text-[8px] bg-red-950/40 text-red-400 border border-red-900/60 hover:bg-red-900/50 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export { SaveSlots };
