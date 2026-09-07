"use client";

import React, { useEffect, useState } from "react";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useBossStore } from "@/features/bosses/store/useBossStore";
import { getBossSummary } from "@/features/bosses/utils/bossPresentation";
import { BossCard } from "@/features/bosses/components/BossCard";
import { BossCreationModal } from "@/features/bosses/components/BossCreationModal";
import { BossesHeader } from "@/features/bosses/components/BossesHeader";
import { ConqueredBossRow } from "@/features/bosses/components/ConqueredBossRow";
import { RitualChamberBackground } from "@/features/bosses/components/RitualChamberBackground";
import styles from "@/features/bosses/styles/ForbiddenContractHall.module.css";
import "@/features/bosses/styles/ritual-animations.css";

export function ForbiddenContractHall() {
  const character = useCharacterStore((state) => state.character);
  const bosses = useBossStore((state) => state.bosses);
  const fetchBosses = useBossStore((state) => state.fetchBosses);
  const isLoading = useBossStore((state) => state.isLoading);
  const error = useBossStore((state) => state.error);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [newBossId, setNewBossId] = useState<string | null>(null);
  const [isHoveringSummon, setIsHoveringSummon] = useState(false);

  useEffect(() => {
    if (character) void fetchBosses(character.id);
  }, [character, fetchBosses]);

  useEffect(() => {
    if (!newBossId) return;
    const timeout = window.setTimeout(() => setNewBossId(null), 1_100);
    return () => window.clearTimeout(timeout);
  }, [newBossId]);

  const activeBosses = bosses.filter((boss) => boss.status === "ACTIVE");
  const resolvedBosses = bosses.filter((boss) => boss.status !== "ACTIVE");
  const summary = getBossSummary(bosses);
  const showArchive = isArchiveOpen || activeBosses.length === 0;

  const retryFetch = () => {
    if (character) void fetchBosses(character.id);
  };

  return (
    <div className="relative min-h-screen font-sans -m-3 sm:-m-5 md:-m-6 p-3 sm:p-5 md:p-6 overflow-x-hidden">
      {/* 1. Full-Bleed Animated Subterranean Ritual Chamber Background */}
      <RitualChamberBackground isSummonActive={isHoveringSummon} />

      {/* 2. Hall Layout Container */}
      <div className="mx-auto max-w-[96rem] space-y-8 sm:space-y-10 relative z-10">
        {/* Occult Registry Header & Stone Plinth Talisman Ribbon */}
        <BossesHeader
          summary={summary}
          onSummon={() => setIsModalOpen(true)}
          onHoverSummonChange={setIsHoveringSummon}
        />

        {/* State A: Awaiting Hunter Signature */}
        {!character ? (
          <section
            className="occult-slate relative rounded-xl px-5 py-14 text-center sm:px-8"
            aria-labelledby="awaiting-signature"
          >
            <span aria-hidden="true" className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400/50">◆</span>
            <span aria-hidden="true" className="absolute top-2 right-2 text-[10px] font-mono text-cyan-400/50">◆</span>
            <span aria-hidden="true" className="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-400/50">◆</span>
            <span aria-hidden="true" className="absolute bottom-2 right-2 text-[10px] font-mono text-cyan-400/50">◆</span>

            <ScrollText className="mx-auto size-11 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" strokeWidth={1.5} aria-hidden="true" />
            <h2 id="awaiting-signature" className="mt-5 font-pixel text-lg text-amber-200 tracking-wide">
              Awaiting Hunter Signature
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-6 text-slate-300">
              The subterranean registry cannot reveal forbidden contracts until a hunter profile is bound to this chamber.
            </p>
          </section>
        ) : isLoading && bosses.length === 0 ? (
          /* State B: Scanning Registry */
          <section aria-label="Scanning forbidden contracts" aria-busy="true" className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-cyan-200/80 font-mono">
              <RefreshCw className="size-4 animate-spin text-cyan-400" aria-hidden="true" />
              Scanning the arcane threat registry…
            </div>
            <div className="occult-slate h-64 rounded-xl border border-cyan-500/20 animate-pulse" />
            <div className="occult-slate h-48 rounded-xl border border-cyan-500/20 opacity-60 animate-pulse" />
          </section>
        ) : error && bosses.length === 0 ? (
          /* State C: Registry Seal Disrupted */
          <section
            role="alert"
            className="occult-slate-amber relative rounded-xl px-5 py-12 text-center sm:px-8 border-red-500/40"
          >
            <span aria-hidden="true" className="absolute top-2 left-2 text-[10px] font-mono text-red-400/60">◆</span>
            <span aria-hidden="true" className="absolute top-2 right-2 text-[10px] font-mono text-red-400/60">◆</span>
            <span aria-hidden="true" className="absolute bottom-2 left-2 text-[10px] font-mono text-red-400/60">◆</span>
            <span aria-hidden="true" className="absolute bottom-2 right-2 text-[10px] font-mono text-red-400/60">◆</span>

            <CircleAlert className="mx-auto size-11 text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-5 font-pixel text-lg text-red-200">Registry Seal Disrupted</h2>
            <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-6 text-red-100/75">
              {error}. The existing contracts remain untouched; restore the registry link to inspect them.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={retryFetch}
              className="mt-6 h-11 rounded-lg border-red-700 bg-red-950/40 text-red-100 hover:bg-red-900/60 cursor-pointer focus-visible:ring-amber-400"
            >
              <RefreshCw className="mr-2 size-4" aria-hidden="true" />
              Reopen Registry
            </Button>
          </section>
        ) : (
          /* State D: Active Contracts & Occult Empty State */
          <div className="space-y-10">
            {error ? (
              <div
                role="status"
                className="flex flex-col gap-3 rounded-lg border border-amber-600/40 bg-amber-950/40 px-4 py-3 text-xs sm:text-sm text-amber-100/85 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="flex items-center gap-2">
                  <CircleAlert className="size-4 shrink-0 text-amber-400" aria-hidden="true" />
                  The registry could not refresh. Displaying last known contracts.
                </span>
                <button
                  type="button"
                  onClick={retryFetch}
                  className="min-h-9 self-start px-3 font-semibold text-amber-300 underline decoration-amber-600 underline-offset-4 hover:text-amber-100 cursor-pointer sm:self-auto"
                >
                  Retry scan
                </button>
              </div>
            ) : null}

            {/* Active Threats Section */}
            <section aria-labelledby="bound-threats-heading" className="space-y-5">
              <div className="flex flex-col gap-2 border-b border-cyan-500/25 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400/80">
                    Registry // Active Bindings
                  </p>
                  <h2 id="bound-threats-heading" className="mt-1 font-pixel text-xl text-slate-100 sm:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Bound Threats
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-mono text-cyan-200/65">
                  {activeBosses.length} {activeBosses.length === 1 ? "entity demands" : "entities demand"} conquest
                </p>
              </div>

              {/* === THE BINDING CIRCLE IS SILENT (EMPTY STATE OVERHAUL) === */}
              {activeBosses.length === 0 ? (
                <div className="relative occult-slate rounded-2xl p-6 sm:p-10 lg:p-14 text-center overflow-hidden transition-all duration-300">
                  {/* Occult Corner Studs */}
                  <span aria-hidden="true" className="absolute top-2.5 left-2.5 text-[10px] font-mono text-cyan-400/60 select-none pointer-events-none">◆</span>
                  <span aria-hidden="true" className="absolute top-2.5 right-2.5 text-[10px] font-mono text-cyan-400/60 select-none pointer-events-none">◆</span>
                  <span aria-hidden="true" className="absolute bottom-2.5 left-2.5 text-[10px] font-mono text-cyan-400/60 select-none pointer-events-none">◆</span>
                  <span aria-hidden="true" className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-cyan-400/60 select-none pointer-events-none">◆</span>

                  {/* Concentric Rotating Runic Rings Illustration (Zero Emojis, Pure SVG) */}
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-72 sm:size-96 pointer-events-none opacity-20"
                  >
                    {/* Outer Rotating Runic Circle */}
                    <svg
                      viewBox="0 0 200 200"
                      className="rune-spin-slow w-full h-full text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <circle cx="100" cy="100" r="92" strokeDasharray="6 4" />
                      <circle cx="100" cy="100" r="78" strokeWidth="0.8" />
                      <polygon points="100,10 178,145 22,145" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                      <polygon points="100,190 22,55 178,55" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                    </svg>

                    {/* Counter-Rotating Inner Astral Seal */}
                    <svg
                      viewBox="0 0 200 200"
                      className="rune-spin-reverse absolute inset-0 w-full h-full text-teal-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <circle cx="100" cy="100" r="58" strokeDasharray="3 3" />
                      <rect x="62" y="62" width="76" height="76" transform="rotate(45 100 100)" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
                    </svg>
                  </div>

                  {/* Altar Content */}
                  <div className="relative z-10 max-w-xl mx-auto space-y-4 py-4 sm:py-6">
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-400/80 font-bold block">
                        Altar Seal Quiescent
                      </span>
                      <h3 className="font-pixel text-lg sm:text-2xl text-cyan-50 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        The Binding Circle Is Silent
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300/90 font-sans leading-relaxed max-w-md mx-auto">
                        The subterranean runes pulse quietly, awaiting your decree. Convert a consequential real-world goal into an occult threat with measurable health, damage sources, and promised spoils.
                      </p>
                    </div>

                    {/* Central Summon Trigger Button with Fiery Amber / Astral Cyan Aura */}
                    <div className="pt-3">
                      <Button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        onMouseEnter={() => setIsHoveringSummon(true)}
                        onMouseLeave={() => setIsHoveringSummon(false)}
                        className="h-12 sm:h-13 rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 px-7 sm:px-9 font-pixel text-xs sm:text-sm text-amber-950 font-black tracking-wider ritual-button-glow hover:from-amber-400 hover:to-amber-500 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_30px_rgba(245,158,11,0.5)] cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-300"
                      >
                        Initiate First Binding
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Threats List */
                <div className="space-y-6">
                  {activeBosses.map((boss) => (
                    <BossCard key={boss.id} boss={boss} isNew={boss.id === newBossId} />
                  ))}
                </div>
              )}
            </section>

            {/* Resolved Contract Archive */}
            {resolvedBosses.length > 0 ? (
              <section aria-labelledby="archive-heading" className="pt-6">
                <button
                  type="button"
                  onClick={() => setIsArchiveOpen((current) => !current)}
                  aria-expanded={showArchive}
                  aria-controls="resolved-contracts"
                  className="flex min-h-12 w-full items-center gap-3.5 text-left p-3.5 rounded-xl occult-slate hover:border-cyan-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-amber-600/50 bg-amber-950/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                    <Archive className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-amber-400/75 font-semibold">
                      Restricted records
                    </span>
                    <span id="archive-heading" className="mt-0.5 block font-pixel text-sm text-slate-100">
                      Resolved Contract Archive
                    </span>
                  </span>
                  <span className="font-mono text-xs tabular-nums text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                    {resolvedBosses.length} CONQUERED
                  </span>
                  {showArchive ? (
                    <ChevronUp className="size-4 text-cyan-300" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="size-4 text-cyan-300" aria-hidden="true" />
                  )}
                </button>

                {showArchive ? (
                  <div id="resolved-contracts" className="mt-4 space-y-2.5">
                    {resolvedBosses.map((boss) => (
                      <ConqueredBossRow key={boss.id} boss={boss} />
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <BossCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSummoningEffect={(effect) => {
          if (effect.phase === "sealed" && effect.boss) setNewBossId(effect.boss.id);
        }}
      />
    </div>
  );
}

export default ForbiddenContractHall;
