"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Bell,
  Bird,
  BookOpen,
  Sparkles,
  Leaf,
  Footprints,
  Volume2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useBeastStore } from "@/features/beasts/store/useBeastStore";
import { EggIncubatorWidget } from "@/components/beasts/EggIncubatorWidget";
import { BeastBestiary } from "@/components/beasts/BeastBestiary";
import { MysteryEggShop } from "@/features/beasts/components/MysteryEggShop";
import { HatchCelebrationModal } from "@/features/beasts/components/HatchCelebrationModal";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import meadow from "../styles/MeadowAviary.module.css";

export function BeastsAndPetsView() {
  const { user } = useUser();
  const { character } = useCharacterStore();
  const { collection } = useBeastStore();
  const characterId = character?.id || user?.id || "char-id-123";

  const [bellRung, setBellRung] = useState(false);

  const activeEgg = collection?.activeEgg || null;
  const equipped = collection?.equippedBeast || null;
  const passive = collection?.passiveBuffs || {};
  const bonusType =
    equipped?.statBonusType || equipped?.passiveBuffType || "EXP_PERCENT";
  const bonusValue =
    equipped?.statBonusValue ?? equipped?.passiveBuffValue ?? 0;

  const handleRingBell = () => {
    playUIMenuSFX("confirm");
    playBuffSFX("speed");
    setBellRung(true);
    setTimeout(() => setBellRung(false), 2400);
  };

  return (
    <div className="relative min-h-screen font-sans -m-3 sm:-m-5 md:-m-6 p-3 sm:p-5 md:p-6">
      {/* ========================================================================= */}
      {/* 1. FULL-BLEED FIXED VIEWPORT SANCTUARY MEADOW BACKGROUND & GRADIENT OVERLAY */}
      {/* ========================================================================= */}
      <div
        className="fixed inset-0 -z-20 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/backgrounds/meadow-aviary.png')" }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-b from-transparent via-[#1c2e22]/35 to-[#0b1710]/92 pointer-events-none"
        aria-hidden="true"
      />

      {/* ========================================================================= */}
      {/* 2. UNIFIED CENTERED CONTAINER */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6 relative z-10 space-y-6 sm:space-y-8">
        {/* === SANCTUARY BANNER HEADER === */}
        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl border-[3px] border-[#22352b] bg-gradient-to-b from-[#2a3f33]/95 to-[#1c2c23]/95 text-[#fef3c7] shadow-[0_12px_28px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
          {/* Subtle decorative leaf vines */}
          <div
            className="absolute -top-3 left-6 right-6 flex justify-between pointer-events-none text-emerald-400/80"
            aria-hidden="true"
          >
            <Leaf className="w-7 h-7 -rotate-12 fill-emerald-800/60" />
            <Leaf className="w-6 h-6 rotate-45 fill-emerald-800/60 hidden sm:block" />
            <Leaf className="w-7 h-7 rotate-12 fill-emerald-800/60" />
          </div>

          <div className="space-y-1.5 min-w-0">
            <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-widest block">
              OPEN-AIR FAMILIAR NURSERY
            </span>
            <h1 className="m-0 font-pixel text-2xl sm:text-3xl lg:text-4xl text-[#ffd98a] drop-shadow-[2px_2px_0_#142018] tracking-tight">
              The Meadow Aviary
            </h1>
            <p className="m-0 text-xs sm:text-sm text-[#e2dfbb] max-w-prose leading-relaxed">
              A little walking. A little wonder. A new friend waiting to hatch.
            </p>
          </div>

          {/* Header Stat Badges (Strictly Vector Lucide Icons) */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Unlocked Species */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#d8b36f] border-2 border-[#86612c] text-[#3f321d] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_6px_rgba(0,0,0,0.25)]">
              <div className="w-8 h-8 rounded-lg bg-black/15 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-[#4a3517]" aria-hidden="true" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#574325]">
                  Unlocked species
                </span>
                <strong className="font-pixel text-sm sm:text-base font-bold text-[#2a1d0c] mt-0.5">
                  {collection?.totalDiscovered || 0} / {collection?.totalSpecies || 20}
                </strong>
              </div>
            </div>

            {/* Sanctuary Multiplier */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#d8b36f] border-2 border-[#86612c] text-[#3f321d] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_6px_rgba(0,0,0,0.25)]">
              <div className="w-8 h-8 rounded-lg bg-black/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#8a570f]" aria-hidden="true" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#574325]">
                  Sanctuary multiplier
                </span>
                <strong className="font-pixel text-sm sm:text-base font-bold text-[#2a1d0c] mt-0.5">
                  +{Number(passive.EXP_BOOST || 0).toFixed(0)}%
                </strong>
              </div>
            </div>
          </div>
        </header>

        {/* === CHAMBER ROW: INCUBATOR NEST & FAMILIAR'S ROOST === */}
        <section
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          aria-label="Incubation chamber and familiar roost"
        >
          {/* Left 7 Columns: The Overgrown Nest */}
          <div className="lg:col-span-7">
            <EggIncubatorWidget
              egg={activeEgg}
              characterId={characterId}
              onSelectEggClick={() =>
                document.getElementById("aviary-market")?.scrollIntoView({ behavior: "smooth" })
              }
            />
          </div>

          {/* Right 5 Columns: Your Familiar's Roost */}
          <article className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-7 rounded-2xl border-[3px] border-[#8d784b] bg-gradient-to-b from-[#fef7e6] to-[#f4e9cd] shadow-[0_10px_24px_rgba(0,0,0,0.3)] text-[#273d2c]">
            {/* Roost Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#b6b389]">
              <h2 className="m-0 font-pixel text-base font-bold text-[#22543d]">
                Your Familiar&apos;s Roost
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border ${
                  equipped
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-[#e3d3a0] text-[#5b3c19] border-[#c0af78]"
                }`}
              >
                {equipped ? "BONDED" : "PERCH OPEN"}
              </span>
            </div>

            {/* Perch Stage & Fixed Wooden Roost Beam */}
            <div className="py-6 flex flex-col items-center justify-end min-h-[220px] relative">
              {/* Bonded Beast or Empty Perch Icon */}
              {equipped ? (
                <div className="relative mb-2">
                  <img
                    src={equipped.spritePath?.replace(".png", ".gif") || "/beasts/beast_1.gif"}
                    alt={`${equipped.name}, your bonded familiar`}
                    width={140}
                    height={140}
                    className="object-contain drop-shadow-[0_4px_12px_rgba(34,84,61,0.35)] select-none"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 mb-4 rounded-2xl bg-[#eedec0]/80 border-2 border-[#b89f70] flex items-center justify-center shadow-inner group">
                  <Bird className="w-12 h-12 text-[#8b7250] group-hover:scale-105 transition-transform" />
                </div>
              )}

              {/* Wooden Perch Roosting Beam with Corrected Bell Mount */}
              <div className="w-3/4 max-w-[280px] h-4 rounded-sm bg-gradient-to-b from-[#799650] via-[#5c3e21] to-[#38200d] border border-[#2b1708] shadow-[0_4px_8px_rgba(0,0,0,0.3)] relative flex items-center justify-between px-3">
                {/* Center Support Strut */}
                <div className="absolute left-1/2 -translate-x-1/2 top-4 w-3.5 h-6 bg-[#4a2e16] border-x border-[#2b1708]" />

                {/* Left Moss Accent */}
                <div className="w-4 h-1.5 rounded-full bg-[#82a356] opacity-80" />

                {/* Right Brass Bell Hanging Fixture (Securely Mounted to Beam) */}
                <div className="absolute right-3 top-2 flex flex-col items-center">
                  {/* Brass Chain Link */}
                  <span className="w-0.5 h-2.5 bg-[#b38936] shadow-xs" />
                  {/* Brass Hanging Bell */}
                  <button
                    type="button"
                    onClick={handleRingBell}
                    className="p-1 rounded-full bg-[#d8b36f] hover:bg-[#edd093] active:scale-95 border border-[#7a5521] text-[#4d3416] shadow-sm transition-transform cursor-pointer"
                    title="Ring the Sanctuary Bell to summon your familiar"
                    aria-label="Ring the Sanctuary Bell to summon your familiar"
                  >
                    <Bell className={`w-3.5 h-3.5 ${bellRung ? "animate-bounce text-amber-700" : ""}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Bell Summon Action Chip */}
            <div className="flex items-center justify-center pt-2 pb-1">
              <button
                type="button"
                onClick={handleRingBell}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ddc498] hover:bg-[#ecd4aa] active:translate-y-0.5 border-2 border-[#94773e] text-[#4a3318] font-pixel text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Bell className={`w-3.5 h-3.5 text-[#735324] ${bellRung ? "animate-spin" : ""}`} />
                <span>{bellRung ? "Sanctuary Bell Chiming..." : "Ring Bell to Summon"}</span>
              </button>
            </div>

            {/* Name Tag & Species Lore */}
            <div className="text-center space-y-1 my-3">
              <div className="inline-block px-4 py-1.5 rounded-md bg-[#ead29b] border border-[#aa8746] text-[#4a3014] font-pixel text-sm font-bold shadow-xs">
                {equipped ? equipped.name : "A quiet perch awaits"}
              </div>
              <p className="text-xs text-[#536144] max-w-xs mx-auto leading-relaxed">
                {equipped
                  ? `${equipped.species} · ${equipped.element} familiar`
                  : "Bond with a familiar from the field journal and they will make this mossy ledge their home."}
              </p>
            </div>

            {/* Active Stat Buff */}
            {equipped && (
              <div className="flex items-center justify-between px-3.5 py-2 mb-3 rounded-lg bg-[#e7edcf] border border-[#b8c69c] text-xs font-mono text-[#27402c]">
                <span className="font-bold">{bonusType.replaceAll("_", " ")}</span>
                <strong className="text-emerald-800">+{bonusValue.toFixed(1)}%</strong>
              </div>
            )}

            {/* Sanctuary Passive Resonance Placard */}
            <div className="mt-auto p-3.5 rounded-xl bg-[#e2d4ac] border-2 border-[#ad9460] text-xs text-[#354325] space-y-2 shadow-inner">
              <h3 className="m-0 font-pixel text-xs font-bold text-[#2b442b] flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                Sanctuary Passive Resonance
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-[#c2b287]">
                <div className="flex items-center justify-between">
                  <span className="text-[#59694e]">EXP bonus:</span>
                  <strong className="text-[#204a2c]">
                    +{Number(passive.EXP_BOOST || 0).toFixed(0)}%
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#59694e]">Gold bonus:</span>
                  <strong className="text-[#204a2c]">
                    +{Number(passive.GOLD_BOOST || 0).toFixed(0)}%
                  </strong>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* === EGG MARKET & STORAGE (MYSTERY EGG SHOP) === */}
        <section id="aviary-market" className="scroll-mt-24">
          <MysteryEggShop
            characterId={characterId}
            ownedEggs={collection?.ownedEggs || []}
            activeEggId={activeEgg?.id}
          />
        </section>

        {/* === NATURALIST'S FIELD JOURNAL (BEAST BESTIARY) === */}
        <section className={`scroll-mt-24 ${meadow.journal} ${meadow.legacy}`}>
          <BeastBestiary
            characterId={characterId}
            bestiary={collection?.bestiary || []}
            totalDiscovered={collection?.totalDiscovered || 0}
            totalSpecies={collection?.totalSpecies || 20}
          />
        </section>

        {/* Hatch Celebration Modal */}
        <HatchCelebrationModal characterId={characterId} />
      </div>
    </div>
  );
}

export default BeastsAndPetsView;
