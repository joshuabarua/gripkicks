import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { RAIN_PIECES } from "../src/lib/transition-rain";

test.use({ video: "off" });

type WipeSnapshot = {
  types: string[];
  width: number;
  height: number;
  opacity: number;
  color: string;
  overlayColor: string;
};

type MenuProbe = {
  calls: number;
  menuPresentAtTransition?: boolean;
  svtMenuPresence: boolean[];
  svtMenuWidths: number[];
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
    const probe: MenuProbe = { calls: 0, svtMenuPresence: [], svtMenuWidths: [], svtTypes: [], samples: [] };
    state.menuProbe = probe;
    const startViewTransition = document.startViewTransition.bind(document);
    document.startViewTransition = (options) => {
      const menu = document.querySelector(".nav-menu") as HTMLElement | null;
      const present = menu !== null;
      probe.calls += 1;
      probe.svtMenuPresence.push(present);
      probe.svtMenuWidths.push(menu ? menu.getBoundingClientRect().width : 0);
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
        const curtain = getComputedStyle(document.documentElement, "::view-transition-group(vt-trigger)");
        const root = getComputedStyle(document.documentElement, "::view-transition-group(root)");
        state.wipeSnapshot = {
          types: typeof options === "object" && options ? options.types ?? [] : [],
          width: parseFloat(curtain.width),
          height: parseFloat(curtain.height),
          opacity: parseFloat(root.opacity),
          color: curtain.backgroundColor,
          overlayColor: overlay.backgroundColor,
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
  expect(snapshot?.overlayColor).toBe("rgba(0, 0, 0, 0)");
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

    const expectMenuCollapseHandoff = async (
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
      const closedWidth = 72;
      const handoffWidth = closedWidth + Math.max(0, openWidth - closedWidth) * 0.25;
      expect(probe.calls).toBeGreaterThan(0);
      expect(probe.svtMenuWidths.every((width) => width <= handoffWidth + 2)).toBe(true);
      expect(probe.svtTypes.flat()).toContain("page-nav");
      const menuVisible = probe.samples.filter((sample) => sample.width > 1);
      expect(
        menuVisible.every((sample) => sample.width <= handoffWidth + 2 || sample.path === "/about"),
      ).toBe(true);
      const intermediate = menuVisible
        .map((sample) => sample.width)
        .filter((width) => width < openWidth - 2);
      const distinct = new Set(intermediate.map((width) => Math.round(width)));
      expect(distinct.size).toBeGreaterThanOrEqual(2);
      expect(Math.max(...intermediate) - Math.min(...intermediate)).toBeGreaterThan(2);
    };

    test(`menu hands off routing near collapse (${viewport.name})`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await stubSession(page);
      await page.setViewportSize(viewport.size);
      await page.goto("/about");

      const menu = await openMenu(page);
      await expectMenuCollapseHandoff(
        page,
        testInfo,
        () => menu.getByRole("link", { name: "Privacy" }).click(),
      );
    });

    test(`menu hands off routing near collapse on outside-menu navigation (${viewport.name})`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await stubSession(page);
      await page.setViewportSize(viewport.size);
      await page.goto("/about");

      await openMenu(page);
      await expectMenuCollapseHandoff(
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

test("wipe holds full red between the old root exit and the overlay reveal", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/about");
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const state = window as Window & { holdSnapshot?: Record<string, unknown>; holdMs?: number };
    const startViewTransition = document.startViewTransition.bind(document);
    document.startViewTransition = (options) => {
      const transition = startViewTransition(options);
      transition.ready.then(() => {
        const overlayStyle = getComputedStyle(document.documentElement, "::view-transition-group(vt-trigger)");
        const groupStyle = getComputedStyle(document.documentElement, "::view-transition-group(root)");
        const oldStyle = getComputedStyle(document.documentElement, "::view-transition-old(root)");
        const oldEnd =
          (Number.parseFloat(oldStyle.animationDuration) + Number.parseFloat(oldStyle.animationDelay)) * 1000;
        const overlayDelay = Number.parseFloat(overlayStyle.animationDelay) * 1000;
        const holdMs = overlayDelay - oldEnd;
        const pauseAt = oldEnd + holdMs / 2;
        state.holdMs = holdMs;
        const anims = document
          .getAnimations()
          .filter((anim) => (anim as CSSAnimation).animationName === "page-wipe-out");
        for (const anim of anims) {
          anim.currentTime = pauseAt;
          anim.pause();
        }
        state.holdSnapshot = {
          overlayClip: getComputedStyle(document.documentElement, "::view-transition-group(vt-trigger)").clipPath,
          oldClip: getComputedStyle(document.documentElement, "::view-transition-old(root)").clipPath,
          overlayColor: overlayStyle.backgroundColor,
          overlayWidth: Number.parseFloat(overlayStyle.width),
          overlayHeight: Number.parseFloat(overlayStyle.height),
          groupOpacity: Number.parseFloat(groupStyle.opacity),
        };
      });
      return transition;
    };
  });

  await page.getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect.poll(() => page.evaluate(() =>
    (window as Window & { holdSnapshot?: unknown }).holdSnapshot !== undefined,
  )).toBe(true);

  const viewport = page.viewportSize()!;
  const snapshot = await page.evaluate(() => {
    const state = window as Window & {
      holdSnapshot?: {
        overlayClip: string;
        oldClip: string;
        overlayColor: string;
        overlayWidth: number;
        overlayHeight: number;
        groupOpacity: number;
      };
      holdMs?: number;
    };
    return { snap: state.holdSnapshot, holdMs: state.holdMs };
  });

  const insetParts = (clip: string) =>
    (clip.match(/[\d.]+(?:px|%)/g) ?? []).map((part) => Number.parseFloat(part));

  try {
    await page.screenshot({ path: testInfo.outputPath("wipe-hold.png") });
    await testInfo.attach("wipe-hold", {
      path: testInfo.outputPath("wipe-hold.png"),
      contentType: "image/png",
    });

    expect(snapshot.holdMs).toBeGreaterThanOrEqual(150);
    const oldParts = insetParts(snapshot.snap?.oldClip ?? "");
    expect(oldParts[0]).toBe(100);
    expect(oldParts.slice(1).every((part) => part === 0)).toBe(true);
    expect(insetParts(snapshot.snap?.overlayClip ?? "").every((part) => part === 0)).toBe(true);
    expect(snapshot.snap?.overlayColor).toBe("rgb(244, 91, 91)");
    expect(snapshot.snap?.overlayWidth).toBeGreaterThan(0.9 * viewport.width);
    expect(snapshot.snap?.overlayHeight).toBeGreaterThan(0.9 * viewport.height);
    expect(snapshot.snap?.groupOpacity).toBeGreaterThan(0.9);
  } finally {
    await page.evaluate(() => {
      for (const anim of document.getAnimations()) {
        if ((anim as CSSAnimation).animationName === "page-wipe-out") anim.play();
      }
    });
  }
});

type RainFrame = {
  name: string;
  display: string;
  animationName: string;
  duration: number;
  width: number;
  height: number;
  x: number;
  y: number;
  a: number;
  d: number;
  z: string;
  bg: string;
};

type RainProbe = {
  count: number;
  paused: number[];
  frames: Record<number, RainFrame[]>;
  clips: Record<number, { oldClip: string; curtainClip: string }>;
  labStates: Record<number, string[]>;
};

test.describe("transition rain", () => {
  for (const viewport of [
    { name: "desktop", size: { width: 1440, height: 900 }, expected: 36, maxPiece: 100 },
    { name: "mobile", size: { width: 390, height: 844 }, expected: 21, maxPiece: 46 },
  ]) {
    test(`paints ${viewport.expected} falling holds before and after the wipe (${viewport.name})`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.setViewportSize(viewport.size);
      await page.goto("/about");
      await page.waitForTimeout(1500);
      await page.evaluate((rainCount) => {
        const collect = () =>
          Array.from({ length: rainCount }, (_, i) => {
            const style = getComputedStyle(
              document.documentElement,
              `::view-transition-group(page-rain-${i})`,
            );
            const matrix = new DOMMatrixReadOnly(
              style.transform === "none" ? undefined : style.transform,
            );
            return {
              name: `page-rain-${i}`,
              display: style.display,
              animationName: style.animationName,
              duration: Number.parseFloat(style.animationDuration) * 1000,
              width: Number.parseFloat(style.width),
              height: Number.parseFloat(style.height),
              x: matrix.e,
              y: matrix.f,
              a: matrix.a,
              d: matrix.d,
              z: style.zIndex,
              bg: style.backgroundImage,
            };
          });
        const state = window as Window & {
          rainProbe?: RainProbe;
          freezePhase?: (t: number) => void;
          resumeWipeAnimations?: () => void;
        };
        state.rainProbe = { count: 0, paused: [], frames: {}, clips: {}, labStates: {} };
        state.freezePhase = (t: number) => {
          for (const anim of document.getAnimations()) {
            const name = (anim as CSSAnimation).animationName;
            if (name === "page-rain-fall" || name === "page-wipe-out") {
              anim.currentTime = t;
              anim.pause();
            }
          }
          state.rainProbe!.frames[t] = collect();
          state.rainProbe!.clips[t] = {
            oldClip: getComputedStyle(document.documentElement, "::view-transition-old(root)").clipPath,
            curtainClip: getComputedStyle(document.documentElement, "::view-transition-group(vt-trigger)").clipPath,
          };
          state.rainProbe!.labStates[t] = [...document.querySelectorAll(".lab-rise,.lab-fade")].map(
            (el) => getComputedStyle(el).animationPlayState,
          );
          state.rainProbe!.paused.push(t);
        };
        state.resumeWipeAnimations = () => {
          for (const anim of document.getAnimations()) {
            const name = (anim as CSSAnimation).animationName;
            if (name === "page-rain-fall" || name === "page-wipe-out") {
              anim.play();
            }
          }
        };
        const startViewTransition = document.startViewTransition.bind(document);
        document.startViewTransition = (options) => {
          const transition = startViewTransition(options);
          transition.ready.then(() => {
            state.rainProbe!.count = document
              .getAnimations()
              .filter((anim) => (anim as CSSAnimation).animationName === "page-rain-fall").length;
            state.freezePhase!(60);
          });
          return transition;
        };
      }, RAIN_PIECES.length);

      try {
        await page.locator("footer").getByRole("link", { name: "Privacy" }).click();
        for (const t of [60, 300, 1550]) {
          if (t !== 60) {
            await page.evaluate((phase) =>
              (window as Window & { freezePhase?: (t: number) => void }).freezePhase!(phase), t,
            );
          }
          await expect.poll(() => page.evaluate((phase) =>
            (window as Window & { rainProbe?: RainProbe }).rainProbe?.paused.includes(phase) ?? false, t,
          )).toBe(true);
          await page.screenshot({ path: testInfo.outputPath(`rain-${t}-${viewport.name}.png`) });
          await testInfo.attach(`rain-${t}-${viewport.name}`, {
            path: testInfo.outputPath(`rain-${t}-${viewport.name}.png`),
            contentType: "image/png",
          });
        }
        await expect(page).toHaveURL(/\/privacy$/);

        const probe = await page.evaluate(() =>
          (window as Window & { rainProbe?: RainProbe }).rainProbe!,
        );
        await testInfo.attach("rain-trace", {
          body: JSON.stringify(probe),
          contentType: "application/json",
        });

        expect(probe.count).toBe(viewport.expected);
        const insetParts = (clip: string) =>
          (clip.match(/[\d.]+(?:px|%)/g) ?? []).map((part) => Number.parseFloat(part));
        const activeAt = (t: number) => (probe.frames[t] ?? []).filter((piece) => piece.display !== "none");
        const indexOf = (piece: RainFrame) => Number.parseInt(piece.name.split("-").pop() ?? "-1", 10) % 12;
        const inside = (frames: RainFrame[]) =>
          frames.filter((piece) =>
            piece.x >= 0 && piece.x <= viewport.size.width && piece.y >= 0 && piece.y <= viewport.size.height,
          );

        for (const t of [60, 300, 1550]) {
          const active = activeAt(t);
          expect(active).toHaveLength(viewport.expected);
          for (const piece of active) {
            expect(piece.bg).toContain("/imgs/transition/rain-");
            expect(piece.bg).toContain(".webp");
            expect(piece.bg).not.toContain(".png");
            expect(piece.z).toBe("2");
            expect(piece.width).toBeGreaterThanOrEqual(32);
            expect(piece.width).toBeLessThanOrEqual(viewport.maxPiece);
            expect(piece.height).toBeGreaterThanOrEqual(32);
            expect(piece.height).toBeLessThanOrEqual(viewport.maxPiece);
            expect(piece.animationName).toBe("page-rain-fall");
            expect(piece.duration).toBeGreaterThanOrEqual(850);
            expect(!(piece.x === 0 && piece.y === 0)).toBe(true);
          }
          const xs = new Set(active.map((piece) => Math.round(piece.x)));
          const ys = new Set(active.map((piece) => Math.round(piece.y)));
          expect(xs.size).toBeGreaterThan(5);
          expect(ys.size).toBeGreaterThan(5);
        }

        const leadsAt60 = activeAt(60).filter((piece) => indexOf(piece) <= 6);
        const tailsAt60 = activeAt(60).filter((piece) => indexOf(piece) >= 7);
        const leadsAt1550 = activeAt(1550).filter((piece) => indexOf(piece) <= 6);
        const tailsAt1550 = activeAt(1550).filter((piece) => indexOf(piece) >= 7);
        expect(inside(leadsAt60).length).toBeGreaterThanOrEqual(2);
        expect(tailsAt60.every((piece) => piece.y < 0)).toBe(true);
        expect(insetParts(probe.clips[60]?.oldClip ?? "inset(100%)").every((part) => part === 0)).toBe(true);
        expect(inside(tailsAt1550).length).toBeGreaterThanOrEqual(1);
        expect(leadsAt1550.every((piece) => piece.y > viewport.size.height)).toBe(true);
        expect((probe.clips[1550]?.curtainClip ?? "").startsWith("inset(100%")).toBe(true);
        expect((probe.labStates[1550] ?? []).length).toBeGreaterThan(0);
        expect((probe.labStates[1550] ?? []).every((state) => state !== "paused")).toBe(true);
        for (const lead of activeAt(60).filter((piece) => indexOf(piece) <= 6)) {
          const later = (probe.frames[300] ?? []).find((piece) => piece.name === lead.name);
          if (later) {
            expect(later.y - lead.y).toBeGreaterThan(100);
          }
        }
      } finally {
        await page.evaluate(() =>
          (window as Window & { resumeWipeAnimations?: () => void }).resumeWipeAnimations!(),
        );
      }
    });

    test(`leaves no rain under reduced motion (${viewport.name})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(viewport.size);
      await page.goto("/about");
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        const state = window as Window & { rainCount?: number; readySeen?: boolean };
        const startViewTransition = document.startViewTransition.bind(document);
        document.startViewTransition = (options) => {
          const transition = startViewTransition(options);
          transition.ready.then(() => {
            state.readySeen = true;
            state.rainCount = document
              .getAnimations()
              .filter((anim) => (anim as CSSAnimation).animationName === "page-rain-fall").length;
          });
          return transition;
        };
      });
      await page.locator("footer").getByRole("link", { name: "Privacy" }).click();
      await expect(page).toHaveURL(/\/privacy$/);
      await expect.poll(() => page.evaluate(() =>
        (window as Window & { readySeen?: boolean }).readySeen ?? false,
      )).toBe(true);
      const count = await page.evaluate(() => (window as Window & { rainCount?: number }).rainCount);
      expect(count).toBe(0);
    });
  }

  test("keeps thirty-six stable boundaries across repeated navigations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    await page.waitForTimeout(1500);
    const spans = () => page.locator("span.size-0.overflow-hidden").count();
    await page.locator("footer").getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await page.locator("footer").getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator(".nav-menu")).toHaveCount(0);
    expect(await spans()).toBe(37);
    expect(await page.locator("footer").getByRole("link", { name: "Privacy" }).count()).toBe(1);
  });
});
