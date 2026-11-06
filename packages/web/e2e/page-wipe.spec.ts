import { expect, test } from "@playwright/test";

test.use({ video: "off" });

type WipeSnapshot = {
  types: string[];
  width: number;
  height: number;
  opacity: number;
  color: string;
};

type WipeWindow = Window & { wipeSnapshot?: WipeSnapshot };

test("page navigation paints a full-viewport wipe", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/about");
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const state = window as WipeWindow;
    const startViewTransition = document.startViewTransition.bind(document);
    document.startViewTransition = (options) => {
      const transition = startViewTransition(options);
      transition.ready.then(() => {
        const overlay = getComputedStyle(document.documentElement, "::view-transition");
        const root = getComputedStyle(document.documentElement, "::view-transition-group(root)");
        state.wipeSnapshot = {
          types: typeof options === "object" && options ? options.types ?? [] : [],
          width: parseFloat(overlay.width),
          height: parseFloat(overlay.height),
          opacity: parseFloat(root.opacity),
          color: overlay.backgroundColor,
        };
      });
      return transition;
    };
  });

  await page.getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect.poll(() => page.evaluate(() =>
    (window as WipeWindow).wipeSnapshot,
  )).toBeDefined();

  const snapshot = await page.evaluate(() => (window as WipeWindow).wipeSnapshot);
  expect(snapshot?.types).toContain("page-nav");
  expect(snapshot?.width).toBeGreaterThan(0.9 * page.viewportSize()!.width);
  expect(snapshot?.height).toBeGreaterThan(0.9 * page.viewportSize()!.height);
  expect(snapshot?.opacity).toBeGreaterThan(0.9);
  expect(snapshot?.color).toBe("rgb(244, 91, 91)");
});
