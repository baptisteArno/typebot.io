/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const pages = ['pricing', 'privacy-policies', 'terms-of-service', 'about']

module.exports = withBundleAnalyzer({
  transpilePackages: ['utils', 'models'],
  async redirects() {
    return [
      {
        source: '/typebot-lib',
        destination:
          'https://unpkg.com/typebot-js@2.0.21/dist/index.umd.min.js',
        permanent: true,
      },
      {
        source: '/typebot-lib/v2',
        destination: 'https://unpkg.com/typebot-js@2.1.3/dist/index.umd.min.js',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/_next/static/:static*',
          destination:
            process.env.NEXT_PUBLIC_VIEWER_URL + '/_next/static/:static*',
          has: [
            {
              type: 'header',
              key: 'referer',
              value:
                process.env.LANDING_PAGE_HOST +
                '/(?!' +
                pages.join('|') +
                '|\\?).+',
            },
          ],
        },
      ],
      fallback: [
        {
          source: '/:typebotId*',
          destination: process.env.NEXT_PUBLIC_VIEWER_URL + '/:typebotId*',
        },
        {
          source: '/api/:path*',
          destination: process.env.NEXT_PUBLIC_VIEWER_URL + '/api/:path*',
        },
      ],
    }
  },
})
