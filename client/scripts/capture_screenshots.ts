import { chromium, Browser, BrowserContext, Page } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUTPUT_DIRS = [
  path.resolve(__dirname, "../../docs/media"),
  path.resolve(__dirname, "../public/previews"),
];

interface ScreenshotTarget {
  name: string;
  route: string;
  waitForSelector?: string;
  delayMs?: number;
  beforeCapture?: (page: Page) => Promise<void>;
}

const TARGETS: ScreenshotTarget[] = [
  // 01 Dashboard
  {
    name: "main-dashboard.png",
    route: "/dashboard",
    delayMs: 2500,
  },
  // Sidebar Navigation Command Index
  {
    name: "sidebar-navigation.png",
    route: "/dashboard",
    delayMs: 1500,
    beforeCapture: async (page: Page) => {
      try {
        const menuBtn = await page.$('button[aria-label="Toggle Navigation Menu"]');
        if (menuBtn) {
          await menuBtn.click();
          await page.waitForTimeout(800);
        }
      } catch (e) {
        console.warn("Could not toggle menu button", e);
      }
    },
  },
  // 02 Missions
  {
    name: "missions.png",
    route: "/missions",
    delayMs: 2000,
  },
  // 03 Habits
  {
    name: "habits.png",
    route: "/habits",
    delayMs: 2000,
  },
  // 04 Calendar
  {
    name: "calendar.png",
    route: "/calendar",
    delayMs: 2000,
  },
  // 05 Profile
  {
    name: "profile.png",
    route: "/profile",
    delayMs: 2000,
  },
  // 06 Workouts
  {
    name: "workout.png",
    route: "/workouts",
    delayMs: 2000,
  },
  // 07 Sleep & Rest
  {
    name: "sleep.png",
    route: "/sleep",
    delayMs: 2000,
  },
  // 08 Learning & Focus
  {
    name: "learning.png",
    route: "/learning",
    delayMs: 2000,
  },
  // 09 Skills
  {
    name: "skills.png",
    route: "/skills",
    delayMs: 2000,
  },
  // 10 Tower
  {
    name: "tower.png",
    route: "/tower",
    delayMs: 2000,
  },
  // 11 Bosses
  {
    name: "bosses.png",
    route: "/bosses",
    delayMs: 2000,
  },
  // 12 Boss PR
  {
    name: "boss-pr.png",
    route: "/workouts/boss-pr",
    delayMs: 2000,
  },
  // 13 Inventory
  {
    name: "inventory.png",
    route: "/inventory",
    delayMs: 2000,
  },
  // 14 Forge & Craft
  {
    name: "crafting.png",
    route: "/crafting",
    delayMs: 2000,
  },
  // 15 Shop
  {
    name: "shop.png",
    route: "/shop",
    delayMs: 2000,
  },
  // 16 Beasts & Pets
  {
    name: "beasts.png",
    route: "/beasts",
    delayMs: 2000,
  },
  // 17 AI System / AIRA
  {
    name: "aira-system.png",
    route: "/aira",
    delayMs: 2000,
  },
  // 18 Achievements
  {
    name: "achievements.png",
    route: "/achievements",
    delayMs: 2000,
  },
  // 19 Automations
  {
    name: "automations.png",
    route: "/automations",
    delayMs: 2000,
  },
];

async function ensureDirectories() {
  for (const dir of OUTPUT_DIRS) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }
}

async function captureScreenshots() {
  console.log("==========================================");
  console.log("🌌 ASCEND OS AUTOMATED SCREENSHOT CAPTURER");
  console.log("==========================================");
  console.log(`Target URL: ${BASE_URL}\n`);

  await ensureDirectories();

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });
  } catch (launchErr) {
    console.warn("Standard chromium launch failed, trying system channel...", launchErr);
    browser = await chromium.launch({
      headless: true,
      channel: "msedge",
    });
  }

  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // High-DPI crisp Retina rendering
    colorScheme: "dark",
  });

  // Inject session cookies & tokens
  await context.addCookies([
    {
      name: "ascend_session",
      value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTBhNDAwMzMwIiwiZXhwIjoxNzkyMTU2MTQ1fQ.12pB_7G7GHHSmpetZl9F10anWYa82lXhLzMT6aS-sec",
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();

  // Inject local storage for authenticated state
  await page.addInitScript(() => {
    try {
      localStorage.setItem("ascend_session", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTBhNDAwMzMwIiwiZXhwIjoxNzkyMTU2MTQ1fQ.12pB_7G7GHHSmpetZl9F10anWYa82lXhLzMT6aS-sec");
      localStorage.setItem(
        "ascend_user",
        JSON.stringify({
          id: "user-0a400330",
          username: "cyrill",
          email: "cyrill@ascend.core",
          isEmailVerified: true,
        })
      );
      localStorage.setItem("ascend_character_id", "char-user-0a400330");
      localStorage.setItem("theme", "dark");
    } catch (e) {
      console.error("Failed to inject localStorage auth", e);
    }
  });

  console.log("🔑 Authenticating initial session...");
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1000);
  } catch (err) {
    console.log("Initial load check:", err);
  }

  // Iterate over target routes
  for (const target of TARGETS) {
    const fullUrl = `${BASE_URL}${target.route}`;
    console.log(`📸 Capturing [${target.name}] from ${target.route}...`);

    try {
      await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 20000 }).catch(() => {
        return page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
      });

      if (target.waitForSelector) {
        await page.waitForSelector(target.waitForSelector, { timeout: 5000 }).catch(() => {});
      }

      // Settle animations & Framer Motion transitions
      const delay = target.delayMs || 1500;
      await page.waitForTimeout(delay);

      if (target.beforeCapture) {
        await target.beforeCapture(page);
      }

      // Capture screenshot buffer
      const buffer = await page.screenshot({
        fullPage: false,
        type: "png",
      });

      // Save to all target output directories
      for (const outDir of OUTPUT_DIRS) {
        const destPath = path.join(outDir, target.name);
        fs.writeFileSync(destPath, buffer);
        console.log(`  ✅ Saved -> ${destPath}`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to capture ${target.name}:`, error);
    }
  }

  await context.close();
  await browser.close();

  console.log("\n✨ All screenshots captured successfully!\n");
}

captureScreenshots().catch((err) => {
  console.error("Screenshot capture process failed:", err);
  process.exit(1);
});
