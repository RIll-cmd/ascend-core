"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Anchor,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Crown,
  EyeOff,
  Gift,
  HeartPulse,
  Loader2,
  ScrollText,
  ShieldAlert,
  Skull,
  Sparkles,
} from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { getEnemySpriteUrl } from "@/utils/spriteUtils";
import type { Boss } from "../store/useBossStore";
import { useBossStore } from "../store/useBossStore";
import {
  getBossArchetype,
  getBossDeadline,
  getBossPhase,
  getBossRewards,
  getBossThreat,
  type BossThreatTone,
} from "../utils/bossPresentation";
import styles from "../styles/ForbiddenContractHall.module.css";

interface BossThreatContractProps {
  boss: Boss;
  isNew?: boolean;
}

const THREAT_TONES: Record<BossThreatTone, string> = {
  SILVER: "border-slate-400/70 bg-slate-300/5 text-slate-200",
  STEEL: "border-cyan-800 bg-cyan-950/20 text-cyan-200",
  AMBER: "border-amber-600/80 bg-amber-950/25 text-amber-200",
  GOLD: "border-yellow-500/70 bg-yellow-950/20 text-yellow-200",
  MONARCH: "border-fuchsia-600/70 bg-fuchsia-950/25 text-fuchsia-200",
};

const DEADLINE_TONES = {
  NONE: "text-cyan-100/50",
  STABLE: "text-cyan-200",
  APPROACHING: "text-amber-300",
  BREACHED: "text-red-300",
} as const;

const ARCHETYPE_ICONS = {
  LICH: Skull,
  COLOSSUS: ShieldAlert,
  LEVIATHAN: Anchor,
  SHADE: EyeOff,
} as const;

