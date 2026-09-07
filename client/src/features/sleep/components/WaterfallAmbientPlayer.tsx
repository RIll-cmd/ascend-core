"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import {
  PixelVolumeHighIcon,
  PixelVolumeMuteIcon,
  PixelHeadphonesIcon,
  PixelWaterfallIcon,
  PixelSparklesIcon,
  PixelRainCloudIcon,
} from "@/components/ui/pixel/PixelIcons";
import { playUIMenuSFX } from "@/utils/audio";
import { cn } from "@/lib/utils";

export type WaterfallAudioMode = "MUTE" | "STREAM" | "DELTA_DRONE";

export const WaterfallAmbientPlayer: React.FC<{ className?: string }> = ({ className = "" }) => {
  const volumeSliderId = useId();
  const [audioMode, setAudioMode] = useState<WaterfallAudioMode>("MUTE");
  const [volume, setVolume] = useState<number>(0.4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Audio Engine Lifecycle
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

    if (audioMode === "MUTE") {
      setIsPlaying(false);
      return;
    }

    if (audioMode === "STREAM") {
      try {
        const audio = new Audio("/music/cyber_rain.mp3");
        audio.loop = true;
        audio.volume = Math.min(1, Math.max(0, volume));
        audioRef.current = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((e) => {
              console.warn("Autoplay waiting for interaction:", e);
              setIsPlaying(false);
            });
        }
      } catch (err) {
        console.error("Failed to load stream audio", err);
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
      };
    }

    if (audioMode === "DELTA_DRONE") {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0,
          b1 = 0,
          b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.04;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(260, ctx.currentTime);

        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(108, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume * 0.35, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        osc.start();
        setIsPlaying(true);

        return () => {
          try {
            whiteNoise.stop();
            osc.stop();
            ctx.close();
          } catch {}
        };
      } catch (err) {
        console.error("Synth error:", err);
      }
    }
  }, [audioMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, Math.max(0, volume));
    }
  }, [volume]);

  return (
    <div
      className={cn(
        "p-5 bg-[#120824]/95 border-2 border-[#3c1860] shadow-[0_4px_0_0_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-100 select-none relative overflow-hidden backdrop-blur-md",
        className
      )}
    >
      {/* Left: Pagoda Sound Icon & Status */}
      <div className="flex items-center gap-3.5">
        <div
          className={cn(
            "w-11 h-11 border-2 flex items-center justify-center transition-colors duration-150 flex-shrink-0",
            audioMode !== "MUTE"
              ? "bg-[#281347] border-[#f59e0b] text-[#fbbf24]"
              : "bg-[#0b0514] border-[#25103a] text-slate-500"
          )}
        >
          {audioMode !== "MUTE" ? (
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-3.5 bg-[#fbbf24] animate-pulse" />
              <span className="w-1 h-6 bg-[#f59e0b] animate-pulse" style={{ animationDelay: "0.2s" }} />
              <span className="w-1 h-2.5 bg-[#d97706] animate-pulse" style={{ animationDelay: "0.4s" }} />
            </div>
          ) : (
            <PixelHeadphonesIcon className="w-5 h-5 text-slate-500" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-pixel font-bold text-[#fbbf24] flex items-center gap-1.5">
              <PixelWaterfallIcon className="w-4 h-4 text-[#38bdf8]" />
              Sanctuary Soundscape
            </span>
            {audioMode !== "MUTE" && (
              <span className="inline-block w-2 h-2 bg-[#22c55e] animate-ping rounded-full" />
            )}
          </div>
          <span className="text-sm sm:text-base font-pixel font-bold text-white tracking-wide block mt-1">
            {audioMode === "MUTE"
              ? "Silent Tranquility"
              : audioMode === "STREAM"
              ? "Cascading Night Falls & Rain"
              : "432Hz Somatic Delta Waves"}
          </span>
        </div>
      </div>

      {/* Right: Retro Push Buttons & Volume Slider (No Emojis, Readable Text) */}
      <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Sound Selection Button Group */}
        <div className="flex items-center gap-1.5 p-0.5">
          <button
            type="button"
            onClick={() => {
              playUIMenuSFX("confirm");
              setAudioMode("MUTE");
            }}
            className={cn(
              "px-3.5 py-2 text-xs sm:text-sm font-pixel font-bold border transition-colors cursor-pointer flex items-center gap-1.5",
              audioMode === "MUTE"
                ? "bg-[#2a1347] text-[#fbbf24] border-[#6b21a8]"
                : "bg-transparent text-slate-300 border-transparent hover:text-white hover:bg-[#1a0c30]"
            )}
          >
            <PixelVolumeMuteIcon className="w-3.5 h-3.5 text-slate-400" />
            Silent
          </button>
          <button
            type="button"
            onClick={() => {
              playUIMenuSFX("confirm");
              setAudioMode("STREAM");
            }}
            className={cn(
              "px-3.5 py-2 text-xs sm:text-sm font-pixel font-bold border transition-colors cursor-pointer flex items-center gap-1.5",
              audioMode === "STREAM"
                ? "bg-[#064e3b] text-[#a7f3d0] border-[#10b981]"
                : "bg-transparent text-slate-300 border-transparent hover:text-white hover:bg-[#1a0c30]"
            )}
          >
            <PixelRainCloudIcon className="w-4 h-4 text-[#34d399]" />
            Stream
          </button>
          <button
            type="button"
            onClick={() => {
              playUIMenuSFX("confirm");
              setAudioMode("DELTA_DRONE");
            }}
            className={cn(
              "px-3.5 py-2 text-xs sm:text-sm font-pixel font-bold border transition-colors cursor-pointer flex items-center gap-1.5",
              audioMode === "DELTA_DRONE"
                ? "bg-[#78350f] text-[#fef08a] border-[#f59e0b]"
                : "bg-transparent text-slate-300 border-transparent hover:text-white hover:bg-[#1a0c30]"
            )}
          >
            <PixelSparklesIcon className="w-4 h-4 text-[#f59e0b]" />
            432Hz
          </button>
        </div>

        {/* 8-Bit Volume Controller */}
        {audioMode !== "MUTE" && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#0a0412] border border-[#2e1548]">
            <label htmlFor={volumeSliderId} className="cursor-pointer">
              {volume === 0 ? (
                <PixelVolumeMuteIcon className="w-4 h-4 text-slate-500" />
              ) : (
                <PixelVolumeHighIcon className="w-4 h-4 text-[#fbbf24]" />
              )}
              <span className="sr-only">Volume Slider</span>
            </label>
            <input
              id={volumeSliderId}
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-2.5 bg-[#1b0d2e] appearance-none cursor-pointer accent-[#f59e0b] border border-[#3b1861]"
            />
            <span className="text-xs sm:text-sm font-pixel text-[#fbbf24] font-bold tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterfallAmbientPlayer;
