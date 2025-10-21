import { defineConfig, devices } from "@playwright/test";
import { resolve } from "path";

require("dotenv").config({ path: resolve(__dirname, "../../.env") });

export default defineConfig({
  timeout: 40 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  workers: 6,
  reporter: [["list"], ["html", { outputFolder: "src/test/reporters" }]],
  maxFailures: 10,
  outputDir: "./src/test/results",
  use: {
    trace: "on-first-retry",
    locale: "en-US",
    baseURL: process.env.NEXT_PUBLIC_VIEWER_URL?.split(",").at(-1),
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
        storageState: resolve(__dirname, "src/test/.auth/user.json"),
      },
      dependencies: ["setup db"],
    },
  ],
});
