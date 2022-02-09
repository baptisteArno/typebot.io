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
    return [
      {
        source: '/:path*',
        destination: `${process.env.VIEWER_HOST}/:path*`,
      },
    ]
  },
})
