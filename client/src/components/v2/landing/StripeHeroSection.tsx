"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Particles } from "./Particles";
import { MaskedHeading } from "./MaskedHeading";

interface StripeHeroSectionProps {
  onSelectTab?: (tab: "login" | "register") => void;
}

export function StripeHeroSection({ onSelectTab }: StripeHeroSectionProps) {
  const scrollToAuth = (tab: "login" | "register" = "register") => {
    if (onSelectTab) onSelectTab(tab);
    const el = document.getElementById("auth-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full shrink-0 pt-36 pb-20 md:pt-48 md:pb-28 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Interactive React Bits Particles Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-auto opacity-75"
        aria-hidden="true"
      >
        <Particles
          particleColors={["#06b6d4", "#38bdf8", "#818cf8", "#ffffff"]}
          particleCount={220}
          particleSpread={12}
          speed={0.12}
          particleBaseSize={110}
          moveParticlesOnHover={true}
          particleHoverFactor={1.2}
          alphaParticles={true}
          disableRotation={false}
          cameraDistance={20}
        />
      </div>

      {/* Subtle Radial Atmosphere Mask */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-950/20 blur-[140px] rounded-full pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* Foreground Hero Content */}
      <div className="relative flex flex-col items-center text-center gap-7 z-10 w-full pointer-events-none">
        {/* React Bits MaskedHeading as Semantic H1 Headline */}
        <div className="w-full max-w-4xl pointer-events-auto">
          <MaskedHeading
            text="Level Up Your Real Life Into An Epic RPG"
            tag="h1"
            mediaType="image"
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop"
            fillScale={1.35}
            parallax={32}
            drift={18}
            brightness={1.2}
            saturation={1.4}
            reveal="rise"
            duration={1.2}
            stagger={0.08}
            trigger="view"
            align="center"
            weight={800}
            tracking={-0.03}
            lineHeight={1.08}
            textScale={0.088}
            className="font-sans text-white drop-shadow-sm"
          />
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-300/90 leading-relaxed max-w-2xl font-normal pointer-events-auto">
          Transform daily discipline, 16-muscle gym workout recovery, and walking steps into tangible character attributes, dungeon raid exertion, and autonomous AI guidance.
        </p>

        {/* Action Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full sm:w-auto pointer-events-auto">
          {/* Primary CTA */}
          <Button
            type="button"
            onClick={() => scrollToAuth("register")}
            className="w-full sm:w-auto min-h-[48px] px-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold text-sm transition-all shadow-lg shadow-cyan-950/40 cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          {/* Secondary CTA: Sandbox Guest */}
          <Button
            type="button"
            variant="outline"
            onClick={() => scrollToAuth("login")}
            className="w-full sm:w-auto min-h-[48px] px-6 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border-zinc-700/80 rounded-xl transition-all cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm font-semibold"
          >
            <span>Explore Guest Sandbox</span>
          </Button>
        </div>

        {/* Tertiary Sign In Prompt */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-1 pointer-events-auto">
          <span>Already have an active Hunter license?</span>
          <button
            type="button"
            onClick={() => scrollToAuth("login")}
            className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-md outline-none px-1"
          >
            Sign In
          </button>
        </div>
      </div>
    </section>
  );
}
