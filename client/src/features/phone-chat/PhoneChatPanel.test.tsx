import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PhoneChatPanel } from "./PhoneChatPanel";

describe("PhoneChatPanel", () => {
  it("renders readable message states and an accessible phone composer", () => {
    const html = renderToStaticMarkup(<PhoneChatPanel
      ready
      busy={false}
      messages={[
        { messageId: "m1", text: "Status?", status: "queued", createdAt: "2026-09-26T12:00:00.000Z" },
        { messageId: "m2", text: "And Codex?", status: "completed", reply: "Codex is working.", createdAt: "2026-09-26T12:01:00.000Z" },
      ]}
      input=""
      error={null}
      onInputChange={vi.fn()}
      onSubmit={vi.fn()}
      onNewChat={vi.fn()}
      onRevokeDevice={vi.fn()}
    />);

    expect(html).toContain('aria-label="Message Vision"');
    expect(html).toContain('aria-label="Send message to Vision"');
    expect(html).toContain("Queued");
    expect(html).toContain("Codex is working.");
    expect(html).toContain("New chat");
    expect(html).toContain("Only approved memories persist");
  });

  it("does not fabricate an assistant reply when a message fails", () => {
    const html = renderToStaticMarkup(<PhoneChatPanel
      ready
      busy={false}
      messages={[{ messageId: "m1", text: "Hello", status: "failed", errorCode: "assistant_unavailable", createdAt: "now" }]}
      input=""
      error={null}
      onInputChange={vi.fn()}
      onSubmit={vi.fn()}
      onNewChat={vi.fn()}
      onRevokeDevice={vi.fn()}
    />);

    expect(html).toContain("Vision couldn&#x27;t complete this message");
    expect(html).not.toContain("assistant_unavailable");
  });
});
