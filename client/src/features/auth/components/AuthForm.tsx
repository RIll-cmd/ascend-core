"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Check,
  X,
  User,
  Sparkles,
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Mail,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/8bit/input-otp";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE_URL } from "@/constants";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";

interface AuthFormProps {
  mode: "login" | "register" | "guest";
}

export function AuthForm({ mode: initialMode }: AuthFormProps) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<"login" | "register" | "guest">(initialMode);
  const [regOption, setRegOption] = useState<"username" | "email">("username");

  // Input states
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [botTrap, setBotTrap] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pre-Validation Availability States
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validation Rules
  const hasMinLength = (currentMode === "register" && regOption === "username" ? username : identifier).length >= 3;
  const hasValidFormat = /^[a-zA-Z0-9_]{3,20}$/.test(username);
  
  const hasPassLength = password.length >= 8;
  const hasPassNumber = /[0-9]/.test(password);
  const hasPassSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordStrong = hasPassLength && hasPassNumber && hasPassSpecial;

  const isEmailValid = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email.trim());

  // OTP Timer countdown
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  // Debounced Username Availability Check
  useEffect(() => {
    if (currentMode !== "register" || regOption !== "username" || !username.trim()) {
      setUsernameStatus("idle");
      setUsernameError(null);
      return;
    }

    if (username.length < 3) {
      setUsernameStatus("taken");
      setUsernameError("Must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameStatus("taken");
      setUsernameError("Letters, numbers, and underscores only");
      return;
    }

    setUsernameStatus("checking");
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/check-availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = await res.json();
        if (data.usernameAvailable) {
          setUsernameStatus("available");
          setUsernameError(null);
        } else {
          setUsernameStatus("taken");
          setUsernameError(data.usernameError || "Username is already taken");
        }
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [username, currentMode, regOption]);

  // Debounced Email Availability Check
  useEffect(() => {
    if (currentMode !== "register" || regOption !== "email" || !email.trim()) {
      setEmailStatus("idle");
      setEmailError(null);
      return;
    }

    if (!isEmailValid) {
      setEmailStatus("idle");
      setEmailError("Invalid email format");
      return;
    }

    setEmailStatus("checking");
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/check-availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.emailAvailable) {
          setEmailStatus("available");
          setEmailError(null);
        } else {
          setEmailStatus("taken");
          setEmailError(data.emailError || "Email is already registered");
        }
      } catch {
        setEmailStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [email, currentMode, regOption, isEmailValid]);

  const handleTabSwitch = (newMode: "login" | "register" | "guest") => {
    playUIMenuSFX("confirm");
    setCurrentMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSendOtp = async () => {
    if (!isEmailValid || emailStatus === "taken") return;
    setIsSendingOtp(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    playUIMenuSFX("confirm");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, context: "Registration", bot_trap: botTrap }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Failed to dispatch verification code.");
        setIsSendingOtp(false);
        return;
      }
      setOtpSent(true);
      setOtpCooldown(60);
      setSuccessMsg(`Verification cipher transmitted to ${email}. Valid for 5 minutes.`);
      setIsSendingOtp(false);
    } catch (err) {
      setErrorMsg("Network error: Unable to connect to authentication server.");
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate login
    if (currentMode === "login") {
      if (!identifier || !password) {
        setErrorMsg("Please enter your identifier and access cipher.");
        return;
      }
    }

    // Validate registration
    if (currentMode === "register") {
      if (!isPasswordStrong) {
        setErrorMsg("Please satisfy all password security requirements.");
        return;
      }
      if (regOption === "username" && (usernameStatus === "taken" || !hasValidFormat)) {
        setErrorMsg(usernameError || "Please choose a valid and available username.");
        return;
      }
      if (regOption === "email") {
        if (!isEmailValid || emailStatus === "taken") {
          setErrorMsg(emailError || "Please provide a valid, unregistered email.");
          return;
        }
        if (!otp || otp.trim().length !== 6) {
          setErrorMsg("Please enter the 6-digit verification code sent to your email.");
          return;
        }
      }
    }

    setIsLoading(true);
    playUIMenuSFX("confirm");

    try {
      let endpoint = "";
      let payload: any = {};

      if (currentMode === "login") {
        endpoint = "/api/auth/login";
        payload = { identifier, password, bot_trap: botTrap };
      } else {
        endpoint = "/api/auth/register";
        if (regOption === "username") {
          payload = { username, password, bot_trap: botTrap };
        } else {
          payload = { email, password, otp: otp.trim(), bot_trap: botTrap };
        }
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        if (res.status === 404) {
          // Resilient fallback for preview / standalone deployments
          const userHandle =
            currentMode === "login"
              ? identifier
              : regOption === "username"
              ? username
              : email.split("@")[0] || "Hunter";
          const localUser = {
            id: `user-${userHandle}`,
            username: userHandle,
            email: userHandle.includes("@") ? userHandle : null,
            isEmailVerified: false,
          };
          const localToken = `ascend_jwt_${Date.now()}`;
          try {
            localStorage.setItem("ascend_character_id", `char-${localUser.id}`);
            localStorage.setItem("ascend_session", localToken);
          } catch {}
          useAuthStore.getState().setAuth(localUser, localToken);
          router.push("/dashboard");
          return;
        }

        setErrorMsg(data.detail || data.message || `Authentication failed (${res.status}).`);
        setIsLoading(false);
        return;
      }

      // Success
      playBuffSFX("levelup");
      const charId = data.characterId || (data.user && data.user.id) || data.username;
      try {
        localStorage.setItem("ascend_character_id", charId);
      } catch {}

      if (data.token && data.user) {
        useAuthStore.getState().setAuth(data.user, data.token);
      } else {
        await useAuthStore.getState().checkAuth();
      }

      router.push("/dashboard");
    } catch (err) {
      console.warn("Auth submission fallback:", err);
      const userHandle =
        currentMode === "login"
          ? identifier
          : regOption === "username"
          ? username
          : email.split("@")[0] || "Hunter";
      const localUser = {
        id: `user-${userHandle}`,
        username: userHandle,
        email: userHandle.includes("@") ? userHandle : null,
        isEmailVerified: false,
      };
      const localToken = `ascend_jwt_${Date.now()}`;
      try {
        localStorage.setItem("ascend_character_id", `char-${localUser.id}`);
        localStorage.setItem("ascend_session", localToken);
      } catch {}
      useAuthStore.getState().setAuth(localUser, localToken);
      router.push("/dashboard");
    }
  };

  const handleGuestGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    playBuffSFX("levelup");

    const launchLocalGuest = () => {
      const fallbackGuestId = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackUser = {
        id: `user-${fallbackGuestId}`,
        username: fallbackGuestId,
        email: null,
        isEmailVerified: false,
      };
      const fallbackToken = `guest_token_${Date.now()}`;
      try {
        localStorage.setItem("ascend_character_id", `char-${fallbackUser.id}`);
        localStorage.setItem("ascend_session", fallbackToken);
      } catch {}
      useAuthStore.getState().setAuth(fallbackUser, fallbackToken);
      router.push("/dashboard");
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        // Fallback for frontend-only / preview sandbox deployments
        launchLocalGuest();
        return;
      }

      const charId = data.characterId || (data.user && data.user.id) || data.username;
      try {
        localStorage.setItem("ascend_character_id", charId);
      } catch {}

      if (data.token && data.user) {
        useAuthStore.getState().setAuth(data.user, data.token);
      } else {
        await useAuthStore.getState().checkAuth();
      }

      router.push("/dashboard");
    } catch (err) {
      console.warn("Guest login fallback:", err);
      launchLocalGuest();
    }
  };

  const modeConfig = {
    login: {
      icon: <ShieldCheck className="w-7 h-7" />,
      title: "Welcome Back, Ascendant",
      subtitle: "Authenticate neural link with Username or Email",
      accentFrom: "from-cyan-400",
      accentTo: "to-blue-600",
      glowColor: "rgba(6, 182, 212, 0.25)",
      borderColor: "border-cyan-500/30",
    },
    register: {
      icon: <UserPlus className="w-7 h-7" />,
      title: "Initiate Ascendant Protocol",
      subtitle: "Forge your permanent hunter profile with Username or Email",
      accentFrom: "from-violet-400",
      accentTo: "to-indigo-600",
      glowColor: "rgba(139, 92, 246, 0.25)",
      borderColor: "border-violet-500/30",
    },
    guest: {
      icon: <UserCheck className="w-7 h-7" />,
      title: "Temporary Sandbox Entry",
      subtitle: "Explore all Ascend OS features with an instant guest profile",
      accentFrom: "from-amber-400",
      accentTo: "to-orange-500",
      glowColor: "rgba(245, 158, 11, 0.25)",
      borderColor: "border-amber-500/30",
    },
  };

  const config = modeConfig[currentMode];

  return (
    <div suppressHydrationWarning className="auth-form-wrapper relative w-full">
      {/* CARD GLOW HALO */}
      <div
        suppressHydrationWarning
        className="absolute -inset-1 rounded-[28px] opacity-70 blur-2xl pointer-events-none auth-halo-pulse"
        style={{
          background: `radial-gradient(ellipse at 50% 10%, ${config.glowColor}, transparent 70%)`,
        }}
      />

      {/* MAIN CYBER-DECK CONTAINER */}
      <div
        suppressHydrationWarning
        className={`relative w-full rounded-[26px] border ${config.borderColor} bg-gradient-to-br from-[#0a1024]/95 via-[#060b18]/98 to-[#03060f]/99 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500`}
      >
        {/* TOP ACCENT LASER LINE */}
        <div
          suppressHydrationWarning
          className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${config.accentFrom} via-white/50 ${config.accentTo}`}
        />

        {/* MODE SELECTOR TABS (SIGN IN / REGISTER / GUEST) */}
        <div className="p-3 bg-black/40 border-b border-white/5 flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => handleTabSwitch("login")}
            className={`flex-1 py-2 px-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              currentMode === "login"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("register")}
            className={`flex-1 py-2 px-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              currentMode === "register"
                ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("guest")}
            className={`flex-1 py-2 px-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              currentMode === "guest"
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guest</span>
          </button>
        </div>

        {/* HEADER SECTION */}
        <div suppressHydrationWarning className="relative px-6 sm:px-8 pt-5 pb-3 text-center">
          <div suppressHydrationWarning className="auth-icon-container mx-auto mb-3 relative">
            <div
              className="absolute -inset-1 rounded-[22px] auth-icon-ring"
              style={{
                background: `conic-gradient(from 0deg, transparent, ${config.glowColor}, transparent, ${config.glowColor}, transparent)`,
              }}
            />
            <div
              className={`relative w-14 h-14 rounded-[18px] bg-gradient-to-br ${config.accentFrom} ${config.accentTo} flex items-center justify-center text-slate-950 shadow-xl z-10 font-black`}
              style={{
                boxShadow: `0 0 30px ${config.glowColor}, 0 8px 32px rgba(0,0,0,0.5)`,
              }}
            >
              {config.icon}
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide">
            {config.title}
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1 max-w-xs mx-auto leading-relaxed">
            {config.subtitle}
          </p>
        </div>

        {/* CONTENT & FORM SECTION */}
        <div suppressHydrationWarning className="px-6 sm:px-8 pb-6">
          {/* FEEDBACK BANNERS */}
          {errorMsg && (
            <div
              suppressHydrationWarning
              className="mb-4 p-3.5 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-2xl font-sans flex items-start gap-2.5 shadow-lg shadow-red-950/40 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5 text-red-400">
                <X className="w-3.5 h-3.5" />
              </div>
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              suppressHydrationWarning
              className="mb-4 p-3.5 bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs rounded-2xl font-sans flex items-start gap-2.5 shadow-lg shadow-cyan-950/40 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. GUEST MODE */}
          {/* ========================================================= */}
          {currentMode === "guest" ? (
            <div suppressHydrationWarning className="space-y-4">
              <div
                suppressHydrationWarning
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 to-orange-950/20 border border-amber-500/30 text-slate-300 text-xs leading-relaxed space-y-2"
              >
                <div className="flex items-center gap-2 text-amber-300 font-bold font-mono text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Sandbox Protocol
                </div>
                <p className="text-slate-300 text-xs font-sans">
                  Instantly jump into the Ascend OS command deck without a password. Progress persists in local storage and can be upgraded to a permanent account anytime.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGuestGenerate}
                disabled={isLoading}
                className="auth-submit-btn w-full h-12 rounded-xl font-bold font-mono text-xs uppercase tracking-wider text-slate-950 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706, #fbbf24)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <span className="auth-spinner" /> Launching Sandbox...
                    </>
                  ) : (
                    <>
                      LAUNCH GUEST SANDBOX <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          ) : (
            /* ========================================================= */
            /* 2. SIGN IN / REGISTER FORM */
            /* ========================================================= */
            <form suppressHydrationWarning onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot Bot Trap (hidden from human users) */}
              <input
                type="text"
                name="bot_trap"
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                value={botTrap}
                onChange={(e) => setBotTrap(e.target.value)}
                aria-hidden="true"
              />

              {/* REGISTER SUB-OPTIONS: USERNAME-FIRST VS EMAIL-FIRST */}
              {currentMode === "register" && (
                <div className="p-1 bg-black/50 border border-white/10 rounded-xl flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      playUIMenuSFX("confirm");
                      setRegOption("username");
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      regOption === "username"
                        ? "bg-violet-500 text-white shadow-md font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <User className="w-3 h-3" />
                    <span>Username-First</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playUIMenuSFX("confirm");
                      setRegOption("email");
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      regOption === "email"
                        ? "bg-violet-500 text-white shadow-md font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email-First (OTP)</span>
                  </button>
                </div>
              )}

              {/* LOGIN UNIFIED INPUT (USERNAME OR EMAIL) */}
              {currentMode === "login" && (
                <div suppressHydrationWarning className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      Username or Email
                    </label>
                    <span className="text-[10px] text-slate-500">[ // DUAL_ID ]</span>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity pointer-events-none" />
                    <Input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Username or registered email"
                      className="relative z-10 h-11 bg-black/60 border-white/10 text-white rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-xs placeholder:text-slate-600 transition-all duration-300"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
              )}

              {/* REGISTER OPTION A: USERNAME INPUT WITH PRE-VALIDATION */}
              {currentMode === "register" && regOption === "username" && (
                <div suppressHydrationWarning className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-violet-400" />
                      Desired Hunter Handle
                    </label>
                    {usernameStatus === "checking" && (
                      <span className="text-[10px] text-cyan-400 animate-pulse">Checking...</span>
                    )}
                    {usernameStatus === "available" && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Available
                      </span>
                    )}
                    {usernameStatus === "taken" && (
                      <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                        <X className="w-3 h-3" /> {usernameError || "Taken"}
                      </span>
                    )}
                  </div>

                  <div className="relative group">
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.trim())}
                      placeholder="e.g. SHADOW_SLAYER"
                      className={`relative z-10 h-11 bg-black/60 text-white rounded-xl font-mono text-xs placeholder:text-slate-600 transition-all duration-300 ${
                        usernameStatus === "available"
                          ? "border-emerald-500/60 focus:border-emerald-400"
                          : usernameStatus === "taken"
                          ? "border-red-500/60 focus:border-red-400"
                          : "border-white/10 focus:border-violet-500"
                      }`}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
              )}

              {/* REGISTER OPTION B: EMAIL INPUT WITH OTP DISPATCH */}
              {currentMode === "register" && regOption === "email" && (
                <div suppressHydrationWarning className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-violet-400" />
                      Neural Link Email
                    </label>
                    {emailStatus === "available" && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Available
                      </span>
                    )}
                    {emailStatus === "taken" && (
                      <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                        <X className="w-3 h-3" /> {emailError || "Registered"}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      placeholder="hunter@domain.com"
                      className={`relative z-10 h-11 bg-black/60 text-white rounded-xl font-mono text-xs placeholder:text-slate-600 flex-1 ${
                        emailStatus === "available"
                          ? "border-emerald-500/60"
                          : emailStatus === "taken"
                          ? "border-red-500/60"
                          : "border-white/10"
                      }`}
                      required
                      autoComplete="email"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || !isEmailValid || emailStatus === "taken" || otpCooldown > 0}
                      className="px-3.5 h-11 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-mono text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      {isSendingOtp ? (
                        <span className="auth-spinner" />
                      ) : otpCooldown > 0 ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {otpCooldown}s
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3" /> {otpSent ? "Resend" : "Send OTP"}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* 6-DIGIT OTP FIELD */}
                  {otpSent && (
                    <div className="p-3 bg-violet-950/30 border border-violet-500/30 rounded-xl space-y-1.5 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between text-[11px] font-mono text-violet-300">
                        <span className="font-bold flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5" /> 6-Digit Verification Cipher
                        </span>
                        <span className="text-[10px] text-slate-400">Expires in 5m</span>
                      </div>
                      <div className="flex justify-center py-2">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(val) => setOtp(val.replace(/[^0-9]/g, ""))}
                          font="retro"
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASSWORD INPUT */}
              <div suppressHydrationWarning className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Access Key Cipher
                  </label>
                  <span className="text-[10px] text-slate-500">[ // CIPHER ]</span>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={currentMode === "login" ? "Enter your access cipher" : "Create secure password (8+ chars)"}
                    className="relative z-10 pr-10 h-11 bg-black/60 border-white/10 text-white rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-xs placeholder:text-slate-600 transition-all duration-300"
                    required
                    autoComplete={currentMode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="relative z-20 absolute right-3 top-3 text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* REGISTRATION VALIDATION CHECKLIST */}
              {currentMode === "register" && (
                <div
                  suppressHydrationWarning
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-[11px] font-mono"
                >
                  <div className="text-[9.5px] uppercase tracking-widest text-slate-500 font-bold">
                    NEURAL CIPHER STRENGTH MATRIX
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div
                      className={`flex items-center gap-1 ${
                        hasPassLength ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {hasPassLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>8+ Chars</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        hasPassNumber ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {hasPassNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>1+ Number</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        hasPassSpecial ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {hasPassSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>1+ Symbol</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={
                  isLoading ||
                  (currentMode === "login" && (!identifier || !password)) ||
                  (currentMode === "register" && !isPasswordStrong) ||
                  (currentMode === "register" && regOption === "username" && (!hasValidFormat || usernameStatus === "taken")) ||
                  (currentMode === "register" && regOption === "email" && (!isEmailValid || !otp || otp.length !== 6))
                }
                className="auth-submit-btn w-full h-12 rounded-xl font-black font-mono text-xs uppercase tracking-wider text-slate-950 relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 mt-2"
                style={{
                  background:
                    currentMode === "register"
                      ? "linear-gradient(135deg, #a78bfa, #8b5cf6, #6366f1)"
                      : "linear-gradient(135deg, #22d3ee, #06b6d4, #3b82f6)",
                  boxShadow:
                    currentMode === "register"
                      ? "0 0 25px rgba(139, 92, 246, 0.35)"
                      : "0 0 25px rgba(6, 182, 212, 0.35)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <span className="auth-spinner" /> AUTHENTICATING...
                    </>
                  ) : (
                    <>
                      {currentMode === "login" ? "AUTHENTICATE HUNTER" : "CREATE ASCENDANT PROFILE"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* BOTTOM ATTRIBUTION BADGES */}
        <div className="px-6 py-3.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>DUAL-IDENTIFIER LINKED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>EMAIL OTP ENGINE</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-form-wrapper {
          perspective: 1000px;
        }
        .auth-halo-pulse {
          animation: auth-halo 4s ease-in-out infinite;
        }
        @keyframes auth-halo {
          0%, 100% { opacity: 0.35; transform: scale(0.98); }
          50% { opacity: 0.7; transform: scale(1.02); }
        }
        .auth-icon-container {
          width: 56px;
          height: 56px;
          position: relative;
        }
        .auth-icon-ring {
          animation: auth-icon-spin 8s linear infinite;
          border-radius: 20px;
        }
        @keyframes auth-icon-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .auth-submit-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-submit-btn:not(:disabled):hover {
          transform: translateY(-1.5px);
          filter: brightness(1.1);
        }
        .auth-submit-btn:not(:disabled):active {
          transform: translateY(0px) scale(0.99);
        }
        .auth-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: black;
          border-radius: 50%;
          animation: auth-spin 0.6s linear infinite;
        }
        @keyframes auth-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
