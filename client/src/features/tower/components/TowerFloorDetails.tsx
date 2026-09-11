"use client";

import type { ReactNode } from "react";
import {
  PixelShieldIcon,
  PixelHeartIcon,
  PixelSwordIcon,
  PixelRunningBootIcon,
  PixelTrophyIcon,
  PixelClockIcon,
  PixelSpinnerIcon,
} from "@/components/ui/pixel/PixelIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { FloorBattleBanner } from "@/features/tower/components/FloorBattleBanner";
import { CURRENCY_LORE } from "@/features/lore/loreData";
import { getAttributeWeaknessConfig, getElementalVulnerabilityConfig } from "@/utils/combatIcons";
import type { TowerFloor } from "@/features/tower/store/useTowerStore";
import type { Character } from "@/features/character/types/character";

interface TowerFloorDetailsProps {
  selectedFloor: TowerFloor;
  character: Character | null;
  isSimulating: boolean;
  onChallenge: (floorNumber: number) => void;
}

export function TowerFloorDetails({
  selectedFloor,
  character,
  isSimulating,
  onChallenge,
}: TowerFloorDetailsProps) {
  const isLocked = selectedFloor.status === "LOCKED";
  const isCleared = selectedFloor.status === "CLEARED";

  const attr = getAttributeWeaknessConfig(selectedFloor.enemy.weaknessStat || "Knowledge");
  const elem = getElementalVulnerabilityConfig(selectedFloor.enemy.resistanceStat || "Flame");
  const AttrIcon = attr.icon;
  const ElemIcon = elem.icon;

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border-2 border-[#796b4c]/80 bg-[#181d17]/90 backdrop-blur-md shadow-[0_12px_30px_rgba(10,18,12,0.6)]">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-[#796b4c]/80 bg-[#252b21]/90 px-5 py-3.5 shrink-0 select-none">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#fff1b5]">
              Floor {selectedFloor.floorNumber}: {selectedFloor.enemy.name}
            </h2>
            {isCleared && (
              <Badge className="border border-[#718a62] bg-[#43563b] text-[#edf3d5] hover:bg-[#43563b] text-[10px] px-2 py-0.5">
                CLEARED
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#cbc3a7]">
            Guardian Chamber · Level {selectedFloor.enemy.level}
          </p>
        </div>

        <div className="rounded-md border border-[#8c7a53] bg-[#1a1e17] px-3 py-1.5 text-right shadow-[1px_1px_0_0_#000]">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#bfb496]">
            Floor Status
          </p>
          <p className="font-pixel text-xs sm:text-sm font-bold text-[#f3df9d]">
            {selectedFloor.status}
          </p>
        </div>
      </header>

      {/* Scrollable / Packed Details Body */}
      <div className="tower-scrollbar flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5 min-h-0">
        {/* Stage Diorama (Combat Preview) */}
        <FloorBattleBanner
          playerName={character?.name || "Player"}
          playerPower={character?.power || 0}
          enemyName={selectedFloor.enemy.name}
          enemyLevel={selectedFloor.enemy.level}
          floorNumber={selectedFloor.floorNumber}
          isBoss={selectedFloor.isBoss}
        />

        {/* Enemy Tactical Briefing */}
        <section className="rounded-xl border border-[#796b4c]/70 bg-[#1e231c]/90 p-3.5 sm:p-4 shadow-[2px_2px_0_0_#000]">
          <h3 className="flex items-center gap-2 font-pixel text-sm font-bold text-[#f2dfab]">
            <PixelShieldIcon className="size-4 text-[#f59e0b]" />
            Enemy Tactical Briefing
          </h3>

          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <BriefingBadge
              label="Attribute weakness"
              value={attr.label}
              icon={<AttrIcon className="size-4" />}
            />
            <BriefingBadge
              label="Elemental vulnerability"
              value={elem.label}
              icon={<ElemIcon className="size-4" />}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-lg border-2 border-[#96763d] bg-[#262a24] sm:grid-cols-4">
            <Stat icon={<PixelHeartIcon className="size-3.5 text-[#ef4444]" />} label="HP" value={selectedFloor.enemy.hp} />
            <Stat icon={<PixelSwordIcon className="size-3.5 text-[#f59e0b]" />} label="ATK" value={selectedFloor.enemy.attack} />
            <Stat icon={<PixelShieldIcon className="size-3.5 text-[#38bdf8]" />} label="DEF" value={selectedFloor.enemy.defense} />
            <Stat icon={<PixelRunningBootIcon className="size-3.5 text-[#10b981]" />} label="SPD" value={selectedFloor.enemy.speed} />
          </div>
        </section>

        {/* Floor Bounty */}
        <section className="rounded-xl border border-[#796b4c]/70 bg-[#1e231c]/90 p-3.5 sm:p-4 shadow-[2px_2px_0_0_#000]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-pixel text-sm font-bold text-[#f2dfab]">
              <PixelTrophyIcon className="size-4 text-[#f59e0b]" />
              Floor Bounty & Spoils
            </h3>
            <p className="text-[11px] text-[#c9c0a4] flex items-center gap-1.5">
              <PixelClockIcon className="size-3 text-[#c9c0a4]" />
              {selectedFloor.attempts} attempts · Best{" "}
              {selectedFloor.bestClearTimeSeconds
                ? `${selectedFloor.bestClearTimeSeconds}s`
                : "—"}
            </p>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Loot type="GOLD" value={selectedFloor.goldReward} label="Gold" />
            <Loot type="EXP" value={selectedFloor.expReward} label="EXP" />
            <Loot
              type="GEMS"
              value={
                selectedFloor.gemReward ??
                (selectedFloor.isBoss
                  ? Math.max(25, Math.floor(selectedFloor.floorNumber / 5) * 25)
                  : selectedFloor.floorNumber % 2 === 0
                  ? 5
                  : 2)
              }
              label="Gems"
            />
            <Loot
              type="TOWER_TOKENS"
              value={
                selectedFloor.towerTokensReward ??
                10 * selectedFloor.floorNumber * (selectedFloor.isBoss ? 3 : 1)
              }
              label="Tokens"
            />
          </div>
        </section>
      </div>

      {/* Enter Floor Action Bar - Anchored to Bottom */}
      <div className="border-t-2 border-[#796b4c] bg-[#292c25] p-3.5 shrink-0">
        <Button
          size="lg"
          disabled={isLocked || isSimulating || !character}
          onClick={() => onChallenge(selectedFloor.floorNumber)}
          className="h-12 sm:h-13 w-full rounded-md border-2 border-[#e0bd68] bg-[#76502f] font-pixel text-base sm:text-lg font-bold text-[#fff2be] shadow-[0_7px_14px_rgba(20,18,12,0.34)] [image-rendering:pixelated] hover:bg-[#8b6038] focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 disabled:border-stone-600 disabled:bg-stone-700 disabled:text-stone-400 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSimulating ? (
            <PixelSpinnerIcon className="size-5 text-[#fff2be]" />
          ) : (
            <PixelSwordIcon className="size-5 text-[#fff2be]" />
          )}
          <span>
            {isSimulating
              ? "RESOLVING BATTLE..."
              : isLocked
              ? "FLOOR SEALED"
              : isCleared
              ? "RE-ENTER FLOOR"
              : "ENTER FLOOR"}
          </span>
        </Button>
      </div>
    </section>
  );
}

function BriefingBadge({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#776f5b] bg-[#272b25] p-2.5">
      <p className="text-[10px] uppercase tracking-[0.15em] text-[#bbb297]">{label}</p>
      <Badge
        variant="outline"
        className="mt-1.5 border-[#ad9159] bg-[#4a4637] text-[#fff0ba] text-xs"
      >
        {icon}
        <span className="ml-1.5">{value}</span>
        <span className="ml-2 text-[#d5c89e] text-[10px]">+25% DMG</span>
      </Badge>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-h-14 items-center justify-center gap-2 border-[#96763d]/50 p-2 text-[#e7d6a3] not-last:border-r">
      <span className="text-[#bd9950]">{icon}</span>
      <div>
        <p className="text-[9px] uppercase tracking-[0.16em] text-[#aaa187]">{label}</p>
        <p className="font-mono text-xs sm:text-sm font-bold tabular-nums">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function Loot({
  type,
  value,
  label,
}: {
  type: "GOLD" | "EXP" | "GEMS" | "TOWER_TOKENS";
  value: number;
  label: "Gold" | "EXP" | "Gems" | "Tokens";
}) {
  const lore =
    label === "Gold"
      ? CURRENCY_LORE.gold
      : label === "EXP"
      ? CURRENCY_LORE.exp
      : label === "Gems"
      ? CURRENCY_LORE.gems
      : CURRENCY_LORE.towerTokens;

  return (
    <SystemTooltip
      title={lore.name}
      category={lore.category}
      rarity={lore.rarity}
      description={lore.description}
      lore={lore.lore}
      mechanics={lore.mechanics}
      tags={lore.tags}
    >
      <div className="flex min-h-[58px] cursor-help items-center justify-center gap-2.5 sm:gap-3 rounded-lg border border-[#816b46] bg-[#362b1e]/95 hover:bg-[#433525] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_8px_rgba(0,0,0,0.3)] transition-all">
        <div className="w-8 h-8 rounded-full bg-[#1e1710] border border-[#816b46]/70 flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
          <CurrencyIcon type={type} size="md" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <p className="font-mono text-xs sm:text-sm font-bold text-[#fff0b6] leading-tight tabular-nums">
            +{value.toLocaleString()}
          </p>
          <p className="text-[9px] uppercase tracking-wider text-[#cdbf98] font-pixel font-bold leading-tight mt-0.5">
            {label}
          </p>
        </div>
      </div>
    </SystemTooltip>
  );
}
