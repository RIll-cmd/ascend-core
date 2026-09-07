"use client";

import { CHARACTER_AVATAR_PREVIEW } from "@/utils/sprites";
import Image from "next/image";
import { getEnemySpriteUrl } from "@/utils/spriteUtils";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { getEnemyLore } from "@/features/lore/loreData";

interface FloorBattleBannerProps {
  playerName?: string;
  playerPower?: number;
  enemyName: string;
  enemyLevel: number;
  floorNumber: number;
  isBoss?: boolean;
}

export function FloorBattleBanner({ playerName = "Player", playerPower = 0, enemyName, enemyLevel, floorNumber, isBoss = false }: FloorBattleBannerProps) {
  const spriteUrl = getEnemySpriteUrl(enemyName, { floorOrLevel: floorNumber, isBoss });
  const enemyLore = getEnemyLore(enemyName, floorNumber, isBoss);

  return (
    <section aria-label="Combatants" className="relative min-h-[220px] overflow-hidden rounded-xl border-3 border-[#785b34] bg-[#120d09] px-4 pt-4 shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.1)] group select-none">
      {/* Detailed 16-Bit Pixel Art Stone Arena Diorama Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-bottom pointer-events-none select-none"
        style={{
          backgroundImage: "url('/backgrounds/stone_arena_diorama.jpg')",
          imageRendering: "pixelated",
          filter: "contrast(1.08) brightness(0.95)",
        }}
      />

      {/* Ambient Depth & Fog Vignette Overlays */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0d0a08]/90 via-[#0d0a08]/35 to-black/55 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none"
      />

      {/* 4 Corner Brass Rivets */}
      <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#d97706] border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-20" />
      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#d97706] border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-20" />
      <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#d97706] border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-20" />
      <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#d97706] border border-black shadow-[0_0.5px_0_rgba(255,255,255,0.4)] pointer-events-none z-20" />

      {/* Symmetrical 3-Column Combatant Stage */}
      <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:gap-4 w-full h-full pt-2">
        {/* Column 1: Player Side (Centered in Left 1fr) */}
        <div className="flex justify-center items-end w-full">
          <Combatant
            name={playerName}
            detail={`${playerPower.toLocaleString()} PWR`}
            image={CHARACTER_AVATAR_PREVIEW}
          />
        </div>

        {/* Column 2: VS Emblem & Arena Tag (Centered Mathematically in Middle) */}
        <div className="mb-8 sm:mb-9 flex shrink-0 flex-col items-center justify-end z-20">
          <div className="relative group/vs">
            <div className="absolute -inset-1 rounded-lg bg-[#ea580c]/30 blur-sm pointer-events-none animate-pulse" />
            <span className="relative flex size-11 sm:size-12 rotate-2 items-center justify-center rounded-md border-2 border-[#d8b96a] bg-[#7b3529] font-pixel text-lg sm:text-xl font-black text-[#fff2bd] shadow-[0_6px_12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.4)]">
              VS
            </span>
          </div>
          <span className="mt-2 font-pixel text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#fde047] bg-[#1a120b]/90 px-2 py-0.5 border border-[#6d4c2b] shadow-[0_2px_4px_#000] whitespace-nowrap">
            {isBoss ? "Boss Arena" : "Stone Arena"}
          </span>
        </div>

        {/* Column 3: Enemy Side (Centered in Right 1fr) */}
        <div className="flex justify-center items-end w-full">
          <SystemTooltip
            title={enemyLore.name}
            subtitle={`Floor ${floorNumber} • Level ${enemyLevel}`}
            category={enemyLore.category}
            rarity={enemyLore.rarity}
            description={enemyLore.description}
            lore={enemyLore.lore}
            mechanics={`Weakness & tactics: ${enemyLore.weakness}`}
            stats={[
              { label: "Level", value: `Lv. ${enemyLevel}` },
              { label: "Threat", value: enemyLore.threatLevel },
            ]}
            tags={["Tower", "Combat", isBoss ? "Boss" : "Enemy"]}
            className="w-full flex justify-center items-end"
          >
            <Combatant
              name={enemyName}
              detail={`Level ${enemyLevel}`}
              image={spriteUrl}
              flip
              onImageError={(image) => {
                image.src = "/sprites/static/slime.png";
              }}
            />
          </SystemTooltip>
        </div>
      </div>
    </section>
  );
}

function Combatant({
  name,
  detail,
  image,
  flip = false,
  onImageError,
}: {
  name: string;
  detail: string;
  image: string;
  flip?: boolean;
  onImageError?: (image: HTMLImageElement) => void;
}) {
  return (
    <div className="flex w-full max-w-[180px] cursor-help flex-col items-center text-center">
      <div className="flex size-24 sm:size-28 items-end justify-center drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)] transition-transform hover:scale-105 duration-200">
        <Image
          unoptimized
          width={96}
          height={96}
          src={image}
          alt={name}
          onError={(event) => onImageError?.(event.currentTarget)}
          className={`size-20 sm:size-24 object-contain [image-rendering:pixelated] ${
            flip ? "-scale-x-100" : ""
          }`}
        />
      </div>
      <div className="mb-3 sm:mb-4 w-full min-w-0 rounded-md border border-[#9d885c] bg-[#1c1813]/95 px-3 py-1.5 shadow-[0_6px_14px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <p className="truncate font-pixel text-xs sm:text-sm font-bold text-[#fff3c4] tracking-wide drop-shadow-[0_1px_2px_#000]">
          {name}
        </p>
        <p className="font-mono text-[10px] sm:text-[11px] text-[#cfc39c] font-semibold">
          {detail}
        </p>
      </div>
    </div>
  );
}
