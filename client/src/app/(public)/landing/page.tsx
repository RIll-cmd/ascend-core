"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BrutstackNavbar,
  BrutstackHero,
  BrutstackFeatures,
  BrutstackHowItWorks,
  BrutstackFAQ,
  BrutstackCTA,
  BrutstackFooter,
} from "@/components/v2/landing/brutstack";
import { Feature1 } from "@/components/ui/8bit";
import { FeatureModal, FeatureType } from "@/components/v2/landing/FeatureModal";
import { AuthSection } from "@/components/v2/landing/AuthSection";
import { AuthTabState } from "@/components/v2/auth/AuthCard";
import { useAuthStore } from "@/store/useAuthStore";

export default function LandingPage() {
  const router = useRouter();
  const [selectedFeature, setSelectedFeature] = useState<FeatureType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTabState>("login");

  const handleOpenFeature = (feature: string | FeatureType) => {
    setSelectedFeature(feature as FeatureType);
    setIsModalOpen(true);
  };

  const handleCloseFeature = () => {
    setIsModalOpen(false);
    setSelectedFeature(null);
  };

  const scrollToAuth = (tab: AuthTabState = "login") => {
    setAuthTab(tab);
    const el = document.getElementById("auth-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(tab === "register" ? "/register" : "/login");
    }
  };

  const scrollToCodex = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGuestAccess = async () => {
    try {
      await useAuthStore.getState().loginAsGuest();
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="relative flex min-h-screen w-full flex-col bg-[#1a1a1a] text-[#f9f4da] font-sans selection:bg-[#14b6e5] selection:text-black overflow-x-clip"
    >
      {/* 1. Header / Navbar with Ascend Core Identity */}
      <BrutstackNavbar
        onSignInClick={() => scrollToAuth("login")}
        onGetStartedClick={() => scrollToAuth("register")}
        onGuestClick={handleGuestAccess}
      />

      {/* 2. Hero Section with 8 Attribute Badges & Telemetry Terminal */}
      <BrutstackHero
        onStartBuilding={() => scrollToAuth("register")}
        onReadDocs={scrollToCodex}
        onGuestClick={handleGuestAccess}
      />

      {/* 3. 8-Bit Core Disciplines & Guild Features Grid (@8bitcn/feature1) */}
      <BrutstackFeatures onSelectFeature={handleOpenFeature} />

      {/* 4. The Reality-to-RPG Conversion Engine Simulator (@8bitcn/feature1) */}
      <div id="engine">
        <Feature1 onSelectFeature={handleOpenFeature} />
      </div>

      {/* 5. Solo Ascension Codex: 3-Phase Reality Pipeline */}
      <BrutstackHowItWorks />

      {/* 6. Hunter Intel & Frequently Asked Questions (FAQ) */}
      <BrutstackFAQ />

      {/* 10. Hunter Awakening Call To Action */}
      <BrutstackCTA
        onStartBuilding={() => scrollToAuth("register")}
        onScheduleDemo={scrollToCodex}
        onGuestClick={handleGuestAccess}
      />

      {/* 11. Command Deck Access Gateway with Galaxy WebGL Shader */}
      <div className="border-t-2 border-black bg-[#141414]">
        <AuthSection
          initialTab={authTab}
          onGuestEntry={handleGuestAccess}
        />
      </div>

      {/* 11. Ascend Core OS Footer & Subsystems Sitemap */}
      <BrutstackFooter />

      {/* Interactive Feature Deep-Dive Modal */}
      <FeatureModal
        feature={selectedFeature}
        isOpen={isModalOpen}
        onClose={handleCloseFeature}
      />
    </div>
  );
}
