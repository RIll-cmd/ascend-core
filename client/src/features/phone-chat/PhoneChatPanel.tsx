"use client";

import { ArrowUp, LockKeyhole, MessageCircle, Plus, ShieldCheck, Smartphone, X } from "lucide-react";
import type { FormEvent } from "react";
import type { PhoneChatMessage } from "./types";
import { accessibleStatus, isPhoneChatPending } from "./types";

export interface PhoneChatPanelProps {
  ready: boolean;
  busy: boolean;
  messages: PhoneChatMessage[];
  input: string;
  error: string | null;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNewChat: () => void;
  onRevokeDevice: () => void;
}

export function PhoneChatPanel({
  ready, busy, messages, input, error, onInputChange, onSubmit, onNewChat, onRevokeDevice,
}: PhoneChatPanelProps) {
  return (
    <section aria-label="Ascend Vision phone chat" className="mx-auto flex h-full min-h-[32rem] max-h-[calc(100dvh-11rem)] w-full max-w-5xl flex-col overflow-hidden border border-slate-700 bg-[#080b14]/95 shadow-[0_18px_55px_rgba(0,0,0,.4)]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700 bg-[#0c1220] px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center border border-emerald-500/40 bg-emerald-950/50 text-emerald-300 shadow-[inset_0_0_18px_rgba(16,185,129,.08)]">
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-emerald-300">Vision · private channel</p>
            <h1 className="truncate font-pixel text-sm text-white sm:text-base">Phone link</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`hidden items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-wider sm:inline-flex ${ready ? "border-emerald-700/70 bg-emerald-950/40 text-emerald-300" : "border-amber-700/60 bg-amber-950/30 text-amber-300"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-emerald-400" : "bg-amber-400"}`} aria-hidden="true" />
            {ready ? "Connected" : "Connecting"}
          </span>
          <button type="button" onClick={onNewChat} disabled={busy} className="inline-flex min-h-10 items-center gap-1.5 border border-slate-700 px-2.5 text-xs text-slate-300 transition-colors hover:border-emerald-600 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3">
            <Plus aria-hidden="true" className="h-4 w-4" /> <span>New chat</span>
          </button>
          <button type="button" onClick={onRevokeDevice} disabled={!ready} aria-label="Revoke this phone device" title="Revoke this phone device" className="grid min-h-10 min-w-10 place-items-center border border-slate-700 text-slate-400 transition-colors hover:border-rose-700 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40">
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 bg-[#090e19] px-4 py-2.5 text-[11px] text-slate-400 sm:px-6">
        <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        <span>Chat stays in this tab. Only approved memories persist.</span>
        <span className="ml-auto hidden items-center gap-1 font-mono uppercase tracking-wider text-slate-500 md:inline-flex"><ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" /> No remote actions</span>
      </div>

      <div aria-live="polite" aria-relevant="additions text" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="grid min-h-full place-items-center py-8 text-center">
            <div className="max-w-sm">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center border border-slate-700 bg-[#0d1422] text-emerald-300"><Smartphone aria-hidden="true" className="h-6 w-6" /></div>
              <p className="font-pixel text-sm text-slate-100">Signal ready</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Ask Vision a question. Hub status answers use the latest verified Core snapshot; uncertain status is reported as unavailable.</p>
            </div>
          </div>
        ) : messages.map((message) => (
          <article key={message.messageId} aria-label={`You: ${message.text}`} className="ml-auto w-full max-w-2xl border border-slate-700/80 bg-[#111a29] px-4 py-3 sm:w-[88%]">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">{message.text}</p>
            <div className="mt-3 border-t border-slate-700/70 pt-2">
              {message.status === "completed" && message.reply ? (
                <div className="border-l-2 border-emerald-400 pl-3">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[.16em] text-emerald-300">Vision</p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">{message.reply}</p>
                </div>
              ) : isPhoneChatPending(message.status) ? (
                <p role="status" className="flex items-center gap-2 font-mono text-[11px] text-amber-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" aria-hidden="true" />{accessibleStatus(message)}</p>
              ) : (
                <p role="status" className={`font-mono text-[11px] ${message.status === "failed" || message.status === "expired" ? "text-rose-300" : "text-slate-400"}`}>
                  {accessibleStatus(message)}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {error && <p role="alert" className="mx-4 mb-2 border border-amber-800/70 bg-amber-950/30 px-3 py-2 text-xs text-amber-200 sm:mx-6">{error}</p>}

      <form aria-label="Send message to Vision" onSubmit={onSubmit} className="shrink-0 border-t border-slate-700 bg-[#0c1220] p-3 sm:p-4">
        <div className="flex items-end gap-2 border border-slate-700 bg-[#080b14] p-2 focus-within:border-emerald-600/80">
          <label className="sr-only" htmlFor="phone-chat-message">Message Vision</label>
          <textarea
            id="phone-chat-message"
            aria-label="Message Vision"
            value={input}
            onChange={(event) => onInputChange(event.currentTarget.value)}
            maxLength={4_000}
            rows={2}
            disabled={!ready || busy}
            placeholder={ready ? "Send a message…" : "Connecting to your private phone queue…"}
            className="max-h-36 min-h-12 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-5 text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="flex flex-col items-end gap-1.5">
            <span className="font-mono text-[9px] tabular-nums text-slate-500">{input.length}/4000</span>
            <button type="submit" disabled={!ready || busy || !input.trim() || input.length > 4_000} aria-label="Send message" className="grid h-10 w-10 place-items-center border border-emerald-500/60 bg-emerald-900/60 text-emerald-100 transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-600">
              <ArrowUp aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="px-1 pt-2 text-[10px] text-slate-500">No attachments, voice, tools, or Core actions in this version.</p>
      </form>
    </section>
  );
}
