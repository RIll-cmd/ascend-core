"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { AscendPendingSpinner } from "@/components/loading/AscendPendingSpinner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Input } from "@/components/ui/8bit/input";
import { Label } from "@/components/ui/8bit/label";
import { Checkbox } from "@/components/ui/8bit/checkbox";
import { GuestAccessDialog } from "@/components/auth/GuestAccessDialog";

import { useAuthStore } from "@/store/useAuthStore";
import { playBuffSFX } from "@/utils/audio";

import "@/components/ui/8bit/styles/retro.css";

export interface LoginFormProps extends React.ComponentProps<"div"> {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  onSuccess?: () => void;
  onGuestEntry?: () => void;
}

export function LoginForm({
  className,
  title,
  subtitle,
  imageSrc = "/ancient_library_pixel.png",
  onSuccess,
  onGuestEntry,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please provide an operative tag or email.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Passcode must be at least 6 characters.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await useAuthStore
        .getState()
        .loginWithCredentials(identifier.trim(), password);
      if (!res.success) {
        setError(res.error || "Authentication failed. Access denied.");
        setIsLoading(false);
        return;
      }
      try {
        playBuffSFX("levelup");
      } catch {}
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error.";
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    if (onGuestEntry) {
      onGuestEntry();
      return;
    }
    setIsGuestDialogOpen(true);
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-4xl mx-auto px-2 sm:px-4", className)} {...props}>
      <Card font="normal" className="p-0 overflow-hidden bg-[#141414] border-black shadow-[6px_6px_0_0_#000]">
        <CardContent font="normal" className="grid p-0 md:grid-cols-2">
          {/* Left: Login Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 inline-flex items-center gap-1.5 border border-black bg-[#fcba28] px-2.5 py-0.5 text-[8px] font-black uppercase text-black shadow-[1px_1px_0_0_#000]">
                  {"// COMMAND DECK GATEWAY"}
                </div>
                <h1 className="retro text-base sm:text-lg font-black text-white tracking-wider">
                  {title || "WELCOME BACK"}
                </h1>
                <p className="retro text-balance text-[8px] sm:text-[9px] text-neutral-400 mt-1 leading-relaxed">
                  {subtitle || "Authenticate hunter credentials to access Command Deck"}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 border border-red-500 bg-red-950/60 p-2.5 retro text-[8px] text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email / Tag Input */}
              <div className="grid gap-1.5">
                <Label htmlFor="email" font="retro" className="text-[9px] text-neutral-300">
                  EMAIL OR HUNTER TAG
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="hunter@ascend.io"
                  value={identifier}
                  font="normal"
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" font="retro" className="text-[9px] text-neutral-300">
                    SECURITY PASSCODE
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="retro text-[8px] text-[#14b6e5] underline-offset-2 hover:underline"
                  >
                    Forgot passcode?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter passcode (min 6 chars)"
                  value={password}
                  font="normal"
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Remember Me 8-bit Checkbox */}
              <div className="flex items-center gap-2.5 select-none pt-1">
                <Checkbox
                  id="login-remember-me"
                  checked={rememberMe}
                  onCheckedChange={(c) => setRememberMe(Boolean(c))}
                />
                <label
                  htmlFor="login-remember-me"
                  className="retro text-[8px] sm:text-[9px] text-neutral-400 cursor-pointer hover:text-neutral-200 transition-colors"
                >
                  Maintain terminal session (30 days)
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                borderStyle="retro-beveled"
                disabled={isLoading}
                className="retro w-full bg-[#fcba28] dark:bg-[#fcba28] text-black dark:text-black hover:bg-[#ffd700] dark:hover:bg-[#ffd700] font-black tracking-wider text-[9px] sm:text-[10px] py-3 shadow-[3px_3px_0_0_#000]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <AscendPendingSpinner label="Authenticating operative" />
                    AUTHENTICATING...
                  </span>
                ) : (
                  "AUTHENTICATE OPERATIVE"
                )}
              </Button>

              {/* Guest Sandbox Entry */}
              <Button
                type="button"
                onClick={handleGuest}
                disabled={isLoading}
                variant="outline"
                size="md"
                borderStyle="retro-beveled"
                className="retro w-full border-2 border-[#14b6e5] text-[#14b6e5] hover:bg-[#14b6e5]/10 font-black tracking-wider text-[8px] sm:text-[9px] py-2.5 shadow-[2px_2px_0_0_#000] cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <AscendPendingSpinner label="Opening guest session" />
                    ENTERING HUNTER REALM...
                  </span>
                ) : (
                  "[ ENTER AS GUEST HUNTER ]"
                )}
              </Button>

              <div className="retro text-center text-[8px] text-neutral-400">
                Don&apos;t have an operative tag?{" "}
                <Link href="/register" className="text-[#fcba28] underline underline-offset-4 hover:text-[#ffd700]">
                  Commission License
                </Link>
              </div>
            </div>
          </form>

          {/* Right: Retro Pixel Image Pane */}
          <div className="relative hidden bg-neutral-900 md:block overflow-hidden border-l-2 border-black min-h-[480px]">
            <Image
              src={imageSrc}
              alt="Hunter Realm"
              fill
              priority
              className="object-cover pixelated"
            />
            {/* Scanlines & Vignette */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)",
              }}
              aria-hidden="true"
            />

            {/* In-game HUD overlay box */}
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <div className="border-2 border-black bg-[#141414]/95 p-4 shadow-[4px_4px_0_0_#000]">
                <div className="flex items-center justify-between mb-1">
                  <span className="retro text-[9px] text-[#fcba28] font-black uppercase tracking-wider">
                    SECTOR 07: ARCHIVE
                  </span>
                  <span className="retro text-[8px] text-[#00ff88] font-bold">
                    ONLINE 99.4%
                  </span>
                </div>
                <p className="retro text-[8px] sm:text-[9px] text-neutral-300 leading-relaxed">
                  Transform workouts, deep focus streaks, and circadian discipline into legendary in-game combat power.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <GuestAccessDialog open={isGuestDialogOpen} onOpenChange={setIsGuestDialogOpen} />

      {/* Footer Legal Covenant */}
      <p className="retro text-balance text-center text-[9px] text-neutral-400 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-[#14b6e5] tracking-wider leading-relaxed">
        By connecting, you agree to the <Link href="/terms">Hunter Covenant</Link>{" "}
        and <Link href="/privacy">Privacy Protocol</Link>.
      </p>
    </div>
  );
}

export default LoginForm;
