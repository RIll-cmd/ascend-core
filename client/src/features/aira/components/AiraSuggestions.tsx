"use client"

import React from "react"
import {
  ListTodo,
  HeartPulse,
  Dumbbell,
  Zap,
  Swords,
  Target,
  Package,
  PawPrint,
  ShoppingBag,
  Trophy,
  Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/neo/button"

export const QUICK_PROMPTS = [
  {
    id: "missions",
    title: "Missions & Habits",
    icon: ListTodo,
    color: "text-cyan-400",
    promptText: "What are my pending missions and habits today?",
  },
  {
    id: "recovery",
    title: "Muscle Recovery",
    icon: HeartPulse,
    color: "text-emerald-400",
    promptText: "Check my muscle recovery and fatigue status",
  },
  {
    id: "workout-split",
    title: "Workout Split",
    icon: Dumbbell,
    color: "text-blue-400",
    promptText: "Recommend an optimal workout routine based on my muscle recovery",
  },
  {
    id: "skills",
    title: "Skills & SP",
    icon: Zap,
    color: "text-amber-400",
    promptText: "Show my class skills and available SP",
  },
  {
    id: "tower",
    title: "Tower Analysis",
    icon: Swords,
    color: "text-red-400",
    promptText: "Can I beat the next floor of the Tower?",
  },
  {
    id: "boss-pr",
    title: "Weekly Boss PR",
    icon: Target,
    color: "text-rose-400",
    promptText: "How is my weekly gym Boss PR trial progressing?",
  },
  {
    id: "equipment",
    title: "Gear & Armory",
    icon: Package,
    color: "text-indigo-400",
    promptText: "Analyze my inventory gear and recommend upgrades",
  },
  {
    id: "beasts",
    title: "Beasts & Pets",
    icon: PawPrint,
    color: "text-teal-400",
    promptText: "Check my pet egg incubation and active companion buffs",
  },
  {
    id: "shop",
    title: "Shop Deals",
    icon: ShoppingBag,
    color: "text-yellow-400",
    promptText: "What items can I afford in the shop right now?",
  },
  {
    id: "achievements",
    title: "Achievements",
    icon: Trophy,
    color: "text-amber-300",
    promptText: "What achievements can I claim right now?",
  },
  {
    id: "automations",
    title: "Automations",
    icon: Workflow,
    color: "text-purple-400",
    promptText: "List my active automation rules and trigger states",
  },
]

interface AiraSuggestionsProps {
  onSelectPrompt: (promptText: string) => void
  disabled: boolean
}

export const AiraSuggestions: React.FC<AiraSuggestionsProps> = ({
  onSelectPrompt,
  disabled,
}) => {
  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {QUICK_PROMPTS.map((chip) => {
        const Icon = chip.icon
        return (
          <Button
            key={chip.id}
            type="button"
            variant="neutral"
            size="xs"
            onClick={() => onSelectPrompt(chip.promptText)}
            disabled={disabled}
            title={chip.promptText}
            className="shrink-0 font-mono text-[11px] gap-1.5 h-7 px-2.5 rounded-base whitespace-nowrap"
          >
            <Icon className={`size-3.5 ${chip.color}`} />
            <span>{chip.promptText}</span>
          </Button>
        )
      })}
    </div>
  )
}
