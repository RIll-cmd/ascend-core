"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../card";
import { Slider } from "../slider";
import { Switch } from "../switch";
import "../styles/retro.css";

export interface AudioSettingsState {
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  scanlinesEnabled: boolean;
  particlesEnabled: boolean;
}

export interface AudioSettingsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  initialState?: Partial<AudioSettingsState>;
  onChange?: (state: AudioSettingsState) => void;
  title?: string;
  description?: string;
}

export default function AudioSettings({
  initialState,
  onChange,
  title = "AUDIO & ATMOSPHERE",
  description = "Tweak retro 8-bit soundscapes, volume channels, and visual effects.",
  className,
  ...props
}: AudioSettingsProps) {
  const [state, setState] = React.useState<AudioSettingsState>({
    masterVolume: initialState?.masterVolume ?? 75,
    bgmVolume: initialState?.bgmVolume ?? 60,
    sfxVolume: initialState?.sfxVolume ?? 85,
    isMuted: initialState?.isMuted ?? false,
    scanlinesEnabled: initialState?.scanlinesEnabled ?? true,
    particlesEnabled: initialState?.particlesEnabled ?? true,
  });

  const update = (partial: Partial<AudioSettingsState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      onChange?.(next);
      return next;
    });
  };

  return (
    <Card className={cn("bg-[#0B1020]/95 border-2 border-[#8c7a53] shadow-[3px_3px_0_0_#000]", className)} {...props}>
      <CardHeader className="p-4 pb-2 border-b border-[#2d251e] text-center">
        <CardTitle className="retro text-xs sm:text-sm text-[#f6c453] tracking-wider flex items-center justify-center gap-2">
          <span>🔊</span>
          <span>{title}</span>
        </CardTitle>
        {description && (
          <CardDescription className="retro text-[9px] text-slate-400">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-5">
        {/* Master Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="retro text-[9px] sm:text-xs text-white">MASTER VOLUME</span>
            <span className="retro text-[9px] text-[#f6c453]">{state.masterVolume}%</span>
          </div>
          <Slider
            value={state.masterVolume}
            disabled={state.isMuted}
            onChange={(val) => update({ masterVolume: val })}
            variant="retro"
          />
        </div>

        {/* BGM Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="retro text-[9px] sm:text-xs text-slate-300">BGM / TAVERN AMBIENCE</span>
            <span className="retro text-[9px] text-[#38bdf8]">{state.bgmVolume}%</span>
          </div>
          <Slider
            value={state.bgmVolume}
            disabled={state.isMuted}
            onChange={(val) => update({ bgmVolume: val })}
            variant="retro"
          />
        </div>

        {/* SFX Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="retro text-[9px] sm:text-xs text-slate-300">COMBAT SFX & CHIMES</span>
            <span className="retro text-[9px] text-amber-400">{state.sfxVolume}%</span>
          </div>
          <Slider
            value={state.sfxVolume}
            disabled={state.isMuted}
            onChange={(val) => update({ sfxVolume: val })}
            variant="retro"
          />
        </div>

        <div className="pt-2 border-t border-[#2d251e] space-y-3">
          {/* Mute Switch */}
          <div className="flex items-center justify-between">
            <span className="retro text-[9px] sm:text-xs text-white">MUTE ALL AUDIO</span>
            <Switch
              checked={state.isMuted}
              onCheckedChange={(checked: boolean) => update({ isMuted: checked })}
              variant="destructive"
            />
          </div>

          {/* Scanlines Effect */}
          <div className="flex items-center justify-between">
            <div>
              <span className="retro text-[9px] sm:text-xs text-slate-300 block">CRT SCANLINE FILTER</span>
              <span className="retro text-[7px] text-slate-500">Retro phosphor monitor scanlines</span>
            </div>
            <Switch
              checked={state.scanlinesEnabled}
              onCheckedChange={(checked: boolean) => update({ scanlinesEnabled: checked })}
              variant="retro"
            />
          </div>

          {/* Sakura Petals Effect */}
          <div className="flex items-center justify-between">
            <div>
              <span className="retro text-[9px] sm:text-xs text-slate-300 block">SAKURA PETALS BURST</span>
              <span className="retro text-[7px] text-slate-500">Particle effects upon quest check</span>
            </div>
            <Switch
              checked={state.particlesEnabled}
              onCheckedChange={(checked: boolean) => update({ particlesEnabled: checked })}
              variant="retro"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { AudioSettings };
