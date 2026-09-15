"use client"

import React from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/neo/badge"
import { Button } from "@/components/ui/neo/button"
import { Switch } from "@/components/ui/neo/switch"

interface AiraHeaderProps {
  autoBriefingsEnabled: boolean
  toggleAutoBriefings: () => void
  handleMorningBriefing: () => void
  isLoading: boolean
}

export const AiraHeader: React.FC<AiraHeaderProps> = ({
  autoBriefingsEnabled,
  toggleAutoBriefings,
  handleMorningBriefing,
  isLoading,
}) => {
  return (
    <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-5 bg-card text-card-foreground border-2 border-border shadow-shadow rounded-base select-none">
      {/* Title and Subtitle */}
      <div className="flex items-center gap-3">
        <div className="size-9 sm:size-10 rounded-base bg-main text-main-foreground border-2 border-border flex items-center justify-center shadow-shadow shrink-0">
          <Sparkles className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase font-mono text-foreground">
              AIRA COMMAND CENTER
            </h1>
            <Badge variant="emerald" className="hidden xs:inline-flex text-[10px] tracking-widest uppercase">
              SYSTEM ONLINE
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Adaptive Intelligence & Resonance Assistant • Neural Link v4.2
          </p>
        </div>
      </div>

      {/* Briefings Controls */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        {/* Briefings Toggle */}
        <div className="flex items-center gap-2 bg-secondary-background border-2 border-border px-3 py-1 rounded-base shadow-shadow">
          <span className="text-xs font-mono font-bold uppercase text-foreground">
            Briefings:
          </span>
          <Switch
            size="sm"
            checked={autoBriefingsEnabled}
            onCheckedChange={toggleAutoBriefings}
            aria-label="Toggle Auto Briefings"
          />
          <span
            className={`text-xs font-mono font-black ${
              autoBriefingsEnabled ? "text-cyan-400" : "text-slate-400"
            }`}
          >
            {autoBriefingsEnabled ? "ON" : "OFF"}
          </span>
        </div>

        {/* Generate Briefing Button */}
        <Button
          size="sm"
          variant="cyan"
          onClick={handleMorningBriefing}
          disabled={isLoading}
          className="text-xs font-mono uppercase tracking-wider h-8"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Briefing</span>
        </Button>
      </div>
    </header>
  )
}
