"use client";

import React, { useState, useEffect } from "react";
import {
  PixelBrainIcon,
  PixelScrollIcon,
  PixelCrossedSwordsIcon,
  PixelQuillIcon,
  PixelBookIcon,
  PixelChevronLeftIcon,
  PixelChevronRightIcon,
  PixelRefreshIcon,
  PixelCheckSquareIcon,
  PixelSparklesIcon,
  PixelPlusIcon,
  PixelTrashIcon,
  PixelCloseIcon,
} from "@/components/ui/pixel/PixelIcons";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { PixelAgedParchment } from "@/components/ui/pixel/PixelAgedParchment";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { useCharacterStore } from "@/store/useCharacterStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* =====================================================================
   1. TYPES & DEFAULT ANCIENT GRIMOIRE TOMES
   ===================================================================== */
export interface Flashcard {
  id: string;
  topic: string;
  front: string;
  back: string;
  deck: string; // e.g. "NEUROSCIENCE", "SPACED_REP", "WILLPOWER", "CUSTOM"
  statReward: string;
  isCustom?: boolean;
}

interface TomeDeck {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badgeColor: string;
}

const TOMES: TomeDeck[] = [
  {
    id: "NEUROSCIENCE",
    title: "Neuroscience of Flow",
    icon: PixelBrainIcon,
    description: "Cortical circuits, acetylcholine spotlights, and dopamine dynamics.",
    badgeColor: "bg-[#1e3a8a] text-[#93c5fd] border-[#3b82f6]",
  },
  {
    id: "SPACED_REP",
    title: "Memory & Consolidation",
    icon: PixelScrollIcon,
    description: "Ebbinghaus curve, active recall rites, and synaptic plasticity.",
    badgeColor: "bg-[#064e3b] text-[#a7f3d0] border-[#10b981]",
  },
  {
    id: "WILLPOWER",
    title: "Ultradian & Focus Rites",
    icon: PixelCrossedSwordsIcon,
    description: "Beta-wave endurance, 90m cycles, and cognitive recovery sanctuaries.",
    badgeColor: "bg-[#581c87] text-[#e9d5ff] border-[#a855f7]",
  },
  {
    id: "CUSTOM",
    title: "Scholar's Personal Codex",
    icon: PixelQuillIcon,
    description: "Your hand-inscribed knowledge folios and custom flashcard study cards.",
    badgeColor: "bg-[#78350f] text-[#fef08a] border-[#f59e0b]",
  },
];

const DEFAULT_CARDS: Flashcard[] = [
  {
    id: "neuro-1",
    deck: "NEUROSCIENCE",
    topic: "Spotlight of Attention",
    front: "Which neurotransmitter acts as the neural 'highlighter', gating sensory inputs into the prefrontal cortex during deep focus?",
    back: "Acetylcholine. It increases signal-to-noise ratio in sensory cortices, enabling you to ignore peripheral distractions.",
    statReward: "+0.5 KNO • +50 EXP",
  },
  {
    id: "neuro-2",
    deck: "NEUROSCIENCE",
    topic: "Dopamine Anticipation Loop",
    front: "How does dopamine drive cognitive stamina during challenging Pomodoro study blocks?",
    back: "Dopamine is released during the anticipation of milestone completion, fueling intrinsic motivation and goal-directed persistence.",
    statReward: "+0.5 KNO • +50 EXP",
  },
  {
    id: "memory-1",
    deck: "SPACED_REP",
    topic: "Active Recall Principle",
    front: "Why is active retrieval far superior to passive re-reading for long-term memory encoding?",
    back: "Active retrieval forces neuronal reconsolidation, strengthening synaptic pathways and signaling cognitive significance to the hippocampus.",
    statReward: "+0.5 KNO • +50 EXP",
  },
  {
    id: "memory-2",
    deck: "SPACED_REP",
    topic: "Forgetting Curve Dynamics",
    front: "What is the optimal interval timing to review an inscribed concept to reset memory decay?",
    back: "Right before the memory trace is about to be forgotten (e.g. 1 day, 3 days, 7 days, 14 days, 30 days).",
    statReward: "+0.5 FOC • +50 EXP",
  },
  {
    id: "will-1",
    deck: "WILLPOWER",
    topic: "Ultradian Rhythm Dynamics",
    front: "Why are 25-minute to 90-minute focus intervals optimal for human cognitive endurance?",
    back: "The brain operates on 90-minute ultradian cycles; shorter 25m/50m blocks prevent synaptic fatigue and maintain peak beta-wave focus.",
    statReward: "+0.5 FOC • +50 EXP",
  },
  {
    id: "will-2",
    deck: "WILLPOWER",
    topic: "Cognitive Respite Rites",
    front: "Why should breaks avoid high-dopamine digital scrolling?",
    back: "Passive scrolling floods receptors with cheap dopamine, preventing the prefrontal cortex from cooling down and replenishing glycogen reserves.",
    statReward: "+0.5 DIS • +50 EXP",
  },
];

