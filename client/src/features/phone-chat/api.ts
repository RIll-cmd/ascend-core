import { API_BASE_URL } from "@/constants";
import type {
  PhoneChatAccepted,
  PhoneChatDeviceResponse,
  PhoneChatMessageResponse,
  CompanionContextSnapshot,
  BrowserAvailability,
  BrowserSessionResponse,
  BrowserTaskReceipt,
  BrowserTaskView,
} from "./types";

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export interface PhoneChatRequestOptions {
  signal?: AbortSignal;
  bearerToken?: string | null;
}

export interface DiscordPairingCode {
  code: string;
  expiresAt: string;
}

export interface DiscordLinkStatus {
  linked: boolean;
}

export interface CompanionNotificationPreferences {
  pwa_push: boolean;
  discord_dm: boolean;
}

export interface PushConfig {
  enabled: boolean;
  vapidPublicKey: string | null;
}

export interface PushSubscriptionPayload {
  deviceId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface CompanionNotificationDetail {
  intentId: string;
  category: string;
  detail: string;
  createdAt: string;
  expiresAt: string;
}

export class PhoneChatApiError extends Error {
  constructor(readonly status: number) {
    super(`Phone chat request failed (${status})`);
    this.name = "PhoneChatApiError";
  }
}

export class PhoneChatApi {
  private readonly baseUrl: string;
  private readonly fetcher: Fetcher;
  private readonly tokenProvider: () => string | null;

  constructor(options: {
    baseUrl?: string;
    tokenProvider?: () => string | null;
    fetcher?: Fetcher;
  } = {}) {
    this.baseUrl = (options.baseUrl ?? API_BASE_URL).replace(/\/$/, "");
    this.tokenProvider = options.tokenProvider ?? (() => {
      try { return window.localStorage.getItem("ascend_session"); } catch { return null; }
    });
    this.fetcher = options.fetcher ?? ((input, init) => fetch(input, init));
  }

  async registerDevice(options: PhoneChatRequestOptions = {}): Promise<PhoneChatDeviceResponse> {
    return this.request("/api/phone-chat/devices", { method: "POST" }, options);
  }

