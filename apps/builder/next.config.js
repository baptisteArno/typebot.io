// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs')

const moduleExports = {
  experimental: {
    outputStandalone: true,
  },
  optimizeFonts: false,
  publicRuntimeConfig: {
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    NEXT_PUBLIC_GIPHY_API_KEY: process.env.NEXT_PUBLIC_GIPHY_API_KEY,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

module.exports = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(moduleExports, sentryWebpackPluginOptions)
  : moduleExports
