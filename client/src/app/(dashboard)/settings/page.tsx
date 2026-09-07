"use client";

import React, { useState, useEffect } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useThemeStore, ThemeMode } from "@/store/useThemeStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAiraStore } from "@/features/aira/store";
import { API_BASE_URL } from "@/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Sparkles,
  Palette,
  Shield,
  Save,
  Check,
  X,
  Moon,
  Swords,
  Crown,
  Wand2,
  Target as TargetIcon,
  Zap,
  Volume2,
  VolumeX,
  Bot,
  Bell,
  Sliders,
  RotateCcw,
  Eye,
  Flame,
  Mail,
  KeyRound,
  Send,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { playUISound, playAIRASound, playBuffSFX, playUIMenuSFX } from "@/utils/audio";

const TITLE_OPTIONS = [
  "Wanderer",
  "Dreamer",
  "Scholar",
  "Adventurer",
  "Rookie",
  "Shadow Seeker",
];

const THEME_SWATCHES = [
  {
    name: "Crimson Berserker",
    value: "crimson-berserker",
    hex: "#EF4444",
    bg: "bg-gradient-to-br from-red-600 to-amber-600 shadow-[0_0_15px_rgba(239,68,68,0.6)]",
  },
  {
    name: "Blue",
    value: "blue-rpg",
    hex: "#2563EB",
    bg: "bg-blue-600",
  },
  {
    name: "Purple",
    value: "purple-rpg",
    hex: "#9333EA",
    bg: "bg-purple-600",
  },
  {
    name: "Green",
    value: "green-rpg",
    hex: "#10B981",
    bg: "bg-emerald-500",
  },
  {
    name: "Red",
    value: "red-rpg",
    hex: "#EF4444",
    bg: "bg-red-500",
  },
  {
    name: "Gold",
    value: "gold-rpg",
    hex: "#F59E0B",
    bg: "bg-amber-500",
  },
];

const WORKOUT_THEME_OPTIONS = [
  {
    id: "crimson-berserker" as const,
    name: "Crimson Berserker / Blood Monarch",
    desc: "Deep Obsidian void (#030712) with Crimson Plasma (#EF4444), Molten Amber (#F97316) PR combustion, and pure white tabular numbers.",
    badge: "RECOMMENDED",
    badgeColor: "bg-red-950/80 text-red-300 border-red-500/50",
    gradient: "from-red-600 to-amber-600",
    border: "border-red-500/40",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.25)]",
  },
  {
    id: "shadow-monarch" as const,
    name: "Shadow Monarch / Abyssal Plasma",
    desc: "Pitch black void with shadow violet flames and cold silver runes.",
    badge: "SOLO LEVELING",
    badgeColor: "bg-purple-950/80 text-purple-300 border-purple-500/50",
    gradient: "from-purple-600 to-indigo-700",
    border: "border-purple-500/40",
    glow: "shadow-[0_0_20px_rgba(147,51,234,0.25)]",
  },
  {
    id: "cyber-kinetic" as const,
    name: "Solar Ion / Cyber Kinetic",
    desc: "Jet black telemetry HUD with electric volt yellow and telemetry cyan lines.",
    badge: "HIGH CONTRAST",
    badgeColor: "bg-yellow-950/80 text-yellow-300 border-yellow-500/50",
    gradient: "from-yellow-500 to-teal-500",
    border: "border-yellow-500/40",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.25)]",
  },
  {
    id: "titan-vanguard" as const,
    name: "Titan Vanguard / Tactical Biometrics",
    desc: "Gunmetal charcoal with phosphor amber instruments and mechanical gauges.",
    badge: "TACTICAL",
    badgeColor: "bg-amber-950/80 text-amber-300 border-amber-500/50",
    gradient: "from-amber-600 to-slate-600",
    border: "border-amber-500/40",
    glow: "shadow-[0_0_20px_rgba(217,119,6,0.25)]",
  },
];

const AVATAR_ARCHETYPES = [
  {
    id: "warrior",
    label: "Warrior",
    avatar: "/avatars/warrior.png",
    fallback: "WR",
    icon: Swords,
    color: "from-red-600 to-amber-700",
  },
  {
    id: "mage",
    label: "Mage",
    avatar: "/avatars/mage.png",
    fallback: "MG",
    icon: Wand2,
    color: "from-purple-600 to-indigo-800",
  },
  {
    id: "rogue",
    label: "Rogue",
    avatar: "/avatars/rogue.png",
    fallback: "RG",
    icon: Zap,
    color: "from-emerald-600 to-teal-800",
  },
  {
    id: "ranger",
    label: "Ranger",
    avatar: "/avatars/ranger.png",
    fallback: "RN",
    icon: TargetIcon,
    color: "from-amber-600 to-yellow-700",
  },
  {
    id: "shadow-monarch",
    label: "Shadow Monarch",
    avatar: "/avatars/shadow-monarch.png",
    fallback: "SM",
    icon: Crown,
    color: "from-blue-600 to-indigo-900",
  },
];

