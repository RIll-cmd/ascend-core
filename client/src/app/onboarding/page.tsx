"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Swords,
  Crown,
  Flame,
  Zap,
  Compass,
  BookOpen,
  Target,
  Star,
  Gem,
  Ghost,
  Skull,
  Check,
  User,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 12 RPG Avatars with Icons & Labels
const AVATAR_OPTIONS = [
  { id: "swords", label: "Warrior", icon: Swords },
  { id: "shield", label: "Paladin", icon: Shield },
  { id: "crown", label: "Monarch", icon: Crown },
  { id: "flame", label: "Pyromancer", icon: Flame },
  { id: "zap", label: "Stormweaver", icon: Zap },
  { id: "compass", label: "Pathfinder", icon: Compass },
  { id: "book", label: "Sage", icon: BookOpen },
  { id: "target", label: "Deadeye", icon: Target },
  { id: "star", label: "Astral", icon: Star },
  { id: "gem", label: "Alchemist", icon: Gem },
  { id: "ghost", label: "Shadow", icon: Ghost },
  { id: "skull", label: "Reaper", icon: Skull },
];

// 5 Theme Swatches with Colors & Glows
const THEME_OPTIONS = [
  {
    id: "blue",
    name: "Blue",
    hex: "#2563EB",
    ring: "ring-blue-500",
    glow: "shadow-blue-500/40",
  },
  {
    id: "purple",
    name: "Purple",
    hex: "#9333EA",
    ring: "ring-purple-500",
    glow: "shadow-purple-500/40",
  },
  {
    id: "green",
    name: "Green",
    hex: "#10B981",
    ring: "ring-emerald-500",
    glow: "shadow-emerald-500/40",
  },
  {
    id: "red",
    name: "Red",
    hex: "#EF4444",
    ring: "ring-red-500",
    glow: "shadow-red-500/40",
  },
  {
    id: "gold",
    name: "Gold",
    hex: "#F59E0B",
    ring: "ring-amber-500",
    glow: "shadow-amber-500/40",
  },
];

// Cosmetic Starting Titles
const TITLE_OPTIONS = [
  "Wanderer",
  "Dreamer",
  "Scholar",
  "Adventurer",
  "Rookie",
];

export default function OnboardingPage() {
  const router = useRouter();

  // State Management
  const [characterName, setCharacterName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[0]);
  const [selectedTitle, setSelectedTitle] = useState(TITLE_OPTIONS[0]);

  const handleBeginJourney = () => {
    const finalName = characterName.trim() || "Cyrill";
    console.log("Initializing Ascendant Character:", {
      name: finalName,
      avatar: selectedAvatar.label,
      theme: selectedTheme.name,
      title: selectedTitle,
    });
    router.push("/dashboard");
  };

  const SelectedAvatarIcon = selectedAvatar.icon;

  return (
    <div className="min-h-screen w-full bg-[#0B1020] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-x-hidden selection:bg-[#3b82f6] selection:text-white">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[10%] w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER BAR */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-white tracking-wide">
              CHARACTER CREATION
            </h1>
            <p className="text-xs text-blue-400 font-mono -mt-0.5">
              INITIALIZE ASCENDANT PROFILE
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="border-white/10 text-slate-400 font-mono px-3 py-1"
        >
          STEP 1 OF 1 — IDENTITY
        </Badge>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        {/* LEFT COLUMN: SELECTION CONTROLS */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. IDENTITY INPUT */}
          <Card className="bg-[#151C33]/90 border-white/10 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span>1. Ascendant Identity</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Choose your character name (Max 20 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                maxLength={20}
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Cyrill"
                className="bg-[#0B1020] border-white/10 text-sm font-semibold h-11"
              />
            </CardContent>
          </Card>

          {/* 2. AVATAR SELECTION (12 GRID) */}
          <Card className="bg-[#151C33]/90 border-white/10 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>2. Select Avatar Emblem</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Choose your class emblem from 12 RPG archetypes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((avatar) => {
                  const Icon = avatar.icon;
                  const isSelected = selectedAvatar.id === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`p-3 rounded-[16px] bg-[#0B1020] border transition-all duration-200 flex flex-col items-center justify-center gap-2 group cursor-pointer ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-500/50 bg-blue-950/30 shadow-lg shadow-blue-900/30"
                          : "border-white/10 hover:border-white/25 hover:bg-white/5"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-[12px] flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-white/5 text-slate-400 group-hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[11px] font-mono ${
                          isSelected
                            ? "text-blue-300 font-semibold"
                            : "text-slate-400"
                        }`}
                      >
                        {avatar.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 3. THEME SELECTION & 4. STARTING TITLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* THEME SELECTION */}
            <Card className="bg-[#151C33]/90 border-white/10 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>3. UI Theme</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  {THEME_OPTIONS.map((theme) => {
                    const isSelected = selectedTheme.id === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? `ring-4 ${theme.ring} scale-110 shadow-lg ${theme.glow}`
                            : "opacity-70 hover:opacity-100 hover:scale-105"
                        }`}
                        style={{ backgroundColor: theme.hex }}
                        title={theme.name}
                      >
                        {isSelected && (
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* STARTING TITLE */}
            <Card className="bg-[#151C33]/90 border-white/10 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span>4. Starting Title</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {TITLE_OPTIONS.map((title) => {
                    const isSelected = selectedTitle === title;
                    return (
                      <button
                        key={title}
                        type="button"
                        onClick={() => setSelectedTitle(title)}
                        className={`px-3 py-1.5 rounded-[12px] text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40 border border-blue-400/50"
                            : "bg-[#0B1020] text-slate-400 border border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {title}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE CHARACTER PREVIEW CARD & SUBMIT */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="bg-[#151C33] border-white/10 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
            {/* AMBIENT CARD TOP GLOW */}
            <div
              className="absolute top-0 left-0 right-0 h-2 transition-colors duration-300"
              style={{ backgroundColor: selectedTheme.hex }}
            />

            <CardHeader className="text-center pt-8 pb-4">
              <Badge
                variant="secondary"
                className="mx-auto mb-2 text-[10px] uppercase tracking-widest font-mono"
              >
                CHARACTER PREVIEW
              </Badge>

              {/* AVATAR EMBLEM PREVIEW */}
              <div
                className="w-24 h-24 rounded-[28px] mx-auto flex items-center justify-center shadow-2xl transition-all duration-300 border-2 border-white/20 my-4"
                style={{ backgroundColor: selectedTheme.hex }}
              >
                <SelectedAvatarIcon className="w-12 h-12 text-white drop-shadow-lg" />
              </div>

              <CardTitle className="text-2xl font-bold font-heading text-white tracking-wide">
                {characterName.trim() || "Cyrill"}
              </CardTitle>

              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge variant="gold" className="text-xs">
                  {selectedTitle}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs border-white/10 text-slate-400"
                >
                  Level 1 Ascendant
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* STAT PREVIEW MATRIX */}
              <div className="p-4 rounded-[16px] bg-[#0B1020] border border-white/10 space-y-3 font-sans">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Initial Attributes
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Strength</span>
                      <span className="font-mono text-blue-400 font-bold">
                        10 / 100
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[10%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Discipline</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        12 / 100
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[12%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Consistency</span>
                      <span className="font-mono text-amber-400 font-bold">
                        15 / 100
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[15%]" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="p-6 pt-0">
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={handleBeginJourney}
                className="w-full h-12 text-sm font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all"
                style={{ backgroundColor: selectedTheme.hex }}
              >
                <span>Begin Journey</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
