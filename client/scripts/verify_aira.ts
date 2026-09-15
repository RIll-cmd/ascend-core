import { chromium, Browser, BrowserContext } from "playwright";

const ARTIFACT_DIR = "C:/Users/Cyrill Gerard/.gemini/antigravity-ide/brain/5939e04c-9aab-4f55-aeff-6ff94a3f2d3c";

async function main() {
  console.log("Starting verify_aira.ts multi-viewport capture...");
  let browser: Browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });
  } catch (err) {
    console.log("Falling back to msedge channel...", err);
    browser = await chromium.launch({
      headless: true,
      channel: "msedge",
    });
  }

  const viewports = [
    { name: "aira-neo-desktop.png", width: 1440, height: 900, dark: true },
    { name: "aira-neo-tablet.png", width: 1024, height: 768, dark: true },
    { name: "aira-neo-mobile.png", width: 390, height: 844, dark: true },
    { name: "aira-neo-light.png", width: 1440, height: 900, dark: false },
  ];

  for (const vp of viewports) {
    console.log(`Capturing ${vp.name} (${vp.width}x${vp.height}, dark: ${vp.dark})...`);
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
          JSON.stringify({ id: "char-id-123", name: "Commander" })
        );
        localStorage.setItem("ascend-theme-storage", JSON.stringify({ state: { theme: isDark ? "dark" : "light" } }));
        localStorage.setItem("theme", isDark ? "dark" : "light");
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {
        console.error(e);
      }
    }, vp.dark);

    await page.goto("http://localhost:3000/aira", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000);

    const screenshotPath = `${ARTIFACT_DIR}/${vp.name}`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${screenshotPath}`);
    await context.close();
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

main().catch((err) => {
  console.error("Error in verify_aira:", err);
  process.exit(1);
});