export default function SettingsPage() {
  const { character, updateIdentity } = useCharacterStore();
  const { theme: mode, setTheme: setMode, workoutTheme, setWorkoutTheme } = useThemeStore();
  const {
    soundEnabled,
    sfxVolume,
    voiceVolume,
    airaPeriodicEnabled,
    airaIntervalSeconds,
    notificationSound,
    combatAnimations,
    glowIntensity,
    compactMode,
    setSoundEnabled,
    setSfxVolume,
    setVoiceVolume,
    setAiraPeriodicEnabled,
    setAiraIntervalSeconds,
    setNotificationSound,
    setCombatAnimations,
    setGlowIntensity,
    setCompactMode,
    resetAllSettings,
  } = useSettingsStore();

  const { user, token, updateUserProfile } = useAuthStore();

  // Custom Username State
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Link Email State
  const [linkEmail, setLinkEmail] = useState("");
  const [linkOtp, setLinkOtp] = useState("");
  const [isSendingLinkOtp, setIsSendingLinkOtp] = useState(false);
  const [isVerifyingLinkOtp, setIsVerifyingLinkOtp] = useState(false);
  const [linkOtpSent, setLinkOtpSent] = useState(false);
  const [linkOtpCooldown, setLinkOtpCooldown] = useState(0);

  const [name, setName] = useState(character?.name || user?.username || "Shadow Monarch");
  const [title, setTitle] = useState(character?.title || "Shadow Seeker");
  const [accentTheme, setAccentTheme] = useState(
    character?.theme || "dark-rpg"
  );
  const [avatar, setAvatar] = useState(
    character?.avatar || "/avatars/shadow-monarch.png"
  );

  useEffect(() => {
    if (user?.username) {
      setNewUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    if (linkOtpCooldown > 0) {
      const timer = setTimeout(() => setLinkOtpCooldown(linkOtpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [linkOtpCooldown]);

  // Debounced Username Availability Check
  useEffect(() => {
    if (!newUsername.trim() || newUsername.trim().toLowerCase() === user?.username?.toLowerCase()) {
      setUsernameStatus("idle");
      setUsernameError(null);
      return;
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      setUsernameStatus("taken");
      setUsernameError("Must be 3–20 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      setUsernameStatus("taken");
      setUsernameError("Alphanumeric and underscores only");
      return;
    }

    setUsernameStatus("checking");
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/check-availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: newUsername }),
        });
        const data = await res.json();
        if (data.usernameAvailable) {
          setUsernameStatus("available");
          setUsernameError(null);
        } else {
          setUsernameStatus("taken");
          setUsernameError(data.usernameError || "Username is taken");
        }
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [newUsername, user?.username]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || usernameStatus === "taken" || newUsername.trim() === user?.username) return;

    setIsUpdatingUsername(true);
    playUIMenuSFX("confirm");
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/update-username`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ username: newUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || "Failed to update handle.");
        setIsUpdatingUsername(false);
        return;
      }
      updateUserProfile({ username: data.username });
      setName(data.username);
      playBuffSFX("levelup");
      toast.success("Hunter handle successfully synchronized!");
      setUsernameStatus("idle");
    } catch {
      toast.error("Network error updating username.");
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleRequestLinkOtp = async () => {
    if (!linkEmail.trim() || !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(linkEmail.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSendingLinkOtp(true);
    playUIMenuSFX("confirm");
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/link-email/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ email: linkEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || "Failed to dispatch verification code.");
        setIsSendingLinkOtp(false);
        return;
      }
      setLinkOtpSent(true);
      setLinkOtpCooldown(60);
      playBuffSFX("buff");
      toast.success(`Verification cipher dispatched to ${linkEmail}.`);
    } catch {
      toast.error("Network error requesting verification code.");
    } finally {
      setIsSendingLinkOtp(false);
    }
  };

  const handleVerifyLinkOtp = async () => {
    if (!linkOtp.trim() || linkOtp.trim().length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    setIsVerifyingLinkOtp(true);
    playUIMenuSFX("confirm");
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/link-email/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ email: linkEmail.trim(), otp: linkOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || "Verification failed.");
        setIsVerifyingLinkOtp(false);
        return;
      }
      updateUserProfile({ email: data.email, isEmailVerified: true });
      playBuffSFX("levelup");
      toast.success("Neural email link verified & permanently linked!");
      setLinkOtpSent(false);
      setLinkEmail("");
      setLinkOtp("");
    } catch {
      toast.error("Network error verifying code.");
    } finally {
      setIsVerifyingLinkOtp(false);
    }
  };

  useEffect(() => {
    if (character) {
      setName(character.name || user?.username || "Shadow Monarch");
      setTitle(character.title || "Shadow Seeker");
      setAccentTheme(character.theme || "dark-rpg");
      setAvatar(character.avatar || "/avatars/shadow-monarch.png");
    }
  }, [character, user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateIdentity({
      name: name.trim() || "Ascendant",
      title,
      theme: accentTheme,
      avatar,
    });
    playBuffSFX("buff");
    toast.success("System & Character preferences saved successfully!");
  };

  const testAudioPlayback = () => {
    if (!soundEnabled) {
      toast.info("Audio is currently disabled. Toggle sound ON to test.");
      return;
    }
    playUISound("/sounds/General/10_UI_Menu_SFX/013_Confirm_03.wav", 0.8);
    playAIRASound("CONFIRMED");
    toast.success("Playing test audio cue...");
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            System Control & Preferences
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Manage audio levels, timely AIRA tactical briefings, display modes, and RPG character persona.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              resetAllSettings();
              toast.info("Settings reset to defaults.");
            }}
            className="border-slate-700 text-slate-400 hover:text-white text-xs font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* 0. ACCOUNT CREDENTIALS & NEURAL LINK */}
      <Card className="bg-[#151C33] border-cyan-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Account Credentials & Neural Link</span>
            </CardTitle>
            <Badge className="bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
              SECURITY CLEARANCE ACTIVE
            </Badge>
          </div>
          <CardDescription className="text-xs text-slate-400 font-sans">
            Customize your unique hunter handle and manage your verified email link for dual-identifier login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* USERNAME SECTION */}
          <div className="p-4 rounded-xl bg-[#0B1020] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Hunter Identifier (Username)
              </label>
              <div className="flex items-center gap-2">
                {usernameStatus === "checking" && (
                  <span className="text-[10px] font-mono text-cyan-400 animate-pulse">Checking...</span>
                )}
                {usernameStatus === "available" && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Available
                  </span>
                )}
                {usernameStatus === "taken" && (
                  <span className="text-[10px] font-mono text-red-400 font-bold flex items-center gap-1">
                    <X className="w-3 h-3" /> {usernameError || "Taken"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.trim())}
                placeholder="Custom Hunter Handle"
                className="h-10 bg-black/60 border-white/10 text-white font-mono text-xs rounded-xl flex-1 focus:border-cyan-500"
              />
              <Button
                type="button"
                onClick={handleUpdateUsername}
                disabled={isUpdatingUsername || usernameStatus === "taken" || newUsername === user?.username || !newUsername.trim()}
                className="h-10 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs rounded-xl disabled:opacity-40 cursor-pointer"
              >
                {isUpdatingUsername ? "Updating..." : "Update Handle"}
              </Button>
            </div>
          </div>

          {/* EMAIL LINKING SECTION */}
          <div className="p-4 rounded-xl bg-[#0B1020] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                Verified Neural Link (Email Address)
              </label>
              {user?.email && user?.isEmailVerified ? (
                <Badge className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-mono text-[10px] font-bold">
                  VERIFIED NEURAL LINK
                </Badge>
              ) : (
                <Badge className="bg-amber-950/80 border border-amber-500/50 text-amber-400 font-mono text-[10px]">
                  UNVERIFIED / UNLINKED
                </Badge>
              )}
            </div>

            {user?.email && user?.isEmailVerified ? (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between font-mono text-xs text-emerald-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{user.email}</span>
                </span>
                <span className="text-[10px] text-slate-400">Linked to Account</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={linkEmail}
                    onChange={(e) => setLinkEmail(e.target.value.trim())}
                    placeholder="Enter email to link"
                    className="h-10 bg-black/60 border-white/10 text-white font-mono text-xs rounded-xl flex-1 focus:border-cyan-500"
                  />
                  <Button
                    type="button"
                    onClick={handleRequestLinkOtp}
                    disabled={isSendingLinkOtp || !linkEmail.trim() || linkOtpCooldown > 0}
                    className="h-10 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold font-mono text-xs rounded-xl disabled:opacity-40 shrink-0 cursor-pointer"
                  >
                    {isSendingLinkOtp ? "Sending..." : linkOtpCooldown > 0 ? `${linkOtpCooldown}s` : linkOtpSent ? "Resend OTP" : "Send OTP"}
                  </Button>
                </div>

                {linkOtpSent && (
                  <div className="p-3 bg-violet-950/30 border border-violet-500/30 rounded-xl space-y-2 animate-in fade-in duration-300">
                    <span className="text-[11px] font-mono text-violet-300 block font-bold">
                      Enter 6-Digit Verification Cipher:
                    </span>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        maxLength={6}
                        value={linkOtp}
                        onChange={(e) => setLinkOtp(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="123456"
                        className="h-10 text-center font-mono text-base font-black tracking-[0.3em] bg-black/60 border-violet-500/40 text-cyan-300 rounded-lg flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyLinkOtp}
                        disabled={isVerifyingLinkOtp || linkOtp.length !== 6}
                        className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs rounded-lg disabled:opacity-40 cursor-pointer"
                      >
                        {isVerifyingLinkOtp ? "Verifying..." : "Verify & Link"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        {/* PREVIEW HERO CARD */}
        <Card className="bg-[#151C33] border-cyan-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Live Character Identity Preview
              </CardTitle>
              <Badge variant="default" className="text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                ACTIVE CONFIG
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex items-center gap-4">
            <Avatar className="w-16 h-16 rounded-[18px] border border-cyan-500/50 shadow-md">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-900 text-white font-bold">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-xl font-bold text-white font-heading tracking-tight">
                {name || "Ascendant"}
              </h2>
              <p className="text-xs text-cyan-400 font-medium flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" /> {title}
              </p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1">
                <span>Level {character?.level || 1}</span>
                <span>•</span>
                <span>Rank {character?.rank || "F"}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                  <span>{character?.power || 50} Power</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. AUDIO & SOUND PREFERENCES */}
        <Card className="bg-[#151C33] border-white/10 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-red-400" />
                )}
                <span>1. Audio & Sound Preferences</span>
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono cursor-pointer transition-colors ${
                  soundEnabled
                    ? "border-emerald-500/50 text-emerald-400 bg-emerald-950/30"
                    : "border-red-500/50 text-red-400 bg-red-950/30"
                }`}
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? "SOUND ON" : "MUTED"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Control master audio playback, sound effect volumes, and voice line cues.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B1020] border border-white/10">
              <div>
                <span className="text-xs font-bold text-white block">Master Audio Engine</span>
                <span className="text-[11px] text-slate-400">Enable or disable all in-app sounds and voice triggers globally.</span>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                  soundEnabled ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    soundEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Volume Controls (Sliders) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[#0B1020] border border-white/10 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">SFX / Menu Volume</span>
                  <span className="text-emerald-400 font-bold">{sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  disabled={!soundEnabled}
                  onChange={(e) => setSfxVolume(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1020] border border-white/10 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">AIRA Voice Volume</span>
                  <span className="text-cyan-400 font-bold">{voiceVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={voiceVolume}
                  disabled={!soundEnabled}
                  onChange={(e) => setVoiceVolume(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            {/* Test Audio Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={testAudioPlayback}
                className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/40 text-xs font-mono"
              >
                <Volume2 className="w-3.5 h-3.5 mr-1.5" /> Test Audio Cue
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. TIMELY AIRA & SYSTEM NOTIFICATIONS */}
        <Card className="bg-[#151C33] border-white/10 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>2. AIRA System Intelligence & Briefings</span>
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono cursor-pointer transition-colors ${
                  airaPeriodicEnabled
                    ? "border-cyan-500/50 text-cyan-400 bg-cyan-950/30"
                    : "border-slate-700 text-slate-500 bg-slate-900"
                }`}
                onClick={() => setAiraPeriodicEnabled(!airaPeriodicEnabled)}
              >
                {airaPeriodicEnabled ? "TIMELY AIRA ACTIVE" : "OFF"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Configure automatic floating HUD tactical notifications, diagnostic frequency, and chime cues.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timely AIRA Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B1020] border border-white/10">
              <div>
                <span className="text-xs font-bold text-white block">Timely AIRA Periodic Notifications</span>
                <span className="text-[11px] text-slate-400">
                  Allow AIRA to display background tactical briefs, habit reminders, and boss trajectory alerts.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAiraPeriodicEnabled(!airaPeriodicEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                  airaPeriodicEnabled ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    airaPeriodicEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Notification Chime Audio */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B1020] border border-white/10">
              <div>
                <span className="text-xs font-bold text-white block">Notification Chime Sound</span>
                <span className="text-[11px] text-slate-400">Play an audible chime when new AIRA briefings or quest milestones trigger.</span>
              </div>
              <button
                type="button"
                onClick={() => setNotificationSound(!notificationSound)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                  notificationSound ? "bg-indigo-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notificationSound ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Frequency Selector */}
            <div className="p-3.5 rounded-xl bg-[#0B1020] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-white block">Briefing Scan Frequency</span>
                <span className="text-[11px] text-slate-400">Interval between background status diagnostics.</span>
              </div>
              <select
                value={airaIntervalSeconds}
                onChange={(e) => setAiraIntervalSeconds(Number(e.target.value))}
                disabled={!airaPeriodicEnabled}
                className="bg-[#151C33] border border-white/15 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono disabled:opacity-40"
              >
                <option value={30}>Every 30 Seconds (Fast)</option>
                <option value={60}>Every 1 Minute (Standard)</option>
                <option value={120}>Every 2 Minutes</option>
                <option value={300}>Every 5 Minutes (Relaxed)</option>
                <option value={600}>Every 10 Minutes</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 3. GAMEPLAY & VISUAL PREFERENCES */}
        <Card className="bg-[#151C33] border-white/10 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Eye className="w-4 h-4 text-purple-400" />
              <span>3. Gameplay & Visual Atmosphere</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Tune visual effects, animation performance, and UI density.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Combat Animations */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B1020] border border-white/10">
              <div>
                <span className="text-xs font-bold text-white block">Combat & Particle Animations</span>
                <span className="text-[11px] text-slate-400">Show floating damage numbers, slash particle VFX, and boss battle animations.</span>
              </div>
              <button
                type="button"
                onClick={() => setCombatAnimations(!combatAnimations)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                  combatAnimations ? "bg-purple-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    combatAnimations ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Glow Intensity */}
            <div className="p-3.5 rounded-xl bg-[#0B1020] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-white block">Hologram & Cyber Glow Intensity</span>
                <span className="text-[11px] text-slate-400">Adjust ambient shadow glows and neon border halos.</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {(["low", "medium", "high"] as const).map((intensity) => (
                  <button
                    key={intensity}
                    type="button"
                    onClick={() => setGlowIntensity(intensity)}
                    className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all border ${
                      glowIntensity === intensity
                        ? "bg-purple-600/30 border-purple-500 text-purple-200 shadow-md"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B1020] border border-white/10">
              <div>
                <span className="text-xs font-bold text-white block">Compact Dashboard Density</span>
                <span className="text-[11px] text-slate-400">Condense list views and stat widgets for power users.</span>
              </div>
              <button
                type="button"
                onClick={() => setCompactMode(!compactMode)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                  compactMode ? "bg-blue-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    compactMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 4. BASIC CHARACTER INFO */}
        <Card className="bg-[#151C33] border-white/10 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>4. Character Basic Info</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Set your public character name displayed across dashboards and leaderboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <label className="text-xs font-mono text-slate-300 block font-semibold">
              Character Name (Max 20 characters)
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              maxLength={20}
              placeholder="Enter character name..."
              className="bg-[#0B1020] border-white/15 text-white max-w-md focus-visible:ring-blue-500 text-sm font-sans"
            />
            <p className="text-[11px] text-slate-500 font-mono">
              {name.length}/20 characters used
            </p>
          </CardContent>
        </Card>

        {/* 5. TITLE SELECTION */}
        <Card className="bg-[#151C33] border-white/10 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>5. Cosmetic Title Selection</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Select an unlocked cosmetic title to showcase under your character name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {TITLE_OPTIONS.map((t) => {
                const isActive = title === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTitle(t)}
                    className={`px-4 py-2 rounded-[14px] text-xs font-mono font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                      isActive
                        ? "bg-blue-600/30 border-blue-500 text-blue-200 shadow-md shadow-blue-500/20"
                        : "bg-[#0B1020] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 6. THEME ACCENT */}
        <Card className="bg-[#151C33] border-white/10 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>6. Theme Accent & Workout Terminal Aesthetics</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Choose your favorite RPG energy color scheme and specialized Kinetic Workout Terminal theme.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                RPG Global Energy Swatches
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                {THEME_SWATCHES.map((swatch) => {
                  const isActive =
                    accentTheme.includes(swatch.name.toLowerCase()) ||
                    accentTheme === swatch.value;
                  return (
                    <button
                      key={swatch.name}
                      type="button"
                      onClick={() => setAccentTheme(swatch.value)}
                      className={`w-12 h-12 rounded-[14px] ${
                        swatch.bg
                      } flex items-center justify-center transition-all cursor-pointer relative shadow-md ${
                        isActive
                          ? `ring-4 ring-white/80 scale-110 shadow-xl`
                          : "opacity-75 hover:opacity-100 hover:scale-105"
                      }`}
                      title={swatch.name}
                    >
                      {isActive && (
                        <Check className="w-5 h-5 text-white drop-shadow-md" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-2">
                Selected Theme Accent:{" "}
                <strong className="text-white capitalize">{accentTheme}</strong>
              </p>
            </div>

            {/* WORKOUT TERMINAL DEDICATED THEME */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold font-mono text-white block uppercase tracking-wider">
                    Kinetic Workout Terminal Theme (Gym HUD)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    High-contrast biometric theme engineered for gym visibility, tabular numbers, and PR combustion.
                  </span>
                </div>
                <Badge className="bg-red-950/80 border border-red-500/40 text-red-300 font-mono text-[10px]">
                  {workoutTheme.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {WORKOUT_THEME_OPTIONS.map((wTheme) => {
                  const isSelected = workoutTheme === wTheme.id;
                  return (
                    <button
                      key={wTheme.id}
                      type="button"
                      onClick={() => {
                        setWorkoutTheme(wTheme.id);
                        playUIMenuSFX("confirm");
                        toast.success(`${wTheme.name} activated for Workout Terminal`);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? `bg-[#0B0F19] ${wTheme.border} ${wTheme.glow} ring-2 ring-red-500/40`
                          : "bg-[#0B1020] border-white/10 hover:border-white/20 hover:bg-[#0E152B]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${wTheme.gradient}`}
                          />
                          <span className="text-xs font-bold text-white font-mono">
                            {wTheme.name}
                          </span>
                        </div>
                        <Badge
                          className={`${wTheme.badgeColor} border font-mono text-[9px] px-1.5 py-0.2`}
                        >
                          {wTheme.badge}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        {wTheme.desc}
                      </p>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold mt-1">
                          <Check className="w-3.5 h-3.5" /> ACTIVE WORKOUT THEME
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. AVATAR ARCHETYPE */}
        <Card className="bg-[#151C33] border-white/10 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Swords className="w-4 h-4 text-emerald-400" />
              <span>7. Avatar Archetype</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Select your active character display portrait from available RPG classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {AVATAR_ARCHETYPES.map((arch) => {
                const isActive = avatar === arch.avatar;
                const ClassIcon = arch.icon;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setAvatar(arch.avatar)}
                    className={`p-4 rounded-[18px] bg-[#0B1020] border transition-all cursor-pointer flex flex-col items-center gap-3 relative group ${
                      isActive
                        ? "border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/20"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    <Avatar className="w-14 h-14 rounded-[16px] border border-white/15">
                      <AvatarImage src={arch.avatar} alt={arch.label} />
                      <AvatarFallback
                        className={`rounded-[16px] bg-gradient-to-br ${arch.color} text-white font-bold text-sm`}
                      >
                        {arch.fallback}
                      </AvatarFallback>
                    </Avatar>

                    <div className="text-center">
                      <span className="text-xs font-bold text-white font-heading block">
                        {arch.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1 mt-0.5">
                        <ClassIcon className="w-3 h-3 text-slate-500" /> Class
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 8. PLATFORM DISPLAY MODE */}
        <Card className="bg-[#151C33] border-white/10 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="w-4 h-4 text-cyan-400" />
              <span>8. Platform Display Mode</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Toggle global application color scheme.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono">
              Active Mode:{" "}
              <strong className="text-blue-400 uppercase">{mode}</strong>
            </span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ThemeMode)}
              className="bg-[#0B1020] border border-white/15 text-white text-xs px-3 py-2 rounded-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="dark">Dark Mode (#0B1020)</option>
              <option value="light">Light Mode</option>
              <option value="system">System Default</option>
            </select>
          </CardContent>
        </Card>

        {/* SAVE ACTION BUTTON */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
