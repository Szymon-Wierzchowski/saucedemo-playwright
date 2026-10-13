import { defineConfig, devices } from "@playwright/test";

export const STORAGE_STATE = "playwright/.auth/standard_user.json";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // a stray test.only must not silently skip the rest of the suite in CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["list"], ["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "https://www.saucedemo.com",
    testIdAttribute: "data-test", // the app uses data-test, not Playwright's default data-testid
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // Logs in once and saves the session, so the other tests start already authenticated.
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
    },
    {
      // The critical path only, on a phone-sized screen.
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      grep: /@smoke/,
    },
  ],
});
