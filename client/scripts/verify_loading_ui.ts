import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
      const page = await context.newPage();
      const response = await page.goto(`${baseUrl}/does-not-exist`, { waitUntil: "domcontentloaded" });
      assert.equal(response?.status(), 404);
      await page.getByRole("heading", { name: /error 404 break out of the void/i }).waitFor();
      await page.getByRole("link", { name: /return to landing/i }).waitFor();
      const consent = page.getByRole("button", { name: /essential only/i });
      if (await consent.isVisible().catch(() => false)) await consent.click();
      if (process.env.CAPTURE_LOADING_UI === "1") {
        await page.screenshot({ path: `loading-404-${viewport.width}.png`, fullPage: true });
      }
      await page.getByRole("button", { name: /start game/i }).click();
      await page.getByRole("button", { name: /launch/i }).waitFor();
      assert.equal(await page.locator('[data-testid="brick-breaker-playfield"]').count(), 1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 1, `404 has ${overflow}px horizontal overflow at ${viewport.width}px`);
      await page.getByRole("link", { name: /return to landing/i }).click();
      await page.waitForURL("**/landing");
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
