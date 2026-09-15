"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Skull } from "lucide-react";
import { getEnemySpritePath } from "@/utils/sprites";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { EnemyHealthDisplay } from "@/components/ui/8bit/enemy-health-display";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/8bit/empty";
import { Skeleton } from "@/components/ui/8bit/skeleton";

export interface DashboardBossCardProps {
  bosses: any[];
  isBossesLoading: boolean;
}

export function DashboardBossCard({
  bosses,
  isBossesLoading,
}: DashboardBossCardProps) {
  const router = useRouter();

  const activeBoss = bosses.find((b) => b.status === "ACTIVE") || bosses[0];

  return (
    <Card
      variant="default"
      className="flex flex-col h-full shadow-[4px_4px_0_0_#000] border-t-4 border-t-destructive"
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm sm:text-base tracking-wider text-foreground">
              ACTIVE BOSS
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Primeval Threat Targeted
            </CardDescription>
          </div>
          <Badge variant="destructive" className="text-[8px] sm:text-[9px] py-0.5 px-2">
            BOUNTY
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3 flex-1 flex flex-col justify-between">
        {isBossesLoading && bosses.length === 0 ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !activeBoss ? (
          <Empty className="my-auto py-6">
            <EmptyMedia variant="icon">
              <Skull className="w-5 h-5 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>No active boss targeted.</EmptyTitle>
            <EmptyDescription>
              Select an apex threat to track expedition combat telemetry and coordinate boss strikes.
            </EmptyDescription>
            <EmptyContent>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => router.push("/bosses")}
                className="text-[9px] h-8 px-3"
              >
                <Skull className="w-3.5 h-3.5 mr-1" />
                Target Apex Beast
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          (() => {
            const damageDealt = activeBoss.maxHp - activeBoss.currentHp;
            const contributionPct =
              activeBoss.maxHp > 0
                ? ((damageDealt / activeBoss.maxHp) * 100).toFixed(1)
                : "0.0";

            return (
              <>
                <div className="flex items-center gap-3 p-2.5 bg-muted border border-border shadow-[1px_1px_0_0_#000]">
                  {/* Boss Sprite Vitrine */}
                  <div className="w-14 h-14 bg-card border-2 border-foreground dark:border-ring flex items-center justify-center shrink-0 p-1 relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                    <img
                      src={getEnemySpritePath(activeBoss.name, 1, true)}
                      alt={activeBoss.name}
                      className="w-full h-full object-contain pixelated animate-pixel-bob"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {activeBoss.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[7px] py-0 px-1">
                        {activeBoss.difficulty}
                      </Badge>
                      <Badge variant="secondary" className="text-[7px] py-0 px-1">
                        {activeBoss.category}
                      </Badge>
                    </div>
                    <div className="text-[9px] font-mono font-bold text-muted-foreground mt-1">
                      CONTRIBUTION: {contributionPct}%
                    </div>
                  </div>
                </div>

                {/* 8-Bit EnemyHealthDisplay */}
                <div className="p-2.5 bg-muted border border-border">
                  <EnemyHealthDisplay
                    enemyName={activeBoss.name}
                    isBoss={true}
                    currentHealth={activeBoss.currentHp}
                    maxHealth={activeBoss.maxHp}
                    textColor="red"
                    healthBarColor="bg-destructive"
                    showLevel={false}
                    size="sm"
                  />
                </div>

                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full text-[9px] sm:text-[10px] h-8 mt-auto"
                  onClick={() => router.push("/bosses")}
                >
                  VIEW BOSS
                </Button>
              </>
            );
          })()
        )}
      </CardContent>
    </Card>
  );
}

export default DashboardBossCard;
