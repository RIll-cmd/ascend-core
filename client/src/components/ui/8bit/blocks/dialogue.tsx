"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../alert";
import "../styles/retro.css";

export interface DialogueProps extends React.HTMLAttributes<HTMLDivElement> {
  avatarSrc?: string;
  avatarFallback?: string;
  speakerName?: string;
  dialogueText: string;
  isPlayer?: boolean;
  typewriter?: boolean;
  typewriterSpeed?: number;
  onComplete?: () => void;
  onAdvance?: () => void;
  showContinuePrompt?: boolean;
}

export default function Dialogue({
  className,
  avatarSrc,
  avatarFallback = "AI",
  speakerName = "A.I.R.A.",
  dialogueText,
  isPlayer = false,
  typewriter = true,
  typewriterSpeed = 25,
  onComplete,
  onAdvance,
  showContinuePrompt = true,
  ...props
}: DialogueProps) {
  const [prevText, setPrevText] = React.useState(dialogueText);
  const [charCount, setCharCount] = React.useState(typewriter ? 0 : dialogueText.length);
  const [isTyping, setIsTyping] = React.useState(typewriter);

  if (prevText !== dialogueText) {
    setPrevText(dialogueText);
    setCharCount(typewriter ? 0 : dialogueText.length);
    setIsTyping(typewriter);
  }

  React.useEffect(() => {
    if (!typewriter) return;

    const timer = setInterval(() => {
      setCharCount((prev) => {
        const next = prev + 1;
        if (next >= dialogueText.length) {
          clearInterval(timer);
          setIsTyping(false);
          onComplete?.();
          return dialogueText.length;
        }
        return next;
      });
    }, typewriterSpeed);

    return () => clearInterval(timer);
  }, [dialogueText, typewriter, typewriterSpeed, onComplete]);

  const currentText = typewriter ? dialogueText.slice(0, charCount) : dialogueText;
  const currentlyTyping = typewriter ? isTyping : false;

  const handleBoxClick = () => {
    if (currentlyTyping) {
      // Fast-forward text
      setCharCount(dialogueText.length);
      setIsTyping(false);
      onComplete?.();
    } else {
      onAdvance?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBoxClick();
    }
  };

  return (
    <div
      role="region"
      aria-label={`Dialogue from ${speakerName}`}
      tabIndex={0}
      onClick={handleBoxClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex gap-3 sm:gap-4 items-start cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c453] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1020]",
        isPlayer ? "flex-row-reverse" : "flex-row",
        className
      )}
      {...props}
    >
      {/* Character Avatar Box */}
      <div className="relative shrink-0">
        <div className="size-14 sm:size-16 rounded-none bg-[#120824] border-2 border-black p-1 shadow-[2px_2px_0_0_#000] flex items-center justify-center">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={speakerName}
              width={64}
              height={64}
              unoptimized
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/avatars/player-front.png";
              }}
              className="w-full h-full object-contain pixelated"
            />
          ) : (
            <span className="retro text-xs text-[#f6c453] font-bold">
              {avatarFallback}
            </span>
          )}
        </div>
        {/* Decorative corner dots */}
        <span className="absolute -top-1 -left-1 size-1 bg-[#f6c453] pointer-events-none" />
        <span className="absolute -bottom-1 -right-1 size-1 bg-[#f6c453] pointer-events-none" />
      </div>

      {/* Retro Dialogue Box */}
      <Alert
        variant={isPlayer ? "default" : "dungeon"}
        className={cn(
          "flex-1 min-w-0 pr-8 transition-colors group-hover:border-[#f6c453]",
          isPlayer && "text-right"
        )}
      >
        <AlertTitle className="retro text-xs font-bold text-[#f6c453] flex items-center gap-2">
          <span>{speakerName}</span>
          {currentlyTyping && <span className="text-[9px] text-cyan-400 animate-pulse font-mono">• transmitting</span>}
        </AlertTitle>

        <AlertDescription
          aria-live="polite"
          className="retro text-[10px] sm:text-[11px] leading-relaxed text-slate-200 mt-1 min-h-[36px]"
        >
          {currentText}
          {currentlyTyping && <span className="animate-pixel-blink ml-1">▮</span>}
        </AlertDescription>

        {/* Flashing Continue Indicator */}
        {showContinuePrompt && !currentlyTyping && (
          <div
            className={cn(
              "absolute bottom-2 right-3 font-pixel text-xs text-[#f6c453] animate-retro-float select-none pointer-events-none"
            )}
          >
            ▼
          </div>
        )}
      </Alert>
    </div>
  );
}

export { Dialogue };
