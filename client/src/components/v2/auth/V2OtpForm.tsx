"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, ArrowLeft, RefreshCw, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/8bit/input-otp";

interface V2OtpFormProps {
  email?: string;
  onBackToLogin?: () => void;
  onSuccess?: () => void;
  forceLoading?: boolean;
  forceError?: string | null;
  forceSuccess?: boolean;
}

export function V2OtpForm({
  email = "hunter_ciel@ascend.io",
  onBackToLogin,
  onSuccess,
  forceLoading = false,
  forceError = null,
  forceSuccess = false,
}: V2OtpFormProps) {
  const [otpValue, setOtpValue] = useState("7429");
  const [resendCountdown, setResendCountdown] = useState(42);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeError = forceError ?? localError;
  const isLoading = forceLoading || isSubmitting;

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 6) {
      setLocalError("Please enter all 6 digits of the security token.");
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
    }, 900);
  };

  const handleResend = () => {
    if (resendCountdown > 0) return;
    setResendCountdown(60);
    setLocalError(null);
    setOtpValue("");
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            Two-Factor Neural Verification
          </h2>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          A single-use 6-digit access code was dispatched to{" "}
          <span className="font-mono text-cyan-300 font-medium">{email}</span>.
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
            <span className="font-semibold text-emerald-100">Code Authenticated</span>
            <span className="text-[11px] text-emerald-300/80">
              Granting elevated access to Hunter Command Deck...
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
            <span className="font-semibold text-rose-100">Verification Token Invalid</span>
            <span className="text-[11px] text-rose-300/90">{activeError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 items-center">
        {/* 6-digit 8-bit OTP Input Array */}
        <div className="flex justify-center py-2">
          <InputOTP
            maxLength={6}
            value={otpValue}
            onChange={(val) => {
              setOtpValue(val.replace(/[^0-9]/g, ""));
              if (localError) setLocalError(null);
            }}
            disabled={isLoading}
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

        {/* Resend Action */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Didn&apos;t receive token?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCountdown > 0 || isLoading}
            className={`font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-md outline-none px-1 ${
              resendCountdown > 0
                ? "text-zinc-500 cursor-not-allowed"
                : "text-cyan-400 hover:text-cyan-300 hover:underline"
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${resendCountdown > 0 ? "" : "group-hover:rotate-180 transition-transform"}`} />
            {resendCountdown > 0 ? (
              <span>Resend in {resendCountdown}s</span>
            ) : (
              <span>Request Fresh Code</span>
            )}
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[44px] bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-cyan-950/40 cursor-pointer mt-2 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Validating Token Signature...</span>
            </div>
          ) : (
            <span>Authenticate & Access Deck</span>
          )}
        </Button>
      </form>

      {/* Return to Login */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer py-1.5 px-3 rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Primary Identification</span>
        </button>
      </div>
    </div>
  );
}
