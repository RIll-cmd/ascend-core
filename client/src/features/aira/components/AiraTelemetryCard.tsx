"use client"

import React from "react"
import { Activity } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/neo/card"
import { Badge } from "@/components/ui/neo/badge"
import { Progress } from "@/components/ui/neo/progress"

interface AiraTelemetryCardProps {
  level?: number
  power?: number
  consistency?: number
}

export const AiraTelemetryCard: React.FC<AiraTelemetryCardProps> = ({
  level = 1,
  power = 50,
  consistency = 100,
}) => {
  const habitStrength = Math.max(0, consistency - 5)
  const workoutConsistency = Math.max(0, consistency - 12)

  return (
    <Card className="bg-card text-card-foreground border-2 border-border shadow-shadow rounded-base flex flex-col p-4">
      <CardHeader className="p-0 pb-3 border-b-2 border-border flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-black text-foreground tracking-wider flex items-center gap-2 uppercase font-mono">
          <Activity className="size-4 text-cyan-400" />
          SYSTEM TELEMETRY
        </CardTitle>
        <Badge variant="cyan" className="text-[10px] font-mono uppercase tracking-wider">
          100% SYNC
        </Badge>
      </CardHeader>

      <CardContent className="p-0 pt-3 space-y-3 font-mono text-xs">
        {/* Row 1: Character Level */}
        <div className="flex justify-between items-center bg-secondary-background border-2 border-border px-3 py-1.5 rounded-base">
          <span className="text-muted-foreground uppercase text-[11px] font-bold">
            Character Level
          </span>
          <span className="font-black text-cyan-300 text-sm">
            Lv. {level}
          </span>
        </div>

        {/* Row 2: Power Rating */}
        <div className="flex justify-between items-center bg-secondary-background border-2 border-border px-3 py-1.5 rounded-base">
          <span className="text-muted-foreground uppercase text-[11px] font-bold">
            Power Rating
          </span>
          <span className="font-black text-amber-400 text-sm">
            {power}
          </span>
        </div>

        {/* Row 3: Mission Success */}
        <div className="space-y-1 bg-secondary-background border-2 border-border p-2.5 rounded-base">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-muted-foreground uppercase">Mission Success</span>
            <span className="text-emerald-400">{consistency}%</span>
          </div>
          <Progress value={consistency} className="h-2.5" />
        </div>

        {/* Row 4: Habit Strength */}
        <div className="space-y-1 bg-secondary-background border-2 border-border p-2.5 rounded-base">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-muted-foreground uppercase">Habit Strength</span>
            <span className="text-emerald-400">{habitStrength}%</span>
          </div>
          <Progress value={habitStrength} className="h-2.5" />
        </div>

        {/* Row 5: Workout Consistency */}
        <div className="space-y-1 bg-secondary-background border-2 border-border p-2.5 rounded-base">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-muted-foreground uppercase">Workout Consistency</span>
            <span className="text-cyan-400">{workoutConsistency}%</span>
          </div>
          <Progress value={workoutConsistency} className="h-2.5" />
        </div>
      </CardContent>
    </Card>
  )
}
