import { expect, test, type Page } from "@playwright/test";

const publicRoutes: Array<{
  path: string;
  verify: (page: Page) => Promise<void>;
}> = [
  {
    path: "/",
    verify: async (page) => {
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("#home-hero")).toBeVisible();
    },
  },
  {
    path: "/about",
    verify: async (page) => {
      await expect(page.getByRole("heading", { level: 1, name: "ABOUT" })).toBeVisible();
    },
  },
  {
    path: "/privacy",
    verify: async (page) => {
      await expect(page.getByRole("heading", { level: 1, name: "PRIVACY" })).toBeVisible();
    },
  },
  {
    path: "/auth/login",
    verify: async (page) => {
      await expect(page.getByRole("heading", { level: 1, name: /Welcome\s+back/i })).toBeVisible();
      await expect(page.getByLabel("Email")).toBeVisible();
    },
  },
  {
    path: "/auth/signup",
    verify: async (page) => {
      await expect(page.getByRole("heading", { level: 1, name: /Create\s+account/i })).toBeVisible();
    },
  },
];

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/stash",
  "/footlab",
  "/matcher?tab=mate",
  "/settings?tab=account",
];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/auth/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "null",
    });
  });
});

test.describe("public routes", () => {
  for (const route of publicRoutes) {
    test(`${route.path} renders`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });

      expect(response).not.toBeNull();
      expect(response?.status()).toBeLessThan(400);
      await route.verify(page);
    });
  }
});

test.describe("signed-out access", () => {
  test("signup validates password confirmation", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.getByLabel("First name").fill("Test");
    await page.getByLabel("Last name").fill("Climber");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password-one");
    await page.getByLabel("Confirm password").fill("password-two");
    await page.getByRole("button", { name: "CREATE ACCOUNT" }).click();
    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  for (const protectedRoute of protectedRoutes) {
    test(`${protectedRoute} redirects to login with its callback`, async ({ page }) => {
      await page.goto(protectedRoute, { waitUntil: "domcontentloaded" });

      await expect(page).toHaveURL((url) => {
        return (
          url.pathname === "/auth/login" &&
          url.searchParams.get("callbackUrl") === protectedRoute
        );
      });
      await expect(page.getByRole("heading", { level: 1, name: /Welcome\s+back/i })).toBeVisible();
    });
  }
});
