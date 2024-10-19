import { defineConfig } from "tsup";

export default defineConfig(() => ({
  entry: ["src/index.ts"],
  format: "esm",
  platform: "browser",
  dts: true,
  clean: true,
  banner: {
    js: '"use client"',
  },
  external: process.env.CI ? undefined : ["@typebot.io/js"],
}));
