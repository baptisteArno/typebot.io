import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  tsconfig: "tsconfig.build.json",
  entry: ["src/index.ts"],
  minify: !options.watch,
  format: "esm",
  platform: "browser",
  dts: true,
}));
