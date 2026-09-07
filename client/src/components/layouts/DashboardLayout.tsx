"use client";

import { SidebarNav } from "@/components/SidebarNav";
import { Topbar } from "@/components/Topbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAiraNotification } from "@/features/aira/useAiraNotification";
import { AiraPeriodicToast } from "@/features/aira/components/AiraPeriodicToast";
import { SleepDrawer } from "@/features/sleep/components/SleepDrawer";
import { LearningDrawer } from "@/features/learning/components/LearningDrawer";
import { PixelCelestialNightBackground } from "@/components/ui/pixel/PixelCelestialNightBackground";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAiraNotification();

  return (
    <div
      suppressHydrationWarning
      className="flex h-screen h-[100dvh] min-h-screen w-full bg-[#060412] text-zinc-100 overflow-hidden font-sans relative"
    >
      {/* === 16-BIT AUTHENTIC CELESTIAL NIGHT SKY (AURORAS, CONSTELLATIONS & SHOOTING STARS) === */}
      <PixelCelestialNightBackground />

      <SidebarNav />

      <div
        suppressHydrationWarning
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10"
      >
        <Topbar />
        <main
          suppressHydrationWarning
          className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 pb-20 md:pb-6 min-h-0"
        >
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <AiraPeriodicToast />
      <SleepDrawer />
      <LearningDrawer />
    </div>
  );
}

export default DashboardLayout;
