"use client";

import React from "react";
import Image from "next/image";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { CurrencyIcon, CurrencyType } from "@/components/CurrencyDisplay";
import { CURRENCY_LORE } from "@/features/lore/loreData";

export interface ShopHeaderProps {
  character: {
    gold: number;
    gems?: number;
    towerTokens?: number;
  };
  announcement: string;
  shopRefreshCharges: number;
  maxShopRefreshCharges: number;
  className?: string;
}

interface UniformCurrencyCardProps {
  label: string;
  value: number;
  type: CurrencyType;
  lore: (typeof CURRENCY_LORE)[keyof typeof CURRENCY_LORE];
}

function UniformCurrencyCard({ label, value, type, lore }: UniformCurrencyCardProps) {
  return (
    <SystemTooltip
      title={lore.name}
      category={lore.category}
      rarity={lore.rarity}
      description={lore.description}
      lore={lore.lore}
      mechanics={lore.mechanics}
      stats={[{ label: "Purse Balance", value: value.toLocaleString() }]}
      tags={lore.tags}
      delayMs={500}
      className="w-full h-full flex-1 min-w-0"
    >
      <div
        tabIndex={0}
        role="group"
        aria-label={`${label}: ${value.toLocaleString()}`}
        className="flex items-center gap-2 sm:gap-2.5 w-full h-full min-h-[58px] sm:min-h-[64px] px-2 sm:px-3 py-2 bg-[#221811] hover:bg-[#2c2017] border-2 border-[#3d2716] shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),inset_-1px_-1px_0_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 group cursor-default"
      >
        {/* Inset Icon Slot */}
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center bg-black/60 border border-amber-900/50 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] group-hover:border-amber-700/60 transition-colors"
          aria-hidden="true"
        >
          <CurrencyIcon
            type={type}
            size={26}
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain [image-rendering:pixelated]"
          />
        </div>

        {/* Text Stack: Label over Numeric Value */}
        <div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-normal sm:tracking-wide text-amber-200/75 font-pixel leading-tight truncate">
            {label}
          </span>
          <span className="text-base sm:text-lg font-bold text-amber-300 font-pixel tracking-wide truncate leading-none mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tabular-nums">
            {value.toLocaleString()}
          </span>
        </div>
      </div>
    </SystemTooltip>
  );
}

