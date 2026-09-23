"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import {
  AlertSteppedBorderDecorations,
  ButtonBorderDecorations,
} from "@/components/ui/8bit/retro-borders";

export const CONSENT_STORAGE_KEY = "ascend_cookie_consent";

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        // Small delay for smooth entry after hydration
        const timer = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const handleSaveConsent = (analyticsAllowed: boolean) => {
    try {
      const prefs: CookiePreferences = {
        essential: true,
        analytics: analyticsAllowed,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {/* Authentic @8bitcn Alert Themed Box Frame: Black Background with White Pixel Border */}
      <div className="relative p-5 bg-black text-white shadow-[6px_6px_0_0_#000] border border-white/20">
        {/* Authentic @8bitcn/alert Stepped Pixel Border Layers in Pure White */}
        <AlertSteppedBorderDecorations colorClass="bg-white" />

        <div className="relative z-10 flex items-start gap-3.5">
          {/* 8-bit Pixelated Cookie Icon Badge */}
          <div className="relative w-10 h-10 bg-black border-2 border-white flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0_0_#000]">
            <Cookie className="w-5 h-5 text-white" />
            <span className="absolute -top-1 left-1.5 right-1.5 h-0.5 bg-white pointer-events-none" />
            <span className="absolute -bottom-1 left-1.5 right-1.5 h-0.5 bg-white pointer-events-none" />
          </div>

          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-bold text-white font-heading text-sm">
                Privacy & Cookie Protocol
              </span>
              <button
                type="button"
                onClick={() => handleSaveConsent(false)}
                className="p-1 border border-white/30 bg-black text-zinc-400 hover:text-white hover:border-white active:translate-y-[1px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Dismiss cookie notice with essential cookies only"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-zinc-300 leading-relaxed font-sans mb-3 text-xs">
              We employ strictly essential session cookies to authenticate your hunter profile and optional telemetry to improve platform stability. Zero third-party ad tracking.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-300 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                Inspect Full Privacy Policy
              </Link>
            </div>

            {/* 8bitcn Stepped Action Buttons in High-Contrast White Theme */}
            <div className="flex items-center gap-4 sm:gap-5 pt-1">
              <button
                type="button"
                onClick={() => handleSaveConsent(true)}
                className="relative flex-1 h-9 px-4 text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-colors active:translate-y-[1px] shadow-[2px_2px_0_0_#000] font-sans flex items-center justify-center cursor-pointer select-none"
              >
                Accept All
                <ButtonBorderDecorations size="sm" variant="default" colorClass="bg-white" />
              </button>

              <button
                type="button"
                onClick={() => handleSaveConsent(false)}
                className="relative flex-1 h-9 px-4 text-xs font-bold bg-transparent text-white border-none hover:bg-zinc-900 transition-colors active:translate-y-[1px] shadow-[2px_2px_0_0_#000] font-sans flex items-center justify-center cursor-pointer select-none"
              >
                Essential Only
                <ButtonBorderDecorations size="sm" variant="outline" colorClass="bg-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
