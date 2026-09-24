import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(6000);
for (let i = 0; i < 5; i++) {
  await page.screenshot({ path: `temp/blender/preview/home-frame-${i}.png` });
  await page.waitForTimeout(1300);
}
await browser.close();
