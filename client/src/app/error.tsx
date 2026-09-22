"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for diagnostics with PII stripped
    console.error("[Ascend OS Runtime Anomaly]:", error.message, error.digest);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#0B1020] text-slate-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md flex flex-col items-center gap-6">
        {/* Error icon badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-[28px] bg-[#151C33] border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-950/50">
            <AlertOctagon className="w-10 h-10 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600/40 border border-rose-400/50 flex items-center justify-center text-rose-300 text-[10px] font-mono font-bold">
            !
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black font-heading text-white tracking-tight">
            SYSTEM ANOMALY DETECTED
          </h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-sm">
            An unexpected runtime interrupt occurred within the neural telemetry pipeline.
          </p>
        </div>

        {/* Digest error info */}
        <div className="p-3.5 rounded-[14px] bg-[#151C33]/80 border border-white/10 text-xs text-slate-400 font-mono flex flex-col items-center gap-1 max-w-sm w-full">
          <div className="text-slate-500 text-[10px]">DIAGNOSTIC REFERENCE</div>
          <span className="text-rose-300 truncate max-w-full">
            {error.digest ? `ID: ${error.digest}` : error.message || "UNIDENTIFIED_RUNTIME_FAULT"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 h-11 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Re-calibrate (Try Again)</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="w-full sm:w-auto px-6 h-11 text-xs font-bold border-white/10 hover:bg-white/5 text-slate-300 flex items-center gap-2"
          >
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
