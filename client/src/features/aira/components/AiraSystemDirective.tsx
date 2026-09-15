"use client"

import React from "react"
import { Shield, AlertTriangle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/neo/alert"
import type { AIRASystemStatusResponse } from "@/features/aira/types"

interface AiraSystemDirectiveProps {
  systemStatus: AIRASystemStatusResponse | null
}

export const AiraSystemDirective: React.FC<AiraSystemDirectiveProps> = ({
  systemStatus,
}) => {
  const isWarning = systemStatus?.status === "warning"
  const message =
    systemStatus?.message ||
    "System optimal. No critical anomalies detected in ascension path."

  return (
    <Alert
      variant={isWarning ? "warning" : "optimal"}
      className="rounded-base border-2 border-border shadow-shadow"
    >
      {isWarning ? (
        <AlertTriangle className="size-4 text-amber-400" />
      ) : (
        <Shield className="size-4 text-emerald-400" />
      )}
      <AlertTitle className="text-foreground">
        {isWarning ? "ATTENTION REQUIRED" : "SYSTEM DIRECTIVE"}
      </AlertTitle>
      <AlertDescription className="text-foreground/90 font-mono text-xs">
        <p>{message}</p>
        {isWarning && (
          <div className="mt-2 p-2 bg-amber-950/40 border-2 border-border rounded-base text-[11px] text-amber-300">
            <span className="font-bold uppercase tracking-wider block mb-0.5">
              Recommended Action:
            </span>
            <span>Consult with AIRA in the command console for routine recalibration.</span>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
