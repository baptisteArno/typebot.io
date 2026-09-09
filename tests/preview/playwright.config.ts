import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.browser.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: "../../test-results/preview-isolation",
  use: {
    browserName: "chromium",
    baseURL: "http://localhost:5198",
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: [
        "--host-resolver-rules=MAP *.typebot.test 127.0.0.1",
        "--no-proxy-server",
      ],
    },
  },
  webServer: {
    command: "bun tests/preview/server.ts",
    cwd: "../..",
    url: "http://127.0.0.1:5198",
    reuseExistingServer: false,
  },
});
