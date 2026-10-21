"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrowserTaskPanel } from "@/features/phone-chat/BrowserTaskPanel";
import { useBrowserTasks } from "@/features/phone-chat/useBrowserTasks";
import { usePhoneChat } from "@/features/phone-chat/usePhoneChat";
import { useAuthStore } from "@/store/useAuthStore";

export default function BrowserReviewPage() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const chat = usePhoneChat();
  const browser = useBrowserTasks(chat.deviceId, chat.sessionId, true);
  const [handoff, setHandoff] = useState<string | null>(null);
  const captured = useRef(false);
  useEffect(() => {
    if (captured.current) return;
    captured.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("handoff");
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) setHandoff(token);
  }, []);
  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-[#080b14] px-3 py-8 text-slate-100 sm:px-6">
      {!authenticated ? <section className="space-y-3 border border-slate-700 p-5">
        <h1 className="text-lg font-semibold">Sign in to open your Discord browser task</h1>
        <p className="text-sm leading-6 text-slate-400">Sign in to the linked Ascend account, then open the task link from Discord again.</p>
        <Link href="/login" className="inline-flex min-h-11 items-center border border-cyan-600 px-4 text-cyan-200">Sign in</Link>
      </section> : browser.task ? <BrowserTaskPanel tasks={browser} reviewOnly /> : (
        <section className="space-y-4 border border-slate-700 p-5">
          <h1 className="text-lg font-semibold">Open this Discord browser task on this phone?</h1>
          <p className="max-w-prose text-sm leading-6 text-slate-400">This grants this phone access to one task for a limited time. Your Discord and phone chats stay separate.</p>
          {handoff ? <>
            <label className="flex items-start gap-3 text-sm leading-6">
              <input type="checkbox" checked={browser.providerConsent} onChange={(event) => browser.setProviderConsent(event.target.checked)} className="mt-1 h-5 w-5 accent-cyan-400" />
              <span>I agree to continue this browser session with {browser.availability?.provider ?? "the laptop's selected provider"}. Any website action needs its own review.</span>
            </label>
            <button type="button" disabled={!chat.deviceId || !browser.availability?.provider || !browser.providerConsent || browser.busy}
              onClick={() => { const token = handoff; setHandoff(null); void browser.openSharedTask(token); }}
              className="min-h-12 border border-cyan-500 bg-cyan-950/50 px-4 text-cyan-100 focus-visible:outline-2 focus-visible:outline-cyan-200 disabled:opacity-50">Open this task</button>
          </> : <p role="status" className="text-sm text-amber-200">This link is missing, was already opened, or could not be confirmed. Request a fresh link with /browser status in Discord.</p>}
          {browser.error && <p role="alert" className="text-sm text-rose-200">{browser.error}</p>}
          <Link href="/phone-chat" className="inline-flex min-h-11 items-center text-sm text-cyan-200 underline">Back to phone chat</Link>
        </section>
      )}
    </main>
  );
}
