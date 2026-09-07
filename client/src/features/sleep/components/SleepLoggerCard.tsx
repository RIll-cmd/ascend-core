"use client";

import React, { useState, useId } from "react";
import {
  PixelMoonSleepIcon,
  PixelClockIcon,
  PixelSparklesIcon,
  PixelCheckIcon,
  PixelHeartIcon,
  PixelWaterDropIcon,
  PixelPlusIcon,
  PixelMinusIcon,
  PixelBrainIcon,
  PixelWaterfallIcon,
  PixelLotusIcon,
  PixelLightningIcon,
  PixelSkullIcon,
  PixelSunriseIcon,
} from "@/components/ui/pixel/PixelIcons";
import { useSleepStore, SleepQuality, calculateSleepEfficiency } from "../store/useSleepStore";
import { PixelButton } from "@/components/ui/pixel/PixelButton";
import { playUIMenuSFX } from "@/utils/audio";
import { cn } from "@/lib/utils";

const QUALITY_OPTIONS: {
  id: SleepQuality;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  badge: string;
  selectedBg: string;
  borderColor: string;
  iconColor: string;
}[] = [
  {
    id: "DEEP_REM",
    label: "Deep REM & Delta",
    sublabel: "+15% Somatic Bonus",
    icon: PixelBrainIcon,
    desc: "Uninterrupted neural recovery, HGH release & cellular repair",
    badge: "1.15x Boost",
    selectedBg: "bg-[#2d1607]",
    borderColor: "border-[#f59e0b]",
    iconColor: "text-[#fbbf24]",
  },
  {
    id: "RESTFUL",
    label: "Serene Stream",
    sublabel: "1.00x Base Standard",
    icon: PixelWaterfallIcon,
    desc: "Woke up recharged in the mist, full energetic stamina",
    badge: "1.00x Standard",
    selectedBg: "bg-[#0f2420]",
    borderColor: "border-[#10b981]",
    iconColor: "text-[#34d399]",
  },
  {
    id: "MODERATE",
    label: "Tranquil Pond",
    sublabel: "0.85x Recovery Yield",
    icon: PixelLotusIcon,
    desc: "Mild restlessness or brief early awakenings in the night",
    badge: "0.85x Yield",
    selectedBg: "bg-[#1f103d]",
    borderColor: "border-[#8b5cf6]",
    iconColor: "text-[#c084fc]",
  },
  {
    id: "FRAGMENTED",
    label: "Turbulent Stream",
    sublabel: "0.65x Reduced Yield",
    icon: PixelLightningIcon,
    desc: "Interrupted cycles, broken sleep, morning somatic inertia",
    badge: "0.65x Reduced",
    selectedBg: "bg-[#261304]",
    borderColor: "border-[#d97706]",
    iconColor: "text-[#fbbf24]",
  },
  {
    id: "POOR",
    label: "Dry Drought",
    sublabel: "0.50x Severe Fatigue",
    icon: PixelSkullIcon,
    desc: "Acute sleep deficit, elevated cortisol & somatic strain",
    badge: "0.50x Deficit",
    selectedBg: "bg-[#290814]",
    borderColor: "border-[#e11d48]",
    iconColor: "text-[#fb7185]",
  },
];

