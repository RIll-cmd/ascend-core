import { describe, it, expect } from "vitest";
import { CookieConsentBanner, CONSENT_STORAGE_KEY } from "./CookieConsentBanner";

describe("CookieConsentBanner 8bit theme contract", () => {
  it("exports CookieConsentBanner component and CONSENT_STORAGE_KEY", () => {
    expect(CookieConsentBanner).toBeDefined();
    expect(CONSENT_STORAGE_KEY).toBe("ascend_cookie_consent");
  });
});
