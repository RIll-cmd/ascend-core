"use client";

import React from "react";
import Link from "next/link";
import { Swords, Footprints, Activity, Shield } from "lucide-react";
import { PaperDoll } from "@/features/inventory/components/PaperDoll";
import { PlayerItem } from "@/features/inventory/types/inventory";
import { NumberTicker } from "@/components/ui/number-ticker";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Progress } from "@/components/ui/8bit/progress";
import { Button } from "@/components/ui/8bit/button";

export interface DashboardCharacterCardProps {
  character: any;
  items: PlayerItem[];
  equippedBeast?: any;
  muscleRecovery?: any;
}

interface StatRowProps {
  label: string;
  fullName: string;
  value: number;
  colorVar: string;
}

function StatRow({ label, fullName, value, colorVar }: StatRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
        <span className="font-bold font-mono tracking-wider text-foreground">
          {label} <span className="text-muted-foreground font-normal">({fullName})</span>
        </span>
        <span className="font-mono font-bold text-foreground">{value}</span>
      </div>
      <Progress
        value={value}
        max={100}
        variant="retro"
        progressBg={colorVar}
        className="h-2.5 border border-black"
      />
    </div>
  );
}

export function DashboardCharacterCard({
  character,
  items,
  equippedBeast,
  muscleRecovery,
}: DashboardCharacterCardProps) {
  const equippedItems = items.filter((i) => i.isEquipped);
  const powerValue = character?.power || 97;
  const level = character?.level || 1;
  const title = character?.title || "Ascendant";
  const recoveryFreshness = muscleRecovery?.summary?.overallFreshness ?? 100;

  const stats = [
    { label: "STR", fullName: "Strength", value: character?.stats?.strength || 18, colorVar: "bg-primary" },
    { label: "END", fullName: "Endurance", value: character?.stats?.endurance || 15, colorVar: "bg-primary" },
    { label: "DIS", fullName: "Discipline", value: character?.stats?.discipline || 22, colorVar: "bg-primary" },
    { label: "KNO", fullName: "Knowledge", value: character?.stats?.knowledge || 14, colorVar: "bg-primary" },
    { label: "FOC", fullName: "Focus", value: character?.stats?.focus || 16, colorVar: "bg-primary" },
    { label: "REC", fullName: "Recovery", value: character?.stats?.recovery || 20, colorVar: "bg-primary" },
  ];

  return (
    <Card variant="default" className="flex flex-col h-full shadow-[4px_4px_0_0_#000]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm sm:text-base tracking-wider text-foreground">
              CHARACTER
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Hero Vitrine & Attributes
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0.5 px-2">
            LV.{level}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4 flex-1 flex flex-col">
        {/* PaperDoll Hero Gear Display */}
        <div className="p-2 sm:p-3 bg-muted border-2 border-foreground dark:border-ring shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),2px_2px_0_0_#000] relative flex items-center justify-center min-h-[160px] sm:min-h-[190px]">
          <PaperDoll equippedItems={equippedItems} />
        </div>

        {/* 8-Bit Power Index */}
        <div className="p-2.5 bg-card border-2 border-foreground dark:border-ring shadow-[2px_2px_0_0_#000] flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            <Swords className="w-3.5 h-3.5 text-foreground" />
            <span>EXPEDITION POWER INDEX</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-foreground mt-1 drop-shadow-sm">
            <NumberTicker value={powerValue} />
          </div>
        </div>

        {/* Character Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted border border-border">
            <span className="text-[8px] sm:text-[9px] text-muted-foreground block font-bold uppercase tracking-wide">
              TITLE
            </span>
            <span className="text-[11px] sm:text-xs text-foreground font-bold truncate block mt-0.5">
              {title}
            </span>
          </div>
          <div className="p-2 bg-muted border border-border">
            <span className="text-[8px] sm:text-[9px] text-muted-foreground block font-bold uppercase tracking-wide">
              GUILD
            </span>
            <span className="text-[11px] sm:text-xs text-foreground font-bold truncate block mt-0.5">
              Lone Ascendants
            </span>
          </div>
          <div className="p-2 bg-muted border border-border flex items-center justify-between">
            <div>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground block font-bold uppercase tracking-wide">
                RECOVERY
              </span>
              <span className="text-[11px] sm:text-xs text-foreground font-bold block mt-0.5">
                {recoveryFreshness}% Ready
              </span>
            </div>
            <Activity className="w-4 h-4 text-foreground opacity-70" />
          </div>
          <div className="p-2 bg-muted border border-border flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-[8px] sm:text-[9px] text-muted-foreground block font-bold uppercase tracking-wide">
                FAMILIAR
              </span>
              <span className="text-[11px] sm:text-xs text-foreground font-bold truncate block mt-0.5">
                {equippedBeast ? equippedBeast.name : "None"}
              </span>
            </div>
            <Link href="/beasts">
              <Button size="sm" variant="outline" className="text-[8px] h-6 px-1.5 ml-1">
                <Footprints className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Attributes Section */}
        <div className="pt-3 border-t border-border space-y-2 mt-auto">
          <div className="flex items-center justify-between">
            <span className="retro text-[10px] sm:text-[11px] text-foreground font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              ATTRIBUTES
            </span>
            <Badge variant="secondary" className="text-[8px] py-0 px-1.5">
              SYNCHRONIZED
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {stats.map((stat) => (
              <StatRow
                key={stat.label}
                label={stat.label}
                fullName={stat.fullName}
                value={stat.value}
                colorVar={stat.colorVar}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardCharacterCard;
