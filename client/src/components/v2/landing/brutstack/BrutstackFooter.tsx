"use client";

import React from "react";
import { ArrowUpRight, Globe, CodeXml, MessageCircle } from "lucide-react";
import {
  GraphicDashboardIcon,
  GraphicMissionsIcon,
  GraphicTowerIcon,
  GraphicCraftingIcon,
  GraphicBeastsIcon,
  GraphicAiraIcon,
} from "@/components/ui/icons/SidebarGraphicIcons";

export function BrutstackFooter() {
  const indexLinks = [
    { label: "DASHBOARD HUD", href: "/dashboard", icon: GraphicDashboardIcon },
    { label: "MISSIONS & QUESTS", href: "/missions", icon: GraphicMissionsIcon },
    { label: "TOWER OF ASCENSION", href: "/tower", icon: GraphicTowerIcon },
    { label: "BLACKSMITH FORGE", href: "/crafting", icon: GraphicCraftingIcon },
    { label: "BEAST INCUBATION", href: "/beasts", icon: GraphicBeastsIcon },
    { label: "AIRA NEURAL SYSTEM", href: "/aira", icon: GraphicAiraIcon },
  ];

  const socialLinks = [
    {
      label: "Discord Guild",
      href: "https://discord.com",
      icon: <MessageCircle className="h-6 w-6 shrink-0" />,
    },
    {
      label: "X / Twitter",
      href: "https://twitter.com",
      icon: <Globe className="h-6 w-6 shrink-0" />,
    },
    {
      label: "GitHub Repository",
      href: "https://github.com",
      icon: <CodeXml className="h-6 w-6 shrink-0" />,
    },
  ];

  return (
    <footer className="w-full border-t-2 border-black bg-[#1a1a1a] text-[#f9f4da]">
      {/* 3 Columns Section */}
      <div className="grid grid-cols-1 items-start justify-start gap-0 md:grid-cols-3">
        {/* Col 1: Brand & Mission */}
        <div className="flex h-full flex-col justify-center border-b-2 border-black p-10 md:border-r-2 md:border-b-0 md:p-14 lg:p-20">
          <h2 className="retro text-2xl sm:text-3xl lg:text-4xl font-black mb-8 tracking-wide uppercase">
            ASCEND
            <br />
            CORE
          </h2>
          <div className="mb-8 h-2 w-16 bg-[#fcba28]" />
          <div className="flex items-stretch gap-4">
            <div className="w-1 bg-[#f9f4da]" />
            <p className="retro text-[8px] sm:text-[9px] md:text-[10px] leading-relaxed font-medium text-neutral-300">
              The gamified self-mastery
              <br />
              &amp; physical evolution OS.
            </p>
          </div>
        </div>

        {/* Col 2: Subsystem Codex */}
        <div className="flex flex-col justify-center border-b-2 border-black p-10 md:border-r-2 md:border-b-0 md:p-14 lg:p-20">
          <span className="retro font-bold mb-8 inline-block w-max bg-[#f9f4da] px-4 py-1 text-xs sm:text-sm text-black uppercase border-2 border-black shadow-[2px_2px_0_0_#000]">
            Subsystems
          </span>
          <div className="flex flex-col">
            {indexLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="group flex items-center justify-between border-b-2 border-neutral-800 py-3.5 retro text-[8px] sm:text-[9px] font-bold tracking-wider transition-colors hover:text-[#fcba28] hover:border-[#fcba28]"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 text-neutral-500 group-hover:text-[#fcba28]" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Col 3: Social Guilds */}
        <div className="flex flex-col justify-center p-10 md:p-14 lg:p-20">
          <span className="retro font-bold mb-8 inline-block w-max bg-[#f9f4da] px-4 py-1 text-xs sm:text-sm text-black uppercase border-2 border-black shadow-[2px_2px_0_0_#000]">
            Guild Network
          </span>
          <div className="flex flex-col gap-6">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 text-xs sm:text-sm font-bold transition-colors hover:text-[#14b6e5]"
              >
                {item.icon}
                <span className="retro text-[8px] sm:text-[9px]">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t-2 border-black p-6 text-[7px] sm:text-[8px] font-medium tracking-widest uppercase lg:px-12 lg:py-6 gap-3 text-neutral-400">
        <p className="retro">
          &copy; {new Date().getFullYear()} ASCEND CORE OS. ALL RIGHTS RESERVED.
        </p>
        <p className="retro font-bold text-[#f9f4da]">
          SOLO LEVELING &amp; REALITY LAYER SYSTEM
        </p>
      </div>
    </footer>
  );
}
