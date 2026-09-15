"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/neo/card"
import { Badge } from "@/components/ui/neo/badge"
import { AiraAvatar, type AiraMood } from "@/components/ui/AiraAvatar"

interface AiraIdentityCardProps {
  currentMood: string
  characterName?: string
}

export const AiraIdentityCard: React.FC<AiraIdentityCardProps> = ({
  currentMood,
  characterName = "Commander",
}) => {
  const currentHour = new Date().getHours()
  const timeOfDayGreeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening"

  return (
    <Card className="bg-card text-card-foreground border-2 border-border shadow-shadow rounded-base shrink-0 p-4">
      <CardContent className="p-0 flex flex-col gap-3">
        {/* Avatar & System Info Lockup */}
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-base bg-secondary-background border-2 border-border flex items-center justify-center shadow-shadow shrink-0 p-0.5">
            <AiraAvatar mood={currentMood as AiraMood} className="w-10 h-10 rounded-base" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h2 className="text-base font-black font-heading text-foreground tracking-wider uppercase">
                AIRA
              </h2>
              <Badge variant="emerald" className="text-[9px] px-1.5 py-0 uppercase">
                ONLINE
              </Badge>
            </div>
            <p className="text-[11px] text-cyan-400 font-mono font-bold tracking-wider uppercase truncate">
              System Administrator
            </p>
          </div>
        </div>

        {/* Dynamic Voice Line / Greeting Box */}
        <div className="bg-secondary-background border-2 border-border p-3 rounded-base shadow-none">
          <p className="text-xs text-foreground/90 font-mono leading-relaxed italic">
            &ldquo;{timeOfDayGreeting}, {characterName}. All neural resonance matrices are synchronized.&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
