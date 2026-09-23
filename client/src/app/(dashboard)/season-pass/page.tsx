"use client";

import React, { useEffect, useState } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { API_BASE_URL } from "@/constants";
import { Sparkles, Check, Lock, Gift, Star, ShieldCheck } from "lucide-react";
import { playUIMenuSFX, playBuffSFX, playAIRASound } from "@/utils/audio";
import { Button } from "@/components/ui/button";
import { AscendRouteSkeleton } from "@/components/loading/AscendRouteSkeleton";

interface SeasonTier {
  id: string;
  tierNumber: number;
  requiredXp: number;
  freeReward: { type: string; amount: number; name?: string };
  premiumReward: { type: string; amount: number; name?: string };
  freeIcon: string;
  premiumIcon: string;
  isUnlocked: boolean;
  isFreeClaimed: boolean;
  isPremiumClaimed: boolean;
}

interface SeasonPassData {
  seasonId: string;
  seasonNumber: number;
  title: string;
  endDate: string;
  passXp: number;
  isPremium: boolean;
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
  tiers: SeasonTier[];
}

export default function SeasonPassPage() {
  const { character, loadCharacter } = useCharacterStore();
  const [seasonData, setSeasonData] = useState<SeasonPassData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (character?.id) {
      fetchSeasonPass();
    }
  }, [character?.id]);

  const fetchSeasonPass = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/season-pass/${character?.id}`);
      if (res.ok) {
        const data = await res.json();
        setSeasonData(data);
      }
    } catch (err) {
      console.error("Error fetching season pass", err);
    } finally {
      setLoading(false);
    }
  };

  const claimTier = async (tierNumber: number | null = null) => {
    try {
      playUIMenuSFX("confirm");
      const res = await fetch(`${API_BASE_URL}/api/season-pass/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character?.id,
          tierNumber,
          claimType: "FREE" // Only FREE track for now per user feedback
        })
      });

      if (res.ok) {
        playBuffSFX();
        playAIRASound("EVOLUTION");
        fetchSeasonPass();
        loadCharacter();
      }
    } catch (err) {
      console.error("Error claiming tier", err);
    }
  };

  if (loading) {
    return <AscendRouteSkeleton preset="reward-track" label="Loading reward track" />;
  }

  if (!seasonData) {
    return <div className="text-center py-20 text-slate-400">No active season found.</div>;
  }

  const unclaimedUnlockedTiers = seasonData.tiers.filter(t => t.isUnlocked && !t.isFreeClaimed);
  const hasUnclaimed = unclaimedUnlockedTiers.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900/50 to-slate-900 border border-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.15)] mb-8">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-blue-400 font-mono text-sm font-bold tracking-widest mb-1">
              SEASON {seasonData.seasonNumber}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white font-heading tracking-tight mb-2">
              {seasonData.title}
            </h1>
            <p className="text-blue-200/70 text-sm">
              Ends in {Math.max(0, Math.ceil((new Date(seasonData.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xs font-mono text-slate-400 mb-2">CURRENT PASS XP</div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-3xl font-black text-white">{seasonData.passXp.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Claim All Bar */}
      <div className="flex items-center justify-between bg-[#151C33] p-4 rounded-xl border border-white/5 mb-8 sticky top-[80px] z-20 shadow-xl shadow-black/50 backdrop-blur-md">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-400" />
            Rewards Available
          </h3>
          <p className="text-xs text-slate-400">{unclaimedUnlockedTiers.length} unlocked tiers waiting</p>
        </div>
        <Button
          onClick={() => claimTier(null)}
          disabled={!hasUnclaimed}
          className={`font-bold tracking-wide ${
            hasUnclaimed 
              ? "bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          CLAIM ALL UNLOCKED
        </Button>
      </div>

      {/* Tiers List */}
      <div className="space-y-4">
        {seasonData.tiers.map((tier) => {
          const progress = Math.min((seasonData.passXp / tier.requiredXp) * 100, 100);
          
          return (
            <div 
              key={tier.id}
              className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                tier.isUnlocked 
                  ? "bg-[#151C33] border-blue-500/20" 
                  : "bg-[#0B1020] border-white/5 opacity-80"
              }`}
            >
              {/* Progress Background */}
              {tier.isUnlocked && !tier.isFreeClaimed && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none rounded-2xl" />
              )}
              <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-b-2xl transition-all duration-1000"
                style={{ width: `${progress}%`, opacity: tier.isUnlocked ? 1 : 0.3 }}
              />

              {/* Tier Badge */}
              <div className="w-16 flex flex-col items-center justify-center shrink-0">
                <div className="text-[10px] font-mono text-slate-500">TIER</div>
                <div className={`text-2xl font-black ${tier.isUnlocked ? "text-blue-400" : "text-slate-600"}`}>
                  {tier.tierNumber}
                </div>
              </div>

              {/* Free Reward Box */}
              <div className={`flex-1 flex items-center justify-between p-3 rounded-xl border ${
                tier.isFreeClaimed 
                  ? "bg-emerald-950/20 border-emerald-500/20" 
                  : tier.isUnlocked 
                    ? "bg-blue-950/20 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                    : "bg-black/40 border-white/5"
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center p-1 relative">
                    <img 
                      src={tier.freeIcon} 
                      alt="Reward" 
                      className={`w-full h-full object-contain ${!tier.isUnlocked && "grayscale opacity-50"}`}
                    />
                    {tier.isFreeClaimed && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-mono text-slate-400 mb-0.5">FREE REWARD</div>
                    <div className={`font-bold ${tier.isUnlocked ? "text-white" : "text-slate-500"}`}>
                      {tier.freeReward?.amount?.toLocaleString()} {tier.freeReward?.type}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {!tier.isUnlocked ? (
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> 
                      {seasonData.passXp.toLocaleString()} / {tier.requiredXp.toLocaleString()} XP
                    </div>
                  ) : tier.isFreeClaimed ? (
                    <span className="text-xs font-bold text-emerald-500/50">CLAIMED</span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => claimTier(tier.tierNumber)}
                      className="h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                    >
                      CLAIM
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
