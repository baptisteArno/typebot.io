const { withSentryConfig } = require('@sentry/nextjs')
const path = require('path')
const withTM = require('next-transpile-modules')([
  'utils',
  'models',
  'emails',
  'bot-engine',
])

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, '@prisma/client']
    }

    return config
  },
})

const sentryWebpackPluginOptions = {
  silent: true,
}

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(
      {
        ...nextConfig,
        sentry: {
          hideSourceMaps: true,
        },
      },
      sentryWebpackPluginOptions
    )
  : nextConfig
