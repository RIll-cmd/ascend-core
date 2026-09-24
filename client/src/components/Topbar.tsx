"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Settings,
  LogOut,
  User,
  Gem,
  CircleDollarSign,
  Hexagon,
  Sparkles,
  Shield,
  Palette,
  AlertTriangle,
  Moon,
  Brain,
  Zap,
} from "lucide-react";
import { PixelMenuIcon } from "@/components/ui/pixel/PixelIcons";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { SystemTooltip } from "@/components/ui/SystemTooltip";
import { CURRENCY_LORE } from "@/features/lore/loreData";
import { AiraAvatar, AiraMood } from "@/components/ui/AiraAvatar";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useAiraStore } from "@/features/aira/store";
import { useThemeStore } from "@/store/useThemeStore";
import { useSleepStore } from "@/features/sleep/store/useSleepStore";
import { useLearningStore } from "@/features/learning/store/useLearningStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculateLevelData } from "@/features/progression/utils";
import { Button } from "@/components/ui/button";
import { CHARACTER_AVATAR_SPRITE } from "@/utils/sprites";
import { AccountSettingsModal } from "@/components/AccountSettingsModal";
import { playUIMenuSFX } from "@/utils/audio";
import { NotificationDrawer } from "@/components/NotificationDrawer";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { fetcher } from "@/lib/api";
import { PixelProgress } from "@/components/ui/pixel/PixelProgress";
import XpBar from "@/components/ui/8bit/xp-bar";

