import { resolve } from "path";
import contentCollections from "@content-collections/vinxi";
import { defineConfig } from "@tanstack/start/config";
// import { visualizer } from "rollup-plugin-visualizer";
import viteTsConfigPaths from "vite-tsconfig-paths";

const legacyRedirects = {
  "/typebot-lib": {
    redirect: {
      to: "https://unpkg.com/typebot-js@2.0.21/dist/index.umd.min.js",
      statusCode: 301,
    },
  },
  "/typebot-lib/v2": {
    redirect: {
      to: "https://unpkg.com/typebot-js@2.1.3/dist/index.umd.min.js",
      statusCode: 301,
    },
  },
} as const;

export default defineConfig({
  server: {
    preset: "vercel",
    routeRules: {
      ...legacyRedirects,
      "/healthz": { proxy: { to: "/api/healthz" } },
    },
  },
  vite: {
    resolve: {
      alias: {
        $magicBackgrounds: resolve("./app/assets/magicBackgrounds"),
        // https://github.com/prisma/prisma/issues/12504
        ".prisma/client/index-browser":
          "../../node_modules/.prisma/client/index-browser.js",
      },
    },
    plugins: [
      viteTsConfigPaths(),
      contentCollections(),
      // visualizer({
      //   open: true,
      //   gzipSize: true,
      // }),
    ],
  },
});
