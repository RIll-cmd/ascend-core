"use client";

import React, { useState } from "react";
import {
  LandingNavbar,
  StripeHeroSection,
  MetricsMarquee,
  BrutstackFeatures,
  AuthSection,
  LandingFooter,
} from "@/components/v2/landing";
import { AuthTabState } from "@/components/v2/auth/AuthCard";

export default function LandingPage() {
  const [selectedAuthTab, setSelectedAuthTab] = useState<AuthTabState>("register");

  const handleNavigateToAuth = (tab: AuthTabState) => {
    setSelectedAuthTab(tab);
    const el = document.getElementById("auth-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="relative w-full min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-cyan-950"
    >
      {/* 1. Stripe-Style Navbar with Sign In & Launch CTA */}
      <LandingNavbar
        onSignInClick={() => handleNavigateToAuth("login")}
        onGetStartedClick={() => handleNavigateToAuth("register")}
      />

      {/* 2. Stripe-Style Hero with MaskedHeading + Interactive Particles Canvas */}
      <StripeHeroSection onSelectTab={(tab) => setSelectedAuthTab(tab)} />

      {/* 3. Horizontal Magic UI Telemetry Marquee with Peer Greyscale Dimming */}
      <MetricsMarquee />

      {/* 4. Extracted Neobrutalism Brutstack Feature Grid with 3D Stack Mechanics */}
      <BrutstackFeatures />

      {/* 5. Centered Floating Auth Card Portal over Galaxy WebGL Shader */}
      <AuthSection initialTab={selectedAuthTab} />

      {/* 6. System Telemetry Footer */}
      <LandingFooter />
    </div>
  );
}
