import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { resolve } from "path";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import contentCollections from "./content-collection-vite-plugin";

export default defineConfig({
  resolve: {
    alias: {
      $magicBackgrounds: resolve("./src/assets/magicBackgrounds"),
      // https://github.com/prisma/prisma/issues/12504
      ".prisma/client/index-browser":
        "../../node_modules/.prisma/client/index-browser.js",
    },
  },
  plugins: [
    tailwindcss(),
    viteTsConfigPaths(),
    contentCollections(),
    tanstackStart({
      target: "vercel",
    }),
  ],
});
