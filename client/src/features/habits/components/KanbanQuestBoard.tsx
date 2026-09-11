import React, { useState } from "react";
import { QuestRank, QuestStatus } from "../types/kanban";
import { useKanbanMissionStore } from "../store/useKanbanMissionStore";
import { KanbanQuestCard } from "./KanbanQuestCard";
import { CreateQuestModal } from "./CreateQuestModal";
import { CurrencyIcon } from "@/components/CurrencyDisplay";
import { playUIMenuSFX } from "@/utils/audio";
import { PixelBadge } from "@/components/ui/pixel/PixelBadge";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CoolMode } from "@/components/ui/cool-mode";
import {
  PixelLayersIcon,
  PixelCheckIcon,
  PixelSearchIcon,
  PixelCloseIcon,
  PixelPlusIcon,
  PixelTagIcon,
  PixelCrosshairIcon,
  PixelSwordIcon,
  PixelBookIcon,
  PixelSparklesIcon,
} from "@/components/ui/pixel/PixelIcons";

const COLUMNS: Array<{
  id: QuestStatus;
  title: string;
  subtitle: string;
  badgeVariant: "dark" | "cyan" | "purple" | "success" | "gold";
  icon: React.ReactNode;
  accentColor: string;
}> = [
  {
    id: "To Do",
    title: "PENDING MISSIONS",
    subtitle: "To Do Directives",
    badgeVariant: "dark",
    icon: <span className="w-2.5 h-2.5 bg-amber-600 inline-block shadow-[1px_1px_0_0_#000]" />,
    accentColor: "border-amber-900/60",
  },
  {
    id: "In Progress",
    title: "IN PROGRESS",
    subtitle: "Active Directives",
    badgeVariant: "cyan",
    icon: <PixelSwordIcon className="w-3.5 h-3.5 text-cyan-400" />,
    accentColor: "border-cyan-700/60",
  },
  {
    id: "Review",
    title: "REVIEW & VERIFY",
    subtitle: "Verification Phase",
    badgeVariant: "purple",
    icon: <PixelBookIcon className="w-3.5 h-3.5 text-purple-400" />,
    accentColor: "border-purple-700/60",
  },
  {
    id: "Completed",
    title: "COMPLETED",
    subtitle: "Rewards Claimed",
    badgeVariant: "success",
    icon: <PixelSparklesIcon className="w-3.5 h-3.5 text-emerald-400" />,
    accentColor: "border-emerald-700/60",
  },
];

