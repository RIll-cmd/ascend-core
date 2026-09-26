"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { PhoneChatApi, PhoneChatApiError } from "./api";
import {
  clearPhoneChatStorage,
  loadPhoneChatSession,
  retryPhoneChatRevocations,
  savePhoneChatSession,
  startNewPhoneChat,
  type PhoneChatStorage,
} from "./phoneChatSession";
import type { PhoneChatMessage, PhoneChatSession } from "./types";
import { isPhoneChatPending } from "./types";

const api = new PhoneChatApi();
const EMPTY_SESSION: PhoneChatSession = { sessionId: "", deviceId: null, messages: [] };

function newId(): string {
  return globalThis.crypto.randomUUID();
}

function browserStorage(): PhoneChatStorage | null {
  try { return window.sessionStorage; } catch { return null; }
}

function durableStorage(): PhoneChatStorage | null {
  try { return window.localStorage; } catch { return null; }
}

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const timer = window.setTimeout(done, milliseconds);
    function done() {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    }
    signal.addEventListener("abort", done, { once: true });
  });
}

export function usePhoneChat() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const [session, setSession] = useState<PhoneChatSession>(EMPTY_SESSION);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [revocationsReady, setRevocationsReady] = useState(false);
  const storageRef = useRef<PhoneChatStorage | null>(null);
  const sessionRef = useRef(session);
  const credentialRef = useRef<string | null>(null);
  const pollers = useRef(new Map<string, AbortController>());
  const registration = useRef<Promise<string> | null>(null);

  // Keep the last valid credential only in memory so logout can still revoke
  // this device after the auth store clears browser storage.
  useEffect(() => {
    if (token) credentialRef.current = token;
  }, [token]);

  const commit = useCallback((next: PhoneChatSession) => {
    sessionRef.current = next;
    setSession(next);
    savePhoneChatSession(storageRef.current, next);
  }, []);

  const updateMessage = useCallback((messageId: string, changes: Partial<PhoneChatMessage>) => {
    const current = sessionRef.current;
    const messages = current.messages.map((message) =>
      message.messageId === messageId ? { ...message, ...changes } : message,
    );
    commit({ ...current, messages });
  }, [commit]);

  const acknowledge = useCallback(async (deviceId: string, message: PhoneChatMessage, signal?: AbortSignal) => {
    try {
      await api.acknowledge(deviceId, message.messageId, { signal });
      updateMessage(message.messageId, { acknowledged: true });
    } catch {
      if (!signal?.aborted) updateMessage(message.messageId, { acknowledged: false });
    }
  }, [updateMessage]);

  const pollMessage = useCallback(async (deviceId: string, messageId: string, signal: AbortSignal) => {
    let delay = 1_000;
    while (!signal.aborted) {
      try {
        const response = await api.getMessage(deviceId, messageId, { signal });
        if (response.status === "completed") {
          const current = sessionRef.current.messages.find((item) => item.messageId === messageId);
          const reply = response.reply ?? current?.reply;
          if (!reply) {
            const unavailable: PhoneChatMessage = {
              ...(current ?? { messageId, text: "", createdAt: new Date().toISOString() }),
              status: "failed",
              errorCode: "reply_unavailable",
              reply: undefined,
              acknowledged: false,
            };
            updateMessage(messageId, unavailable);
            setError("The reply was already cleared before this tab received it. Start a new chat.");
            await acknowledge(deviceId, unavailable, signal);
            return;
          }
          const completed: PhoneChatMessage = {
            ...(current ?? { messageId, text: "", createdAt: new Date().toISOString() }),
            status: "completed",
            reply,
            errorCode: undefined,
            acknowledged: false,
          };
          updateMessage(messageId, completed);
          await acknowledge(deviceId, completed, signal);
          return;
        }
        if (response.status === "failed" || response.status === "expired") {
          const current = sessionRef.current.messages.find((item) => item.messageId === messageId);
          const terminal: PhoneChatMessage = {
            ...(current ?? { messageId, text: "", createdAt: new Date().toISOString() }),
            status: response.status,
            errorCode: response.errorCode ?? undefined,
            reply: undefined,
            acknowledged: false,
          };
          updateMessage(messageId, terminal);
          await acknowledge(deviceId, terminal, signal);
          return;
        }
        updateMessage(messageId, { status: response.status });
        setError(null);
      } catch (caught) {
        if (signal.aborted) return;
        if (caught instanceof PhoneChatApiError && [401, 403, 404].includes(caught.status)) {
          updateMessage(messageId, { status: "failed", errorCode: "device_unavailable", reply: undefined });
          setError(caught.status === 404
            ? "This queued message is no longer available. Start a new chat."
            : "Phone access was revoked or your sign-in expired.");
          return;
        }
        setError("Connection interrupted. Vision will retry while this tab stays open.");
      }
      await wait(delay, signal);
      delay = Math.min(delay * 2, 10_000);
    }
  }, [acknowledge, updateMessage]);

  const startPolling = useCallback((deviceId: string, messageId: string) => {
    if (pollers.current.has(messageId)) return;
    const controller = new AbortController();
    pollers.current.set(messageId, controller);
    void pollMessage(deviceId, messageId, controller.signal).finally(() => {
      if (pollers.current.get(messageId) === controller) pollers.current.delete(messageId);
    });
  }, [pollMessage]);

  useEffect(() => {
    const activePollers = pollers.current;
    if (!authenticated) {
      storageRef.current = browserStorage();
      sessionRef.current = EMPTY_SESSION;
      return;
    }

    storageRef.current = browserStorage();
    const restored = loadPhoneChatSession(storageRef.current, newId);
    commit(restored);
    let cancelled = false;

    const restoreQueue = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setRevocationsReady(false);
      try {
        await retryPhoneChatRevocations(durableStorage(), (pendingId) => api.revokeDevice(pendingId));
      } catch {
        if (!cancelled) setError("Could not finish revoking a previous phone device. Check your Core connection.");
        return;
      }
      if (cancelled) return;
      setRevocationsReady(true);
      let deviceId = restored.deviceId;
      if (!deviceId) {
        if (restored.messages.some((message) => isPhoneChatPending(message.status))) {
          const messages = restored.messages.map((message) => isPhoneChatPending(message.status)
            ? { ...message, status: "failed" as const, errorCode: "device_unavailable" }
            : message);
          commit({ ...restored, messages });
        }
        try {
          if (!registration.current) {
            registration.current = api.registerDevice().then(({ deviceId: id }) => id).finally(() => {
              registration.current = null;
            });
          }
          const registeredDeviceId = await registration.current;
          if (cancelled) return;
          deviceId = registeredDeviceId;
          commit({ ...sessionRef.current, deviceId });
        } catch (caught) {
          if (!cancelled) setError(caught instanceof PhoneChatApiError && caught.status === 401
            ? "Sign in to use phone chat."
            : "Phone chat is unavailable. Check your Core connection.");
          return;
        }
      }
      if (cancelled) return;
      for (const message of sessionRef.current.messages) {
        if (isPhoneChatPending(message.status)) startPolling(deviceId, message.messageId);
        else if (message.acknowledged === false) void acknowledge(deviceId, message);
      }
    };

    void restoreQueue();
    return () => {
      cancelled = true;
      for (const controller of activePollers.values()) controller.abort();
      activePollers.clear();
    };
  }, [authenticated, acknowledge, commit, startPolling]);

  const busy = session.messages.some((message) => isPhoneChatPending(message.status));
  const ready = authenticated && revocationsReady && Boolean(session.deviceId);

  const send = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    const current = sessionRef.current;
    if (!revocationsReady || !text || text.length > 4_000 || !current.deviceId || !current.sessionId
        || current.messages.some((message) => isPhoneChatPending(message.status))) return;
    const messageId = newId();
    const message: PhoneChatMessage = {
      messageId, text, status: "queued", createdAt: new Date().toISOString(),
    };
    commit({ ...current, messages: [...current.messages, message] });
    setInput("");
    setError(null);
    try {
      await api.enqueue({
        deviceId: current.deviceId,
        messageId,
        sessionId: current.sessionId,
        text,
      });
    } catch (caught) {
      if (caught instanceof PhoneChatApiError && [401, 403].includes(caught.status)) {
        updateMessage(messageId, { status: "failed", errorCode: "phone_access_unavailable" });
        setError("Phone access was revoked or your sign-in expired.");
        return;
      }
      // Reconcile once with the same ID in case Core accepted the POST but its
      // response was lost. Never keep retrying as a browser-side offline queue.
      try {
        await api.getMessage(current.deviceId, messageId);
      } catch {
        updateMessage(messageId, { status: "failed", errorCode: "send_unconfirmed" });
        setError("Core did not confirm this message. Check your connection and send it again.");
        return;
      }
    }
    startPolling(current.deviceId, messageId);
  }, [commit, input, revocationsReady, startPolling, updateMessage]);

  const newChat = useCallback(() => {
    if (sessionRef.current.messages.some((message) => isPhoneChatPending(message.status))) return;
    commit(startNewPhoneChat(storageRef.current, newId));
    setInput("");
    setError(null);
  }, [commit]);

  const revokeDevice = useCallback(() => {
    const deviceId = sessionRef.current.deviceId;
    if (!deviceId || (typeof window !== "undefined" && !window.confirm("Revoke this phone device and cancel its pending messages?"))) return;
    const bearerToken = credentialRef.current;
    void api.revokeDevice(deviceId, { bearerToken }).then(() => {
      clearPhoneChatStorage(storageRef.current);
      commit(EMPTY_SESSION);
      setError("This phone device was revoked.");
    }).catch(() => setError("Could not revoke this phone device. Please try again."));
  }, [commit]);

  return {
    ready,
    deviceId: ready ? session.deviceId : null,
    busy,
    messages: authenticated ? session.messages : [],
    input: authenticated ? input : "",
    error: authenticated ? error : null,
    setInput,
    send,
    newChat,
    revokeDevice,
  };
}
