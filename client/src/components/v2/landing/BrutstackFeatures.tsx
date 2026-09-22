"use client";

import React, { useState } from "react";
import {
  Flame,
  Dumbbell,
  Egg,
  Shield,
  Crown,
  Users,
  Brain,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { FeatureModal, FeatureType } from "./FeatureModal";

interface BrutstackCardItem {
  key: FeatureType;
  title: string;
  description: string;
  accentColor: string;
  icon: React.ElementType;
}

const ROW_ONE_CARDS: BrutstackCardItem[] = [
  {
    key: "habits",
    title: "NEURAL HABIT MATRIX & STREAKS",
    description:
      "Multi-tiered Bronze, Silver, and Gold completion thresholds. Protect consistency chains with streak freeze shields.",
    accentColor: "#ff3344", // Vivid Coral Red
    icon: Flame,
  },
  {
    key: "workouts",
    title: "HEAVY IRON GYM & VOLUME TRACKING",
    description:
      "Calculate RPE, 1RM progression, and total tonnage per muscle group. Log sets in real time with auto rest timers.",
    accentColor: "#22c55e", // Vibrant Green
    icon: Dumbbell,
  },
  {
    key: "nutrition",
    title: "MACRO NUTRITION & BIO-FUEL",
    description:
      "Precision target tracking for protein, carbs, fats, and water intake. Automatically scale caloric surplus or deficit.",
    accentColor: "#a855f7", // Neon Purple
    icon: Egg,
  },
  {
    key: "combat",
    title: "REAL-TIME RPG COMBAT RATING",
    description:
      "Every workout logged and habit checked directly scales your Hunter combat power, strength stats, and raid rank.",
    accentColor: "#38bdf8", // Sky Cyan
    icon: Shield,
  },
];

const ROW_TWO_CARDS: BrutstackCardItem[] = [
  {
    key: "leveling",
    title: "SOLO LEVELING & HUNTER AWAKENING",
    description:
      "Advance from E-Rank initiate to S-Rank Monarch. Unlock legendary aura cosmetics, titles, and stat bonuses.",
    accentColor: "#fcba28", // Golden Yellow
    icon: Crown,
  },
  {
    key: "raids",
    title: "GUILD RAIDS & DUNGEON BOSSES",
    description:
      "Form discipline syndicates with comrades. Pool your weekly habit multipliers to slay colossal world raid bosses.",
    accentColor: "#ec4899", // Hot Pink
    icon: Users,
  },
  {
    key: "aira",
    title: "AIRA AI DISCIPLINE CO-PILOT",
    description:
      "Adaptive AI analysis of your circadian habits and fatigue curves. Receive proactive motivation and schedule adjustments.",
    accentColor: "#f97316", // Bright Orange
    icon: Brain,
  },
  {
    key: "recovery",
    title: "DISCIPLINE VAULT & RECOVERY GUARDS",
    description:
      "Track sleep debt, HRV scores, and nervous system recovery. Automatically trigger rest days to prevent burnout.",
    accentColor: "#10b981", // Emerald Mint
    icon: Activity,
  },
];

interface BrutstackCardProps {
  card: BrutstackCardItem;
  onSelect: (key: FeatureType) => void;
}

function BrutstackCard({ card, onSelect }: BrutstackCardProps) {
  const Icon = card.icon;

  return (
    <div className="h-full w-full transition-transform duration-300 ease-in-out hover:-translate-x-4.5 hover:-translate-y-4.5 focus-within:-translate-x-4.5 focus-within:-translate-y-4.5 hover:z-30 focus-within:z-30 overflow-visible">
      <button
        type="button"
        onClick={() => onSelect(card.key)}
        className="group relative flex h-full w-full max-w-none transform-gpu transition-transform duration-300 ease-in-out cursor-pointer text-left outline-none"
        aria-label={`Inspect ${card.title}`}
      >
        {/* Layer 0: Accent Color Back Layer */}
        <div
          className="pointer-events-none absolute inset-0 z-0 border-2 border-black transform-gpu transition-transform duration-300 ease-in-out ease-out group-hover:translate-x-4.5 group-hover:translate-y-4.5 group-focus-visible:translate-x-4.5 group-focus-visible:translate-y-4.5"
          style={{ backgroundColor: card.accentColor }}
        />

        {/* Layer 1: Vintage Cream Middle Layer */}
        <div className="pointer-events-none absolute inset-0 z-10 border-2 border-black bg-[#f9f4da] transform-gpu transition-transform duration-300 ease-in-out group-hover:translate-x-2 group-hover:translate-y-2 group-focus-visible:translate-x-2 group-focus-visible:translate-y-2" />

        {/* Layer 2: Front Main Dark Card Layer */}
        <div className="inline-block relative z-20 h-full w-full border-2 border-black bg-[#1a1a1a] p-0 shadow-none transform-gpu transition-transform duration-300 ease-in-out hover:shadow-none group-focus-visible:ring-2 group-focus-visible:ring-white">
          <div className="flex h-full flex-col justify-between p-6 lg:p-7">
            <div>
              {/* Icon Box with solid color and 2px border */}
              <div className="flex items-center justify-between mb-4 lg:mb-8">
                <div
                  className="flex size-10 items-center justify-center border-2 border-black lg:size-14"
                  style={{ backgroundColor: card.accentColor }}
                >
                  <Icon
                    className="h-6 w-6 text-black"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </div>

                <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-black bg-[#f9f4da] text-[#1a1a1a] font-mono text-[10px] font-bold uppercase tracking-wider opacity-90 group-hover:opacity-100 transition-opacity">
                  <span>EXPAND</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Title */}
              <h3 className="mb-2 font-sans text-base font-bold wrap-break-word uppercase text-white tracking-tight">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-sm lg:text-base leading-relaxed wrap-break-word whitespace-pre-line text-[#f9f4da]">
                {card.description}
              </p>
            </div>

            {/* Bottom Accent Bar */}
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="uppercase">SYSTEM PILLAR</span>
              <span
                className="w-2 h-2 rounded-full border border-black"
                style={{ backgroundColor: card.accentColor }}
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

export function BrutstackFeatures() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureType>(null);

  return (
    <section
      id="features"
      className="w-full space-y-16 bg-[#1a1a1a] px-4 py-16 lg:px-12 lg:py-28 text-white relative z-20"
      aria-labelledby="features-heading"
    >
      {/* Interactive Modal Dialog for Feature Details */}
      <FeatureModal
        feature={selectedFeature}
        isOpen={selectedFeature !== null}
        onClose={() => setSelectedFeature(null)}
      />

      {/* Section Header */}
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 text-center">
        <span className="font-semibold rounded inline-flex items-center py-2 mb-2 bg-[#14b6e5] px-4 text-sm text-[#1a1a1a] uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          Features
        </span>

        <h2
          id="features-heading"
          className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white"
        >
          Everything you need to
          <br />
          <span className="text-[#14b6e5]">forge unbreakable discipline</span>
        </h2>

        <p className="font-sans max-w-lg text-center text-base sm:text-lg leading-relaxed text-neutral-400">
          A complete operating system for habit mastery, heavy iron training, and bio-fuel optimization. Click any pillar to inspect system mechanics.
        </p>
      </div>

      {/* Main Grid: 2 Rows as extracted from Neobrutalism Brutstack */}
      <div className="mx-auto flex max-w-6xl flex-col gap-16 overflow-visible">
        {/* Row 1: 4 Cards in flex-1 basis-0 strip */}
        <div className="flex flex-col md:flex-row h-min items-stretch -space-y-0.5 md:-space-y-0 md:-space-x-0.5 overflow-visible">
          {ROW_ONE_CARDS.map((card) => (
            <div key={card.key} className="flex-1 basis-0">
              <BrutstackCard card={card} onSelect={setSelectedFeature} />
            </div>
          ))}
        </div>

        {/* Row 2: 4 Cards in 2x2 grid */}
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-stretch -space-y-0.5 md:-space-y-0.5 -space-x-0.5 overflow-visible">
          {ROW_TWO_CARDS.map((card) => (
            <div key={card.key} className="w-full md:w-1/2 p-0">
              <BrutstackCard card={card} onSelect={setSelectedFeature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
