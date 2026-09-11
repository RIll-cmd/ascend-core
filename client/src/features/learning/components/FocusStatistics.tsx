"use client";

import React, { useState } from "react";
import {
  PixelFlameIcon,
  PixelAwardIcon,
  PixelBookIcon,
  PixelSparklesIcon,
  PixelShieldIcon,
  PixelPlusIcon,
  PixelPencilIcon,
  PixelTrashIcon,
  PixelPlayIcon,
  PixelRefreshIcon,
  PixelScrollIcon,
  PixelCloseIcon,
} from "@/components/ui/pixel/PixelIcons";
import {
  useLearningStore,
  CustomStudyTome,
  StatBonusType,
  SigilArchetype,
  FocusCategory,
  FocusSession,
  getTomeDimensions,
} from "../store/useLearningStore";
import { PixelProgress } from "@/components/ui/pixel/PixelProgress";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelAgedParchment } from "@/components/ui/pixel/PixelAgedParchment";
import { NumberTicker } from "@/components/ui/number-ticker";
import { playUIMenuSFX, playBuffSFX } from "@/utils/audio";
import { cn } from "@/lib/utils";

/* =====================================================================
   1. SCRIBE MASTERY RANKS & HERALDRY DATA
   ===================================================================== */
interface ScribeRank {
  tier: number;
  title: string;
  minHours: number;
  maxHours: number;
  color: string;
  badgeBg: string;
  borderColor: string;
}

const SCRIBE_RANKS: ScribeRank[] = [
  {
    tier: 1,
    title: "Novice Copyist",
    minHours: 0,
    maxHours: 5,
    color: "text-amber-300",
    badgeBg: "bg-[#2b180f]",
    borderColor: "border-[#6e3d1d]",
  },
  {
    tier: 2,
    title: "Citadel Scribe",
    minHours: 5,
    maxHours: 20,
    color: "text-emerald-300",
    badgeBg: "bg-[#0f291e]",
    borderColor: "border-[#10b981]",
  },
  {
    tier: 3,
    title: "Master Archivist",
    minHours: 20,
    maxHours: 50,
    color: "text-sky-300",
    badgeBg: "bg-[#0f2438]",
    borderColor: "border-[#0284c7]",
  },
  {
    tier: 4,
    title: "Grand Patriarch of the Infinite Library",
    minHours: 50,
    maxHours: 9999,
    color: "text-purple-300",
    badgeBg: "bg-[#290f38]",
    borderColor: "border-[#c084fc]",
  },
];

function getScribeRank(totalHours: number): {
  current: ScribeRank;
  next: ScribeRank | null;
  progressPct: number;
  hoursToNext: number;
} {
  const current =
    [...SCRIBE_RANKS].reverse().find((r) => totalHours >= r.minHours) || SCRIBE_RANKS[0];
  const currentIndex = SCRIBE_RANKS.findIndex((r) => r.tier === current.tier);
  const next = currentIndex < SCRIBE_RANKS.length - 1 ? SCRIBE_RANKS[currentIndex + 1] : null;

  if (!next) {
    return { current, next: null, progressPct: 100, hoursToNext: 0 };
  }

  const span = next.minHours - current.minHours;
  const earnedInTier = totalHours - current.minHours;
  const progressPct = Math.min(100, Math.max(0, Math.round((earnedInTier / span) * 100)));
  const hoursToNext = Math.max(0, parseFloat((next.minHours - totalHours).toFixed(1)));

  return { current, next, progressPct, hoursToNext };
}

/* =====================================================================
   2. STAT-TIED COLOR PALETTES FOR LEATHER BINDINGS & SILK RIBBONS
   ===================================================================== */
export function getStatTomeColor(stat: StatBonusType) {
  switch (stat) {
    case "INTELLIGENCE":
      return {
        bg: "bg-[#1e3a8a]",
        border: "border-[#172554]",
        highlight: "#60a5fa",
        ribbon: "#38bdf8",
        badgeBg: "bg-[#decaa3] text-[#1e3a8a] border-[#5c280b]",
        label: "+INT (Intelligence & Lore)",
        shortLabel: "INT",
        dotColor: "#38bdf8",
      };
    case "STRENGTH":
      return {
        bg: "bg-[#991b1b]",
        border: "border-[#450a0a]",
        highlight: "#f87171",
        ribbon: "#ef4444",
        badgeBg: "bg-[#decaa3] text-[#991b1b] border-[#5c280b]",
        label: "+STR (Strength & Discipline)",
        shortLabel: "STR",
        dotColor: "#ef4444",
      };
    case "PERCEPTION":
      return {
        bg: "bg-[#581c87]",
        border: "border-[#2e1065]",
        highlight: "#c084fc",
        ribbon: "#a855f7",
        badgeBg: "bg-[#decaa3] text-[#581c87] border-[#5c280b]",
        label: "+PER (Perception & Focus)",
        shortLabel: "PER",
        dotColor: "#a855f7",
      };
    case "AGILITY":
      return {
        bg: "bg-[#064e3b]",
        border: "border-[#022c22]",
        highlight: "#34d399",
        ribbon: "#10b981",
        badgeBg: "bg-[#decaa3] text-[#064e3b] border-[#5c280b]",
        label: "+AGI (Agility & Flow)",
        shortLabel: "AGI",
        dotColor: "#10b981",
      };
    case "VITALITY":
      return {
        bg: "bg-[#78350f]",
        border: "border-[#451a03]",
        highlight: "#fbbf24",
        ribbon: "#f59e0b",
        badgeBg: "bg-[#decaa3] text-[#78350f] border-[#5c280b]",
        label: "+VIT (Vitality & Endurance)",
        shortLabel: "VIT",
        dotColor: "#f59e0b",
      };
    case "CREATIVITY":
    default:
      return {
        bg: "bg-[#881337]",
        border: "border-[#4c0519]",
        highlight: "#fb7185",
        ribbon: "#f43f5e",
        badgeBg: "bg-[#decaa3] text-[#881337] border-[#5c280b]",
        label: "+CRE (Creativity & Artistry)",
        shortLabel: "CRE",
        dotColor: "#f43f5e",
      };
  }
}

