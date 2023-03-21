const { withSentryConfig } = require('@sentry/nextjs')
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@typebot.io/lib',
    '@typebot.io/schemas',
    '@typebot.io/emails',
  ],
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  async rewrites() {
    return [
      {
        source: '/api/typebots/:typebotId/blocks/:blockId/storage/upload-url',
        destination:
          '/api/v1/typebots/:typebotId/blocks/:blockId/storage/upload-url',
      },
    ]
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA + '-viewer',
}

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(
      {
        ...nextConfig,
        sentry: {
          hideSourceMaps: true,
          widenClientFileUpload: true,
        },
      },
      sentryWebpackPluginOptions
    )
  : nextConfig
