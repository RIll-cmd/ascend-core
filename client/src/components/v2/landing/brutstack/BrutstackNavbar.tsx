"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraphicAchievementsIcon } from "@/components/ui/icons/SidebarGraphicIcons";
import { Menu, X } from "lucide-react";
import "@/components/ui/8bit/styles/retro.css";

interface BrutstackNavbarProps {
  onSignInClick?: () => void;
  onGetStartedClick?: () => void;
  onGuestClick?: () => void;
}

export function BrutstackNavbar({
  onSignInClick,
  onGetStartedClick,
  onGuestClick,
}: BrutstackNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-[#161616] px-4 md:px-8 text-[#f9f4da]">
      <div className="flex h-16.5 items-stretch justify-between">
        {/* Brand Logo with Ascend Core Styling */}
        <Link
          href="/"
          className="flex items-center gap-3 border-x-2 border-black px-4 md:px-6 hover:bg-neutral-900/60 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#141414] border border-black shadow-[1px_1px_0_0_#000]">
            <GraphicAchievementsIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="retro text-xs sm:text-sm font-bold tracking-wider uppercase leading-none">
              ASCEND CORE
            </span>
            <span className="retro text-[7px] text-[#fcba28] tracking-widest uppercase mt-1">
              {"// HUNTER_OS"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-stretch justify-end md:flex">
          <a
            className="retro flex items-center px-4 lg:px-6 text-[9px] lg:text-[10px] font-bold uppercase tracking-wider transition-colors hover:text-[#fcba28]"
            href="#disciplines"
          >
            Disciplines
          </a>
          <a
            className="retro flex items-center px-4 lg:px-6 text-[9px] lg:text-[10px] font-bold uppercase tracking-wider transition-colors hover:text-[#fcba28]"
            href="#engine"
          >
            Reality Engine
          </a>
          <a
            className="retro flex items-center px-4 lg:px-6 text-[9px] lg:text-[10px] font-bold uppercase tracking-wider transition-colors hover:text-[#fcba28]"
            href="#how-it-works"
          >
            Codex
          </a>
          <a
            className="retro flex items-center px-4 lg:px-6 text-[9px] lg:text-[10px] font-bold uppercase tracking-wider transition-colors hover:text-[#fcba28]"
            href="#faq"
          >
            FAQ
          </a>
          <button
            type="button"
            onClick={onGuestClick}
            className="retro flex items-center border-l-2 border-black bg-neutral-900/80 px-4 lg:px-5 text-[9px] lg:text-[10px] font-bold text-[#14b6e5] uppercase transition-colors hover:bg-neutral-800 hover:text-white cursor-pointer"
            title="Instant 1-Click Guest Access"
          >
            Guest Pass
          </button>
          <button
            type="button"
            onClick={onSignInClick}
            className="retro flex items-center border-x-2 border-black px-5 lg:px-7 text-[9px] lg:text-[10px] font-bold tracking-wider uppercase transition-colors hover:text-[#d4cfa8] cursor-pointer"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={onGetStartedClick}
            className="retro flex items-center border-r-2 border-black bg-[#14b6e5] px-5 lg:px-7 text-[9px] lg:text-[10px] font-bold text-black uppercase transition-colors hover:bg-[#00bfc2] cursor-pointer shadow-[-1px_0_0_0_#000]"
          >
            Awaken Hunter
          </button>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center border-2 border-black px-4 transition-colors hover:text-[#d4cfa8] md:hidden cursor-pointer bg-neutral-900/50"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t-2 border-black bg-[#1a1a1a] p-6 md:hidden flex flex-col gap-4">
          <a
            href="#disciplines"
            onClick={() => setMobileMenuOpen(false)}
            className="retro text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hover:text-[#fcba28] transition-colors py-1"
          >
            Disciplines
          </a>
          <a
            href="#engine"
            onClick={() => setMobileMenuOpen(false)}
            className="retro text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hover:text-[#fcba28] transition-colors py-1"
          >
            Reality Engine
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="retro text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hover:text-[#fcba28] transition-colors py-1"
          >
            Hunter Codex
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="retro text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hover:text-[#fcba28] transition-colors py-1"
          >
            Intel &amp; FAQ
          </a>
          <div className="flex flex-col gap-3 pt-3 border-t-2 border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onGuestClick?.();
              }}
              className="retro w-full border-2 border-[#14b6e5] bg-neutral-900 py-2.5 text-center text-[9px] sm:text-[10px] font-bold text-[#14b6e5] tracking-widest uppercase hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Guest Pass [Instant]
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onSignInClick?.();
              }}
              className="retro w-full border-2 border-black bg-transparent py-2.5 text-center text-[9px] sm:text-[10px] font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStartedClick?.();
              }}
              className="retro w-full border-2 border-black bg-[#14b6e5] py-2.5 text-center text-[9px] sm:text-[10px] font-bold text-black tracking-widest uppercase hover:bg-[#00bfc2] transition-colors cursor-pointer"
            >
              Awaken Hunter
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
