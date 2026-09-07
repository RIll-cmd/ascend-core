"use client";

import { useEffect, useState } from "react";
import { useWorkoutStore } from "../store/useWorkoutStore";
import { X, Clock, Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";

export function RestTimer() {
  const { restTimerEnd, clearRestTimer, startRestTimer } = useWorkoutStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!restTimerEnd) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((restTimerEnd - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        playBuffSFX("speed");
        clearRestTimer();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [restTimerEnd, clearRestTimer]);

  if (!restTimerEnd && timeLeft === 0) {
    return null;
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#140e0c] text-white p-4 border-4 border-[#5c4033] flex flex-col items-center gap-3 animate-in slide-in-from-bottom-5 w-80 select-none"
      style={{
        boxShadow: "0 0 0 2px #261914, 0 10px 0 0 #0d0807, 0 16px 24px rgba(0,0,0,0.8)",
      }}
    >
      {/* Iron Corner Studs */}
      <span className="absolute top-1 left-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
      <span className="absolute top-1 right-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
      <span className="absolute bottom-1 left-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>
      <span className="absolute bottom-1 right-1 font-mono text-[9px] text-[#5c4033] leading-none select-none pointer-events-none">+</span>

      {/* Top Header */}
      <div className="flex items-center gap-3 w-full justify-between border-b-2 border-[#2c1e19] pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#261914] border-2 border-[#5c4033] flex items-center justify-center text-[#f59e0b] shadow-sm">
            <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <span className="font-pixel text-[8.5px] text-[#f59e0b] uppercase tracking-wider block font-bold">
              GLADIATOR REST
            </span>
            <span className="font-pixel text-xl font-black text-white tabular-nums">
              {mins}:{secs.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            playUIMenuSFX("decline");
            clearRestTimer();
          }}
          className="w-7 h-7 bg-[#261914] border-2 border-[#4a3830] hover:border-[#ef4444] text-stone-400 hover:text-[#ef4444] flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Controls */}
      <div className="grid grid-cols-3 gap-2 w-full pt-1">
        <button
          onClick={() => {
            playUIMenuSFX("confirm");
            startRestTimer(30);
          }}
          className="h-8 bg-[#261914] border-2 border-[#5c4033] hover:border-[#f59e0b] text-[#f59e0b] font-pixel text-[10px] font-bold cursor-pointer active:translate-y-0.5"
          style={{
            boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.1), inset -1px -1px 0 rgba(0,0,0,0.5)",
          }}
        >
          +30S
        </button>
        <button
          onClick={() => {
            playUIMenuSFX("confirm");
            startRestTimer(60);
          }}
          className="h-8 bg-[#261914] border-2 border-[#5c4033] hover:border-[#f59e0b] text-[#f59e0b] font-pixel text-[10px] font-bold cursor-pointer active:translate-y-0.5"
          style={{
            boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.1), inset -1px -1px 0 rgba(0,0,0,0.5)",
          }}
        >
          +60S
        </button>
        <button
          onClick={() => {
            playUIMenuSFX("confirm");
            clearRestTimer();
          }}
          className="h-8 bg-[#b91c1c] border-2 border-[#ef4444] hover:bg-[#dc2626] text-white font-pixel text-[10px] font-bold cursor-pointer active:translate-y-0.5"
          style={{
            boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.25), inset -1px -1px 0 rgba(0,0,0,0.6)",
          }}
        >
          SKIP
        </button>
      </div>
    </div>
  );
}

