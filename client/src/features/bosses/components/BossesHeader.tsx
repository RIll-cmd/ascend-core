import React from "react";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CoolMode } from "@/components/ui/cool-mode";
import { ForbiddenContractIcon } from "./ForbiddenContractIcon";
import type { getBossSummary } from "../utils/bossPresentation";
import styles from "../styles/ForbiddenContractHall.module.css";
import "../styles/ritual-animations.css";

interface BossesHeaderProps {
  summary: ReturnType<typeof getBossSummary>;
  onSummon: () => void;
  onHoverSummonChange?: (hovering: boolean) => void;
}

const SUMMARY_ITEMS = [
  {
    key: "activeContracts",
    label: "Active contracts",
    tone: "text-red-400",
  },
  {
    key: "remainingHp",
    label: "Remaining HP",
    tone: "text-rose-400",
  },
  {
    key: "conquered",
    label: "Conquered threats",
    tone: "text-amber-300",
  },
  {
    key: "damageSources",
    label: "Bound sources",
    tone: "text-cyan-300",
  },
] as const;

export function BossesHeader({ summary, onSummon, onHoverSummonChange }: BossesHeaderProps) {
  return (
    <header className="relative occult-slate rounded-xl overflow-hidden">
      {/* Occult Corner Studs */}
      <span aria-hidden="true" className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400/50 select-none pointer-events-none">◆</span>
      <span aria-hidden="true" className="absolute top-2 right-2 text-[10px] font-mono text-cyan-400/50 select-none pointer-events-none">◆</span>
      <span aria-hidden="true" className="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-400/50 select-none pointer-events-none">◆</span>
      <span aria-hidden="true" className="absolute bottom-2 right-2 text-[10px] font-mono text-cyan-400/50 select-none pointer-events-none">◆</span>

      {/* Main Header Row */}
      <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between lg:px-9 lg:py-8 relative z-10">
        <div className="flex max-w-3xl items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-amber-500/70 bg-gradient-to-br from-amber-950/80 via-amber-900/50 to-black text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/25 sm:size-14">
            <ForbiddenContractIcon className="size-8 sm:size-9 text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-cyan-400/80">
                Subterranean Rite • Threat Registry
              </span>
            </div>
            <h1 className="font-pixel text-xl leading-relaxed text-slate-50 sm:text-3xl tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Forbidden Contract Hall
            </h1>
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-6 text-cyan-100/70 font-sans">
              Monitor bound threats, inspect their arcane seals, and claim the spoils promised by ritual conquest.
            </p>
          </div>
        </div>

        {/* Summoning Ritual Trigger Button with Fiery Amber Aura & CoolMode Spark Particles */}
        <CoolMode options={{ particle: "🔥", size: 22, speedHorz: 4, speedUp: 8 }}>
          <Button
            type="button"
            onClick={onSummon}
            onMouseEnter={() => onHoverSummonChange?.(true)}
            onMouseLeave={() => onHoverSummonChange?.(false)}
            className="h-12 rounded-lg border-2 border-amber-400 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 px-6 font-pixel text-xs text-amber-950 font-bold tracking-wider ritual-button-glow hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            Initiate Summoning Ritual
          </Button>
        </CoolMode>
      </div>

      {/* Engraved Stone Plinth Stat Ribbon with NumberTicker */}
      <dl className="grid border-t border-cyan-500/20 bg-slate-950/60 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
        {SUMMARY_ITEMS.map(({ key, label, tone }, index) => (
          <div
            key={key}
            className={`flex min-h-16 flex-col justify-center px-5 py-3.5 sm:px-7 plinth-stat transition-colors duration-200 ${
              index > 0 ? "border-t border-cyan-950/70 sm:border-t-0" : ""
            } ${index % 2 === 1 ? "sm:border-l sm:border-cyan-950/70" : ""} ${
              index > 1 ? "lg:border-l lg:border-cyan-950/70" : ""
            }`}
          >
            <dt className="text-[10px] sm:text-[11px] font-mono font-medium uppercase tracking-[0.16em] text-cyan-100/60">
              {label}
            </dt>
            <dd className={`mt-0.5 font-mono text-xl sm:text-2xl font-bold tabular-nums ${tone} drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]`}>
              <NumberTicker value={summary[key]} />
            </dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
