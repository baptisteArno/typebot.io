import { solidPlugin } from "esbuild-plugin-solid";
import { defineConfig } from "tsup";
import { version } from "./package.json";

export default defineConfig((options) => [
  {
    tsconfig: "tsconfig.build.json",
    entry: ["src/index.ts"],
    minify: !options.watch,
    format: "esm",
    platform: "browser",
    dts: true,
  },
  {
    tsconfig: "tsconfig.build.json",
    entry: ["src/web.ts"],
    minify: !options.watch,
    format: "esm",
    platform: "browser",
    loader: {
      ".css": "text",
    },
    banner: {
      js: `// v${version}`,
    },
    esbuildPlugins: [solidPlugin()],
  },
]);
