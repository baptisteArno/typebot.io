const { solidPlugin } = require('esbuild-plugin-solid');
const { version } = require('./package.json');

/** @type {import('esbuild').BuildOptions} */
module.exports = {
  loader: {
    '.css': 'text',
  },
  banner: {
    js: `// v${version}`,
  },
  plugins: [solidPlugin()],
};
