"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Progress from "../progress";
import "../styles/retro.css";

const DEFAULT_TIPS = [
  "Tip: Maintain a 2-second eccentric lowering phase for maximum hypertrophy stimulus.",
  "Codex: Scribe focus sessions burn mental stamina. Hydrate between 25m pomodoros.",
  "Tower: Floor Bosses telegraph their ultimate strikes with red aura flashes.",
  "Ascend OS: Consistency streaks multiply EXP gains by up to 2.5x.",
  "Did you know? Logging sleep quality in Recovery improves daily stamina regenerations.",
];

export interface LoadingScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  tips?: string[];
  progress?: number;
  showPercentage?: boolean;
  tipInterval?: number;
  variant?: "default" | "fullscreen";
  autoProgress?: boolean;
  autoProgressDuration?: number;
  onComplete?: () => void;
}

export default function LoadingScreen({
  title = "ASCENDING SPIRE TOWER...",
  tips = DEFAULT_TIPS,
  progress = 0,
  showPercentage = true,
  tipInterval = 3200,
  variant = "default",
  autoProgress = false,
  autoProgressDuration = 4000,
  onComplete,
  className,
  ...props
}: LoadingScreenProps) {
  const [currentTipIndex, setCurrentTipIndex] = React.useState(0);
  const [internalProgress, setInternalProgress] = React.useState(autoProgress ? 0 : progress);

  React.useEffect(() => {
    if (!autoProgress) {
      return;
    }

    const step = 5;
    const steps = 100 / step;
    const intervalTime = autoProgressDuration / steps;

    const timer = setInterval(() => {
      setInternalProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          onComplete?.();
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoProgress, autoProgressDuration, onComplete]);

  React.useEffect(() => {
    if (tips.length <= 1) return;

    const tipTimer = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, tipInterval);

    return () => clearInterval(tipTimer);
  }, [tips, tipInterval]);

  const displayProgress = autoProgress ? internalProgress : progress;

  const content = (
    <div className="flex flex-col items-center justify-center gap-6 p-6 sm:p-10 max-w-lg mx-auto text-center">
      {/* Loading Skull / Rune Sprite */}
      <div className="size-16 border-2 border-[#8c7a53] bg-[#141a2e] flex items-center justify-center shadow-[3px_3px_0_0_#000] animate-bounce">
        <span className="retro text-2xl select-none">⚔️</span>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="retro text-sm sm:text-base font-bold text-[#f6c453] tracking-widest animate-pulse">
          {title}
        </h2>
        <p className="retro text-[8px] text-slate-500">INITIALIZING ENCOUNTER DUNGEON</p>
      </div>

      {/* Progress section */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
          <span>PROGRESS</span>
          {showPercentage && (
            <span className="retro text-[9px] text-[#f6c453] font-bold">
              {Math.round(displayProgress)}%
            </span>
          )}
        </div>
        <Progress value={displayProgress} variant="retro" className="h-4" />
      </div>

      {/* Tips box */}
      {tips.length > 0 && (
        <div className="w-full min-h-16 p-3 bg-[#0c1222]/80 border border-[#2d251e] shadow-[2px_2px_0_0_#000] flex items-center justify-center">
          <p className="retro text-[8px] sm:text-[9px] text-slate-300 leading-relaxed text-center">
            {tips[currentTipIndex]}
          </p>
        </div>
      )}
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div
        className={cn(
          "retro fixed inset-0 z-50 flex items-center justify-center bg-[#0B1020]/95 backdrop-blur-md",
          className
        )}
        {...props}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "retro w-full bg-[#0B1020] border-2 border-[#8c7a53] shadow-[3px_3px_0_0_#000]",
        className
      )}
      {...props}
    >
      {content}
    </div>
  );
}

export { LoadingScreen };
