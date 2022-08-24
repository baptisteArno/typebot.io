// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs')
const { i18n } = require('./next-i18next.config')

const moduleExports = {
  experimental: {
    outputStandalone: true,
  },
  i18n,
  optimizeFonts: false,
  assetPrefix: "/embed/builder"
}

const sentryWebpackPluginOptions = {
  silent: true,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

module.exports = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(moduleExports, sentryWebpackPluginOptions)
  : moduleExports
