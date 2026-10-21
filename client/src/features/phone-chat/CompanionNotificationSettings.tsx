"use client";

import { Bell, BellOff, LockKeyhole } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PhoneChatApi } from "./api";

const api = new PhoneChatApi();

function decodeVapidKey(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
  return bytes;
}

export function CompanionNotificationSettings({ deviceId }: { deviceId: string | null }) {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [discordEnabled, setDiscordEnabled] = useState(false);
  const [discordLinked, setDiscordLinked] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushConfigEnabled, setPushConfigEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPushSupported("serviceWorker" in navigator && "PushManager" in window && "Notification" in window);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!deviceId) return;
    let disposed = false;
    void api.getNotificationPushConfig()
      .then(async (config) => {
        if (disposed) return;
        setNotificationsEnabled(config.enabled);
        setPushConfigEnabled(config.enabled && Boolean(config.vapidPublicKey));
        if (!config.enabled) return;
        const [preferences, discord] = await Promise.all([
          api.getNotificationPreferences(deviceId), api.getDiscordLink(deviceId),
        ]);
        if (disposed) return;
        setPushEnabled(preferences.pwa_push);
        setDiscordEnabled(preferences.discord_dm);
        setDiscordLinked(discord.linked);
      })
      .catch(() => { if (!disposed) setError("Notification settings could not be loaded."); });
    return () => { disposed = true; };
  }, [deviceId]);

  const togglePush = useCallback(async () => {
    if (!deviceId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      let subscription = await registration.pushManager.getSubscription();
      if (!pushEnabled) {
        const config = await api.getNotificationPushConfig();
        if (!config.enabled || !config.vapidPublicKey) throw new Error("Push notifications are not configured on this deployment.");
        const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
        if (permission !== "granted") throw new Error("Browser notification permission was not granted.");
        if (subscription) {
          await subscription.unsubscribe();
          subscription = null;
        }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidKey(config.vapidPublicKey),
        });
        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new Error("The browser returned an incomplete push subscription.");
        await api.registerPushSubscription({ deviceId, endpoint: json.endpoint, keys: json.keys as { p256dh: string; auth: string } });
        await api.setNotificationPreference(deviceId, "pwa_push", true);
        setPushEnabled(true);
      } else {
        await api.setNotificationPreference(deviceId, "pwa_push", false);
        await api.revokePushSubscription(deviceId);
        await subscription?.unsubscribe();
        setPushEnabled(false);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Push settings could not be changed.");
    } finally {
      setBusy(false);
    }
  }, [busy, deviceId, pushEnabled]);

  const toggleDiscord = useCallback(async () => {
    if (!deviceId || busy || !discordLinked) return;
    setBusy(true);
    setError(null);
    try {
      await api.setNotificationPreference(deviceId, "discord_dm", !discordEnabled);
      setDiscordEnabled(!discordEnabled);
    } catch {
      setError("Discord notification consent could not be changed.");
    } finally {
      setBusy(false);
    }
  }, [busy, deviceId, discordEnabled, discordLinked]);

  return (
    <section aria-label="Companion notification preferences" className="mx-auto w-full max-w-5xl border border-slate-700 bg-[#0c1220] p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-emerald-200">
        <Bell aria-hidden="true" className="h-4 w-4" />
        <h2 className="font-mono text-xs uppercase tracking-[.16em]">Private notifications</h2>
      </div>
      <p className="mb-4 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
        <LockKeyhole aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
        Lock-screen alerts reveal no message content. Open the signed-in app to read an update. Push and Discord consent are separate and off by default.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={togglePush} disabled={!deviceId || !notificationsEnabled || !pushSupported || !pushConfigEnabled || busy} aria-pressed={pushEnabled} className="inline-flex min-h-10 items-center gap-2 border border-slate-600 px-3 text-xs text-slate-200 hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
          {pushEnabled ? <BellOff aria-hidden="true" className="h-4 w-4" /> : <Bell aria-hidden="true" className="h-4 w-4" />}
          {pushEnabled ? "Turn off this phone" : "Enable this phone"}
        </button>
        <button type="button" onClick={toggleDiscord} disabled={!deviceId || !notificationsEnabled || !discordLinked || busy} aria-pressed={discordEnabled} className="inline-flex min-h-10 items-center gap-2 border border-slate-600 px-3 text-xs text-slate-200 hover:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
          {discordEnabled ? "Turn off Discord DMs" : "Enable Discord DMs"}
        </button>
      </div>
      {!notificationsEnabled && <p className="mt-3 text-xs text-slate-500">Companion notifications are not configured on this deployment yet.</p>}
      {!pushSupported && <p className="mt-3 text-xs text-slate-500">This browser does not support web push notifications.</p>}
      {notificationsEnabled && pushSupported && !pushConfigEnabled && <p className="mt-3 text-xs text-slate-500">Push delivery is not configured on this deployment yet.</p>}
      {notificationsEnabled && !discordLinked && <p className="mt-3 text-xs text-slate-500">Link Discord above before enabling its separate DM notifications.</p>}
      {error && <p role="alert" className="mt-3 text-xs text-rose-300">{error}</p>}
    </section>
  );
}

export function CompanionNotificationDetail({ deviceId }: { deviceId: string | null }) {
  const [intentId, setIntentId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ category: string; detail: string } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const current = new URL(window.location.href);
    const id = current.searchParams.get("notificationId");
    if (!id || !/^[A-Za-z0-9-]{1,64}$/.test(id)) return;
    current.searchParams.delete("notificationId");
    window.history.replaceState(window.history.state, "", current.href);
    const timer = window.setTimeout(() => setIntentId(id), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!deviceId || !intentId) return;
    let disposed = false;
    void api.getNotificationDetail(deviceId, intentId).then((value) => {
      if (!disposed) setDetail({ category: value.category, detail: value.detail });
    }).catch(() => { if (!disposed) setError(true); });
    return () => { disposed = true; };
  }, [deviceId, intentId]);

  if (!intentId) return null;
  return (
    <section aria-label="Private notification detail" className="mx-auto w-full max-w-5xl border border-emerald-800/70 bg-emerald-950/20 p-4">
      {detail ? <><p className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">{detail.category}</p><p className="mt-2 text-sm text-slate-100">{detail.detail}</p></> : error ? <p role="alert" className="text-sm text-slate-300">This private update is unavailable, expired, or the signed-in device is no longer active.</p> : <p className="text-sm text-slate-300">Loading private update…</p>}
      <button type="button" onClick={() => { setIntentId(null); setDetail(null); }} className="mt-3 text-xs text-emerald-300 underline">Dismiss</button>
    </section>
  );
}
