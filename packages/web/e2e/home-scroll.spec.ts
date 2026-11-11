import { expect, test } from "@playwright/test";

test.use({ video: "off" });

test("home page wheel scrolls the window, not the inner main", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForTimeout(1800);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 180);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(160);
  const mainTop = await page.evaluate(() => document.querySelector("main")!.scrollTop);
  expect(mainTop).toBe(0);
  await page.mouse.wheel(0, -70);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(180);
});
