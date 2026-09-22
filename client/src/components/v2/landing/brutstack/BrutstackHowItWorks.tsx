"use client";

import React from "react";
import {
  GraphicWorkoutsIcon,
  GraphicCraftingIcon,
  GraphicTowerIcon,
} from "@/components/ui/icons/SidebarGraphicIcons";

export function BrutstackHowItWorks() {
  const steps = [
    {
      num: "01",
      title: "LOG REALITY EFFORT",
      description:
        "Log heavy iron gym sets, habit chains, and sleep recovery.",
      color: "#14b6e5",
      icon: <GraphicWorkoutsIcon className="h-8 w-8" />,
    },
    {
      num: "02",
      title: "FORGE HUNTER ATTRIBUTES",
      description:
        "Your exertion scales 7 core attributes and unlocks forge blueprints.",
      color: "#fcba28",
      icon: <GraphicCraftingIcon className="h-8 w-8" />,
    },
    {
      num: "03",
      title: "CONQUER THE GAUNTLET",
      description:
        "Clear 20 Tower floors, hatch mythic companions, and raid bosses.",
      color: "#0ca95b",
      icon: <GraphicTowerIcon className="h-8 w-8" />,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="w-full overflow-hidden bg-[#1a1a1a] px-4 py-16 lg:px-12 lg:py-28 text-[#f9f4da]"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4">
        {/* Badge */}
        <span className="retro font-bold inline-flex items-center py-1.5 mb-2 bg-[#fcba28] px-3.5 text-[8px] sm:text-[9px] text-[#1a1a1a] uppercase border-2 border-black shadow-[2px_2px_0_0_#000]">
          Solo Ascension Codex
        </span>

        {/* Heading */}
        <h2 className="retro text-xl sm:text-2xl md:text-3xl font-bold text-center uppercase tracking-tight leading-snug">
          From Daily Sweat to
          <br />
          <span className="text-[#fcba28]">Dungeon Conquest</span>
        </h2>
        <p className="retro text-[9px] sm:text-[10px] mx-auto mb-14 max-w-lg text-center leading-relaxed text-neutral-400">
          Three steps from real-world effort to dungeon conquest.
        </p>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8 w-full">
          {/* Steps Timeline Column */}
          <div className="relative flex flex-col">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="relative z-10 mb-12 flex gap-6 last:mb-0 lg:gap-8"
              >
                {/* Connecting Line between steps */}
                {idx < steps.length - 1 && (
                  <div className="absolute top-18 bottom-[-3rem] left-8 w-0.5 bg-[#f9f4da]/40" />
                )}

                {/* Step Icon Box */}
                <div
                  className="relative mt-1 flex h-16 w-16 shrink-0 items-center justify-center border-2 border-black shadow-[4px_4px_0_0_#000]"
                  style={{ backgroundColor: step.color }}
                >
                  {step.icon}
                </div>

                {/* Step Text Info */}
                <div className="flex flex-col pt-1">
                  <p
                    className="retro mb-1.5 text-[8px] font-bold tracking-wider"
                    style={{ color: step.color }}
                  >
                    PHASE {step.num}
                  </p>
                  <h3 className="retro mb-2 text-xs sm:text-sm font-bold tracking-tight uppercase">
                    {step.title}
                  </h3>
                  <p className="retro text-[8px] sm:text-[9px] pr-4 leading-relaxed text-neutral-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Rainbow Staircase Illustration Column */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative border-2 border-black bg-[#141414] p-6 shadow-[8px_8px_0_0_#000] max-w-md w-full">
              <div className="flex items-center gap-2 border-b-2 border-black pb-4 mb-6">
                <span className="h-3 w-3 rounded-full bg-[#ff3333]" />
                <span className="h-3 w-3 rounded-full bg-[#fcba28]" />
                <span className="h-3 w-3 rounded-full bg-[#00ff88]" />
                <span className="retro text-[8px] sm:text-[9px] text-neutral-400 ml-2">
                  TOWER_ASCENSION_CHAMBER.SVG
                </span>
              </div>

              {/* Neobrutalist Rainbow Staircase Artwork SVG */}
              <svg viewBox="0 0 400 360" className="w-full h-auto drop-shadow-md">
                {/* Black space background with stars */}
                <rect width="400" height="360" fill="#0c0c0c" rx="4" />
                <circle cx="45" cy="60" r="1.5" fill="#f9f4da" opacity="0.6" />
                <circle cx="340" cy="80" r="2" fill="#fcba28" opacity="0.8" />
                <circle cx="80" cy="280" r="1.5" fill="#14b6e5" opacity="0.7" />
                <circle cx="360" cy="270" r="1.5" fill="#f9f4da" opacity="0.5" />
                <circle cx="190" cy="40" r="2.5" fill="#00ff88" opacity="0.7" />

                {/* Rainbow Arch Bands */}
                <path
                  d="M 50 330 A 150 150 0 0 1 350 330"
                  fill="none"
                  stroke="#ff3344"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M 64 330 A 136 136 0 0 1 336 330"
                  fill="none"
                  stroke="#fcba28"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M 78 330 A 122 122 0 0 1 322 330"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M 92 330 A 108 108 0 0 1 308 330"
                  fill="none"
                  stroke="#14b6e5"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M 106 330 A 94 94 0 0 1 294 330"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="14"
                  strokeLinecap="round"
                />

                {/* Perspective Stairs descending through the rainbow */}
                <g stroke="#000" strokeWidth="2">
                  <polygon points="175,190 225,190 235,210 165,210" fill="#f9f4da" />
                  <polygon points="165,210 235,210 248,235 152,235" fill="#e8e0be" />
                  <polygon points="152,235 248,235 264,265 136,265" fill="#f9f4da" />
                  <polygon points="136,265 264,265 284,300 116,300" fill="#e8e0be" />
                  <polygon points="116,300 284,300 306,340 94,340" fill="#f9f4da" />
                </g>

                {/* Shading facets for staircase */}
                <polygon points="175,190 165,210 165,210 175,190" fill="#141414" />
                <polygon points="165,210 152,235 152,235 165,210" fill="#141414" />
                <polygon points="152,235 136,265 136,265 152,235" fill="#141414" />
                <polygon points="136,265 116,300 116,300 136,265" fill="#141414" />
                <polygon points="116,300 94,340 94,340 116,300" fill="#141414" />

                {/* Glowing neon stars */}
                <polygon
                  points="200,85 204,97 216,97 206,105 210,117 200,109 190,117 194,105 184,97 196,97"
                  fill="#ffd600"
                  stroke="#000"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
