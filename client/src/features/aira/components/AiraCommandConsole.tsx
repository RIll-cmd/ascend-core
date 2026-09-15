"use client"

import React, { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/neo/card"
import { Button } from "@/components/ui/neo/button"
import { AiraAvatar } from "@/components/ui/AiraAvatar"
import { AiraMessageItem } from "./AiraMessageItem"
import { AiraSuggestions } from "./AiraSuggestions"
import { AiraComposer } from "./AiraComposer"
import type { AIRAMessage } from "@/features/aira/types"
import { playUIMenuSFX } from "@/utils/audio"

interface AiraCommandConsoleProps {
  messages: AIRAMessage[]
  isLoading: boolean
  characterId: string
  inputPrompt: string
  setInputPrompt: (val: string) => void
  onSend: () => void
  onSelectPrompt: (promptText: string) => void
  onConfirmAction: (messageId: string, charId: string) => void
  onCancelAction: (messageId: string) => void
  onClearMessages: () => void
}

export const AiraCommandConsole: React.FC<AiraCommandConsoleProps> = ({
  messages,
  isLoading,
  characterId,
  inputPrompt,
  setInputPrompt,
  onSend,
  onSelectPrompt,
  onConfirmAction,
  onCancelAction,
  onClearMessages,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <Card className="flex-1 flex flex-col h-full min-h-[520px] bg-card text-card-foreground border-2 border-border shadow-shadow rounded-base overflow-hidden p-0">
      {/* Console Top Header Bar */}
      <CardHeader className="p-3 px-4 bg-secondary-background border-b-2 border-border flex flex-row items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-bold">
          <Terminal className="size-4" />
          <CardTitle className="text-xs font-mono font-bold tracking-wider text-cyan-300">
            &gt;_ aira@ascend-os:~/command-center
          </CardTitle>
        </div>

        {messages.length > 1 && (
          <Button
            size="xs"
            variant="neutral"
            onClick={() => {
              playUIMenuSFX("decline")
              onClearMessages()
            }}
            className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-red-400 h-7 px-2"
            title="Clear Terminal Log"
          >
            <Trash2 className="size-3 mr-1" />
            Clear Log
          </Button>
        )}
      </CardHeader>

      {/* Message Output Viewport */}
      <CardContent
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 font-mono text-xs min-h-0 bg-background/50 custom-scrollbar"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <AiraMessageItem
              key={msg.id}
              message={msg}
              characterId={characterId}
              confirmAction={onConfirmAction}
              cancelAction={onCancelAction}
              isLoading={isLoading}
            />
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 p-3 rounded-base bg-secondary-background border-2 border-border shadow-shadow text-cyan-300 font-mono text-xs w-fit"
          >
            <AiraAvatar mood="ANALYZING" className="size-6 rounded-base" />
            <span>AIRA calculating optimal trajectory... [100% accuracy sync]</span>
          </motion.div>
        )}
      </CardContent>

      {/* Console Footer: Suggestions + Composer */}
      <CardFooter className="flex flex-col gap-2.5 p-3.5 bg-secondary-background border-t-2 border-border shrink-0">
        {/* Quick Suggestion Chips */}
        <AiraSuggestions
          onSelectPrompt={onSelectPrompt}
          disabled={isLoading}
        />

        {/* Main Command Composer */}
        <AiraComposer
          inputPrompt={inputPrompt}
          setInputPrompt={setInputPrompt}
          onSend={onSend}
          isLoading={isLoading}
        />
      </CardFooter>
    </Card>
  )
}
