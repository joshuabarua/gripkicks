import { expect, test, type Page, type TestInfo } from "@playwright/test";

test.use({ video: "off" });

type WipeSnapshot = {
  types: string[];
  width: number;
  height: number;
  opacity: number;
  color: string;
};

type MenuProbe = {
  calls: number;
  menuPresentAtTransition?: boolean;
  svtMenuPresence: boolean[];
  svtTypes: string[][];
  samples: { width: number; path: string }[];
};

type WipeWindow = Window & {
  wipeSnapshot?: WipeSnapshot;
  menuProbe?: MenuProbe;
};

const fakeSession = {
  user: {
    id: "e2e-user",
    name: "E2E User",
    email: "e2e@example.com",
    emailVerified: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  session: {
    id: "e2e-session",
    token: "e2e-token",
    userId: "e2e-user",
    expiresAt: "2999-01-01T00:00:00.000Z",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
};

async function stubSession(page: Page) {
  await page.route("**/api/auth/**", async (route, request) => {
    const origin = request.headers()["origin"] ?? "*";
    const cors = {
      "access-control-allow-origin": origin,
      "access-control-allow-credentials": "true",
      "access-control-allow-headers": "*",
      "access-control-allow-methods": "*",
    };
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    const isSession = request.url().includes("get-session");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: cors,
      body: JSON.stringify(isSession ? fakeSession : null),
    });
  });
}

async function openMenu(page: Page) {
  const trigger = page.getByRole("button", { name: "Open menu" });
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  await trigger.click();
  const menu = page.locator(".nav-menu");
  await expect(menu).toBeVisible();
  return menu;
}

async function startMenuProbe(page: Page) {
  await page.evaluate(() => {
    const state = window as WipeWindow;
    const probe: MenuProbe = { calls: 0, svtMenuPresence: [], svtTypes: [], samples: [] };
    state.menuProbe = probe;
    const startViewTransition = document.startViewTransition.bind(document);
    document.startViewTransition = (options) => {
      const present = document.querySelector(".nav-menu") !== null;
      probe.calls += 1;
      probe.svtMenuPresence.push(present);
      if (probe.menuPresentAtTransition === undefined) {
        probe.menuPresentAtTransition = present;
      }
      probe.svtTypes.push(typeof options === "object" && options ? options.types ?? [] : []);
      return startViewTransition(options);
    };
    const sample = () => {
      const menu = document.querySelector(".nav-menu") as HTMLElement | null;
      probe.samples.push({
        width: menu ? menu.getBoundingClientRect().width : 0,
        path: window.location.pathname,
      });
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

async function readMenuProbe(page: Page) {
  const probe = await page.evaluate(() => (window as WipeWindow).menuProbe);
  if (!probe) throw new Error("menu probe not installed");
  return probe;
}

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

test.describe("menu dismissal on in-menu navigation", () => {
  for (const viewport of [
    { name: "desktop", size: { width: 1440, height: 900 } },
    { name: "mobile", size: { width: 390, height: 844 } },
  ]) {
    const waitForOpenWidth = async (page: Page, menu: ReturnType<Page["locator"]>) => {
      await page.waitForFunction(() => new Promise<boolean>((resolve) => {
        const el = document.querySelector(".nav-menu") as HTMLElement | null;
        if (!el) return resolve(false);
        const first = el.getBoundingClientRect().width;
        requestAnimationFrame(() => {
          const second = el.getBoundingClientRect().width;
          resolve(first > 300 && Math.abs(second - first) < 0.5);
        });
      }));
      return menu.evaluate((el) => el.getBoundingClientRect().width);
    };

    const expectAnimatedCloseBeforeRoute = async (
      page: Page,
      testInfo: TestInfo,
      click: () => Promise<void>,
    ) => {
      const openWidth = await waitForOpenWidth(page, page.locator(".nav-menu"));
      await startMenuProbe(page);
      await click();
      await expect(page).toHaveURL(/\/privacy$/);
      await expect(page.locator(".nav-menu")).toHaveCount(0);

      const probe = await readMenuProbe(page);
      await testInfo.attach("menu-close-samples", {
        body: JSON.stringify(probe.samples),
        contentType: "application/json",
      });
      expect(probe.calls).toBeGreaterThan(0);
      expect(probe.menuPresentAtTransition).toBe(false);
      expect(probe.svtMenuPresence).not.toContain(true);
      expect(probe.svtTypes.flat()).toContain("page-nav");
      const closing = probe.samples
        .filter((sample) => sample.width > 1)
        .map((sample) => sample);
      expect(closing.every((sample) => sample.path === "/about")).toBe(true);
      const intermediate = closing
        .map((sample) => sample.width)
        .filter((width) => width < openWidth - 2);
      const distinct = new Set(intermediate.map((width) => Math.round(width)));
      expect(distinct.size).toBeGreaterThanOrEqual(2);
      expect(Math.max(...intermediate) - Math.min(...intermediate)).toBeGreaterThan(2);
    };

    test(`menu shrinks away before the wipe starts (${viewport.name})`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await stubSession(page);
      await page.setViewportSize(viewport.size);
      await page.goto("/about");

      const menu = await openMenu(page);
      await expectAnimatedCloseBeforeRoute(
        page,
        testInfo,
        () => menu.getByRole("link", { name: "Privacy" }).click(),
      );
    });

    test(`menu shrinks away before the wipe on outside-menu navigation (${viewport.name})`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await stubSession(page);
      await page.setViewportSize(viewport.size);
      await page.goto("/about");

      await openMenu(page);
      await expectAnimatedCloseBeforeRoute(
        page,
        testInfo,
        () => page.locator("footer").getByRole("link", { name: "Privacy" }).click(),
      );
    });

    test(`menu routes without a long close wait with reduced motion (${viewport.name})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await stubSession(page);
      await page.setViewportSize(viewport.size);
      await page.goto("/about");

      const menu = await openMenu(page);
      await menu.getByRole("link", { name: "Privacy" }).click();
      await expect(page).toHaveURL(/\/privacy$/);
      await expect(page.locator(".nav-menu")).toHaveCount(0);
    });
  }
});
