// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DiscordLinkCard } from "./DiscordLinkCard";

const code = "PAIR-CODE-ONLY-IN-MEMORY";
const deviceId = "device-private-identifier";

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("DiscordLinkCard", () => {
  let host: HTMLDivElement;
  let root: Root;
  let fetcher: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-26T12:00:00.000Z"));
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    fetcher = vi.fn().mockResolvedValue(json({ linked: false }));
    vi.stubGlobal("fetch", fetcher);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  async function render(device: string | null = deviceId) {
    await act(async () => root.render(<DiscordLinkCard deviceId={device} />));
  }

  async function click(label: string) {
    const button = [...host.querySelectorAll("button")].find((item) => item.textContent?.includes(label));
    expect(button, `button ${label}`).toBeTruthy();
    await act(async () => button!.click());
  }

  it("generates a one-time code only after the user asks and never saves it", async () => {
    const setLocal = vi.spyOn(Storage.prototype, "setItem");
    fetcher.mockResolvedValueOnce(json({ linked: false }))
      .mockResolvedValueOnce(json({ code, expiresAt: "2026-09-26T12:05:00.000Z" }, 201));
    await render();
    expect(host.textContent).not.toContain(code);
    expect(fetcher).toHaveBeenCalledTimes(1);

    await click("Create link code");
    expect(host.textContent).toContain(code);
    expect(host.textContent).toContain("5:00");
    expect(setLocal).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(String(fetcher.mock.calls[1][0])).toContain("deviceId=device-private-identifier");
    expect(fetcher.mock.calls[1][1].method).toBe("POST");
    setLocal.mockRestore();
  });

  it("waits for an active device and its link status before offering a code", async () => {
    await render(null);
    const createButton = [...host.querySelectorAll("button")].find((item) => item.textContent?.includes("Create link code"));
    expect(createButton?.disabled).toBe(true);
    expect(fetcher).not.toHaveBeenCalled();

    fetcher.mockImplementationOnce(() => new Promise(() => {}));
    await render();
    expect(createButton?.isConnected).toBe(false);
    const waitingButton = [...host.querySelectorAll("button")].find((item) => item.textContent?.includes("Create link code"));
    expect(waitingButton?.disabled).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("hides the code at expiry and when the active device changes", async () => {
    fetcher.mockResolvedValueOnce(json({ linked: false }))
      .mockResolvedValueOnce(json({ code, expiresAt: "2026-09-26T12:00:02.000Z" }, 201))
      .mockResolvedValueOnce(json({ code, expiresAt: "2026-09-26T12:05:02.000Z" }, 201));
    await render();
    await click("Create link code");
    expect(host.textContent).toContain(code);

    await act(async () => vi.advanceTimersByTimeAsync(2_000));
    expect(host.textContent).not.toContain(code);
    expect(host.textContent).toContain("Link code expired");

    await click("Create link code");
    expect(host.textContent).toContain(code);
    await render("another-device");
    expect(host.textContent).not.toContain(code);
  });

  it("clears an expired code as soon as a suspended tab regains focus", async () => {
    fetcher.mockResolvedValueOnce(json({ linked: false }))
      .mockResolvedValueOnce(json({ code, expiresAt: "2026-09-26T12:00:02.000Z" }, 201));
    await render();
    await click("Create link code");
    expect(host.textContent).toContain(code);

    vi.setSystemTime(new Date("2026-09-26T12:10:00.000Z"));
    expect(host.textContent).toContain(code);
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(host.textContent).not.toContain(code);
    expect(host.textContent).toContain("Link code expired");
  });

  it("shows only redacted link status and clears the code after refresh confirms a link", async () => {
    fetcher.mockResolvedValueOnce(json({ linked: false, discordUserId: "secret-discord-id" }))
      .mockResolvedValueOnce(json({ code, expiresAt: "2026-09-26T12:05:00.000Z" }, 201))
      .mockResolvedValueOnce(json({ linked: true, discordUserId: "secret-discord-id" }));
    await render();
    expect(host.textContent).toContain("Not linked");
    expect(host.textContent).not.toContain("secret-discord-id");
    expect(host.textContent).not.toContain(deviceId);
    await click("Create link code");
    await click("Refresh link status");
    expect(host.textContent).toContain("Linked to Discord");
    expect(host.textContent).not.toContain(code);
    expect(host.textContent).not.toContain("secret-discord-id");
  });

  it("requires confirmation before revoking and refreshes to unlinked afterward", async () => {
    fetcher.mockResolvedValueOnce(json({ linked: true }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(json({ linked: false }));
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal("confirm", confirm);
    await render();
    await click("Revoke link");
    expect(fetcher).toHaveBeenCalledTimes(1);
    confirm.mockReturnValue(true);
    await click("Revoke link");
    expect(fetcher.mock.calls[1][1].method).toBe("DELETE");
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(host.textContent).toContain("Not linked");
  });

  it("never displays a failed request's secret or backend exception", async () => {
    fetcher.mockResolvedValueOnce(json({ linked: false }))
      .mockResolvedValueOnce(json({ detail: `backend exception: ${code}` }, 500));
    await render();
    await click("Create link code");
    expect(host.textContent).toContain("Could not create a link code");
    expect(host.textContent).not.toContain(code);
    expect(host.textContent).not.toContain("backend exception");
  });
});
