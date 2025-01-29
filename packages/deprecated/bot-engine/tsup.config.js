import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  sourcemap: true,
  minify: !options.watch,
  format: "esm",
  loader: {
    ".css": "text",
  },
  dts: true,
}));
