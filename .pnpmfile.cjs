module.exports = {
  hooks: {
    readPackage(pkg) {
      // Solving weird issue: https://github.com/facebook/docusaurus/issues/6724#issuecomment-1188794031
      if (pkg.name != 'docs') {
        const deps = [
          '@algolia/client-search',
          '@docusaurus/core',
          '@docusaurus/preset-classic',
          '@docusaurus/theme-common',
          '@docusaurus/theme-live-codeblock',
        ]
        deps.forEach((p) => delete pkg.dependencies[p])
      }
      return pkg
    },
  },
}
