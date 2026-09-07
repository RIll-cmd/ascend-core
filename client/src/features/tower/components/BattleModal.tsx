"use client";

import { useEffect, useState, useRef } from "react";
import { useTowerStore } from "@/features/tower/store/useTowerStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import {
  PixelTrophyIcon,
  PixelSkullIcon,
  PixelSparklesIcon,
  PixelBotIcon,
} from "@/components/ui/pixel/PixelIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { playUISound, playAIRASound } from "@/utils/audio";
import { getEnemySpritePath, CHARACTER_AVATAR_PREVIEW } from "@/utils/sprites";
import { CurrencyIcon } from "@/components/CurrencyDisplay";

export function BattleModal() {
  const { combatLog, clearCombatLog, cielAnalysis, isAnalyzing, selectedFloor } = useTowerStore();
  const { character } = useCharacterStore();
  
  const [displayedEvents, setDisplayedEvents] = useState<any[]>([]);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!combatLog) {
      setDisplayedEvents([]);
      setIsAnimationComplete(false);
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
    }, 400); // Increased interval slightly to let sounds breathe
    
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
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl flex items-center gap-2 font-bold tracking-tight">
            {combatLog?.isVictory ? (
              <span className="text-emerald-400 flex items-center gap-2"><PixelTrophyIcon className="w-7 h-7 text-emerald-400"/> TOWER CLEARED</span>
            ) : (
              <span className="text-rose-500 flex items-center gap-2"><PixelSkullIcon className="w-7 h-7 text-rose-500"/> ASCENSION FAILED</span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {combatLog && (
          <div className="space-y-4 mt-2 flex-1 overflow-y-auto pr-1.5 custom-scrollbar flex flex-col min-h-0">
            {/* Animated Face-Off Stage */}
            <div className="relative p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#151C33] to-red-950/40 border border-slate-800 flex items-center justify-around overflow-hidden shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-indigo-950/60 border border-cyan-500/40 p-1 flex items-center justify-center">
                  <img
                    src={CHARACTER_AVATAR_PREVIEW}
                    alt={character?.name || "Player"}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="font-mono text-xs">
                  <p className="font-bold text-cyan-300">{character?.name || "Player"}</p>
                  <p className="text-[10px] text-slate-400">Lv. {character?.level || 1}</p>
                </div>
              </div>

              <div className="font-mono font-black text-red-500 text-xs tracking-widest px-2.5 py-1 rounded bg-red-950/40 border border-red-500/30 animate-pulse">
                VS
              </div>

              <div className="flex items-center gap-3">
                <div className="font-mono text-xs text-right">
                  <p className="font-bold text-red-400">{selectedFloor?.enemy?.name || "Guardian"}</p>
                  <p className="text-[10px] text-slate-400">Lv. {selectedFloor?.enemy?.level || 1}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-red-950/60 border border-red-500/40 p-1 flex items-center justify-center">
                  <img
                    src={getEnemySpritePath(selectedFloor?.enemy?.name || "", selectedFloor?.floorNumber || 1, selectedFloor?.isBoss)}
                    alt={selectedFloor?.enemy?.name || "Enemy"}
                    className="w-full h-full object-contain transform -scale-x-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50 shrink-0">
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Turns</p>
                <p className="text-2xl font-mono font-bold text-foreground">{combatLog.turnsElapsed}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Player HP</p>
                <p className={`text-2xl font-mono font-bold ${combatLog.playerHpRemaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {combatLog.playerHpRemaining}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Enemy HP</p>
                <p className={`text-2xl font-mono font-bold ${combatLog.enemyHpRemaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {combatLog.enemyHpRemaining}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Damage</p>
                <p className="text-2xl font-mono font-bold text-orange-400">{combatLog.totalDamageDealt}</p>
              </div>
            </div>
            
            {combatLog.rewards && combatLog.isVictory && isAnimationComplete && (
              <div className="border border-indigo-500/20 p-4 rounded-xl bg-indigo-500/5 shrink-0 animate-in fade-in zoom-in-95 duration-500 shadow-sm shadow-indigo-500/10">
                <h4 className="font-bold text-indigo-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <PixelSparklesIcon className="w-4 h-4 text-indigo-400"/> Loot Drops
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {combatLog.rewards.gold > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-md flex items-center gap-1.5">
                      <CurrencyIcon type="GOLD" size="xs" />
                      <span className="text-yellow-500 font-bold">+{combatLog.rewards.gold} Gold</span>
                    </div>
                  )}
                  {combatLog.rewards.exp > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-md">
                      <span className="text-blue-400 font-bold">+{combatLog.rewards.exp} EXP</span>
                    </div>
                  )}
                  {(combatLog.rewards.gems || 0) > 0 && (
                    <div className="bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-md flex items-center gap-1.5">
                      <CurrencyIcon type="GEMS" size="xs" />
                      <span className="text-purple-400 font-bold">+{combatLog.rewards.gems} Gems</span>
                    </div>
                  )}
                  {(combatLog.rewards.towerTokens || 0) > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-md flex items-center gap-1.5">
                      <CurrencyIcon type="TOWER_TOKENS" size="xs" />
                      <span className="text-amber-400 font-bold">+{combatLog.rewards.towerTokens} Tokens</span>
                    </div>
                  )}
                  {combatLog.rewards.items?.map((item, i) => (
                    <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md">
                      <span className="text-emerald-400 font-bold">+{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="min-h-[160px] border rounded-xl overflow-hidden bg-card shadow-sm flex flex-col shrink-0">
              <div className="bg-muted px-4 py-2 border-b">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Combat Log</h4>
              </div>
              <div ref={scrollRef} className="max-h-48 p-4 overflow-y-auto space-y-3 font-mono text-sm scroll-smooth custom-scrollbar">
                {displayedEvents.map((ev, idx) => {
                  const isPlayer = ev.actor === character?.name;
                  const isCrit = ev.message && ev.message.toLowerCase().includes("critical");
                  
                  return (
                    <div key={idx} className={`animate-in fade-in slide-in-from-left-2 duration-300 ${isCrit ? 'bg-yellow-500/10 p-2 rounded border border-yellow-500/20' : ''}`}>
                      <span className="text-muted-foreground/60 mr-2">[T{ev.turn}]</span>
                      <span className={`font-bold ${isPlayer ? 'text-blue-400' : 'text-red-400'}`}>
                        {ev.actor}
                      </span>
                      {" "} <span className="text-foreground/80">{ev.action}</span>, dealing <span className="text-orange-400 font-bold">{ev.damage}</span> damage.
                      {ev.message && <span className="ml-2 text-muted-foreground italic">({ev.message})</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {isAnimationComplete && (
              <div className="mt-2 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-[#0c1a24] border border-cyan-900/50 p-4 rounded-xl relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                  
                  <div className="flex items-center gap-2 mb-2">
                    <PixelBotIcon className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-bold text-cyan-400 uppercase tracking-widest text-xs">A.I.R.A Tactical Analysis</h4>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3 text-cyan-500/70 py-2">
                      <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                      <span className="animate-pulse font-mono text-sm tracking-wide">Processing battle telemetry...</span>
                    </div>
                  ) : (
                    <div className="max-h-52 overflow-y-auto custom-scrollbar pr-1">
                      <p className="text-sm font-mono text-cyan-100/90 whitespace-pre-wrap leading-relaxed">
                        {cielAnalysis || "<< Report. >> Error communicating with AIRA core."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex justify-end gap-3 shrink-0 border-t border-slate-800/80">
                  <button
                    onClick={() => clearCombatLog()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold font-mono text-xs uppercase tracking-wider shadow-md"
                  >
                    Acknowledge Telemetry
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
