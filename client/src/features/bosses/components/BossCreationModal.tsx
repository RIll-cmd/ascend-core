"use client";

import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import {
  Activity,
  Anchor,
  CalendarIcon,
  Check,
  CircleDollarSign,
  Compass,
  Crosshair,
  Crown,
  Dumbbell,
  EyeOff,
  Flame,
  Gift,
  Hourglass,
  Info,
  Loader2,
  LockKeyhole,
  Moon,
  Scroll,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  Swords,
  Terminal,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoolMode } from "@/components/ui/cool-mode";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useHabitStore } from "@/features/habits/store/useHabitStore";
import { cn } from "@/lib/utils";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useBossStore, type Boss } from "../store/useBossStore";
import {
  applyThreatRank,
  createInitialRitualState,
  THREAT_RANKS,
  toCreateBossPayload,
  type BossArchetypeId,
  type BossRitualState,
  type BossThreatRank,
} from "../utils/bossRitual";
import styles from "./BossCreationModal.module.css";

const ARCHETYPES: Array<{
  id: BossArchetypeId;
  title: string;
  domain: string;
  description: string;
  icons: readonly [LucideIcon, LucideIcon, LucideIcon];
}> = [
  {
    id: "LICH",
    title: "The Procrastination Lich",
    domain: "Academic / Coding",
    description: "Break the curse of stalled study and unfinished systems.",
    icons: [Skull, Scroll, Terminal],
  },
  {
    id: "COLOSSUS",
    title: "The Iron Colossus",
    domain: "Fitness / Strength",
    description: "Bind a trial of physical force, stamina, or recovery.",
    icons: [ShieldAlert, Dumbbell, Flame],
  },
  {
    id: "LEVIATHAN",
    title: "The Abyssal Leviathan",
    domain: "Career / Long-term",
    description: "Chart a campaign against a distant, defining milestone.",
    icons: [Swords, Compass, Anchor],
  },
  {
    id: "SHADE",
    title: "The Sloth Shade",
    domain: "Daily Habits / Routine",
    description: "Expose the quiet entity feeding on repetition and resolve.",
    icons: [EyeOff, Hourglass, Moon],
  },
];

const RANK_PRESENTATION: Array<{
  id: BossThreatRank;
  title: string;
  duration: string;
  tone: string;
  icon: LucideIcon;
}> = [
  {
    id: "B",
    title: "Lesser Demon",
    duration: "Short-term sprint · 1–2 weeks",
    tone: "border-slate-400/60 bg-slate-400/5 text-slate-200",
    icon: Shield,
  },
  {
    id: "A",
    title: "Dungeon Overlord",
    duration: "Mid-term milestone · 1–3 months",
    tone: "border-amber-500/60 bg-amber-500/5 text-amber-200",
    icon: ShieldAlert,
  },
  {
    id: "S",
    title: "Monarch Calamity",
    duration: "Macro-goal · season or year",
    tone: "border-fuchsia-500/60 bg-fuchsia-950/20 text-fuchsia-200",
    icon: Crown,
  },
];

const MAX_HP = 1_000_000;
export const BOSS_SUMMONING_EVENT = "ascend:boss-summoning";

export interface BossSummoningEffect {
  phase: "binding" | "sealed";
  archetype: BossArchetypeId;
  rank: BossThreatRank;
  boss?: Boss;
}

/**
 * Optional VFX/SFX integration point for the ritual lifecycle.
 * `binding` fires before the create request; `sealed` fires after success and
 * includes the created boss. Failures emit no terminal event. Consumers should
 * use either this callback or the `ascend:boss-summoning` window event—not both.
 */
interface BossCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSummoningEffect?: (effect: BossSummoningEffect) => void;
}

