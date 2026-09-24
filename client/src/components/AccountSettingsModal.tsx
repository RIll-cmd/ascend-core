"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, AlertTriangle } from "lucide-react";
import { playUIMenuSFX } from "@/utils/audio";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useAuthStore } from "@/store/useAuthStore";
import { fetcher } from "@/lib/api";
import { toast } from "sonner";
import { API_BASE_URL } from "@/constants";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

function useAccountSettings(username: string) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { character } = useCharacterStore();

  const handleDeleteAccount = async () => {
    if (confirmText !== username) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.detail || "Failed to delete account.");
        setIsDeleting(false);
        return;
      }

      // Success
      try {
        await fetcher("/api/auth/logout", { method: "POST" });
      } catch (e) {
        console.error("Logout failed:", e);
      }
      useAuthStore.getState().logout();
      playUIMenuSFX();
      router.push("/login");
    } catch (err) {
      console.error("Account deletion error:", err);
      toast.error("Network error. Could not delete account.");
      setIsDeleting(false);
    }
  };

  return { character, confirmText, setConfirmText, isDeleting, handleDeleteAccount };
}

function AccountSettingsContent({
  username,
  characterId,
  compact = false,
  confirmText,
  setConfirmText,
  isDeleting,
  handleDeleteAccount,
}: {
  username: string;
  characterId?: string;
  compact?: boolean;
  confirmText: string;
  setConfirmText: (value: string) => void;
  isDeleting: boolean;
  handleDeleteAccount: () => void;
}) {
  return (
    <div className="space-y-6 mt-2">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
        <div className={`flex justify-between text-sm ${compact ? "items-start gap-2" : "items-center"}`}>
          <span className="text-slate-400 font-semibold">Username:</span>
          <span className={`font-mono text-cyan-400 ${compact ? "min-w-0 break-all text-right" : ""}`}>{username}</span>
        </div>
        <div className={`flex justify-between text-sm ${compact ? "items-start gap-2" : "items-center"}`}>
          <span className="text-slate-400 font-semibold">Character ID:</span>
          <span className={`font-mono text-[10px] text-slate-500 ${compact ? "min-w-0 break-all text-right" : ""}`}>{characterId || "N/A"}</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30">
        <h3 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Danger Zone
        </h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          This action cannot be undone. All stats, items, workouts, habits, and progress for <span className="font-bold text-white">'{username}'</span> will be permanently wiped.
        </p>

        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-red-400/80 tracking-wider">
            Type "{username}" to confirm
          </label>
          <Input
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={username}
            className="bg-black/40 border-red-900/50 focus-visible:ring-red-500/50 text-red-300 font-mono"
          />
          <Button
            onClick={handleDeleteAccount}
            disabled={confirmText !== username || isDeleting}
            className={`w-full bg-red-600 hover:bg-red-500 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)] disabled:opacity-50 disabled:shadow-none transition-all ${compact ? "min-h-11 whitespace-normal" : ""}`}
          >
            {isDeleting ? "DELETING..." : "🗑️ PERMANENTLY DELETE ACCOUNT"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AccountSettingsModal({ isOpen, onClose, username }: AccountSettingsModalProps) {
  const settings = useAccountSettings(username);
  const handleClose = () => {
    settings.setConfirmText("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0B1020]/95 backdrop-blur-xl border-white/10 shadow-2xl text-white font-sans max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Account Settings
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Manage your Ascend OS account identity and data.
          </DialogDescription>
        </DialogHeader>
        <AccountSettingsContent
          username={username}
          characterId={settings.character?.id}
          confirmText={settings.confirmText}
          setConfirmText={settings.setConfirmText}
          isDeleting={settings.isDeleting}
          handleDeleteAccount={settings.handleDeleteAccount}
        />
      </DialogContent>
    </Dialog>
  );
}

export function AccountSettingsPage({ username }: { username: string }) {
  const settings = useAccountSettings(username);
  return (
    <section data-mobile-account-page className="mx-auto w-full max-w-lg space-y-5 pb-20 text-white">
      <header className="border-b border-white/10 pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <AlertTriangle className="size-5 shrink-0 text-red-500" />
          Account Settings
        </h1>
        <p className="mt-2 text-sm text-slate-400">Manage your Ascend OS account identity and data.</p>
      </header>
      <AccountSettingsContent
        username={username}
        characterId={settings.character?.id}
        compact
        confirmText={settings.confirmText}
        setConfirmText={settings.setConfirmText}
        isDeleting={settings.isDeleting}
        handleDeleteAccount={settings.handleDeleteAccount}
      />
    </section>
  );
}
