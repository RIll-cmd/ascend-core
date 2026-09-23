import assert from "node:assert/strict";
import { chromium, type Page } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const featureTitles = [
  "TACTICAL DASHBOARD",
  "MISSIONS & DIRECTIVES",
  "NEURAL HABIT MATRIX",
  "CONSISTENCY CALENDAR",
  "HUNTER PROFILE & AWAKENING",
  "HEAVY IRON GYM & VOLUME",
  "SLEEP & CIRCADIAN REST",
  "LEARNING & FOCUS SANCTUARY",
  "SKILL TREE & TALENTS",
  "TOWER OF ASCENSION",
  "WORLD BOSS RAIDS",
  "BOSS PR BENCHMARKS",
  "INVENTORY & EQUIPMENT",
  "FORGE & ALCHEMY CRAFTING",
  "MERCHANT SHOP & BAZAAR",
  "BEASTS & PET INCUBATORS",
  "AIRA AI CO-PILOT",
  "ACHIEVEMENTS & MEDALS",
  "SYSTEM AUTOMATIONS",
] as const;

async function expectVisible(page: Page, selector: string) {
  const locator = page.locator(selector);
  await locator.first().waitFor({ state: "visible" });
  assert.ok((await locator.count()) > 0, `Expected ${selector} to exist`);
}

async function dismissPrivacyNotice(page: Page) {
  const button = page.getByRole("button", { name: /accept|dismiss|got it/i });
  if (await button.count()) {
    await button.first().click().catch(() => undefined);
  }
}

async function assertNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.ok(
    scrollWidth <= clientWidth + 1,
    `Horizontal overflow detected: ${scrollWidth}px > ${clientWidth}px`,
  );
}

async function expectPixelTypography(page: Page, rootSelector: string) {
  assert.equal(
    await page.locator(rootSelector).count(),
    1,
    `Expected one route-scoped typography root: ${rootSelector}`,
  );

  const fonts = await page.locator(rootSelector).evaluate((root) => {
    const heading = root.querySelector("h1, h2");
    const button = root.querySelector("button");
    return {
      root: getComputedStyle(root).fontFamily,
      heading: heading ? getComputedStyle(heading).fontFamily : "",
      button: button ? getComputedStyle(button).fontFamily : "",
    };
  });

  assert.match(fonts.root, /^"?Pixelify Sans/i);
  assert.match(fonts.heading, /^"?Jersey 10/i);
  assert.match(fonts.button, /^"?Press Start 2P/i);
}

async function verifyLanding(page: Page) {
  await page.goto(`${BASE_URL}/landing`, { waitUntil: "domcontentloaded" });
  await expectVisible(page, '[data-landing-block="hero"]');
  await dismissPrivacyNotice(page);
  await assertNoHorizontalOverflow(page);
  await expectPixelTypography(page, '[data-landing-fonts="8bitcn"]');

  for (const block of [
    "hero",
    "chapter-intro",
    "all-systems",
    "boss-duel",
    "timeline",
    "faq",
    "portal",
    "footer",
  ]) {
    assert.equal(
      await page.locator(`[data-landing-block="${block}"]`).count(),
      1,
      `Landing block ${block} is missing or duplicated`,
    );
  }

  const systemsGrid = page.locator('[data-landing-block="all-systems"]');
  for (const title of featureTitles) {
    assert.equal(
      await systemsGrid.getByText(title, { exact: true }).count(),
      1,
      `Missing feature: ${title}`,
    );
  }

  const duel = page.locator('[data-landing-block="boss-duel"]');
  const bossHp = duel.getByText(/\d+\/240/).first();
  const strike = duel.getByRole("button", { name: /strike/i });
  await strike.click();
  const damagedHpText = (await bossHp.textContent()) ?? "";
  const damagedHp = Number(damagedHpText.match(/(\d+)\/240/)?.[1]);
  assert.ok(Number.isFinite(damagedHp) && damagedHp < 240, "Boss should take damage");

  await systemsGrid.getByText("TACTICAL DASHBOARD", { exact: true }).click();
  await page.keyboard.press("Escape");
  await duel.scrollIntoViewIfNeeded();
  const afterModalHpText = (await bossHp.textContent()) ?? "";
  const afterModalHp = Number(afterModalHpText.match(/(\d+)\/240/)?.[1]);
  assert.ok(Number.isFinite(afterModalHp), "Boss HP should remain readable");
  assert.equal(afterModalHp, damagedHp, "Duel state should survive landing-page rerenders");

  const towerMetric = page.getByText("TOWER FLOORS", { exact: true });
  assert.ok(parseFloat(await towerMetric.evaluate((el) => getComputedStyle(el).fontSize)) >= 8);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(`
    window.__scrollBehavior = undefined;
    Element.prototype.scrollIntoView = function (options) {
      if (typeof options === "object") window.__scrollBehavior = options.behavior;
    };
  `);
  await page.getByRole("button", { name: /hunter codex/i }).first().click();
  assert.equal(
    await page.evaluate(() => (window as Window & { __scrollBehavior?: ScrollBehavior }).__scrollBehavior),
    "auto",
  );

  const portalImage = page.locator('img[data-portal-artwork="ascension-gate"]');
  await portalImage.waitFor({ state: "visible" });
  assert.match(
    (await portalImage.getAttribute("src")) ?? "",
    /landing%2Fascension-portal\.png|landing\/ascension-portal\.png/,
  );
  const stockPortalRing = page
    .locator('[data-landing-block="portal"] .border-dashed')
    .locator("..");
  assert.equal(
    await stockPortalRing.evaluate((element) => getComputedStyle(element).opacity),
    "0",
    "The supplied artwork should replace the stock portal ring",
  );
  assert.equal(
    await stockPortalRing.evaluate((element) => getComputedStyle(element).visibility),
    "hidden",
    "The replaced portal control must not remain in the keyboard focus flow",
  );
  await expectVisible(page, "text=DESTINATION: ASCEND CORE [FLOOR 1]");

  await page
    .locator('[data-landing-block="portal"]')
    .getByRole("button", { name: "AWAKEN YOUR HUNTER" })
    .click();
  const auth = page.locator("#auth-section");
  await auth.waitFor({ state: "visible" });
  const activeTab = auth.locator('[role="tab"][data-state="active"]', {
    hasText: "Register",
  });
  await activeTab.waitFor({ state: "visible" });
  assert.match((await activeTab.textContent()) ?? "", /register/i);
}

async function verifyLogin(page: Page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await expectVisible(page, '[data-login-block="gateway"]');
  await dismissPrivacyNotice(page);
  await assertNoHorizontalOverflow(page);
  await expectPixelTypography(page, '[data-login-fonts="8bitcn"]');

  await expectVisible(page, 'input[type="text"]');
  await expectVisible(page, 'input[type="password"]');
  await expectVisible(page, '[data-login-block="status"]');

  const sessionLabel = page.getByText("SESSION CHANNEL", { exact: true });
  assert.ok(parseFloat(await sessionLabel.evaluate((el) => getComputedStyle(el).fontSize)) >= 8);

  await page.locator('input[type="text"]').fill("hunter@example.com");
  await page.locator('input[type="password"]').fill("123");
  await page.getByRole("button", { name: "AUTHENTICATE OPERATIVE" }).click();
  await expectVisible(page, "text=/at least 6/i");
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [
      { width: 1440, height: 1000, label: "desktop" },
      { width: 390, height: 844, label: "mobile" },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await verifyLanding(page);
      await verifyLogin(page);
      await context.close();
      console.log(`verified landing and login (${viewport.label})`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