function clampInteger(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

export function BossCreationModal({
  isOpen,
  onClose,
  onSummoningEffect,
}: BossCreationModalProps) {
  const { createBoss, error, isLoading } = useBossStore();
  const { character } = useCharacterStore();
  const { habits, loadHabits } = useHabitStore();
  const [ritual, setRitual] = useState<BossRitualState>(createInitialRitualState);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSealed, setIsSealed] = useState(false);

  useEffect(() => {
    if (isOpen && character) void loadHabits(character.id);
  }, [isOpen, character, loadHabits]);

  const emitSummoningEffect = (effect: BossSummoningEffect) => {
    try {
      onSummoningEffect?.(effect);
    } catch (effectError) {
      console.error("[Boss ritual] Summoning callback failed", effectError);
    }
    try {
      window.dispatchEvent(new CustomEvent(BOSS_SUMMONING_EVENT, { detail: effect }));
    } catch (effectError) {
      console.error("[Boss ritual] Summoning event failed", effectError);
    }
  };

  const selectRank = (rank: BossThreatRank) => {
    setRitual((current) => applyThreatRank(current, rank));
  };

  const updateReward = (field: "gold" | "exp" | "title", value: string | number) => {
    setRitual((current) => ({
      ...current,
      rewards: { ...current.rewards, [field]: value },
    }));
  };

  const toggleHabit = (habitId: string) => {
    setSelectedHabits((current) =>
      current.includes(habitId)
        ? current.filter((candidate) => candidate !== habitId)
        : [...current, habitId],
    );
  };

  const resetRitual = () => {
    setRitual(createInitialRitualState());
    setSelectedHabits([]);
    setHasSubmitted(false);
    setIsSealed(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    if (
      !character ||
      !ritual.name.trim() ||
      ritual.totalHp < THREAT_RANKS[ritual.rank].minHp
    ) return;

    const bindingEffect: BossSummoningEffect = {
      phase: "binding",
      archetype: ritual.archetype,
      rank: ritual.rank,
    };
    emitSummoningEffect(bindingEffect);

    try {
      const boss = await createBoss(
        character.id,
        toCreateBossPayload(ritual, selectedHabits),
      );
      setIsSealed(true);
      emitSummoningEffect({ ...bindingEffect, phase: "sealed", boss });
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      await new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? 0 : 420));
      resetRitual();
      onClose();
    } catch {
      setIsSealed(false);
    }
  };

  const hpScale = Math.min(1, Math.max(0.06, ritual.totalHp / 100_000));
  const activeArchetype = ARCHETYPES.find(({ id }) => id === ritual.archetype) ?? ARCHETYPES[0];
  const ActiveArchetypeIcon = activeArchetype.icons[0];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          styles.ritualDialog,
          "z-50 max-h-[94vh] w-[calc(100%-1rem)] max-w-6xl gap-0 overflow-y-auto border border-cyan-900/80 p-0 text-slate-100 sm:rounded-sm",
        )}
      >
        <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-1/2 z-50 size-48 -translate-x-1/2 -translate-y-1/2 sm:size-64">
          <div className={cn(styles.ritualSeal, "relative grid size-full place-items-center rounded-full border border-cyan-400/70 bg-[#071018]/90")} data-active={isLoading} data-sealed={isSealed}>
            <div className="absolute inset-5 rotate-45 border border-amber-500/50" />
            <div className="absolute inset-10 rounded-full border border-cyan-300/50" />
            <LockKeyhole className="size-14 text-amber-300" strokeWidth={1.4} />
            <span className={cn(styles.spark, "absolute left-8 top-1/2 size-1.5 bg-cyan-200")} />
            <span className={cn(styles.spark, "absolute right-10 top-1/3 size-1.5 bg-amber-200")} />
            <span className={cn(styles.spark, "absolute bottom-8 left-1/2 size-1.5 bg-cyan-100")} />
          </div>
        </div>

        <DialogHeader className="relative border-b border-cyan-950 bg-[#070b13]/90 px-5 py-5 pr-16 text-left sm:px-8 sm:py-6 sm:pr-20">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center border border-amber-600/70 bg-amber-950/30 text-amber-300 shadow-[0_5px_18px_rgba(180,83,9,0.16)]">
              <LockKeyhole className="size-6" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="font-pixel text-lg leading-relaxed text-slate-50 sm:text-2xl">
                Forbidden Summoning Ritual
              </DialogTitle>
              <DialogDescription className="mt-1 max-w-3xl text-sm leading-6 text-cyan-100/70">
                Imprint a real-world objective, calibrate its threat, and seal the spoils owed
                upon conquest.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
            <fieldset>
              <legend className="font-pixel text-sm text-cyan-200 sm:text-base">
                Choose the entity taking form
              </legend>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                The archetype sets the boss domain while your contract supplies its true name.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4" role="radiogroup">
                {ARCHETYPES.map((archetype) => {
                  const [PrimaryIcon, SecondaryIcon, TertiaryIcon] = archetype.icons;
                  const isSelected = ritual.archetype === archetype.id;
                  return (
                    <button
                      key={archetype.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setRitual((current) => ({ ...current, archetype: archetype.id }))}
                      className={cn(
                        "group min-h-44 border bg-[#0d1420]/90 p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.24)] transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f19]",
                        isSelected
                          ? "border-cyan-400 bg-cyan-950/25 shadow-[0_8px_26px_rgba(8,145,178,0.2)]"
                          : "border-slate-800",
                      )}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="relative grid size-14 shrink-0 place-items-center border border-slate-700 bg-[#080c14] text-cyan-300">
                          <PrimaryIcon className="size-7" strokeWidth={1.5} aria-hidden="true" />
                          <SecondaryIcon className="absolute -bottom-1 -left-1 size-4 bg-[#0b0f19] text-amber-400" aria-hidden="true" />
                          <TertiaryIcon className="absolute -right-1 -top-1 size-4 bg-[#0b0f19] text-slate-300" aria-hidden="true" />
                        </span>
                        <span className={cn("grid size-6 place-items-center border transition-colors", isSelected ? "border-cyan-400 bg-cyan-400 text-cyan-950" : "border-slate-700 text-transparent")}>
                          <Check className="size-4" aria-hidden="true" />
                        </span>
                      </span>
                      <span className="mt-4 block font-semibold leading-5 text-slate-100">{archetype.title}</span>
                      <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-amber-300/90">{archetype.domain}</span>
                      <span className="mt-2 block text-xs leading-5 text-slate-400">{archetype.description}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-8 border-t border-slate-800 pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
              <div className="space-y-7">
                <section aria-labelledby="contract-inscription">
                  <h2 id="contract-inscription" className="font-pixel text-sm text-cyan-200 sm:text-base">Imprint the catalyst</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Objective / True name</span>
                      <Input
                        autoFocus
                        value={ritual.name}
                        onChange={(event) => setRitual((current) => ({ ...current, name: event.target.value }))}
                        placeholder="e.g. Complete the capstone project"
                        aria-invalid={hasSubmitted && !ritual.name.trim()}
                        className="h-11 rounded-sm border-slate-700 bg-[#070b12] text-sm focus-visible:ring-amber-400"
                      />
                      {hasSubmitted && !ritual.name.trim() ? <span className="block text-xs text-red-300">The binding requires a true name for this objective.</span> : null}
                    </label>

                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Binding terms</span>
                      <Textarea
                        value={ritual.description}
                        onChange={(event) => setRitual((current) => ({ ...current, description: event.target.value }))}
                        placeholder="Define the exact conditions that mark this conquest complete."
                        className="min-h-24 rounded-sm border-slate-700 bg-[#070b12] text-sm leading-6 placeholder:text-slate-600 focus-visible:ring-amber-400"
                      />
                    </label>

                    <div className="space-y-2 sm:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Seal deadline · optional</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" className={cn("h-11 w-full justify-start rounded-sm border-slate-700 bg-[#070b12] text-left font-normal hover:border-cyan-700 hover:bg-cyan-950/20 sm:w-72", !ritual.deadline && "text-cyan-100/60")}>
                            <CalendarIcon className="mr-2 size-4 text-amber-400" aria-hidden="true" />
                            {ritual.deadline ? format(ritual.deadline, "PPP") : "Choose a binding date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto border-cyan-900 bg-[#0b0f19] p-0" align="start">
                          <Calendar mode="single" selected={ritual.deadline} onSelect={(deadline) => setRitual((current) => ({ ...current, deadline }))} disabled={{ before: new Date() }} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </section>

                <section aria-labelledby="damage-sources" className="border-t border-slate-800 pt-7">
                  <div className="flex items-center gap-2">
                    <Crosshair className="size-5 text-amber-400" aria-hidden="true" />
                    <h2 id="damage-sources" className="font-pixel text-sm text-cyan-200 sm:text-base">Bind damage sources</h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Completed linked habits strike for {THREAT_RANKS[ritual.rank].damage.toLocaleString()} damage.</p>
                  <div className="mt-4 grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {habits.length > 0 ? habits.map((habit) => {
                      const isSelected = selectedHabits.includes(habit.id);
                      return (
                        <button key={habit.id} type="button" aria-pressed={isSelected} onClick={() => toggleHabit(habit.id)} className={cn("flex min-h-11 items-center gap-3 border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400", isSelected ? "border-amber-500/70 bg-amber-950/25 text-amber-100" : "border-slate-800 bg-[#090e17] text-cyan-100/75 hover:border-cyan-800")}>
                          <Activity className="size-4 shrink-0 text-cyan-400" aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate">{habit.name}</span>
                          <span className={cn("grid size-5 place-items-center border", isSelected ? "border-amber-400 text-amber-300" : "border-slate-700 text-transparent")}><Check className="size-3.5" aria-hidden="true" /></span>
                        </button>
                      );
                    }) : (
                      <div className="col-span-full border border-dashed border-slate-700 bg-[#090e17] px-4 py-5 text-sm leading-6 text-slate-400">No active habits detected. The boss can still be sealed; bind damage sources later through your daily systems.</div>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-7">
                <fieldset>
                  <legend className="font-pixel text-sm text-cyan-200 sm:text-base">Assign hunter threat</legend>
                  <div className="mt-4 grid gap-2" role="radiogroup">
                    {RANK_PRESENTATION.map((rank) => {
                      const RankIcon = rank.icon;
                      const isSelected = ritual.rank === rank.id;
                      return (
                        <button key={rank.id} type="button" role="radio" aria-checked={isSelected} onClick={() => selectRank(rank.id)} className={cn("flex min-h-16 items-center gap-3 border p-3 text-left transition-[border-color,background-color,transform] hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400", rank.tone, isSelected ? "ring-1 ring-current" : "opacity-75 hover:opacity-100")}>
                          <span className="grid size-10 shrink-0 place-items-center border border-current/40 bg-black/20"><RankIcon className="size-5" strokeWidth={1.5} aria-hidden="true" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-pixel text-xs">Rank {rank.id} · {rank.title}</span>
                            <span className="mt-1 block text-xs text-current/70">{rank.duration}</span>
                          </span>
                          <span className="font-mono text-xs tabular-nums">{THREAT_RANKS[rank.id].hp.toLocaleString()} HP</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <section aria-labelledby="health-calibration" className="border-t border-slate-800 pt-7">
                  <div className="flex items-center justify-between gap-4">
                    <h2 id="health-calibration" className="font-pixel text-sm text-cyan-200 sm:text-base">Health calibration</h2>
                    <span className="font-mono text-xs tabular-nums text-red-300">{ritual.totalHp.toLocaleString()} HP</span>
                  </div>
                  <div className="mt-4 h-5 overflow-hidden border border-red-950 bg-[#05070c] p-[3px]" role="progressbar" aria-label="Boss health capacity against a 100,000 HP Monarch baseline" aria-valuemin={0} aria-valuemax={100000} aria-valuenow={Math.min(ritual.totalHp, 100000)}>
                    <div className={cn(styles.healthFill, "h-full bg-gradient-to-r from-red-800 via-red-600 to-amber-400 shadow-[0_0_14px_rgba(239,68,68,0.42)]")} style={{ transform: `scaleX(${hpScale})` }} />
                  </div>
                  <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-slate-600"><span>1K</span><span>25K</span><span>100K+</span></div>
                  <label className="mt-4 block space-y-2">
                    <span className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Fine-tune total HP <span className="normal-case tracking-normal text-slate-500">{THREAT_RANKS[ritual.rank].minHp.toLocaleString()}–1,000,000</span></span>
                    <Input type="number" min={THREAT_RANKS[ritual.rank].minHp} max={MAX_HP} step={500} value={ritual.totalHp} onChange={(event) => setRitual((current) => ({ ...current, totalHp: event.target.valueAsNumber || 0 }))} onBlur={() => setRitual((current) => ({ ...current, totalHp: clampInteger(current.totalHp, THREAT_RANKS[current.rank].minHp, MAX_HP) }))} className="h-11 rounded-sm border-red-950 bg-[#070b12] font-mono text-red-200 tabular-nums focus-visible:ring-red-400" />
                  </label>
                </section>

                <section aria-labelledby="spoils" className="border-t border-slate-800 pt-7">
                  <div className="flex items-center gap-2"><Gift className="size-5 text-amber-400" aria-hidden="true" /><h2 id="spoils" className="font-pixel text-sm text-cyan-200 sm:text-base">Spoils of conquest</h2></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-amber-200"><CircleDollarSign className="size-4" aria-hidden="true" /> Gold bounty</span>
                      <Input type="number" min={0} max={THREAT_RANKS[ritual.rank].rewardCaps.gold} step={100} value={ritual.rewards.gold} onChange={(event) => updateReward("gold", event.target.valueAsNumber || 0)} onBlur={() => updateReward("gold", clampInteger(ritual.rewards.gold, 0, THREAT_RANKS[ritual.rank].rewardCaps.gold))} className="h-11 rounded-sm border-amber-900/70 bg-[#100c07] font-mono text-amber-100 tabular-nums focus-visible:ring-amber-400" />
                    </label>
                    <label className="space-y-2">
                      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-cyan-200"><Sparkles className="size-4" aria-hidden="true" /> EXP allocation</span>
                      <Input type="number" min={0} max={THREAT_RANKS[ritual.rank].rewardCaps.exp} step={100} value={ritual.rewards.exp} onChange={(event) => updateReward("exp", event.target.valueAsNumber || 0)} onBlur={() => updateReward("exp", clampInteger(ritual.rewards.exp, 0, THREAT_RANKS[ritual.rank].rewardCaps.exp))} className="h-11 rounded-sm border-cyan-900/70 bg-[#061016] font-mono text-cyan-100 tabular-nums focus-visible:ring-cyan-400" />
                    </label>
                    <label className="space-y-2 sm:col-span-2">
                      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-300"><Crown className="size-4 text-fuchsia-300" aria-hidden="true" /> Cosmetic title · optional</span>
                      <Input maxLength={80} value={ritual.rewards.title} onChange={(event) => updateReward("title", event.target.value)} placeholder="e.g. The Unbroken" className="h-11 rounded-sm border-fuchsia-900/60 bg-[#100914] text-fuchsia-100 focus-visible:ring-fuchsia-400" />
                    </label>
                  </div>

                  <label className="mt-4 block border border-amber-700/50 bg-[#171007] p-4 shadow-[0_8px_24px_rgba(120,53,15,0.15)]">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-amber-200"><Gift className="size-4" aria-hidden="true" /> Real-life tribute · optional</span>
                    <span className="mt-1 block text-xs leading-5 text-amber-100/60">A physical reward you pledge to claim only after conquest.</span>
                    <Input maxLength={160} value={ritual.realWorldReward} onChange={(event) => setRitual((current) => ({ ...current, realWorldReward: event.target.value }))} placeholder="Sushi dinner, a weekend trip, a new book…" className="mt-3 h-11 rounded-sm border-amber-800/70 bg-[#0d0905] text-amber-50 focus-visible:ring-amber-400" />
                  </label>
                </section>
              </div>
            </div>

            <aside className="flex items-start gap-3 border border-cyan-900/60 bg-cyan-950/15 px-4 py-3 text-sm leading-6 text-cyan-100/75">
              <div className="grid size-9 shrink-0 place-items-center border border-cyan-800 bg-[#071018]"><Info className="size-4 text-cyan-300" aria-hidden="true" /></div>
              <p><span className="font-semibold text-cyan-100">Ritual preview:</span> {activeArchetype.title} will manifest at Rank {ritual.rank} with <span className="font-mono tabular-nums text-red-200">{ritual.totalHp.toLocaleString()} HP</span>. Defeat awards <span className="font-mono tabular-nums text-amber-200">{ritual.rewards.gold.toLocaleString()} gold</span> and <span className="font-mono tabular-nums text-cyan-200">{ritual.rewards.exp.toLocaleString()} EXP</span>.</p>
              <ActiveArchetypeIcon className="ml-auto hidden size-8 shrink-0 text-cyan-700 sm:block" strokeWidth={1.3} aria-hidden="true" />
            </aside>

            {error ? <div role="alert" className="border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-200">The ritual failed: {error} Review the contract and initiate the binding again.</div> : null}
          </div>

          <DialogFooter className="sticky bottom-0 z-10 gap-3 border-t border-slate-800 bg-[#070b13]/95 px-5 py-4 backdrop-blur-sm sm:px-8">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="h-11 rounded-sm border-slate-700 bg-[#0d1420] px-5 text-slate-300 hover:border-slate-500 hover:bg-slate-800">Break Circle</Button>
            <CoolMode options={{ particle: "🔥", size: 22, speedHorz: 4, speedUp: 7 }}>
              <Button type="submit" disabled={!character || !ritual.name.trim() || isLoading} className="h-11 rounded-sm border border-amber-500 bg-amber-600 px-6 font-pixel text-xs text-amber-950 shadow-[0_8px_24px_rgba(217,119,6,0.22)] hover:bg-amber-500 focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:border-cyan-950 disabled:bg-[#111827] disabled:text-cyan-100/55 cursor-pointer">
                {isLoading ? <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> Binding Entity…</> : <><Volume2 className="mr-2 size-4" aria-hidden="true" /> Seal Contract</>}
              </Button>
            </CoolMode>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
