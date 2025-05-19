import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/commands.ts"],
  minify: !options.watch,
  format: "esm",
  platform: "browser",
  dts: true,
}));