/* =====================================================================
   3. 1:1 PIXEL-PERFECT BOOK SPINE COMPONENT (RETRO PIXEL TEXTURE)
   ===================================================================== */
function PixelAntiqueBookSpine({
  tome,
  isSelected,
  onClick,
}: {
  tome: CustomStudyTome;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const statPalette = getStatTomeColor(tome.statBonus);
  const dimensions = getTomeDimensions(tome.targetMinutes || 25);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col justify-between items-center transition-transform duration-150 cursor-pointer select-none group shrink-0 outline-none",
        isSelected
          ? "-translate-y-2 ring-2 ring-black outline outline-2 outline-[#fde047] shadow-[0_6px_0_0_#000] z-20"
          : "hover:-translate-y-1 hover:brightness-110 active:translate-y-0"
      )}
      style={{
        height: `${dimensions.height}px`,
        width: `${dimensions.width}px`,
      }}
      title={`${tome.title} (${statPalette.label} • ${dimensions.volumeLabel} • ${tome.targetMinutes || 25}m) • ${tome.totalMinutesStudied}m studied`}
    >
      {/* Top Leather Cap Border (Pixelated 2px Block) */}
      <div className={cn("w-full h-2 border-2 border-black border-b-0 relative shrink-0", statPalette.bg)}>
        {/* Top Pixel Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/30" />
        <div className="absolute right-0 inset-y-0 w-[2px] bg-black/40" />
      </div>

      {/* Main Spine Leather Body with Authentic Pixel Texture & Stepped Volume */}
      <div
        className={cn(
          "w-full flex-1 border-x-2 border-black flex flex-col justify-between items-center relative overflow-hidden",
          statPalette.bg
        )}
      >
        {/* Layer 1: Pixel Dither Grid (Checkerboard 2x2 Texture) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)`,
            backgroundSize: "4px 4px",
            imageRendering: "pixelated",
          }}
        />

        {/* Layer 2: Horizontal Pixel Scanline Texture (2px steps) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `repeating-linear-gradient(180deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 4px)`,
            imageRendering: "pixelated",
          }}
        />

        {/* Layer 3: Stepped 5-Zone Pixel Cylinder Highlight & Shadow Columns */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/35 pointer-events-none" />
        <div className="absolute left-[2px] top-0 bottom-0 w-[2px] bg-white/15 pointer-events-none" />
        <div className="absolute right-[3px] top-0 bottom-0 w-[2px] bg-black/30 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-black/55 pointer-events-none" />

        {/* Top Pixel Headband Stitch Bar */}
        <div
          className="w-full h-[3px] border-b border-black/80 shrink-0 relative z-10"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 2px, #2a1205 2px, #2a1205 4px)`,
            imageRendering: "pixelated",
          }}
        />

        {/* Top Chunky Embossed Gold Pixel Ribs */}
        <div className="w-full flex flex-col items-center px-1 my-1 relative z-10 shrink-0">
          <div className="w-full h-[1px] bg-[#fef08a]" />
          <div className="w-full h-[2px] bg-[#f59e0b]" />
          <div className="w-full h-[1px] bg-[#451a03]" />
        </div>

        {/* Center Stage: Authentic 100% Pixel Art Gold Sigils */}
        <div className="flex flex-col items-center justify-center my-auto relative z-10 px-0.5">
          {tome.sigilType === "ARCH" && (
            <svg
              viewBox="0 0 12 16"
              fill="none"
              className="w-3.5 h-4.5 drop-shadow-[0_1px_0_#000]"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              <rect x="4" y="1" width="4" height="2" fill="#FEF08A" />
              <rect x="2" y="3" width="2" height="2" fill="#F59E0B" />
              <rect x="8" y="3" width="2" height="2" fill="#F59E0B" />
              <rect x="2" y="5" width="2" height="8" fill="#D97706" />
              <rect x="8" y="5" width="2" height="8" fill="#D97706" />
              <rect x="4" y="13" width="4" height="2" fill="#78350F" />
              <rect x="5" y="6" width="2" height="4" fill="#FEF08A" />
              <rect x="5" y="7" width="2" height="2" fill="#000000" />
            </svg>
          )}

          {tome.sigilType === "ALCHEMY" && (
            <svg
              viewBox="0 0 12 16"
              fill="none"
              className="w-3.5 h-4.5 drop-shadow-[0_1px_0_#000]"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              <rect x="5" y="1" width="2" height="2" fill="#FEF08A" />
              <rect x="4" y="3" width="4" height="1" fill="#F59E0B" />
              <rect x="3" y="4" width="2" height="2" fill="#F59E0B" />
              <rect x="7" y="4" width="2" height="2" fill="#F59E0B" />
              <rect x="2" y="6" width="2" height="3" fill="#D97706" />
              <rect x="8" y="6" width="2" height="3" fill="#D97706" />
              <rect x="2" y="9" width="8" height="2" fill="#FEF08A" />
              <rect x="5" y="3" width="2" height="10" fill="#FDE047" />
              <rect x="3" y="13" width="6" height="2" fill="#78350F" />
            </svg>
          )}

          {tome.sigilType === "TREE" && (
            <svg
              viewBox="0 0 12 16"
              fill="none"
              className="w-3.5 h-4.5 drop-shadow-[0_1px_0_#000]"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              <rect x="5" y="1" width="2" height="12" fill="#FEF08A" />
              <rect x="3" y="2" width="2" height="2" fill="#F59E0B" />
              <rect x="7" y="2" width="2" height="2" fill="#F59E0B" />
              <rect x="2" y="4" width="2" height="2" fill="#D97706" />
              <rect x="8" y="4" width="2" height="2" fill="#D97706" />
              <rect x="1" y="6" width="2" height="2" fill="#F59E0B" />
              <rect x="9" y="6" width="2" height="2" fill="#F59E0B" />
              <rect x="2" y="8" width="3" height="2" fill="#D97706" />
              <rect x="7" y="8" width="3" height="2" fill="#D97706" />
              <rect x="3" y="13" width="6" height="2" fill="#78350F" />
            </svg>
          )}

          {tome.sigilType === "KEY" && (
            <svg
              viewBox="0 0 12 16"
              fill="none"
              className="w-3.5 h-4.5 drop-shadow-[0_1px_0_#000]"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              <rect x="4" y="2" width="4" height="4" fill="#FEF08A" />
              <rect x="5" y="3" width="2" height="2" fill="#000000" />
              <rect x="5" y="6" width="2" height="8" fill="#F59E0B" />
              <rect x="7" y="9" width="2" height="2" fill="#FDE047" />
              <rect x="7" y="12" width="3" height="2" fill="#FDE047" />
            </svg>
          )}

          {tome.sigilType === "EYE" && (
            <svg
              viewBox="0 0 12 16"
              fill="none"
              className="w-3.5 h-4.5 drop-shadow-[0_1px_0_#000]"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              <rect x="4" y="4" width="4" height="1" fill="#FEF08A" />
              <rect x="2" y="5" width="2" height="2" fill="#F59E0B" />
              <rect x="8" y="5" width="2" height="2" fill="#F59E0B" />
              <rect x="1" y="7" width="2" height="2" fill="#D97706" />
              <rect x="9" y="7" width="2" height="2" fill="#D97706" />
              <rect x="2" y="9" width="2" height="2" fill="#F59E0B" />
              <rect x="8" y="9" width="2" height="2" fill="#F59E0B" />
              <rect x="4" y="11" width="4" height="1" fill="#78350F" />
              <rect x="4" y="6" width="4" height="4" fill="#FEF08A" />
              <rect x="5" y="7" width="2" height="2" fill="#000000" />
            </svg>
          )}

          {tome.sigilType === "GLYPH" && (
            <svg
              viewBox="0 0 12 16"
              fill="none"
              className="w-3.5 h-4.5 drop-shadow-[0_1px_0_#000]"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              <rect x="2" y="2" width="8" height="2" fill="#FEF08A" />
              <rect x="2" y="4" width="2" height="8" fill="#F59E0B" />
              <rect x="8" y="4" width="2" height="8" fill="#F59E0B" />
              <rect x="4" y="7" width="4" height="2" fill="#FDE047" />
              <rect x="2" y="12" width="8" height="2" fill="#78350F" />
            </svg>
          )}

          {tome.sigilType === "CROSS" && (
            <svg
              viewBox="0 0 12 16"
              fill="none"
              className="w-3.5 h-4.5 drop-shadow-[0_1px_0_#000]"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              <rect x="5" y="2" width="2" height="12" fill="#FEF08A" />
              <rect x="2" y="5" width="8" height="2" fill="#FEF08A" />
              <rect x="3" y="3" width="2" height="2" fill="#F59E0B" />
              <rect x="7" y="3" width="2" height="2" fill="#F59E0B" />
              <rect x="5" y="5" width="2" height="2" fill="#D97706" />
              <rect x="4" y="13" width="4" height="1" fill="#78350F" />
            </svg>
          )}

          {tome.sigilType === "FILIGREE" && (
            <svg
              viewBox="0 0 12 16"
              fill="none"
              className="w-3.5 h-4.5 drop-shadow-[0_1px_0_#000]"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            >
              <rect x="5" y="2" width="2" height="2" fill="#FEF08A" />
              <rect x="3" y="4" width="2" height="2" fill="#F59E0B" />
              <rect x="7" y="4" width="2" height="2" fill="#F59E0B" />
              <rect x="1" y="6" width="2" height="4" fill="#D97706" />
              <rect x="9" y="6" width="2" height="4" fill="#D97706" />
              <rect x="3" y="10" width="2" height="2" fill="#F59E0B" />
              <rect x="7" y="10" width="2" height="2" fill="#F59E0B" />
              <rect x="5" y="12" width="2" height="2" fill="#78350F" />
              <rect x="5" y="7" width="2" height="2" fill="#FEF08A" />
            </svg>
          )}
        </div>

        {/* Bottom Chunky Embossed Gold Pixel Ribs */}
        <div className="w-full flex flex-col items-center px-1 my-1 relative z-10 shrink-0">
          <div className="w-full h-[1px] bg-[#fef08a]" />
          <div className="w-full h-[2px] bg-[#f59e0b]" />
          <div className="w-full h-[1px] bg-[#451a03]" />
        </div>

        {/* Bottom Pixel Headband Stitch Bar */}
        <div
          className="w-full h-[3px] border-t border-black/80 shrink-0 relative z-10"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 2px, #2a1205 2px, #2a1205 4px)`,
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* Bottom Leather Heel Cap */}
      <div className={cn("w-full h-2 border-2 border-black border-t-0 relative shrink-0", statPalette.bg)}>
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-black/60" />
        <div className="absolute right-0 inset-y-0 w-[2px] bg-black/40" />
      </div>

      {/* Hanging Pixel Silk Ribbon Bookmark (Stepped V-Cut with 1px Highlight) */}
      <div
        className="w-2.5 h-3.5 -mt-[1px] relative z-20 shrink-0 border-x border-black shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
        style={{
          backgroundColor: statPalette.ribbon,
          clipPath: `polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%)`,
        }}
      >
        <div className="absolute left-0 inset-y-0 w-[1px] bg-white/40 pointer-events-none" />
      </div>
    </button>
  );
}

