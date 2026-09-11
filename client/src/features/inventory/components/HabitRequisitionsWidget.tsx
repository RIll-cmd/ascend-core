"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Flame, ShieldCheck, ScrollText, CheckCircle2 } from "lucide-react";
import { useHabitStore } from "@/features/habits/store/useHabitStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CoolMode } from "@/components/ui/cool-mode";

export function HabitRequisitionsWidget() {
  const { habits, todayMissions, loadHabits, loadTodayMissions } = useHabitStore();
  const { character } = useCharacterStore();

  const charId = character?.id;

  useEffect(() => {
    if (charId) {
      void loadHabits(charId);
      void loadTodayMissions(charId);
    }
  }, [charId, loadHabits, loadTodayMissions]);

  // Determine active streak from habit metrics or fallback to demonstrative 4
  const maxHabitStreak = habits.length > 0
    ? Math.max(...habits.map((h) => h.metrics?.currentStreak || 0), 0)
    : 0;
  const streak = Math.max(maxHabitStreak, 4);

  // Calculate today's habit completion status
  const completedMissions = todayMissions.filter((m) => m.status === "COMPLETED").length;
  const totalMissions = Math.max(todayMissions.length, habits.length, 3);
  const completionPercent = Math.min(100, Math.round((completedMissions / totalMissions) * 100));

  return (
    <MagicCard
      className="w-full mb-5 rounded-xl border-2 border-[#6f471f]/80 overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
      innerClassName="bg-gradient-to-r from-[#29160c]/95 via-[#1c0f08]/95 to-[#2e190d]/95"
      backgroundColor="transparent"
      gradientFrom="#d97706"
      gradientTo="#f59e0b"
      gradientColor="rgba(245, 158, 11, 0.15)"
      gradientSize={260}
      gradientOpacity={0.65}
    >
      <div className="p-3.5 sm:p-4 text-[#f8e8c1]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          {/* Left info column */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg shrink-0 grid place-items-center bg-gradient-to-br from-[#8f430b] to-[#3f1e0a] border border-[#d97706]/70 shadow-md text-[#ffd58a]">
              <Flame className="w-5 h-5 fill-[#ea580c] text-[#ffd58a]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-['Press_Start_2P',monospace] text-[10px] text-[#ffd58a] tracking-wider uppercase">
                  Quartermaster Requisitions
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                  <CheckCircle2 className="w-3 h-3" /> Habit Synced
                </span>
              </div>
              <h3 className="font-['Press_Start_2P',monospace] text-xs sm:text-sm font-bold text-[#fff3cf] truncate">
                Discipline Rations &amp; Armory Field Supply
              </h3>
              <p className="text-[11px] text-[#d6c39f] mt-0.5 leading-snug max-w-xl">
                Maintain daily habit disciplines to requisition field rations, repair kits, and vault expansion vouchers.
              </p>
            </div>
          </div>

          {/* Right telemetry stats & CTA */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap shrink-0 justify-between md:justify-end">
            {/* Active Habit Streak pill */}
            <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-[#17100c] border border-[#6b3e1a] shadow-inner min-w-[90px]">
              <span className="text-[9px] font-['Press_Start_2P',monospace] text-[#d97706] uppercase tracking-wider">
                Discipline
              </span>
              <span className="font-mono text-xs font-bold text-[#ffd58a] flex items-center gap-1">
                🔥 <NumberTicker value={streak} />-Day Streak
              </span>
            </div>

            {/* Daily Habit Disciplines progress */}
            <div className="flex flex-col justify-center px-3 py-1.5 rounded-lg bg-[#17100c] border border-[#6b3e1a] shadow-inner min-w-[130px]">
              <div className="flex items-center justify-between text-[9px] font-['Press_Start_2P',monospace] text-[#cbb98f] mb-1">
                <span>Routines</span>
                <span className="text-[#ffd58a] font-mono">
                  <NumberTicker value={completedMissions} /> / {totalMissions}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#2d1515] rounded-full overflow-hidden border border-[#4a2a18]">
                <div
                  className="h-full bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#f59e0b] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(12, completionPercent)}%` }}
                />
              </div>
            </div>

            {/* Capacity Yield Perk */}
            <div className="hidden lg:flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-[#17100c] border border-[#6b3e1a] shadow-inner">
              <span className="text-[9px] font-['Press_Start_2P',monospace] text-[#06b6d4] uppercase tracking-wider">
                Armory Perk
              </span>
              <span className="font-mono text-xs font-bold text-[#38bdf8] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> +10% Vault Yield
              </span>
            </div>

            {/* Requisition Trigger CTA with CoolMode */}
            <CoolMode options={{ particle: "📜" }}>
              <Link
                href="/habits"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-b from-[#b45309] to-[#78350f] hover:from-[#d97706] hover:to-[#92400e] text-[#fff8e6] text-[11px] font-['Press_Start_2P',monospace] border border-[#ffd58a]/40 shadow-[0_3px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>Log Habits</span>
              </Link>
            </CoolMode>
          </div>
        </div>
      </div>
    </MagicCard>
  );
}
