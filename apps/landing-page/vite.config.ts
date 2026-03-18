import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3003,
  },
  resolve: {
    alias: {
      $magicBackgrounds: "src/assets/magicBackgrounds",
      // https://github.com/prisma/prisma/issues/12504
      ".prisma/client/index-browser":
        "../../node_modules/.prisma/client/index-browser.js",
    },
  },
  plugins: [
    tailwindcss(),
    // Still using vite-tsconfig-paths because we want to point to tsconfig.app.json, `tsconfigPaths` doesn't support it.
    viteTsConfigPaths({
      projects: ["tsconfig.app.json"],
    }),
    contentCollections(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
});
