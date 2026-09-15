"use client";

import React from "react";
import Link from "next/link";
import { Mountain } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";

export interface DashboardTowerCardProps {
  floors: any[];
}

export function DashboardTowerCard({ floors }: DashboardTowerCardProps) {
  const sortedTowerFloors = [...floors].sort(
    (a, b) => a.floorNumber - b.floorNumber
  );
  const activeFloor =
    sortedTowerFloors.find(
      (f) => f.status === "AVAILABLE" || f.status === "ATTEMPTED"
    ) || sortedTowerFloors[0] || {
      floorNumber: 1,
      requiredPower: 100,
      towerTokensReward: 10,
      enemy: { name: "Floor 1 Guardian", level: 1 },
      isBoss: false,
    };

  const enemyName =
    activeFloor.enemy?.name || `Floor ${activeFloor.floorNumber} Guardian`;
  const enemyDesc = `Level ${
    activeFloor.enemy?.level || activeFloor.floorNumber
  } ${
    activeFloor.isBoss ? "Apex Sentinel" : "Canopy Guardian"
  }. Overcome to claim tower ascension tokens.`;
  const towerTokensReward =
    activeFloor.towerTokensReward ||
    activeFloor.floorNumber * 10 * (activeFloor.isBoss ? 3 : 1);

  return (
    <Card variant="default" className="flex flex-col h-full shadow-[4px_4px_0_0_#000]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm sm:text-base tracking-wider text-foreground">
              TOWER OF ASCENSION
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Spire Mountain Ascent
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0.5 px-2 font-mono">
            F{activeFloor.floorNumber}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3 flex-1 flex flex-col justify-between">
        <div className="p-3 bg-muted border border-border space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground truncate">
              {enemyName}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground font-bold shrink-0 ml-1">
              REQ: {activeFloor.requiredPower?.toLocaleString()}
            </span>
          </div>

          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
            {enemyDesc}
          </p>

          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-border">
            <span className="text-muted-foreground font-bold">BOUNTY</span>
            <span className="font-mono font-bold text-foreground">
              +{towerTokensReward} Tokens
            </span>
          </div>
        </div>

        <Link href="/tower" className="block w-full mt-auto">
          <Button
            size="sm"
            variant="default"
            className="w-full text-[9px] sm:text-[10px] h-8"
          >
            <Mountain className="w-3.5 h-3.5 mr-1" />
            Ascend Floor {activeFloor.floorNumber}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default DashboardTowerCard;
