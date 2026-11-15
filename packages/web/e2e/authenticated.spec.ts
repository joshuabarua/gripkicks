import { expect, test, type Browser, type Page } from "@playwright/test";

const runAuthenticated = process.env["E2E_RUN_AUTHENTICATED"] === "true";
const baseUrl = process.env["E2E_BASE_URL"];
const userEmail = process.env["E2E_USER_EMAIL"];
const userPassword = process.env["E2E_USER_PASSWORD"];
const adminEmail = process.env["E2E_ADMIN_EMAIL"];
const adminPassword = process.env["E2E_ADMIN_PASSWORD"];
const shoeQuery = process.env["E2E_SHOE_QUERY"];
// Cloudflare blocks headless browsers as content bots. A WAF skip rule lets
// requests carrying this secret header through; it is only sent to the site
// under test, never to third-party hosts.
const BYPASS_HEADER = "x-gripkicks-e2e";
const bypassToken = process.env["E2E_CF_BYPASS_TOKEN"];
const bypassHeaders: Record<string, string> = bypassToken ? { [BYPASS_HEADER]: bypassToken } : {};
const stagingConfigured = Boolean(
  runAuthenticated &&
    baseUrl &&
    userEmail &&
    userPassword &&
    adminEmail &&
    adminPassword,
);

const memberStatePath = "test-results/.auth/member.json";
const adminStatePath = "test-results/.auth/admin.json";

test.use({ screenshot: "off", trace: "off", video: "off" });

type FootShape = "Egyptian" | "Roman" | "Greek" | "Germanic" | "Celtic";
type FootVolume = "Low Volume" | "Medium Volume" | "High Volume";

async function storeAuthState(
  browser: Browser,
  email: string,
  password: string,
  path: string,
) {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const response = await context.request.post(
    `${baseUrl}/api/auth/sign-in/email`,
    {
      data: { email, password },
      headers: { Origin: baseUrl!, ...bypassHeaders },
    },
  );
  if (!response.ok()) {
    throw new Error(`E2E sign-in failed with status ${response.status()}`);
  }
  await context.storageState({ path });
  await context.close();
}

