"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  PixelTowerSpireLogo,
  PixelLockIcon,
  PixelCrownIcon,
  PixelCheckIcon,
  PixelChevronRightIcon,
  PixelLayersIcon,
} from "@/components/ui/pixel/PixelIcons";
import { Badge } from "@/components/ui/badge";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { getFloorPresentation } from "@/features/tower/utils/floorPresentation";
import { getEnemyLore } from "@/features/lore/loreData";
import { getEnemySpriteUrl } from "@/utils/spriteUtils";
import type { TowerFloor } from "@/features/tower/store/useTowerStore";

interface TowerFloorListProps {
  floors: TowerFloor[];
  selectedFloor: TowerFloor | null;
  onSelectFloor: (floor: TowerFloor) => void;
}

export function TowerFloorList({
  floors,
  selectedFloor,
  onSelectFloor,
}: TowerFloorListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeNodeRef = useRef<HTMLButtonElement>(null);
  const hasInitialScrolled = useRef(false);

  const sortedFloors = [...floors].sort((a, b) => b.floorNumber - a.floorNumber);

  // Auto-scroll and center container on active floor WITHOUT bubbling to window
  const scrollToActiveFloor = useCallback((smooth = true) => {
    const container = containerRef.current;
    const target = activeNodeRef.current;
    if (container && target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offset =
        targetRect.top -
        containerRect.top -
        container.clientHeight / 2 +
        target.clientHeight / 2;

      container.scrollTo({
        top: container.scrollTop + offset,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Initial scroll into view once floors are loaded
  useEffect(() => {
    if (floors.length > 0 && !hasInitialScrolled.current) {
      const timer = setTimeout(() => {
        scrollToActiveFloor(false);
        hasInitialScrolled.current = true;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [floors.length, scrollToActiveFloor]);

  // Keyboard navigation (ArrowUp/ArrowDown to shift floor selection)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!selectedFloor) {
          if (floors.length > 0) onSelectFloor(floors[0]);
          return;
        }
        const higherFloor = floors.find(
          (f) => f.floorNumber === selectedFloor.floorNumber + 1
        );
        if (higherFloor) {
          onSelectFloor(higherFloor);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!selectedFloor) {
          if (floors.length > 0) onSelectFloor(floors[0]);
          return;
        }
        const lowerFloor = floors.find(
          (f) => f.floorNumber === selectedFloor.floorNumber - 1
        );
        if (lowerFloor) {
          onSelectFloor(lowerFloor);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [floors, selectedFloor, onSelectFloor]);

  // When selection changes, smoothly keep it centered inside the container
  useEffect(() => {
    if (hasInitialScrolled.current && selectedFloor) {
      scrollToActiveFloor(true);
    }
  }, [selectedFloor?.id, scrollToActiveFloor]);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border-2 border-[#77684d]/80 bg-[#181d17]/90 backdrop-blur-md shadow-[0_14px_34px_rgba(10,18,12,0.6)]">
      {/* Header */}
      <header className="border-b-2 border-[#77684d]/80 bg-[#252b21]/90 px-5 py-3.5 shrink-0 select-none">
        <div className="flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-pixel text-xl font-bold text-[#fff1b5] sm:text-2xl">
            <span className="flex size-9 items-center justify-center rounded-md border-2 border-[#c79d4d] bg-[#54351d] shadow-[2px_2px_0_0_#000]">
              <PixelTowerSpireLogo className="size-6" />
            </span>
            Ascend Tower
          </h1>
          <span className="font-pixel text-[10px] text-[#ca9e54] uppercase tracking-wider bg-[#141812] px-2.5 py-1 rounded border border-[#5c4a33] flex items-center gap-1.5 shadow-[1px_1px_0_0_#000]">
            <PixelLayersIcon className="size-3 text-[#ca9e54]" />
            20 Floors
          </span>
        </div>
        <p className="mt-1 text-xs text-[#ddd4b7] line-clamp-1">
          Climb the ancient spire & conquer guardians toward the summit.
        </p>
      </header>

      {/* Relative container holding the scroll list and fade overlays */}
      <div className="relative flex-1 overflow-hidden min-h-0">
        {/* Top Fade Gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-8 bg-gradient-to-b from-[#181d17] via-[#181d17]/70 to-transparent"
        />

        {/* Scrollable Floor Nodes List */}
        <div
          ref={containerRef}
          tabIndex={0}
          role="region"
          aria-label="Tower Floor Nodes"
          className="tower-scrollbar h-full overflow-y-auto p-4 focus-visible:outline-none"
        >
          <div className="relative space-y-3 pb-4 before:absolute before:bottom-8 before:left-8 before:top-8 before:w-1 before:bg-[#6f7259]">
            {sortedFloors.map((floor) => {
              const isSelected = selectedFloor?.id === floor.id;
              const presentation = getFloorPresentation(
                floor.status,
                floor.isBoss,
                isSelected
              );
              const lore = getEnemyLore(
                floor.enemy.name,
                floor.floorNumber,
                floor.isBoss
              );
              const stateClasses = {
                current: "border-[#d5aa4f] bg-[#594f35] text-[#fff0b3]",
                cleared: "border-[#5f7658] bg-[#41483d] text-[#e3e6cf]",
                available: "border-[#716b58] bg-[#3d4038] text-[#eee5c8]",
                locked:
                  "border-stone-700 bg-stone-800/90 text-stone-400 opacity-50",
              }[presentation.tone];

              return (
                <SystemTooltip
                  key={floor.id}
                  title={`${lore.name} (Lv. ${floor.enemy.level})`}
                  subtitle={`Floor ${floor.floorNumber} • Power Req: ${
                    floor.requiredPower?.toLocaleString() || "Standard"
                  }`}
                  category={lore.category}
                  rarity={lore.rarity}
                  description={lore.description}
                  lore={lore.lore}
                  mechanics={`Weakness & tactics: ${lore.weakness} • ${lore.behavior}`}
                  tags={["Tower", floor.isBoss ? "Boss" : "Enemy"]}
                  className="w-full"
                >
                  <button
                    type="button"
                    ref={isSelected ? activeNodeRef : null}
                    onClick={() => onSelectFloor(floor)}
                    aria-current={isSelected ? "step" : undefined}
                    className={`group relative z-10 flex min-h-[72px] w-full items-center gap-3 rounded-lg border-2 p-2.5 text-left shadow-[0_5px_10px_rgba(23,22,16,0.24)] transition-[transform,border-color,background-color] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 ${stateClasses}`}
                  >
                    {/* Enemy Thumbnail / Lock */}
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-[#8d8064] bg-[#292e28] p-1">
                      {presentation.tone === "locked" ? (
                        <PixelLockIcon className="size-5 text-[#8c786a]" />
                      ) : (
                        <Image
                          unoptimized
                          width={48}
                          height={48}
                          src={getEnemySpriteUrl(floor.enemy.name, {
                            floorOrLevel: floor.floorNumber,
                            isBoss: floor.isBoss,
                          })}
                          alt=""
                          onError={(event) => {
                            event.currentTarget.src =
                              "/sprites/static/slime.png";
                          }}
                          className="size-full object-contain [image-rendering:pixelated]"
                        />
                      )}
                    </div>

                    {/* Floor & Enemy Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-pixel text-base font-bold">
                          Floor {floor.floorNumber}
                        </span>
                        {floor.isBoss && (
                          <Badge className="border border-[#b9684e] bg-[#773b2f] text-[#ffe2b3] hover:bg-[#773b2f] text-[9px] px-1.5 py-0 flex items-center gap-1">
                            <PixelCrownIcon className="size-2.5 text-[#fde047]" /> BOSS
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-current opacity-75 mt-0.5">
                        {floor.enemy.name} · Lv. {floor.enemy.level}
                      </p>
                    </div>

                    {/* Status Label & Chevron */}
                    <span className="hidden items-center gap-1 rounded border border-current/25 px-2 py-0.5 font-pixel text-[9px] uppercase sm:flex shrink-0">
                      {presentation.tone === "cleared" && (
                        <PixelCheckIcon className="size-2.5 text-[#10b981]" />
                      )}
                      {presentation.label}
                    </span>
                    <PixelChevronRightIcon className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 opacity-60 group-hover:opacity-100" />
                  </button>
                </SystemTooltip>
              );
            })}
          </div>
        </div>

        {/* Bottom Fade Gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-8 bg-gradient-to-t from-[#181d17] via-[#181d17]/70 to-transparent"
        />
      </div>
    </section>
  );
}
