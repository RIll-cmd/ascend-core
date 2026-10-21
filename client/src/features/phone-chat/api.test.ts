import { describe, expect, it, vi } from "vitest";
import { PhoneChatApi } from "./api";

describe("PhoneChatApi Discord routes", () => {
  it("uses same-origin paths despite a configured API base, while leaving phone routes on that base", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: "CODE", expiresAt: "2026-09-26T12:05:00Z" }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ linked: false })))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ deviceId: "new-device" }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ available: false, reason: "never_published", deviceId: "laptop-1", lastSeenAt: null, fields: {} })));
    const api = new PhoneChatApi({
      baseUrl: "https://staging-core.example",
      tokenProvider: () => "session-token",
      fetcher,
    });

    await api.createDiscordPairing("active-device");
    await api.getDiscordLink("active-device");
    await api.revokeDiscordLink("active-device");
    await api.registerDevice();
    await api.getCompanionContext("active-device");

    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "/api/phone-chat/discord/pairing-codes?deviceId=active-device",
      "/api/phone-chat/discord/link?deviceId=active-device",
      "/api/phone-chat/discord/link?deviceId=active-device",
      "https://staging-core.example/api/phone-chat/devices",
      "/api/phone-chat/context?deviceId=active-device",
    ]);
    expect(fetcher.mock.calls[0][1].credentials).toBe("include");
    expect(fetcher.mock.calls[0][1].headers.get("Authorization")).toBe("Bearer session-token");
  });
});

describe("PhoneChatApi voice delivery", () => {
  it("uploads only after the caller's send action, with provider consent and raw audio MIME", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      messageId: "message-1", status: "queued", expiresAt: "2026-09-28T12:00:00Z",
    }), { status: 202 }));
    const api = new PhoneChatApi({ tokenProvider: () => "session-token", fetcher });
    const audio = new Blob(["audio"], { type: "audio/webm" });
    await api.enqueueAudio({ deviceId: "device-1", messageId: "message-1", sessionId: "session-1", audio, mimeType: "audio/webm" });
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toContain("/api/phone-chat/audio?");
    expect(init.body).toBe(audio);
    expect(init.headers.get("Content-Type")).toBe("audio/webm");
    expect(init.headers.get("X-Audio-Provider-Consent")).toBe("google-gemini");
    expect(init.headers.get("Authorization")).toBe("Bearer session-token");
  });
});

describe("PhoneChatApi consented notifications", () => {
  it("keeps push subscriptions and channel consent on the authenticated same-origin API", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ enabled: true, vapidPublicKey: "public-vapid-key" })))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ channel: "pwa_push", enabled: true })));
    const api = new PhoneChatApi({ baseUrl: "https://core.example", tokenProvider: () => "session-token", fetcher });
    expect(await api.getNotificationPushConfig()).toEqual({ enabled: true, vapidPublicKey: "public-vapid-key" });
    await api.registerPushSubscription({ deviceId: "device-1", endpoint: "https://fcm.googleapis.com/push/opaque", keys: { p256dh: "B".repeat(87), auth: "C".repeat(22) } });
    await api.setNotificationPreference("device-1", "pwa_push", true);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "/api/phone-chat/notifications/push-config",
      "/api/phone-chat/notifications/push-subscription",
      "/api/phone-chat/notifications/preferences?deviceId=device-1",
    ]);
    expect(JSON.parse(fetcher.mock.calls[1][1].body as string).deviceId).toBe("device-1");
    expect(fetcher.mock.calls[2][1].headers.get("Authorization")).toBe("Bearer session-token");
  });
});

describe("PhoneChatApi browser tasks", () => {
  it("binds review and explicit handoff consumption to the phone device and browser session", async () => {
    const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ recorded: true })));
    const api = new PhoneChatApi({ tokenProvider: () => "session-token", fetcher });
    await api.decideBrowserReview("task-1", "action-1", "a".repeat(64), true, "device-1", "session-1");
    await api.consumeBrowserReviewAccess("device-1", "session-1", "one-use-handoff");
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "/api/browser-tasks/task-1/reviews/action-1", "/api/browser-tasks/review-access/consume",
    ]);
    expect(JSON.parse(fetcher.mock.calls[0][1].body as string)).toEqual({
      browserSessionId: "session-1", proposalDigest: "a".repeat(64), approved: true,
    });
    expect(JSON.parse(fetcher.mock.calls[1][1].body as string)).toEqual({
      browserSessionId: "session-1", token: "one-use-handoff",
    });
    for (const [, init] of fetcher.mock.calls) {
      expect(init.headers.get("X-Phone-Device")).toBe("device-1");
      expect(init.headers.get("X-Browser-Session")).toBe("session-1");
      expect(init.cache).toBe("no-store");
    }
  });
  it("uses authenticated device/session-bound routes without exposing an owner", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        available: true, reason: "online", laptopId: "laptop-a", lastHeartbeatAt: null,
        provider: "gemini", scopes: [{ scopeId: "public_research", version: 1, actions: [] }],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        browserSessionId: "browser-session-a", channel: "phone_pwa",
        parentSessionId: "phone-session-a", expiresAt: "2026-09-29T00:00:00Z",
      }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        taskId: "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd", status: "queued",
        expiresAt: "2026-09-29T00:00:00Z", createdAt: "2026-09-28T00:00:00Z",
      }), { status: 202 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = new PhoneChatApi({ baseUrl: "https://core.example", tokenProvider: () => "session-token", fetcher });

    await api.getBrowserAvailability("device-a");
    await api.createBrowserSession({ deviceId: "device-a", parentSessionId: "phone-session-a", providerConsent: "gemini" });
    await api.enqueueBrowserTask({
      taskId: "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd", browserSessionId: "browser-session-a",
      laptopId: "laptop-a", goal: "Find official documentation", scopeId: "public_research", scopeVersion: 1,
    }, "device-a");
    await api.endBrowserSession("device-a", "browser-session-a");

    const [availability, session, enqueue, end] = fetcher.mock.calls;
    expect(availability[0]).toBe("/api/browser-tasks/availability");
    expect(availability[1].headers.get("X-Phone-Device")).toBe("device-a");
    expect(session[0]).toBe("/api/browser-tasks/sessions");
    expect(JSON.parse(session[1].body as string)).toEqual({
      deviceId: "device-a", parentSessionId: "phone-session-a", providerConsent: "gemini",
    });
    expect(enqueue[0]).toBe("/api/browser-tasks/");
    expect(enqueue[1].headers.get("X-Browser-Session")).toBe("browser-session-a");
    expect(JSON.parse(enqueue[1].body as string)).not.toHaveProperty("ownerId");
    expect(end[0]).toBe("/api/browser-tasks/sessions/browser-session-a/end");
    for (const [, init] of fetcher.mock.calls) {
      expect(init.cache).toBe("no-store");
      expect(init.credentials).toBe("include");
      expect(init.headers.get("Authorization")).toBe("Bearer session-token");
    }
  });
});
