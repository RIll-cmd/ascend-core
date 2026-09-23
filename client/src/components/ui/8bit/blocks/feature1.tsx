"use client";

import React, { useState, type ReactNode } from "react";
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
  GraphicDashboardIcon,
  GraphicMissionsIcon,
  GraphicHabitsIcon,
  GraphicCalendarIcon,
  GraphicProfileIcon,
  GraphicWorkoutsIcon,
  GraphicSleepIcon,
  GraphicLearningIcon,
  GraphicSkillsIcon,
  GraphicTowerIcon,
  GraphicBossesIcon,
  GraphicBossPRIcon,
  GraphicInventoryIcon,
  GraphicCraftingIcon,
  GraphicShopIcon,
  GraphicBeastsIcon,
  GraphicAiraIcon,
  GraphicAchievementsIcon,
  GraphicAutomationsIcon,
} from "@/components/ui/icons/SidebarGraphicIcons";
import { ArrowUpRight, Eye } from "lucide-react";

import "@/components/ui/8bit/styles/retro.css";

export type FeatureCategory =
  | "all"
  | "operations"
  | "disciplines"
  | "conquest"
  | "armory"
  | "system";

export interface FeatureItem {
  key?: string;
  index: string;
  category: "operations" | "disciplines" | "conquest" | "armory" | "system";
  badge?: string;
  badgeVariant?: "default" | "primary" | "secondary" | "destructive" | "success" | "gold" | "outline" | "mythic";
  guild?: string;
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
}

export interface Feature1Props {
  className?: string;
  columns?: 2 | 3 | 4;
  badge?: string;
  title?: string;
  description?: string;
  items?: FeatureItem[];
  onSelectFeature?: (key: string) => void;
  onPreviewFeature?: (key: string) => void;
}

