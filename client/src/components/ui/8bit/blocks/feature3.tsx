"use client";

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/8bit/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/8bit/carousel";
import {
  GraphicHabitsIcon,
  GraphicWorkoutsIcon,
  GraphicSleepIcon,
  GraphicLearningIcon,
  GraphicSkillsIcon,
  GraphicTowerIcon,
  GraphicBossesIcon,
  GraphicBeastsIcon,
  GraphicAiraIcon,
} from "@/components/ui/icons/SidebarGraphicIcons";
import { ArrowUpRight } from "lucide-react";
import "@/components/ui/8bit/styles/retro.css";

export interface CarouselFeature {
  key?: string;
  badge?: string;
  badgeVariant?: "default" | "primary" | "secondary" | "destructive" | "success" | "gold" | "outline" | "mythic";
  iconColor: string;
  guild?: string;
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
}

export interface Feature3Props {
  className?: string;
  badge?: string;
  title?: string;
  description?: string;
  items?: CarouselFeature[];
  onSelectFeature?: (key: string) => void;
}

export const defaultCarouselFeatures: CarouselFeature[] = [
  {
    key: "workouts",
    guild: "IRON FORGE",
    title: "HEAVY IRON GYM & 16-MUSCLE HEATMAP",
    badge: "STR + PWR",
    badgeVariant: "success",
    iconColor: "bg-neutral-900",
    icon: <GraphicWorkoutsIcon className="h-6 w-6" />,
    description:
      "Heavy iron sets, 1RM telemetry, and 16-muscle fatigue decay tracking.",
  },
  {
    key: "habits",
    guild: "CHRONO HABITATS",
    title: "NEURAL HABIT MATRIX & STREAKS",
    badge: "MOMENTUM",
    badgeVariant: "destructive",
    iconColor: "bg-neutral-900",
    icon: <GraphicHabitsIcon className="h-6 w-6" />,
    description:
      "Decay curves, Bronze-to-Gold tiers, and Streak Freeze Shields.",
  },
  {
    key: "sleep",
    guild: "SPARTAN SYNDICATE",
    title: "SLEEP & CIRCADIAN RECOVERY",
    badge: "HRV SHIELD",
    badgeVariant: "secondary",
    iconColor: "bg-neutral-900",
    icon: <GraphicSleepIcon className="h-6 w-6" />,
    description:
      "Sleep debt tracking, HRV guards, and automated burnout protection.",
  },
  {
    key: "learning",
    guild: "DEEP WORK ORDER",
    title: "LEARNING & FOCUS SANCTUARY",
    badge: "INT + FOC",
    badgeVariant: "mythic",
    iconColor: "bg-neutral-900",
    icon: <GraphicLearningIcon className="h-6 w-6" />,
    description:
      "90-min Pomodoro blocks and reading telemetry converting into cognitive power.",
  },
  {
    key: "skills",
    guild: "MASTERY CODEX",
    title: "RPG SKILL TREE & TALENTS",
    badge: "BRANCHES",
    badgeVariant: "primary",
    iconColor: "bg-neutral-900",
    icon: <GraphicSkillsIcon className="h-6 w-6" />,
    description:
      "Unlock passive stat buffs, physical resilience perks, and cognitive masteries.",
  },
  {
    key: "tower",
    guild: "APEX ATHLETICS",
    title: "TOWER OF ASCENSION COMBAT",
    badge: "GAUNTLET",
    badgeVariant: "primary",
    iconColor: "bg-neutral-900",
    icon: <GraphicTowerIcon className="h-6 w-6" />,
    description:
      "20 floors of escalating gauntlet trials conquered through real-world exertion.",
  },
  {
    key: "bosses",
    guild: "CALAMITY RAIDERS",
    title: "GUILD RAIDS & WORLD BOSSES",
    badge: "SYNDICATE",
    badgeVariant: "destructive",
    iconColor: "bg-neutral-900",
    icon: <GraphicBossesIcon className="h-6 w-6" />,
    description:
      "Band with syndicate allies to defeat weekly multi-phase calamity titans.",
  },
  {
    key: "beasts",
    guild: "INCUBATOR ORDERS",
    title: "BEASTS & PET INCUBATORS",
    badge: "DRAGONS",
    badgeVariant: "mythic",
    iconColor: "bg-neutral-900",
    icon: <GraphicBeastsIcon className="h-6 w-6" />,
    description:
      "Hatch 20 mythical beast companions powered by real-world pedometer steps.",
  },
  {
    key: "aira",
    guild: "CYBER SANCTUM",
    title: "AIRA AI DISCIPLINE CO-PILOT",
    badge: "AI CO-PILOT",
    badgeVariant: "gold",
    iconColor: "bg-neutral-900",
    icon: <GraphicAiraIcon className="h-6 w-6" />,
    description:
      "Autonomous neural co-pilot analyzing fatigue curves and quest priorities.",
  },
];

