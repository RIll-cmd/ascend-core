import { chromium, Browser, BrowserContext } from "playwright";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ARTIFACT_DIR = "C:/Users/Cyrill Gerard/.gemini/antigravity-ide/brain/5939e04c-9aab-4f55-aeff-6ff94a3f2d3c";

async function main() {
  console.log("Launching browser for dashboard 8bit theme verification...");

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  } catch {
    browser = await chromium.launch({
      headless: true,
      channel: "msedge",
    });
  }

  const viewports = [
    { name: "dashboard-8bit-desktop.png", width: 1440, height: 900, dark: true },
    { name: "dashboard-8bit-tablet.png", width: 1024, height: 768, dark: true },
    { name: "dashboard-8bit-mobile.png", width: 390, height: 844, dark: true },
    { name: "dashboard-8bit-light.png", width: 1440, height: 900, dark: false },
  ];

  for (const vp of viewports) {
    const context: BrowserContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      colorScheme: vp.dark ? "dark" : "light",
    });

    await context.addCookies([
      {
        name: "ascend_session",
        value: "mock_jwt_session_token_123",
        domain: "localhost",
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    const page = await context.newPage();

    await page.addInitScript((isDark) => {
      try {
        localStorage.setItem("ascend_session", "mock_jwt_session_token_123");
        localStorage.setItem(
          "ascend_user",
          JSON.stringify({
            id: "mock_char-id-123",
            username: "ShadowMonarch",
            email: "hunter@ascend.os",
            isEmailVerified: true,
          })
        );
        localStorage.setItem("ascend_character_id", "mock_char-id-123");
        localStorage.setItem("theme", isDark ? "dark" : "light");
      } catch (e) {
        console.error("Init script error", e);
      }
    }, vp.dark);

    console.log(`Navigating to ${BASE_URL}/dashboard (${vp.name})...`);
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 45000 });
    if (!vp.dark) {
      await page.evaluate(() => {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      });
    }
    await page.waitForTimeout(3000);

    const dest = path.join(ARTIFACT_DIR, vp.name);
    await page.screenshot({ path: dest });
    console.log(`Saved screenshot: ${dest}`);

    // Scroll main element down to capture Row 3
    await page.evaluate(() => {
      const main = document.querySelector("main");
      if (main) main.scrollTop = 600;
    });
    await page.waitForTimeout(1000);

    const destScrolled = path.join(ARTIFACT_DIR, vp.name.replace(".png", "-bottom.png"));
    await page.screenshot({ path: destScrolled });
    console.log(`Saved scrolled screenshot: ${destScrolled}`);

    await context.close();
  }

  await browser.close();
  console.log("All dashboard verifications completed!");
}

main().catch((err) => {
  console.error("Error verifying dashboard:", err);
  process.exit(1);
});
