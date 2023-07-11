/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

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
})