export function Feature3({
  title = "CORE DISCIPLINES & COMBAT SYSTEMS",
  description = "Eight interconnected training disciplines driving your hunter progression.",
  badge = "// ELITE DISCIPLINE GUILDS & OPERATIVES",
  items = defaultCarouselFeatures,
  onSelectFeature,
  className,
}: Feature3Props) {
  return (
    <section className={cn("w-full px-4 py-16 lg:py-24 bg-[#141414] text-[#f9f4da]", className)}>
      <div className="mx-auto max-w-7xl">
        {/* Header Block */}
        {(badge || title || description) && (
          <div className="mb-12 text-center">
            {badge && (
              <div className="inline-block mb-3">
                <Badge variant="gold" font="retro" className="text-[8px] sm:text-[9px] py-1 px-3">
                  {badge}
                </Badge>
              </div>
            )}
            {title && (
              <h2 className="retro text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[#f9f4da] mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="mx-auto max-w-2xl retro text-[9px] sm:text-[10px] text-[#a3a3a3] leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Carousel Container */}
        <div className="relative px-2 sm:px-8 md:px-12">
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {items.map((item) => {
                const handleClick = (e?: React.MouseEvent) => {
                  e?.stopPropagation();
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.key && onSelectFeature) {
                    onSelectFeature(item.key);
                  }
                };

                return (
                  <CarouselItem
                    key={item.key || item.title}
                    className="pl-3 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div
                      className="h-full py-2 cursor-pointer group"
                      onClick={handleClick}
                      role="button"
                      tabIndex={0}
                      data-discipline-key={item.key}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleClick();
                        }
                      }}
                    >
                      <Card className="relative h-full bg-[#181818] group-hover:bg-[#202020] text-[#f9f4da] border-2 border-black shadow-[4px_4px_0_0_#000] group-hover:shadow-[6px_6px_0_0_#000] group-hover:-translate-y-1 transition-all flex flex-col justify-between select-none p-5">
                        <div>
                          {/* Top row: Colored 8-bit icon box & Badge / Arrow */}
                          <div className="flex items-start justify-between gap-2 mb-4">
                            <div
                              className={cn(
                                "w-11 h-11 flex items-center justify-center border-2 border-black shadow-[2px_2px_0_0_#000]",
                                item.iconColor
                              )}
                            >
                              {item.icon}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.badge && (
                                <Badge
                                  variant={item.badgeVariant || "default"}
                                  font="retro"
                                  className="text-[7px] py-0.5 px-1.5"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                              <ArrowUpRight className="w-4 h-4 text-[#737373] group-hover:text-[#ffd700] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </div>
                          </div>

                          {/* Guild Tag */}
                          {item.guild && (
                            <span className="block retro text-[7px] tracking-widest text-[#737373] group-hover:text-amber-400 uppercase mb-2 transition-colors">
                              {"// "}{item.guild}
                            </span>
                          )}

                          {/* Title */}
                          <CardHeader className="p-0 pb-2">
                            <CardTitle className="retro text-xs md:text-sm font-bold leading-tight text-[#f9f4da] group-hover:text-amber-300 transition-colors">
                              {item.title}
                            </CardTitle>
                          </CardHeader>

                          {/* Description */}
                          <CardContent className="p-0 pt-1">
                            <CardDescription className="retro text-[8px] sm:text-[9px] text-[#a3a3a3] group-hover:text-[#d4d4d4] leading-relaxed transition-colors">
                              {item.description}
                            </CardDescription>
                          </CardContent>
                        </div>

                        {/* Footer Action */}
                        <div className="pt-4 mt-6 border-t border-neutral-800 flex items-center justify-between retro text-[7px] sm:text-[8px] tracking-wider text-[#737373] group-hover:text-amber-300 transition-colors">
                          <span>CLICK TO INSPECT CODEX</span>
                          <span className="retro text-[10px]">↗</span>
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

export default Feature3;
