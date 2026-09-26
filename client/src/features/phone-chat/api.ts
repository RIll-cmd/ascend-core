import { API_BASE_URL } from "@/constants";
import type {
  PhoneChatAccepted,
  PhoneChatDeviceResponse,
  PhoneChatMessageResponse,
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

  async getMessage(
    deviceId: string,
    messageId: string,
    options: PhoneChatRequestOptions = {},
  ): Promise<PhoneChatMessageResponse> {
    const query = new URLSearchParams({ deviceId });
    return this.request(`/api/phone-chat/messages/${encodeURIComponent(messageId)}?${query}`, {}, options);
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

  async revokeDevice(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<void> {
    await this.request(`/api/phone-chat/devices/${encodeURIComponent(deviceId)}`, {
      method: "DELETE",
    }, options);
  }

  async createDiscordPairing(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<DiscordPairingCode> {
    const query = new URLSearchParams({ deviceId });
    return this.request(`/api/phone-chat/discord/pairing-codes?${query}`, { method: "POST" }, options);
  }

  async getDiscordLink(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<DiscordLinkStatus> {
    const query = new URLSearchParams({ deviceId });
    return this.request(`/api/phone-chat/discord/link?${query}`, {}, options);
  }

  async revokeDiscordLink(deviceId: string, options: PhoneChatRequestOptions = {}): Promise<void> {
    const query = new URLSearchParams({ deviceId });
    await this.request(`/api/phone-chat/discord/link?${query}`, { method: "DELETE" }, options);
  }

  private async request<T = void>(
    path: string,
    init: RequestInit,
    options: PhoneChatRequestOptions,
  ): Promise<T> {
    const token = options.bearerToken === undefined ? this.tokenProvider() : options.bearerToken;
    const headers = new Headers(init.headers);
    if (init.body !== undefined) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
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
