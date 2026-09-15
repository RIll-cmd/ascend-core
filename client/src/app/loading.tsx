import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen w-full bg-[#0B1020] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none font-sans">
      {/* BACKGROUND AMBIENT GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* CENTERED PULSING LOGO */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-[22px] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/50 animate-pulse">
            <Sparkles className="w-9 h-9" />
          </div>
          <div className="absolute -inset-2 bg-blue-500/20 rounded-[28px] blur-md -z-10 animate-pulse" />
        </div>

        <div>
          <h1 className="text-xl font-bold font-heading text-white tracking-widest">
            ASCEND OS
          </h1>
          <p className="text-xs text-blue-400 font-mono mt-0.5 tracking-wider">
            LIFE RPG PLATFORM
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-4">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span>Initializing System Engine...</span>
        </div>
      </div>
    </div>
  );
}
