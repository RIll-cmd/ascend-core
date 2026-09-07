"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiraAvatar, AiraMood } from "@/components/ui/AiraAvatar";
import { useAiraStore } from "../store";
import { Sparkles, X } from "lucide-react";

export function AiraPeriodicToast() {
  const { activePeriodicToast, dismissPeriodicToast, currentMood } = useAiraStore();

  useEffect(() => {
    if (!activePeriodicToast) return;

    // Auto-dismiss toast after 9 seconds
    const timer = setTimeout(() => {
      dismissPeriodicToast();
    }, 9000);

    return () => clearTimeout(timer);
  }, [activePeriodicToast, dismissPeriodicToast]);

  return (
    <AnimatePresence>
      {activePeriodicToast && (
        <motion.div
          key={activePeriodicToast.id}
          initial={{ opacity: 0, scale: 0.85, y: -20, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.85, y: -20, filter: "blur(6px)" }}
          style={{ transformOrigin: "top right" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-16 sm:top-20 right-3 sm:right-6 z-50 max-w-md w-[calc(100vw-24px)] sm:w-full font-mono select-none"
        >
          <div
            onClick={dismissPeriodicToast}
            className="bg-[#0B1020]/95 border-2 border-cyan-500/40 rounded-xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden group cursor-pointer hover:border-cyan-400/80 transition-all flex items-start gap-3.5"
          >
            {/* Background Holographic Ambient Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />

            {/* Glowing Orb Avatar */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden ring-2 ring-cyan-500/50 shadow-md shadow-cyan-950/80 bg-slate-900 relative mt-0.5">
              <AiraAvatar mood={currentMood as AiraMood} className="w-full h-full rounded-none border-none shadow-none" />
            </div>

            {/* Content Container */}
            <div className="flex-1 min-w-0 pr-4">
              {/* Category Pill Tag */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-white font-pixel">
                  AIRA // {activePeriodicToast.category}
                </span>
              </div>

              {/* Status Message Text */}
              <p className="text-xs sm:text-sm text-white font-sans leading-relaxed font-medium">
                {activePeriodicToast.text}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissPeriodicToast();
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
