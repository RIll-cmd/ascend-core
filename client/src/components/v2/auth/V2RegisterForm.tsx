"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/8bit/checkbox";
import { V2GuestPass } from "./V2GuestPass";

interface V2RegisterFormProps {
  onSwitchToLogin?: () => void;
  onGuestEntry?: () => void;
  onSuccess?: () => void;
  forceLoading?: boolean;
  forceError?: string | null;
  forceSuccess?: boolean;
}

export function V2RegisterForm({
  onSwitchToLogin,
  onGuestEntry,
  onSuccess,
  forceLoading = false,
  forceError = null,
  forceSuccess = false,
}: V2RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [botTrap, setBotTrap] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeError = forceError ?? localError;
  const isLoading = forceLoading || isSubmitting;

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "None", color: "bg-zinc-800" };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-rose-500" };
      case 2:
        return { score: 50, label: "Moderate", color: "bg-amber-500" };
      case 3:
        return { score: 75, label: "Strong", color: "bg-cyan-500" };
      case 4:
        return { score: 100, label: "Maximum", color: "bg-emerald-500" };
      default:
        return { score: 15, label: "Very Weak", color: "bg-rose-600" };
    }
  };

  const strength = getPasswordStrength();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (botTrap) return;

    if (!username.trim()) {
      setLocalError("Please enter an operative username.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setLocalError("Please enter a valid communications email.");
      return;
    }
    if (password.length < 8) {
      setLocalError("Security passcode must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passcodes do not match.");
      return;
    }
    if (!acceptTerms) {
      setLocalError("You must accept the operative protocol guidelines.");
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
    }, 900);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Form Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold tracking-tight text-zinc-100">
          Commission New Hunter License
        </h2>
        <p className="text-xs text-zinc-400">
          Create an operative profile to initialize your daily habit telemetry and workout logs.
        </p>
      </div>

      {/* Success Notification */}
      {forceSuccess && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-1"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-emerald-100">License Commissioned</span>
            <span className="text-[11px] text-emerald-300/80">
              Initializing Starter Beast Egg and Level 1 Attribute Deck...
            </span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {activeError && !forceSuccess && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-1"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-rose-100">Registration Incomplete</span>
            <span className="text-[11px] text-rose-300/90">{activeError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Honeypot Bot Trap */}
        <div style={{ position: "absolute", left: "-9999px", opacity: 0 }} aria-hidden="true">
          <label htmlFor="v2_register_bot_trap">Do not fill this field</label>
          <input
            id="v2_register_bot_trap"
            type="text"
            name="bot_trap"
            tabIndex={-1}
            value={botTrap}
            onChange={(e) => setBotTrap(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Username Field */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="v2_reg_username"
            className="text-xs font-semibold text-zinc-300 flex items-center justify-between"
          >
            <span>Hunter Handle (Username)</span>
            <span className="text-[11px] font-normal text-zinc-500">Public Tag</span>
          </Label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              <User className="w-4 h-4" />
            </div>
            <Input
              id="v2_reg_username"
              type="text"
              name="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (localError) setLocalError(null);
              }}
              required
              disabled={isLoading}
              placeholder="e.g. shadow_monarch"
              className="pl-10 min-h-[44px] bg-zinc-900/90 border-zinc-800 focus:border-cyan-500 text-zinc-100 placeholder:text-zinc-600 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm font-mono"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="v2_reg_email"
            className="text-xs font-semibold text-zinc-300 flex items-center justify-between"
          >
            <span>Communications Email</span>
            <span className="text-[11px] font-normal text-zinc-500">Verification</span>
          </Label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="v2_reg_email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (localError) setLocalError(null);
              }}
              required
              disabled={isLoading}
              placeholder="hunter@ascend.io"
              className="pl-10 min-h-[44px] bg-zinc-900/90 border-zinc-800 focus:border-cyan-500 text-zinc-100 placeholder:text-zinc-600 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="v2_reg_password"
              className="text-xs font-semibold text-zinc-300"
            >
              Security Passcode
            </Label>
            {password && (
              <span className="text-[11px] font-mono text-zinc-400">
                Strength: <span className="font-bold text-zinc-200">{strength.label}</span>
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              id="v2_reg_password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (localError) setLocalError(null);
              }}
              required
              disabled={isLoading}
              placeholder="Min. 8 characters with numbers"
              className="pl-10 pr-10 min-h-[44px] bg-zinc-900/90 border-zinc-800 focus:border-cyan-500 text-zinc-100 placeholder:text-zinc-600 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1 rounded-md focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Gauge Bar */}
          {password && (
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="v2_reg_confirm_password"
            className="text-xs font-semibold text-zinc-300"
          >
            Confirm Passcode
          </Label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <Input
              id="v2_reg_confirm_password"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (localError) setLocalError(null);
              }}
              required
              disabled={isLoading}
              placeholder="Re-enter security passcode"
              className="pl-10 min-h-[44px] bg-zinc-900/90 border-zinc-800 focus:border-cyan-500 text-zinc-100 placeholder:text-zinc-600 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm font-mono"
            />
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group min-h-[36px]">
            <Checkbox
              id="v2-register-accept-terms"
              checked={acceptTerms}
              onCheckedChange={(c) => setAcceptTerms(Boolean(c))}
              className="mt-0.5"
            />
            <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors leading-relaxed">
              I agree to the Ascend Protocol Covenant, biometric data safeguards, and terms of service.
            </span>
          </label>
        </div>

        {/* Commission Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[44px] bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-cyan-950/40 cursor-pointer mt-2 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Forging Hunter License...</span>
            </div>
          ) : (
            <span>Initiate Operative License</span>
          )}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
        <span>Already hold an active license?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-md outline-none px-1"
        >
          Log In to Terminal
        </button>
      </div>

      {/* Guest Pass */}
      <V2GuestPass onGuestEntry={onGuestEntry} isLoading={isLoading} />
    </div>
  );
}
