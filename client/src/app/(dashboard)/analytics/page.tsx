"use client";

import React, { useEffect } from "react";
import { BarChart3, TrendingUp, Sparkles, Activity, PieChart, ShieldAlert } from "lucide-react";
import dynamic from "next/dynamic";
import { HistoryTimeline } from "@/features/progression/components";
import { useProgressionStore } from "@/features/progression/store";

const WeeklyExpChart = dynamic(
  () => import("@/features/progression/components/WeeklyExpChart").then((mod) => mod.WeeklyExpChart),
  { ssr: false }
);

const ChartAreaStep = dynamic(
  () => import("@/components/ui/8bit/blocks/chart-area-step").then((mod) => mod.ChartAreaStep),
  { ssr: false }
);

export default function AnalyticsPage() {
  const {
    goldLogs,
    weeklyExpData,
    loadGoldHistory,
    loadWeeklyAnalytics,
    isLoading: isAnalyticsLoading,
  } = useProgressionStore();

  const [chartMode, setChartMode] = React.useState<"smooth" | "retro">("retro");

  useEffect(() => {
    loadWeeklyAnalytics("char-id-123");
    loadGoldHistory("char-id-123");
  }, [loadWeeklyAnalytics, loadGoldHistory]);

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      {/* HEADER SECTION */}
      <div className="relative rounded-[24px] bg-[#151C33] border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-[20px] bg-purple-600/20 border border-purple-500/40 text-purple-400">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
                  ASCEND ANALYTICS ENGINE
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
                  LIVE
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-white tracking-tight mt-1">
                Performance & Analytics
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-lg">
                Visualize growth trajectories, volume progression, habit consistency, and character stat ascension over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS CONTAINER CARD */}
      <div className="rounded-[24px] bg-[#151C33] border border-white/10 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold font-heading text-white">
              System Telemetry Matrix
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Chart Style Switcher */}
            <div className="flex items-center bg-[#0B1020] border border-white/20 p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setChartMode("retro")}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors ${
                  chartMode === "retro"
                    ? "bg-[#f6c453] text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                8-BIT STEP
              </button>
              <button
                type="button"
                onClick={() => setChartMode("smooth")}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors ${
                  chartMode === "smooth"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                BÉZIER SMOOTH
              </button>
            </div>

            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              REAL-TIME DATA STREAM
            </span>
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {chartMode === "retro" ? (
              <ChartAreaStep
                title="WEEKLY EXP ASCENSION VELOCITY"
                description="Stepped 8-bit velocity telemetry across daily cycles"
                valueLabel="EXP Gained"
                unit="EXP"
                color="gold"
                data={weeklyExpData.map((d) => ({
                  label: d.day.toUpperCase(),
                  value: d.exp,
                }))}
                className="bg-[#0D1322] border-slate-800/80"
              />
            ) : (
              <WeeklyExpChart data={weeklyExpData} isLoading={isAnalyticsLoading} />
            )}
          </div>
          <div className="lg:col-span-1">
            <HistoryTimeline logs={goldLogs} isLoading={isAnalyticsLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