export function BossThreatContract({ boss, isNew = false }: BossThreatContractProps) {
  const character = useCharacterStore((state) => state.character);
  const fetchBossTrajectory = useBossStore((state) => state.fetchBossTrajectory);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const analysisId = useId();

  const threat = getBossThreat(boss.difficulty);
  const archetype = getBossArchetype(boss);
  const phase = getBossPhase(boss);
  const rewards = getBossRewards(boss);
  const deadline = getBossDeadline(boss.deadline);
  const ArchetypeIcon = ARCHETYPE_ICONS[archetype.id];
  const sortedPhases = [...boss.phases].sort((left, right) => left.orderIndex - right.orderIndex);
  const visiblePhases = sortedPhases.length > 0
    ? sortedPhases
    : [{ id: "unphased", name: phase.name, maxHp: boss.maxHp, orderIndex: 1 }];
  const phaseTrackScale = visiblePhases.length <= 1
    ? Math.max(0, Math.min(1, phase.damageDealt / Math.max(1, boss.maxHp)))
    : phase.activeIndex / (visiblePhases.length - 1);

  const handleAnalysis = async () => {
    if (analysis && !analysisError) {
      setIsAnalysisOpen((current) => !current);
      return;
    }
    if (!character) return;

    setIsAnalysisOpen(true);
    setIsAnalyzing(true);
    setAnalysisError(false);
    const result = await fetchBossTrajectory(character.id, boss.id);
    if (result) {
      setAnalysis(result);
    } else {
      setAnalysis(null);
      setAnalysisError(true);
    }
    setIsAnalyzing(false);
  };

  const deadlineLabel = deadline.date
    ? deadline.state === "BREACHED"
      ? "Binding deadline breached"
      : `Due ${formatDistanceToNow(deadline.date, { addSuffix: true })}`
    : "No binding deadline";

  return (
    <article
      aria-labelledby={`boss-${boss.id}`}
      className={`${styles.contract} ${isNew ? styles.materializing : ""} border border-cyan-950/90`}
    >
      <div className="grid lg:grid-cols-[12rem_minmax(0,1fr)_18rem]">
        <div className="relative flex min-h-48 items-center justify-center overflow-hidden border-b border-cyan-950/80 bg-[#070b12] p-5 lg:min-h-full lg:border-b-0 lg:border-r">
          <div aria-hidden="true" className="absolute inset-5 rotate-45 border border-cyan-900/35" />
          <div aria-hidden="true" className="absolute inset-9 rounded-full border border-amber-900/35" />
          <Image
            src={getEnemySpriteUrl(boss.name, { isBoss: true, preferAnimated: true })}
            alt={`${archetype.title} manifestation for ${boss.name}`}
            width={144}
            height={144}
            unoptimized
            onError={(event) => {
              event.currentTarget.src = "/bosses/gollux.gif";
            }}
            className={`${styles.portrait} relative z-[1] size-36 object-contain`}
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 border border-cyan-900/70 bg-[#080d15]/95 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-200">
            <ArchetypeIcon className="size-3.5" aria-hidden="true" />
            {archetype.id}
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-red-800/70 bg-red-950/30 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-red-200">
                  Active binding
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-amber-300/80">
                  {archetype.domain}
                </span>
              </div>
              <h2 id={`boss-${boss.id}`} className="mt-3 text-balance text-2xl font-bold tracking-[-0.02em] text-slate-50 sm:text-3xl">
                {boss.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-100/62">
                {boss.description || "A bound real-world objective awaiting a clear conquest condition."}
              </p>
            </div>

            <div className={`flex min-w-40 shrink-0 items-center gap-3 border px-3 py-2.5 ${THREAT_TONES[threat.tone]}`}>
              <div className="grid size-9 place-items-center border border-current/40 bg-black/20">
                <ShieldAlert className="size-4" strokeWidth={1.6} aria-hidden="true" />
              </div>
              <div>
                <p className="font-pixel text-xs">Rank {threat.rank}</p>
                <p className="mt-0.5 text-[11px] text-current/75">{threat.title}</p>
              </div>
            </div>
          </div>

          <section aria-label="Boss health" className="mt-7">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="flex items-center gap-2 text-red-200">
                <HeartPulse className="size-4 text-red-400" aria-hidden="true" />
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()} HP
                </span>
              </div>
              <span className="font-mono text-xs tabular-nums text-red-200/70">
                {phase.percentRemaining.toFixed(1)}% remains
              </span>
            </div>
            <div
              className="mt-2 h-5 overflow-hidden border border-red-950 bg-[#05070c] p-[3px]"
              role="progressbar"
              aria-label={`${boss.name} remaining health`}
              aria-valuemin={0}
              aria-valuemax={boss.maxHp}
              aria-valuenow={Math.max(0, boss.currentHp)}
            >
              <div
                className={`${styles.healthFill} h-full bg-gradient-to-r from-red-900 via-red-600 to-amber-400 shadow-[0_0_14px_rgba(239,68,68,0.36)]`}
                style={{ transform: `scaleX(${phase.percentRemaining / 100})` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[11px] tabular-nums">
              <span className="text-cyan-200">{phase.name}</span>
              <span className="text-cyan-100/50">{phase.damageDealt.toLocaleString()} damage dealt</span>
            </div>
          </section>

          <section aria-label="Ritual phases" className="mt-6">
            <div className="relative grid grid-cols-4 gap-2">
              <div className={styles.phaseTrack} aria-hidden="true">
                <div className={styles.phaseTrackFill} style={{ transform: `scaleX(${phaseTrackScale})` }} />
              </div>
              {visiblePhases.map((item, index) => {
                const isReached = index <= phase.activeIndex;
                return (
                  <div key={item.id} className="relative z-[1] min-w-0 text-center">
                    <div className={`mx-auto grid size-6 place-items-center border bg-[#090e17] ${isReached ? "border-cyan-400 text-cyan-200" : "border-slate-700 text-slate-600"}`}>
                      <span className="font-mono text-[9px] tabular-nums">{index + 1}</span>
                    </div>
                    <p className={`mt-2 truncate text-[10px] ${isReached ? "text-cyan-100/70" : "text-slate-600"}`} title={item.name}>
                      {item.name.replace(/^Phase \d+\s*-\s*/i, "")}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="mt-6 grid gap-3 border-t border-slate-800 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-100/50">Bound damage sources</p>
              {boss.activities.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {boss.activities.slice(0, 3).map((activity) => (
                    <span key={activity.id} className="flex min-h-8 items-center gap-1.5 border border-cyan-900/70 bg-cyan-950/15 px-2.5 font-mono text-[10px] text-cyan-100/80">
                      <Activity className="size-3.5 text-cyan-400" aria-hidden="true" />
                      {activity.damageValue.toLocaleString()} DMG
                    </span>
                  ))}
                  {boss.activities.length > 3 ? <span className="self-center text-xs text-cyan-100/50">+{boss.activities.length - 3} more</span> : null}
                </div>
              ) : (
                <p className="mt-2 text-sm text-amber-100/65">No damage sources bound.</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-100/50">Seal deadline</p>
              <p className={`mt-2 flex items-center gap-2 text-sm sm:justify-end ${DEADLINE_TONES[deadline.state]}`}>
                <CalendarClock className="size-4" aria-hidden="true" />
                {deadlineLabel}
              </p>
            </div>
          </div>
        </div>

        <aside className="border-t border-cyan-950/80 bg-[#080d15]/82 p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="flex items-center gap-2">
            <ScrollText className="size-5 text-amber-400" aria-hidden="true" />
            <h3 className="font-pixel text-sm text-amber-200">Promised spoils</h3>
          </div>
          <dl className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-amber-950/70 pb-3">
              <dt className="flex items-center gap-2 text-xs text-amber-100/65"><CircleDollarSign className="size-4 text-amber-400" aria-hidden="true" />Gold</dt>
              <dd className="font-mono text-sm tabular-nums text-amber-200">{rewards.gold.toLocaleString()}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-cyan-950/70 pb-3">
              <dt className="flex items-center gap-2 text-xs text-cyan-100/65"><Sparkles className="size-4 text-cyan-400" aria-hidden="true" />EXP</dt>
              <dd className="font-mono text-sm tabular-nums text-cyan-200">{rewards.exp.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs text-fuchsia-100/65"><Crown className="size-4 text-fuchsia-300" aria-hidden="true" />Title</dt>
              <dd className="mt-1.5 text-sm text-fuchsia-100">{rewards.title || "No title inscribed"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs text-amber-100/65"><Gift className="size-4 text-amber-300" aria-hidden="true" />Real-life tribute</dt>
              <dd className="mt-1.5 text-sm leading-5 text-amber-50">{rewards.tribute || "No tribute pledged"}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleAnalysis}
            disabled={!character || isAnalyzing}
            aria-expanded={isAnalysisOpen}
            aria-controls={analysisId}
            className="mt-6 flex min-h-11 w-full items-center gap-2 border border-cyan-800 bg-cyan-950/20 px-3 text-left text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-500 hover:bg-cyan-950/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />}
            <span>{analysisError ? "Retry AIRA Forecast" : isAnalysisOpen ? "Hide AIRA Forecast" : "Consult AIRA Forecast"}</span>
            {isAnalysisOpen ? <ChevronUp className="ml-auto size-4" aria-hidden="true" /> : <ChevronDown className="ml-auto size-4" aria-hidden="true" />}
          </button>

          {isAnalysisOpen ? (
            <div id={analysisId} aria-live="polite" aria-busy={isAnalyzing} className="mt-3 border border-cyan-950 bg-[#050a10] p-3 text-xs leading-5 text-cyan-100/75">
              {isAnalyzing ? "Calculating contract trajectory…" : analysisError ? "AIRA could not read this contract. Invoke the forecast again." : analysis}
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
