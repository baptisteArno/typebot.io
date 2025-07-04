import path from "node:path";
import { type Builder, createBuilder } from "@content-collections/core";
import { configureLogging } from "@content-collections/integrations";
import type { Plugin, UserConfig } from "vite";

export type Options = {
  configPath: string;
  isEnabled?: (config: UserConfig) => boolean;
};

const defaultOptions = {
  configPath: "content-collections.ts",
};

function resolveConfigPath(root: string, configPath: string) {
  if (!path.isAbsolute(configPath)) {
    configPath = path.resolve(root, configPath);
  }
  return configPath;
}

export default function contentCollectionsPlugin(
  options: Partial<Options> = {},
): Plugin {
  const pluginOptions = { ...defaultOptions, ...options };

  let builder: Builder;

  function isEnabled(config: UserConfig) {
    return options.isEnabled ? options.isEnabled(config) : true;
  }

  return {
    name: "content-collections",

    config(config) {
      // even if the plugin is disabled, we need to configure the alias
      // vite is often executed multiple time and the plugin should only
      // run once, but the aliases must be available for all runs

      const configPath = resolveConfigPath(
        config.root || process.cwd(),
        pluginOptions.configPath,
      );

      const directory = path.resolve(
        path.dirname(configPath),
        "./.content-collections/generated",
      );

      const configPatch: Partial<UserConfig> = {
        optimizeDeps: {
          exclude: ["content-collections"],
        },
        resolve: {
          alias: {
            "content-collections": directory,
          },
        },
      };

      if ((config.server?.fs?.allow || []).length > 0) {
        // required for Svelte Kit
        configPatch.server = {
          fs: {
            allow: [directory],
          },
        };
      }

      return configPatch;
    },

    async configResolved(config: any) {
      if (!isEnabled(config)) {
        return;
      }
      const configPath = resolveConfigPath(
        config.root,
        pluginOptions.configPath,
      );
      console.log(
        "Starting content-collections with config",
        path.relative(process.cwd(), configPath),
      );

      builder = await createBuilder(configPath);
      configureLogging(builder);

      return;
    },

    async buildStart() {
      if (!builder) {
        return;
      }
      console.log("Start initial build");
      await builder.build();
      return;
    },

    async configureServer() {
      if (!builder) {
        return;
      }
      console.log("Start watching");
      builder.watch();
      return;
    },
  };
}