export const KanbanQuestBoard: React.FC = () => {
  const {
    quests,
    searchQuery,
    selectedTag,
    selectedRank,
    setSearchQuery,
    setSelectedTag,
    setSelectedRank,
  } = useKanbanMissionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract all unique hashtags from quests
  const allTags = Array.from(new Set(quests.flatMap((q) => q.tags || [])));

  // Filter quests
  const filteredQuests = quests.filter((q) => {
    const matchesSearch =
      searchQuery === "" ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = !selectedTag || (q.tags && q.tags.includes(selectedTag));
    const matchesRank = !selectedRank || q.rank === selectedRank;

    return matchesSearch && matchesTag && matchesRank;
  });

  const totalQuests = quests.length;
  const clearedQuests = quests.filter((q) => q.status === "Completed").length;
  const inProgressQuests = quests.filter((q) => q.status === "In Progress").length;
  const totalExpPool = quests.reduce((sum, q) => sum + (q.expReward || 0), 0);
  const totalGoldPool = quests.reduce((sum, q) => sum + (q.goldReward || 0), 0);

  return (
    <div className="pixel-wood-board p-4 sm:p-6 md:px-20 lg:px-24 xl:px-28 space-y-4 select-none relative overflow-hidden">
      {/* Iron Corner Nails */}
      <div className="absolute top-2 left-2 w-2 h-2 bg-[#475569] border border-black shadow-[1px_1px_0_0_#1e293b]" />
      <div className="absolute top-2 right-2 w-2 h-2 bg-[#475569] border border-black shadow-[1px_1px_0_0_#1e293b]" />
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#475569] border border-black shadow-[1px_1px_0_0_#1e293b]" />
      <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#475569] border border-black shadow-[1px_1px_0_0_#1e293b]" />

      {/* ======================================================= */}
      {/* CARVED WOODEN QUEST BOARD HEADER PLAQUE (Directly on Board) */}
      {/* ======================================================= */}
      <div className="relative mx-auto max-w-2xl mb-1">
        <div className="bg-[#422211] border-4 border-[#1f0f08] p-2.5 sm:p-3 shadow-[inset_2px_2px_0_0_#733d1e,inset_-2px_-2px_0_0_#140a05,0_4px_8px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center relative">
          {/* Corner Iron Screws / Nails */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#111827] border border-[#4b5563] shadow-[inset_1px_1px_0_0_#9ca3af]" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#111827] border border-[#4b5563] shadow-[inset_1px_1px_0_0_#9ca3af]" />
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#111827] border border-[#4b5563] shadow-[inset_1px_1px_0_0_#9ca3af]" />
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#111827] border border-[#4b5563] shadow-[inset_1px_1px_0_0_#9ca3af]" />

          {/* Inset Parchment / Light Wood Carved Title Plate */}
          <div className="bg-[#edd19d] border-2 border-[#2b1810] px-8 py-1.5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center gap-3">
            <span className="text-[#3d2110] font-pixel text-xs sm:text-sm">✦</span>
            <h1 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-widest text-[#241208] font-pixel text-center">
              QUEST BOARD
            </h1>
            <span className="text-[#3d2110] font-pixel text-xs sm:text-sm">✦</span>
          </div>

          {/* Guild Subtext */}
          <p className="font-pixel text-[10px] text-[#f4d19b] mt-1.5 tracking-wide uppercase text-center max-w-xl">
            Adventurers Guild of Ascend OS • Active Missions, Focus Directives & Daily Goals
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TELEMETRY HUD BAR (Carved Brass & Timber Plaque) */}
      {/* ========================================================= */}
      <div className="p-3 sm:p-3.5 bg-[#180d08] border-2 border-[#542d17] shadow-[inset_1px_1px_0_0_#6e3d20,inset_-1px_-1px_0_0_#0a0503] flex flex-wrap items-center justify-between gap-4 font-pixel text-xs text-white relative">
        <div className="flex items-center gap-4 flex-wrap z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#2d170c] border border-[#6e3d20] flex items-center justify-center text-amber-400 shadow-[inset_1px_1px_0_0_#42220f]">
              <PixelLayersIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-[#fef08a] uppercase tracking-wider block text-xs sm:text-sm">
                ACTIVE MISSION LANES
              </h2>
              <span className="text-xs text-[#d4a373] block">Interactive Quest Directives</span>
            </div>
          </div>

          <div className="h-6 w-0.5 bg-[#542d17] hidden sm:block" />

          {/* Stats Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <PixelBadge variant="dark" size="md" className="border-[#6e3d20] bg-[#24130b]">
              <PixelLayersIcon className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>TOTAL:</span>
              <strong className="text-white font-bold"><NumberTicker value={totalQuests} /></strong>
            </PixelBadge>

            <PixelBadge variant="cyan" size="md">
              <span className="w-1.5 h-1.5 bg-cyan-400 inline-block shadow-[1px_1px_0_0_#000]" />
              <span>ACTIVE:</span>
              <strong className="text-cyan-300 font-bold"><NumberTicker value={inProgressQuests} /></strong>
            </PixelBadge>

            <PixelBadge variant="success" size="md">
              <PixelCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>CLEARED:</span>
              <strong className="text-emerald-300 font-bold"><NumberTicker value={clearedQuests} /></strong>
            </PixelBadge>
          </div>
        </div>

        {/* Currency Rewards Pool */}
        <div className="flex items-center gap-2.5 flex-wrap z-10">
          <PixelBadge variant="cyan" size="md">
            <CurrencyIcon type="EXP" size="xs" />
            <span>+<NumberTicker value={totalExpPool} /> EXP POOL</span>
          </PixelBadge>

          <PixelBadge variant="gold" size="md">
            <CurrencyIcon type="GOLD" size="xs" />
            <span>+<NumberTicker value={totalGoldPool} />g REWARDS POOL</span>
          </PixelBadge>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FILTER & SEARCH TOOLBAR (Inlaid Wood & Parchment Search) */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#1e0f09] border-2 border-[#542d17] shadow-[inset_1px_1px_0_0_#381e10]">
        {/* Search Input (Parchment Filter Field) */}
        <div className="relative flex-1">
          <PixelSearchIcon className="w-4 h-4 text-[#8c5225] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search missions by title, description, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#fcedc7] border-2 border-[#42220f] pl-9 pr-9 py-2 text-xs text-[#2b170c] placeholder-[#8c5225]/70 focus:outline-none focus:border-amber-600 font-pixel transition-none shadow-[inset_1px_1px_0_0_#d4a373]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c5225] hover:text-[#2b170c] cursor-pointer active:translate-y-0.5"
            >
              <PixelCloseIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Rank Dropdown */}
          <select
            value={selectedRank || ""}
            onChange={(e) => {
              playUIMenuSFX();
              setSelectedRank((e.target.value as QuestRank) || null);
            }}
            className="bg-[#fcedc7] border-2 border-[#42220f] hover:border-amber-600 px-3 py-2 text-xs text-[#2b170c] font-pixel focus:outline-none cursor-pointer shadow-[inset_1px_1px_0_0_#d4a373]"
          >
            <option value="" className="bg-[#fcedc7] text-[#2b170c]">All Mission Ranks</option>
            <option value="S" className="bg-[#fcedc7] text-amber-800 font-bold">S-Rank (Legendary)</option>
            <option value="A" className="bg-[#fcedc7] text-purple-800 font-bold">A-Rank (Epic)</option>
            <option value="B" className="bg-[#fcedc7] text-blue-800 font-bold">B-Rank (Elite)</option>
            <option value="C" className="bg-[#fcedc7] text-emerald-800 font-bold">C-Rank (Standard)</option>
            <option value="D" className="bg-[#fcedc7] text-stone-800 font-bold">D-Rank (Apprentice)</option>
            <option value="F" className="bg-[#fcedc7] text-stone-700 font-bold">F-Rank (Novice)</option>
          </select>

          {/* Construct Quest Button */}
          <CoolMode options={{ particle: "📜", size: 22, speedHorz: 4, speedUp: 8 }}>
            <PixelButton
              variant="gold"
              size="md"
              onClick={() => {
                playUIMenuSFX();
                setIsModalOpen(true);
              }}
              className="text-xs"
            >
              <PixelPlusIcon className="w-3.5 h-3.5 mr-1" />
              <span>Create Mission</span>
            </PixelButton>
          </CoolMode>
        </div>
      </div>

      {/* ========================================================= */}
      {/* HASHTAG CHIPS BAR (Pinned Paper Slips) */}
      {/* ========================================================= */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 font-pixel text-xs custom-scrollbar">
          <span className="text-[#d4a373] uppercase text-xs shrink-0 flex items-center gap-1 font-bold">
            <PixelTagIcon className="w-3 h-3 text-amber-400" /> TAGS:
          </span>

          <button
            type="button"
            onClick={() => {
              playUIMenuSFX();
              setSelectedTag(null);
            }}
            className={`text-[11px] py-1 px-2.5 border-2 transition-none cursor-pointer active:translate-y-0.5 ${
              selectedTag === null
                ? "bg-[#f5e0a3] text-[#2b170c] border-[#2b1810] shadow-[inset_1px_1px_0_0_#ffffff]"
                : "bg-[#2b1810] text-[#d4a373] border-[#542d17] hover:border-[#8c5225]"
            }`}
          >
            ALL TAGS (<NumberTicker value={quests.length} />)
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                playUIMenuSFX();
                setSelectedTag(selectedTag === tag ? null : tag);
              }}
              className={`text-[11px] py-1 px-2.5 border-2 transition-none cursor-pointer active:translate-y-0.5 lowercase ${
                selectedTag === tag
                  ? "bg-[#ebd198] text-[#2b170c] border-[#2b1810] shadow-[inset_1px_1px_0_0_#ffffff] font-bold"
                  : "bg-[#24140c] text-[#d4a373] border-[#4a2813] hover:border-[#6e3d20]"
              }`}
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </button>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* EMPTY STATE BANNER (Grand Pinned Parchment Decree) */}
      {/* ========================================================= */}
      {totalQuests === 0 && (
        <div className="w-full py-3.5 px-4 sm:px-6 pixel-parchment border-4 border-[#381e0f] text-center flex flex-col sm:flex-row items-center justify-between gap-3 font-pixel my-3 shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 bg-[#ebd099] border-2 border-[#381e0f] flex items-center justify-center text-[#2b170c] shrink-0">
              <PixelCrosshairIcon className="w-4 h-4 text-[#2b170c]" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#2b170c] uppercase tracking-wider">
                NO ACTIVE MISSIONS ON BOARD
              </h2>
              <p className="text-[11px] text-[#4a2e1b] mt-0.5 leading-snug">
                The mission board is currently empty. Create your first mission directive to begin earning EXP, Gold rewards, and stat progression.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <CoolMode options={{ particle: "📜", size: 20, speedHorz: 4, speedUp: 8 }}>
              <PixelButton
                variant="gold"
                size="sm"
                onClick={() => {
                  playUIMenuSFX();
                  setIsModalOpen(true);
                }}
                className="text-xs whitespace-nowrap"
              >
                <PixelPlusIcon className="w-3.5 h-3.5 mr-1" />
                <span>CREATE FIRST MISSION</span>
              </PixelButton>
            </CoolMode>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4-COLUMN KANBAN SWIMLANES (Timber Notice Board Columns) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colQuests = filteredQuests.filter((q) => q.status === col.id);

          return (
            <div
              key={col.id}
              className="pixel-cork-board border-4 border-[#3a1d0d] p-3 flex flex-col min-h-0 h-auto relative shadow-[inset_0_0_30px_rgba(30,15,5,0.85),0_8px_16px_rgba(0,0,0,0.7)] transition-all duration-200"
            >
              {/* Column Header Plaque (Carved Timber Beam) */}
              <div className="bg-[#381c0d] border-2 border-[#1c0c04] px-3 py-2 mb-3 shadow-[inset_1px_1px_0_0_#693518,inset_-1px_-1px_0_0_#140702,0_3px_6px_rgba(0,0,0,0.6)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <div>
                    <h3 className="text-xs font-pixel font-bold uppercase tracking-wider text-[#fef08a] drop-shadow-[0_1px_2px_#000]">
                      {col.title}
                    </h3>
                    <span className="text-[10px] text-[#e0b284] block -mt-0.5 font-pixel font-medium">
                      {col.subtitle}
                    </span>
                  </div>
                </div>

                <span className="font-pixel text-xs font-bold px-2 py-0.5 bg-[#1f0e06] border border-[#522912] text-[#fef08a] shadow-[inset_1px_1px_0_0_#000]">
                  <NumberTicker value={colQuests.length} />
                </span>
              </div>

              {/* Column Quests Stack (Parchment Scrolls) */}
              <div className="space-y-4 flex-1 relative z-10">
                {colQuests.length === 0 ? (
                  <div className="h-44 border-2 border-dashed border-[#542d17]/70 flex flex-col items-center justify-center text-[#2b180f] font-pixel text-xs p-4 text-center bg-[#edd19d]/30 mt-2 shadow-[inset_0_0_12px_rgba(0,0,0,0.2)]">
                    <span className="text-[#3d2110] mb-1 font-bold">NO ACTIVE MISSIONS</span>
                    <span className="text-[10px] text-[#5c3317]/80 leading-relaxed">No missions in {col.id}</span>
                  </div>
                ) : (
                  colQuests.map((quest) => (
                    <KanbanQuestCard key={quest.id} quest={quest} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Construct Quest */}
      <CreateQuestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};



