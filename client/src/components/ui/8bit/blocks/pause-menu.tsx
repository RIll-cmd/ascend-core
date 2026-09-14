"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import "../styles/retro.css";

export interface PauseMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  restSecondsLeft?: number;
  initialRestSeconds?: number;
  exerciseName?: string;
  nextSetInfo?: string;
  onResume?: () => void;
  onSkip?: () => void;
  onAdjustTimer?: (secondsDelta: number) => void;
  onAbort?: () => void;
}

export default function PauseMenu({
  restSecondsLeft = 90,
  initialRestSeconds = 90,
  exerciseName = "BARBELL SQUAT",
  nextSetInfo = "Set 4 of 5 • 140kg x 5 reps",
  onResume,
  onSkip,
  onAdjustTimer,
  onAbort,
  className,
  ...props
}: PauseMenuProps) {
  const [seconds, setSeconds] = React.useState(restSecondsLeft);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused) return;
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.max(0, Math.min(100, ((initialRestSeconds - seconds) / initialRestSeconds) * 100));

  return (
    <div
      className={cn(
        "retro fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4",
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-md bg-[#0B1020] border-4 border-[#8c7a53] shadow-[4px_4px_0_0_#000] overflow-hidden">
        <CardHeader className="p-4 bg-[#141a2e] border-b-2 border-[#8c7a53] text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="size-2 bg-[#f6c453] animate-ping inline-block" />
            <CardTitle className="retro text-sm sm:text-base text-[#f6c453] tracking-widest">
              REST INTERVAL PAUSED
            </CardTitle>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="gold" className="text-[7px]">{exerciseName}</Badge>
            <span className="text-[9px] text-slate-400 font-mono">{nextSetInfo}</span>
          </div>
        </CardHeader>

        <CardContent className="p-6 text-center space-y-6">
          {/* Big Digital Countdown */}
          <div className="py-2">
            <div className="retro text-5xl sm:text-6xl font-bold text-white tracking-widest drop-shadow-[2px_2px_0_#000]">
              {formatTime(seconds)}
            </div>
            <p className="retro text-[8px] text-slate-400 mt-2">RECOVERY RECOVERY COUNTDOWN</p>
          </div>

          {/* Stepped Progress Bar */}
          <div className="space-y-1">
            <div className="h-3 w-full bg-[#1a1410] border-2 border-slate-700 p-0.5">
              <div
                className="h-full bg-[#f6c453] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[7px] text-slate-500 font-mono">
              <span>00:00</span>
              <span>{Math.round(progressPercent)}% RECHARGED</span>
              <span>{formatTime(initialRestSeconds)}</span>
            </div>
          </div>

          {/* Quick Adjustment Pills */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSeconds((s) => Math.max(0, s - 15));
                onAdjustTimer?.(-15);
              }}
              className="retro px-2 py-1 text-[8px] bg-[#141a2e] border border-slate-700 text-slate-300 hover:border-slate-500 cursor-pointer"
            >
              -15s
            </button>
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="retro px-3 py-1 text-[8px] bg-[#1a1410] border-2 border-[#8c7a53] text-[#f6c453] hover:bg-[#2d251e] cursor-pointer"
            >
              {isPaused ? "RESUME TIMER" : "FREEZE TIMER"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSeconds((s) => s + 30);
                onAdjustTimer?.(30);
              }}
              className="retro px-2 py-1 text-[8px] bg-[#141a2e] border border-slate-700 text-slate-300 hover:border-slate-500 cursor-pointer"
            >
              +30s
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#2d251e]">
            <button
              type="button"
              onClick={onResume}
              className="retro w-full py-2.5 bg-[#f6c453] text-[#0B1020] font-bold text-xs border-2 border-black hover:bg-amber-300 shadow-[2px_2px_0_0_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              ▶ COMMENCE NEXT SET
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSkip}
                className="retro flex-1 py-1.5 bg-[#141a2e] text-slate-300 text-[9px] border border-slate-700 hover:border-slate-500 cursor-pointer"
              >
                SKIP REST INTERVAL
              </button>
              <button
                type="button"
                onClick={onAbort}
                className="retro flex-1 py-1.5 bg-red-950/50 text-red-400 text-[9px] border border-red-900/80 hover:bg-red-900/60 cursor-pointer"
              >
                END SESSION
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { PauseMenu };
