"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dumbbell,
  Target,
  Shield,
  CheckCheck,
  Trash2,
  Bell,
  Bot,
  Sparkles,
} from "lucide-react";
import {
  useNotificationStore,
  NotificationCategory,
  AppNotification,
} from "@/store/useNotificationStore";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/8bit/empty";
import { playUIMenuSFX } from "@/utils/audio";
import { formatDistanceToNow } from "date-fns";
import "@/components/ui/8bit/styles/retro.css";

const CATEGORIES: {
  label: string;
  value: NotificationCategory;
  icon?: React.ElementType;
}[] = [
  { label: "ALL", value: "ALL" },
  { label: "AIRA", value: "AIRA BRIEFINGS", icon: Bot },
  { label: "WORKOUTS", value: "WORKOUTS", icon: Dumbbell },
  { label: "HABITS", value: "HABITS", icon: Target },
  { label: "TOWER", value: "TOWER / SYSTEM", icon: Shield },
];

export function NotificationDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeCategory, setActiveCategory] =
    useState<NotificationCategory>("ALL");
  const { notifications, markAllAsRead, clearLogs, markAsRead } =
    useNotificationStore();

  const filteredNotifications = notifications.filter(
    (n) => activeCategory === "ALL" || n.category === activeCategory
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getUnreadForCat = (cat: NotificationCategory) => {
    if (cat === "ALL") return unreadCount;
    return notifications.filter((n) => !n.isRead && n.category === cat).length;
  };

  const handleMarkAllRead = () => {
    try {
      playUIMenuSFX("confirm");
    } catch {}
    markAllAsRead();
  };

  const handleClear = () => {
    try {
      playUIMenuSFX("decline");
    } catch {}
    clearLogs();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-[#0c0919] border-l-4 border-black p-0 text-zinc-100 shadow-[-10px_0_0_0_#000] flex flex-col font-sans h-full z-50 overflow-hidden">
        {/* CRT Scanline Overlay Effect */}
        <div
          aria-hidden="true"
          className="retro-scanline-overlay absolute inset-0 pointer-events-none z-10 opacity-30"
        />

        {/* Neo-brutalist / 8bitcn Header Banner */}
        <SheetHeader className="p-4 sm:p-5 border-b-4 border-black bg-[#150F2A] shrink-0 space-y-3 relative z-20 shadow-[0_4px_0_0_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between gap-2 pr-8">
            <div className="flex items-center gap-2.5">
              <div className="size-9 bg-[#1d1238] border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center text-cyan-400 shrink-0">
                <Bell className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex flex-col text-left">
                <SheetTitle className="retro text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wider leading-none">
                  COMM LOGS
                </SheetTitle>
                <span className="retro text-[8px] text-zinc-400 tracking-wider uppercase block mt-1">
                  NOTIFICATIONS {unreadCount > 0 && `[${unreadCount} NEW]`}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleMarkAllRead}
                title="Mark all notifications as read"
                className="retro text-[8px] sm:text-[9px] font-bold text-cyan-300 hover:text-black bg-[#102235] hover:bg-cyan-400 border-2 border-black shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none h-7 px-2 flex items-center gap-1 transition-all cursor-pointer uppercase select-none"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">READ</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                title="Clear all notification history"
                className="retro text-[8px] sm:text-[9px] font-bold text-rose-300 hover:text-black bg-[#2d121c] hover:bg-rose-500 border-2 border-black shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none h-7 px-2 flex items-center gap-1 transition-all cursor-pointer uppercase select-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">CLEAR</span>
              </button>
            </div>
          </div>

          {/* Neo-brutalist Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = getUnreadForCat(cat.value);
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    try {
                      playUIMenuSFX("click");
                    } catch {}
                    setActiveCategory(cat.value);
                  }}
                  className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 border-2 border-black transition-all select-none cursor-pointer retro text-[8px] tracking-wider uppercase ${
                    isActive
                      ? "bg-cyan-400 text-black font-bold shadow-[2px_2px_0_0_#000] translate-x-[-1px] translate-y-[-1px]"
                      : "bg-[#1d1438] text-zinc-400 hover:text-white hover:bg-[#271b4a] shadow-[1px_1px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span
                      className={`px-1 py-0.2 text-[7px] font-mono font-bold border border-black ${
                        isActive
                          ? "bg-black text-cyan-300"
                          : "bg-cyan-400 text-black"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </SheetHeader>

        {/* Notification Scrollable Feed */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 z-20 relative">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex items-center justify-center py-12">
              <Empty
                font="retro"
                className="w-full border-2 border-dashed border-zinc-700/60 bg-[#140e2b]/80 p-8 shadow-[3px_3px_0_0_#000]"
              >
                <EmptyMedia
                  variant="icon"
                  className="size-14 bg-[#1e133a] border-2 border-black shadow-[3px_3px_0_0_#000]"
                >
                  <Bell className="w-7 h-7 text-cyan-400" />
                </EmptyMedia>
                <EmptyTitle className="retro text-[10px] sm:text-xs text-cyan-300 uppercase tracking-widest mt-2">
                  NO LOGS DETECTED
                </EmptyTitle>
                <EmptyDescription className="font-mono text-[11px] text-zinc-400 max-w-[240px]">
                  Transmissions and system briefings will be logged here in
                  real-time.
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onRead={() => markAsRead(notif.id)}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NotificationCard({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: () => void;
}) {
  const handleCardClick = () => {
    if (!notification.isRead) {
      try {
        playUIMenuSFX("click");
      } catch {}
      onRead();
    }
  };

  const getCategoryDetails = () => {
    switch (notification.category) {
      case "AIRA BRIEFINGS":
        return {
          badgeText: "AIRA",
          badgeClass: "bg-[#0b2938] text-cyan-300 border-cyan-400/80",
          iconBg: "bg-[#181132] border-cyan-500/60 shadow-[2px_2px_0_0_#000]",
          icon: (
            <img
              src="/AIRA ICON/fairy-gif.gif"
              alt="AIRA"
              className="w-full h-full object-cover scale-110 pixelated"
            />
          ),
          accentBorder: "border-cyan-400/90",
        };
      case "WORKOUTS":
        return {
          badgeText: "WORKOUT",
          badgeClass: "bg-[#331c08] text-amber-300 border-amber-500/80",
          iconBg: "bg-[#241306] border-amber-500/60 shadow-[2px_2px_0_0_#000]",
          icon: <Dumbbell className="w-5 h-5 text-amber-400" />,
          accentBorder: "border-amber-400/80",
        };
      case "HABITS":
        return {
          badgeText: "HABIT",
          badgeClass: "bg-[#092b1a] text-emerald-300 border-emerald-500/80",
          iconBg:
            "bg-[#061d12] border-emerald-500/60 shadow-[2px_2px_0_0_#000]",
          icon: <Target className="w-5 h-5 text-emerald-400" />,
          accentBorder: "border-emerald-400/80",
        };
      case "TOWER / SYSTEM":
        return {
          badgeText: "TOWER",
          badgeClass: "bg-[#290d3b] text-purple-300 border-purple-500/80",
          iconBg: "bg-[#1d092b] border-purple-500/60 shadow-[2px_2px_0_0_#000]",
          icon: <Shield className="w-5 h-5 text-purple-400" />,
          accentBorder: "border-purple-400/80",
        };
      default:
        return {
          badgeText: "SYSTEM",
          badgeClass: "bg-[#181a28] text-zinc-300 border-zinc-500/80",
          iconBg: "bg-[#141224] border-zinc-600/60 shadow-[2px_2px_0_0_#000]",
          icon: <Bell className="w-5 h-5 text-zinc-400" />,
          accentBorder: "border-zinc-500/80",
        };
    }
  };

  const { badgeText, badgeClass, iconBg, icon, accentBorder } =
    getCategoryDetails();

  return (
    <div
      onClick={handleCardClick}
      className={`relative p-3.5 sm:p-4 border-2 transition-all cursor-pointer select-none ${
        !notification.isRead
          ? `bg-[#181232] ${accentBorder} shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_#000]`
          : "bg-[#0f0b1e]/90 border-black/90 shadow-[2px_2px_0_0_#000] opacity-80 hover:opacity-100 hover:border-zinc-700/80 hover:translate-x-[-1px] hover:translate-y-[-1px]"
      }`}
    >
      {/* Unread Pixel Tag */}
      {!notification.isRead && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/90 border border-cyan-400 px-1.5 py-0.5 shadow-[1px_1px_0_0_#000]">
          <span className="w-1.5 h-1.5 bg-cyan-400 animate-pixel-blink" />
          <span className="retro text-[7px] text-cyan-300 font-bold uppercase tracking-widest">
            NEW
          </span>
        </div>
      )}

      <div className="flex gap-3 items-start">
        {/* Left Neo-brutal avatar / icon box */}
        <div
          className={`size-10 border-2 border-black shrink-0 flex items-center justify-center overflow-hidden ${iconBg}`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`retro text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 border border-black shadow-[1px_1px_0_0_#000] uppercase tracking-wider ${badgeClass}`}
            >
              {badgeText}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </span>
          </div>

          <p
            className={`text-xs sm:text-[13px] leading-relaxed font-sans font-medium mt-1.5 ${
              !notification.isRead ? "text-zinc-100" : "text-zinc-400"
            }`}
          >
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
}
