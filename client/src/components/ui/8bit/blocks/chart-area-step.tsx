"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../card";
import { Badge } from "../badge";
import "../styles/retro.css";

export interface StepChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface ChartAreaStepProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: StepChartDataPoint[];
  title?: string;
  description?: string;
  valueLabel?: string;
  unit?: string;
  color?: "gold" | "crimson" | "cyan" | "emerald";
}

const DEFAULT_WORKOUT_DATA: StepChartDataPoint[] = [
  { label: "MON", value: 4200 },
  { label: "TUE", value: 6800 },
  { label: "WED", value: 3100 },
  { label: "THU", value: 8900 },
  { label: "FRI", value: 7400 },
  { label: "SAT", value: 11200 },
  { label: "SUN", value: 5000 },
];

const COLOR_CONFIG = {
  gold: { stroke: "#f6c453", fill: "rgba(246, 196, 83, 0.25)" },
  crimson: { stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.25)" },
  cyan: { stroke: "#38bdf8", fill: "rgba(56, 189, 248, 0.25)" },
  emerald: { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.25)" },
};

interface RetroTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit?: string;
}

function RetroTooltip({ active, payload, label, unit }: RetroTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="retro bg-[#0B1020] border-2 border-[#8c7a53] p-2 shadow-[2px_2px_0_0_#000]">
        <p className="text-[8px] text-slate-400 font-bold mb-1">{label}</p>
        <p className="text-[10px] text-[#f6c453] font-bold">
          {payload[0].value.toLocaleString()} {unit}
        </p>
      </div>
    );
  }
  return null;
}

export default function ChartAreaStep({
  data = DEFAULT_WORKOUT_DATA,
  title = "WEEKLY TONNAGE STEP CHART",
  description = "Stepped pixel volume trajectory across Iron Temple sessions.",
  valueLabel = "Volume Moved",
  unit = "kg",
  color = "gold",
  className,
  ...props
}: ChartAreaStepProps) {
  const selectedColor = COLOR_CONFIG[color] || COLOR_CONFIG.gold;
  const total = React.useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);
  const peak = React.useMemo(() => Math.max(...data.map((d) => d.value)), [data]);

  return (
    <Card className={cn("bg-[#0B1020]/95 border-2 border-[#8c7a53] shadow-[3px_3px_0_0_#000]", className)} {...props}>
      <CardHeader className="p-4 pb-2 border-b border-[#2d251e]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="retro text-xs sm:text-sm text-[#f6c453] tracking-wider flex items-center gap-2">
              <span>📊</span>
              <span>{title}</span>
            </CardTitle>
            {description && (
              <CardDescription className="retro text-[9px] text-slate-400 mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-[8px] py-0 px-1.5">
              TOTAL: {total.toLocaleString()} {unit}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="w-full h-[220px] sm:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedColor.stroke} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={selectedColor.stroke} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "monospace" }}
                tickLine={{ stroke: "#334155" }}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 8, fontFamily: "monospace" }}
                tickLine={{ stroke: "#334155" }}
                axisLine={{ stroke: "#334155" }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<RetroTooltip unit={unit} />} />
              <Area
                type="stepAfter"
                dataKey="value"
                name={valueLabel}
                stroke={selectedColor.stroke}
                strokeWidth={2}
                fill={`url(#gradient-${color})`}
                dot={{ stroke: selectedColor.stroke, strokeWidth: 2, r: 3, fill: "#0B1020" }}
                activeDot={{ stroke: "#fff", strokeWidth: 2, r: 5, fill: selectedColor.stroke }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-2 border-t border-[#2d251e] flex items-center justify-between text-[8px] text-slate-500 font-mono">
          <span>PEAK: {peak.toLocaleString()} {unit}</span>
          <span className="retro text-[7px] text-[#8c7a53]">STEPPED 8-BIT RESOLUTION</span>
        </div>
      </CardContent>
    </Card>
  );
}

export { ChartAreaStep };
