// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require('next-transpile-modules')(['bot-engine'])

module.exports = withTM({
  reactStrictMode: true,
})
