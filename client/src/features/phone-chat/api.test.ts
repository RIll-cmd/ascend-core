import { describe, expect, it, vi } from "vitest";
import { PhoneChatApi } from "./api";

describe("PhoneChatApi Discord routes", () => {
  it("uses same-origin paths despite a configured API base, while leaving phone routes on that base", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: "CODE", expiresAt: "2026-09-26T12:05:00Z" }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ linked: false })))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ deviceId: "new-device" })));
    const api = new PhoneChatApi({
      baseUrl: "https://staging-core.example",
      tokenProvider: () => "session-token",
      fetcher,
    });

    await api.createDiscordPairing("active-device");
    await api.getDiscordLink("active-device");
    await api.revokeDiscordLink("active-device");
    await api.registerDevice();

    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "/api/phone-chat/discord/pairing-codes?deviceId=active-device",
      "/api/phone-chat/discord/link?deviceId=active-device",
      "/api/phone-chat/discord/link?deviceId=active-device",
      "https://staging-core.example/api/phone-chat/devices",
    ]);
    expect(fetcher.mock.calls[0][1].credentials).toBe("include");
    expect(fetcher.mock.calls[0][1].headers.get("Authorization")).toBe("Bearer session-token");
  });
});
