"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { playSystemOpen } from "@/features/audio/useSystemAudio";
import { useNavigationStore } from "@/store/useNavigationStore";
import { playMovementSFX } from "@/utils/audio";
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

export type SidebarSectionId =
  | "operations"
  | "disciplines"
  | "conquest"
  | "armory"
  | "system";

export interface SidebarNavItem {
  id: string;
  index: `${number}${number}`;
  label: string;
  href: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  category: SidebarSectionId;
  parentId?: string;
}

export interface SidebarNavSection {
  id: SidebarSectionId;
  header: string;
  label: string;
  items: SidebarNavItem[];
}

export const SIDEBAR_NAV_SECTIONS: SidebarNavSection[] = [
  {
    id: "operations",
    header: "// OPERATIONS",
    label: "Core & Daily Ops",
    items: [
      { id: "dashboard", index: "01", label: "Dashboard", href: "/dashboard", ariaLabel: "Go to Dashboard", icon: GraphicDashboardIcon, category: "operations" },
      { id: "missions", index: "02", label: "Missions", href: "/missions", ariaLabel: "View Daily Missions", icon: GraphicMissionsIcon, category: "operations" },
      { id: "habits", index: "03", label: "Habits", href: "/habits", ariaLabel: "Track Habits", icon: GraphicHabitsIcon, category: "operations" },
      { id: "calendar", index: "04", label: "Calendar", href: "/calendar", ariaLabel: "Open Calendar", icon: GraphicCalendarIcon, category: "operations" },
    ],
  },
  {
    id: "disciplines",
    header: "// DISCIPLINES",
    label: "Character & Disciplines",
    items: [
      { id: "profile", index: "05", label: "Profile", href: "/profile", ariaLabel: "View Character Profile", icon: GraphicProfileIcon, category: "disciplines" },
      { id: "workouts", index: "06", label: "Workouts", href: "/workouts", ariaLabel: "Open Workouts", icon: GraphicWorkoutsIcon, category: "disciplines" },
      { id: "sleep", index: "07", label: "Sleep & Rest", href: "/sleep", ariaLabel: "Open Sleep and Rest", icon: GraphicSleepIcon, category: "disciplines" },
      { id: "learning", index: "08", label: "Learning & Focus", href: "/learning", ariaLabel: "Open Learning and Focus", icon: GraphicLearningIcon, category: "disciplines" },
      { id: "skills", index: "09", label: "Skills", href: "/skills", ariaLabel: "Open Skill Tree", icon: GraphicSkillsIcon, category: "disciplines" },
    ],
  },
  {
    id: "conquest",
    header: "// COMBAT",
    label: "Conquest & Trials",
    items: [
      { id: "tower", index: "10", label: "Tower", href: "/tower", ariaLabel: "Enter the Tower of Ascension", icon: GraphicTowerIcon, category: "conquest" },
      { id: "bosses", index: "11", label: "Bosses", href: "/bosses", ariaLabel: "View World Bosses", icon: GraphicBossesIcon, category: "conquest" },
      { id: "boss-pr", index: "12", label: "Boss PR", href: "/workouts/boss-pr", ariaLabel: "Open Boss PR Benchmarks", icon: GraphicBossPRIcon, category: "conquest", parentId: "bosses" },
    ],
  },
  {
    id: "armory",
    header: "// ARMORY",
    label: "Armory & Economy",
    items: [
      { id: "inventory", index: "13", label: "Inventory", href: "/inventory", ariaLabel: "Open Inventory and Equipment", icon: GraphicInventoryIcon, category: "armory" },
      { id: "crafting", index: "14", label: "Forge & Craft", href: "/crafting", ariaLabel: "Open Forge and Crafting", icon: GraphicCraftingIcon, category: "armory" },
      { id: "shop", index: "15", label: "Shop", href: "/shop", ariaLabel: "Open Merchant Shop", icon: GraphicShopIcon, category: "armory" },
      { id: "beasts", index: "16", label: "Beasts & Pets", href: "/beasts", ariaLabel: "Open Beasts and Pets", icon: GraphicBeastsIcon, category: "armory" },
    ],
  },
  {
    id: "system",
    header: "// SYSTEM CORE",
    label: "System Core",
    items: [
      { id: "aira", index: "17", label: "AI System / AIRA", href: "/aira", ariaLabel: "Open AIRA AI System", icon: GraphicAiraIcon, category: "system" },
      { id: "achievements", index: "18", label: "Achievements", href: "/achievements", ariaLabel: "Open Achievements", icon: GraphicAchievementsIcon, category: "system" },
      { id: "automations", index: "19", label: "Automations", href: "/automations", ariaLabel: "Manage automation rules", icon: GraphicAutomationsIcon, category: "system" },
    ],
  },
];

