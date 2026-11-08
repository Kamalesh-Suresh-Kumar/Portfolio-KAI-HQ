import { defineConfig, devices } from "@playwright/test";

/**
 * KAI HQ — Playwright End-to-End Testing Configuration (Phase 6.3.3)
 *
 * Configures deterministic E2E test execution against a local Vite preview server,
 * validating all eight facility rooms, production base paths, keyboard interaction,
 * and zero-JS static fallback compliance.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests sequentially for deterministic stability in resource-constrained environments */
  fullyParallel: false,
  workers: 1,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry once on CI if needed, 0 locally for fast deterministic feedback */
  retries: process.env.CI ? 1 : 0,
  /* Maximum time one test can run for */
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  /* Reporter to use */
  reporter: [["list"]],
  /* Shared settings for all projects */
  use: {
    baseURL: "http://127.0.0.1:4173",
    /* Collect trace and screenshot when a test fails */
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      },
    },
  ],

  /* Run local dev/preview server before starting the tests */
  webServer: {
    command: "bun x vite preview --port 4173 --host 127.0.0.1",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 15000,
  },
});
