import { withSentryConfig } from '@sentry/nextjs'
import { join, dirname } from 'path'
import '@typebot.io/env/dist/env.mjs'
import { fileURLToPath } from 'url'
import { configureRuntimeEnv } from 'next-runtime-env/build/configure.js'

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const injectViewerUrlIfVercelPreview = (val) => {
  if (
    (val && typeof val === 'string' && val.length > 0) ||
    process.env.VERCEL_ENV !== 'preview' ||
    !process.env.VERCEL_BUILDER_PROJECT_NAME ||
    !process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME
  )
    return
  process.env.NEXT_PUBLIC_VIEWER_URL = `https://${process.env.VERCEL_BRANCH_URL}`
}

injectViewerUrlIfVercelPreview(process.env.NEXT_PUBLIC_VIEWER_URL)

configureRuntimeEnv()

const landingPagePaths = [
  '/',
  '/pricing',
  '/privacy-policies',
  '/terms-of-service',
  '/about',
  '/oss-friends',
]

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
    outputFileTracingRoot: join(__dirname, '../../'),
  },
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === 'nodejs') return config

    if (nextRuntime === 'edge') {
      config.resolve.alias['minio'] = false
      config.resolve.alias['got'] = false
      config.resolve.alias['qrcode'] = false
      return config
    }
    // These packages are imports from the integrations definition files that can be ignored for the client.
    config.resolve.alias['minio'] = false
    config.resolve.alias['got'] = false
    config.resolve.alias['openai'] = false
    config.resolve.alias['qrcode'] = false
    return config
  },
  async redirects() {
    return [
      {
        source: '/discord',
        destination: 'https://discord.gg/xjyQczWAXV',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: (process.env.LANDING_PAGE_URL
        ? landingPagePaths
            .map((path) => ({
              source: '/_next/static/:static*',
              destination: `${process.env.LANDING_PAGE_URL}/_next/static/:static*`,
              has: [
                {
                  type: 'header',
                  key: 'referer',
                  value: `https://typebot.io${path}`,
                },
              ],
            }))
            .concat(
              landingPagePaths.map((path) => ({
                source: '/typebots/:typebot*',
                destination: `${process.env.LANDING_PAGE_URL}/typebots/:typebot*`,
                has: [
                  {
                    type: 'header',
                    key: 'referer',
                    value: `https://typebot.io${path}`,
                  },
                ],
              }))
            )
            .concat(
              landingPagePaths.map((path) => ({
                source: '/styles/:style*',
                destination: `${process.env.LANDING_PAGE_URL}/styles/:style*`,
                has: [
                  {
                    type: 'header',
                    key: 'referer',
                    value: `https://typebot.io${path}`,
                  },
                ],
              }))
            )
            .concat(
              landingPagePaths.map((path) => ({
                source: path,
                destination: `${process.env.LANDING_PAGE_URL}${path}`,
                has: [
                  {
                    type: 'host',
                    value: 'typebot.io',
                  },
                ],
              }))
            )
        : []
      )
        .concat([
          {
            source:
              '/api/typebots/:typebotId/blocks/:blockId/storage/upload-url',
            destination:
              '/api/v1/typebots/:typebotId/blocks/:blockId/storage/upload-url',
          },
        ])
        .concat(
          process.env.NEXTAUTH_URL
            ? [
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/steps/:stepId/sampleResult',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/getResultExample`,
                },
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/sampleResult',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/getResultExample`,
                },
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/steps/:stepId/unsubscribeWebhook',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/unsubscribe`,
                },
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/unsubscribeWebhook',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/unsubscribe`,
                },
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/steps/:stepId/subscribeWebhook',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/subscribe`,
                },
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/subscribeWebhook',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/subscribe`,
                },
              ]
            : []
        ),
    }
  },
}

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(
      nextConfig,
      {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Suppresses source map uploading logs during build
        silent: true,
        release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA + '-viewer',
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
      {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
        tunnelRoute: '/monitoring',

        // Hides source maps from generated client bundles
        hideSourceMaps: true,

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,
      }
    )
  : nextConfig
