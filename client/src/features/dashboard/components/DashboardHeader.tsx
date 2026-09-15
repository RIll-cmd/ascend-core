"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";

export interface DashboardHeaderProps {
  level: number;
  completedCount: number;
  totalCount: number;
}

export function DashboardHeader({
  level,
  completedCount,
  totalCount,
}: DashboardHeaderProps) {
  const router = useRouter();
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-card border-y-4 sm:border-y-6 border-foreground dark:border-ring shadow-[2px_2px_0_0_#000] relative">
      {/* 8bitcn stepped pixel border accents */}
      <div
        className="absolute inset-0 border-x-4 sm:border-x-6 -mx-1 border-inherit pointer-events-none"
        aria-hidden="true"
      />

      {/* Left: Command Center Title & Subtitle */}
      <div className="space-y-0.5">
        <h1 className="retro text-sm sm:text-base md:text-lg font-bold tracking-wider text-foreground">
          ASCEND COMMAND CENTER
        </h1>
        <p className="text-[11px] sm:text-xs text-muted-foreground">
          Today's progression overview
        </p>
      </div>

      {/* Right: Progression Metrics & Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Badge variant="outline" className="text-[9px] sm:text-[10px] py-1 px-2">
          LV.{level}
        </Badge>

        <Badge variant="secondary" className="text-[9px] sm:text-[10px] py-1 px-2 font-mono">
          {completedCount}/{totalCount} CLEARED ({progressPct}%)
        </Badge>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => router.push("/habits/create")}
            className="text-[9px] sm:text-[10px] h-8 px-3"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            NEW HABIT
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/missions")}
            className="text-[9px] sm:text-[10px] h-8 px-3"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            NEW MISSION
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