/* =====================================================================
   4. INSCRIBE / EDIT STUDY TOME MODAL
   ===================================================================== */
function TomeModal({
  isOpen,
  onClose,
  initialTome,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialTome?: CustomStudyTome | null;
}) {
  const { addCustomTome, updateCustomTome } = useLearningStore();

  const [title, setTitle] = useState(initialTome?.title || "");
  const [statBonus, setStatBonus] = useState<StatBonusType>(initialTome?.statBonus || "INTELLIGENCE");
  const [sigilType, setSigilType] = useState<SigilArchetype>(initialTome?.sigilType || "KEY");
  const [category, setCategory] = useState<FocusCategory>(initialTome?.category || "STUDY");
  const [targetMinutes, setTargetMinutes] = useState<number>(initialTome?.targetMinutes || 25);
  const [notes, setNotes] = useState(initialTome?.notes || "");

  if (!isOpen) return null;

  const statList: { type: StatBonusType; label: string; desc: string }[] = [
    { type: "INTELLIGENCE", label: "Intelligence", desc: "Logic, Code, Philosophy" },
    { type: "STRENGTH", label: "Strength", desc: "Iron Discipline, Hard Tasks" },
    { type: "PERCEPTION", label: "Perception", desc: "Research, Reading, Awareness" },
    { type: "AGILITY", label: "Agility", desc: "Speed, Flow, Quick Problem Solving" },
    { type: "VITALITY", label: "Vitality", desc: "Endurance, Daily Consistency" },
    { type: "CREATIVITY", label: "Creativity", desc: "Design, Writing, Arcane Art" },
  ];

  const sigils: SigilArchetype[] = ["KEY", "ARCH", "ALCHEMY", "TREE", "EYE", "GLYPH", "CROSS", "FILIGREE"];
  const categories: FocusCategory[] = ["STUDY", "CODING", "READING", "WORK", "CREATIVE", "GENERAL"];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (initialTome) {
      updateCustomTome(initialTome.id, {
        title: title.trim(),
        statBonus,
        sigilType,
        category,
        targetMinutes,
        notes: notes.trim(),
      });
    } else {
      addCustomTome({
        title: title.trim(),
        statBonus,
        sigilType,
        category,
        targetMinutes,
        notes: notes.trim(),
      });
    }
    onClose();
  };

  const previewDimensions = getTomeDimensions(targetMinutes);
  const previewTome: CustomStudyTome = {
    id: "preview",
    title: title.trim() || "Preview Tome",
    statBonus,
    sigilType,
    category,
    height: previewDimensions.height,
    width: previewDimensions.width,
    targetMinutes,
    totalMinutesStudied: 0,
    totalSessionsCompleted: 0,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#2a1309] border-4 border-[#140804] text-slate-100 p-5 sm:p-6 w-full max-w-xl shadow-[0_16px_32px_rgba(0,0,0,0.9)] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#542d17] pb-3">
          <div className="flex items-center gap-2">
            <PixelScrollIcon className="w-5 h-5 text-amber-400" />
            <h3 className="font-pixel text-base sm:text-lg font-bold text-[#fef08a] uppercase tracking-wider">
              {initialTome ? "Modify Inscribed Tome" : "Inscribe New Study Tome"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#3d1d0c] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <PixelCloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Live Book Spine Preview */}
          <div className="p-3 bg-[#121626] border-2 border-[#2b121e] flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-pixel text-[#f59e0b] uppercase font-bold">
                Tome Spine Preview ({previewDimensions.volumeLabel} • {targetMinutes}m)
              </span>
              <span className="text-xs text-slate-300 font-sans">
                Leather binding reflects stat; thickness ({previewDimensions.width}px) and height ({previewDimensions.height}px) scale with session duration.
              </span>
            </div>
            <div className="flex items-end justify-center h-32 pr-4">
              <PixelAntiqueBookSpine tome={previewTome} isSelected={true} />
            </div>
          </div>

          {/* Tome Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-pixel font-bold text-[#fbbf24] uppercase block">
              Tome Title / Subject *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Calculus & Proofs"
              required
              className="w-full px-3 py-2 bg-[#120703] border-2 border-[#542d17] text-white text-sm font-sans focus:outline-none focus:border-[#f59e0b] placeholder-slate-500"
            />
          </div>

          {/* Stat to Enhance (Color-Coded) */}
          <div className="space-y-1.5">
            <label className="text-xs font-pixel font-bold text-[#fbbf24] uppercase block">
              Primary Stat to Enhance (Determines Leather Color)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {statList.map((st) => {
                const palette = getStatTomeColor(st.type);
                const isSelected = statBonus === st.type;
                return (
                  <button
                    key={st.type}
                    type="button"
                    onClick={() => {
                      playUIMenuSFX("confirm");
                      setStatBonus(st.type);
                    }}
                    className={cn(
                      "p-2 text-left border-2 transition-all cursor-pointer flex flex-col justify-between",
                      isSelected
                        ? "border-[#fde047] ring-1 ring-[#fde047] bg-[#3a1b0b]"
                        : "border-[#45200c] bg-[#1a0c05] hover:bg-[#281308]"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0 border border-black"
                        style={{ backgroundColor: palette.dotColor }}
                      />
                      <span className="font-pixel text-xs font-bold text-slate-200">
                        {st.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans mt-0.5">{st.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sigil Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-pixel font-bold text-[#fbbf24] uppercase block">
              Arcane Gold Sigil
            </label>
            <div className="flex flex-wrap gap-2">
              {sigils.map((sig) => (
                <button
                  key={sig}
                  type="button"
                  onClick={() => {
                    playUIMenuSFX("confirm");
                    setSigilType(sig);
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-pixel font-bold border-2 transition-all cursor-pointer",
                    sigilType === sig
                      ? "bg-[#f59e0b] text-[#1a0c05] border-[#fde047]"
                      : "bg-[#180a04] text-slate-300 border-[#45200c] hover:border-[#f59e0b]"
                  )}
                >
                  {sig}
                </button>
              ))}
            </div>
          </div>

          {/* Domain Category & Target Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-pixel font-bold text-[#fbbf24] uppercase block">
                Domain Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FocusCategory)}
                className="w-full px-3 py-2 bg-[#120703] border-2 border-[#542d17] text-white text-sm font-sans focus:outline-none focus:border-[#f59e0b]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-pixel font-bold text-[#fbbf24] uppercase block">
                Target Session Rite (Minutes)
              </label>
              <div className="flex items-center gap-2">
                {[15, 25, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTargetMinutes(mins)}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-mono font-bold border transition-colors cursor-pointer",
                      targetMinutes === mins
                        ? "bg-[#d97706] text-black border-[#fde047]"
                        : "bg-[#120703] text-slate-300 border-[#542d17] hover:bg-[#281308]"
                    )}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes / Objectives */}
          <div className="space-y-1.5">
            <label className="text-xs font-pixel font-bold text-[#fbbf24] uppercase block">
              Study Objectives / Inscription Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key concepts, chapters, or syllabus goals to record..."
              rows={2}
              className="w-full px-3 py-2 bg-[#120703] border-2 border-[#542d17] text-white text-sm font-sans focus:outline-none focus:border-[#f59e0b] placeholder-slate-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#542d17]">
            <PixelButton
              type="button"
              variant="dark"
              size="md"
              onClick={onClose}
              className="px-4 cursor-pointer"
            >
              Cancel
            </PixelButton>
            <PixelButton
              type="submit"
              variant="gold"
              size="md"
              className="px-6 font-pixel font-bold cursor-pointer"
            >
              {initialTome ? "Save Modifications" : "Inscribe Tome"}
            </PixelButton>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================================================
   5. MAIN SCRIPTORIUM BOOKSHELF & PROGRESSION LEDGER
   ===================================================================== */
export const FocusStatistics: React.FC<{ className?: string }> = ({ className = "" }) => {
  const {
    focusSessions,
    customTomes,
    selectedTomeId,
    setSelectedTomeId,
    deleteCustomTome,
    startStudyOnTome,
    getTotalFocusMinutes,
  } = useLearningStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTome, setEditingTome] = useState<CustomStudyTome | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const selectedTome = customTomes.find((t) => t.id === selectedTomeId) || customTomes[0] || null;

  const totalMinutes = getTotalFocusMinutes();
  const totalHoursNum = parseFloat((totalMinutes / 60).toFixed(1));
  const rankData = getScribeRank(totalHoursNum);

  // Group focus minutes by category
  const catCounts: Partial<Record<FocusCategory, number>> = {};
  focusSessions.forEach((s) => {
    catCounts[s.category] = (catCounts[s.category] || 0) + s.durationMinutes;
  });

  const totalMins = Object.values(catCounts).reduce((acc, n) => acc + n, 0);

  // Divide custom tomes across Shelf 1 and Shelf 2
  const halfCount = Math.ceil(customTomes.length / 2);
  const shelf1Tomes = customTomes.slice(0, halfCount);
  const shelf2Tomes = customTomes.slice(halfCount);

  return (
    <div
      className={cn(
        "rounded-none bg-[#1d0e07] border-4 border-[#140804] p-5 sm:p-6 shadow-[0_8px_16px_rgba(0,0,0,0.85)] space-y-5 text-slate-100 select-none relative overflow-hidden",
        className
      )}
    >
      {/* 4 Beveled Gold Corner Brackets */}
      <div className="absolute top-1 left-1 w-5 h-5 border-t-2 border-l-2 border-[#f59e0b] pointer-events-none" />
      <div className="absolute top-1 right-1 w-5 h-5 border-t-2 border-r-2 border-[#f59e0b] pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-5 h-5 border-b-2 border-l-2 border-[#f59e0b] pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-5 h-5 border-b-2 border-r-2 border-[#f59e0b] pointer-events-none" />

      {/* Header: Centered Scriptorium Shelf Title & Action Row */}
      <div className="flex flex-col items-center justify-center gap-3 border-b border-[#542d17]/80 pb-3.5 relative z-10">
        {/* Centered Title */}
        <h2 className="text-sm sm:text-base font-pixel font-bold text-[#fef08a] uppercase tracking-wider text-center">
          The Grand Bookshelf of Mastery
        </h2>

        {/* Dedicated Action & Rank Crest Row */}
        <div className="flex items-center justify-center gap-3 flex-wrap w-full">
          {/* Inscribe New Tome Button */}
          <button
            type="button"
            onClick={() => {
              playUIMenuSFX("confirm");
              setEditingTome(null);
              setIsModalOpen(true);
            }}
            className="h-8 sm:h-9 px-3.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1a0c05] border-2 border-[#fde047] font-pixel text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_0_#000] active:translate-y-0.5 whitespace-nowrap shrink-0"
          >
            <PixelPlusIcon className="w-4 h-4 text-black shrink-0" />
            <span className="whitespace-nowrap">Inscribe Tome</span>
          </button>

          {/* Heraldic Scribe Rank Crest Badge */}
          <div
            className={cn(
              "h-8 sm:h-9 px-3 border-2 text-xs font-pixel font-bold flex items-center gap-2 shadow-[0_2px_0_0_#000] shrink-0",
              rankData.current.badgeBg,
              rankData.current.borderColor,
              rankData.current.color
            )}
          >
            <PixelAwardIcon className="w-4 h-4 text-[#f59e0b] shrink-0" />
            <span className="whitespace-nowrap">{rankData.current.title}</span>
          </div>
        </div>
      </div>

      {/* Scribe Rank Progression Bar */}
      <div className="p-3.5 bg-[#110703] border-2 border-[#42200f] space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-pixel">
          <span className="text-slate-200 font-bold flex items-center gap-2">
            <PixelShieldIcon className="w-4 h-4 text-[#f59e0b]" />
            Tier {rankData.current.tier} Progression
          </span>
          <span className="text-[#fef08a] font-mono font-bold tabular-nums">
            <NumberTicker value={totalHoursNum} /> hrs inscribed
          </span>
        </div>

        <PixelProgress value={rankData.progressPct} max={100} variant="gold" height="sm" />

        <div className="flex items-center justify-between text-xs font-sans font-semibold text-slate-300">
          <span>{rankData.current.title}</span>
          <span className="text-[#fde047]">
            {rankData.next
              ? `${rankData.hoursToNext}h to ${rankData.next.title}`
              : "✦ Maximum Scriptorium Mastery Reached ✦"}
          </span>
        </div>
      </div>

      {/* =========================================================
          THE GRAND ANTIQUE MAHOGANY BOOKSHELF (DYNAMIC QUANTITY)
          ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-pixel font-bold text-[#fbbf24] uppercase tracking-wider flex items-center gap-2">
            <PixelBookIcon className="w-4 h-4 text-[#f59e0b]" />
            Inscribed Study Tomes on Shelf ({customTomes.length})
          </span>
          <span className="text-xs font-sans font-semibold text-slate-300">
            Click tome to inspect & begin rite
          </span>
        </div>

        {/* Double-Bay Library Bookshelf Cabinet Structure */}
        <div className="bg-[#121626] border-4 border-[#2b121e] p-3 sm:p-4 shadow-[inset_0_0_32px_rgba(0,0,0,0.95)] space-y-4 relative">
          {customTomes.length === 0 ? (
            /* Empty Bookshelf State */
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
              <PixelFlameIcon className="w-8 h-8 text-amber-400/80" />
              <p className="font-pixel text-sm text-[#fef08a] font-bold">
                The Scriptorium Shelves are Empty
              </p>
              <p className="font-sans text-xs text-slate-300 max-w-sm">
                Inscribe your first custom study subject or topic. Each tome tracks its own focus time and enhances specific RPG stats.
              </p>
              <PixelButton
                variant="gold"
                size="md"
                onClick={() => {
                  setEditingTome(null);
                  setIsModalOpen(true);
                }}
                className="font-pixel font-bold"
              >
                + Inscribe First Tome
              </PixelButton>
            </div>
          ) : (
            <>
              {/* Shelf Tier 1 (Top Shelf) */}
              <div className="relative">
                <div className="flex items-end justify-start min-h-[124px] px-2 overflow-x-auto pb-1 gap-2">
                  {shelf1Tomes.map((tome) => (
                    <PixelAntiqueBookSpine
                      key={tome.id}
                      tome={tome}
                      isSelected={selectedTome?.id === tome.id}
                      onClick={() => {
                        playUIMenuSFX("confirm");
                        setSelectedTomeId(tome.id);
                      }}
                    />
                  ))}

                  {/* Add Tome Slot Placeholder */}
                  <button
                    type="button"
                    onClick={() => {
                      playUIMenuSFX("confirm");
                      setEditingTome(null);
                      setIsModalOpen(true);
                    }}
                    className="h-24 w-10 border-2 border-dashed border-[#542d17] hover:border-[#f59e0b] bg-[#120703]/60 flex flex-col items-center justify-center text-[#92400e] hover:text-[#f59e0b] transition-all cursor-pointer shrink-0 group"
                    title="Inscribe New Tome onto Shelf"
                  >
                    <PixelPlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform text-[#92400e] group-hover:text-[#f59e0b]" />
                    <span className="text-[9px] font-pixel mt-1">ADD</span>
                  </button>
                </div>

                {/* Heavy Carved Mahogany Shelf Board */}
                <div className="h-4.5 w-full bg-[#432132] border-t-2 border-[#6d3751] border-b-2 border-[#1c0d15] shadow-[0_6px_12px_rgba(0,0,0,0.9)] flex items-center justify-between px-3">
                  <div className="w-3 h-1.5 bg-[#8b4366]/40" />
                  <div className="w-3 h-1.5 bg-[#8b4366]/40" />
                </div>
              </div>

              {/* Shelf Tier 2 (Bottom Shelf - renders if more than 3 tomes) */}
              {shelf2Tomes.length > 0 && (
                <div className="relative pt-1">
                  <div className="flex items-end justify-start min-h-[124px] px-2 overflow-x-auto pb-1 gap-2">
                    {shelf2Tomes.map((tome) => (
                      <PixelAntiqueBookSpine
                        key={tome.id}
                        tome={tome}
                        isSelected={selectedTome?.id === tome.id}
                        onClick={() => {
                          playUIMenuSFX("confirm");
                          setSelectedTomeId(tome.id);
                        }}
                      />
                    ))}
                  </div>

                  {/* Heavy Carved Mahogany Shelf Board */}
                  <div className="h-4.5 w-full bg-[#432132] border-t-2 border-[#6d3751] border-b-2 border-[#1c0d15] shadow-[0_6px_12px_rgba(0,0,0,0.9)] flex items-center justify-between px-3">
                    <div className="w-3 h-1.5 bg-[#8b4366]/40" />
                    <div className="w-3 h-1.5 bg-[#8b4366]/40" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* =========================================================
          SELECTED TOME FOLIO INSPECTOR & ACTIONS CARD (ANCIENT PARCHMENT)
          ========================================================= */}
      {selectedTome && (
        <PixelAgedParchment
          variant="folio"
          showTornEdges={true}
          showWaterRing={true}
          showCreases={true}
          showInkSpill={true}
          className="space-y-3.5 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Tome Title & Stat Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#5c2b10]/40 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 bg-[#854d0e] border border-[#3a1a05] shadow-[0_1px_1px_rgba(0,0,0,0.5)] shrink-0" />
              <div>
                <h3 className="font-pixel text-sm sm:text-base font-bold text-[#231006] uppercase tracking-wide drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                  {selectedTome.title}
                </h3>
                <span className="text-xs font-sans font-bold text-[#5c2d12]">
                  Domain: {selectedTome.category} • Target: {selectedTome.targetMinutes}m/session
                </span>
              </div>
            </div>

            {/* Medieval Archival Wax Seal Stat Stamp */}
            <div className="flex items-center gap-2 px-3 py-1 bg-[#decaa3] border-2 border-[#5c280b] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_1px_0_rgba(255,255,255,0.4)] text-[#2d1204] font-pixel text-xs font-bold shrink-0">
              <span
                className="w-2.5 h-2.5 border border-black/80 shadow-[0_1px_1px_rgba(0,0,0,0.4)] shrink-0"
                style={{ backgroundColor: getStatTomeColor(selectedTome.statBonus).ribbon }}
              />
              <span className="text-[#2d1204] font-pixel text-xs drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                {getStatTomeColor(selectedTome.statBonus).label}
              </span>
            </div>
          </div>

          {/* Tome Telemetry Metrics (Vellum Pressed Panels) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs sm:text-sm font-pixel">
            <div className="p-2.5 bg-[#decaa3]/75 border-2 border-[#6d3714]/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]">
              <span className="text-xs text-[#5c2d12] block font-bold">Total Studied</span>
              <span className="font-bold text-[#231006] text-sm font-mono drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
                {selectedTome.totalMinutesStudied} mins
              </span>
            </div>

            <div className="p-2.5 bg-[#decaa3]/75 border-2 border-[#6d3714]/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]">
              <span className="text-xs text-[#5c2d12] block font-bold">Rites Completed</span>
              <span className="font-bold text-[#231006] text-sm font-mono drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
                {selectedTome.totalSessionsCompleted} Sessions
              </span>
            </div>

            <div className="p-2.5 bg-[#decaa3]/75 border-2 border-[#6d3714]/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)] col-span-2 sm:col-span-1">
              <span className="text-xs text-[#5c2d12] block font-bold">Sigil & Binding</span>
              <span className="font-bold text-[#231006] text-xs">
                {selectedTome.sigilType} • {selectedTome.statBonus.slice(0, 3)}
              </span>
            </div>
          </div>

          {/* Notes if present */}
          {selectedTome.notes && (
            <div className="p-2.5 bg-[#decaa3]/85 border-2 border-[#6d3714]/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] text-xs font-sans text-[#2d1206]">
              <span className="font-pixel text-[11px] text-[#5c2d12] uppercase font-bold block mb-0.5">
                Scribe Syllabus Notes:
              </span>
              <p className="italic font-medium">{selectedTome.notes}</p>
            </div>
          )}

          {/* Actions: Begin Rite, Edit, Delete */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t-2 border-[#5c2b10]/40">
            {/* Main Action: Begin Focus Session on Tome */}
            <PixelButton
              variant="gold"
              size="md"
              onClick={() => {
                startStudyOnTome(selectedTome.id);
                // Scroll up smoothly to the Pomodoro altar
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex-1 min-w-[190px] font-pixel font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            >
              <PixelPlayIcon className="w-4 h-4 fill-current" />
              Begin Focus Rite on this Tome
            </PixelButton>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => {
                playUIMenuSFX("confirm");
                setEditingTome(selectedTome);
                setIsModalOpen(true);
              }}
              className="h-10 px-3.5 bg-[#dfca9f] hover:bg-[#cca876] text-[#2c1407] border-2 border-[#6d3714] font-pixel text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
              title="Edit Tome Details"
            >
              <PixelPencilIcon className="w-3.5 h-3.5 text-[#5c2b10]" />
              <span>Edit</span>
            </button>

            {/* Delete Button */}
            {showDeleteConfirm === selectedTome.id ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    deleteCustomTome(selectedTome.id);
                    setShowDeleteConfirm(null);
                  }}
                  className="h-10 px-3 bg-[#991b1b] text-white border-2 border-[#450a0a] font-pixel text-[11px] font-bold cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="h-10 px-2.5 bg-[#dfca9f] text-[#2c1407] border-2 border-[#6d3714] font-pixel text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(selectedTome.id)}
                className="h-10 px-3 bg-[#dfca9f] hover:bg-[#fca5a5] text-[#991b1b] border-2 border-[#6d3714] font-pixel text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.3)] group"
                title="Remove Tome from Shelf"
              >
                <PixelTrashIcon className="w-3.5 h-3.5 text-[#991b1b] group-hover:text-[#ef4444]" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </PixelAgedParchment>
      )}

      {/* =========================================================
          DOMAIN MASTERY LEDGER (CATEGORY PROGRESS BARS)
          ========================================================= */}
      <div className="space-y-3 pt-3 border-t border-[#542d17]/80">
        <span className="text-xs sm:text-sm font-pixel font-bold text-[#fbbf24] uppercase tracking-wider block">
          Domain Mastery Ledger
        </span>

        <div className="space-y-3">
          {Object.entries(catCounts).length === 0 ? (
            <p className="text-xs sm:text-sm font-sans text-slate-300 italic">
              No focus sessions inscribed in this ledger yet.
            </p>
          ) : (
            Object.entries(catCounts).map(([cat, mins]) => {
              const pct = totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-pixel">
                    <span className="text-slate-100 font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#f59e0b] border border-[#120703]" />
                      {cat}
                    </span>
                    <span className="text-[#fef08a] font-bold tabular-nums font-mono">
                      {mins} mins ({pct}%)
                    </span>
                  </div>
                  <PixelProgress value={pct} max={100} variant="gold" height="sm" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Inscribe / Edit Tome Modal */}
      <TomeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTome(null);
        }}
        initialTome={editingTome}
      />
    </div>
  );
};

export default FocusStatistics;
