const fs = require("node:fs/promises");
const postcss = require("postcss");
const tailwindcss = require("@tailwindcss/postcss");
const { solidPlugin } = require("esbuild-plugin-solid");
const { version } = require("./package.json");

const tailwindCssTextPlugin = {
  name: "tailwind-css-text",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await fs.readFile(args.path, "utf8");
      const { css: transformedCss } = await postcss([tailwindcss()]).process(
        css,
        {
          from: args.path,
        },
      );

      return {
        contents: transformedCss,
        loader: "text",
      };
    });
  },
};

/** @type {import('esbuild').BuildOptions} */
module.exports = {
  banner: {
    js: `// v${version}`,
  },
  plugins: [tailwindCssTextPlugin, solidPlugin()],
};
