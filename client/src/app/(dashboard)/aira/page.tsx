"use client"

import React, { useState, useEffect } from "react"
import { useCharacterStore } from "@/store/useCharacterStore"
import { useAiraStore } from "@/features/aira/store"
import { fetchSystemStatus } from "@/features/aira/services/aira.service"
import { playVoiceLine, playUIMenuSFX } from "@/utils/audio"

// Modular Neobrutalism Presentation Components
import { AiraHeader } from "@/features/aira/components/AiraHeader"
import { AiraIdentityCard } from "@/features/aira/components/AiraIdentityCard"
import { AiraTelemetryCard } from "@/features/aira/components/AiraTelemetryCard"
import { AiraCommandConsole } from "@/features/aira/components/AiraCommandConsole"

export default function AiraTerminalPage() {
  const { character } = useCharacterStore()
  const {
    messages,
    isLoading,
    loadDailyReport,
    sendPrompt,
    confirmAction,
    cancelAction,
    autoBriefingsEnabled,
    toggleAutoBriefings,
    currentMood,
    clearMessages,
  } = useAiraStore()

  const [inputPrompt, setInputPrompt] = useState("")

  const characterId = character?.id || "char-id-123"

  useEffect(() => {
    const loadStatus = async () => {
      const status = await fetchSystemStatus(characterId)
      if (status?.status === "warning") {
        playVoiceLine("/sounds/AIRA Persona/AI-NOTICE.mp3")
      }
    }
    loadStatus()
  }, [characterId])

  const handleSend = async () => {
    if (!inputPrompt.trim() || isLoading) return
    const promptToSend = inputPrompt
    setInputPrompt("")
    playUIMenuSFX("confirm")
    await sendPrompt(promptToSend, characterId)
  }

  const handleQuickPrompt = async (text: string) => {
    if (isLoading) return
    playUIMenuSFX("hover")
    await sendPrompt(text, characterId)
  }

  const handleMorningBriefing = async () => {
    if (isLoading) return
    playUIMenuSFX("confirm")
    await loadDailyReport(characterId)
  }

  return (
    <div className="aira-neo-theme flex-1 flex flex-col gap-4 max-w-7xl w-full mx-auto font-sans text-foreground min-h-0 animate-in fade-in duration-300">
      {/* 1. Neobrutalist Header Bar */}
      <AiraHeader
        autoBriefingsEnabled={autoBriefingsEnabled}
        toggleAutoBriefings={toggleAutoBriefings}
        handleMorningBriefing={handleMorningBriefing}
        isLoading={isLoading}
      />

      {/* 2. Responsive 12-Column Neobrutalist Command Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: AIRA IDENTITY & TELEMETRY RAIL (4 cols)      */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          {/* AIRA Core Identity Card (Mobile Order 1) */}
          <AiraIdentityCard
            currentMood={currentMood}
            characterName={character?.name || "Commander"}
          />

          {/* System Telemetry Metrics Card (Desktop Left Rail) */}
          <div className="hidden lg:block">
            <AiraTelemetryCard
              level={character?.level || 1}
              power={character?.power || 50}
              consistency={character?.stats?.consistency || 100}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: MAIN DOMINANT COMMAND CONSOLE (8 cols)     */}
        {/* (Mobile Order 3)                                          */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 flex flex-col flex-1 h-full min-h-[520px] lg:min-h-0">
          <AiraCommandConsole
            messages={messages}
            isLoading={isLoading}
            characterId={characterId}
            inputPrompt={inputPrompt}
            setInputPrompt={setInputPrompt}
            onSend={handleSend}
            onSelectPrompt={handleQuickPrompt}
            onConfirmAction={confirmAction}
            onCancelAction={cancelAction}
            onClearMessages={clearMessages}
          />
        </div>

        {/* System Telemetry Metrics Card (Mobile Order 4: placed below console) */}
        <div className="block lg:hidden">
          <AiraTelemetryCard
            level={character?.level || 1}
            power={character?.power || 50}
            consistency={character?.stats?.consistency || 100}
          />
        </div>
      </div>
    </div>
  )
}
