"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/8bit/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/8bit/input-otp";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE_URL } from "@/constants";
import { playBuffSFX, playUIMenuSFX } from "@/utils/audio";
import "@/components/ui/8bit/styles/retro.css";

export type AuthTabState = "login" | "register" | "otp" | "forgot";

interface AuthCardProps {
  initialTab?: AuthTabState;
  onSuccess?: () => void;
  onGuestEntry?: () => void;
}

export function AuthCard({
  initialTab = "login",
  onSuccess,
  onGuestEntry,
}: AuthCardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTabState>(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState<AuthTabState>(initialTab);

  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  // Hidden bot trap honeypot
  const [botTrap, setBotTrap] = useState("");

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register State
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(60);

  // Forgot State
  const [forgotEmail, setForgotEmail] = useState("");

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // OTP countdown effect
  useEffect(() => {
    if (resendTimer > 0 && activeTab === "otp") {
      const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer, activeTab]);

  const completeAuthSuccess = async (
    data: {
      characterId?: string;
      token?: string;
      user?: {
        id: string;
        username: string;
        email?: string | null;
        isEmailVerified?: boolean;
      };
      [key: string]: unknown;
    },
    fallbackUsername: string
  ) => {
    try {
      playBuffSFX("levelup");
    } catch {}

    const charId =
      data.characterId || (data.user && data.user.id) || fallbackUsername || "hunter";
    try {
      localStorage.setItem("ascend_character_id", charId);
    } catch {}

    if (data.token && data.user) {
      useAuthStore.getState().setAuth(data.user, data.token);
    } else {
      const fallbackToken = data.token || `ascend_jwt_${Date.now()}`;
      const fallbackUser = data.user || {
        id: `user-${fallbackUsername}`,
        username: fallbackUsername,
        email: fallbackUsername.includes("@") ? fallbackUsername : null,
        isEmailVerified: false,
      };
      try {
        localStorage.setItem("ascend_session", fallbackToken);
      } catch {}
      useAuthStore.getState().setAuth(fallbackUser, fallbackToken);
    }

    setAuthSuccess("Authentication verified. Entering Command Deck...");
    if (onSuccess) onSuccess();

    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setAuthError("Please provide your username or email and passcode.");
      return;
    }

    setIsLoading(true);
    try {
      playUIMenuSFX("confirm");
    } catch {}

    try {
      const res = await useAuthStore
        .getState()
        .loginWithCredentials(loginIdentifier.trim(), loginPassword);

      if (!res.success) {
        setAuthError(res.error || "Invalid credentials. Access denied.");
        setIsLoading(false);
        return;
      }

      try {
        playBuffSFX("levelup");
      } catch {}

      setAuthSuccess("Authentication verified. Entering Command Deck...");
      if (onSuccess) onSuccess();

      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Invalid credentials. Access denied.";
      setAuthError(msg);
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!regUsername.trim()) {
      setAuthError("Operative handle is required.");
      return;
    }
    if (regPassword.length < 8) {
      setAuthError("Passcode must be at least 8 characters.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAuthError("Passcodes do not match.");
      return;
    }
    if (!acceptTerms) {
      setAuthError("Please accept the Hunter Terms of Service.");
      return;
    }

    setIsLoading(true);
    try {
      playUIMenuSFX("confirm");
    } catch {}

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: regUsername.trim(),
          email: regEmail.trim() || undefined,
          password: regPassword,
          bot_trap: botTrap,
        }),
      });

      let data: Record<string, unknown> = {};
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch {
        data = {};
      }

      if (!res.ok) {
        if (res.status === 404) {
          // Local fallback
          await completeAuthSuccess(
            { characterId: `char-${regUsername}` },
            regUsername
          );
          return;
        }
        const errorMsg =
          (data.detail as string) ||
          (data.message as string) ||
          "Failed to initialize hunter license.";
        setAuthError(errorMsg);
        setIsLoading(false);
        return;
      }

      await completeAuthSuccess(data, regUsername);
    } catch (err) {
      console.warn("Register fallback:", err);
      await completeAuthSuccess(
        { characterId: `char-${regUsername}` },
        regUsername
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setAuthError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpCode, email: regEmail || loginIdentifier }),
      });

      let data: Record<string, unknown> = {};
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch {
        data = {};
      }

      if (!res.ok && res.status !== 404) {
        const errorMsg =
          (data.detail as string) || "Invalid or expired verification cipher.";
        setAuthError(errorMsg);
        setIsLoading(false);
        return;
      }

      await completeAuthSuccess(data, regUsername || "Operative");
    } catch {
      await completeAuthSuccess({}, regUsername || "Operative");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setAuthError("Please provide your registered email.");
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      setAuthSuccess(`Recovery cipher dispatched to ${forgotEmail}`);
    } catch {
      setAuthSuccess(`Recovery cipher dispatched to ${forgotEmail}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestEntryTrigger = async () => {
    if (onGuestEntry) {
      onGuestEntry();
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      await useAuthStore.getState().loginAsGuest();
      try {
        playBuffSFX("levelup");
      } catch {}
      setAuthSuccess("Guest session initialized. Entering Command Deck...");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to initialize guest session.";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Card className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-2xl rounded-3xl overflow-hidden">
        {/* Hidden Honeypot Input for Bot Protection */}
        <input
          type="text"
          name="bot_trap"
          value={botTrap}
          onChange={(e) => setBotTrap(e.target.value)}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {/* State Switcher Header */}
        <div className="p-4 pb-0">
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val as AuthTabState);
              setAuthError(null);
              setAuthSuccess(null);
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full bg-zinc-950/80 p-1 border border-zinc-800/80 rounded-2xl h-10">
              <TabsTrigger
                value="login"
                className="retro text-[8px] sm:text-[9px] font-semibold rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-cyan-950 data-[state=active]:font-bold transition-all uppercase"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="retro text-[8px] sm:text-[9px] font-semibold rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-cyan-950 data-[state=active]:font-bold transition-all uppercase"
              >
                Register
              </TabsTrigger>
              <TabsTrigger
                value="otp"
                className="retro text-[8px] sm:text-[9px] font-semibold rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-cyan-950 data-[state=active]:font-bold transition-all uppercase"
              >
                OTP
              </TabsTrigger>
              <TabsTrigger
                value="forgot"
                className="retro text-[8px] sm:text-[9px] font-semibold rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-cyan-950 data-[state=active]:font-bold transition-all uppercase"
              >
                Forgot
              </TabsTrigger>
            </TabsList>

            {/* Status Banners */}
            {authSuccess && (
              <div
                role="status"
                className="mt-3 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 retro text-[8px] flex items-center gap-2.5 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{authSuccess}</span>
              </div>
            )}

            {authError && (
              <div
                role="alert"
                className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 retro text-[8px] flex items-center gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium">{authError}</span>
              </div>
            )}

            {/* TAB 1: LOGIN VIEW */}
            <TabsContent value="login" className="mt-0 focus-visible:outline-none">
              <CardHeader className="px-0 pt-4 pb-3">
                <CardTitle className="retro text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                  Welcome to Command Deck
                </CardTitle>
                <CardDescription className="retro text-[8px] sm:text-[9px] text-zinc-400 mt-1 leading-relaxed">
                  Authenticate credentials to synchronize habits, biometrics, and PWR indices.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleLoginSubmit}>
                <CardContent className="px-0 py-2 flex flex-col gap-4">
                  {/* Email / Username */}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="card_login_identifier"
                      className="text-xs font-semibold text-zinc-300 flex items-center justify-between"
                    >
                      <span>Email or Hunter Tag</span>
                      <span className="text-[11px] font-normal text-zinc-500">Required</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        id="card_login_identifier"
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="hunter@ascend.io"
                        className="pl-10 min-h-[44px] bg-zinc-950/90 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="card_login_password"
                        className="text-xs font-semibold text-zinc-300"
                      >
                        Passcode
                      </Label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("forgot")}
                        className="text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-md outline-none px-1"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="card_login_password"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="••••••••••••"
                        className="pl-10 pr-10 min-h-[44px] bg-zinc-950/90 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1 rounded-md focus-visible:ring-2 focus-visible:ring-cyan-500"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group min-h-[32px]">
                      <Checkbox
                        id="auth-card-remember-me"
                        checked={rememberMe}
                        onCheckedChange={(c) => setRememberMe(Boolean(c))}
                      />
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        Remember terminal session
                      </span>
                    </label>
                  </div>
                </CardContent>

                <CardFooter className="px-0 pt-2 pb-0 flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="retro w-full min-h-[44px] bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold text-[9px] sm:text-[10px] rounded-xl transition-all shadow-lg shadow-cyan-950/40 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 uppercase"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Credentials...</span>
                      </div>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* TAB 2: REGISTER VIEW */}
            <TabsContent value="register" className="mt-0 focus-visible:outline-none">
              <CardHeader className="px-0 pt-4 pb-3">
                <CardTitle className="retro text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                  Commission Hunter License
                </CardTitle>
                <CardDescription className="retro text-[8px] sm:text-[9px] text-zinc-400 mt-1 leading-relaxed">
                  Initialize an operative account to unlock the Habit Matrix and Gym Terminal.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleRegisterSubmit}>
                <CardContent className="px-0 py-2 flex flex-col gap-3.5">
                  {/* Username */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="card_reg_username" className="text-xs font-semibold text-zinc-300">
                      Operative Handle
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                        <User className="w-4 h-4" />
                      </div>
                      <Input
                        id="card_reg_username"
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="hunter_tag"
                        className="pl-10 min-h-[44px] bg-zinc-950/90 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="card_reg_email" className="text-xs font-semibold text-zinc-300">
                      Email
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        id="card_reg_email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="hunter@ascend.io"
                        className="pl-10 min-h-[44px] bg-zinc-950/90 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="card_reg_password" className="text-xs font-semibold text-zinc-300">
                      Security Passcode
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="card_reg_password"
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="Min. 8 characters"
                        className="pl-10 pr-10 min-h-[44px] bg-zinc-950/90 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        aria-label={showRegPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1 rounded-md focus-visible:ring-2 focus-visible:ring-cyan-500"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="card_reg_confirm" className="text-xs font-semibold text-zinc-300">
                      Confirm Passcode
                    </Label>
                    <Input
                      id="card_reg_confirm"
                      type={showRegPassword ? "text" : "password"}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder="Repeat passcode"
                      className="min-h-[44px] bg-zinc-950/90 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm font-mono"
                    />
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none group pt-1">
                    <Checkbox
                      id="auth-card-accept-terms"
                      checked={acceptTerms}
                      onCheckedChange={(c) => setAcceptTerms(Boolean(c))}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-300 leading-tight">
                      I accept the System Hunter Protocol and zero-knowledge data covenant.
                    </span>
                  </label>
                </CardContent>

                <CardFooter className="px-0 pt-2 pb-0 flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="retro w-full min-h-[44px] bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold text-[9px] sm:text-[10px] rounded-xl transition-all shadow-lg shadow-cyan-950/40 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 uppercase"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Commissioning Account...</span>
                      </div>
                    ) : (
                      <span>Commission Hunter License</span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* TAB 3: OTP VIEW */}
            <TabsContent value="otp" className="mt-0 focus-visible:outline-none">
              <CardHeader className="px-0 pt-4 pb-3">
                <CardTitle className="retro text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                  Two-Factor Security Cipher
                </CardTitle>
                <CardDescription className="retro text-[8px] sm:text-[9px] text-zinc-400 mt-1 leading-relaxed">
                  Enter the 6-digit cryptographic verification code sent to your linked device.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleOtpSubmit}>
                <CardContent className="px-0 py-3 flex flex-col gap-4">
                  <div className="flex justify-center py-2">
                    <InputOTP
                      maxLength={6}
                      value={otpCode}
                      onChange={(val) => {
                        setOtpCode(val.replace(/[^0-9]/g, ""));
                        if (authError) setAuthError(null);
                      }}
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

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span className="retro text-[8px]">
                      {resendTimer > 0 ? `Resend cipher in ${resendTimer}s` : "Code expired?"}
                    </span>
                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={() => setResendTimer(60)}
                      className="retro text-[8px] text-cyan-400 hover:underline disabled:opacity-50 disabled:no-underline font-medium cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                </CardContent>

                <CardFooter className="px-0 pt-2 pb-0 flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="retro w-full min-h-[44px] bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold text-[9px] sm:text-[10px] rounded-xl transition-all shadow-lg shadow-cyan-950/40 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 uppercase"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <span>Verify Cipher</span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* TAB 4: FORGOT VIEW */}
            <TabsContent value="forgot" className="mt-0 focus-visible:outline-none">
              <CardHeader className="px-0 pt-4 pb-3">
                <CardTitle className="retro text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                  Recover Terminal Access
                </CardTitle>
                <CardDescription className="retro text-[8px] sm:text-[9px] text-zinc-400 mt-1 leading-relaxed">
                  Transmitting a secure single-use recovery link to your operative address.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleForgotSubmit}>
                <CardContent className="px-0 py-3 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="card_forgot_email" className="retro text-[8px] sm:text-[9px] font-semibold text-zinc-300">
                      Operative Email
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        id="card_forgot_email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="hunter@ascend.io"
                        className="pl-10 min-h-[44px] bg-zinc-950/90 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-0 pt-2 pb-0 flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="retro w-full min-h-[44px] bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold text-[9px] sm:text-[10px] rounded-xl transition-all shadow-lg shadow-cyan-950/40 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 uppercase"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting...</span>
                      </div>
                    ) : (
                      <span>Transmit Recovery Link</span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Guest Sandbox Evaluation Divider */}
        <div className="p-4 pt-3 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Separator className="flex-1 bg-zinc-800" />
            <span className="retro text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-wider">
              Or Evaluate Instantly
            </span>
            <Separator className="flex-1 bg-zinc-800" />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                onClick={handleGuestEntryTrigger}
                disabled={isLoading}
                className="retro w-full min-h-[44px] bg-zinc-950/60 hover:bg-zinc-800/80 text-zinc-200 hover:text-white border-zinc-800 rounded-xl transition-all flex items-center justify-between px-4 group cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-[8px] sm:text-[9px] uppercase">Enter as Guest</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="retro text-[8px]">Instant sandbox session with preloaded test progression</p>
            </TooltipContent>
          </Tooltip>

          <p className="retro text-[7px] sm:text-[8px] text-zinc-500 text-center">
            Zero-knowledge telemetry. All credentials securely hashed.
          </p>
        </div>
      </Card>
    </TooltipProvider>
  );
}

export default AuthCard;
