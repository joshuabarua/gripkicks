import { defineConfig, devices } from "@playwright/test";

const localBaseUrl = "http://localhost:3000";
const externalBaseUrl = process.env["E2E_BASE_URL"]?.replace(/\/+$/, "");
const baseURL = externalBaseUrl || localBaseUrl;
const isCI = Boolean(process.env["CI"]);

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI ? { workers: 2 } : {}),
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL,
    ...(process.env["E2E_CHANNEL"] ? { channel: process.env["E2E_CHANNEL"] } : {}),
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: "yarn start",
          url: localBaseUrl,
          reuseExistingServer: !isCI,
          timeout: 120_000,
        },
      }),
});
