"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../card";
import "../styles/retro.css";

export interface GameOverProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  floorNumber?: number;
  initialCountdown?: number;
  onRetry?: () => void;
  onRetreat?: () => void;
  retreatLabel?: string;
  retryLabel?: string;
}

export default function GameOver({
  className,
  title = "ASCENSION FAILED",
  subtitle = "The Spire Guardian proved fatal. Vital signals depleted.",
  floorNumber,
  initialCountdown = 9,
  onRetry,
  onRetreat,
  retreatLabel = "TACTICAL RETREAT",
  retryLabel = "CONTINUE BATTLE",
  ...props
}: GameOverProps) {
  const [countdown, setCountdown] = React.useState(initialCountdown);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <Card
      variant="dungeon"
      className={cn(
        "w-full max-w-xl mx-auto p-5 sm:p-7 bg-[#230b0f]/98 border-[#991b1b] shadow-[0_12px_36px_rgba(0,0,0,0.95)] select-none",
        className
      )}
      {...props}
    >
      <CardContent className="p-0 space-y-6 text-center">
        {/* Pixel Skull Sigil */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="size-16 rounded-lg bg-[#450a0a] border-2 border-[#ef4444] flex items-center justify-center text-[#fca5a5] font-black text-3xl shadow-[3px_3px_0_0_#000] animate-pulse">
            💀
          </div>

          {floorNumber !== undefined && (
            <span className="retro text-[9px] text-[#f87171] uppercase tracking-widest">
              FLOOR {floorNumber} DEFEAT
            </span>
          )}

          <h2 className="retro text-xl sm:text-2xl font-black text-[#fca5a5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider">
            {title}
          </h2>

          <p className="font-mono text-xs text-slate-300 max-w-sm leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Countdown Box */}
        <div className="p-4 bg-[#140508] border-2 border-[#7f1d1d] max-w-xs mx-auto shadow-[2px_2px_0_0_#000]">
          <p className="retro text-[10px] text-[#fca5a5] uppercase mb-1">
            CONTINUE TRIAL?
          </p>
          <div className="retro text-3xl sm:text-4xl font-black text-white tracking-widest animate-pixel-blink">
            {countdown > 0 ? countdown : "0"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:w-auto px-6 py-3 bg-[#b91c1c] hover:bg-[#dc2626] text-white font-pixel text-xs uppercase tracking-wider font-bold border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>↺</span>
              <span>{retryLabel}</span>
            </button>
          )}

          {onRetreat && (
            <button
              type="button"
              onClick={onRetreat}
              className="w-full sm:w-auto px-6 py-3 bg-[#1e1b1b] hover:bg-[#2e2929] text-slate-300 font-pixel text-xs uppercase tracking-wider font-bold border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>✕</span>
              <span>{retreatLabel}</span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { GameOver };
