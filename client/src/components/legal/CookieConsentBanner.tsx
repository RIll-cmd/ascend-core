"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/8bit/alert";
import { Button } from "@/components/ui/8bit/button";

const CONSENT_STORAGE_KEY = "ascend_cookie_consent";

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        // Small delay for smooth entry after hydration
        const timer = setTimeout(() => setVisible(true), 800);
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

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <Alert
        variant="gold"
        borderColorClass="bg-[#fcba28]"
        className="bg-[#141414] p-5 shadow-[4px_4px_0_0_#000]"
      >
        <div className="flex items-start gap-3.5">
          {/* 8-bit Cookie Icon Container */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black bg-[#fcba28] text-black shadow-[2px_2px_0_0_#000]">
            <Cookie className="h-5 w-5" />
          </div>

          <div className="flex-1">
            {/* Header row with Title and Dismiss button */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <AlertTitle className="text-[#fcba28] text-[11px] sm:text-xs tracking-wider">
                COOKIE PROTOCOL
              </AlertTitle>
              <button
                type="button"
                onClick={() => handleSaveConsent(false)}
                className="cursor-pointer text-neutral-400 hover:text-white p-0.5 transition-colors"
                aria-label="Dismiss cookie notice with essential cookies only"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <AlertDescription className="retro text-neutral-300 text-[8px] sm:text-[9px] leading-relaxed mb-3">
              Essential session cookies for hunter authentication and telemetry. Zero third-party ad tracking.
            </AlertDescription>

            {/* Privacy Link */}
            <div className="flex items-center gap-1.5 retro text-[8px] sm:text-[9px] text-[#14b6e5] mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              <Link href="/privacy" className="underline hover:text-cyan-300 tracking-wide">
                PRIVACY POLICY
              </Link>
            </div>

            {/* Dual 8-bit Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="gold"
                size="sm"
                borderStyle="retro-beveled"
                onClick={() => handleSaveConsent(true)}
                className="retro flex-1 bg-[#fcba28] dark:bg-[#fcba28] text-black dark:text-black hover:bg-[#ffd700] dark:hover:bg-[#ffd700] text-[8px] sm:text-[9px] py-2 shadow-[2px_2px_0_0_#000]"
              >
                ACCEPT ALL
              </Button>
              <Button
                variant="outline"
                size="sm"
                borderStyle="retro-beveled"
                onClick={() => handleSaveConsent(false)}
                className="retro flex-1 border-2 border-[#f9f4da] text-[#f9f4da] hover:bg-[#f9f4da]/10 text-[8px] sm:text-[9px] py-2 shadow-[2px_2px_0_0_#000]"
              >
                ESSENTIAL ONLY
              </Button>
            </div>
          </div>
        </div>
      </Alert>
    </aside>
  );
}

export default CookieConsentBanner;