export const defaultAscendFeatures: FeatureItem[] = [
  // 1. OPERATIONS
  {
    key: "dashboard",
    index: "01",
    category: "operations",
    guild: "COMMAND HUD",
    title: "TACTICAL DASHBOARD",
    badge: "HUD MATRIX",
    badgeVariant: "success",
    icon: <GraphicDashboardIcon className="h-6 w-6" />,
    description: "Holographic command console synthesizing live hunter vitals, stats, and active quests.",
  },
  {
    key: "missions",
    index: "02",
    category: "operations",
    guild: "DAILY BOUNTIES",
    title: "MISSIONS & DIRECTIVES",
    badge: "DAILY QUESTS",
    badgeVariant: "gold",
    icon: <GraphicMissionsIcon className="h-6 w-6" />,
    description: "Tiered daily quests, milestone bounties, and emergency penalty trials.",
  },
  {
    key: "habits",
    index: "03",
    category: "operations",
    guild: "CHRONO HABITATS",
    title: "NEURAL HABIT MATRIX",
    badge: "MOMENTUM",
    badgeVariant: "destructive",
    icon: <GraphicHabitsIcon className="h-6 w-6" />,
    description: "Decay curves, Bronze-to-Gold tiers, and Streak Freeze Shields.",
  },
  {
    key: "calendar",
    index: "04",
    category: "operations",
    guild: "CIRCADIAN GRID",
    title: "CONSISTENCY CALENDAR",
    badge: "HEATMAP",
    badgeVariant: "primary",
    icon: <GraphicCalendarIcon className="h-6 w-6" />,
    description: "365-day adherence clusters, fatigue forecasts, and monthly momentum reviews.",
  },

  // 2. DISCIPLINES
  {
    key: "profile",
    index: "05",
    category: "disciplines",
    guild: "SHADOW MONARCHS",
    title: "HUNTER PROFILE & AWAKENING",
    badge: "S-RANK",
    badgeVariant: "gold",
    icon: <GraphicProfileIcon className="h-6 w-6" />,
    description: "Advance from E-Rank initiate to S-Rank Monarch with custom titles and stat bonuses.",
  },
  {
    key: "workouts",
    index: "06",
    category: "disciplines",
    guild: "IRON FORGE",
    title: "HEAVY IRON GYM & VOLUME",
    badge: "STR + PWR",
    badgeVariant: "success",
    icon: <GraphicWorkoutsIcon className="h-6 w-6" />,
    description: "Heavy iron sets, 1RM telemetry, and 16-muscle fatigue decay tracking.",
  },
  {
    key: "sleep",
    index: "07",
    category: "disciplines",
    guild: "SPARTAN SYNDICATE",
    title: "SLEEP & CIRCADIAN REST",
    badge: "HRV SHIELD",
    badgeVariant: "secondary",
    icon: <GraphicSleepIcon className="h-6 w-6" />,
    description: "CNS fatigue protection, sleep debt tracking, and strategic deload windows.",
  },
  {
    key: "learning",
    index: "08",
    category: "disciplines",
    guild: "DEEP WORK ORDER",
    title: "LEARNING & FOCUS SANCTUARY",
    badge: "INT + FOC",
    badgeVariant: "mythic",
    icon: <GraphicLearningIcon className="h-6 w-6" />,
    description: "Pomodoro deep work blocks and reading telemetry converting into cognitive power.",
  },
  {
    key: "skills",
    index: "09",
    category: "disciplines",
    guild: "MASTERY CODEX",
    title: "SKILL TREE & TALENTS",
    badge: "BRANCHES",
    badgeVariant: "primary",
    icon: <GraphicSkillsIcon className="h-6 w-6" />,
    description: "Unlock passive stat buffs, physical resilience perks, and cognitive masteries.",
  },

  // 3. CONQUEST
  {
    key: "tower",
    index: "10",
    category: "conquest",
    guild: "APEX ATHLETICS",
    title: "TOWER OF ASCENSION",
    badge: "GAUNTLET",
    badgeVariant: "primary",
    icon: <GraphicTowerIcon className="h-6 w-6" />,
    description: "20 floors of escalating gauntlet trials conquered through real-world exertion.",
  },
  {
    key: "bosses",
    index: "11",
    category: "conquest",
    guild: "CALAMITY RAIDERS",
    title: "WORLD BOSS RAIDS",
    badge: "RAID BOSS",
    badgeVariant: "destructive",
    icon: <GraphicBossesIcon className="h-6 w-6" />,
    description: "Band with syndicate allies to defeat weekly multi-phase calamity titans.",
  },
  {
    key: "boss-pr",
    index: "12",
    category: "conquest",
    guild: "BENCHMARK ARENA",
    title: "BOSS PR BENCHMARKS",
    badge: "1RM CLASH",
    badgeVariant: "gold",
    icon: <GraphicBossPRIcon className="h-6 w-6" />,
    description: "Transform personal lifting PRs into devastating critical hits against dungeon gatekeepers.",
  },

  // 4. ARMORY
  {
    key: "inventory",
    index: "13",
    category: "armory",
    guild: "GEAR VAULT",
    title: "INVENTORY & EQUIPMENT",
    badge: "GEAR SLOTS",
    badgeVariant: "outline",
    icon: <GraphicInventoryIcon className="h-6 w-6" />,
    description: "Manage 400+ socketable relics, armor sets, and stat-boosting mythic artifacts.",
  },
  {
    key: "crafting",
    index: "14",
    category: "armory",
    guild: "BLACKSMITH FORGE",
    title: "FORGE & ALCHEMY CRAFTING",
    badge: "ALCHEMY",
    badgeVariant: "gold",
    icon: <GraphicCraftingIcon className="h-6 w-6" />,
    description: "Synthesize materials from workout milestones into permanent armor upgrades.",
  },
  {
    key: "shop",
    index: "15",
    category: "armory",
    guild: "MERCHANT GUILD",
    title: "MERCHANT SHOP & BAZAAR",
    badge: "ECONOMY",
    badgeVariant: "secondary",
    icon: <GraphicShopIcon className="h-6 w-6" />,
    description: "Spend quest gold and raid gems on streak shields, booster scrolls, and cosmetics.",
  },
  {
    key: "beasts",
    index: "16",
    category: "armory",
    guild: "INCUBATOR ORDERS",
    title: "BEASTS & PET INCUBATORS",
    badge: "DRAGONS",
    badgeVariant: "mythic",
    icon: <GraphicBeastsIcon className="h-6 w-6" />,
    description: "Hatch 20 mythical beast companions powered by real-world pedometer steps.",
  },

  // 5. SYSTEM CORE
  {
    key: "aira",
    index: "17",
    category: "system",
    guild: "CYBER SANCTUM",
    title: "AIRA AI CO-PILOT",
    badge: "NEURAL AI",
    badgeVariant: "gold",
    icon: <GraphicAiraIcon className="h-6 w-6" />,
    description: "Autonomous AI advisor analyzing fatigue curves, sleep debt, and rest day pacing.",
  },
  {
    key: "achievements",
    index: "18",
    category: "system",
    guild: "HALL OF FAME",
    title: "ACHIEVEMENTS & MEDALS",
    badge: "15 MEDALS",
    badgeVariant: "success",
    icon: <GraphicAchievementsIcon className="h-6 w-6" />,
    description: "Unlock gold and silver badges commemorating life-changing consistency milestones.",
  },
  {
    key: "automations",
    index: "19",
    category: "system",
    guild: "AUTO PROTOCOLS",
    title: "SYSTEM AUTOMATIONS",
    badge: "PROTOCOLS",
    badgeVariant: "primary",
    icon: <GraphicAutomationsIcon className="h-6 w-6" />,
    description: "Configure trigger-action automation routines for smart devices and habit recovery.",
  },
];

