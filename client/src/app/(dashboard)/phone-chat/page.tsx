"use client";

import { PhoneChatPanel } from "@/features/phone-chat/PhoneChatPanel";
import { usePhoneChat } from "@/features/phone-chat/usePhoneChat";

export default function PhoneChatPage() {
  const chat = usePhoneChat();
  return (
    <div className="flex min-h-full w-full flex-col justify-center py-2">
      <PhoneChatPanel
        ready={chat.ready}
        busy={chat.busy}
        messages={chat.messages}
        input={chat.input}
        error={chat.error}
        onInputChange={chat.setInput}
        onSubmit={chat.send}
        onNewChat={chat.newChat}
        onRevokeDevice={chat.revokeDevice}
      />
    </div>
  );
}