const ALL_NAV_ITEMS = SIDEBAR_NAV_SECTIONS.flatMap((section) => section.items);

function getActiveItemId(pathname: string) {
  return [...ALL_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.id;
}

function NavigationItem({ item, activeId, onNavigate }: { item: SidebarNavItem; activeId?: string; onNavigate: () => void }) {
  const Icon = item.icon;
  const isActive = item.id === activeId;

  return (
    <li className={item.parentId ? "ml-4 border-l border-slate-700/70 pl-2" : undefined}>
      <Link
        href={item.href}
        aria-label={item.ariaLabel}
        aria-current={isActive ? "page" : undefined}
        onClick={onNavigate}
        className={`group relative grid min-h-11 grid-cols-[2.25rem_1.35rem_minmax(0,1fr)_1rem] items-center gap-2.5 border px-2 py-2 font-semibold transition-[background-color,border-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b14] ${
          isActive
            ? "border-slate-600 bg-[#172235] text-white"
            : "border-transparent text-slate-300 hover:border-slate-700 hover:bg-[#171c28] hover:text-amber-100"
        }`}
      >
        <span className={`flex h-6 w-8 items-center justify-center border font-mono text-[10px] tabular-nums ${isActive ? "border-emerald-500/60 bg-emerald-950 text-emerald-300" : "border-slate-700 bg-[#0c101b] text-[#a7b2c3] group-hover:text-amber-300"}`}>{item.index}</span>
        <div className="w-5 h-5 flex items-center justify-center shrink-0 group-hover:scale-115 transition-transform duration-200">
          <Icon className="w-5 h-5 shrink-0 drop-shadow-sm" />
        </div>
        <span className="truncate text-xs tracking-wide">{item.label}</span>
        {isActive && <ChevronRight className="h-4 w-4 fill-emerald-300 text-emerald-300" strokeWidth={2} aria-hidden="true" />}
        {isActive && <span className="absolute inset-y-1 left-0 w-px bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.75)]" aria-hidden="true" />}
      </Link>
    </li>
  );
}


function NavigationSection({ section, activeId, onNavigate }: { section: SidebarNavSection; activeId?: string; onNavigate: () => void }) {
  return (
    <section aria-labelledby={`nav-${section.id}`} className="pt-4 first:pt-0">
      <div className="mb-2 flex items-end justify-between gap-3 border-t border-slate-800 pt-3">
        <h2 id={`nav-${section.id}`} className="font-pixel text-[10px] leading-4 text-emerald-300">{section.header}</h2>
        <span className="truncate text-[10px] uppercase tracking-[0.12em] text-slate-500">{section.label}</span>
      </div>
      <ul className="grid gap-1">
        {section.items.map((item) => <NavigationItem key={item.id} item={item} activeId={activeId} onNavigate={onNavigate} />)}
      </ul>
    </section>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const { isMenuOpen, setMenuOpen } = useNavigationStore();
  const activeId = getActiveItemId(pathname);
  const primarySections = SIDEBAR_NAV_SECTIONS.filter((section) => section.id !== "system");
  const systemSection = SIDEBAR_NAV_SECTIONS.find((section) => section.id === "system");
  const onNavigate = () => {
    setMenuOpen(false);
    playSystemOpen();
    playMovementSFX("teleport");
  };

  return (
    <Dialog.Root open={isMenuOpen} onOpenChange={setMenuOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#02040a]/80 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-[71] flex h-dvh w-[min(22rem,calc(100vw-1rem))] flex-col border-r border-slate-700 bg-[#080b14] text-slate-100 shadow-[18px_0_45px_rgba(0,0,0,.45)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
          <header className="flex min-h-20 items-center justify-between border-b border-slate-800 px-4">
            <div>
              <Dialog.Title className="font-pixel text-sm tracking-wide text-white">ASCEND OS</Dialog.Title>
              <Dialog.Description className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300">Command index · 18 routes</Dialog.Description>
            </div>
            <Dialog.Close className="grid h-11 w-11 place-items-center border border-slate-700 bg-[#0d121e] text-slate-300 transition-colors hover:border-emerald-500 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" aria-label="Close navigation">
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </header>

          <nav aria-label="Primary navigation" className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-color:#334155_#080b14] [scrollbar-width:thin]">
              {primarySections.map((section) => <NavigationSection key={section.id} section={section} activeId={activeId} onNavigate={onNavigate} />)}
            </div>
            {systemSection && <div className="shrink-0 border-t border-slate-700 bg-[#05070d] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1"><NavigationSection section={systemSection} activeId={activeId} onNavigate={onNavigate} /></div>}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default SidebarNav;
