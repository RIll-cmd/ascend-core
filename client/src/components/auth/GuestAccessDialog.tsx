"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/useAuthStore";

interface GuestAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestAccessDialog({ open, onOpenChange }: GuestAccessDialogProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setPassword("");
      setError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) {
      setError("Enter the guest access password to continue.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const result = await useAuthStore.getState().loginAsGuest(password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Guest access could not be verified.");
      return;
    }

    handleOpenChange(false);
    router.push("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm border-2 border-[#14b6e5] bg-[#141414] text-[#f9f4da] shadow-[6px_6px_0_0_#000]">
        <DialogHeader>
          <DialogTitle className="retro text-sm text-[#14b6e5]">GUEST ACCESS PASSWORD</DialogTitle>
          <DialogDescription className="retro text-[9px] leading-relaxed text-neutral-400">
            Guest access requires a password. Enter it to open a temporary hunter session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="guest-access-password" className="sr-only">
            Guest access password
          </label>
          <Input
            id="guest-access-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter guest password"
            disabled={isSubmitting}
            className="border-neutral-700 bg-black text-sm font-mono"
          />

          {error && (
            <p role="alert" className="flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="border-neutral-700 text-neutral-300"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#14b6e5] text-black hover:bg-cyan-300">
              <KeyRound className="size-4" />
              {isSubmitting ? "Checking..." : "Continue as Guest"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
