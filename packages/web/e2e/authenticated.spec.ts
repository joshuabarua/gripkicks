import { expect, test, type Page } from "@playwright/test";

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

test.use({ screenshot: "off", trace: "off", video: "off" });

const footShapes = ["Egyptian", "Roman", "Greek", "Germanic", "Celtic"] as const;
const footVolumes = ["Low Volume", "Medium Volume", "High Volume"] as const;

type FootShape = (typeof footShapes)[number];
type FootVolume = (typeof footVolumes)[number];

async function login(
  page: Page,
  email: string,
  password: string,
  callbackPath: string,
) {
  await page.goto(`/auth/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await Promise.all([
    page.waitForURL((url) => url.pathname === callbackPath, { timeout: 30_000 }),
    page.getByRole("button", { name: "LOGIN", exact: true }).click(),
  ]);
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
    await editDialog.locator("button:has(svg.lucide-trash-2)").click();
    await expect(page.getByText("Shoe removed from your sanctuary")).toBeVisible();
    return;
  }

  await page.keyboard.press("Escape");
  const shoeCardText = page.getByText(shoeName, { exact: true }).last();
  if (!(await shoeCardText.isVisible().catch(() => false))) return;

  await shoeCardText.click();
  const statsDialog = page.getByRole("dialog").filter({ hasText: shoeName });
  await expect(statsDialog).toBeVisible();
  page.once("dialog", (dialog) => void dialog.accept());
  await statsDialog.locator("button:has(svg.lucide-trash-2)").click();
  await expect(page.getByText("Shoe removed from your sanctuary")).toBeVisible();
}

test.describe("authenticated staging critical paths", () => {
  test.describe.configure({ mode: "serial", timeout: 90_000 });
  test.skip(
    !stagingConfigured,
    "Set E2E_RUN_AUTHENTICATED=true, E2E_BASE_URL, and member/admin credentials to run staging mutations.",
  );

  test("Foot Lab saves a profile", async ({ page }) => {
    const profileResponsePromise = page.waitForResponse((response) => {
      return (
        new URL(response.url()).pathname === "/api/v1/profile" &&
        response.request().method() === "GET"
      );
    });

    await login(page, userEmail!, userPassword!, "/footlab");
    await expect(page.getByRole("heading", { level: 1, name: /Know your\s+foot/i })).toBeVisible();

    const profileResponse = await profileResponsePromise;
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
        const restoreProfileResponsePromise = page.waitForResponse((response) => {
          return (
            new URL(response.url()).pathname === "/api/v1/profile" &&
            response.request().method() === "GET"
          );
        });
        await page.goto("/footlab");
        await expect(page.getByRole("heading", { level: 1, name: /Know your\s+foot/i })).toBeVisible();
        const restoreProfileResponse = await restoreProfileResponsePromise;
        expect(restoreProfileResponse.ok()).toBe(true);
        await expect(footShapeButton(page, nextShape)).toHaveClass(/border-brand-red/);
        await expect(footVolumeButton(page, nextVolume)).toHaveClass(/border-brand-red/);
        await saveFootProfile(page, originalShape, originalVolume);
      }
    }
  });

  test("Sanctuary adds, edits, and removes a shoe", async ({ page }) => {
    await login(page, userEmail!, userPassword!, "/stash");
    await expect(page.getByRole("heading", { level: 1, name: /Shoe\s+Sanctuary/i })).toBeVisible();
    await page.getByRole("button", { name: "Add Shoe" }).click();

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
      const addResponsePromise = page.waitForResponse((response) => {
        return (
          new URL(response.url()).pathname === "/api/v1/stash" &&
          response.request().method() === "POST"
        );
      });
      await addVariantButton.click();
      const addResponse = await addResponsePromise;
      expect(addResponse.ok()).toBe(true);
      added = true;
      await expect(page.getByText("Shoe added to your sanctuary!")).toBeVisible();

      const shoeCardText = page.getByText(shoeName, { exact: true }).last();
      await expect(shoeCardText).toBeVisible();
      await shoeCardText.click();

      const statsDialog = page.getByRole("dialog").filter({ hasText: shoeName });
      await expect(statsDialog).toBeVisible();
      await statsDialog.locator("button:has(svg.lucide-edit)").click();

      const editDialog = page.getByRole("dialog").filter({ hasText: "Edit Shoe Stats" });
      await expect(editDialog).toBeVisible();
      await editDialog.locator("#condition").selectOption("good");
      const updateResponsePromise = page.waitForResponse((response) => {
        return (
          new URL(response.url()).pathname.startsWith("/api/v1/stash/") &&
          response.request().method() === "PUT"
        );
      });
      await editDialog.getByRole("button", { name: "Save Changes" }).click();
      const updateResponse = await updateResponsePromise;
      expect(updateResponse.ok()).toBe(true);
      await expect(page.getByText("Shoe updated successfully!")).toBeVisible();
    } finally {
      if (added) await removeShoe(page, shoeName);
    }
  });

  test("Matcher loads community results", async ({ page }) => {
    await login(page, userEmail!, userPassword!, "/matcher");
    await expect(page.getByRole("heading", { level: 1, name: "MATCHER" })).toBeVisible();
    await page.getByRole("button", { name: /^Community/ }).click();
    await expect(
      page.getByText(/Community Top Rated|Not enough community ratings yet/i).first(),
    ).toBeVisible();
  });

  test("a member cannot access admin", async ({ page }) => {
    await login(page, userEmail!, userPassword!, "/dashboard");
    await page.goto("/admin");
    await expect(page).toHaveURL((url) => url.pathname === "/");
    await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toHaveCount(0);
  });

  test("an administrator can access admin", async ({ page }) => {
    await login(page, adminEmail!, adminPassword!, "/admin");
    await expect(page.getByRole("heading", { level: 1, name: "Admin Dashboard" })).toBeVisible();
  });
});
