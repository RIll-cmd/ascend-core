"use client";

import React from "react";
import { Dumbbell, Crown, Shield, Brain, Zap, Swords, Flame, Sparkles } from "lucide-react";

export function BrutstackTrust() {
  const guilds = [
    {
      name: "Iron Forge Guild",
      icon: <Dumbbell className="h-5 w-5 text-[#ff3344]" />,
      badge: "IRON FORGE",
      sub: "Strength Syndicate",
    },
    {
      name: "Shadow Monarchs",
      icon: <Crown className="h-5 w-5 text-[#ffd700]" />,
      badge: "SHADOW MONARCHS",
      sub: "S-Rank Order",
    },
    {
      name: "Apex Athletics",
      icon: <Zap className="h-5 w-5 text-[#14b6e5]" />,
      badge: "APEX ATHLETICS",
      sub: "Hybrid Division",
    },
    {
      name: "Cyber Sanctum",
      icon: <Brain className="h-5 w-5 text-[#a855f7]" />,
      badge: "CYBER SANCTUM",
      sub: "Cognitive Focus",
    },
    {
      name: "Solo Levelers",
      icon: <Swords className="h-5 w-5 text-[#22c55e]" />,
      badge: "SOLO LEVELERS",
      sub: "Self-Mastery Corps",
    },
    {
      name: "Spartan Syndicate",
      icon: <Shield className="h-5 w-5 text-[#fcba28]" />,
      badge: "SPARTAN SYNDICATE",
      sub: "Discipline Vault",
    },
    {
      name: "Chrono Habitats",
      icon: <Flame className="h-5 w-5 text-[#ff7700]" />,
      badge: "CHRONO HABITATS",
      sub: "Consistency Matrix",
    },
    {
      name: "Deep Work Order",
      icon: <Sparkles className="h-5 w-5 text-[#00ff88]" />,
      badge: "DEEP WORK ORDER",
      sub: "Flow State League",
    },
  ];

  return (
    <section className="w-full bg-[#1a1a1a] px-4 py-16 lg:px-12 lg:py-24 text-[#f9f4da]">
      <p className="font-head mb-8 text-center text-xs font-bold tracking-widest uppercase text-neutral-400 lg:text-sm">
        {"// BATTLETESTED BY ELITE DISCIPLINE GUILDS & ATHLETES"}
      </p>

      <div className="mx-auto max-w-6xl border-2 border-black bg-[#141414] shadow-[6px_6px_0_0_#000]">
        {/* Row 1 */}
        <div className="grid grid-cols-2 divide-x-2 divide-black lg:grid-cols-4">
          {guilds.slice(0, 4).map((guild) => (
            <div
              key={guild.name}
              className="flex h-20 items-center justify-center gap-3 px-4 py-4 transition-all duration-200 hover:bg-[#1f1f1f]"
            >
              {guild.icon}
              <div className="flex flex-col">
                <span className="font-head text-xs lg:text-sm font-black tracking-wider uppercase">
                  {guild.badge}
                </span>
                <span className="font-mono text-[9px] text-neutral-400 uppercase">
                  {guild.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal Divider */}
        <div className="border-t-2 border-black" />

        {/* Row 2 */}
        <div className="grid grid-cols-2 divide-x-2 divide-black lg:grid-cols-4">
          {guilds.slice(4, 8).map((guild) => (
            <div
              key={guild.name}
              className="flex h-20 items-center justify-center gap-3 px-4 py-4 transition-all duration-200 hover:bg-[#1f1f1f]"
            >
              {guild.icon}
              <div className="flex flex-col">
                <span className="font-head text-xs lg:text-sm font-black tracking-wider uppercase">
                  {guild.badge}
                </span>
                <span className="font-mono text-[9px] text-neutral-400 uppercase">
                  {guild.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