const STORAGE_CUSTOM_CARDS = "ascend_custom_flashcards_v1";
const STORAGE_MASTERED = "ascend_mastered_flashcards_v1";

/* =====================================================================
   2. MAIN FORBIDDEN GRIMOIRE & CUSTOM CODEX COMPONENT
   ===================================================================== */
export const ForbiddenGrimoireCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [selectedDeck, setSelectedDeck] = useState<string>("NEUROSCIENCE");
  const [customCards, setCustomCards] = useState<Flashcard[]>([]);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // Form State for creating custom flashcard
  const [newTopic, setNewTopic] = useState("");
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  // Load custom cards & mastered from localStorage
  useEffect(() => {
    try {
      const rawCustom = localStorage.getItem(STORAGE_CUSTOM_CARDS);
      if (rawCustom) setCustomCards(JSON.parse(rawCustom));

      const rawMastered = localStorage.getItem(STORAGE_MASTERED);
      if (rawMastered) setMasteredIds(JSON.parse(rawMastered));
    } catch (e) {
      console.error("Error loading flashcards from local storage", e);
    }
  }, []);

  // Save mastered cards
  const saveMastered = (ids: string[]) => {
    setMasteredIds(ids);
    try {
      localStorage.setItem(STORAGE_MASTERED, JSON.stringify(ids));
    } catch (e) {
      console.error("Error saving mastered flashcards", e);
    }
  };

  // Filter cards by selected deck
  const currentDeckCards =
    selectedDeck === "CUSTOM"
      ? customCards
      : DEFAULT_CARDS.filter((c) => c.deck === selectedDeck);

  // Safe current index
  const safeIndex =
    currentDeckCards.length === 0
      ? 0
      : Math.min(currentIndex, currentDeckCards.length - 1);
  const currentCard = currentDeckCards[safeIndex] || null;
  const isMastered = currentCard ? masteredIds.includes(currentCard.id) : false;

  const currentDeckInfo = TOMES.find((t) => t.id === selectedDeck) || TOMES[0];

  const handleNext = () => {
    if (currentDeckCards.length <= 1) return;
    playUIMenuSFX("confirm");
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % currentDeckCards.length);
  };

  const handlePrev = () => {
    if (currentDeckCards.length <= 1) return;
    playUIMenuSFX("confirm");
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + currentDeckCards.length) % currentDeckCards.length);
  };

  const handleFlip = () => {
    playUIMenuSFX("click");
    setIsFlipped(!isFlipped);
  };

  const handleMaster = () => {
    if (!currentCard || isMastered) return;
    playBuffSFX("levelup");
    const updated = [...masteredIds, currentCard.id];
    saveMastered(updated);

    // Award +0.5 KNO and +50 EXP to CharacterStore
    const charStore = useCharacterStore.getState();
    charStore.addStat("knowledge", 0.5);
    charStore.gainExp(50, `Grimoire Inscription Mastered: ${currentCard.topic}`);

    toast.success("Arcane Lore Mastered!", {
      description: `+0.5 KNO & +50 EXP inscribed to your Character stats.`,
    });
  };

  const handleSaveCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newFront.trim() || !newBack.trim()) {
      toast.error("Please fill in all parchment fields.");
      return;
    }

    const newCard: Flashcard = {
      id: `custom-card-${Date.now()}`,
      topic: newTopic.trim(),
      front: newFront.trim(),
      back: newBack.trim(),
      deck: "CUSTOM",
      statReward: "+0.5 KNO • +50 EXP",
      isCustom: true,
    };

    const updated = [newCard, ...customCards];
    setCustomCards(updated);
    try {
      localStorage.setItem(STORAGE_CUSTOM_CARDS, JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving custom card", err);
    }

    playBuffSFX("buff");
    toast.success("Custom Folio Inscribed into Grimoire!");
    setNewTopic("");
    setNewFront("");
    setNewBack("");
    setIsCreatingCard(false);
    setSelectedDeck("CUSTOM");
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleDeleteCard = (id: string) => {
    playUIMenuSFX("decline");
    const updated = customCards.filter((c) => c.id !== id);
    setCustomCards(updated);
    try {
      localStorage.setItem(STORAGE_CUSTOM_CARDS, JSON.stringify(updated));
    } catch (err) {
      console.error("Error deleting card", err);
    }
    toast.info("Folio erased from your personal codex.");
    setIsFlipped(false);
  };

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

      {/* Header: Forbidden Grimoire Title & Inscribe Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#542d17]/80 pb-3 relative z-10">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-pixel font-bold text-[#fef08a] uppercase tracking-wider">
            Forbidden Grimoire & Arcane Codex
          </h2>
          <span className="text-xs sm:text-sm font-sans font-medium text-slate-300 block">
            Spaced Repetition & Ancient Lore Flashcards
          </span>
        </div>

        {/* Action: Inscribe Custom Folio */}
        <PixelButton
          type="button"
          variant="gold"
          size="sm"
          onClick={() => {
            playUIMenuSFX("confirm");
            setIsCreatingCard(!isCreatingCard);
          }}
          className="whitespace-nowrap px-3 py-2 text-xs font-pixel font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_0_#000] shrink-0"
        >
          {isCreatingCard ? <PixelCloseIcon className="w-4 h-4 shrink-0" /> : <PixelPlusIcon className="w-4 h-4 shrink-0" />}
          <span className="whitespace-nowrap">{isCreatingCard ? "Close Quill" : "Inscribe Lore"}</span>
        </PixelButton>
      </div>

      {/* =========================================================
          TOME SELECTION TABS (UNIFORM & CLEAR)
          ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {TOMES.map((tome) => {
          const isSelected = selectedDeck === tome.id;
          const count =
            tome.id === "CUSTOM"
              ? customCards.length
              : DEFAULT_CARDS.filter((c) => c.deck === tome.id).length;

          return (
            <button
              key={tome.id}
              type="button"
              onClick={() => {
                playUIMenuSFX("confirm");
                setSelectedDeck(tome.id);
                setCurrentIndex(0);
                setIsFlipped(false);
                setIsCreatingCard(false);
              }}
              className={cn(
                "p-3 border-2 text-left flex flex-col justify-between transition-all cursor-pointer min-h-[96px] h-full shadow-[0_2px_0_0_#000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] relative overflow-hidden",
                isSelected
                  ? "bg-[#381a0c] border-[#f59e0b] text-[#fef08a] translate-y-0.5 ring-1 ring-[#fde047]"
                  : "bg-[#180a04] hover:bg-[#281308] border-[#45200c] text-slate-200 hover:text-white"
              )}
            >
              <div className="flex items-center justify-between gap-1 w-full pb-1 border-b border-[#45200c]/40">
                <tome.icon className={cn("w-4 h-4 shrink-0 transition-colors", isSelected ? "text-[#fef08a]" : "text-amber-400")} />
                <span className="text-[10px] font-mono font-bold bg-[#100602] px-1.5 py-0.5 border border-[#45200c] text-amber-400 shrink-0 tabular-nums">
                  {count} Folios
                </span>
              </div>
              <span className="text-xs font-pixel font-bold text-[#fef08a] leading-snug break-words mt-2">
                {tome.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          NEW FOLIO INSCRIPTION FORM (IF OPEN)
          ========================================================= */}
      {isCreatingCard ? (
        <form
          onSubmit={handleSaveCustomCard}
          className="p-4 sm:p-5 bg-[#edd9b6] text-[#221208] border-2 border-[#82542a] shadow-[inset_0_0_16px_rgba(110,64,28,0.35)] space-y-3.5 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 border-b border-[#82542a]/40 pb-2 text-xs sm:text-sm font-pixel font-bold text-[#5c2f10] uppercase">
            <PixelQuillIcon className="w-4 h-4 text-[#854d0e]" />
            Inscribe New Folio into Personal Codex
          </div>

          <div className="space-y-1">
            <label className="text-xs font-pixel font-bold text-[#5c2f10] block">
              Topic / Discipline Title:
            </label>
            <input
              type="text"
              placeholder="e.g. Cognitive Biases, Dynamic Programming, Latin Terms"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full bg-[#fdf6e7] border-2 border-[#82542a] p-2.5 text-xs sm:text-sm font-sans font-semibold text-[#1a0c05] focus:outline-none focus:border-[#b45309]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-pixel font-bold text-[#5c2f10] block">
              Parchment Prompt (Front Side):
            </label>
            <textarea
              rows={2}
              placeholder="What question, concept, or formula to test?"
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
              className="w-full bg-[#fdf6e7] border-2 border-[#82542a] p-2.5 text-xs sm:text-sm font-sans font-semibold text-[#1a0c05] focus:outline-none focus:border-[#b45309]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-pixel font-bold text-[#5c2f10] block">
              Arcane Solution / Explanation (Back Side):
            </label>
            <textarea
              rows={2}
              placeholder="The deciphered solution, principle, or insight..."
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              className="w-full bg-[#fdf6e7] border-2 border-[#82542a] p-2.5 text-xs sm:text-sm font-sans font-semibold text-[#1a0c05] focus:outline-none focus:border-[#b45309]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingCard(false)}
              className="px-3 py-1.5 bg-[#dfca9f] border border-[#82542a] text-xs sm:text-sm font-pixel text-[#5c2f10] hover:bg-[#caa97e] cursor-pointer font-bold"
            >
              Cancel
            </button>
            <PixelButton type="submit" variant="gold" size="sm" className="text-xs sm:text-sm font-pixel font-bold">
              Inscribe to Grimoire
            </PixelButton>
          </div>
        </form>
      ) : (
        /* =========================================================
            ACTIVE GRIMOIRE FOLIO CARD STAGE (DUAL-SIDED)
            ========================================================= */
        <div className="space-y-3">
          {currentDeckCards.length === 0 ? (
            <div className="p-8 bg-[#180a04] border-2 border-[#45200c] text-center space-y-3">
              <PixelQuillIcon className="w-8 h-8 text-amber-400/80 mx-auto block" />
              <p className="font-pixel text-sm text-[#fef08a] font-bold">
                Your Personal Codex is Empty
              </p>
              <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                Click &quot;Inscribe Lore&quot; above to add your own custom study cards and flashcards to this tome.
              </p>
              <PixelButton
                type="button"
                variant="gold"
                size="sm"
                onClick={() => setIsCreatingCard(true)}
                className="text-xs sm:text-sm font-pixel font-bold mx-auto"
              >
                Inscribe First Folio
              </PixelButton>
            </div>
          ) : currentCard ? (
            <>
              {/* Dual-Sided Flip Card with Authentic Ancient Aged Parchment */}
              <PixelAgedParchment
                variant="folio"
                showTornEdges={true}
                showWaterRing={true}
                showCreases={true}
                showInkSpill={true}
                onClick={handleFlip}
                className={cn(
                  "min-h-[215px] p-5 sm:p-6 cursor-pointer flex flex-col justify-between transition-all active:scale-[0.99] relative select-none group",
                  isMastered && "border-[#047857] shadow-[0_0_0_1px_#064e3b,0_6px_16px_rgba(0,0,0,0.8),inset_0_0_24px_rgba(4,120,87,0.3)]"
                )}
              >
                {/* 4 Gold Corner Accents */}
                <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t border-l border-[#854d0e] pointer-events-none" />
                <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t border-r border-[#854d0e] pointer-events-none" />
                <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b border-l border-[#854d0e] pointer-events-none" />
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b border-r border-[#854d0e] pointer-events-none" />

                {/* Card Top Strip */}
                <div className="flex items-center justify-between border-b-2 border-[#5c2b10]/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#854d0e] border border-[#3a1a05]" />
                    <span className="text-xs sm:text-sm font-pixel font-bold text-[#231006] uppercase tracking-wider drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                      {currentCard.topic}
                    </span>
                  </div>

                  <span className="text-xs sm:text-sm font-mono font-bold text-[#5c2d12] flex items-center gap-1.5 group-hover:text-[#231006]">
                    <PixelRefreshIcon className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform text-[#78350f]" />
                    {isFlipped ? "Deciphered Solution" : "Click to Inscribe / Flip"}
                  </span>
                </div>

                {/* Card Main Body */}
                <div className="my-auto py-3.5">
                  <div className="flex items-start gap-3">
                    {/* Medieval Initial Drop-Cap */}
                    <div className="w-8 h-8 bg-[#45200c] text-[#fef08a] font-pixel font-bold text-base flex items-center justify-center shrink-0 border border-[#854d0e] shadow-[0_1px_0_0_#000]">
                      {isFlipped ? "A" : "Q"}
                    </div>
                    <p className="text-sm sm:text-base font-sans font-semibold text-[#1a0c05] leading-relaxed text-pretty drop-shadow-[0_1px_0_rgba(255,255,255,0.3)]">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </p>
                  </div>
                </div>

                {/* Card Bottom Strip */}
                <div className="flex items-center justify-between pt-2.5 border-t-2 border-[#5c2b10]/40 text-xs sm:text-sm font-mono">
                  <div className="flex items-center gap-1.5 font-bold text-[#065f46]">
                    <PixelSparklesIcon className="w-4 h-4 text-[#d97706]" />
                    <span>Reward: {currentCard.statReward}</span>
                  </div>

                  <div className="flex items-center gap-2.5 font-bold">
                    {isMastered ? (
                      <span className="text-[#047857] flex items-center gap-1 bg-[#d1fae5] px-2.5 py-0.5 border border-[#10b981]">
                        <PixelCheckSquareIcon className="w-4 h-4 text-[#047857]" /> Mastered
                      </span>
                    ) : (
                      <span className="text-[#854d0e]">Unmastered</span>
                    )}

                    {currentCard.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(currentCard.id);
                        }}
                        className="text-red-700 hover:text-red-900 p-1 cursor-pointer transition-colors"
                        title="Erase Folio"
                      >
                        <PixelTrashIcon className="w-4 h-4 text-[#dc2626] hover:text-[#ef4444]" />
                      </button>
                    )}
                  </div>
                </div>
              </PixelAgedParchment>

              {/* Navigation & Master Inscription Controls */}
              <div className="flex items-center justify-between gap-3 pt-1">
                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <PixelButton
                    type="button"
                    variant="dark"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentDeckCards.length <= 1}
                    className="w-11 h-11 flex items-center justify-center cursor-pointer shadow-[0_2px_0_0_#000]"
                    title="Previous Folio"
                  >
                    <PixelChevronLeftIcon className="w-5 h-5 text-[#fbbf24]" />
                  </PixelButton>

                  <span className="text-xs sm:text-sm font-mono font-bold text-[#fef08a] bg-[#1a0b04] px-3.5 py-2.5 border-2 border-[#542d17] shadow-[0_2px_0_0_#000] tabular-nums">
                    {safeIndex + 1} / {currentDeckCards.length}
                  </span>

                  <PixelButton
                    type="button"
                    variant="dark"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentDeckCards.length <= 1}
                    className="w-11 h-11 flex items-center justify-center cursor-pointer shadow-[0_2px_0_0_#000]"
                    title="Next Folio"
                  >
                    <PixelChevronRightIcon className="w-5 h-5 text-[#fbbf24]" />
                  </PixelButton>
                </div>

                {/* Master Button */}
                <PixelButton
                  type="button"
                  variant={isMastered ? "success" : "gold"}
                  size="md"
                  onClick={handleMaster}
                  disabled={isMastered}
                  className="flex-1 h-11 text-xs sm:text-sm font-pixel font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_0_0_#000]"
                >
                  <PixelSparklesIcon className="w-4 h-4" />
                  {isMastered ? "Inscription Mastered (+KNO)" : "Master Inscription (+0.5 KNO)"}
                </PixelButton>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ForbiddenGrimoireCard;
