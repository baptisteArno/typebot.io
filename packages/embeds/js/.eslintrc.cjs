module.exports = {
  root: true,
  extends: ['custom', 'plugin:solid/typescript'],
  plugins: ['solid'],
  rules: {
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'solid/no-innerhtml': 'off',
    'solid/reactivity': 'off',
  },
}
