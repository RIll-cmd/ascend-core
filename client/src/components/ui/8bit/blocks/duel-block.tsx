"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "../badge";
import { Alert, AlertDescription, AlertTitle } from "../alert";
import HealthBar from "../health-bar";
import "../styles/retro.css";

export interface Fighter {
  name: string;
  subtitle: string;
  image: string;
  hp: number;
  maxHp: number;
  isBoss?: boolean;
}

export interface DuelBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  leftFighter?: Fighter;
  rightFighter?: Fighter;
  interactive?: boolean;
  onVictory?: (winnerName: string) => void;
}

const HIT_MESSAGES = [
  "Critical strike landed!",
  "Shadow blade puncture!",
  "Shield block absorbed impact!",
  "Mana explosion resonance!",
  "Counter combo x3!",
  "Flawless evasion!",
  "Heavy armor dented!",
];

export default function DuelBlock({
  leftFighter = {
    name: "Shadow Hunter",
    subtitle: "Solo Ascendant",
    image: "/avatars/player-front.png",
    hp: 120,
    maxHp: 120,
  },
  rightFighter = {
    name: "Nightborne Lord",
    subtitle: "Floor 20 Floor Boss",
    image: "/sprites/static/nightborne.png",
    hp: 200,
    maxHp: 200,
    isBoss: true,
  },
  interactive = true,
  onVictory,
  className,
  ...props
}: DuelBlockProps) {
  const [left, setLeft] = React.useState(leftFighter);
  const [right, setRight] = React.useState(rightFighter);
  const [round, setRound] = React.useState(1);
  const [lastMessage, setLastMessage] = React.useState("Encounter Initiated — Prepare for Battle!");
  const [lastHit, setLastHit] = React.useState<"left" | "right" | null>(null);

  const [prevLeft, setPrevLeft] = React.useState(leftFighter);
  const [prevRight, setPrevRight] = React.useState(rightFighter);

  // Sync state during render if props changed
  if (prevLeft !== leftFighter || prevRight !== rightFighter) {
    setPrevLeft(leftFighter);
    setPrevRight(rightFighter);
    setLeft(leftFighter);
    setRight(rightFighter);
  }

  const winner = left.hp <= 0 ? right.name : right.hp <= 0 ? left.name : null;

  const handleHit = React.useCallback(() => {
    if (winner) return;

    const damage = Math.floor(Math.random() * 25) + 10;
    const msg = HIT_MESSAGES[Math.floor(Math.random() * HIT_MESSAGES.length)];

    if (round % 2 === 1) {
      // Player attacks enemy
      const nextHp = Math.max(0, right.hp - damage);
      setRight((f) => ({ ...f, hp: nextHp }));
      setLastMessage(`${left.name} attacks! ${msg} (-${damage} HP)`);
      setLastHit("right");
      if (nextHp <= 0) onVictory?.(left.name);
    } else {
      // Enemy attacks player
      const nextHp = Math.max(0, left.hp - damage);
      setLeft((f) => ({ ...f, hp: nextHp }));
      setLastMessage(`${right.name} retaliates! ${msg} (-${damage} HP)`);
      setLastHit("left");
      if (nextHp <= 0) onVictory?.(right.name);
    }

    setRound((r) => r + 1);
  }, [round, winner, left.name, right.name, right.hp, left.hp, onVictory]);

  const handleReset = () => {
    setLeft(leftFighter);
    setRight(rightFighter);
    setRound(1);
    setLastMessage("Encounter Reset — Round 1!");
    setLastHit(null);
  };

  return (
    <div
      className={cn(
        "retro w-full p-4 sm:p-6 bg-[#130f0b]/95 border-2 border-[#795d3a] shadow-[0_8px_24px_rgba(0,0,0,0.85)] select-none",
        className
      )}
      {...props}
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#795d3a]/50">
        <Badge variant="gold">ARENA DUEL</Badge>
        <span className="font-mono text-[9px] text-[#fde047]">
          Round {round}
        </span>
      </div>

      {/* Duel Combatants Stage */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6 my-2">
        {/* Left: Player */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-full max-w-[140px]">
            <HealthBar
              value={(left.hp / left.maxHp) * 100}
              currentHp={left.hp}
              maxHp={left.maxHp}
              showText
              variant="retro"
            />
          </div>
          <div
            className={cn(
              "size-20 sm:size-24 rounded-lg bg-[#1a1410] border-2 border-[#8c7a53] p-1 flex items-center justify-center shadow-[2px_2px_0_0_#000] transition-transform duration-150",
              lastHit === "left" && "scale-90 bg-red-950/60 border-red-500"
            )}
          >
            <Image
              src={left.image}
              alt={left.name}
              width={96}
              height={96}
              unoptimized
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/avatars/player-front.png";
              }}
              className="w-full h-full object-contain pixelated"
            />
          </div>
          <div className="w-full max-w-[140px] truncate">
            <p className="retro text-[10px] sm:text-xs font-bold text-[#fff1b5] truncate">{left.name}</p>
            <p className="font-mono text-[8px] text-slate-400 truncate">{left.subtitle}</p>
          </div>
        </div>

        {/* Center: VS & Hit Controls */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="size-10 sm:size-12 rounded-md border-2 border-[#f6c453] bg-[#78350f] text-[#fef08a] font-pixel font-black text-base sm:text-lg flex items-center justify-center shadow-[2px_2px_0_0_#000] rotate-2">
            VS
          </div>

          {interactive && (
            <div className="mt-2 flex flex-col gap-1 items-center">
              {winner ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-pixel text-[9px] uppercase font-bold border-2 border-black shadow-[2px_2px_0_0_#000] cursor-pointer"
                >
                  Rematch
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleHit}
                  className="px-3 py-1 bg-[#ef4444] hover:bg-[#dc2626] text-white font-pixel text-[9px] uppercase font-bold border-2 border-black shadow-[2px_2px_0_0_#000] cursor-pointer active:translate-y-0.5 active:shadow-none"
                >
                  Strike!
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Enemy */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-full max-w-[140px]">
            <HealthBar
              value={(right.hp / right.maxHp) * 100}
              currentHp={right.hp}
              maxHp={right.maxHp}
              showText
              variant="retro"
            />
          </div>
          <div
            className={cn(
              "size-20 sm:size-24 rounded-lg bg-[#1a1410] border-2 border-[#8c7a53] p-1 flex items-center justify-center shadow-[2px_2px_0_0_#000] transition-transform duration-150",
              lastHit === "right" && "scale-90 bg-red-950/60 border-red-500"
            )}
          >
            <Image
              src={right.image}
              alt={right.name}
              width={96}
              height={96}
              unoptimized
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/sprites/static/slime.png";
              }}
              className="w-full h-full object-contain pixelated [transform:scaleX(-1)]"
            />
          </div>
          <div className="w-full max-w-[140px] truncate">
            <p className="retro text-[10px] sm:text-xs font-bold text-[#fca5a5] truncate">{right.name}</p>
            <p className="font-mono text-[8px] text-slate-400 truncate">{right.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Combat Commentary Alert */}
      <div className="mt-3">
        <Alert variant="dungeon">
          <AlertTitle className="retro text-[9px] text-[#f6c453]">
            {winner ? `★ VICTORY TO ${winner} ★` : `COMBAT LOG`}
          </AlertTitle>
          <AlertDescription className="retro text-[9px] text-slate-200">
            {lastMessage}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export { DuelBlock };
