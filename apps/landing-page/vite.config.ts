import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import contentCollections from "./content-collection-vite-plugin";

const configDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      $magicBackgrounds: resolve(
        configDirectory,
        "src/assets/magicBackgrounds",
      ),
      // https://github.com/prisma/prisma/issues/12504
      ".prisma/client/index-browser":
        "../../node_modules/.prisma/client/index-browser.js",
    },
  },
  plugins: [
    tailwindcss(),
    viteTsConfigPaths(),
    contentCollections({
      configPath: resolve(configDirectory, "content-collections.ts"),
    }),
    tanstackStart({
      target: "vercel",
    }),
  ],
});
