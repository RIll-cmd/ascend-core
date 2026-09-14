"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "../badge";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import "../styles/retro.css";

export interface LeaderboardPlayer {
  id: string;
  name: string;
  score: number;
  rank?: number;
  isCurrentPlayer?: boolean;
  avatar?: string;
  avatarFallback?: string;
  guild?: string;
  floor?: number;
}

export interface LeaderboardProps extends React.HTMLAttributes<HTMLDivElement> {
  players?: LeaderboardPlayer[];
  maxPlayers?: number;
  showRank?: boolean;
  showAvatar?: boolean;
  title?: string;
  scoreLabel?: string;
  currentPlayerId?: string;
}

const DEFAULT_LEADERBOARD_PLAYERS: LeaderboardPlayer[] = [
  {
    id: "p1",
    name: "Kaelen Shadowveil",
    score: 18450,
    avatar: "/avatars/shadow-monarch.png",
    avatarFallback: "KS",
    guild: "Obsidian Vanguard",
    floor: 27,
  },
  {
    id: "p2",
    name: "Valkyrie_Rose",
    score: 16200,
    avatar: "/sprites/static/nightborne.png",
    avatarFallback: "VR",
    guild: "Solar Syndicate",
    floor: 25,
  },
  {
    id: "p3",
    name: "Ironclad_Tor",
    score: 14890,
    avatar: "/sprites/static/crab.png",
    avatarFallback: "IT",
    guild: "Temple Monks",
    floor: 24,
  },
  {
    id: "p4",
    name: "Shadow Hunter (You)",
    score: 13540,
    isCurrentPlayer: true,
    avatar: "/avatars/player-front.png",
    avatarFallback: "SH",
    guild: "Kyoto Ronin",
    floor: 21,
  },
  {
    id: "p5",
    name: "Zephyr_Mist",
    score: 11200,
    avatarFallback: "ZM",
    guild: "Solo Ascendants",
    floor: 19,
  },
];

export default function Leaderboard({
  players = DEFAULT_LEADERBOARD_PLAYERS,
  maxPlayers = 10,
  showRank = true,
  showAvatar = true,
  title = "SPIRE ASCENSION LADDER",
  scoreLabel = "EXP",
  currentPlayerId = "p4",
  className,
  ...props
}: LeaderboardProps) {
  const sortedPlayers = React.useMemo(() => {
    return [...players]
      .sort((a, b) => b.score - a.score)
      .slice(0, maxPlayers)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
        isCurrentPlayer: currentPlayerId ? player.id === currentPlayerId : player.isCurrentPlayer,
      }));
  }, [players, maxPlayers, currentPlayerId]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="retro size-7 flex items-center justify-center bg-amber-400 text-black border-2 border-amber-600 font-bold text-xs shadow-[1px_1px_0_0_#000]">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="retro size-7 flex items-center justify-center bg-slate-300 text-black border-2 border-slate-500 font-bold text-xs shadow-[1px_1px_0_0_#000]">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="retro size-7 flex items-center justify-center bg-amber-700 text-white border-2 border-amber-900 font-bold text-xs shadow-[1px_1px_0_0_#000]">
          3
        </span>
      );
    }
    return (
      <span className="retro size-7 flex items-center justify-center bg-[#141a2e] text-slate-400 border border-slate-700 text-[10px]">
        {rank}
      </span>
    );
  };

  return (
    <Card className={cn("bg-[#0B1020]/95 border-2 border-[#8c7a53] shadow-[3px_3px_0_0_#000]", className)} {...props}>
      <CardHeader className="p-4 pb-2 border-b border-[#2d251e] text-center">
        <CardTitle className="retro text-xs sm:text-sm text-[#f6c453] tracking-wider flex items-center justify-center gap-2">
          <span>🏆</span>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-2">
        {sortedPlayers.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <p className="retro text-[9px]">No ascendant records registered.</p>
          </div>
        ) : (
          sortedPlayers.map((player) => {
            const isTop3 = (player.rank || 0) <= 3;
            return (
              <div
                key={player.id}
                className={cn(
                  "retro flex items-center justify-between p-2.5 sm:p-3 border-2 transition-colors shadow-[2px_2px_0_0_#000]",
                  player.isCurrentPlayer
                    ? "bg-[#1f293d] border-[#f6c453] ring-1 ring-[#f6c453]/40"
                    : isTop3
                    ? "bg-[#141a2e]/90 border-[#8c7a53]/80"
                    : "bg-[#0c1222]/80 border-[#2d251e] hover:border-slate-700"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {showRank && getRankBadge(player.rank || 1)}

                  {showAvatar && (
                    <div className="size-9 rounded-none border-2 border-[#8c7a53] bg-[#1a1410] flex items-center justify-center shrink-0 overflow-hidden shadow-[1px_1px_0_0_#000]">
                      {player.avatar ? (
                        <Image
                          src={player.avatar}
                          alt={player.name}
                          width={36}
                          height={36}
                          unoptimized
                          className="w-full h-full object-contain pixelated"
                        />
                      ) : (
                        <span className="retro text-[9px] text-[#f6c453] font-bold">
                          {player.avatarFallback || player.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "retro text-[9px] sm:text-xs font-bold truncate",
                          player.isCurrentPlayer ? "text-[#f6c453]" : "text-white"
                        )}
                      >
                        {player.name}
                      </span>
                      {player.isCurrentPlayer && (
                        <Badge variant="default" className="text-[7px] py-0 px-1">
                          YOU
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      {player.guild && (
                        <span className="retro text-[7px] text-slate-400 truncate">
                          [{player.guild}]
                        </span>
                      )}
                      {player.floor && (
                        <span className="retro text-[7px] text-slate-500">
                          • Floor {player.floor}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      "retro text-[10px] sm:text-xs font-bold",
                      player.rank === 1 && "text-amber-400",
                      player.rank === 2 && "text-slate-200",
                      player.rank === 3 && "text-amber-600",
                      (player.rank || 0) > 3 && (player.isCurrentPlayer ? "text-[#f6c453]" : "text-slate-300")
                    )}
                  >
                    {player.score.toLocaleString()}
                  </div>
                  <span className="retro text-[7px] text-slate-500">{scoreLabel}</span>
                </div>
              </div>
            );
          })
        )}

        <div className="pt-3 border-t border-[#2d251e] text-center">
          <p className="retro text-[8px] text-slate-500">
            Top {sortedPlayers.length} Ascendants • Updated in real-time
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export { Leaderboard };