async function gotoAuthenticated(page: Page, path: string) {
  // Record auth and API responses so a failure can say which call went wrong.
  const apiCalls: string[] = [];
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.pathname.startsWith("/api/")) apiCalls.push(`${response.status()} ${url.host}${url.pathname}`);
  });
  await page.goto(path);
  // The menu button only renders for signed-in users.
  const authenticatedNav = page.getByRole("button", { name: /^(Open|Close) menu$/ });
  const settled = await authenticatedNav
    .waitFor({ state: "visible", timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  if (!settled) {
    await page.reload();
    const recovered = await authenticatedNav
      .waitFor({ state: "visible", timeout: 30_000 })
      .then(() => true)
      .catch(() => false);
    if (!recovered) {
      // Say what loaded instead (a Cloudflare page, the signed-out site, an error).
      const body = (await page.locator("body").innerText().catch(() => "")).replace(/\s+/g, " ").slice(0, 300);
      const cookies = (await page.context().cookies()).map((c) => `${c.name}@${c.domain}`).join(", ");
      throw new Error(
        `Signed-in menu never appeared on ${page.url()} (title: "${await page.title()}"). Page text: ${body}\n` +
          `API calls: ${apiCalls.slice(-15).join(" | ") || "none"}\nCookies (names only): ${cookies || "none"}`,
      );
    }
  }
}

function footShapeButton(page: Page, name: FootShape) {
  return page.getByRole("button", { name: new RegExp(`^${name}\\b`) });
}

function footVolumeButton(page: Page, name: FootVolume) {
  return page.getByRole("button", { name: new RegExp(`^${name}\\b`) });
}

async function saveFootProfile(
  page: Page,
  shape: FootShape,
  volume: FootVolume,
) {
  await footShapeButton(page, shape).click();
  await footVolumeButton(page, volume).click();
  const saveButton = page.getByRole("button", { name: "SAVE PROFILE" });
  await expect(saveButton).toBeEnabled();
  const responsePromise = page.waitForResponse((response) => {
    return (
      new URL(response.url()).pathname === "/api/v1/profile" &&
      response.request().method() === "PUT"
    );
  });
  await saveButton.click();
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  await expect(page.getByRole("button", { name: "SAVED" })).toBeVisible();
  await page.waitForURL((url) => url.pathname === "/dashboard");
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Opens the Sanctuary card for a shoe (if it isn't already) and returns it.
async function openShoeCard(page: Page, shoeName: string) {
  const name = escapeRegExp(shoeName);
  const hide = page.getByRole("button", { name: new RegExp(`^Hide details for .*${name}$`) }).first();
  const show = page.getByRole("button", { name: new RegExp(`^Show details for .*${name}$`) }).first();
  // The card can take a moment to appear (a new shoe arrives already expanded).
  await expect(hide.or(show)).toBeVisible();
  if (!(await hide.isVisible())) await show.click();
  await expect(hide).toBeVisible();
  return page.locator("article").filter({ has: hide });
}

async function removeShoe(page: Page, shoeName: string) {
  await page.keyboard.press("Escape");
  const name = escapeRegExp(shoeName);
  const toggle = page.getByRole("button", { name: new RegExp(`^(Show|Hide) details for .*${name}$`) }).first();
  if (!(await toggle.isVisible().catch(() => false))) return;

  const card = await openShoeCard(page, shoeName);
  await card.getByRole("button", { name: "Remove" }).click();
  const confirmDialog = page.getByRole("dialog", { name: "Remove shoe?" });
  await expect(confirmDialog).toBeVisible();
  await confirmDialog.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Shoe removed from your sanctuary")).toBeVisible();
}

test.describe("authenticated staging critical paths", () => {
  test.describe.configure({ mode: "serial", timeout: 90_000 });
  test.skip(
    !stagingConfigured,
    "Set E2E_RUN_AUTHENTICATED=true, E2E_BASE_URL, and member/admin credentials to run staging mutations.",
  );

  test.beforeEach(async ({ context }) => {
    if (!bypassToken) return;
    const siteOrigin = new URL(baseUrl!).origin;
    await context.route(`${siteOrigin}/**`, (route) =>
      route.continue({ headers: { ...route.request().headers(), ...bypassHeaders } }),
    );
  });

  test.beforeAll(async ({ browser }) => {
    await storeAuthState(browser, userEmail!, userPassword!, memberStatePath);
    await storeAuthState(browser, adminEmail!, adminPassword!, adminStatePath);
  });

  test.describe("member", () => {
    test.use({ storageState: memberStatePath });

    test("Foot Lab saves a profile", async ({ page }) => {
      await gotoAuthenticated(page, "/footlab");
      await expect(page.getByRole("heading", { level: 1, name: /FOOT LAB/i })).toBeVisible();

      const profileResponse = await page.request.get("/api/v1/profile", { headers: bypassHeaders });
      expect(profileResponse.ok(), `GET /api/v1/profile returned ${profileResponse.status()}: ${(await profileResponse.text()).slice(0, 200)}`).toBe(true);
      const profilePayload = (await profileResponse.json()) as {
        data?: { footShape?: string; footVolume?: string };
        footShape?: string;
        footVolume?: string;
      };
      const profile = profilePayload.data ?? profilePayload;
      const originalShape = profile.footShape
        ? (`${profile.footShape[0]?.toUpperCase()}${profile.footShape.slice(1)}` as FootShape)
        : undefined;
      const originalVolume = profile.footVolume
        ? (`${profile.footVolume[0]?.toUpperCase()}${profile.footVolume.slice(1)} Volume` as FootVolume)
        : undefined;
      const nextShape = originalShape === "Egyptian" ? "Roman" : "Egyptian";
      const nextVolume = originalVolume === "Low Volume" ? "Medium Volume" : "Low Volume";
      let changed = false;

      if (originalShape && originalVolume) {
        await expect(footShapeButton(page, originalShape)).toHaveAttribute("aria-pressed", "true");
        await expect(footVolumeButton(page, originalVolume)).toHaveAttribute("aria-pressed", "true");
      }

      try {
        await saveFootProfile(page, nextShape, nextVolume);
        changed = true;
      } finally {
        if (changed && originalShape && originalVolume) {
          await page.goto("/footlab");
          await expect(page.getByRole("heading", { level: 1, name: /FOOT LAB/i })).toBeVisible();
          const restoreProfileResponse = await page.request.get("/api/v1/profile", { headers: bypassHeaders });
          expect(restoreProfileResponse.ok()).toBe(true);
          await expect(footShapeButton(page, nextShape)).toHaveAttribute("aria-pressed", "true");
          await expect(footVolumeButton(page, nextVolume)).toHaveAttribute("aria-pressed", "true");
          await saveFootProfile(page, originalShape, originalVolume);
        }
      }
    });

    test("Sanctuary adds, edits, and removes a shoe", async ({ page }) => {
      await gotoAuthenticated(page, "/stash");
      await expect(page.getByRole("heading", { level: 1, name: /Shoe\s+Sanctuary/i })).toBeVisible();
      await page.getByRole("button", { name: "Add Shoe" }).dispatchEvent("click");

      const addDialog = page.getByRole("dialog").filter({ hasText: "Add New Shoe" });
      await expect(addDialog).toBeVisible();
      if (shoeQuery) {
        await addDialog.getByPlaceholder("Search for shoes...").fill(shoeQuery);
      }

      const addVariantButton = addDialog.locator("button:has(svg.lucide-plus)").first();
      await expect(addVariantButton).toBeVisible();
      const shoeName = (await addVariantButton.locator("p").last().textContent())?.trim();
      if (!shoeName) throw new Error("No available catalog shoe was found for the staging account.");

      let added = false;
      try {
        await addVariantButton.click();
        added = true;
        await expect(page.getByText("Shoe added to your sanctuary!")).toBeVisible();
        await expect(addDialog).not.toBeVisible();

        // A newly added shoe opens expanded; edit its condition inline.
        const card = await openShoeCard(page, shoeName);
        await card.getByLabel("Condition").selectOption("Good");

        // The change should survive a reload.
        await page.reload();
        await expect(page.getByRole("heading", { level: 1, name: /Shoe\s+Sanctuary/i })).toBeVisible();
        const reloadedCard = await openShoeCard(page, shoeName);
        await expect(reloadedCard.getByLabel("Condition")).toHaveValue("Good");
      } finally {
        if (added) await removeShoe(page, shoeName);
      }
    });

    test("Matcher loads community results", async ({ page }) => {
      await gotoAuthenticated(page, "/matcher");
      await expect(page.getByRole("heading", { level: 1, name: "MATCHER" })).toBeVisible();
      await page.getByRole("button", { name: /^Community/ }).click();
      await expect(
        page.getByText(/Community ratings|Not enough community ratings yet/i).first(),
      ).toBeVisible();
    });

    test("a member cannot access admin", async ({ page }) => {
      await gotoAuthenticated(page, "/dashboard");
      await page.goto("/admin");
      await expect(page).toHaveURL((url) => url.pathname === "/");
      await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toHaveCount(0);
    });
  });

  test.describe("admin", () => {
    test.use({ storageState: adminStatePath });

    test("an administrator can access admin", async ({ page }) => {
      await gotoAuthenticated(page, "/admin");
      await expect(page.getByRole("heading", { level: 1, name: "Admin Dashboard" })).toBeVisible();
    });
  });
});
