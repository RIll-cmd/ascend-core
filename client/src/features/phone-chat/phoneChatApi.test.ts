import { afterEach, describe, expect, it, vi } from "vitest";
import { PhoneChatApi } from "./api";

const messageId = "4bfb3bb8-8ee7-4acd-8f17-cf98119c20fd";

describe("PhoneChatApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses the browser credential and exact Core routes without sending an owner", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ deviceId: "device-a" }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ messageId, status: "queued", expiresAt: "2026-09-27T00:00:00Z" }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ messageId, status: "completed", expiresAt: "2026-09-27T00:00:00Z", reply: "Idle." }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ messageId, status: "completed", expiresAt: "2026-09-27T00:00:00Z" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = new PhoneChatApi({ baseUrl: "https://core.example/", tokenProvider: () => "browser-token", fetcher });

    await api.registerDevice();
    await api.enqueue({ deviceId: "device-a", messageId, sessionId: "session-a", text: "status?" });
    await api.getMessage("device-a", messageId);
    await api.acknowledge("device-a", messageId);
    await api.revokeDevice("device-a");

    const [register, enqueue, status, acknowledge, revoke] = fetcher.mock.calls;
    expect(register[0]).toBe("https://core.example/api/phone-chat/devices");
    expect(enqueue[0]).toBe("https://core.example/api/phone-chat/messages");
    expect(JSON.parse(enqueue[1].body)).toEqual({ deviceId: "device-a", messageId, sessionId: "session-a", text: "status?" });
    expect(JSON.parse(enqueue[1].body)).not.toHaveProperty("ownerId");
    expect(status[0]).toBe(`https://core.example/api/phone-chat/messages/${messageId}?deviceId=device-a`);
    expect(acknowledge[0]).toBe(`https://core.example/api/phone-chat/messages/${messageId}/ack?deviceId=device-a`);
    expect(revoke[0]).toBe("https://core.example/api/phone-chat/devices/device-a");
    for (const [, init] of fetcher.mock.calls) {
      expect(init.credentials).toBe("include");
      expect(new Headers(init.headers).get("Authorization")).toBe("Bearer browser-token");
    }
  });

  it("never caches chat status and fails clearly on an unsuccessful response", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("", { status: 503 }));
    const api = new PhoneChatApi({ baseUrl: "http://core.test", tokenProvider: () => null, fetcher });

    await expect(api.getMessage("device-a", messageId)).rejects.toThrow("Phone chat request failed (503)");
    expect(fetcher.mock.calls[0][1].cache).toBe("no-store");
  });
});
