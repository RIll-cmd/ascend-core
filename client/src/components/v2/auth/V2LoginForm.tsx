"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/8bit/checkbox";
import { V2GuestPass } from "./V2GuestPass";

interface V2LoginFormProps {
  onSwitchToRegister?: () => void;
  onSwitchToForgot?: () => void;
  onGuestEntry?: () => void;
  onSuccess?: () => void;
  forceLoading?: boolean;
  forceError?: string | null;
  forceSuccess?: boolean;
}

export function V2LoginForm({
  onSwitchToRegister,
  onSwitchToForgot,
  onGuestEntry,
  onSuccess,
  forceLoading = false,
  forceError = null,
  forceSuccess = false,
}: V2LoginFormProps) {
  const [identifier, setIdentifier] = useState("hunter_ciel");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [botTrap, setBotTrap] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeError = forceError ?? localError;
  const isLoading = forceLoading || isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (botTrap) {
      // Honeypot triggered
      return;
    }
    if (!identifier.trim()) {
      setLocalError("Please enter your email or username.");
      return;
    }
    if (!password || password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
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
      {/* Form Title & Subtitle */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold tracking-tight text-zinc-100">
          Welcome back to the Command Deck
        </h2>
        <p className="text-xs text-zinc-400">
          Authenticate your credentials to sync habit progress and combat stats.
        </p>
      </div>

      {/* Success Notification Banner */}
      {forceSuccess && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-1"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-emerald-100">Authentication Verified</span>
            <span className="text-[11px] text-emerald-300/80">
              Synchronizing bio-telemetry and active raid state...
            </span>
          </div>
        </div>
      )}

      {/* Form Error Banner */}
      {activeError && !forceSuccess && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-1"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-rose-100">Authentication Failed</span>
            <span className="text-[11px] text-rose-300/90">{activeError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Honeypot Bot Trap (Invisible to real users and screen-readers) */}
        <div style={{ position: "absolute", left: "-9999px", opacity: 0 }} aria-hidden="true">
          <label htmlFor="v2_login_bot_trap">Do not fill this field</label>
          <input
            id="v2_login_bot_trap"
            type="text"
            name="bot_trap"
            tabIndex={-1}
            value={botTrap}
            onChange={(e) => setBotTrap(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Email or Username Input */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="v2_identifier"
            className="text-xs font-semibold text-zinc-300 flex items-center justify-between"
          >
            <span>Email or Username</span>
            <span className="text-[11px] font-normal text-zinc-500">Required</span>
          </Label>

          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="v2_identifier"
              type="text"
              name="identifier"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (localError) setLocalError(null);
              }}
              required
              disabled={isLoading}
              aria-invalid={activeError ? "true" : "false"}
              aria-describedby={activeError ? "v2_login_error_desc" : undefined}
              placeholder="hunter@ascend.io or hunter_id"
              className="pl-10 min-h-[44px] bg-zinc-900/90 border-zinc-800 focus:border-cyan-500 text-zinc-100 placeholder:text-zinc-600 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 text-sm"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="v2_password"
              className="text-xs font-semibold text-zinc-300"
            >
              Password
            </Label>
            <button
              type="button"
              onClick={onSwitchToForgot}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-md outline-none px-1"
            >
              Forgot code?
            </button>
          </div>

          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              id="v2_password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (localError) setLocalError(null);
              }}
              required
              disabled={isLoading}
              aria-invalid={activeError ? "true" : "false"}
              aria-describedby={activeError ? "v2_login_error_desc" : undefined}
              placeholder="Enter your security passcode"
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
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group min-h-[32px]">
            <Checkbox
              id="v2-login-remember-me"
              checked={rememberMe}
              onCheckedChange={(c) => setRememberMe(Boolean(c))}
            />
            <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Maintain terminal session (30 days)
            </span>
          </label>
        </div>

        {/* Submit Action */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[44px] bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-cyan-950/40 cursor-pointer mt-2 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Neural Signature...</span>
            </div>
          ) : (
            <span>Sign In to Terminal</span>
          )}
        </Button>
      </form>

      {/* Register Redirect Prompt */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
        <span>Need to initiate a new operative license?</span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-md outline-none px-1"
        >
          Create Hunter License
        </button>
      </div>

      {/* Guest Pass Sandbox */}
      <V2GuestPass onGuestEntry={onGuestEntry} isLoading={isLoading} />
    </div>
  );
}
