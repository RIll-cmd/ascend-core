"use client";

import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { API_BASE_URL } from "@/constants";
import {
  PixelMonolithIcon,
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
    <div className="p-4 sm:p-5 backdrop-blur-md bg-[linear-gradient(180deg,rgba(32,18,22,0.90)_0%,rgba(20,11,14,0.96)_100%)] border-2 border-[#e05344]/40 shadow-[4px_4px_0_0_#140b0e] font-pixel text-[#fdf2e9] select-none relative overflow-hidden">
      {/* Shoji Lattice Corner Brackets */}
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#fba170] pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[#fba170] pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[#fba170] pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#fba170] pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-[#e05344]/20 pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#1c1114] border border-[#e05344]/50 flex items-center justify-center text-[#fba170] shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] shrink-0">
            <PixelMonolithIcon className="w-5 h-5 text-[#fba170]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#fdf2e9]">
              365-Day Temple Stepping Stones
            </h3>
            <p className="text-[9px] text-[#c4b5a5] uppercase font-bold mt-0.5">
              Sanctuary Lantern Illumination & Sacred Cadence
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-[#1c1114] border border-[#e05344]/40 shadow-[2px_2px_0_0_#140b0e] flex items-center gap-1.5">
          <PixelFlameIcon className="w-3.5 h-3.5 text-[#fba170]" />
          <span className="text-[10px] font-bold text-[#fba170]">
            ACTIVE DAYS: {totalActiveDays}
          </span>
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
                  "data-tooltip-content": "No lantern lit on this day",
                };
              }
              return {
                "data-tooltip-id": "heatmap-tooltip",
                "data-tooltip-content": `${value.count} ritual discipline${
                  value.count > 1 ? "s" : ""
                } fulfilled on ${value.date}`,
              };
            }}
          />
          <Tooltip id="heatmap-tooltip" />
        </div>
      </div>

      {/* Custom Styles for Kyoto Dusk Stepping Stone Tiles */}
      <style jsx global>{`
        .mountain-heatmap-container .react-calendar-heatmap text {
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          fill: #8c7b7d;
        }
        .mountain-heatmap-container .react-calendar-heatmap .color-empty {
          fill: #1a1012;
          stroke: #2b1a1e;
          stroke-width: 0.5px;
        }
        .mountain-heatmap-container .react-calendar-heatmap .color-scale-1 {
          fill: #2d4536;
          stroke: #1b2f23;
          stroke-width: 0.5px;
        }
        .mountain-heatmap-container .react-calendar-heatmap .color-scale-2 {
          fill: #10b981;
          stroke: #047857;
          stroke-width: 0.5px;
        }
        .mountain-heatmap-container .react-calendar-heatmap .color-scale-3 {
          fill: #fba170;
          stroke: #ea580c;
          stroke-width: 0.5px;
        }
        .mountain-heatmap-container .react-calendar-heatmap .color-scale-4 {
          fill: #f472b6;
          stroke: #db2777;
          stroke-width: 0.5px;
          filter: drop-shadow(0 0 3px rgba(244, 114, 182, 0.9));
        }
      `}</style>

      {/* Legend */}
      <div className="mt-3 pt-2.5 border-t border-[#e05344]/20 flex items-center justify-between text-[9px] text-[#c4b5a5] relative z-10 flex-wrap gap-2 uppercase font-bold">
        <span>Lantern Glow: 0 to 4+ rituals / day</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-[#8c7b7d]">Dormant</span>
          <div className="w-3 h-3 bg-[#1a1012] border border-[#2b1a1e]" />
          <div className="w-3 h-3 bg-[#2d4536] border border-[#1b2f23]" />
          <div className="w-3 h-3 bg-[#10b981] border border-[#047857]" />
          <div className="w-3 h-3 bg-[#fba170] border border-[#ea580c]" />
          <div className="w-3 h-3 bg-[#f472b6] border border-[#db2777]" />
          <span className="text-[9px] text-[#f472b6]">Blossom</span>
        </div>
      </div>
    </div>
  );
}
