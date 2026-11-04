import { afterEach, describe, expect, it, vi } from "vitest";
import { diagnoseTowerDefeat, executeAiraAction, fetchDailyReport, fetchSystemStatus, sendAiraChat } from "./aira.service";

// Every AIRA route needs the signed-in user, so each call must send the session cookie and, when stored, the Bearer token.
describe("aira.service auth", () => {
  afterEach(() => vi.unstubAllGlobals());

  const calls = [
    () => sendAiraChat("hello", "char-1"),
    () => diagnoseTowerDefeat(["lost"], "char-1", 1),
    () => fetchDailyReport("char-1"),
    () => executeAiraAction({ action_type: "noop", action_args: {} } as never, "char-1"),
    () => fetchSystemStatus("char-1"),
  ];

  it.each(calls.map((call, i) => [i, call] as const))("call %i sends credentials and the token", async (_, call) => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", { getItem: (key: string) => (key === "ascend_session" ? "tok-123" : null) });
    await call();
    const init = fetch.mock.calls[0][1] as RequestInit;
    expect(init.credentials).toBe("include");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok-123");
  });

  it("sends no Authorization header when no token is stored", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", { getItem: () => null });
    await sendAiraChat("hello", "char-1");
    const init = fetch.mock.calls[0][1] as RequestInit;
    expect(init.credentials).toBe("include");
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });
});
