"use client";

import React from "react";
import {
  PixelWaterDropIcon,
  PixelRunningBootIcon,
  PixelBookIcon,
  PixelLotusIcon,
  PixelDumbbellIcon,
  PixelAppleIcon,
  PixelCodeBracketsIcon,
  PixelMoonSleepIcon,
  PixelCoinPouchIcon,
  PixelPotionIcon,
  PixelCrossedSwordsIcon,
  PixelQuillIcon,
  PixelSunriseIcon,
  PixelCampfireIcon,
  PixelStarIcon,
  PixelScrollIcon,
  PixelShieldIcon,
  PixelCrownIcon,
  PixelAnvilIcon,
} from "@/components/ui/pixel/PixelIcons";

export interface HabitIconRendererProps {
  habit?: {
    icon?: string | null;
    name?: string;
    category?: string;
  };
  icon?: string | null;
  name?: string;
  category?: string;
  className?: string;
}

export const HabitIconRenderer: React.FC<HabitIconRendererProps> = ({
  habit,
  icon: iconProp,
  name: nameProp,
  category: categoryProp,
  className = "w-5 h-5 text-[#ffd166]",
}) => {
  const rawIcon = (iconProp || habit?.icon || "").trim();
  const name = (nameProp || habit?.name || "").toLowerCase();
  const category = (categoryProp || habit?.category || "").toLowerCase();

  // 1. Direct Emoji or Legacy Icon Character Matching
  if (rawIcon) {
    if (/💧|🚰|🥤|water/i.test(rawIcon)) {
      return <PixelWaterDropIcon className={className} />;
    }
    if (/🏃|🚶|👟|boot|speed/i.test(rawIcon)) {
      return <PixelRunningBootIcon className={className} />;
    }
    if (/📚|📖|📕|📗|📘|📙|book/i.test(rawIcon)) {
      return <PixelBookIcon className={className} />;
    }
    if (/🧘|🧠|lotus|zen/i.test(rawIcon)) {
      return <PixelLotusIcon className={className} />;
    }
    if (/🏋️|💪|🤸|dumbbell/i.test(rawIcon)) {
      return <PixelDumbbellIcon className={className} />;
    }
    if (/🍎|🥗|🥑|🥦|🍲|🥕|apple|food/i.test(rawIcon)) {
      return <PixelAppleIcon className={className} />;
    }
    if (/💻|⌨️|🖥️|code/i.test(rawIcon)) {
      return <PixelCodeBracketsIcon className={className} />;
    }
    if (/💤|😴|🛏️|🌙|moon|sleep/i.test(rawIcon)) {
      return <PixelMoonSleepIcon className={className} />;
    }
    if (/💰|🪙|💵|💳|coin|gold/i.test(rawIcon)) {
      return <PixelCoinPouchIcon className={className} />;
    }
    if (/⚔️|🗡️|sword/i.test(rawIcon)) {
      return <PixelCrossedSwordsIcon className={className} />;
    }
    if (/🧪|🍵|💊|potion/i.test(rawIcon)) {
      return <PixelPotionIcon className={className} />;
    }
    if (/✍️|📝|🖋️|✒️|quill|pen/i.test(rawIcon)) {
      return <PixelQuillIcon className={className} />;
    }
    if (/🔥|flame|fire/i.test(rawIcon)) {
      return <PixelCampfireIcon className={className} />;
    }
    if (/🛡️|shield/i.test(rawIcon)) {
      return <PixelShieldIcon className={className} />;
    }
    if (/👑|crown/i.test(rawIcon)) {
      return <PixelCrownIcon className={className} />;
    }
    if (/⭐|🌟|star/i.test(rawIcon)) {
      return <PixelStarIcon className={className} />;
    }
  }

  // 2. Keyword Matching in Habit Name
  if (
    name.includes("water") ||
    name.includes("drink") ||
    name.includes("hydrat") ||
    name.includes("tea")
  ) {
    return <PixelWaterDropIcon className={className} />;
  }

  if (
    name.includes("read") ||
    name.includes("book") ||
    name.includes("page") ||
    name.includes("chapter") ||
    name.includes("lore")
  ) {
    return <PixelBookIcon className={className} />;
  }

  if (
    name.includes("run") ||
    name.includes("walk") ||
    name.includes("step") ||
    name.includes("jog") ||
    name.includes("cardio")
  ) {
    return <PixelRunningBootIcon className={className} />;
  }

  if (
    name.includes("workout") ||
    name.includes("gym") ||
    name.includes("lift") ||
    name.includes("exercise") ||
    name.includes("pushup") ||
    name.includes("pullup") ||
    name.includes("squat")
  ) {
    return <PixelDumbbellIcon className={className} />;
  }

  if (
    name.includes("meditat") ||
    name.includes("mindful") ||
    name.includes("breath") ||
    name.includes("reflect") ||
    name.includes("gratitude")
  ) {
    return <PixelLotusIcon className={className} />;
  }

  if (
    name.includes("code") ||
    name.includes("program") ||
    name.includes("dev") ||
    name.includes("debug") ||
    name.includes("software") ||
    name.includes("learn python") ||
    name.includes("learn rust")
  ) {
    return <PixelCodeBracketsIcon className={className} />;
  }

  if (
    name.includes("sleep") ||
    name.includes("bedtime") ||
    name.includes("wake") ||
    name.includes("rest") ||
    name.includes("nap")
  ) {
    return <PixelMoonSleepIcon className={className} />;
  }

  if (
    name.includes("eat") ||
    name.includes("diet") ||
    name.includes("meal") ||
    name.includes("fasting") ||
    name.includes("nutrition") ||
    name.includes("cook") ||
    name.includes("fruit")
  ) {
    return <PixelAppleIcon className={className} />;
  }

  if (
    name.includes("save") ||
    name.includes("budget") ||
    name.includes("money") ||
    name.includes("invest") ||
    name.includes("spend") ||
    name.includes("finance")
  ) {
    return <PixelCoinPouchIcon className={className} />;
  }

  if (
    name.includes("write") ||
    name.includes("journal") ||
    name.includes("plan") ||
    name.includes("blog") ||
    name.includes("essay")
  ) {
    return <PixelQuillIcon className={className} />;
  }

  if (
    name.includes("forge") ||
    name.includes("iron") ||
    name.includes("will") ||
    name.includes("discipline")
  ) {
    return <PixelAnvilIcon className={className} />;
  }

  // 3. Category Fallback Matching
  if (category.includes("health")) {
    return <PixelPotionIcon className={className} />;
  }
  if (category.includes("fitness")) {
    return <PixelCrossedSwordsIcon className={className} />;
  }
  if (category.includes("productivity")) {
    return <PixelQuillIcon className={className} />;
  }
  if (category.includes("learning") || category.includes("education")) {
    return <PixelBookIcon className={className} />;
  }
  if (category.includes("mindset") || category.includes("spirit")) {
    return <PixelLotusIcon className={className} />;
  }
  if (category.includes("finance") || category.includes("wealth")) {
    return <PixelCoinPouchIcon className={className} />;
  }
  if (category.includes("daily") || category.includes("routine")) {
    return <PixelSunriseIcon className={className} />;
  }
  if (category.includes("sleep")) {
    return <PixelMoonSleepIcon className={className} />;
  }

  // 4. Default Authentic Cozy RPG Quest Scroll
  return <PixelScrollIcon className={className} />;
};
