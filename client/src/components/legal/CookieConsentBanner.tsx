"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_STORAGE_KEY = "ascend_cookie_consent";

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
      <div className="p-5 rounded-2xl bg-[#0F162B]/95 border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-xl text-slate-200">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>

          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-white font-heading text-sm">
                Privacy & Cookie Protocol
              </span>
              <button
                type="button"
                onClick={() => handleSaveConsent(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Dismiss cookie notice with essential cookies only"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-400 leading-relaxed font-sans mb-3">
              We employ strictly essential session cookies to authenticate your hunter profile and optional telemetry to improve platform stability. Zero third-party ad tracking.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <Link href="/privacy" className="underline hover:text-cyan-300">
                Inspect Full Privacy Policy
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSaveConsent(true)}
                className="flex-1 h-9 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20"
              >
                Accept All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveConsent(false)}
                className="flex-1 h-9 text-xs font-bold border-white/10 hover:bg-white/5 text-slate-300"
              >
                Essential Only
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
