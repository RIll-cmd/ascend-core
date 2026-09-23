"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import Image from "next/image";
import { CheckCircle2, Eye, ListChecks, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "@/components/ui/8bit/styles/retro.css";

export type FeatureType =
  // 19 Sidebar Subsystems
  | "dashboard"
  | "missions"
  | "habits"
  | "calendar"
  | "profile"
  | "workouts"
  | "sleep"
  | "learning"
  | "skills"
  | "tower"
  | "bosses"
  | "boss-pr"
  | "inventory"
  | "crafting"
  | "shop"
  | "beasts"
  | "aira"
  | "achievements"
  | "automations"
  // Legacy / Landing Aliases
  | "nutrition"
  | "combat"
  | "leveling"
  | "raids"
  | "recovery"
  | "arsenal"
  | null;

export const FEATURE_PREVIEWS: Record<
  string,
  {
    imageSrc: string;
    routePath: string;
    caption: string;
  }
> = {
  dashboard: {
    imageSrc: "/previews/main-dashboard.png",
    routePath: "/dashboard",
    caption: "Tactical Command HUD with 7-Stat Radar & Beast Companion",
  },
  missions: {
    imageSrc: "/previews/missions.png",
    routePath: "/missions",
    caption: "Tiered Kanban Quests & Milestone Bounty Tracker",
  },
  habits: {
    imageSrc: "/previews/habits.png",
    routePath: "/habits",
    caption: "Neural Habit Matrix with 365-Day Mathematical Grid",
  },
  calendar: {
    imageSrc: "/previews/calendar.png",
    routePath: "/calendar",
    caption: "Circadian Unified Timeline for Habits, Workouts & Deadlines",
  },
  profile: {
    imageSrc: "/previews/profile.png",
    routePath: "/profile",
    caption: "Hunter Credentials, Stat Allocation Matrix & Titles",
  },
  workouts: {
    imageSrc: "/previews/workout.png",
    routePath: "/workouts",
    caption: "16-Muscle Heatmap & 1RM Heavy Iron Gym Logger",
  },
  sleep: {
    imageSrc: "/previews/sleep.png",
    routePath: "/sleep",
    caption: "Circadian Sleep Efficiency Curve & Recovery Scaling",
  },
  learning: {
    imageSrc: "/previews/learning.png",
    routePath: "/learning",
    caption: "Pomodoro Deep Work Sanctuary & Ambient Audio Terminal",
  },
  skills: {
    imageSrc: "/previews/skills.png",
    routePath: "/skills",
    caption: "Class Specialization Skill Constellations & Passive Nodes",
  },
  tower: {
    imageSrc: "/previews/tower.png",
    routePath: "/tower",
    caption: "20-Floor Auto-Combat Simulator & AIRA Defeat Analytics",
  },
  bosses: {
    imageSrc: "/previews/bosses.png",
    routePath: "/bosses",
    caption: "World Bosses & Reality Raids Damaged by Real Habits",
  },
  "boss-pr": {
    imageSrc: "/previews/boss-pr.png",
    routePath: "/workouts/boss-pr",
    caption: "Boss PR Breakthrough Arena with Compound Lift Battles",
  },
  inventory: {
    imageSrc: "/previews/inventory.png",
    routePath: "/inventory",
    caption: "9-Slot PaperDoll Armory Matrix & Gear Inspection",
  },
  crafting: {
    imageSrc: "/previews/crafting.png",
    routePath: "/crafting",
    caption: "Blacksmith Forge: Equipment Refinement (+1 to +10) & Salvage",
  },
  shop: {
    imageSrc: "/previews/shop.png",
    routePath: "/shop",
    caption: "Armory Merchant: Daily Rotating Stock & Mystery Eggs",
  },
  beasts: {
    imageSrc: "/previews/beasts.png",
    routePath: "/beasts",
    caption: "Beast Incubation: Stride Energy Sync for 20 Mythic Dragons",
  },
  aira: {
    imageSrc: "/previews/aira-system.png",
    routePath: "/aira",
    caption: "AIRA Tactical Neural Co-Pilot & Autonomous System Admin",
  },
  achievements: {
    imageSrc: "/previews/achievements.png",
    routePath: "/achievements",
    caption: "Codex of Feats: Achievement Constellations & Trophy Rewards",
  },
  automations: {
    imageSrc: "/previews/automations.png",
    routePath: "/automations",
    caption: "Chrono Matrix: Habit Automations & Trigger Rules",
  },
  // Aliases
  nutrition: {
    imageSrc: "/previews/workout.png",
    routePath: "/workouts",
    caption: "Discipline Fuel & Recovery Telemetry",
  },
  combat: {
    imageSrc: "/previews/tower.png",
    routePath: "/tower",
    caption: "Spire Tower Combat Trials",
  },
  leveling: {
    imageSrc: "/previews/skills.png",
    routePath: "/skills",
    caption: "Hunter Rank Progression & Skills",
  },
  raids: {
    imageSrc: "/previews/bosses.png",
    routePath: "/bosses",
    caption: "World Boss Raids",
  },
  recovery: {
    imageSrc: "/previews/sleep.png",
    routePath: "/sleep",
    caption: "Circadian Recovery Protocol",
  },
  arsenal: {
    imageSrc: "/previews/inventory.png",
    routePath: "/inventory",
    caption: "RPG Arsenal & Bestiary Equipment",
  },
};

export interface FeatureModalProps {
  feature: FeatureType;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "specs" | "preview";
}

export function FeatureModal({
  feature,
  isOpen,
  onClose,
  initialTab = "specs",
}: FeatureModalProps) {
  if (!feature) return null;

  const contentMap: Record<
    string,
    {
      icon: React.ComponentType<{ className?: string; size?: number }>;
      color: string;
      badge: string;
      title: string;
      subtitle: string;
      description: string;
      points: { title: string; desc: string }[];
      ctaText: string;
    }
  > = {
    // 01. DASHBOARD
    dashboard: {
      icon: GraphicDashboardIcon,
      color: "text-emerald-400",
      badge: "TACTICAL COMMAND HUD",
      title: "Tactical Dashboard & Telemetry Matrix",
      subtitle: "Holographic command console synthesizing real-time hunter vitals",
      description:
        "Unified overview of combat rating, active bounties, recovery status, and leveling velocity.",
      points: [
        {
          title: "Real-Time Stat Aggregation",
          desc: "Live synthesis of STR, END, DIS, and INT attributes.",
        },
        {
          title: "Active Directive Radar",
          desc: "Instant status of daily quests, habit chains, and raid boss timers.",
        },
        {
          title: "Quick-Action Telemetry",
          desc: "Log sets, habits, or rest intervals with zero friction.",
        },
      ],
      ctaText: "Launch Dashboard",
    },

    // 02. MISSIONS
    missions: {
      icon: GraphicMissionsIcon,
      color: "text-amber-400",
      badge: "HUNTER DIRECTIVES",
      title: "Daily Missions & Milestone Bounties",
      subtitle: "Tiered quest directives with dynamic gold and EXP scaling",
      description:
        "Daily quests inspired by Solo Leveling. Complete daily requirements to prevent penalty dungeon cuts.",
      points: [
        {
          title: "3-Tier Daily Directives",
          desc: "Standard daily objectives scaling with current hunter rank.",
        },
        {
          title: "Emergency Penalty Trials",
          desc: "Missed quests trigger high-stakes 48-hour recovery gauntlets.",
        },
        {
          title: "Weekly Guild Bounties",
          desc: "Cooperative syndicate targets awarding rare crafting materials.",
        },
      ],
      ctaText: "Inspect Mission Codex",
    },

    // 03. HABITS
    habits: {
      icon: GraphicHabitsIcon,
      color: "text-rose-500",
      badge: "NEURAL HABIT ENGINE",
      title: "Neural Habit Matrix & Streaks",
      subtitle: "Multi-tiered habit schedules with streak freeze protection",
      description:
        "Model daily routines with RPG stakes. Build consistency with tiered XP and streak shields.",
      points: [
        {
          title: "Tiered XP Targets",
          desc: "Bronze, silver, and gold completion thresholds.",
        },
        {
          title: "Streak Freeze Shield",
          desc: "Protect consistency chains on rest or recovery days.",
        },
        {
          title: "Calendar Heatmap",
          desc: "Track 365-day habit adherence clusters.",
        },
      ],
      ctaText: "Configure Habit Deck",
    },

    // 04. CALENDAR
    calendar: {
      icon: GraphicCalendarIcon,
      color: "text-sky-400",
      badge: "CIRCADIAN CONSISTENCY",
      title: "Consistency Calendar & Heatmaps",
      subtitle: "365-day adherence clusters and fatigue forecast grids",
      description:
        "Visual proof of relentless execution. Inspect long-term discipline trends and deload windows.",
      points: [
        {
          title: "Annual Habit Heatmap",
          desc: "Color-graded density matrix highlighting unbroken momentum.",
        },
        {
          title: "Fatigue vs. Volume Overlays",
          desc: "Correlate workout volume with sleep recovery days.",
        },
        {
          title: "Event & Raid Schedules",
          desc: "Prepare for upcoming boss resets and guild dungeon sieges.",
        },
      ],
      ctaText: "Open Calendar Grid",
    },

    // 05. PROFILE
    profile: {
      icon: GraphicProfileIcon,
      color: "text-amber-400",
      badge: "HUNTER AWAKENING",
      title: "Solo Leveling & Hunter Awakening",
      subtitle: "From E-Rank initiate to S-Rank Monarch through relentless discipline",
      description:
        "Advance from E-Rank initiate to legendary Monarch through daily quest mastery and rank exams.",
      points: [
        {
          title: "Rank Promotion Trials",
          desc: "Clear milestone quests for higher dungeon ranks and aura glows.",
        },
        {
          title: "Custom Hunter Titles",
          desc: "Equip prestigious titles earned from grueling physical feats.",
        },
        {
          title: "Permanent Trait Passives",
          desc: "Unlock lasting physical and mental stat buffs.",
        },
      ],
      ctaText: "Begin Awakening",
    },

    // 06. WORKOUTS
    workouts: {
      icon: GraphicWorkoutsIcon,
      color: "text-emerald-500",
      badge: "KINETIC WORKOUT TERMINAL",
      title: "Heavy Iron Gym & Volume Tracking",
      subtitle: "Set-by-set logging with physiological 48-72h freshness tracking",
      description:
        "Log sets, reps, and RPE. Convert gym volume into dungeon boss raid damage.",
      points: [
        {
          title: "16 Muscle Recovery Zones",
          desc: "Real-time fatigue tracking across all muscle groups.",
        },
        {
          title: "Boss Raid Exertion Scaling",
          desc: "Lifting volume deals direct elemental damage to raid bosses.",
        },
        {
          title: "1RM & PR Telemetry",
          desc: "Automated progressive overload calculations.",
        },
      ],
      ctaText: "Launch Workout Terminal",
    },

    // 07. SLEEP
    sleep: {
      icon: GraphicSleepIcon,
      color: "text-indigo-400",
      badge: "CIRCADIAN VAULT",
      title: "Sleep & Circadian Recovery",
      subtitle: "HRV, sleep debt protection, and automated burnout prevention",
      description:
        "Analyze sleep debt and CNS load to prescribe strategic deload windows that protect streak multipliers.",
      points: [
        {
          title: "CNS Fatigue Protection",
          desc: "Prevents overtraining and burnout automatically.",
        },
        {
          title: "Strategic Deload Pacing",
          desc: "Schedule rest days that preserve streak multipliers.",
        },
        {
          title: "Sleep Architecture Insights",
          desc: "Deep sleep telemetry correlated with gym PRs.",
        },
      ],
      ctaText: "Inspect Recovery Vault",
    },

    // 08. LEARNING
    learning: {
      icon: GraphicLearningIcon,
      color: "text-purple-400",
      badge: "COGNITIVE SANCTUARY",
      title: "Learning & Deep Work Focus",
      subtitle: "Pomodoro timers and reading telemetry converted to INT power",
      description:
        "Log focused deep work sessions and skill study. Power cognitive attributes and unlock high-tier blueprints.",
      points: [
        {
          title: "Deep Work Telemetry",
          desc: "Track uninterrupted 90-minute blocks of high-agency focus.",
        },
        {
          title: "Knowledge Vault",
          desc: "Catalog books read, courses mastered, and skills honed.",
        },
        {
          title: "Cognitive Mana Scaling",
          desc: "Focus stamina fuels special guild abilities and tactical buffs.",
        },
      ],
      ctaText: "Enter Focus Sanctuary",
    },

    // 09. SKILLS
    skills: {
      icon: GraphicSkillsIcon,
      color: "text-teal-400",
      badge: "MASTERY CODEX",
      title: "RPG Skill Tree & Talents",
      subtitle: "Dynamic multi-branch talent trees with active and passive masteries",
      description:
        "Spend skill points unlocked by leveling to acquire irreversible physical and cognitive perks.",
      points: [
        {
          title: "Multi-Discipline Branches",
          desc: "Invest in Strength, Agility, Endurance, Focus, and Vitality paths.",
        },
        {
          title: "Passive Stat Multipliers",
          desc: "Permanent boosts to XP gains, recovery rates, and critical strikes.",
        },
        {
          title: "Mastery Specializations",
          desc: "Ascend toward specialized archetypes like Berserker, Monk, or Sage.",
        },
      ],
      ctaText: "Open Skill Tree",
    },

    // 10. TOWER
    tower: {
      icon: GraphicTowerIcon,
      color: "text-sky-400",
      badge: "HUNTER GAUNTLET",
      title: "Tower of Ascension Combat",
      subtitle: "20 floors of escalating gauntlet trials conquered through real-world exertion",
      description:
        "Live combat power rating calculated from real-world habits, lifts, and recovery.",
      points: [
        {
          title: "Floor Gatekeepers",
          desc: "Overcome brutal milestone guardians with real-world workout consistency.",
        },
        {
          title: "Combat Power Index (CPI)",
          desc: "Algorithmic synthesis of physical strength, endurance, and discipline.",
        },
        {
          title: "Global Tower Ladders",
          desc: "Compete against global hunters on fastest floor clearance leaderboards.",
        },
      ],
      ctaText: "Enter Ascension Tower",
    },

    // 11. BOSSES
    bosses: {
      icon: GraphicBossesIcon,
      color: "text-pink-500",
      badge: "CALAMITY TITANS",
      title: "World Boss Raids & Syndicates",
      subtitle: "Unite with allies to conquer massive weekly Calamity World Bosses",
      description:
        "Band with syndicate allies, pool habit momentum, and take down weekly world calamities for mythic loot.",
      points: [
        {
          title: "Weekly World Calamities",
          desc: "Multi-phase boss fights powered by squad workout habits.",
        },
        {
          title: "Guild Vault Rewards",
          desc: "Earn legendary loot, gems, and rare titles.",
        },
        {
          title: "Squad Accountability",
          desc: "Real-time teammate streak and workout feeds.",
        },
      ],
      ctaText: "Join a Syndicate",
    },

    // 12. BOSS PR
    "boss-pr": {
      icon: GraphicBossPRIcon,
      color: "text-rose-400",
      badge: "BENCHMARK ARENA",
      title: "Boss PR Benchmark Challenges",
      subtitle: "Convert 1RM barbell achievements into devastating raid boss strikes",
      description:
        "Test your limits in the benchmark arena. Log maximum lifts to trigger critical boss raid damage.",
      points: [
        {
          title: "1RM Strike Multipliers",
          desc: "Squat, bench, and deadlift PRs translate directly to raid burst damage.",
        },
        {
          title: "Milestone Hall of Records",
          desc: "Historical logging of every PR broken with video proof attachments.",
        },
        {
          title: "Guild PR Feeds",
          desc: "Celebrate teammate breakthrough lifts in real-time syndicate chat.",
        },
      ],
      ctaText: "Challenge Boss PR",
    },

    // 13. INVENTORY
    inventory: {
      icon: GraphicInventoryIcon,
      color: "text-purple-400",
      badge: "ARMORY VAULT",
      title: "Inventory & Equipment Vault",
      subtitle: "Socketable relics, weapons, and armor with real-life multipliers",
      description:
        "Equip gear with real-life stat multipliers. Socket gemstones earned from quests to accelerate XP.",
      points: [
        {
          title: "PaperDoll Armory",
          desc: "Socket weapons, helmets, armor, and rings that amplify EXP gains.",
        },
        {
          title: "Item Rarity Tiers",
          desc: "Common to Mythic rarity grades with unique visual borders.",
        },
        {
          title: "Relic Synergy Sets",
          desc: "Set bonuses granting bonus streak shields and recovery speeds.",
        },
      ],
      ctaText: "Open Gear Vault",
    },

    // 14. CRAFTING
    crafting: {
      icon: GraphicCraftingIcon,
      color: "text-amber-500",
      badge: "BLACKSMITH FORGE",
      title: "Forge & Alchemy Crafting",
      subtitle: "Synthesize materials from workout milestones into permanent gear",
      description:
        "Harvest raw ores and essence from completed missions. Forge legendary weapons and brew stamina potions.",
      points: [
        {
          title: "Blueprint Research",
          desc: "Unlock ancient recipes through consistent weekly discipline streaks.",
        },
        {
          title: "Material Synthesis",
          desc: "Refine iron ore, shadow essence, and mana crystals into gear.",
        },
        {
          title: "Alchemy Elixirs",
          desc: "Brew temporary stat boosters for intense workout and focus blocks.",
        },
      ],
      ctaText: "Visit Blacksmith Forge",
    },

    // 15. SHOP
    shop: {
      icon: GraphicShopIcon,
      color: "text-yellow-400",
      badge: "MERCHANT GUILD",
      title: "Merchant Shop & Bazaar",
      subtitle: "Spend quest gold and raid gems on booster scrolls and cosmetics",
      description:
        "The central economy hub of Ascend Core. Purchase streak freeze shields, rare potion elixirs, and rank skins.",
      points: [
        {
          title: "Streak Shields & Consumables",
          desc: "Stock up on emergency items to protect long-term habit streaks.",
        },
        {
          title: "Cosmetic Rank Glows",
          desc: "Equip aesthetic aura effects and personalized hunter frames.",
        },
        {
          title: "Daily Rotating Deals",
          desc: "Special discounts on rare crafting blueprints and beast incubator speedups.",
        },
      ],
      ctaText: "Browse Merchant Shop",
    },

    // 16. BEASTS
    beasts: {
      icon: GraphicBeastsIcon,
      color: "text-cyan-400",
      badge: "MYTHIC BESTIARY",
      title: "Beasts & Pet Incubators",
      subtitle: "Pedometer stride energy sync and companion stat multipliers",
      description:
        "Turn walking strides into egg incubation energy. Hatch 20 mythical companions that grant active buffs.",
      points: [
        {
          title: "20 Mythic Companions",
          desc: "Hatch dragons, wolves, and phoenixes via daily step milestones.",
        },
        {
          title: "Pedometer Step Sync",
          desc: "Every 1,000 steps adds incubation warmth toward hatching eggs.",
        },
        {
          title: "Companion Stat Buffs",
          desc: "Equipped companions boost EXP yield and reduce fatigue decay.",
        },
      ],
      ctaText: "Explore Beast Bestiary",
    },

    // 17. AIRA
    aira: {
      icon: GraphicAiraIcon,
      color: "text-orange-500",
      badge: "NEURAL CO-PILOT",
      title: "AIRA AI Autonomous Co-Pilot",
      subtitle: "Autonomous AI companion analyzing habits, fatigue, and recovery",
      description:
        "Autonomous AI companion with direct access to habits, workouts, and sleep telemetry.",
      points: [
        {
          title: "Tactical Morning Briefing",
          desc: "Custom quest priorities delivered every morning based on fatigue.",
        },
        {
          title: "Circadian Fatigue Modeling",
          desc: "Calculates sleep debt and optimal workout windows.",
        },
        {
          title: "High-Agency Directives",
          desc: "Sharp, motivating directives inspired by Solo Leveling.",
        },
      ],
      ctaText: "Initiate Neural Link",
    },

    // 18. ACHIEVEMENTS
    achievements: {
      icon: GraphicAchievementsIcon,
      color: "text-amber-300",
      badge: "HALL OF FAME",
      title: "Achievements & Hunter Medals",
      subtitle: "Permanent trophies commemorating monumental life transformations",
      description:
        "Earn gold and silver medals across 15 distinct categories. Showcase discipline milestones on your hunter card.",
      points: [
        {
          title: "15 Commemorative Badges",
          desc: "Tiered achievements honoring lifting volume, habit streaks, and tower floors.",
        },
        {
          title: "Permanent Glory Points",
          desc: "Climb guild leaderboards based on cumulative achievement milestones.",
        },
        {
          title: "Unlockable Guild Banners",
          desc: "Display rare heraldic crests on your public profile.",
        },
      ],
      ctaText: "View Hunter Medals",
    },

    // 19. AUTOMATIONS
    automations: {
      icon: GraphicAutomationsIcon,
      color: "text-blue-400",
      badge: "AUTO PROTOCOLS",
      title: "System Automations & Webhooks",
      subtitle: "Intelligent background rules connecting external devices and habit logic",
      description:
        "Set up hands-free automation rules. Automatically deploy streak shields when travel is detected or sync health data.",
      points: [
        {
          title: "Smart Trigger Protocols",
          desc: "Trigger actions based on Apple Health, Whoop, or Oura biometrics.",
        },
        {
          title: "Auto-Shield Deployment",
          desc: "Automatically shield streaks on days with elevated HRV stress.",
        },
        {
          title: "Webhook Integrations",
          desc: "Send quest completions to Discord channels or personal webhooks.",
        },
      ],
      ctaText: "Configure Automations",
    },

    // Aliases
    nutrition: {
      icon: GraphicInventoryIcon,
      color: "text-purple-500",
      badge: "MACRONUTRIENT SYNTHESIS",
      title: "Macro Nutrition & Bio-Fuel",
      subtitle: "Dynamic caloric surplus/deficit scaling and nutrient logging",
      description:
        "Track macros and bio-fuel targets tailored to hypertrophy or fat-loss goals.",
      points: [
        {
          title: "Dynamic Target Pacing",
          desc: "Custom protein, caloric, and hydration algorithms.",
        },
        {
          title: "Recovery Multipliers",
          desc: "Caloric targets accelerate muscle repair speed.",
        },
        {
          title: "Quick Barcode Logging",
          desc: "Zero-friction meal presets and nutrition entry.",
        },
      ],
      ctaText: "Fuel Nutrition Deck",
    },
    combat: {
      icon: GraphicTowerIcon,
      color: "text-sky-400",
      badge: "HUNTER COMBAT ENGINE",
      title: "Tower of Ascension Combat",
      subtitle: "Dynamic overall power score driven by real-world discipline",
      description:
        "Live combat power rating calculated from real-world habits, lifts, and recovery.",
      points: [
        {
          title: "Combat Power Index (CPI)",
          desc: "Algorithmic synthesis of strength and discipline.",
        },
        {
          title: "7 Core Stat Attributes",
          desc: "Track STR, END, DIS, KNO, REC, FOC, and CNS.",
        },
        {
          title: "Global Hunter Ladders",
          desc: "Compete across regional and syndicate leaderboards.",
        },
      ],
      ctaText: "Check Combat Rating",
    },
    leveling: {
      icon: GraphicProfileIcon,
      color: "text-amber-400",
      badge: "MONARCH AWAKENING",
      title: "Solo Leveling & Hunter Awakening",
      subtitle: "From E-Rank initiate to S-Rank Monarch through relentless discipline",
      description:
        "Climb from E-Rank initiate to legendary Monarch through daily quest mastery.",
      points: [
        {
          title: "Rank Promotion Trials",
          desc: "Clear milestone quests for higher dungeon ranks.",
        },
        {
          title: "Monarch Aura Visuals",
          desc: "Equip aesthetic rank glows and profile borders.",
        },
        {
          title: "Permanent Trait Passives",
          desc: "Unlock lasting physical and mental stat buffs.",
        },
      ],
      ctaText: "Begin Awakening",
    },
    raids: {
      icon: GraphicBossesIcon,
      color: "text-pink-500",
      badge: "CO-OP SYNDICATE ENGINE",
      title: "Guild Raids & Dungeon Bosses",
      subtitle: "Unite with allies to conquer massive weekly Calamity World Bosses",
      description:
        "Band with syndicate allies, pool habit momentum, and take down weekly world bosses.",
      points: [
        {
          title: "Weekly World Calamities",
          desc: "Multi-phase boss fights powered by squad habits.",
        },
        {
          title: "Guild Vault Rewards",
          desc: "Earn legendary loot, gems, and rare titles.",
        },
        {
          title: "Squad Accountability",
          desc: "Real-time teammate streak and workout feeds.",
        },
      ],
      ctaText: "Join a Syndicate",
    },
    recovery: {
      icon: GraphicSleepIcon,
      color: "text-emerald-400",
      badge: "BIOMETRIC VAULT",
      title: "Discipline Vault & Recovery Guards",
      subtitle: "HRV, sleep debt protection, and automated burnout prevention",
      description:
        "Analyze sleep debt and CNS load to prescribe strategic deload windows.",
      points: [
        {
          title: "CNS Fatigue Protection",
          desc: "Prevents overtraining and burnout automatically.",
        },
        {
          title: "Strategic Deload Pacing",
          desc: "Schedule rest days that preserve streak multipliers.",
        },
        {
          title: "Sleep Architecture Insights",
          desc: "Deep sleep telemetry correlated with gym PRs.",
        },
      ],
      ctaText: "Inspect Recovery Vault",
    },
    arsenal: {
      icon: GraphicBeastsIcon,
      color: "text-purple-400",
      badge: "BESTIARY & RPG ARSENAL",
      title: "Companion Hatching & Equipment",
      subtitle: "Pedometer stride energy sync and socketable stat multipliers",
      description:
        "Turn walking strides into egg incubation energy. Equip gear with real-life stat multipliers.",
      points: [
        {
          title: "20 Mythic Companions",
          desc: "Hatch dragons and beasts via step milestones.",
        },
        {
          title: "Tri-Currency Economy",
          desc: "Earn Gold, Gems, and Tokens from daily triumphs.",
        },
        {
          title: "PaperDoll Armory",
          desc: "Socket weapons and armor that amplify EXP gains.",
        },
      ],
      ctaText: "Explore Bestiary & Shop",
    },
  };

  const data = contentMap[feature] || contentMap.habits;
  const Icon = data.icon;
  const previewInfo = FEATURE_PREVIEWS[feature] || {
    imageSrc: "/previews/main-dashboard.png",
    routePath: "/dashboard",
    caption: `${data.title} Interface Preview`,
  };

  const [activeTab, setActiveTab] = React.useState<"specs" | "preview">(
    initialTab || "specs"
  );

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, feature]);

  const handleCtaClick = () => {
    onClose();
    const el = document.getElementById("auth-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "eightbitcn-landing-scope w-full bg-zinc-950/95 border border-zinc-800 text-zinc-100 p-5 sm:p-7 rounded-3xl shadow-2xl backdrop-blur-2xl transition-all duration-300 max-h-[88vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-700",
          "[&>button:last-child]:top-3.5 [&>button:last-child]:right-3.5 sm:[&>button:last-child]:top-4 sm:[&>button:last-child]:right-4 [&>button:last-child]:size-7 sm:[&>button:last-child]:size-8 [&>button:last-child]:rounded-lg [&>button:last-child]:bg-zinc-900/90 [&>button:last-child]:border [&>button:last-child]:border-zinc-700 [&>button:last-child]:flex [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child]:hover:bg-zinc-800 [&>button:last-child]:hover:border-[#fcba28] [&>button:last-child]:text-zinc-400 [&>button:last-child]:hover:text-white [&>button:last-child]:transition-colors [&>button:last-child]:z-30 [&>button:last-child]:shadow-[2px_2px_0_0_#000]",
          activeTab === "preview" ? "max-w-3xl sm:max-w-4xl" : "max-w-xl sm:max-w-2xl"
        )}
      >
        <DialogHeader className="flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between gap-3 pr-10 sm:pr-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1">
                <Icon className="w-5 h-5" />
              </div>
              <span className="retro text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                {data.badge}
              </span>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1 border border-zinc-800 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={cn(
                  "retro px-2.5 py-1 text-[7px] sm:text-[8px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 rounded",
                  activeTab === "specs"
                    ? "bg-[#fcba28] text-black shadow-[1px_1px_0_0_#000]"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <ListChecks className="w-3 h-3" />
                <span>SPECS</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "retro px-2.5 py-1 text-[7px] sm:text-[8px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 rounded",
                  activeTab === "preview"
                    ? "bg-[#fcba28] text-black shadow-[1px_1px_0_0_#000]"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Eye className="w-3 h-3" />
                <span>PREVIEW</span>
              </button>
            </div>
          </div>

          <DialogTitle className="retro text-base sm:text-lg font-bold tracking-tight text-white mt-1">
            {data.title}
          </DialogTitle>

          <DialogDescription className="retro text-[8px] sm:text-[9px] text-zinc-400 leading-relaxed font-normal">
            {data.description}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Content */}
        {activeTab === "preview" ? (
          <div className="flex flex-col gap-3 py-2 border-y border-zinc-850">
            <div className="rounded-xl overflow-hidden border-2 border-black bg-black shadow-[4px_4px_0_0_#000]">
              {/* Route HUD Monitor Header */}
              <div className="flex items-center justify-between bg-zinc-900 px-3 py-2 border-b border-zinc-800 text-[8px] sm:text-[9px] font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-zinc-200 font-bold">{previewInfo.routePath}</span>
                  <span className="hidden sm:inline text-zinc-500">// 4K TELEMETRY CAPTURE</span>
                </div>
                <a
                  href={previewInfo.imageSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
                  title="Open full-resolution 4K screenshot in new tab"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">FULLSCREEN</span>
                </a>
              </div>

              {/* 4K UI Screenshot View */}
              <div className="relative aspect-video w-full max-h-[46vh] sm:max-h-[50vh] overflow-hidden bg-black/80 group/preview">
                <Image
                  src={previewInfo.imageSrc}
                  alt={`${data.title} interface preview`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-contain object-top transition-transform duration-300 group-hover/preview:scale-[1.01]"
                  priority
                />
              </div>
            </div>

            <p className="retro text-[8px] sm:text-[9px] text-zinc-400 text-center leading-relaxed italic">
              {previewInfo.caption}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-3 border-y border-zinc-850">
            {data.points.map((pt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="retro text-[9px] sm:text-[10px] font-bold text-zinc-200">
                    {pt.title}
                  </span>
                  <span className="retro text-[8px] text-zinc-400 leading-relaxed">
                    {pt.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Action CTA */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onClose}
            className="retro text-[8px] sm:text-[9px] text-zinc-400 hover:text-zinc-200 cursor-pointer font-medium py-2 px-3 rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            Dismiss (✕)
          </button>

          <Button
            type="button"
            onClick={handleCtaClick}
            className="retro min-h-[44px] px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold text-[9px] sm:text-[10px] shadow-md shadow-cyan-950/40 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            {data.ctaText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

