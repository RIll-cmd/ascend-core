"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiraAvatar, AiraMood } from "@/components/ui/AiraAvatar";
import { useAiraStore } from "../store";
import { X } from "lucide-react";

export function AiraPeriodicToast() {
  const { activePeriodicToast, dismissPeriodicToast, currentMood } = useAiraStore();

  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      (window as any).triggerAiraToast = (text?: string, cat?: string, mood?: string) => {
        useAiraStore.getState().showPeriodicToast(
          text || "Master, there is a sale online. Can you please buy me another stick of memory to upgrade my processing, or an HD camera to improve my scanning capabilities?",
          cat || "SYSTEM UPGRADE",
          mood || "HAPPY"
        );
      };
      (window as any).getAiraState = () => useAiraStore.getState();
    }
  }, []);

  useEffect(() => {
    if (!activePeriodicToast) return;

    // Auto-dismiss toast after 18 seconds
    const timer = setTimeout(() => {
      dismissPeriodicToast();
    }, 18000);

    return () => clearTimeout(timer);
  }, [activePeriodicToast, dismissPeriodicToast]);

  return (
    <AnimatePresence>
      {activePeriodicToast && (
        <motion.div
          key={activePeriodicToast.id}
          initial={{ opacity: 0, scale: 0.9, y: -20, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, y: -20, filter: "blur(6px)" }}
          style={{ transformOrigin: "top right" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-16 sm:top-20 right-4 sm:right-8 z-50 max-w-lg sm:max-w-xl w-[calc(100vw-32px)] sm:w-full select-none"
        >
          <div className="relative pt-8 pl-8">
            {/* Fairy Eye Avatar with Crisp White Ring & Concentric Blue Reticle centered at (0,0) of Dialogue Box */}
            <div className="absolute top-8 left-8 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none">
              <div className="relative w-[60px] h-[60px] sm:w-[66px] sm:h-[66px] rounded-full bg-[#08090d] border-[2.5px] border-white shadow-[0_6px_24px_rgba(0,0,0,0.9)] flex items-center justify-center">
                {/* Concentric Electric Blue Reticle Ring with 4 Directional Notches */}
                <div className="absolute inset-[3px] rounded-full border-[1.5px] border-[#2563eb] shadow-[0_0_8px_rgba(37,99,235,0.7)] pointer-events-none z-10">
                  {/* 12 o'clock notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1px] w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-[#38bdf8]" />
                  {/* 6 o'clock notch */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[1px] w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] border-b-[#38bdf8]" />
                  {/* 9 o'clock notch */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[1px] w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] border-l-[#38bdf8]" />
                  {/* 3 o'clock notch */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[1px] w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[4px] border-r-[#38bdf8]" />
                </div>

                {/* Animated Fairy Eye Avatar */}
                <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center p-0.5">
                  <AiraAvatar
                    mood={currentMood as AiraMood}
                    className="w-full h-full rounded-full border-none shadow-none scale-110"
                  />
                </div>

                {/* Speech Bubble Beak pointer at 4:30 o'clock */}
                <div className="absolute -right-[10px] top-[29px] sm:top-[32px] pointer-events-none">
                  <svg className="w-3.5 h-4.5" viewBox="0 0 14 18" fill="none">
                    <path d="M0 0 L12 5 L0 15 Z" fill="#08090d" />
                    <path
                      d="M0 0 L12 5 L0 15"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* ZZZ Dialogue Speech Bubble Box */}
            <div
              onClick={dismissPeriodicToast}
              className="relative rounded-[22px] border-[2.5px] border-white bg-[#08090d] text-white shadow-[0_16px_48px_rgba(0,0,0,0.95)] backdrop-blur-xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-12 sm:pr-14 min-h-[68px] flex items-center cursor-pointer group hover:border-[#f1f5f9] transition-all"
            >
              {/* Dialogue Text */}
              <div className="flex-1 min-w-0 py-0.5">
                <p className="font-sans font-bold text-white text-[14px] sm:text-[15.5px] leading-[1.4] tracking-normal antialiased">
                  {activePeriodicToast.text}
                </p>
              </div>

              {/* Bottom-Right Dual Chevron Continue Indicator (» in ZZZ Dialogue) */}
              <div className="absolute bottom-2.5 right-3.5 sm:right-4 flex items-center pointer-events-none">
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                  className="flex items-center"
                >
                  <svg className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 2.5L8.5 8L3 13.5"
                      stroke="#ffffff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.5 2.5L14 8L8.5 13.5"
                      stroke="#ffffff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Discreet Dismiss Button on Hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissPeriodicToast();
                }}
                className="absolute top-2 right-2 text-white/30 hover:text-white transition-opacity p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
