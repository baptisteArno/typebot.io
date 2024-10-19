import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  minify: !options.watch,
  format: "esm",
  platform: "browser",
  dts: true,
  external: process.env.CI ? undefined : ["@typebot.io/js"],
}));
