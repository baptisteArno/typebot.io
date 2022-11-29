const { withSentryConfig } = require('@sentry/nextjs')
const path = require('path')
const withTM = require('next-transpile-modules')([
  'utils',
  'models',
  'emails',
  'bot-engine',
])

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
}

module.exports = withTM(
  process.env.SENTRY_AUTH_TOKEN
    ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
    : nextConfig
)
