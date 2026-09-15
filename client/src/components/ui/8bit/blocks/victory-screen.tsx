"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../card";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "../item";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import "../styles/retro.css";

export interface VictoryItem {
  id: string | number;
  name: string;
  rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
  icon?: string;
  quantity?: number;
}

export interface VictoryReport {
  id: string | number;
  title: string;
  value: string | number;
}

export interface VictoryScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  floorNumber?: number;
  title?: string;
  subtitle?: string;
  stats?: { label: string; value: string | number }[];
  spoils?: {
    gold?: number;
    exp?: number;
    gems?: number;
    tokens?: number;
    items?: VictoryItem[];
  };
  battleReports?: VictoryReport[];
  onClaim?: () => void;
  claimLabel?: string;
}

export default function VictoryScreen({
  className,
  floorNumber,
  title = "VICTORY ACHIEVED!",
  subtitle = "The Spire Guardian has fallen. Spoils of ascension secured.",
  stats = [
    { label: "TURNS", value: 4 },
    { label: "DMG DEALT", value: "1,240" },
    { label: "REMAINING HP", value: "85%" },
    { label: "GRADE", value: "S-RANK" },
  ],
  spoils = {
    gold: 250,
    exp: 400,
    gems: 5,
    tokens: 2,
    items: [
      { id: "1", name: "Sunken Pearl Relic", rarity: "rare" },
      { id: "2", name: "Chitin Plating", rarity: "common", quantity: 3 },
    ],
  },
  battleReports,
  onClaim,
  claimLabel = "CLAIM SPOILS & ASCEND",
  ...props
}: VictoryScreenProps) {
  return (
    <Card
      variant="dungeon"
      className={cn("w-full max-w-2xl mx-auto p-4 sm:p-6 bg-[#161d14]/98 select-none", className)}
      {...props}
    >
      <CardContent className="p-0 space-y-5">
        {/* Header Fanfare */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="size-12 rounded-lg bg-[#54351d] border-2 border-[#f6c453] flex items-center justify-center text-[#fef08a] font-bold text-2xl shadow-[2px_2px_0_0_#000] animate-retro-float">
            🏆
          </div>
          {floorNumber !== undefined && (
            <span className="retro text-[9px] text-[#f6c453] uppercase tracking-widest">
              FLOOR {floorNumber} CLEARED
            </span>
          )}
          <h2 className="retro text-lg sm:text-2xl font-black text-[#fff1b5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {title}
          </h2>
          <p className="font-mono text-xs text-slate-300 max-w-md">
            {subtitle}
          </p>
        </div>

        {/* Combat Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-[#10140e] border-2 border-[#6f6044] rounded-none text-center shadow-[1px_1px_0_0_#000]"
            >
              <p className="retro text-[8px] text-[#bd9950] uppercase">{stat.label}</p>
              <p className="retro text-sm sm:text-base font-bold text-[#fef08a] mt-1 tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Spoils / Bounty Loot Obtained */}
        <div className="border-2 border-[#8c7a53] p-3.5 bg-[#121610]/95 shadow-[2px_2px_0_0_#000]">
          <h4 className="retro text-xs font-bold text-[#f6c453] mb-3 flex items-center gap-2 uppercase tracking-wider">
            <span>⚔</span> SPOILS OF ASCENSION
          </h4>

          {/* Currencies */}
          <div className="flex flex-wrap gap-2 mb-3">
            {spoils.gold !== undefined && spoils.gold > 0 && (
              <div className="bg-[#1e1b15] border border-[#816b46] px-2.5 py-1 flex items-center gap-1.5 shadow-[1px_1px_0_0_#000]">
                <CurrencyIcon type="GOLD" size="xs" />
                <span className="text-[#fff0b6] font-mono font-bold text-xs">+{spoils.gold} Gold</span>
              </div>
            )}
            {spoils.exp !== undefined && spoils.exp > 0 && (
              <div className="bg-[#1e1b15] border border-[#816b46] px-2.5 py-1 flex items-center gap-1.5 shadow-[1px_1px_0_0_#000]">
                <CurrencyIcon type="EXP" size="xs" />
                <span className="text-[#93c5fd] font-mono font-bold text-xs">+{spoils.exp} EXP</span>
              </div>
            )}
            {spoils.gems !== undefined && spoils.gems > 0 && (
              <div className="bg-[#1e1b15] border border-[#816b46] px-2.5 py-1 flex items-center gap-1.5 shadow-[1px_1px_0_0_#000]">
                <CurrencyIcon type="GEMS" size="xs" />
                <span className="text-[#d8b4fe] font-mono font-bold text-xs">+{spoils.gems} Gems</span>
              </div>
            )}
            {spoils.tokens !== undefined && spoils.tokens > 0 && (
              <div className="bg-[#1e1b15] border border-[#816b46] px-2.5 py-1 flex items-center gap-1.5 shadow-[1px_1px_0_0_#000]">
                <CurrencyIcon type="TOWER_TOKENS" size="xs" />
                <span className="text-[#fde047] font-mono font-bold text-xs">+{spoils.tokens} Tokens</span>
              </div>
            )}
          </div>

          {/* Item Drops */}
          {spoils.items && spoils.items.length > 0 && (
            <ItemGroup className="mt-2">
              {spoils.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <Item variant={item.rarity || "default"} size="sm" className="p-2">
                    <ItemContent className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.icon && (
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={24}
                            height={24}
                            unoptimized
                            className="size-6 object-contain pixelated"
                          />
                        )}
                        <ItemTitle className="retro text-[10px] text-white">
                          {item.name} {item.quantity && item.quantity > 1 ? `x${item.quantity}` : ""}
                        </ItemTitle>
                      </div>
                      <ItemDescription className="retro text-[8px] uppercase tracking-wider">
                        {item.rarity || "common"}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                  {index < (spoils.items?.length ?? 0) - 1 && <ItemSeparator />}
                </React.Fragment>
              ))}
            </ItemGroup>
          )}
        </div>

        {/* Optional Battle Chronicle Report */}
        {battleReports && battleReports.length > 0 && (
          <div className="border border-[#8c7a53]/50 p-3 bg-[#10140e] space-y-1.5">
            <h5 className="retro text-[10px] text-slate-300 font-bold uppercase">Performance Assessment</h5>
            {battleReports.map((report) => (
              <div key={report.id} className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>{report.title}</span>
                <span className="text-slate-200 font-bold">{report.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Claim Action Button */}
        {onClaim && (
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={onClaim}
              className="w-full sm:w-auto px-8 py-3 bg-[#76502f] hover:bg-[#8b6038] text-[#fff2be] font-pixel text-xs uppercase tracking-widest font-bold border-2 border-[#e0bd68] shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000] cursor-pointer transition-all"
            >
              {claimLabel}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { VictoryScreen };
