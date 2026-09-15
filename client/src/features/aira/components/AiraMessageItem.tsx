"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"
import { Sparkles, Calendar, Clock, Shield } from "lucide-react"
import { Badge } from "@/components/ui/neo/badge"
import { Button } from "@/components/ui/neo/button"
import { AiraAvatar, type AiraMood } from "@/components/ui/AiraAvatar"
import type { AIRAMessage } from "@/features/aira/types"
import { playVoiceLine, playBattleSFX, playUIMenuSFX } from "@/utils/audio"

interface AiraMessageItemProps {
  message: AIRAMessage
  characterId: string
  confirmAction: (messageId: string, characterId: string) => void
  cancelAction: (messageId: string) => void
  isLoading: boolean
}

export const AiraMessageItem: React.FC<AiraMessageItemProps> = ({
  message,
  characterId,
  confirmAction,
  cancelAction,
  isLoading,
}) => {
  const isUser = message.sender === "user"

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end w-full"
      >
        <div className="max-w-[85%] sm:max-w-[75%] p-3 sm:p-3.5 rounded-base border-2 border-border bg-main text-main-foreground shadow-shadow font-mono text-xs sm:text-sm font-bold">
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
          <div className="text-[10px] text-main-foreground/70 text-right mt-1 font-mono">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </motion.div>
    )
  }

  // AIRA Response Message
  const action = message.pendingAction
  const args = action?.action_args || {}
  const isCalendarAction =
    action?.action_type === "create_calendar_schedule" ||
    action?.action_type === "create_calendar_schedule_multi"
  const isPlan = action?.action_type === "generate_progression_plan"
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2.5 sm:gap-3 w-full"
    >
      {/* AIRA Avatar Orb */}
      <div className="size-8 sm:size-9 rounded-base bg-secondary-background border-2 border-border flex items-center justify-center shrink-0 shadow-shadow mt-0.5">
        <AiraAvatar mood={(message.mood || "NEUTRAL") as AiraMood} className="w-7 h-7 rounded-base" />
      </div>

      {/* Message Surface */}
      <div className="flex-1 min-w-0 max-w-[92%] sm:max-w-[85%] p-3.5 sm:p-4 rounded-base border-2 border-border bg-card text-card-foreground shadow-shadow">
        {/* Header Tag */}
        <div className="flex items-center justify-between border-b-2 border-border pb-2 mb-2.5 font-mono">
          <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="size-3.5" /> AIRA PERSONA ANALYSIS
          </span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Markdown Formatted Text */}
        <div className="font-sans text-sm text-foreground leading-relaxed">
          <ReactMarkdown
            components={{
              p: ({ ...props }) => <p className="mb-2.5 last:mb-0" {...props} />,
              strong: ({ ...props }) => <strong className="font-black text-cyan-300" {...props} />,
              table: ({ ...props }) => (
                <div className="overflow-x-auto my-3 rounded-base border-2 border-border shadow-shadow">
                  <table className="w-full text-xs text-left" {...props} />
                </div>
              ),
              th: ({ ...props }) => (
                <th className="bg-secondary-background p-2 font-mono font-bold text-cyan-300 border-b-2 border-border" {...props} />
              ),
              td: ({ ...props }) => (
                <td className="p-2 border-b border-border/50 font-mono" {...props} />
              ),
              ul: ({ ...props }) => <ul className="list-disc list-inside mb-2.5 space-y-1" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal list-inside mb-2.5 space-y-1" {...props} />,
              li: ({ ...props }) => <li className="pl-1" {...props} />,
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>

        {/* Pending Action Protocols */}
        {action && (
          <div className="mt-3.5 pt-3 border-t-2 border-border">
            {isCalendarAction ? (
              /* Calendar Schedule Action Card */
              <div className="p-3.5 bg-secondary-background border-2 border-border rounded-base shadow-shadow space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-base bg-main text-main-foreground border-2 border-border">
                      <Calendar className="size-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-cyan-300 uppercase tracking-wider block font-mono">
                        CALENDAR SCHEDULE PROTOCOL
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {action.action_type === "create_calendar_schedule_multi"
                          ? "MULTI-DAY RECURRING BUNDLE"
                          : `${args.scheduleType || args.schedule_type || "WEEKLY"} ENTRY`}
                      </span>
                    </div>
                  </div>
                  <Badge variant="cyan" className="text-[10px] font-mono">
                    {action.action_type === "create_calendar_schedule_multi"
                      ? `${args.schedules?.length || args.days?.length || 2} SLOTS`
                      : "1 SLOT"}
                  </Badge>
                </div>

                {/* Event Details */}
                <div className="bg-card p-3 rounded-base border-2 border-border space-y-2">
                  <div className="flex items-baseline justify-between border-b border-border pb-1.5 font-mono text-xs">
                    <span className="text-muted-foreground uppercase">EVENT</span>
                    <span className="font-bold text-foreground">
                      {args.title || "Scheduled Session"}
                    </span>
                  </div>

                  {action.action_type === "create_calendar_schedule_multi" ? (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">
                        RECURRENCE SLOTS:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {(
                          args.schedules ||
                          (args.days || []).map((d: string) => ({
                            title: args.title || "Scheduled Session",
                            time: args.time || "09:00",
                            day_of_week: d,
                            schedule_type: "WEEKLY",
                          }))
                        ).map((sched: { dayOfWeek?: number | string; day_of_week?: number | string; time?: string; endTime?: string; end_time?: string }, idx: number) => {
                          const rawDow = sched.dayOfWeek ?? sched.day_of_week
                          const dayLabel =
                            typeof rawDow === "number"
                              ? dayNames[rawDow] || `Day ${rawDow}`
                              : rawDow || args.days?.[idx] || "Weekly"
                          const schedTime = sched.time || args.time || "09:00"
                          const schedEndTime =
                            sched.endTime || sched.end_time || args.endTime || args.end_time
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-base bg-secondary-background border-2 border-border text-xs font-mono"
                            >
                              <span className="font-bold text-cyan-300">{dayLabel}</span>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="size-3 text-cyan-400" />
                                <span>{schedTime}{schedEndTime ? ` - ${schedEndTime}` : ""}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1 text-xs font-mono">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-bold text-cyan-300">
                        {args.time || "09:00"}{args.endTime || args.end_time ? ` - ${args.endTime || args.end_time}` : ""}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs font-mono text-cyan-200/90 bg-cyan-950/30 border-2 border-border p-2 rounded-base">
                  {action.summary}
                </p>

                {/* Buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="cyan"
                    onClick={() => {
                      playBattleSFX("impact")
                      playVoiceLine("/sounds/AIRA Persona/AI-CONFRIMED.mp3")
                      confirmAction(message.id, characterId)
                    }}
                    disabled={isLoading}
                    className="flex-1 font-mono uppercase font-black text-xs h-8"
                  >
                    [ SCHEDULE ]
                  </Button>
                  <Button
                    variant="neutral"
                    onClick={() => {
                      playUIMenuSFX("decline")
                      cancelAction(message.id)
                    }}
                    disabled={isLoading}
                    className="flex-1 font-mono uppercase font-bold text-xs h-8"
                  >
                    [ CANCEL ]
                  </Button>
                </div>
              </div>
            ) : (
              /* Habit / Progression Plan Action Card */
              <div className="p-3.5 bg-secondary-background border-2 border-border rounded-base shadow-shadow space-y-2.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-cyan-400" />
                  <span className="font-bold uppercase tracking-wider text-cyan-300">
                    {isPlan ? "RECOMMENDED HABITS PROTOCOL" : "SYSTEM ACTION PROPOSED"}
                  </span>
                </div>
                <p className="text-foreground/90 bg-card p-2 rounded-base border-2 border-border">
                  {action.summary}
                </p>

                {isPlan && (
                  <div className="bg-card p-2 rounded-base border-2 border-border space-y-1 text-muted-foreground">
                    <p>+ {args.habit1_title || "Read for 30m"}</p>
                    <p>+ {args.habit2_title || "Code for 1h"}</p>
                    <p>+ {args.habit3_title || "Review notes"}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="cyan"
                    onClick={() => {
                      playBattleSFX("impact")
                      if (isPlan) {
                        playVoiceLine("/sounds/AIRA Persona/AI-SUCCESSFUL.mp3")
                      } else {
                        playVoiceLine("/sounds/AIRA Persona/AI-CONFRIMED.mp3")
                      }
                      confirmAction(message.id, characterId)
                    }}
                    disabled={isLoading}
                    className="flex-1 font-mono uppercase font-black text-xs h-8"
                  >
                    {isPlan ? "[ ACCEPT PLAN ]" : "[ CONFIRM ]"}
                  </Button>
                  <Button
                    variant="neutral"
                    onClick={() => {
                      playUIMenuSFX("decline")
                      cancelAction(message.id)
                    }}
                    disabled={isLoading}
                    className="flex-1 font-mono uppercase font-bold text-xs h-8"
                  >
                    [ CANCEL ]
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
