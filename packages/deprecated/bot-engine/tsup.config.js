import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  tsconfig: "tsconfig.build.json",
  entry: ["src/index.ts"],
  sourcemap: true,
  minify: !options.watch,
  format: "esm",
  loader: {
    ".css": "text",
  },
  dts: true,
}));
