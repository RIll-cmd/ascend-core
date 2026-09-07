"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Target, Flame, User, Menu } from "lucide-react";
import { playUISound } from "@/utils/audio";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Missions", href: "/missions", icon: Target },
    { name: "Tower", href: "/tower", icon: Flame },
    { name: "Profile", href: "/character", icon: User },
    { name: "Settings", href: "/settings", icon: Menu },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0514]/95 backdrop-blur-2xl border-t border-[#3c1860]/80 flex items-center justify-around z-50 px-2 font-sans shadow-[0_-4px_20px_rgba(0,0,0,0.6)] overflow-hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => playUISound("/sounds/General/10_UI_Menu_SFX/001_Hover_01.wav")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-none transition-colors relative ${
              isActive
                ? "text-[#fbbf24] font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-[#fbbf24]" : "text-slate-400"
                }`}
              />
            </motion.div>
            <span className="text-xs tracking-tight font-pixel relative z-10">
              {item.name}
            </span>
            {isActive && (
              <div
                suppressHydrationWarning
                className="absolute -bottom-0.5 w-1.5 h-1.5 bg-[#f59e0b] border border-black"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
