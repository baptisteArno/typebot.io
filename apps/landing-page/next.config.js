// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
]

const pages = [
  'blog',
  'pricing',
  'privacy-policies',
  'terms-of-service',
  'vs-landbot',
  'vs-tally',
  'vs-typeform',
]

module.exports = withBundleAnalyzer({
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/typebot-lib',
        destination:
          'https://unpkg.com/typebot-js@2.0.21/dist/index.umd.min.js',
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
            process.env.NEXT_PUBLIC_VIEWER_HOST + '/_next/static/:static*',
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
          source: '/:user*',
          destination: process.env.NEXT_PUBLIC_VIEWER_HOST + '/:user*',
        },
      ],
    }
  },
})
