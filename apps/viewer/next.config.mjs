import { withSentryConfig } from '@sentry/nextjs'
import { join, dirname } from 'path'
import '@typebot.io/env/dist/env.mjs'
import { fileURLToPath } from 'url'
import { configureRuntimeEnv } from 'next-runtime-env/build/configure.js'

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

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

const sentryWebpackPluginOptions = {
  silent: true,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA + '-viewer',
}

export default process.env.NEXT_PUBLIC_SENTRY_DSN
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
