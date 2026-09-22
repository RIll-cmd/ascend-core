"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface BrutstackCTAProps {
  onStartBuilding?: () => void;
  onScheduleDemo?: () => void;
  onGuestClick?: () => void;
}

export function BrutstackCTA({
  onStartBuilding,
  onScheduleDemo,
  onGuestClick,
}: BrutstackCTAProps) {
  return (
    <section className="w-full bg-[#1a1a1a] px-4 py-16 lg:px-12 lg:py-28 text-[#f9f4da]">
      <div className="mx-auto min-h-[34rem] max-w-6xl">
        <div className="relative flex h-full min-h-[34rem] overflow-hidden border-2 border-black bg-[#141414] shadow-[8px_8px_0_0_#000]">
          <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[9rem_1fr_9rem]">
            {/* Left Decorative Shape Column (Desktop) */}
            <div className="hidden h-full w-36 lg:grid lg:grid-rows-4 border-r-2 border-black bg-[#0d0d0d]">
              {/* Shape 01: 8-point starburst */}
              <div className="flex items-center justify-center border-b-2 border-black p-4">
                <svg className="h-14 w-14 text-[#fcba28]" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" />
                </svg>
              </div>
              {/* Shape 02: Stepped Chevron Diamond */}
              <div className="flex items-center justify-center border-b-2 border-black p-4">
                <svg className="h-14 w-14 text-[#14b6e5]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
                  <polygon points="50,10 90,50 50,90 10,50" />
                  <polygon points="50,30 70,50 50,70 30,50" fill="currentColor" />
                </svg>
              </div>
              {/* Shape 03: Sunburst / Gear */}
              <div className="flex items-center justify-center border-b-2 border-black p-4">
                <svg className="h-14 w-14 text-[#ff3344]" viewBox="0 0 100 100" fill="currentColor">
                  <circle cx="50" cy="50" r="22" fill="#141414" stroke="currentColor" strokeWidth="8" />
                  <rect x="44" y="5" width="12" height="20" rx="3" />
                  <rect x="44" y="75" width="12" height="20" rx="3" />
                  <rect x="5" y="44" width="20" height="12" rx="3" />
                  <rect x="75" y="44" width="20" height="12" rx="3" />
                </svg>
              </div>
              {/* Shape 04: Retro clover blossom */}
              <div className="flex items-center justify-center p-4">
                <svg className="h-14 w-14 text-[#22c55e]" viewBox="0 0 100 100" fill="currentColor">
                  <circle cx="35" cy="35" r="22" />
                  <circle cx="65" cy="35" r="22" />
                  <circle cx="35" cy="65" r="22" />
                  <circle cx="65" cy="65" r="22" />
                  <circle cx="50" cy="50" r="12" fill="#141414" />
                </svg>
              </div>
            </div>

            {/* Center Content Column */}
            <div className="relative flex flex-col items-center justify-start overflow-hidden px-6 py-14 lg:py-20 text-center">
              <div className="retro mb-4 inline-flex items-center gap-2 border-2 border-black bg-[#ff3344] px-3.5 py-1 text-[8px] sm:text-[9px] font-black text-black uppercase tracking-widest shadow-[2px_2px_0_0_#000]">
                {"// THE ASCENSION GATEWAY"}
              </div>
              <h2 className="retro text-2xl sm:text-3xl lg:text-4xl font-black mb-8 tracking-tight uppercase leading-[1.2]">
                READY TO AWAKEN
                <br />
                <span className="text-[#c084fc]">YOUR HUNTER?</span>
              </h2>

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={onStartBuilding}
                  className="retro cursor-pointer flex items-center justify-center gap-2 border-2 border-black bg-[#14b6e5] hover:bg-[#00bfc2] px-5 lg:px-7 py-3.5 text-[9px] sm:text-[10px] font-black tracking-widest text-black uppercase transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5 shadow-[4px_4px_0_0_#000]"
                >
                  START ASCENSION FREE
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onGuestClick}
                  className="retro cursor-pointer flex items-center justify-center border-2 border-[#14b6e5] bg-neutral-900/90 hover:bg-neutral-800 px-5 lg:px-7 py-3.5 text-[9px] sm:text-[10px] font-black tracking-widest text-[#14b6e5] uppercase transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5 shadow-[4px_4px_0_0_#000]"
                >
                  ENTER AS GUEST
                </button>
                <button
                  type="button"
                  onClick={onScheduleDemo}
                  className="retro cursor-pointer flex items-center justify-center border-2 border-[#f9f4da] bg-transparent hover:bg-neutral-800 px-5 lg:px-7 py-3.5 text-[9px] sm:text-[10px] font-black tracking-widest text-[#f9f4da] uppercase transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5"
                >
                  EXPLORE HUNTER CODEX
                </button>
              </div>

              {/* Bottom Centered Rainbow Staircase Art */}
              <div className="pointer-events-none absolute right-0 -bottom-10 left-0 flex justify-center opacity-85">
                <svg viewBox="0 0 360 140" className="h-auto w-80 md:w-96">
                  {/* Outer arch layers */}
                  <path
                    d="M 20 140 A 160 160 0 0 1 340 140"
                    fill="none"
                    stroke="#ff3344"
                    strokeWidth="10"
                  />
                  <path
                    d="M 32 140 A 148 148 0 0 1 328 140"
                    fill="none"
                    stroke="#fcba28"
                    strokeWidth="10"
                  />
                  <path
                    d="M 44 140 A 136 136 0 0 1 316 140"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="10"
                  />
                  <path
                    d="M 56 140 A 124 124 0 0 1 304 140"
                    fill="none"
                    stroke="#14b6e5"
                    strokeWidth="10"
                  />
                  <path
                    d="M 68 140 A 112 112 0 0 1 292 140"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="10"
                  />

                  {/* Staircase Steps */}
                  <g stroke="#000" strokeWidth="2">
                    <polygon points="160,80 200,80 210,95 150,95" fill="#f9f4da" />
                    <polygon points="150,95 210,95 222,112 138,112" fill="#e8e0be" />
                    <polygon points="138,112 222,112 236,132 124,132" fill="#f9f4da" />
                    <polygon points="124,132 236,132 250,140 110,140" fill="#e8e0be" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Right Decorative Shape Column (Desktop) */}
            <div className="hidden h-full w-36 lg:grid lg:grid-rows-4 border-l-2 border-black bg-[#0d0d0d]">
              {/* Shape 05: Nested Diamonds */}
              <div className="flex items-center justify-center border-b-2 border-black p-4">
                <svg className="h-14 w-14 text-[#c084fc]" viewBox="0 0 100 100" fill="currentColor">
                  <polygon points="50,5 95,50 50,95 5,50" />
                  <polygon points="50,22 78,50 50,78 22,50" fill="#141414" />
                  <polygon points="50,35 65,50 50,65 35,50" fill="currentColor" />
                </svg>
              </div>
              {/* Shape 06: Isometric Cube */}
              <div className="flex items-center justify-center border-b-2 border-black p-4">
                <svg className="h-14 w-14" viewBox="0 0 100 100" stroke="#000" strokeWidth="3">
                  <polygon points="50,15 85,35 50,55 15,35" fill="#ffd600" />
                  <polygon points="15,35 50,55 50,95 15,75" fill="#fcba28" />
                  <polygon points="85,35 50,55 50,95 85,75" fill="#e69500" />
                </svg>
              </div>
              {/* Shape 07: Diagonal Cross / Hashtag */}
              <div className="flex items-center justify-center border-b-2 border-black p-4">
                <svg className="h-14 w-14 text-[#38bdf8]" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M38 10 h10 v80 h-10 Z" />
                  <path d="M52 10 h10 v80 h-10 Z" />
                  <path d="M10 38 h80 v10 h-80 Z" />
                  <path d="M10 52 h80 v10 h-80 Z" />
                </svg>
              </div>
              {/* Shape 08: Hypnotic concentric arch */}
              <div className="flex items-center justify-center p-4">
                <svg className="h-14 w-14 text-[#ff3333]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
                  <circle cx="50" cy="50" r="40" />
                  <circle cx="50" cy="50" r="24" />
                  <circle cx="50" cy="50" r="8" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