const CATEGORY_TABS: { id: FeatureCategory; label: string; count: number }[] = [
  { id: "all", label: "ALL SUBSYSTEMS", count: 19 },
  { id: "operations", label: "OPERATIONS", count: 4 },
  { id: "disciplines", label: "DISCIPLINES", count: 5 },
  { id: "conquest", label: "CONQUEST", count: 3 },
  { id: "armory", label: "ARMORY", count: 4 },
  { id: "system", label: "SYSTEM CORE", count: 3 },
];

export function Feature1({
  title = "THE REALITY-TO-RPG CONVERSION ENGINE",
  description = "Log sets, habits, deep work, or sleep. The engine calculates combat power instantly across all 19 sidebar subsystems.",
  badge = "// COMPLETE HUNTER OS // 19 SUBSYSTEMS",
  items = defaultAscendFeatures,
  columns = 4,
  onSelectFeature,
  onPreviewFeature,
  className,
}: Feature1Props) {
  const [activeTab, setActiveTab] = useState<FeatureCategory>("all");

  const filteredItems = activeTab === "all"
    ? items
    : items.filter((item) => item.category === activeTab);

  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <section className={cn("w-full px-4 py-16 lg:py-24", className)}>
      <div className="mx-auto max-w-7xl">
        {(title || description || badge) && (
          <div className="mb-10 text-center">
            {badge && (
              <div className="retro mb-3 inline-flex items-center gap-1.5 border-2 border-black bg-[#fcba28] px-3.5 py-1 text-[8px] sm:text-[9px] font-black uppercase text-black shadow-[2px_2px_0_0_#000]">
                {badge}
              </div>
            )}
            {title && (
              <h2 className="retro mb-3 font-bold text-xl tracking-tight text-white md:text-2xl lg:text-3xl uppercase">
                {title}
              </h2>
            )}
            {description && (
              <p className="retro mx-auto max-w-2xl text-[8px] sm:text-[9px] md:text-[10px] text-neutral-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {/* 8-Bit Category Filter Tabs */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "retro cursor-pointer border-2 border-black px-3 sm:px-4 py-1.5 text-[8px] sm:text-[9px] font-bold uppercase transition-all duration-150 shadow-[2px_2px_0_0_#000]",
                  isActive
                    ? "bg-[#fcba28] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5"
                    : "bg-[#141414] text-neutral-300 hover:bg-neutral-800 hover:text-white"
                )}
              >
                {tab.label} [{tab.count}]
              </button>
            );
          })}
        </div>

        <div className={cn("grid gap-5 sm:gap-6", gridCols[columns])}>
          {filteredItems.map((item) => {
            const handleCardClick = () => {
              if (item.onClick) {
                item.onClick();
              } else if (item.key && onSelectFeature) {
                onSelectFeature(item.key);
              }
            };

            return (
              <div
                key={item.key || item.title}
                onClick={handleCardClick}
                className="group/card relative cursor-pointer select-none transition-transform duration-200 hover:-translate-y-1"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick();
                  }
                }}
              >
                {/* 8-bit Stepped Pixel Sidebars on Card Wrapper */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-1.5 inset-y-2 w-1.5 bg-[#141414] border-y-2 border-l-2 border-black group-hover/card:border-[#fcba28] transition-colors"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1.5 inset-y-2 w-1.5 bg-[#141414] border-y-2 border-r-2 border-black group-hover/card:border-[#fcba28] transition-colors"
                />

                <Card
                  font="retro"
                  className="relative h-full flex flex-col justify-between border-2 border-black bg-[#141414] p-5 shadow-[4px_4px_0_0_#000] group-hover/card:border-[#fcba28] group-hover/card:shadow-[6px_6px_0_0_#000] transition-all"
                >
                  {/* Top Row: Icon Box & Stepped Sidebar Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex size-11 items-center justify-center border-2 border-black bg-neutral-900 shadow-[2px_2px_0_0_#000] group-hover/card:bg-neutral-800 transition-colors">
                        {item.icon}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="retro text-[7px] text-neutral-500 font-bold">
                          #{item.index}
                        </span>
                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant || "gold"}
                            font="retro"
                            className="text-[7px] py-0.5 px-1.5"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Guild / Subsystem Tag */}
                    {item.guild && (
                      <span className="retro text-[7px] font-bold text-[#fcba28] tracking-widest uppercase mb-1.5 block">
                        {"// "}{item.guild}
                      </span>
                    )}

                    {/* Title */}
                    <CardHeader className="p-0 pb-2">
                      <CardTitle
                        font="retro"
                        className="text-[11px] sm:text-xs font-black text-white tracking-wide leading-snug group-hover/card:text-[#fcba28] transition-colors"
                      >
                        {item.title}
                      </CardTitle>
                    </CardHeader>

                    {/* Description */}
                    <CardContent className="p-0 pt-1">
                      <CardDescription
                        font="retro"
                        className="retro text-[8px] sm:text-[9px] text-neutral-300 leading-relaxed font-normal"
                      >
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </div>

                  {/* Footer Action Strip */}
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onPreviewFeature) {
                          onPreviewFeature(item.key || "");
                        } else {
                          onSelectFeature?.(item.key || "");
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/80 hover:bg-[#fcba28] text-neutral-300 hover:text-black border border-neutral-700 hover:border-black retro text-[7px] font-bold tracking-wider rounded-sm transition-all shadow-[1px_1px_0_0_#000] cursor-pointer"
                      title={`Preview ${item.title} HUD Screenshot`}
                    >
                      <Eye className="h-2.5 w-2.5" />
                      <span>PREVIEW</span>
                    </button>

                    <div className="flex items-center gap-1 retro text-[7px] sm:text-[8px] tracking-wider text-neutral-400 group-hover/card:text-[#fcba28] transition-colors">
                      <span>INSPECT CODEX</span>
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Feature1;
