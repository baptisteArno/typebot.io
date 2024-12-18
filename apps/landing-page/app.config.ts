import { resolve } from "path";
import { defineConfig } from "@tanstack/start/config";
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
  tsr: {
    appDirectory: "./src/app",
  },
  routers: {
    public: {
      dir: "./src/public",
    },
  },
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
        $fonts: resolve("./src/assets/fonts"),
        $magicBackgrounds: resolve("./src/assets/magicBackgrounds"),
      },
    },
    plugins: [
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
});
