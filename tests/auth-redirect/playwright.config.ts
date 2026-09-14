import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "*.browser.ts",
  workers: 1,
  reporter: "list",
  outputDir: "../../test-results/auth-redirect",
  use: { baseURL: "http://localhost:5298", browserName: "chromium" },
  webServer: {
    command: "bun tests/auth-redirect/serve.ts",
    cwd: "../..",
    url: "http://localhost:5298/typebots",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
