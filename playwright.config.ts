import { chromium, defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
   timeout: 30 * 1000,

  expect: {
    timeout: 30 * 10000,
  },
  reporter: "html",
  use: {
    browserName: "webkit",
    headless: false,
  },
  /* Configure projects for major browsers */
});
