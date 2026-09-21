import { expect, test, type Browser, type Page } from "@playwright/test";

const runAuthenticated = process.env["E2E_RUN_AUTHENTICATED"] === "true";
const baseUrl = process.env["E2E_BASE_URL"];
const userEmail = process.env["E2E_USER_EMAIL"];
const userPassword = process.env["E2E_USER_PASSWORD"];
const adminEmail = process.env["E2E_ADMIN_EMAIL"];
const adminPassword = process.env["E2E_ADMIN_PASSWORD"];
const shoeQuery = process.env["E2E_SHOE_QUERY"];
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
      headers: { Origin: baseUrl! },
    },
  );
  if (!response.ok()) {
    throw new Error(`E2E sign-in failed with status ${response.status()}`);
  }
  await context.storageState({ path });
  await context.close();
}

async function gotoAuthenticated(page: Page, path: string) {
  await page.goto(path);
  const authenticatedNav = page.locator("div.nav-button");
  const settled = await authenticatedNav
    .waitFor({ state: "visible", timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  if (!settled) {
    await page.reload();
    await expect(authenticatedNav).toBeVisible({ timeout: 30_000 });
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

async function removeShoe(page: Page, shoeName: string) {
  const editDialog = page.getByRole("dialog").filter({ hasText: "Edit Shoe Stats" });
  if (await editDialog.isVisible().catch(() => false)) {
    page.once("dialog", (dialog) => void dialog.accept());
    await editDialog
      .getByRole("button", { name: "Remove shoe" })
      .or(editDialog.locator("button:has(svg.lucide-trash2)"))
      .dispatchEvent("click");
    await expect(page.getByText("Shoe removed from your sanctuary")).toBeVisible();
    return;
  }

  await page.keyboard.press("Escape");
  const shoeCardText = page.getByText(shoeName, { exact: true }).last();
  if (!(await shoeCardText.isVisible().catch(() => false))) return;

  await shoeCardText.click();
  const statsDialog = page
    .getByRole("dialog")
    .filter({ hasText: "Shoe Rank" })
    .filter({ hasText: shoeName });
  await expect(statsDialog).toBeVisible();
  page.once("dialog", (dialog) => void dialog.accept());
  await statsDialog
    .getByRole("button", { name: "Remove shoe" })
    .or(statsDialog.locator("button:has(svg.lucide-trash2)"))
    .click();
  await expect(page.getByText("Shoe removed from your sanctuary")).toBeVisible();
}

test.describe("authenticated staging critical paths", () => {
  test.describe.configure({ mode: "serial", timeout: 90_000 });
  test.skip(
    !stagingConfigured,
    "Set E2E_RUN_AUTHENTICATED=true, E2E_BASE_URL, and member/admin credentials to run staging mutations.",
  );

  test.beforeAll(async ({ browser }) => {
    await storeAuthState(browser, userEmail!, userPassword!, memberStatePath);
    await storeAuthState(browser, adminEmail!, adminPassword!, adminStatePath);
  });

  test.describe("member", () => {
    test.use({ storageState: memberStatePath });

    test("Foot Lab saves a profile", async ({ page }) => {
      await gotoAuthenticated(page, "/footlab");
      await expect(page.getByRole("heading", { level: 1, name: /FOOT LAB/i })).toBeVisible();

      const profileResponse = await page.request.get("/api/v1/profile");
      expect(profileResponse.ok()).toBe(true);
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
        await expect(footShapeButton(page, originalShape)).toHaveClass(/border-brand-red/);
        await expect(footVolumeButton(page, originalVolume)).toHaveClass(/border-brand-red/);
      }

      try {
        await saveFootProfile(page, nextShape, nextVolume);
        changed = true;
      } finally {
        if (changed && originalShape && originalVolume) {
          await page.goto("/footlab");
          await expect(page.getByRole("heading", { level: 1, name: /FOOT LAB/i })).toBeVisible();
          const restoreProfileResponse = await page.request.get("/api/v1/profile");
          expect(restoreProfileResponse.ok()).toBe(true);
          await expect(footShapeButton(page, nextShape)).toHaveClass(/border-brand-red/);
          await expect(footVolumeButton(page, nextVolume)).toHaveClass(/border-brand-red/);
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

        const shoeCardText = page.getByText(shoeName, { exact: true }).last();
        await expect(shoeCardText).toBeVisible();
        await shoeCardText.click();

        const statsDialog = page
          .getByRole("dialog")
          .filter({ hasText: "Shoe Rank" })
          .filter({ hasText: shoeName });
        await expect(statsDialog).toBeVisible();
        await statsDialog
          .getByRole("button", { name: "Edit shoe" })
          .or(statsDialog.locator("button:has(svg.lucide-square-pen)"))
          .click();

        const editDialog = page.getByRole("dialog").filter({ hasText: "Edit Shoe Stats" });
        await expect(editDialog).toBeVisible();
        await editDialog.locator("#condition").selectOption("Good");
        await editDialog.getByRole("button", { name: "Save Changes" }).dispatchEvent("click");
        await expect(page.getByText("Shoe updated successfully!")).toBeVisible();
      } finally {
        if (added) await removeShoe(page, shoeName);
      }
    });

    test("Matcher loads community results", async ({ page }) => {
      await gotoAuthenticated(page, "/matcher");
      await expect(page.getByRole("heading", { level: 1, name: "MATCHER" })).toBeVisible();
      await page.getByRole("button", { name: /^Community/ }).click();
      await expect(
        page.getByText(/Community Top Rated|Not enough community ratings yet/i).first(),
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
