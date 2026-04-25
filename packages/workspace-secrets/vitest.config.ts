import { defineProject } from "vitest/config";

export default defineProject(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/workspace-secrets",
  test: {
    name: "@typebot.io/workspace-secrets",
    watch: false,
    globals: true,
    environment: "node",
    include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
  },
}));
