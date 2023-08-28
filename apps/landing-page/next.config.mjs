import { configureRuntimeEnv } from 'next-runtime-env/build/configure.js'

configureRuntimeEnv()

/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

export default nextConfig
