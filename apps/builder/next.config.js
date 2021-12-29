// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require('next-transpile-modules')(['utils'])

module.exports = withTM({
  reactStrictMode: true,
})
