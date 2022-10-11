// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs')
const { i18n } = require('./next-i18next.config')

const moduleExports = {
  experimental: {
    outputStandalone: true,
  },
  i18n,
  optimizeFonts: false,
  assetPrefix: process.env.BASE_PATH,
  rewrites() {
    return {
      beforeFiles: [
        { source: `${process.env.BASE_PATH || ''}/_next/:path*`, destination: '/_next/:path*' },
        { source: `${process.env.BASE_PATH || ''}/typebots/:path*`, destination: '/typebots/:path*' },
      ],
      fallback: [
        {
          source: '/api/:path*',
          destination: `${process.env.BASE_PATH || ''}/api/:path*`,
        },
      ],
    }
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
}

const sentryWebpackPluginOptions = {
  silent: true,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

module.exports = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(moduleExports, sentryWebpackPluginOptions)
  : moduleExports
