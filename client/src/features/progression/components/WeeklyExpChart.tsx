"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp, Sparkles, Activity } from "lucide-react";
import { WeeklyExpDataPoint } from "../services/analytics.service";

interface WeeklyExpChartProps {
  data: WeeklyExpDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 border border-purple-500/30 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-slate-300">{label}</p>
        <p className="text-purple-400 font-bold flex items-center gap-1 mt-0.5">
          <Sparkles className="w-3 h-3 text-purple-400" />
          +{payload[0].value} EXP
        </p>
      </div>
    );
  }
  return null;
};

export function WeeklyExpChart({ data, isLoading }: WeeklyExpChartProps) {
  const totalExp = data.reduce((acc, curr) => acc + curr.exp, 0);

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col justify-center items-center gap-3 animate-pulse">
        <Activity className="w-8 h-8 text-purple-500/50 animate-spin" />
        <span className="text-slate-400 text-sm font-medium">
          Gathering Analytics Data...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0D1322] border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Glow highlight backdrop */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Weekly EXP Gain
            </h3>
            <p className="text-xs text-slate-400">
              Past 7 Days Performance Velocity
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-indigo-400">
            +{totalExp} EXP
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            7-Day Total
          </span>
        </div>
      </div>

      <div className="w-full h-52">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <Activity className="w-6 h-6 mb-2 opacity-40" />
            No completion data logged for this week.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1E293B"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="exp"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
