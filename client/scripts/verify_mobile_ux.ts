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
      const dashboardMinHeight = await page
        .locator('[data-mobile-shell="dashboard"]')
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).minHeight));
      if (dashboardMinHeight > 0) {
        failures.push(
          `Dashboard shell keeps a ${dashboardMinHeight}px minimum height at ${width}px; mobile should size to the dynamic viewport.`,
        );
      }

      for (const route of protectedRoutes) {
        await page.goto(`${baseUrl}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });
        await page.waitForFunction(
          () => {
            const main = document.querySelector<HTMLElement>("[data-mobile-main]");
            return main && main.innerText.trim().length > 10 && !main.innerText.includes("RESTORING SESSION");
          },
          { timeout: 5000 },
        ).catch(() => undefined);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        if (overflow > 1) {
          failures.push(`${route} has ${overflow}px horizontal page overflow at ${width}px.`);
        }

        const scrollState = await page.evaluate(async () => {
          const main = document.querySelector<HTMLElement>("[data-mobile-main]");
          const topbar = document.querySelector<HTMLElement>("[data-mobile-topbar]");
          if (!main || !topbar) return null;
           main.scrollTop = main.scrollHeight;
           await new Promise<void>((resolve) => setTimeout(resolve, 120));
           main.scrollTop = main.scrollHeight;
           await new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          });
          return {
            mainHeight: main.clientHeight,
            mainScrollHeight: main.scrollHeight,
            mainScrollTop: main.scrollTop,
            mainMaxScroll: main.scrollHeight - main.clientHeight,
            topbarTop: topbar.getBoundingClientRect().top,
          };
        });
        if (!scrollState) {
          failures.push(`${route} is missing the shared mobile content pane or top navigation.`);
        } else {
          if (route === "/tower" && scrollState.mainScrollHeight <= scrollState.mainHeight) {
            failures.push("Tower content is outside the shared scroll pane on mobile.");
          }
          if (scrollState.mainMaxScroll > 0 && scrollState.mainScrollTop < scrollState.mainMaxScroll - 2) {
            failures.push(`${route} cannot reach the end of its content pane at ${width}px.`);
          }
          if (Math.abs(scrollState.topbarTop) > 2) {
            failures.push(`${route} scrolls the top navigation away at ${width}px.`);
          }
        }

        if (width === 375 && route === "/profile/stats") {
          const profileHeadingHeight = await page
            .locator("[data-mobile-main] h2")
            .first()
            .evaluate((element) => element.getBoundingClientRect().height);
          if (profileHeadingHeight > 48) {
            failures.push(`Profile identity heading wraps to ${Math.round(profileHeadingHeight)}px at 375px.`);
          }
        }

        if (width === 375 && route === "/achievements") {
          const achievementHeadingHeight = await page
            .getByRole("heading", { name: "The Monarch's Shadow Sanctuary" })
            .evaluate((element) => element.getBoundingClientRect().height);
          const achievementCopyWidth = await page
            .locator("[data-mobile-achievement-intro] > div:last-child")
            .evaluate((element) => element.getBoundingClientRect().width);
          if (achievementHeadingHeight > 76 || achievementCopyWidth < 220) {
            failures.push(`Achievement hero heading wraps to ${Math.round(achievementHeadingHeight)}px at 375px.`);
          }
        }

        if (width === 375 && route === "/shop") {
          const shopHeadingWidth = await page
            .getByRole("heading", { name: /bramblewick's emporium/i })
            .evaluate((element) => element.getBoundingClientRect().width);
          if (shopHeadingWidth < 210) {
            failures.push(`Shop hero title only has ${Math.round(shopHeadingWidth)}px at 375px.`);
          }
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

    await page.setViewportSize({ width: 375, height: 844 });
    await page.goto(`${baseUrl}/settings`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    if (!(await page.getByRole("heading", { name: "Account Settings" }).count())) {
      failures.push("Mobile Settings is not using the desktop Account Settings presentation.");
    }
    for (const label of ["Character ID:", "Danger Zone"]) {
      if (!(await page.getByText(label, { exact: true }).count())) {
        failures.push(`Mobile Settings is missing desktop Account Settings content: ${label}`);
      }
    }
    if (await page.getByRole("button", { name: /send otp/i }).count()) {
      failures.push("Mobile Settings still exposes the email OTP control absent from desktop Account Settings.");
    }
  } else {
    console.log("Skipping authenticated route overflow checks; set MOBILE_TEST_GUEST_PASSWORD to enable them.");
  }

  if (guestPassword) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseUrl}/settings`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    if (!(await page.getByText("System Control & Preferences", { exact: true }).count())) {
      failures.push("Desktop Settings preferences page changed at 1440px.");
    }
    if (await page.locator("[data-mobile-account-page]").isVisible()) {
      failures.push("Mobile Account Settings is visible at the desktop width of 1440px.");
    }
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