export function ShopHeader({
  character,
  announcement,
  shopRefreshCharges,
  maxShopRefreshCharges,
  className = "",
}: ShopHeaderProps) {
  return (
    <header
      className={`border-[3px] border-[#160d08] bg-[#22150c] shadow-[0_10px_0_#140b07,0_18px_32px_rgba(0,0,0,0.65)] overflow-hidden ${className}`}
    >
      {/* Embedded scoped keyframes for merchant breathing / relic pulse idle animation */}
      <style jsx global>{`
        @keyframes merchant-idle {
          0%, 100% {
            transform: translateY(2px) scale(1.12);
            filter: drop-shadow(0 0 4px rgba(52, 211, 153, 0.45)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.6));
          }
          50% {
            transform: translateY(-2px) scale(1.12);
            filter: drop-shadow(0 0 9px rgba(52, 211, 153, 0.8)) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.7));
          }
        }
        .animate-merchant-idle {
          animation: merchant-idle 2.5s ease-in-out infinite;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
      `}</style>

      {/* === RETRO STRIPED TAVERN CANOPY AWNING === */}
      <div
        className="relative h-11 border-b-4 border-[#140c08] bg-[linear-gradient(rgba(255,255,255,0.04),transparent_42%),repeating-linear-gradient(90deg,#6b201a_0,#6b201a_52px,#451a03_52px,#451a03_104px)] shadow-[inset_0_-6px_0_rgba(0,0,0,0.22),0_5px_0_#8a5a2c]"
        aria-hidden="true"
      >
        <div
          className="absolute -bottom-3 left-0 right-0 h-3 bg-[repeating-linear-gradient(90deg,#4a120e_0,#4a120e_46px,transparent_46px,transparent_52px,#2d1307_52px,#2d1307_98px,transparent_98px,transparent_104px)]"
        />
      </div>

      {/* === STALL INTERIOR (50/50 BALANCED PROPORTION) === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch p-4 sm:p-6 lg:p-7 bg-[linear-gradient(90deg,rgba(245,158,11,0.035),transparent_46%),repeating-linear-gradient(0deg,rgba(255,255,255,0.025)_0,rgba(255,255,255,0.025)_1px,transparent_1px,transparent_24px)]">
        {/* LEFT COLUMN: MERCHANT AVATAR & SHOP SIGN CARD */}
        <div className="flex items-center gap-4 sm:gap-5 min-w-0 w-full">
          {/* Animated Merchant Avatar Portrait Frame */}
          <div
            className="w-[82px] h-[96px] shrink-0 border-4 border-[#17100a] bg-[#201b17] shadow-[inset_0_0_0_2px_#8a5a2c,inset_0_-12px_0_rgba(0,0,0,0.3),5px_7px_18px_rgba(0,0,0,0.35)] flex items-center justify-center relative overflow-hidden group"
            aria-hidden="true"
          >
            {/* Corner Brass Rivets */}
            <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#8a570f] border border-[#f0a82d] shadow-[inset_1px_1px_0_#ffc75a] pointer-events-none" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#8a570f] border border-[#f0a82d] shadow-[inset_1px_1px_0_#ffc75a] pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#8a570f] border border-[#f0a82d] shadow-[inset_1px_1px_0_#ffc75a] pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#8a570f] border border-[#f0a82d] shadow-[inset_1px_1px_0_#ffc75a] pointer-events-none" />

            {/* Merchant Sprite with Living Idle Bob & Eye/Relic Glow Pulse */}
            <Image
              src="/sprites/static/wizard.png"
              alt="Bramblewick the Merchant"
              width={68}
              height={68}
              unoptimized
              className="animate-merchant-idle object-contain [image-rendering:pixelated] select-none"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Shop Sign Plaque */}
          <div className="min-w-0 flex-1 p-3.5 sm:p-4 border-[3px] border-[#160d08] bg-[#2f1c10] shadow-[inset_0_0_0_2px_#805633,inset_0_-8px_0_rgba(0,0,0,0.2),0_6px_0_#160d08]">
            <h1 className="m-0 text-[#ffd98a] font-pixel text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight drop-shadow-[2px_2px_0_#21150d]">
              Bramblewick&apos;s Emporium
            </h1>
            <p className="m-0 mt-1.5 text-[#e5cfa1] text-xs sm:text-sm leading-relaxed max-w-prose">
              Honest steel, curious relics, and restorative brews for adventurers with coin—and better judgment.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: UNIFORM FULL-WIDTH CURRENCY LEDGER TRAY */}
        <div
          className="relative flex items-center w-full min-h-[80px] p-3 sm:p-3.5 bg-[#1a110a] border-2 border-[#3d2716] shadow-[inset_0_0_0_2px_#2a180e,inset_0_3px_10px_rgba(0,0,0,0.8),0_6px_0_#140d09]"
          aria-label="Your currency purse"
        >
          {/* Inner Corner Gold Rivets */}
          <span
            className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-[#8a570f] border border-[#f0a82d] shadow-[inset_1px_1px_0_#ffc75a] pointer-events-none"
            aria-hidden="true"
          />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#8a570f] border border-[#f0a82d] shadow-[inset_1px_1px_0_#ffc75a] pointer-events-none"
            aria-hidden="true"
          />
          <span
            className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-[#8a570f] border border-[#f0a82d] shadow-[inset_1px_1px_0_#ffc75a] pointer-events-none"
            aria-hidden="true"
          />
          <span
            className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-[#8a570f] border border-[#f0a82d] shadow-[inset_1px_1px_0_#ffc75a] pointer-events-none"
            aria-hidden="true"
          />

          {/* Equal-Distribution 3-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full h-full">
            <UniformCurrencyCard
              label="Gold"
              value={character.gold}
              type="GOLD"
              lore={CURRENCY_LORE.gold}
            />
            <UniformCurrencyCard
              label="Gems"
              value={character.gems || 0}
              type="GEMS"
              lore={CURRENCY_LORE.gems}
            />
            <UniformCurrencyCard
              label="Dungeon Tokens"
              value={character.towerTokens || 0}
              type="TOWER_TOKENS"
              lore={CURRENCY_LORE.towerTokens}
            />
          </div>
        </div>
      </div>

      {/* === ANNOUNCEMENT RAIL (MERCHANT'S WORD) === */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-2.5 bg-[#17100b] border-t-2 border-[#382315] text-xs font-pixel"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0 px-2 py-0.5 bg-[#422006] text-[#fcd34d] border border-[#92400e] rounded-xs uppercase tracking-wider text-[10px] font-bold">
            Merchant&apos;s word
          </span>
          <p className="m-0 text-[#fde68a] italic font-sans truncate text-xs sm:text-sm">
            &ldquo;{announcement}&rdquo;
          </p>
        </div>
        <span className="shrink-0 text-amber-400/80 uppercase text-[11px] tracking-wide self-end sm:self-auto font-mono font-bold">
          Free rotations: {shopRefreshCharges}/{maxShopRefreshCharges}
        </span>
      </div>
    </header>
  );
}

export default ShopHeader;
