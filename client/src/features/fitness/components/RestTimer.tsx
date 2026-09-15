import React, { useEffect, useState } from "react";
import { Timer, Play, Pause, X, Bell, Plus, Minus } from "lucide-react";
import { useFitnessStore } from "../store/useFitnessStore";

export const RestTimer: React.FC = () => {
  const {
    restTimerSeconds,
    restTimerInitial,
    isRestTimerActive,
    restTimerCompletedBanner,
    startRestTimer,
    tickRestTimer,
    cancelRestTimer,
    dismissRestBanner,
  } = useFitnessStore();

  const [isPaused, setIsPaused] = useState(false);
  const [customInput, setCustomInput] = useState<string>("60");
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Interval timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRestTimerActive && !isPaused) {
      interval = setInterval(() => {
        tickRestTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestTimerActive, isPaused, tickRestTimer]);

  const PRESETS = [30, 60, 90, 120];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  const progressPercentage =
    restTimerSeconds !== null && restTimerInitial > 0
      ? Math.max(0, Math.min(100, (restTimerSeconds / restTimerInitial) * 100))
      : 0;

  return (
    <>
      {/* Rest Completed Notification Banner */}
      {restTimerCompletedBanner && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-cyan-950 border-2 border-cyan-400 text-cyan-100 px-6 py-4 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.5)] flex items-center gap-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-300">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-bold">
                SYSTEM NOTIFICATION
              </div>
              <div className="text-lg font-bold text-white">
                Rest Complete. Next Set Ready.
              </div>
            </div>
            <button
              onClick={dismissRestBanner}
              className="ml-4 p-1.5 hover:bg-cyan-800/50 rounded-lg transition-colors text-cyan-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Gamified Rest Timer Widget */}
      {isRestTimerActive && restTimerSeconds !== null && (
        <div className="fixed bottom-6 right-6 z-40 w-80 bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] text-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                Rest Period
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-cyan-300 transition-colors"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={cancelRestTimer}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                title="Cancel Timer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Countdown Display & Ring Progress */}
          <div className="flex items-center justify-between my-3 px-2">
            <div className="text-3xl font-mono font-black tracking-tight text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              {formatTime(restTimerSeconds)}
            </div>

            {/* Quick Adjust Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => startRestTimer(Math.max(10, restTimerSeconds - 15))}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs font-mono"
                title="-15 sec"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => startRestTimer(restTimerSeconds + 15)}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs font-mono"
                title="+15 sec"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Quick Presets Bar */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-800">
            {PRESETS.map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setIsPaused(false);
                  startRestTimer(sec);
                }}
                className={`px-2 py-1 text-xs font-mono rounded-lg border transition-all ${
                  restTimerInitial === sec
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {sec}s
              </button>
            ))}
            <button
              onClick={() => setShowCustomModal(!showCustomModal)}
              className="px-2 py-1 text-xs font-mono rounded-lg border border-slate-700 bg-slate-800/60 text-slate-400 hover:text-cyan-300"
            >
              Custom
            </button>
          </div>

          {/* Custom Time Prompt */}
          {showCustomModal && (
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="600"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                placeholder="Secs"
              />
              <button
                onClick={() => {
                  const val = parseInt(customInput, 10);
                  if (!isNaN(val) && val > 0) {
                    setIsPaused(false);
                    startRestTimer(val);
                    setShowCustomModal(false);
                  }
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs px-3 py-1 rounded-lg transition-colors"
              >
                Set
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
