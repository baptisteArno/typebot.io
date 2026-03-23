import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    projects: ["packages/**/vitest.config.{ts,mts}"],
    globalSetup: ["./packages/config/src/tests/globalSetup.ts"],
  },
});
