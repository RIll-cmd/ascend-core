"use client";

import { useEffect, useState, useRef } from "react";
import { useTowerStore, CombatEvent } from "@/features/tower/store/useTowerStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import {
  PixelTrophyIcon,
  PixelSkullIcon,
  PixelBotIcon,
  PixelClockIcon,
  PixelHeartIcon,
  PixelSwordIcon,
} from "@/components/ui/pixel/PixelIcons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { playUISound, playAIRASound } from "@/utils/audio";
import { getEnemySpritePath, CHARACTER_AVATAR_PREVIEW } from "@/utils/sprites";
import { getEnemyBattlePresentation } from "./FloorBattleBanner";
import HealthBar from "@/components/ui/8bit/health-bar";
import EnemyHealthDisplay from "@/components/ui/8bit/enemy-health-display";
import VictoryScreen from "@/components/ui/8bit/blocks/victory-screen";
import GameOver from "@/components/ui/8bit/blocks/game-over";

export function BattleModal() {
  const { combatLog, clearCombatLog, cielAnalysis, isAnalyzing, selectedFloor } = useTowerStore();
  const { character } = useCharacterStore();
  
  const [prevCombatLog, setPrevCombatLog] = useState(combatLog);
  const [displayedEvents, setDisplayedEvents] = useState<CombatEvent[]>([]);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (prevCombatLog !== combatLog) {
    setPrevCombatLog(combatLog);
    setDisplayedEvents([]);
    setIsAnimationComplete(false);
  }

  useEffect(() => {
    if (!combatLog) {
      return;
    }
    
    // Animate combat events appearing one by one
    let i = 0;
    
    // Play initial victory or defeat sound
    if (combatLog.isVictory) {
      playUISound("/sounds/General/8_Buffs_Heals_SFX/30_Revive_03.wav");
      playAIRASound("SUCCESSFUL");
    } else {
      playUISound("/sounds/General/12_Player_Movement_SFX/61_Hit_03.wav");
      playAIRASound("FAILED");
    }

    const interval = setInterval(() => {
      if (i < combatLog.events.length) {
        const ev = combatLog.events[i];
        setDisplayedEvents(prev => [...prev, ev]);
        
        // Play SFX based on the event
        const isPlayer = ev.actor === character?.name;
        const isCrit = ev.message && ev.message.toLowerCase().includes("critical");
        const isMiss = ev.message && (ev.message.toLowerCase().includes("miss") || ev.message.toLowerCase().includes("evade"));
        const isBlock = ev.message && ev.message.toLowerCase().includes("block");
        
        if (isCrit) {
          playUISound("/sounds/General/8_Atk_Magic_SFX/18_Thunder_02.wav");
        } else if (isMiss) {
          playUISound("/sounds/General/10_Battle_SFX/35_Miss_Evade_02.wav");
        } else if (isBlock) {
          playUISound("/sounds/General/10_Battle_SFX/39_Block_03.wav");
        } else if (isPlayer) {
          playUISound("/sounds/General/12_Player_Movement_SFX/56_Attack_03.wav");
        } else {
          playUISound("/sounds/General/10_Battle_SFX/03_Claw_03.wav");
        }
        
        i++;
      } else {
        setIsAnimationComplete(true);
        clearInterval(interval);
      }
    }, 400);
    
    return () => clearInterval(interval);
  }, [combatLog]);

  useEffect(() => {
    if (cielAnalysis && !isAnalyzing) {
      playAIRASound("NOTICE");
    }
  }, [cielAnalysis, isAnalyzing]);

  useEffect(() => {
    if (combatLog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [combatLog]);

  useEffect(() => {
    // Auto-scroll to bottom as new events appear
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedEvents]);

  return (
    <Dialog open={!!combatLog} onOpenChange={(open) => !open && clearCombatLog()}>
      <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-[#181d17]/98 border-2 border-[#8c7a53] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_0_1px_rgba(140,122,83,0.4)] rounded-xl backdrop-blur-xl text-[#fff8df] [&>button.absolute]:border [&>button.absolute]:border-[#8c7a53] [&>button.absolute]:bg-[#1a1e17] [&>button.absolute]:text-[#f3df9d] [&>button.absolute]:hover:bg-[#343e2d] [&>button.absolute]:p-1.5 [&>button.absolute]:rounded-md [&>button.absolute]:shadow-[1px_1px_0_0_#000] [&>button.absolute]:opacity-90 [&>button.absolute]:hover:opacity-100 [&>button.absolute]:top-4 [&>button.absolute]:right-4">
        {/* Header Bar */}
        <header className="border-b-2 border-[#796b4c]/80 bg-[#252b21]/95 px-5 sm:px-6 py-4 shrink-0 flex items-center justify-between select-none">
          <div className="flex items-center gap-3.5 pr-8">
            <div className={`flex size-11 items-center justify-center rounded-lg border-2 shadow-[2px_2px_0_0_#000] shrink-0 ${
              combatLog?.isVictory 
                ? "border-[#c79d4d] bg-[#54351d] text-[#f3df9d]" 
                : "border-[#991b1b] bg-[#450a0a] text-[#f87171]"
            }`}>
              {combatLog?.isVictory ? (
                <PixelTrophyIcon className="size-6 text-[#f3df9d]" />
              ) : (
                <PixelSkullIcon className="size-6 text-[#f87171] animate-pulse" />
              )}
            </div>
            <div>
              <DialogTitle className="font-pixel text-xl sm:text-2xl font-bold tracking-wide flex items-center gap-2">
                {combatLog?.isVictory ? (
                  <span className="text-[#fff1b5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    TOWER CLEARED
                  </span>
                ) : (
                  <span className="text-[#fca5a5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    ASCENSION FAILED
                  </span>
                )}
              </DialogTitle>
              <p className="text-xs text-[#cbc3a7] mt-0.5">
                Floor {selectedFloor?.floorNumber || 1}: {selectedFloor?.enemy?.name || "Guardian"} · {
                  combatLog?.isVictory 
                    ? "Guardian Defeated • Spire Ascent Secured" 
                    : "Guardian Proved Fatal • Tactical Retreat Executed"
                }
              </p>
            </div>
          </div>
        </header>
        
        {combatLog && (
          <div className="space-y-3.5 p-4 sm:p-6 flex-1 overflow-y-auto tower-scrollbar flex flex-col min-h-0">
            {/* Animated Stone Arena Face-Off Dais */}
            <div className="relative p-3.5 sm:p-4 rounded-xl border-2 border-[#796b4c]/80 bg-[#1c221a]/95 flex items-center justify-around overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)] shrink-0">
              {/* Subtle ambient light gradient */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(140,122,83,0.14)_0%,transparent_75%)]" />

              {/* Player Challenger Card */}
              <div className="relative flex items-center gap-3 z-10 w-full sm:w-auto">
                <div className="size-13 sm:size-14 rounded-lg bg-[#252b21] border-2 border-[#8c7a53] p-1 flex items-center justify-center shadow-[2px_2px_0_0_#000] shrink-0">
                  <img
                    src={CHARACTER_AVATAR_PREVIEW}
                    alt={character?.name || "Player"}
                    className="w-full h-full object-contain [image-rendering:pixelated]"
                  />
                </div>
                <div className="font-mono text-xs flex-1 min-w-[120px]">
                  <p className="font-pixel text-xs font-bold text-[#fff1b5]">{character?.name || "Player"}</p>
                  <p className="text-[10px] text-[#cbc3a7] font-mono mt-0.5">Lv. {character?.level || 1} • {character?.power || 0} PWR</p>
                  <div className="mt-1 w-full max-w-[130px]">
                    <HealthBar
                      currentHp={combatLog.playerHpRemaining}
                      maxHp={Math.max(100, combatLog.playerHpRemaining)}
                      showText
                      variant="retro"
                      progressProps={{ className: "h-2" }}
                    />
                  </div>
                </div>
              </div>

              {/* 16-Bit RPG "VS" Emblem */}
              <div className="relative z-10 font-pixel text-xs px-3 py-1 rounded-md border-2 border-[#8c7a53] bg-[#382618] text-[#f3df9d] shadow-[2px_2px_0_0_#000] flex items-center justify-center tracking-wider select-none shrink-0 my-2 sm:my-0">
                VS
              </div>

              {/* Enemy Guardian Card */}
              <div className="relative flex items-center gap-3 z-10 w-full sm:w-auto justify-end">
                <div className="font-mono text-xs text-right flex-1 min-w-[140px]">
                  <EnemyHealthDisplay
                    enemyName={selectedFloor?.enemy?.name || "Guardian"}
                    level={selectedFloor?.enemy?.level || 1}
                    currentHealth={combatLog.enemyHpRemaining}
                    maxHealth={selectedFloor?.enemy?.hp || 100}
                    isBoss={selectedFloor?.isBoss}
                    showLevel
                    showHealthText
                    variant="retro"
                    healthBarColor="bg-gradient-to-r from-red-600 to-rose-500"
                    className="w-full max-w-[150px] ml-auto"
                  />
                </div>
                <div className="size-13 sm:size-14 rounded-lg bg-[#252b21] border-2 border-[#8c7a53] p-1 flex items-center justify-center shadow-[2px_2px_0_0_#000] shrink-0">
                  {(() => {
                    const enemyPres = getEnemyBattlePresentation(
                      selectedFloor?.enemy?.name || "",
                      selectedFloor?.isBoss || false
                    );
                    return (
                      <img
                        src={getEnemySpritePath(selectedFloor?.enemy?.name || "", selectedFloor?.floorNumber || 1, selectedFloor?.isBoss)}
                        alt={selectedFloor?.enemy?.name || "Enemy"}
                        style={{
                          transform: enemyPres.flip ? "scaleX(-1)" : undefined,
                        }}
                        className="w-full h-full object-contain [image-rendering:pixelated]"
                      />
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Combat Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              {/* Turns */}
              <div className="flex flex-col items-center justify-center p-2.5 rounded-lg border-2 border-[#6f6044]/70 bg-[#151913]/90 shadow-[2px_2px_0_0_#000]">
                <div className="flex items-center gap-1.5 text-[#bd9950] mb-0.5">
                  <PixelClockIcon className="size-3.5 text-[#bd9950]" />
                  <span className="font-pixel text-[9px] uppercase tracking-wider text-[#aaa187]">TURNS</span>
                </div>
                <p className="text-xl sm:text-2xl font-mono font-bold text-[#f3df9d] tabular-nums">
                  {combatLog.turnsElapsed}
                </p>
              </div>

              {/* Player HP */}
              <div className="flex flex-col items-center justify-center p-2.5 rounded-lg border-2 border-[#6f6044]/70 bg-[#151913]/90 shadow-[2px_2px_0_0_#000]">
                <div className="flex items-center gap-1.5 text-[#bd9950] mb-0.5">
                  <PixelHeartIcon className="size-3.5 text-[#86efac]" />
                  <span className="font-pixel text-[9px] uppercase tracking-wider text-[#aaa187]">PLAYER HP</span>
                </div>
                <p className={`text-xl sm:text-2xl font-mono font-bold tabular-nums ${combatLog.playerHpRemaining > 0 ? 'text-[#86efac]' : 'text-[#f87171]'}`}>
                  {combatLog.playerHpRemaining}
                </p>
              </div>

              {/* Enemy HP */}
              <div className="flex flex-col items-center justify-center p-2.5 rounded-lg border-2 border-[#6f6044]/70 bg-[#151913]/90 shadow-[2px_2px_0_0_#000]">
                <div className="flex items-center gap-1.5 text-[#bd9950] mb-0.5">
                  <PixelSkullIcon className="size-3.5 text-[#f87171]" />
                  <span className="font-pixel text-[9px] uppercase tracking-wider text-[#aaa187]">ENEMY HP</span>
                </div>
                <p className={`text-xl sm:text-2xl font-mono font-bold tabular-nums ${combatLog.enemyHpRemaining > 0 ? 'text-[#86efac]' : 'text-[#f87171]'}`}>
                  {combatLog.enemyHpRemaining}
                </p>
              </div>

              {/* Damage Dealt */}
              <div className="flex flex-col items-center justify-center p-2.5 rounded-lg border-2 border-[#6f6044]/70 bg-[#151913]/90 shadow-[2px_2px_0_0_#000]">
                <div className="flex items-center gap-1.5 text-[#bd9950] mb-0.5">
                  <PixelSwordIcon className="size-3.5 text-[#f59e0b]" />
                  <span className="font-pixel text-[9px] uppercase tracking-wider text-[#aaa187]">DMG DEALT</span>
                </div>
                <p className="text-xl sm:text-2xl font-mono font-bold text-[#f59e0b] tabular-nums">
                  {combatLog.totalDamageDealt}
                </p>
              </div>
            </div>
            
            {/* Spoils of Victory or Defeat Fanfare (8-bit Components) */}
            {isAnimationComplete && combatLog.isVictory && (
              <div className="shrink-0 animate-in fade-in zoom-in-95 duration-500">
                <VictoryScreen
                  floorNumber={selectedFloor?.floorNumber}
                  title={`${selectedFloor?.enemy?.name || "Guardian"} Defeated!`}
                  subtitle={`Spire ascent confirmed. Floor ${selectedFloor?.floorNumber || 1} conquered.`}
                  stats={[
                    { label: "TURNS", value: combatLog.turnsElapsed },
                    { label: "DMG DEALT", value: combatLog.totalDamageDealt.toLocaleString() },
                    { label: "REMAINING HP", value: `${combatLog.playerHpRemaining}` },
                    {
                      label: "GRADE",
                      value:
                        combatLog.playerHpRemaining > 80
                          ? "S-RANK"
                          : combatLog.playerHpRemaining > 40
                          ? "A-RANK"
                          : "B-RANK",
                    },
                  ]}
                  spoils={{
                    gold: combatLog.rewards?.gold || 0,
                    exp: combatLog.rewards?.exp || 0,
                    gems: combatLog.rewards?.gems || 0,
                    tokens: combatLog.rewards?.towerTokens || 0,
                    items:
                      combatLog.rewards?.items?.map((it, i) => ({
                        id: `spoil-${i}`,
                        name: it,
                        rarity: "rare" as const,
                      })) || [],
                  }}
                  onClaim={() => clearCombatLog()}
                  claimLabel="CLAIM SPOILS & ASCEND"
                />
              </div>
            )}

            {isAnimationComplete && !combatLog.isVictory && (
              <div className="shrink-0 animate-in fade-in zoom-in-95 duration-500">
                <GameOver
                  floorNumber={selectedFloor?.floorNumber}
                  title="ASCENSION HALTED"
                  subtitle={`The ${selectedFloor?.enemy?.name || "Guardian"} inflicted critical defeat. Regroup, hone stats, and ascend again.`}
                  onRetreat={() => clearCombatLog()}
                  retryLabel="TRY AGAIN"
                  retreatLabel="ACKNOWLEDGE RETREAT"
                />
              </div>
            )}

            {/* Combat Log (Battle Chronicle) */}
            <div className="min-h-[160px] border-2 border-[#6f6044]/70 rounded-xl overflow-hidden bg-[#141812]/95 shadow-[2px_2px_0_0_#000] flex flex-col shrink-0">
              <div className="bg-[#1d2319] px-4 py-2 border-b border-[#5c4d37] flex items-center justify-between">
                <h4 className="font-pixel text-[10px] sm:text-[11px] uppercase tracking-wider text-[#e8c46c] flex items-center gap-2">
                  <PixelSwordIcon className="size-3.5 text-[#bd9950]" /> Battle Chronicle
                </h4>
                <span className="font-mono text-[10px] text-[#aaa187]">
                  {displayedEvents.length} actions logged
                </span>
              </div>
              <div ref={scrollRef} className="max-h-44 p-3.5 sm:p-4 overflow-y-auto space-y-2.5 font-mono text-xs scroll-smooth tower-scrollbar">
                {displayedEvents.map((ev, idx) => {
                  const isPlayer = ev.actor === character?.name;
                  const isCrit = ev.message && ev.message.toLowerCase().includes("critical");
                  
                  return (
                    <div key={idx} className={`animate-in fade-in slide-in-from-left-2 duration-300 leading-relaxed ${isCrit ? 'bg-[#f59e0b]/10 p-2 rounded border border-[#f59e0b]/30' : ''}`}>
                      <span className="text-[#8d8064] mr-2 bg-[#1c221a] px-1.5 py-0.5 rounded border border-[#443828] text-[10px] font-mono">[T{ev.turn}]</span>
                      <span className={`font-bold ${isPlayer ? 'text-[#38bdf8]' : 'text-[#f87171]'}`}>
                        {ev.actor}
                      </span>
                      {" "} <span className="text-[#ddd4b7]">{ev.action}</span>, dealing <span className="text-[#f59e0b] font-bold">{ev.damage}</span> damage.
                      {ev.message && <span className="ml-2 text-[#aaa187] italic">({ev.message})</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* A.I.R.A. Magitech Telemetry Analysis */}
            {isAnimationComplete && (
              <div className="mt-1 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-[#09151c]/95 border-2 border-[#164e63] p-4 rounded-xl relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#38bdf8] via-[#06b6d4] to-[#0284c7] shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <PixelBotIcon className="w-4 h-4 text-[#38bdf8]" />
                      <h4 className="font-pixel text-[10px] sm:text-[11px] text-[#38bdf8] uppercase tracking-widest">
                        A.I.R.A. TACTICAL ANALYSIS
                      </h4>
                    </div>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-[#0891b2]/40 bg-[#0e2a38] text-[#a5f3fc]">
                      LIVE TELEMETRY
                    </span>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3 text-cyan-400/80 py-2">
                      <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                      <span className="animate-pulse font-mono text-xs tracking-wide">Deciphering combat telemetry...</span>
                    </div>
                  ) : (
                    <div className="max-h-44 overflow-y-auto tower-scrollbar pr-1">
                      <p className="text-xs font-mono text-cyan-100/90 whitespace-pre-wrap leading-relaxed">
                        {cielAnalysis || "<< Report. >> Error communicating with AIRA core."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tactical Footer Action Button */}
                <div className="pt-3.5 flex justify-end gap-3 shrink-0">
                  <button
                    onClick={() => clearCombatLog()}
                    className="h-11 px-6 rounded-md border-2 border-[#e0bd68] bg-[#76502f] hover:bg-[#8b6038] text-[#fff2be] font-pixel text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Acknowledge Telemetry</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