  async getBrowserAvailability(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<BrowserAvailability> {
    return this.request("/api/browser-tasks/availability", {
      headers: { "X-Phone-Device": deviceId },
    }, options, true);
  }

  async createBrowserSession(payload: {
    deviceId: string;
    parentSessionId: string | null;
    providerConsent: string;
  }, options: PhoneChatRequestOptions = {}): Promise<BrowserSessionResponse> {
    return this.request("/api/browser-tasks/sessions", {
      method: "POST",
      headers: { "X-Phone-Device": payload.deviceId },
      body: JSON.stringify(payload),
    }, options, true);
  }

  async endBrowserSession(deviceId: string, browserSessionId: string,
    options: PhoneChatRequestOptions = {}): Promise<void> {
    await this.request(`/api/browser-tasks/sessions/${encodeURIComponent(browserSessionId)}/end`, {
      method: "POST",
      headers: { "X-Phone-Device": deviceId, "X-Browser-Session": browserSessionId },
      body: JSON.stringify({ browserSessionId }),
    }, options, true);
  }

  async enqueueBrowserTask(payload: {
    taskId: string;
    browserSessionId: string;
    laptopId: string;
    goal: string;
    scopeId: string;
    scopeVersion: number;
  }, deviceId: string, options: PhoneChatRequestOptions = {}): Promise<BrowserTaskReceipt> {
    return this.request("/api/browser-tasks/", {
      method: "POST",
      headers: { "X-Phone-Device": deviceId, "X-Browser-Session": payload.browserSessionId },
      body: JSON.stringify(payload),
    }, options, true);
  }

  async getBrowserTask(taskId: string, deviceId: string, browserSessionId: string, after = 0,
    options: PhoneChatRequestOptions = {}): Promise<BrowserTaskView> {
    const query = new URLSearchParams({ after: String(after) });
    return this.request(`/api/browser-tasks/${encodeURIComponent(taskId)}?${query}`, {
      headers: { "X-Phone-Device": deviceId, "X-Browser-Session": browserSessionId },
    }, options, true);
  }

  async controlBrowserTask(taskId: string, deviceId: string, browserSessionId: string,
    command: "pause" | "resume" | "stop", options: PhoneChatRequestOptions = {}): Promise<BrowserTaskReceipt> {
    return this.request(`/api/browser-tasks/${encodeURIComponent(taskId)}/control`, {
      method: "POST",
      headers: { "X-Phone-Device": deviceId, "X-Browser-Session": browserSessionId },
      body: JSON.stringify({ browserSessionId, command }),
    }, options, true);
  }

  async acknowledgeBrowserTask(taskId: string, deviceId: string, browserSessionId: string,
    options: PhoneChatRequestOptions = {}): Promise<void> {
    await this.request(`/api/browser-tasks/${encodeURIComponent(taskId)}/ack`, {
      method: "POST",
      headers: { "X-Phone-Device": deviceId, "X-Browser-Session": browserSessionId },
      body: JSON.stringify({ browserSessionId }),
    }, options, true);
  }

  async decideBrowserReview(taskId: string, actionId: string, proposalDigest: string, approved: boolean,
    deviceId: string, browserSessionId: string, options: PhoneChatRequestOptions = {}): Promise<void> {
    await this.request(`/api/browser-tasks/${encodeURIComponent(taskId)}/reviews/${encodeURIComponent(actionId)}`, {
      method: "POST",
      headers: { "X-Phone-Device": deviceId, "X-Browser-Session": browserSessionId },
      body: JSON.stringify({ browserSessionId, proposalDigest, approved }),
    }, options, true);
  }

  async consumeBrowserReviewAccess(deviceId: string, browserSessionId: string, token: string,
    options: PhoneChatRequestOptions = {}): Promise<{ taskId: string; expiresAt: string }> {
    return this.request("/api/browser-tasks/review-access/consume", {
      method: "POST",
      headers: { "X-Phone-Device": deviceId, "X-Browser-Session": browserSessionId },
      body: JSON.stringify({ browserSessionId, token }),
    }, options, true);
  }

  async enqueue(payload: {
    deviceId: string;
    messageId: string;
    sessionId: string;
    text: string;
  }, options: PhoneChatRequestOptions = {}): Promise<PhoneChatAccepted> {
    return this.request("/api/phone-chat/messages", {
      method: "POST",
      body: JSON.stringify(payload),
    }, options);
  }

  async enqueueAudio(payload: {
    deviceId: string;
    messageId: string;
    sessionId: string;
    audio: Blob;
    mimeType: string;
  }, options: PhoneChatRequestOptions = {}): Promise<PhoneChatAccepted> {
    const query = new URLSearchParams({
      deviceId: payload.deviceId, messageId: payload.messageId, sessionId: payload.sessionId,
    });
    return this.request(`/api/phone-chat/audio?${query}`, {
      method: "POST",
      body: payload.audio,
      headers: {
        "Content-Type": payload.mimeType,
        "X-Audio-Provider-Consent": "google-gemini",
      },
    }, options);
  }

  async getMessage(
    deviceId: string,
    messageId: string,
    options: PhoneChatRequestOptions = {},
  ): Promise<PhoneChatMessageResponse> {
    const query = new URLSearchParams({ deviceId });
    return this.request(`/api/phone-chat/messages/${encodeURIComponent(messageId)}?${query}`, {}, options);
  }

  async getCompanionContext(
    deviceId: string,
    options: PhoneChatRequestOptions = {},
  ): Promise<CompanionContextSnapshot> {
    const query = new URLSearchParams({ deviceId });
    return this.request(`/api/phone-chat/context?${query}`, {}, options, true);
  }

  async acknowledge(
    deviceId: string,
    messageId: string,
    options: PhoneChatRequestOptions = {},
  ): Promise<void> {
    await this.request(`/api/phone-chat/messages/${encodeURIComponent(messageId)}/ack?${new URLSearchParams({ deviceId })}`, {
      method: "POST",
    }, options);
  }

  async cancel(deviceId: string, messageId: string, options: PhoneChatRequestOptions = {}): Promise<void> {
    const query = new URLSearchParams({ deviceId });
    await this.request(`/api/phone-chat/messages/${encodeURIComponent(messageId)}/cancel?${query}`, {
      method: "POST",
    }, options);
  }

  async revokeDevice(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<void> {
    await this.request(`/api/phone-chat/devices/${encodeURIComponent(deviceId)}`, {
      method: "DELETE",
    }, options);
  }

  async createDiscordPairing(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<DiscordPairingCode> {
    const query = new URLSearchParams({ deviceId });
    return this.request(`/api/phone-chat/discord/pairing-codes?${query}`, { method: "POST" }, options, true);
  }

  async getDiscordLink(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<DiscordLinkStatus> {
    const query = new URLSearchParams({ deviceId });
    return this.request(`/api/phone-chat/discord/link?${query}`, {}, options, true);
  }

  async revokeDiscordLink(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<void> {
    const query = new URLSearchParams({ deviceId });
    await this.request(`/api/phone-chat/discord/link?${query}`, { method: "DELETE" }, options, true);
  }

  async getNotificationPushConfig(options: PhoneChatRequestOptions = {}): Promise<PushConfig> {
    return this.request("/api/phone-chat/notifications/push-config", {}, options, true);
  }

  async getNotificationPreferences(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<CompanionNotificationPreferences> {
    return this.request(`/api/phone-chat/notifications/preferences?${new URLSearchParams({ deviceId })}`, {}, options, true);
  }

  async setNotificationPreference(deviceId: string, channel: "pwa_push" | "discord_dm", enabled: boolean, options: PhoneChatRequestOptions = {}): Promise<{ channel: string; enabled: boolean }> {
    return this.request(`/api/phone-chat/notifications/preferences?${new URLSearchParams({ deviceId })}`, {
      method: "PUT", body: JSON.stringify({ channel, enabled }),
    }, options, true);
  }

  async registerPushSubscription(payload: PushSubscriptionPayload, options: PhoneChatRequestOptions = {}): Promise<void> {
    await this.request("/api/phone-chat/notifications/push-subscription", {
      method: "PUT", body: JSON.stringify(payload),
    }, options, true);
  }

  async revokePushSubscription(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<void> {
    await this.request(`/api/phone-chat/notifications/push-subscription?${new URLSearchParams({ deviceId })}`, {
      method: "DELETE",
    }, options, true);
  }

  async getNotificationDetail(deviceId: string, intentId: string, options: PhoneChatRequestOptions = {}): Promise<CompanionNotificationDetail> {
    const query = new URLSearchParams({ deviceId });
    return this.request(`/api/phone-chat/notifications/${encodeURIComponent(intentId)}?${query}`, {}, options, true);
  }

  private async request<T = void>(
    path: string,
    init: RequestInit,
    options: PhoneChatRequestOptions,
    sameOrigin = false,
  ): Promise<T> {
    const token = options.bearerToken === undefined ? this.tokenProvider() : options.bearerToken;
    const headers = new Headers(init.headers);
    if (init.body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await this.fetcher(sameOrigin ? path : `${this.baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      credentials: "include",
      signal: options.signal,
      headers,
    });
    if (!response.ok) throw new PhoneChatApiError(response.status);
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  }
}
