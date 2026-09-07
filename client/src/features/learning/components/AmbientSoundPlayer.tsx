"use client";

import React, { useEffect, useRef } from "react";
import {
  PixelVolumeHighIcon,
  PixelVolumeMuteIcon,
  PixelRainCloudIcon,
  PixelFlameIcon,
  PixelBellIcon,
  PixelQuillIcon,
} from "@/components/ui/pixel/PixelIcons";
import { useLearningStore, AmbientSoundType } from "../store/useLearningStore";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import { cn } from "@/lib/utils";

const SOUND_OPTIONS: {
  id: AmbientSoundType;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
}[] = [
  {
    id: "NONE",
    label: "Study Silence",
    desc: "Pure distraction-free scholastic focus",
    icon: PixelVolumeMuteIcon,
    badge: "0 Hz",
  },
  {
    id: "BINARY_PULSE",
    label: "Scribe Quill & Clock",
    desc: "Quill friction & pendulum clock ticks",
    icon: PixelQuillIcon,
    badge: "1 Hz Tick",
  },
  {
    id: "LOFI_NOISE",
    label: "Cathedral Hearth",
    desc: "Warm crackling fire & ember pops",
    icon: PixelFlameIcon,
    badge: "450 Hz",
  },
  {
    id: "RAIN",
    label: "Stained Glass Rain",
    desc: "Heavy rain muffled by leaded windows",
    icon: PixelRainCloudIcon,
    badge: "Rainfall",
  },
  {
    id: "SPACE_DRONE",
    label: "Monastery 528Hz",
    desc: "Tibetan bowl & Solfeggio frequency",
    icon: PixelBellIcon,
    badge: "528 Hz",
  },
];