export const SleepLoggerCard: React.FC<{ onLogSuccess?: () => void; className?: string }> = ({
  onLogSuccess,
  className = "",
}) => {
  const sliderId = useId();
  const { logSleep, todayLogged } = useSleepStore();

  const [hours, setHours] = useState<number>(8.0);
  const [bedtime, setBedtime] = useState<string>("23:00");
  const [wakeTime, setWakeTime] = useState<string>("07:00");
  const [quality, setQuality] = useState<SleepQuality>("RESTFUL");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { score, recoveryGain, exp, gold } = calculateSleepEfficiency(hours, quality);

  const handleAdjustHours = (delta: number) => {
    playUIMenuSFX("click");
    setHours((prev) => {
      const next = Math.round((prev + delta) * 4) / 4;
      return Math.min(14.0, Math.max(3.0, next));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      logSleep({
        hoursSlept: hours,
        bedtime,
        wakeTime,
        quality,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      if (onLogSuccess) onLogSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-none bg-[#140a26]/95 border-2 border-[#3c1860] p-5 sm:p-7 shadow-[0_4px_0_0_#000] overflow-hidden text-slate-100 backdrop-blur-md select-none",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3c1860]/60 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#251040] border-2 border-[#f59e0b] flex items-center justify-center flex-shrink-0">
            <PixelMoonSleepIcon className="w-6 h-6 text-[#fbbf24] animate-pulse" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-pixel font-bold text-[#fbbf24] flex items-center gap-1.5">
              <PixelHeartIcon className="w-4 h-4 text-[#f59e0b]" />
              Night Pagoda Protocol
            </span>
            <h2 className="text-xl sm:text-2xl font-pixel font-bold text-white tracking-wide mt-1">
              Log Rest & Channel Somatic Recovery
            </h2>
          </div>
        </div>

        {todayLogged && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#064e3b] text-[#6ee7b7] border border-[#10b981] text-xs sm:text-sm font-pixel font-bold self-start sm:self-auto">
            <PixelCheckIcon className="w-4 h-4 text-[#34d399]" />
            Today Synced
          </div>
        )}
      </div>

      {/* Main Interactive Form */}
      <form onSubmit={handleSubmit} className="space-y-6 pt-5">
        {/* Section 1: Rest Duration & Circadian Phase */}
        <div className="space-y-3.5 pb-5 border-b border-[#3c1860]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-sm font-pixel font-bold text-[#fbbf24] flex items-center gap-2">
                <PixelClockIcon className="w-4 h-4 text-[#f59e0b]" />
                Rest Duration & Circadian Phase
              </span>
            </div>

            {/* Stepped Increment / Decrement & Dial */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleAdjustHours(-0.25)}
                className="w-9 h-9 bg-[#1f0d36] hover:bg-[#321557] active:bg-[#150924] border border-[#4c1d7c] text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Decrease 15 mins"
              >
                <PixelMinusIcon className="w-4 h-4 text-[#fbbf24]" />
              </button>

              <div className="text-center font-pixel min-w-[110px] px-3 py-1.5 bg-[#1a0c2e] border-2 border-[#f59e0b]">
                <span className="text-2xl sm:text-3xl font-bold text-[#fef08a] tabular-nums">
                  {hours.toFixed(2)}
                </span>
                <span className="text-xs sm:text-sm text-[#fbbf24] ml-1 font-bold">hrs</span>
              </div>

              <button
                type="button"
                onClick={() => handleAdjustHours(0.25)}
                className="w-9 h-9 bg-[#1f0d36] hover:bg-[#321557] active:bg-[#150924] border border-[#4c1d7c] text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Increase 15 mins"
              >
                <PixelPlusIcon className="w-4 h-4 text-[#fbbf24]" />
              </button>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-3 pt-1">
            <div className="relative flex items-center">
              <label htmlFor={sliderId} className="sr-only">
                Sleep Duration in Hours
              </label>
              <input
                id={sliderId}
                type="range"
                min="3.0"
                max="14.0"
                step="0.25"
                value={hours}
                onChange={(e) => {
                  setHours(parseFloat(e.target.value));
                }}
                className="w-full h-3.5 bg-[#06020d] border border-[#3b1861] appearance-none cursor-pointer accent-[#f59e0b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
              />
            </div>

            {/* Quick Select 8-Bit Preset Pills (No Emojis, Readable Text) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {[6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 10.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    playUIMenuSFX("confirm");
                    setHours(val);
                  }}
                  className={cn(
                    "px-3.5 py-2 text-xs sm:text-sm font-pixel font-bold border transition-colors cursor-pointer select-none",
                    hours === val
                      ? "bg-[#d97706] text-[#180b02] border-[#fde047]"
                      : "bg-[#180b2b] text-slate-200 border-[#3b1861] hover:border-[#f59e0b] hover:text-[#fbbf24]"
                  )}
                >
                  {val === 8.0 ? "8.0h Golden" : `${val}h`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Circadian Bedtime & Wake Time Pickers (Clear, Large, No Emojis in Text) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-[#3c1860]/40">
          <div className="space-y-2">
            <label className="text-sm font-pixel font-bold text-[#fbbf24] flex items-center gap-2">
              <PixelMoonSleepIcon className="w-4 h-4 text-[#f59e0b]" />
              Retreat to Rest (Bedtime)
            </label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full bg-[#180b2e] border-2 border-[#3b1861] p-3 text-base sm:text-lg font-mono font-bold text-white tracking-wider focus:border-[#f59e0b] focus-visible:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-pixel font-bold text-[#fbbf24] flex items-center gap-2">
              <PixelSunriseIcon className="w-4 h-4 text-[#f59e0b]" />
              Dawn Awakening (Wake Time)
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full bg-[#180b2e] border-2 border-[#3b1861] p-3 text-base sm:text-lg font-mono font-bold text-white tracking-wider focus:border-[#f59e0b] focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Section 3: Sleep Quality & Pagoda Rest Chambers (Clean Lucide Icons, Large Readable Text) */}
        <div className="space-y-3 pb-5 border-b border-[#3c1860]/40">
          <div className="flex items-center justify-between">
            <label className="text-sm font-pixel font-bold text-[#fbbf24] flex items-center gap-2">
              <PixelWaterDropIcon className="w-4 h-4 text-[#f59e0b]" />
              Rest Chamber Quality & Sensation
            </label>
            <span className="text-xs sm:text-sm font-pixel text-slate-300">
              Impacts character REC stat
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {QUALITY_OPTIONS.map((opt) => {
              const isSelected = quality === opt.id;
              const IconComp = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    playUIMenuSFX("confirm");
                    setQuality(opt.id);
                  }}
                  className={cn(
                    "p-3.5 border text-left transition-colors flex flex-col justify-between cursor-pointer min-h-[105px]",
                    isSelected
                      ? cn(opt.selectedBg, opt.borderColor, "border-2")
                      : "bg-[#0f0621] hover:bg-[#1a0c36] border-[#2d144d] text-slate-300 hover:text-white"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <IconComp className={cn("w-4 h-4 flex-shrink-0", opt.iconColor)} />
                      <span className="text-sm font-pixel font-bold text-white tracking-wide">
                        {opt.label}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-pixel font-bold px-2 py-0.5 border",
                        isSelected
                          ? "bg-[#000000]/60 text-[#fef08a] border-[#f59e0b]"
                          : "bg-black/40 text-slate-400 border-transparent"
                      )}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <span className="text-xs font-sans text-slate-200 font-medium mt-2.5 line-clamp-2 leading-relaxed">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Optional Notes */}
        <div className="space-y-2 pb-5 border-b border-[#3c1860]/40">
          <label className="text-sm font-pixel font-bold text-slate-300 block">
            Sanctuary Dreams & Reflections (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Meditated by waterfall, relaxed deep sleep, fully recharged…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#180b2e] border-2 border-[#3b1861] px-4 py-2.5 text-sm font-sans text-white placeholder:text-slate-500 focus:border-[#f59e0b] focus-visible:outline-none"
          />
        </div>

        {/* Section 5: Live Somatic Regeneration Yield HUD */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono pt-2">
          <div>
            <span className="text-sm font-pixel font-bold text-[#fbbf24] block flex items-center gap-2">
              <PixelSparklesIcon className="w-4 h-4 text-[#f59e0b]" />
              Predicted Somatic Yield & Stat Gains
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-pixel font-bold text-[#fef08a] tabular-nums">
                {score}% Score
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm font-bold w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#3c1860]/40 pt-3 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-xs sm:text-sm font-pixel text-slate-400 block font-bold">REC Stat</span>
              <span className="text-[#34d399] font-pixel font-bold text-base tabular-nums">+{recoveryGain} REC</span>
            </div>
            <div className="text-left md:text-right">
              <span className="text-xs sm:text-sm font-pixel text-slate-400 block font-bold">EXP Bounty</span>
              <span className="text-[#fef08a] font-pixel font-bold text-base tabular-nums">+{exp} EXP</span>
            </div>
            <div className="text-left md:text-right">
              <span className="text-xs sm:text-sm font-pixel text-slate-400 block font-bold">Gold Reward</span>
              <span className="text-[#facc15] font-pixel font-bold text-base tabular-nums">+{gold} G</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <PixelButton
          type="submit"
          variant="gold"
          size="lg"
          disabled={isSubmitting}
          className="w-full h-14 text-sm sm:text-base font-pixel font-bold tracking-wider shadow-[0_4px_0_0_#000] flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <PixelMoonSleepIcon className="w-5 h-5 text-current" />
          {todayLogged
            ? "Update Sanctuary Chronicle & Sync REC"
            : "Record Rest & Channel Somatic Recovery"}
        </PixelButton>
      </form>
    </div>
  );
};

export default SleepLoggerCard;
