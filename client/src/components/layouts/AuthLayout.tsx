"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Galaxy } from "@/components/v2/auth/Galaxy";
import "@/components/v2/landing/brutstack/EightBitScope.css";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      suppressHydrationWarning
      data-mobile-shell="auth"
      className="eightbitcn-login-scope min-h-screen w-full bg-zinc-950 text-white flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-x-hidden selection:bg-cyan-500 selection:text-cyan-950"
    >
      {/* Interactive Galaxy Background from React Bits */}
      <div
        className="absolute inset-0 z-0 pointer-events-auto opacity-60"
        aria-hidden="true"
      >
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.1}
          glowIntensity={0.4}
          saturation={0.7}
          hueShift={195}
          starSpeed={0.35}
          speed={0.7}
          twinkleIntensity={0.4}
          transparent={true}
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,#27272a12_1px,transparent_1px),linear-gradient(to_bottom,#27272a12_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Navigation Bar */}
      <header
        suppressHydrationWarning
        data-mobile-auth-header
        className="relative sm:absolute top-0 sm:top-6 left-0 sm:left-8 right-0 sm:right-8 flex items-center justify-between z-20 w-full max-w-6xl mb-6 sm:mb-0 px-2 sm:px-0"
      >
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-zinc-400 hover:text-white hover:bg-zinc-900/80 border border-zinc-800 rounded-xl transition-all backdrop-blur-md px-3.5 h-9"
        >
          <Link href="/landing" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-mono font-medium">Return to Landing</span>
          </Link>
        </Button>

        <Link
          href="/landing"
          aria-label="Ascend OS home"
          data-mobile-auth-brand
          className="flex items-center gap-2.5 text-base font-bold text-white font-sans group"
        >
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shadow-md">
            &gt;_
          </div>
          <span data-mobile-auth-brand-label className="font-bold text-sm tracking-tight text-zinc-100 group-hover:text-cyan-400 transition-colors">
            ASCEND OS
          </span>
        </Link>
      </header>

      {/* Main Centered Auth Card Container */}
      <main
        suppressHydrationWarning
        data-mobile-auth-main
        className="relative z-10 w-full max-w-4xl my-auto pt-6 sm:pt-16 pb-8"
      >
        {children}
      </main>

      {/* Bottom Attribution */}
      <footer
        suppressHydrationWarning
        className="relative z-20 text-center py-2 pointer-events-none"
      >
        <p className="text-[11px] font-mono text-zinc-500">
          Zero-knowledge telemetry. All credentials securely hashed.
        </p>
      </footer>
    </div>
  );
}

export default AuthLayout;
