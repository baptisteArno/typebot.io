import { defineConfig } from "vitest/config";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/whatsapp",
  test: {
    name: "@typebot.io/whatsapp",
    watch: false,
    globals: true,
    environment: "node",
    include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
  },
}));
