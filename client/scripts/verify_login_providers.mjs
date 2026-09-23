import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });

  assert.equal(await page.getByText("OR CONTINUE WITH").count(), 0);
  for (const provider of ["Apple", "Google", "Meta"]) {
    assert.equal(await page.getByRole("button", { name: `Login with ${provider}` }).count(), 0);
  }
  assert.equal(await page.getByRole("button", { name: "AUTHENTICATE OPERATIVE" }).count(), 1);
  assert.equal(await page.getByRole("button", { name: /ENTER AS GUEST HUNTER/ }).count(), 1);

  console.log("Login shows only implemented sign-in choices.");
} finally {
  await browser.close();
}
