import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  transpilePackages: ["@typebot.io/lib"],
  pageExtensions: ["mdx", "ts", "tsx"],
  async redirects() {
    return [
      {
        source: "/typebot-lib",
        destination:
          "https://unpkg.com/typebot-js@2.0.21/dist/index.umd.min.js",
        permanent: true,
      },
      {
        source: "/typebot-lib/v2",
        destination: "https://unpkg.com/typebot-js@2.1.3/dist/index.umd.min.js",
        permanent: true,
      },
      {
        source: "/discord",
        destination: "https://discord.gg/xjyQczWAXV",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/healthz",
        destination: "/api/health",
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
