"use client";

import { useState } from "react";
import { Globe2, MessageCircle } from "lucide-react";
import { PhoneChatPanel } from "@/features/phone-chat/PhoneChatPanel";
import { DiscordLinkCard } from "@/features/phone-chat/DiscordLinkCard";
import { usePhoneChat } from "@/features/phone-chat/usePhoneChat";
import { CompanionContextCard } from "@/features/phone-chat/CompanionContextCard";
import { CompanionNotificationDetail, CompanionNotificationSettings } from "@/features/phone-chat/CompanionNotificationSettings";
import { BrowserTaskPanel } from "@/features/phone-chat/BrowserTaskPanel";
import { useBrowserTasks } from "@/features/phone-chat/useBrowserTasks";

export default function PhoneChatPage() {
  const chat = usePhoneChat();
  const [tab, setTab] = useState<"chat" | "browser">("chat");
  const browser = useBrowserTasks(chat.deviceId, chat.sessionId);
  const startNewChat = () => {
    void (async () => {
      try {
        await browser.endSession();
        chat.newChat();
      } catch {
        // Preserve the phone session if Core could not confirm browser-session end.
      }
    })();
  };
  return (
    <div className="flex min-h-full w-full flex-col gap-3 py-2">
      <nav aria-label="Vision phone features" className="mx-auto flex w-full max-w-5xl border border-slate-800 bg-[#090e19] p-1">
        <button type="button" role="tab" aria-selected={tab === "chat"} onClick={() => setTab("chat")} className={`flex min-h-11 flex-1 items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider transition-colors ${tab === "chat" ? "bg-emerald-950/50 text-emerald-200" : "text-slate-500 hover:text-slate-200"}`}><MessageCircle aria-hidden="true" className="h-4 w-4" /> Chat</button>
        <button type="button" role="tab" aria-selected={tab === "browser"} onClick={() => setTab("browser")} className={`flex min-h-11 flex-1 items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider transition-colors ${tab === "browser" ? "bg-cyan-950/55 text-cyan-100" : "text-slate-500 hover:text-slate-200"}`}><Globe2 aria-hidden="true" className="h-4 w-4" /> Browser</button>
      </nav>
      {tab === "browser" ? <BrowserTaskPanel tasks={browser} /> : <>
        {browser.error && <p role="alert" className="mx-auto w-full max-w-5xl border border-amber-800/70 bg-amber-950/25 px-4 py-2 text-xs text-amber-200">Browser session notice: {browser.error}</p>}
        <PhoneChatPanel
          ready={chat.ready}
          busy={chat.busy}
          messages={chat.messages}
          input={chat.input}
          error={chat.error}
          onInputChange={chat.setInput}
          onSubmit={chat.send}
          onSendAudio={chat.sendAudio}
          onCancelMessage={chat.cancelMessage}
          onNewChat={startNewChat}
          onRevokeDevice={chat.revokeDevice}
        />
        <DiscordLinkCard deviceId={chat.deviceId} />
        <CompanionNotificationDetail deviceId={chat.deviceId} />
        <CompanionNotificationSettings deviceId={chat.deviceId} />
        <CompanionContextCard deviceId={chat.deviceId} />
      </>}
    </div>
  );
}
