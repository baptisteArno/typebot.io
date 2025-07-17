import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    exclude: ["**/*.spec.ts", "**/node_modules/**", "**/e2e/**"],
  },
});
