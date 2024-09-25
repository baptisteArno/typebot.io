import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: "esm",
  platform: "browser",
  dts: true,
  clean: true,
}));
