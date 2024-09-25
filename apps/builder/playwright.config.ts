import { resolve } from "path";
import { defineConfig, devices } from "@playwright/test";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({ path: resolve(__dirname, "../../.env") });

export default defineConfig({
  timeout: process.env.CI ? 50 * 1000 : 40 * 1000,
  expect: {
    timeout: process.env.CI ? 10 * 1000 : 5 * 1000,
  },
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : 4,
  retries: process.env.CI ? 2 : 1,
  reporter: [
    [process.env.CI ? "github" : "list"],
    ["html", { outputFolder: "src/test/reporters" }],
  ],
  maxFailures: 10,
  webServer: process.env.CI
    ? {
        command: "bun start",
        timeout: 60_000,
        reuseExistingServer: true,
        port: 3000,
      }
    : undefined,
  outputDir: "./src/test/results",
  use: {
    trace: "on-first-retry",
    locale: "en-US",
    baseURL: process.env.NEXTAUTH_URL,
    storageState: "./src/test/storageState.json",
    permissions: ["microphone"],
    launchOptions: {
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
      ],
    },
  },
  projects: [
    {
      name: "setup db",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1400, height: 1000 },
      },
      dependencies: ["setup db"],
    },
  ],
});
