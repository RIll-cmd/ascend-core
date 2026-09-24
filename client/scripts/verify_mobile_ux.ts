import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const guestPassword = process.env.MOBILE_TEST_GUEST_PASSWORD;
const widths = [320, 375, 430];
const protectedRoutes = [
  "/dashboard",
  "/missions",
  "/habits",
  "/calendar",
  "/inventory",
  "/shop",
  "/workouts",
  "/analytics",
  "/profile/stats",
  "/settings",
  "/tower",
  "/bosses",
  "/skills",
  "/sleep",
  "/learning",
  "/crafting",
  "/automations",
  "/aira",
  "/beasts",
];

async function main() {
const failures: string[] = [];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 375, height: 844 },
  isMobile: true,
  deviceScaleFactor: 1,
});
const page = await context.newPage();

try {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(350);
  await page
    .locator('button[aria-label="Dismiss cookie notice with essential cookies only"]')
    .click({ force: true })
    .catch(() => undefined);
  await page.waitForTimeout(100);
  const loginCopySize = await page
    .locator("main p")
    .first()
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  if (loginCopySize < 14) {
    failures.push(`Login explanatory copy is ${loginCopySize}px at 320px; expected at least 14px.`);
  }

  const brandHeight = await page
    .locator('header a[href="/landing"] span')
    .last()
    .evaluate((element) => element.getBoundingClientRect().height);
  if (brandHeight > 32) {
    failures.push(`Auth wordmark wraps to ${Math.round(brandHeight)}px at 320px; expected one compact line or icon-only.`);
  }

  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto(`${baseUrl}/landing`, { waitUntil: "domcontentloaded" });
  const landingCopy = page.locator("[data-mobile-readable-copy]");
  const landingCopySize = (await landingCopy.count())
    ? await landingCopy.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))
    : 0;
  if (landingCopySize < 16) {
    failures.push(`Landing hero copy is ${landingCopySize}px at 375px; expected at least 16px.`);
  }

  if (guestPassword) {
    await page.getByRole("button", { name: /enter as guest|guest hunter/i }).first().click();
    await page.locator("#guest-access-password").fill(guestPassword);
    await page.getByRole("button", { name: /continue as guest/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of protectedRoutes) {
        await page.goto(`${baseUrl}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });
        await page.waitForTimeout(100);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        if (overflow > 1) {
          failures.push(`${route} has ${overflow}px horizontal page overflow at ${width}px.`);
        }

        if (route === "/missions") {
          const bonusWidget = page.locator("[data-mobile-bonus-widget]");
          const bonusSize = (await bonusWidget.count())
            ? await bonusWidget.evaluate((element) => {
                const rect = element.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
              })
            : { width: Infinity, height: Infinity };
          if (width <= 430 && (bonusSize.width > 104 || bonusSize.height > 64)) {
            failures.push(
              `Floating bonuses control is ${Math.round(bonusSize.width)}×${Math.round(bonusSize.height)}px at ${width}px; expected a compact touch-safe control.`,
            );
          }
        }
      }
    }
  } else {
    console.log("Skipping authenticated route overflow checks; set MOBILE_TEST_GUEST_PASSWORD to enable them.");
  }

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  const desktopBrandVisible = await desktopPage
    .locator('header a[href="/landing"] span')
    .last()
    .isVisible();
  await desktopContext.close();
  if (!desktopBrandVisible) {
    failures.push("Auth wordmark is hidden at the desktop width of 1440px.");
  }
} finally {
  await context.close();
  await browser.close();
}

if (failures.length) {
  console.error(`Mobile UX checks failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("Mobile UX checks passed at 320px, 375px, 430px, and 1440px.");
}
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