export function Topbar() {
  const router = useRouter();
  const { character } = useCharacterStore();
  const { theme, setTheme } = useThemeStore();
  const {
    autoBriefingsEnabled,
    toggleAutoBriefings,
    currentMood,
  } = useAiraStore();

  const openSleepDrawer = useSleepStore((state) => state.openDrawer);
  const openLearningDrawer = useLearningStore((state) => state.openDrawer);
  const pomodoroStatus = useLearningStore((state) => state.status);
  const pomodoroTimeLeft = useLearningStore((state) => state.timeLeft);
  const pomodoroMode = useLearningStore((state) => state.mode);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const unreadCount = useNotificationStore((state) => state.getUnreadCount());

  const name = character?.name || "Shadow Monarch";
  const rank = character?.rank || "F";
  const levelData = calculateLevelData(character?.exp || 0);
  const gold = character?.gold || 500;
  const gems = character?.gems || 50;
  const towerTokens = character?.towerTokens || 0;
  const stats = character?.stats || {
    strength: 1,
    endurance: 1,
    discipline: 1,
    knowledge: 1,
    recovery: 1,
    focus: 1,
    consistency: 1,
  };
  const { toggleMenu, isMenuOpen } = useNavigationStore();
  const authUsername = useAuthStore((state) => state.user?.username);
  const username = authUsername || name;

  const handleLogout = async () => {
    try {
      await fetcher("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    useAuthStore.getState().logout();
    playUIMenuSFX();
    router.push("/login");
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    playUIMenuSFX();
  };

  return (
    <>
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        username={username}
      />
      <header
        suppressHydrationWarning
        data-mobile-topbar
        className="h-[74px] px-4 sm:px-6 bg-[#160B29] border-b-4 border-black flex items-center justify-between shrink-0 select-none sticky top-0 z-40 relative shadow-[0_4px_0_0_#2b1045]"
      >
        {/* LEFT: 8-BIT MENU BUTTON (LEFTMOST) + CHARACTER PROFILE BADGE (ON ITS RIGHT) */}
        <div suppressHydrationWarning data-mobile-topbar-left className="flex items-center gap-3.5 flex-1 relative z-10">
          {/* Menu Button (Leftmost) */}
          <button
            onClick={() => {
              playUIMenuSFX();
              toggleMenu();
            }}
            type="button"
            className="flex items-center gap-2 px-3 py-2 bg-[#23153C] border-2 border-black font-pixel text-xs text-white uppercase tracking-wider shadow-[2px_2px_0_0_#000] hover:border-[#22c55e] hover:text-[#22c55e] transition-colors cursor-pointer group active:translate-y-0.5 active:shadow-none"
            aria-label="Toggle Navigation Menu"
            aria-expanded={isMenuOpen}
            data-mobile-menu-toggle
          >
            <PixelMenuIcon className="w-4 h-4 text-white group-hover:text-[#22c55e] transition-colors" />
            <span data-mobile-menu-label className="font-bold">MENU</span>
            <span data-mobile-menu-state className="text-[#22c55e] font-bold text-xs">{isMenuOpen ? "[-]" : "[+]"}</span>
          </button>

          {/* Interactive 8-Bit Profile Quick-Hub Dropdown (On Menu's Right) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                suppressHydrationWarning
                data-mobile-profile-trigger
                className="flex items-center gap-3 px-3 py-1.5 bg-[#23153C] border-2 border-black rounded-none cursor-pointer hover:border-[#22c55e] hover:bg-[#2d1b4c] transition-colors shadow-[2px_2px_0_0_#000] group text-left"
              >
                {/* 8-bit Avatar Sprite (static, no constant bobbing) */}
                <div className="w-10 h-10 bg-[#120824] border border-[#3b1861] flex items-center justify-center relative p-1 shadow-[inset_1px_1px_0_0_#000]">
                  <img
                    src={CHARACTER_AVATAR_SPRITE}
                    alt="Character Avatar"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                <div suppressHydrationWarning data-mobile-profile-details className="flex flex-col justify-center gap-1">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-sm font-bold pixel-text-outlined tracking-wider text-white">
                      {name}
                    </h2>
                    <span className="font-pixel text-xs text-white font-bold">
                      Lv. {levelData.currentLevel}
                    </span>
                  </div>

                  <div className="text-xs font-pixel text-white">
                    Rank : <span className="text-white font-bold">{rank}-Rank</span>
                  </div>

                  {/* 8-bit EXP Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-28 sm:w-32">
                      <XpBar
                        value={levelData.progressPercentage}
                        currentExp={levelData.currentExpInLevel}
                        expToNextLevel={levelData.expToNextLevel}
                        progressProps={{ className: "h-2 sm:h-2.5" }}
                      />
                    </div>
                    <span className="text-xs text-white font-pixel tabular-nums">
                      EXP {levelData.currentExpInLevel}/{levelData.expToNextLevel}
                    </span>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="bg-[#1A102F] border-2 border-black text-white w-80 shadow-[4px_4px_0_0_#000] p-4 rounded-none font-sans mt-2"
            >
              <div suppressHydrationWarning className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#120824] border border-[#3b1861] flex items-center justify-center p-1">
                  <img
                    src={CHARACTER_AVATAR_SPRITE}
                    alt="Avatar"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div>
                  <h3 className="font-pixel text-xs font-bold text-white">{name}</h3>
                  <p className="text-xs text-white/70 font-mono mt-0.5">@{username}</p>
                  <div className="flex gap-2 mt-1 font-pixel text-xs">
                    <span className="px-2 py-0.5 bg-[#182a4d] text-white border border-[#2b599e]">
                      {rank}-Rank
                    </span>
                    <span className="px-2 py-0.5 bg-[#281545] text-white border border-[#582799]">
                      Lv. {levelData.currentLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Level EXP Stepped Progress */}
              <div className="mb-3 px-0.5">
                <XpBar
                  value={levelData.progressPercentage}
                  currentExp={levelData.currentExpInLevel}
                  expToNextLevel={levelData.expToNextLevel}
                  showText
                  progressProps={{ className: "h-3" }}
                />
              </div>

              {/* Mini Stat Matrix */}
              <div className="grid grid-cols-4 gap-1.5 mb-4 font-pixel text-xs">
                <div className="bg-[#120824] border border-[#3b1861] p-1.5 text-center">
                  <span className="text-white/70 block text-xs">STR</span>
                  <span className="text-white font-bold">{stats.strength}</span>
                </div>
                <div className="bg-[#120824] border border-[#3b1861] p-1.5 text-center">
                  <span className="text-white/70 block text-xs">END</span>
                  <span className="text-white font-bold">{stats.endurance}</span>
                </div>
                <div className="bg-[#120824] border border-[#3b1861] p-1.5 text-center">
                  <span className="text-white/70 block text-xs">DIS</span>
                  <span className="text-white font-bold">{stats.discipline}</span>
                </div>
                <div className="bg-[#120824] border border-[#3b1861] p-1.5 text-center">
                  <span className="text-white/70 block text-xs">KNO</span>
                  <span className="text-white font-bold">{stats.knowledge}</span>
                </div>
                <div className="bg-[#120824] border border-[#3b1861] p-1.5 text-center">
                  <span className="text-white/70 block text-xs">REC</span>
                  <span className="text-white font-bold">{stats.recovery}</span>
                </div>
                <div className="bg-[#120824] border border-[#3b1861] p-1.5 text-center">
                  <span className="text-white/70 block text-xs">FOC</span>
                  <span className="text-white font-bold">{stats.focus}</span>
                </div>
                <div className="bg-[#120824] border border-[#3b1861] p-1.5 text-center col-span-2">
                  <span className="text-white/70 block text-xs">CNS</span>
                  <span className="text-white font-bold">{stats.consistency}</span>
                </div>
              </div>

              <div className="space-y-1 font-pixel text-xs">
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 py-2 rounded-none text-white">
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-white" />
                    <span>[ PROFILE ]</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleThemeToggle}
                  className="cursor-pointer hover:bg-white/10 py-2 rounded-none text-white"
                >
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-white" />
                    <span>[ THEME TOGGLE ]</span>
                  </div>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-black/60 my-2" />

              <div className="space-y-1 font-pixel text-xs">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-red-950 py-2 rounded-none text-white font-bold"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-white" />
                    <span>[ LOGOUT ]</span>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* RIGHT: 8-BIT CURRENCIES (GOLD, GEMS, TOKENS) & ACTION CONTROLS */}
        <div suppressHydrationWarning data-mobile-topbar-right className="flex items-center gap-3 sm:gap-4 relative z-10">
          {/* Currencies Counters — static boxes with animated coin GIFs */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Gold */}
            <SystemTooltip
              title={CURRENCY_LORE.gold.name}
              subtitle="Primary Ascend Currency"
              category={CURRENCY_LORE.gold.category}
              rarity={CURRENCY_LORE.gold.rarity}
              description={CURRENCY_LORE.gold.description}
              lore={CURRENCY_LORE.gold.lore}
              mechanics={CURRENCY_LORE.gold.mechanics}
              stats={[
                {
                  label: "Your Balance",
                  value: `${gold.toLocaleString()} Gold`,
                  color: "text-white",
                },
                {
                  label: "Acquisition",
                  value: "Tower, Missions, Habits, Bosses",
                },
              ]}
              tags={CURRENCY_LORE.gold.tags}
            >
              <div
                suppressHydrationWarning
                className="flex items-center gap-2 px-3 py-1.5 bg-[#23153C] border border-[#3b1861] text-white font-pixel text-xs shadow-[2px_2px_0_0_#000] hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all cursor-help font-bold"
              >
                <CurrencyIcon type="GOLD" size="sm" />
                <span>{gold.toLocaleString()}</span>
                <span className="text-white font-bold ml-0.5">+</span>
              </div>
            </SystemTooltip>

            {/* Gems */}
            <SystemTooltip
              title={CURRENCY_LORE.gems.name}
              subtitle="Premium Astral Currency"
              category={CURRENCY_LORE.gems.category}
              rarity={CURRENCY_LORE.gems.rarity}
              description={CURRENCY_LORE.gems.description}
              lore={CURRENCY_LORE.gems.lore}
              mechanics={CURRENCY_LORE.gems.mechanics}
              stats={[
                {
                  label: "Your Balance",
                  value: `${gems.toLocaleString()} Gems`,
                  color: "text-white",
                },
                {
                  label: "Acquisition",
                  value: "Boss Clears, PR Milestones, Elite Tiers",
                },
              ]}
              tags={CURRENCY_LORE.gems.tags}
            >
              <div
                suppressHydrationWarning
                className="flex items-center gap-2 px-3 py-1.5 bg-[#23153C] border border-[#3b1861] text-white font-pixel text-xs shadow-[2px_2px_0_0_#000] hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all cursor-help font-bold"
              >
                <CurrencyIcon type="GEMS" size="sm" />
                <span>{gems.toLocaleString()}</span>
                <span className="text-white font-bold ml-0.5">+</span>
              </div>
            </SystemTooltip>

            {/* Tower Tokens / Keys */}
            <SystemTooltip
              title={CURRENCY_LORE.towerTokens.name}
              subtitle="Ascension Sigil Currency"
              category={CURRENCY_LORE.towerTokens.category}
              rarity={CURRENCY_LORE.towerTokens.rarity}
              description={CURRENCY_LORE.towerTokens.description}
              lore={CURRENCY_LORE.towerTokens.lore}
              mechanics={CURRENCY_LORE.towerTokens.mechanics}
              stats={[
                {
                  label: "Your Balance",
                  value: `${towerTokens.toLocaleString()} Tokens`,
                  color: "text-white",
                },
                {
                  label: "Acquisition",
                  value: "Tower Floor Clears, Boss PRs, Consistency",
                },
              ]}
              tags={CURRENCY_LORE.towerTokens.tags}
            >
              <div
                suppressHydrationWarning
                className="flex items-center gap-2 px-3 py-1.5 bg-[#23153C] border border-[#3b1861] text-white font-pixel text-xs shadow-[2px_2px_0_0_#000] hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all cursor-help font-bold"
              >
                <CurrencyIcon type="TOWER_TOKENS" size="sm" />
                <span>{towerTokens.toLocaleString()}</span>
                <span className="text-white font-bold ml-0.5">+</span>
              </div>
            </SystemTooltip>
          </div>

          <div className="h-6 w-0.5 bg-black hidden lg:block" />

          {/* Action Icons with 8-bit Buttons */}
          <div data-mobile-topbar-actions className="flex items-center gap-2">
            {/* Focus Engine */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openLearningDrawer}
              className="w-8 h-8 bg-[#23153C] border-2 border-black text-zinc-300 hover:text-cyan-300 hover:bg-[#341b54] rounded-none shadow-[2px_2px_0_0_#000] cursor-pointer"
              title="Pomodoro Focus Engine"
            >
              <Brain className="w-4 h-4" />
            </Button>

            {/* Sleep Sanctuary */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openSleepDrawer}
              className="w-8 h-8 bg-[#23153C] border-2 border-black text-zinc-300 hover:text-purple-300 hover:bg-[#341b54] rounded-none shadow-[2px_2px_0_0_#000] cursor-pointer"
              title="Sleep Sanctuary"
            >
              <Moon className="w-4 h-4" />
            </Button>

            {/* Notification Drawer */}
            <NotificationDrawer>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 bg-[#23153C] border-2 border-black text-zinc-300 hover:text-cyan-300 hover:bg-[#341b54] rounded-none shadow-[2px_2px_0_0_#000] cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {isMounted && unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-cyan-400 border border-black" />
                )}
              </Button>
            </NotificationDrawer>

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 bg-[#23153C] border-2 border-black text-zinc-300 hover:text-cyan-300 hover:bg-[#341b54] rounded-none shadow-[2px_2px_0_0_#000] cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#1A102F] border-4 border-black text-zinc-200 text-xs w-52 shadow-[4px_4px_0_0_#000] rounded-none p-2 font-pixel text-[9px]"
              >
                <DropdownMenuLabel className="px-3 py-2 text-white">
                  SYSTEM SETTINGS
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black/60" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-cyan-950 px-3 py-2">
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-cyan-400" />
                    <span>PREFERENCES</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/60" />
                <DropdownMenuItem
                  onClick={toggleAutoBriefings}
                  className="cursor-pointer hover:bg-cyan-950 flex items-center justify-between px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <AiraAvatar mood={currentMood as AiraMood} className="w-3.5 h-3.5" />
                    <span>AIRA AI</span>
                  </div>
                  <span className="text-[8px] text-cyan-400">
                    {autoBriefingsEnabled ? "ON" : "OFF"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}

export default Topbar;
