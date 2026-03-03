import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    globalSetup: resolve(__dirname, "../config/src/tests/globalSetup.ts"),
  },
});
