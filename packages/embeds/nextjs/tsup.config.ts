import { defineConfig } from "tsup";

export default defineConfig(() => ({
  tsconfig: "tsconfig.build.json",
  entry: ["src/index.ts"],
  format: "esm",
  platform: "browser",
  dts: true,
  clean: true,
  banner: {
    js: '"use client"',
  },
}));
