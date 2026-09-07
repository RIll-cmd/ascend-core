"use client";

import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { API_BASE_URL } from "@/constants";
import {
  PixelMonolithIcon,
  PixelSparklesIcon,
  PixelFlameIcon,
} from "@/components/ui/pixel/PixelIcons";

interface HeatmapData {
  date: string;
  count: number;
  level: number;
}

const HeatmapComponent = CalendarHeatmap as unknown as React.ComponentType<{
  startDate: Date;
  endDate: Date;
  values: HeatmapData[];
  classForValue: (value: HeatmapData | undefined) => string;
  tooltipDataAttrs: (value: HeatmapData | undefined) => Record<string, string>;
}>;

export function HabitHeatmap({ characterId }: { characterId: string }) {
  const [data, setData] = useState<HeatmapData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/missions/heatmap/${characterId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load heatmap", e);
      }
    }
    fetchData();
  }, [characterId]);

  const today = new Date();
  const shiftDate = new Date();
  shiftDate.setFullYear(today.getFullYear() - 1);

  const totalActiveDays = data.filter((d) => d.count > 0).length;

  return (
    <div className="p-4 sm:p-5 bg-[#2f3640] bg-[linear-gradient(180deg,#3b424c_0%,#2f3640_50%,#1f242b_100%)] border-4 border-[#1d2d2a] shadow-[4px_4px_0_0_#111a18] font-pixel text-[#ffd166] select-none relative overflow-hidden">
      
      {/* Slate Stone Corner Masonry Markers */}
      <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#ffb03a] pointer-events-none" />
      <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#ffb03a] pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#ffb03a] pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#ffb03a] pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b-2 border-[#1d2d2a] pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#1d2d2a] border-2 border-[#ffb03a] flex items-center justify-center text-[#ffd166] shadow-[inset_0_0_6px_rgba(0,0,0,0.8)] shrink-0">
            <PixelMonolithIcon className="w-5 h-5 text-[#ffb03a]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#ffd166] flex items-center gap-1.5">
              ✦ 365-Day Mountain Monastery Monolith ✦
              <PixelSparklesIcon className="w-3.5 h-3.5 text-[#ffb03a]" />
            </h3>
            <p className="text-[9px] text-[#d1d6dc] uppercase font-bold mt-0.5">
              Alpine Beacon Execution Matrix & Willpower Density
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-[#1d2d2a] border-2 border-[#ffb03a] shadow-[2px_2px_0_0_#111a18] flex items-center gap-1.5">
          <PixelFlameIcon className="w-3.5 h-3.5 text-[#ffb03a]" />
          <span className="text-[10px] font-bold text-[#ffd166]">ACTIVE DAYS: {totalActiveDays}</span>
        </div>
      </div>

      {/* Heatmap Matrix Display */}
      <div className="overflow-x-auto custom-scrollbar pb-2 relative z-10">
        <div style={{ minWidth: "720px" }} className="mountain-heatmap-container">
          <HeatmapComponent
            startDate={shiftDate}
            endDate={today}
            values={data}
            classForValue={(value) => {
              if (!value || !value.count) {
                return "color-empty";
              }
              return `color-scale-${Math.min(4, value.level || 1)}`;
            }}
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) {
                return {
                  "data-tooltip-id": "heatmap-tooltip",
                  "data-tooltip-content": "No beacon fires lit on this day",
                };
              }
              return {
                "data-tooltip-id": "heatmap-tooltip",
                "data-tooltip-content": `${value.count} protocol execution${value.count > 1 ? "s" : ""} on ${value.date}`,
              };
            }}
          />
          <Tooltip id="heatmap-tooltip" />
        </div>
      </div>

      {/* Custom Styles for Stone Monastery Beacon Rune Tiles */}
      <style jsx global>{`
        .mountain-heatmap-container .react-calendar-heatmap text {
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          fill: #b0b8c4;
        }
        .mountain-heatmap-container .react-calendar-heatmap .color-empty {
          fill: #1f242b;
          stroke: #111a18;
          stroke-width: 0.5px;
        }
        .mountain-heatmap-container .react-calendar-heatmap .color-scale-1 {
          fill: #5a6472;
          stroke: #2f3640;
          stroke-width: 0.5px;
        }
        .mountain-heatmap-container .react-calendar-heatmap .color-scale-2 {
          fill: #ea580c;
          stroke: #9a3412;
          stroke-width: 0.5px;
        }
        .mountain-heatmap-container .react-calendar-heatmap .color-scale-3 {
          fill: #ffb03a;
          stroke: #ea580c;
          stroke-width: 0.5px;
        }
        .mountain-heatmap-container .react-calendar-heatmap .color-scale-4 {
          fill: #ffd166;
          stroke: #ffb03a;
          stroke-width: 0.5px;
          filter: drop-shadow(0 0 3px rgba(255, 209, 102, 0.9));
        }
      `}</style>

      {/* Legend */}
      <div className="mt-3 pt-2.5 border-t-2 border-[#1d2d2a] flex items-center justify-between text-[9px] text-[#d1d6dc] relative z-10 flex-wrap gap-2 uppercase font-bold">
        <span>Beacon Density: 0 to 4+ executions / day</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-[#b0b8c4]">Dormant</span>
          <div className="w-3 h-3 bg-[#1f242b] border border-[#111a18]" />
          <div className="w-3 h-3 bg-[#5a6472] border border-[#2f3640]" />
          <div className="w-3 h-3 bg-[#ea580c] border border-[#9a3412]" />
          <div className="w-3 h-3 bg-[#ffb03a] border border-[#ea580c]" />
          <div className="w-3 h-3 bg-[#ffd166] border border-[#ffb03a]" />
          <span className="text-[9px] text-[#ffd166]">Blazing</span>
        </div>
      </div>
    </div>
  );
}
