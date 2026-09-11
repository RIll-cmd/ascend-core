"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Gift,
  ShieldCheck,
  ShieldX,
  Sparkles,
} from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { getEnemySpriteUrl } from "@/utils/spriteUtils";
import type { Boss } from "../store/useBossStore";
import { getBossArchetype, getBossRewards, getBossThreat } from "../utils/bossPresentation";
import styles from "../styles/ForbiddenContractHall.module.css";

interface ConqueredBossRowProps {
  boss: Boss;
}

const STATUS_PRESENTATION = {
  DEFEATED: {
    label: "Conquered",
    icon: ShieldCheck,
    tone: "border-emerald-800/70 bg-emerald-950/20 text-emerald-300",
  },
  FAILED: {
    label: "Binding failed",
    icon: ShieldX,
    tone: "border-red-900/70 bg-red-950/20 text-red-300",
  },
  ARCHIVED: {
    label: "Archived",
    icon: Archive,
    tone: "border-slate-700 bg-slate-900/45 text-slate-300",
  },
} as const;

export function ConqueredBossRow({ boss }: ConqueredBossRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const detailsId = useId();
  const status = STATUS_PRESENTATION[boss.status === "ACTIVE" ? "ARCHIVED" : boss.status];
  const StatusIcon = status.icon;
  const threat = getBossThreat(boss.difficulty);
  const archetype = getBossArchetype(boss);
  const rewards = getBossRewards(boss);
  const damageDealt = Math.max(0, boss.maxHp - boss.currentHp);

  return (
    <article className={`${styles.archiveRow} border border-slate-800`}>
      <div className="flex min-h-20 items-center gap-3 p-3 sm:gap-4 sm:px-4">
        <div className="grid size-14 shrink-0 place-items-center border border-slate-700 bg-[#070b12] sm:size-16">
          <Image
            src={getEnemySpriteUrl(boss.name, { isBoss: true, preferAnimated: true })}
            alt=""
            width={56}
            height={56}
            unoptimized
            onError={(event) => {
              event.currentTarget.src = "/bosses/gollux.gif";
            }}
            className={`${styles.portrait} size-12 object-contain opacity-75 sm:size-14`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex min-h-7 items-center gap-1.5 border px-2 font-mono text-[10px] uppercase tracking-[0.1em] ${status.tone}`}>
              <StatusIcon className="size-3.5" aria-hidden="true" />
              {status.label}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-cyan-100/45">
              Rank {threat.rank} / {archetype.id}
            </span>
          </div>
          <h3 className="mt-1.5 truncate text-base font-semibold text-slate-100 sm:text-lg">{boss.name}</h3>
          <p className="mt-0.5 text-xs text-cyan-100/50">
            Contract bound {format(new Date(boss.createdAt), "MMM d, yyyy")}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-5 md:flex">
          <div className="text-right">
            <p className="font-mono text-xs tabular-nums text-red-200"><NumberTicker value={damageDealt} /> DMG</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-slate-500">Inflicted</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs tabular-nums text-amber-200"><NumberTicker value={rewards.gold} /> G</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-slate-500">Bounty</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls={detailsId}
          aria-label={`${isOpen ? "Hide" : "Inspect"} ${boss.name} contract details`}
          className="grid size-11 shrink-0 place-items-center border border-slate-700 bg-slate-900/60 text-cyan-200 transition-colors hover:border-cyan-700 hover:bg-cyan-950/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {isOpen ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
        </button>
      </div>

      {isOpen ? (
        <div id={detailsId} className="grid gap-5 border-t border-slate-800 px-4 py-5 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-100/45">Contract record</p>
            <p className="mt-2 max-w-3xl leading-6 text-slate-300">
              {boss.description || "No additional terms were inscribed on this contract."}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 md:min-w-72">
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-amber-100/55"><CircleDollarSign className="size-3.5" aria-hidden="true" /> Gold</dt>
              <dd className="mt-1 font-mono text-sm tabular-nums text-amber-200">{rewards.gold.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-cyan-100/55"><Sparkles className="size-3.5" aria-hidden="true" /> EXP</dt>
              <dd className="mt-1 font-mono text-sm tabular-nums text-cyan-200">{rewards.exp.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs text-fuchsia-100/55">Inscribed title</dt>
              <dd className="mt-1 text-sm text-fuchsia-100">{rewards.title || "None"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-amber-100/55"><Gift className="size-3.5" aria-hidden="true" /> Tribute</dt>
              <dd className="mt-1 text-sm text-amber-50">{rewards.tribute || "None"}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </article>
  );
}
