"use client";

import React from "react";
import { Feature3 } from "@/components/ui/8bit";
import { FeatureType } from "../FeatureModal";

interface BrutstackFeaturesProps {
  onSelectFeature?: (feature: FeatureType) => void;
}

export function BrutstackFeatures({ onSelectFeature }: BrutstackFeaturesProps) {
  return (
    <section
      id="disciplines"
      className="w-full bg-[#161616] text-[#f9f4da] scroll-mt-20 border-t-2 border-black"
    >
      <Feature3
        badge="// BATTLETESTED BY ELITE DISCIPLINE GUILDS & ATHLETES"
        title="CORE DISCIPLINES & COMBAT SYSTEMS"
        description="A complete gamified toolkit transforming workouts, circadian habits, and cognitive focus into legendary RPG power."
        onSelectFeature={(key) => onSelectFeature?.(key as FeatureType)}
      />
    </section>
  );
}

export default BrutstackFeatures;
