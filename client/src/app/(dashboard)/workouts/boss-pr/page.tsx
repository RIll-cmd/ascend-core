"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelProgress } from "@/components/ui/pixel/PixelProgress";
import {
  PixelSwordIcon,
  PixelShieldIcon,
  PixelSkullIcon,
  PixelFlameIcon,
  PixelActivityIcon,
  PixelCrownIcon,
  PixelArrowLeftIcon,
  PixelTrophyIcon,
  PixelCrosshairIcon,
  PixelTargetIcon,
  PixelSparklesIcon,
  PixelLightningIcon,
  PixelDumbbellIcon,
  PixelInfoIcon,
  PixelScrollIcon,
  PixelClockIcon,
  PixelOpenGrimoireIcon,
  PixelCheckIcon,
  PixelSpinnerIcon,
} from "@/components/ui/pixel/PixelIcons";
import { toast } from "sonner";
import { useWorkoutStore } from "@/features/workouts/store/useWorkoutStore";
import { API_BASE_URL } from "@/constants";
import { getEnemySpriteUrl } from "@/utils/spriteUtils";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { playBattleSFX, playUIMenuSFX, playBuffSFX } from "@/utils/audio";
import Link from "next/link";

export default function BossPRPage() {
  const { user } = useUser();
  const router = useRouter();
  const { startWorkout, isWorkoutActive } = useWorkoutStore();
  const [boss, setBoss] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchBoss = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/fitness/boss/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setBoss(data);
        }
      } catch (e) {
        toast.error("Failed to load Weekly Boss");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoss();
  }, [user?.id]);

  const handleStartChallenge = async () => {
    if (!user?.id) return;
    playBattleSFX("encounter");
    try {
      const res = await fetch(`${API_BASE_URL}/api/fitness/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: user.id }),
      });
      if (res.ok) {
        const session = await res.json();
        startWorkout(session.id);
        playBuffSFX("speed");
        router.push("/workouts");
      } else {
        toast.error("Failed to start boss challenge.");
      }
    } catch (e) {
      toast.error("Network error starting challenge.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center font-pixel text-xs text-[#ef4444] gap-3 select-none">
        <PixelSpinnerIcon className="w-6 h-6 text-[#ef4444]" />
        <span>LOADING WEEKLY CHALLENGE...</span>
      </div>
    );
  }

  if (!boss) {
    return (
      <div className="flex h-[70vh] items-center justify-center p-6 select-none">
        <div className="max-w-md w-full p-8 pixel-stone-slab text-center space-y-4 relative border-2 border-[#5a3e30]">
          <div className="w-16 h-16 mx-auto bg-[#1f1714] border-2 border-[#8c786a]/40 flex items-center justify-center shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
            <PixelCrownIcon className="w-10 h-10 text-[#8c786a]" />
          </div>
          <h3 className="font-pixel text-sm sm:text-base font-bold text-white uppercase">
            No Active Weekly Boss
          </h3>
          <p className="font-pixel text-[10px] text-[#8c786a]">
            The next weekly boss challenge is being prepared. Check back shortly.
          </p>
          <Link href="/workouts">
            <PixelButton variant="gold" size="sm" className="mt-2 inline-flex items-center gap-2">
              <PixelArrowLeftIcon className="w-3.5 h-3.5" />
              BACK TO WORKOUTS
            </PixelButton>
          </Link>
        </div>
      </div>
    );
  }

  const hpPercent = boss.isDefeated ? 0 : Math.max(0, 100 - boss.currentDamage * 100);
  const rewards = typeof boss.rewards === "string" ? JSON.parse(boss.rewards) : boss.rewards || {};
  const damageLogs = boss.damageLogs ? (typeof boss.damageLogs === "string" ? JSON.parse(boss.damageLogs) : boss.damageLogs) : [];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 font-sans relative text-slate-100 pb-16 animate-in fade-in duration-300">

      {/* ========================================================= */}
      {/* TOP ARENA HEADER */}
      {/* ========================================================= */}
      <div className="relative pixel-stone-slab p-5 sm:p-7 select-none border-2 border-[#5a3e30]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/workouts">
              <PixelButton
                variant="iron"
                size="sm"
                onClick={() => playUIMenuSFX()}
                className="w-10 h-10 p-0 flex items-center justify-center text-stone-300"
                title="Back to Workouts"
              >
                <PixelArrowLeftIcon className="w-4 h-4" />
              </PixelButton>
            </Link>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="pixel-imperial-ribbon px-3 py-1 text-[11px] sm:text-xs flex items-center gap-2 font-bold tracking-wider">
                  <PixelSwordIcon className="w-3.5 h-3.5 text-white" />
                  ARENA TRIBUNAL • WEEKLY BOSS CHALLENGE
                </span>
              </div>
              <h1 className="font-pixel text-base sm:text-xl font-bold text-white uppercase tracking-wider">
                Weekly Boss PR Challenge
              </h1>
              <p className="font-sans text-xs sm:text-sm text-stone-200 font-medium max-w-xl leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                Hit new personal records (PRs) to deal damage against {boss.name}.
              </p>
            </div>
          </div>

          <div>
            {boss.isDefeated ? (
              <PixelBadge variant="success" size="md" className="flex items-center gap-1.5 border border-[#065f46]">
                <PixelTrophyIcon className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-[#10b981] font-bold">BOSS DEFEATED</span>
              </PixelBadge>
            ) : (
              <PixelBadge variant="danger" size="md" className="flex items-center gap-1.5 border border-[#7f1d1d]">
                <PixelCrosshairIcon className="w-3.5 h-3.5 text-[#ef4444]" />
                <span className="text-[#ef4444] font-bold">ACTIVE TARGET</span>
              </PixelBadge>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOSS DISPLAY & ACTION GRID */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Boss Stage Dais Card */}
        <div className="pixel-stone-slab p-5 sm:p-6 select-none flex flex-col justify-between relative border-2 border-[#5a3e30]">
          {/* Boss Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center">
              <span className="pixel-imperial-ribbon px-3 py-1 text-xs font-bold shadow-[0_2px_8px_rgba(185,28,28,0.5)] flex items-center gap-1.5">
                <PixelSwordIcon className="w-3.5 h-3.5 text-[#fca5a5]" />
                {boss.name}
              </span>
            </div>

            {/* Boss Sprite in Roman Arena Sand Pit with Portcullis Gates */}
            <div className="pixel-arena-dirt border-2 border-[#6b4d32] h-60 flex items-center justify-center my-3 relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
              {/* Roman Portcullis Iron Bars Backdrop */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_18px,rgba(20,14,12,0.65)_18px,rgba(20,14,12,0.65)_21px)] pointer-events-none" />
              {/* Arena Sand Pit Warm Sunlight Focus */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] pointer-events-none" />

              {boss.name || boss.bossSprite ? (
                <img
                  src={getEnemySpriteUrl(boss.name || boss.bossSprite || "Gym Behemoth", {
                    isBoss: true,
                    preferAnimated: true,
                  })}
                  alt={boss.name || "Colosseum Titan"}
                  onError={(e) => {
                    e.currentTarget.src = "/bosses/gollux.gif";
                  }}
                  className={`h-48 object-contain relative z-10 [image-rendering:pixelated] ${
                    boss.isDefeated
                      ? "grayscale opacity-40"
                      : "drop-shadow-[0_0_20px_rgba(239,68,68,0.7)] hover:scale-105 transition-transform duration-200"
                  }`}
                />
              ) : (
                <PixelCrownIcon className="w-24 h-24 text-[#f59e0b] relative z-10" />
              )}
            </div>
          </div>

          {/* HP Bar & Win Condition Directive */}
          <div className="space-y-4 pt-2">
            {/* HP Bar */}
            <div className="space-y-1.5 font-pixel text-[10px]">
              <div className="flex justify-between font-bold">
                <span className={`flex items-center gap-1.5 ${hpPercent < 25 ? "text-[#ef4444]" : hpPercent < 60 ? "text-[#f59e0b]" : "text-[#ef4444]"}`}>
                  <PixelFlameIcon className="w-3.5 h-3.5" />
                  BOSS HEALTH (HP)
                </span>
                <span className="text-white font-pixel-chunky text-sm tabular-nums">
                  {hpPercent.toFixed(1)}% HP
                </span>
              </div>
              <PixelProgress
                value={hpPercent}
                max={100}
                variant={hpPercent < 25 ? "danger" : hpPercent < 60 ? "warning" : "danger"}
                height="lg"
              />
            </div>

            {/* Win Condition Directive Card */}
            <div className="p-4 bg-[#140e0c] border-2 border-[#4a3830] text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 font-pixel text-[10px] text-[#f59e0b] uppercase tracking-wider">
                <PixelTargetIcon className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>TARGET CHALLENGE GOAL</span>
              </div>
              <div className="font-pixel text-xs font-bold text-white uppercase">{boss.targetExercise}</div>
              <div className="flex items-center justify-center gap-2">
                <PixelDumbbellIcon className="w-5 h-5 text-[#f59e0b]" />
                <span className="font-pixel-chunky text-2xl text-[#f59e0b] tracking-wider font-bold">
                  {boss.targetWeight} KG × {boss.targetReps} REPS
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-pixel text-[9px] text-[#8c786a] pt-1">
                <PixelInfoIcon className="w-3 h-3 text-[#8c786a] shrink-0" />
                <span>Damage dealt scales with weight and reps logged on the target exercise.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action & Info Deck */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Bounty Loot Rewards Deck */}
          <div className="pixel-stone-slab p-5 border-2 border-[#4a3830] select-none">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4a3830]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#140e0c] border border-[#b45309] flex items-center justify-center text-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                  <PixelTrophyIcon className="w-4 h-4 text-[#f59e0b]" />
                </div>
                <div>
                  <h3 className="font-pixel text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Challenge Completion Rewards
                  </h3>
                  <p className="font-pixel text-[9px] text-stone-400">
                    Claimed when the weekly boss is defeated
                  </p>
                </div>
              </div>
              {boss.isDefeated && (
                <span className="flex items-center gap-1 text-[9px] font-pixel font-bold text-[#10b981] bg-[#062c20] px-2 py-0.5 border border-[#065f46]">
                  <PixelCheckIcon className="w-3 h-3 text-[#10b981]" />
                  CLAIMED
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              <PixelBadge variant="iron" size="sm" className="flex items-center gap-1">
                <PixelSparklesIcon className="w-3 h-3 text-stone-300" />
                <span>+{rewards.exp || 2500} EXP</span>
              </PixelBadge>

              <PixelBadge variant="gold" size="sm" className="flex items-center gap-1">
                <CurrencyIcon type="GOLD" size="xs" />
                <span>+{rewards.gold || 1000} GOLD</span>
              </PixelBadge>

              <PixelBadge variant="danger" size="sm" className="flex items-center gap-1">
                <CurrencyIcon type="GEMS" size="xs" />
                <span>+{rewards.gems || 50} GEMS</span>
              </PixelBadge>

              <PixelBadge variant="warning" size="sm" className="flex items-center gap-1">
                <CurrencyIcon type="TOWER_TOKENS" size="xs" />
                <span>+{rewards.towerTokens || 100} TOKENS</span>
              </PixelBadge>

              <PixelBadge variant="success" size="sm" className="flex items-center gap-1 text-emerald-400">
                <PixelLightningIcon className="w-3 h-3 text-emerald-400" />
                <span>+{rewards.statAmount || 2} {rewards.stat || "STRENGTH"}</span>
              </PixelBadge>
            </div>
          </div>

          {/* Tactical Directive Instructions */}
          <div className="pixel-stone-slab p-5 bg-[#140e0c] border-2 border-[#4a3830] space-y-3 font-pixel text-[10px] text-stone-300 select-none">
            <div className="text-white uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-[#4a3830] font-bold">
              <PixelScrollIcon className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Tactical Directives & Rules</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-2 bg-[#1b1310] border border-[#4a3830]/70">
                <div className="w-6 h-6 shrink-0 bg-[#2b1806] border border-[#b45309] flex items-center justify-center text-[#f59e0b]">
                  <PixelDumbbellIcon className="w-3.5 h-3.5 text-[#f59e0b]" />
                </div>
                <div className="pt-0.5">
                  <span className="text-[#f59e0b] font-bold block mb-0.5">PHASE 1: LOG BENCHMARK SETS</span>
                  <span className="text-stone-300">
                    Start a workout and log your sets for <strong className="text-white">{boss.targetExercise}</strong>.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-[#1b1310] border border-[#4a3830]/70">
                <div className="w-6 h-6 shrink-0 bg-[#2d0e0e] border border-[#7f1d1d] flex items-center justify-center text-[#ef4444]">
                  <PixelSwordIcon className="w-3.5 h-3.5 text-[#ef4444]" />
                </div>
                <div className="pt-0.5">
                  <span className="text-[#ef4444] font-bold block mb-0.5">PHASE 2: CALCULATE OVERLOAD</span>
                  <span className="text-stone-300">
                    Damage is automatically calculated from the weight and reps you lift against the target benchmark.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-[#1b1310] border border-[#4a3830]/70">
                <div className="w-6 h-6 shrink-0 bg-[#1f1714] border border-[#8c786a] flex items-center justify-center text-[#8c786a]">
                  <PixelClockIcon className="w-3.5 h-3.5 text-[#8c786a]" />
                </div>
                <div className="pt-0.5">
                  <span className="text-[#8c786a] font-bold block mb-0.5">PHASE 3: WEEKLY RESET CYCLE</span>
                  <span className="text-stone-300">
                    Damage accumulates throughout the week until reset on{" "}
                    <strong suppressHydrationWarning className="text-[#f59e0b]">{new Date(boss.expiresAt).toLocaleDateString()}</strong>.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Arena Challenge Launch Button */}
          <PixelButton
            variant={boss.isDefeated ? "dark" : isWorkoutActive ? "gold" : "danger"}
            size="lg"
            disabled={boss.isDefeated || isWorkoutActive}
            onClick={handleStartChallenge}
            className="w-full py-4 text-xs font-pixel uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {boss.isDefeated ? (
              <>
                <PixelTrophyIcon className="w-4 h-4 text-[#10b981]" />
                <span className="text-[#10b981]">BOSS DEFEATED THIS WEEK</span>
              </>
            ) : isWorkoutActive ? (
              <>
                <PixelShieldIcon className="w-4 h-4 text-[#f59e0b]" />
                <span>SESSION ACTIVE (CHECK HUD)</span>
              </>
            ) : (
              <>
                <PixelSwordIcon className="w-4 h-4 text-white" />
                <span>START BOSS WORKOUT</span>
              </>
            )}
          </PixelButton>
        </div>
      </div>

      {/* ========================================================= */}
      {/* COMBAT DAMAGE LOG FEED TERMINAL */}
      {/* ========================================================= */}
      <div className="pixel-stone-slab p-5 border-2 border-[#4a3830] select-none">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#4a3830]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#140e0c] border border-[#7f1d1d] flex items-center justify-center text-[#ef4444]">
              <PixelSwordIcon className="w-4 h-4 text-[#ef4444]" />
            </div>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Workout Damage History
              </h3>
              <p className="font-pixel text-[9px] text-stone-400">
                Recent sets and damage dealt to {boss.name}
              </p>
            </div>
          </div>
          <span className="font-pixel text-[9px] text-stone-400 uppercase font-bold flex items-center gap-1 bg-[#140e0c] px-2 py-1 border border-[#4a3830]">
            <PixelScrollIcon className="w-3 h-3 text-[#8c786a]" />
            {damageLogs.length} LOGS
          </span>
        </div>

        <div className="pt-4">
          {damageLogs.length === 0 ? (
            <div className="p-8 text-center text-[#8c786a] font-pixel text-[10px] border-2 border-dashed border-[#4a3830] bg-[#140e0c] flex flex-col items-center justify-center gap-2">
              <PixelOpenGrimoireIcon className="w-8 h-8 text-[#8c786a]/60" />
              <span>No sets logged yet this week. Log sets of {boss.targetExercise} to deal damage.</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1 font-pixel text-[10px]">
              {damageLogs.map((log: any, idx: number) => (
                <div
                  key={log.id || idx}
                  className="p-3 bg-[#140e0c] border border-[#4a3830] flex items-center justify-between hover:border-[#7f1d1d]/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <PixelBadge variant="danger" size="sm" className="text-[9px] px-1.5 py-0.5 flex items-center gap-1 border border-[#7f1d1d]">
                      <PixelFlameIcon className="w-2.5 h-2.5 text-[#ef4444]" />
                      DMG
                    </PixelBadge>
                    <div>
                      <p className="text-stone-200 flex items-center gap-1.5 flex-wrap">
                        <span>Dealt</span>
                        <span className="text-[#ef4444] font-bold font-pixel-chunky text-sm">
                          {(log.damageDealt || 2000).toLocaleString()} DMG
                        </span>
                        <span className="text-stone-400 flex items-center gap-1">
                          with <PixelDumbbellIcon className="w-3 h-3 text-[#f59e0b] inline" /> {log.exerciseName} ({log.weight} KG × {log.reps} Reps)
                        </span>
                      </p>
                      <p className="text-[9px] text-stone-400 mt-0.5 flex items-center gap-1">
                        <span>Remaining Boss HP:</span>
                        <span className="text-[#f59e0b] font-bold">{log.hpPercentAfter}%</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] text-[#8c786a] flex items-center gap-1 shrink-0">
                    <PixelClockIcon className="w-3 h-3 text-[#8c786a]" />
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