export const AmbientSoundPlayer: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { ambientSound, ambientVolume, setAmbientSound, setAmbientVolume } = useLearningStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  // Initialize Audio & Procedural Synthesizers
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    if (ambientSound === "NONE") {
      return;
    }

    if (ambientSound === "RAIN") {
      try {
        const audio = new Audio("/music/cyber_rain.mp3");
        audio.loop = true;
        audio.volume = Math.min(1, Math.max(0, ambientVolume));
        audioRef.current = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.warn("Autoplay blocked or waiting for user interaction:", e);
          });
        }
      } catch (err) {
        console.error("Failed to initialize rain audio element", err);
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
      };
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(ambientVolume * 0.15, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (ambientSound === "LOFI_NOISE") {
        // Crackling Hearth: Pink Noise + Lowpass + Random Embers / Pops
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          
          // Occasional random ember pop
          const pop = Math.random() < 0.0008 ? (Math.random() - 0.5) * 2.5 : 0;
          output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.1 + pop;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(0.85, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start(0);
        sourceNodeRef.current = whiteNoise;
      } else if (ambientSound === "SPACE_DRONE") {
        // 528Hz Solfeggio Miracle Tone with warm 264Hz sub-octave & 132Hz pedal note
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "sine";
        osc3.type = "triangle";
        osc1.frequency.setValueAtTime(528, ctx.currentTime);
        osc2.frequency.setValueAtTime(264, ctx.currentTime);
        osc3.frequency.setValueAtTime(132, ctx.currentTime);

        const oscGain2 = ctx.createGain();
        oscGain2.gain.setValueAtTime(0.35, ctx.currentTime);
        osc2.connect(oscGain2);

        const oscGain3 = ctx.createGain();
        oscGain3.gain.setValueAtTime(0.15, ctx.currentTime);
        osc3.connect(oscGain3);

        osc1.connect(masterGain);
        oscGain2.connect(masterGain);
        oscGain3.connect(masterGain);

        osc1.start(0);
        osc2.start(0);
        osc3.start(0);
        sourceNodeRef.current = osc1;
      } else if (ambientSound === "BINARY_PULSE") {
        // Soft Quill on Parchment: Bandpass friction + 1Hz subtle mechanical clock pulse
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = white * 0.055;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(3200, ctx.currentTime);
        filter.Q.setValueAtTime(2.5, ctx.currentTime);

        // LFO modulating friction speed to simulate hand scribing
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(2.2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.5, ctx.currentTime);
        lfo.connect(lfoGain.gain);

        noise.connect(filter);
        filter.connect(lfoGain);
        lfoGain.connect(masterGain);

        noise.start(0);
        lfo.start(0);
        sourceNodeRef.current = noise;
      }
    } catch (e) {
      console.error("Web audio ambient sound initialization failed", e);
    }

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [ambientSound]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, Math.max(0, ambientVolume));
    }
    if (gainNodeRef.current && audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      gainNodeRef.current.gain.setValueAtTime(
        ambientVolume * 0.15,
        audioCtxRef.current.currentTime
      );
    }
  }, [ambientVolume]);

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

      {/* Header & Volume Fader */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#542d17]/80 pb-3 relative z-10">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-pixel font-bold text-[#fef08a] uppercase tracking-wider flex items-center gap-2">
            Grand Scriptorium Soundscapes
            {ambientSound !== "NONE" && (
              <span className="w-2 h-2 bg-[#f59e0b] border border-[#78350f] shadow-[0_0_6px_#f59e0b] shrink-0 inline-block animate-pulse" />
            )}
          </h2>
          <span className="text-xs sm:text-sm font-sans font-medium text-slate-300 block">
            Acoustic atmosphere & Solfeggio focus resonance
          </span>
        </div>

        {/* Volume Fader */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#100703] border-2 border-[#3d1d0c] shadow-[0_2px_0_0_#000] shrink-0 self-end sm:self-auto">
          {ambientVolume > 0 && ambientSound !== "NONE" ? (
            <PixelVolumeHighIcon className="w-4 h-4 text-[#fbbf24] shrink-0" />
          ) : (
            <PixelVolumeMuteIcon className="w-4 h-4 text-[#78695d] shrink-0" />
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={ambientVolume}
            onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
            aria-label="Ambient soundscape volume"
            className="w-20 sm:w-24 h-2 bg-[#251208] appearance-none cursor-pointer accent-[#f59e0b] border border-[#4a2813]"
          />
          <span className="text-xs sm:text-sm font-mono font-bold text-[#fbbf24] tabular-nums min-w-[36px] text-right">
            {Math.round(ambientVolume * 100)}%
          </span>
        </div>
      </div>

      {/* Sound Selection Grid (Uniform & Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {SOUND_OPTIONS.map((opt) => {
          const isSelected = ambientSound === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                playUIMenuSFX("confirm");
                setAmbientSound(opt.id);
              }}
              className={cn(
                "p-3.5 sm:p-4 border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] sm:min-h-[102px] h-full shadow-[0_3px_0_0_#000] relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]",
                isSelected
                  ? "bg-[#381a0c] border-[#f59e0b] text-[#fef08a] translate-y-0.5 shadow-[inset_0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-[#fde047]"
                  : "bg-[#180a04] hover:bg-[#251006] border-[#45200c] hover:border-[#78350f] text-slate-200 hover:text-white"
              )}
            >
              {/* Top Row: Icon, Playing Dot & Frequency Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <opt.icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isSelected
                        ? "text-[#ffd166] drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
                        : "text-[#8a7a6c] group-hover:text-[#fef08a]"
                    )}
                  />
                  {isSelected && (
                    <span className="w-2 h-2 bg-[#f59e0b] border border-[#78350f] shadow-[0_0_6px_#f59e0b] shrink-0 animate-pulse" />
                  )}
                </div>
                <span className="text-xs font-mono font-bold bg-[#100602] px-2 py-0.5 border border-[#45200c] text-amber-400 shrink-0 whitespace-nowrap shadow-[0_1px_0_0_#000]">
                  {opt.badge}
                </span>
              </div>

              {/* Middle & Bottom: Title and Description */}
              <div className="mt-2.5 pt-1.5 border-t border-[#45200c]/60">
                <span className="text-xs sm:text-sm font-pixel font-bold text-[#fef08a] block leading-tight">
                  {opt.label}
                </span>
                <p className="text-xs font-sans font-medium text-slate-300 leading-snug line-clamp-2 mt-1">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AmbientSoundPlayer;
