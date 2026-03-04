import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/campaigns",
  test: {
    name: "@typebot.io/campaigns",
    watch: false,
    globals: true,
    globalSetup: fileURLToPath(
      new URL("../config/src/tests/globalSetup.ts", import.meta.url),
    ),
    environment: "node",
    include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
  },
}));
