import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/web.ts"],
  minify: !options.watch,
  format: "esm",
  platform: "browser",
  dts: true,
  noExternal: options.watch ? undefined : ["@typebot.io/js"],
}));
