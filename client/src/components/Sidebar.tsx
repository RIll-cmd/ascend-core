"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  CheckCircle2,
  Dumbbell,
  Flame,
  Package,
  Zap,
  Skull,
  ShoppingBag,
  Bot,
  Sparkles,
  MessageSquare,
  Trophy,
  Crown,
  Swords,
  Calendar,
  Radio,
  Hammer,
  User,
  Moon,
  Brain,
} from "lucide-react";

import { playSystemOpen } from "@/features/audio/useSystemAudio";
import { AiraAvatar } from "@/components/ui/AiraAvatar";
import { playMovementSFX } from "@/utils/audio";

const SIDEBAR_RUNES = ['ᚦ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᛃ', 'ᛈ', 'ᛋ', 'ᛏ'];

const navItemVariants = {
  hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.04,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

export function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Missions", href: "/missions", icon: Target },
    { name: "Habits", href: "/habits", icon: CheckCircle2 },
    { name: "Sleep & Rest", href: "/sleep", icon: Moon },
    { name: "Learning & Focus", href: "/learning", icon: Brain },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Workouts", href: "/workouts", icon: Dumbbell },
    { name: "Boss PR", href: "/workouts/boss-pr", icon: Swords },
    { name: "Tower", href: "/tower", icon: Flame },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Beasts & Pets", href: "/beasts", icon: Sparkles },
    { name: "Forge & Craft", href: "/crafting", icon: Hammer },
    { name: "Skills", href: "/skills", icon: Zap },
    { name: "Bosses", href: "/bosses", icon: Skull },
    { name: "Shop", href: "/shop", icon: ShoppingBag },
    { name: "Achievements", href: "/achievements", icon: Trophy },
    { name: "AI System", href: "/aira", icon: Bot },
  ];

  return (
    <aside suppressHydrationWarning className="w-64 flex flex-col border-r border-cyan-500/10 bg-[#030712]/95 backdrop-blur-xl shrink-0 select-none font-sans hidden md:flex relative z-30 shadow-2xl shadow-black/60">
      
      {/* Animated right edge glow line */}
      <div suppressHydrationWarning className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent animate-pulse-glow-intense z-20" />
      
      {/* Background gradient accent */}
      <div suppressHydrationWarning className="absolute top-0 left-0 w-full h-60 bg-gradient-to-b from-cyan-500/[0.04] to-transparent pointer-events-none" />
      <div suppressHydrationWarning className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-purple-500/[0.03] to-transparent pointer-events-none" />
      
      {/* Floating runes in sidebar */}
      {mounted && SIDEBAR_RUNES.map((rune, i) => (
        <span
          key={`sidebar-rune-${i}`}
          suppressHydrationWarning
          className="rune-drift text-cyan-400/20"
          style={{
            left: `${15 + (i * 12) % 50}%`,
            top: `${20 + (i * 15) % 60}%`,
            fontSize: '10px',
            animationDuration: `${12 + i * 3}s`,
            animationDelay: `${i * 4}s`,
          }}
        >
          {rune}
        </span>
      ))}

      {/* LOGO HEADER */}
      <div suppressHydrationWarning className="p-5 flex items-center justify-between border-b border-cyan-500/10 relative z-10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div suppressHydrationWarning className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all duration-500 animate-energy-pulse relative overflow-hidden">
            <Sparkles className="w-5 h-5 relative z-10" />
            {/* Inner shimmer */}
            <div suppressHydrationWarning className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-gradient-shift" />
          </div>
          <div suppressHydrationWarning>
            <div suppressHydrationWarning className="flex items-center gap-2">
              <span className="font-bold tracking-[0.12em] text-base font-heading text-white group-hover:text-cyan-300 transition-colors">
                ASCEND OS
              </span>
            </div>
            <div suppressHydrationWarning className="flex items-center gap-1.5 -mt-0.5">
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold tracking-wider">
                v2.0 HUD
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* NAVIGATION LINKS — Staggered Mount */}
      <motion.nav
        suppressHydrationWarning
        className="flex-1 px-3 py-4 space-y-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-cyan-500/10 scrollbar-track-transparent"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sidebarNav.map((item, index) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <motion.div
              key={item.name}
              variants={navItemVariants}
              custom={index}
            >
              <Link
                href={item.href}
                onClick={() => {
                  playSystemOpen();
                  playMovementSFX("teleport");
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 group relative overflow-hidden sweep-light ${
                  isActive
                    ? "bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-border-glow"
                    : "text-slate-400 hover:text-cyan-200 hover:bg-cyan-500/[0.06] hover:border-cyan-500/15 border border-transparent"
                }`}
              >
                {/* Active left indicator — animated glow bar */}
                {isActive && (
                  <div suppressHydrationWarning className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9),0_0_25px_rgba(6,182,212,0.4)]" />
                )}
                
                <Icon
                  className={`w-4 h-4 transition-all duration-300 ${
                    isActive 
                      ? "text-cyan-400 glow-cyan" 
                      : "text-slate-500 group-hover:text-cyan-400 group-hover:glow-cyan"
                  }`}
                />
                <span className="tracking-wide">{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* AI SYSTEM ADMIN CARD */}
      <motion.div
        suppressHydrationWarning
        className="p-4 m-3 rounded-2xl glass-card border-cyan-500/20 shadow-xl shadow-black/40 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300 z-10"
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {/* Pulsing Glow backdrop */}
        <div suppressHydrationWarning className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all animate-pulse-glow" />
        <div suppressHydrationWarning className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        
        {/* Floating runes in AIRA card */}
        <span suppressHydrationWarning className="rune-static text-cyan-400/20" style={{ top: '10%', right: '10%', fontSize: '12px', animationDelay: '0s' }}>ᛟ</span>
        <span suppressHydrationWarning className="rune-static text-cyan-400/15" style={{ bottom: '20%', left: '8%', fontSize: '10px', animationDelay: '2s' }}>ᛗ</span>

        <div suppressHydrationWarning className="relative z-10">
          <div suppressHydrationWarning className="flex items-center gap-3 mb-3">
             <div suppressHydrationWarning className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)] relative animate-energy-pulse">
                <AiraAvatar mood="NEUTRAL" className="w-10 h-10 border-none shadow-none rounded-none" />
             </div>
             <div suppressHydrationWarning>
               <div suppressHydrationWarning className="flex items-center gap-1.5">
                 <h4 className="text-sm font-bold text-white font-heading tracking-wide">AIRA</h4>
                 <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-[0_0_6px_rgba(6,182,212,0.3)]">ONLINE</span>
               </div>
               <p className="text-[9px] text-cyan-400/80 font-mono tracking-wider font-bold uppercase mt-0.5">SYSTEM ADMINISTRATOR</p>
             </div>
          </div>
          <p className="text-[10px] text-slate-300 mb-3 leading-relaxed font-sans">
            Good morning, Ascendant. Your mind and body are in perfect sync today.
          </p>
          <Link
            href="/aira"
            onClick={() => playSystemOpen()}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:text-white flex items-center justify-center gap-2 transition-all font-mono shadow-md shadow-cyan-950/40 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chat with AIRA</span>
          </Link>
        </div>
      </motion.div>
    </aside>
  );
}
