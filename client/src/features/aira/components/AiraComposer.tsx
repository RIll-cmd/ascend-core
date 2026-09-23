"use client"

import React, { useRef } from "react"
import { Send } from "lucide-react"
import { Input } from "@/components/ui/neo/input"
import { Button } from "@/components/ui/neo/button"
import { AscendPendingSpinner } from "@/components/loading/AscendPendingSpinner"

interface AiraComposerProps {
  inputPrompt: string
  setInputPrompt: (value: string) => void
  onSend: () => void
  isLoading: boolean
}

export const AiraComposer: React.FC<AiraComposerProps> = ({
  inputPrompt,
  setInputPrompt,
  onSend,
  isLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="w-full flex items-center gap-2">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Ask AIRA anything (or pick a suggestion above)..."
        value={inputPrompt}
        onChange={(e) => setInputPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="h-11 flex-1 bg-secondary-background border-2 border-border font-mono text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-main rounded-base shadow-shadow"
      />
      <Button
        type="button"
        variant="cyan"
        onClick={onSend}
        disabled={isLoading || !inputPrompt.trim()}
        className="h-11 px-4 sm:px-6 font-mono font-black uppercase tracking-wider text-xs gap-1.5 shrink-0 rounded-base shadow-shadow"
      >
        <span className="hidden sm:inline">SEND</span>
        {isLoading ? <AscendPendingSpinner label="AIRA is responding" /> : <Send className="size-4" />}
      </Button>
    </div>
  )
}
