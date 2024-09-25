import { dirname, join } from "path";
import { withSentryConfig } from "@sentry/nextjs";
import "@typebot.io/env/compiled";
import { fileURLToPath } from "url";
import { configureRuntimeEnv } from "next-runtime-env/build/configure.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const injectViewerUrlIfVercelPreview = (val) => {
  if (
    (val && typeof val === "string" && val.length > 0) ||
    process.env.VERCEL_ENV !== "preview" ||
    !process.env.VERCEL_BUILDER_PROJECT_NAME ||
    !process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME
  )
    return;
  process.env.NEXT_PUBLIC_VIEWER_URL = `https://${process.env.VERCEL_BRANCH_URL}`;
  if (process.env.NEXT_PUBLIC_CHAT_API_URL?.includes("{{pr_id}}"))
    process.env.NEXT_PUBLIC_CHAT_API_URL =
      process.env.NEXT_PUBLIC_CHAT_API_URL.replace(
        "{{pr_id}}",
        process.env.VERCEL_GIT_PULL_REQUEST_ID,
      );
};

injectViewerUrlIfVercelPreview(process.env.NEXT_PUBLIC_VIEWER_URL);

configureRuntimeEnv();

const landingPagePaths = [
  "/",
  "/pricing",
  "/privacy-policies",
  "/terms-of-service",
  "/about",
  "/oss-friends",
  "/blog",
  "/blog/:slug*",
];

const landingPageReferers = [
  "/",
  "/pricing",
  "/privacy-policies",
  "/terms-of-service",
  "/about",
  "/oss-friends",
  "/blog",
].concat(["/blog/(.+)"]);

const currentHost = "typebot.io";
const currentOrigin = `https://${currentHost}`;
const optionalQueryParams = `(\\/?\\?.*)?`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@typebot.io/settings"],
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    outputFileTracingRoot: join(__dirname, "../../"),
    serverComponentsExternalPackages: ["isolated-vm"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) return config;

    config.resolve.alias["minio"] = false;
    config.resolve.alias["qrcode"] = false;
    config.resolve.alias["isolated-vm"] = false;
    return config;
  },
  async redirects() {
    return [
      {
        source: "/discord",
        destination: "https://discord.gg/xjyQczWAXV",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: (process.env.LANDING_PAGE_URL
        ? landingPageReferers
            .map((path) => ({
              source: "/_next/static/:static*",
              has: [
                {
                  type: "header",
                  key: "referer",
                  value: `${currentOrigin}${path}${optionalQueryParams}`,
                },
              ],
              destination: `${process.env.LANDING_PAGE_URL}/_next/static/:static*`,
            }))
            .concat(
              landingPageReferers.map((path) => ({
                source: "/typebots/:typebot*",
                has: [
                  {
                    type: "header",
                    key: "referer",
                    value: `${currentOrigin}${path}${optionalQueryParams}`,
                  },
                ],
                destination: `${process.env.LANDING_PAGE_URL}/typebots/:typebot*`,
              })),
            )
            .concat(
              landingPageReferers.map((path) => ({
                source: "/styles/:style*",
                has: [
                  {
                    type: "header",
                    key: "referer",
                    value: `${currentOrigin}${path}${optionalQueryParams}`,
                  },
                ],
                destination: `${process.env.LANDING_PAGE_URL}/styles/:style*`,
              })),
            )
            .concat(
              landingPagePaths.map((path) => ({
                source: path,
                has: [
                  {
                    type: "host",
                    value: currentHost,
                  },
                ],
                destination: `${process.env.LANDING_PAGE_URL}${path}`,
              })),
            )
            .concat(
              landingPageReferers.map((path) => ({
                source: "/images/:image*",
                has: [
                  {
                    type: "header",
                    key: "referer",
                    value: `${currentOrigin}${path}${optionalQueryParams}`,
                  },
                ],
                destination: `${process.env.LANDING_PAGE_URL}/images/:image*`,
              })),
            )
        : []
      )
        .concat([
          {
            source:
              "/api/typebots/:typebotId/blocks/:blockId/storage/upload-url",
            destination:
              "/api/v1/typebots/:typebotId/blocks/:blockId/storage/upload-url",
          },
          {
            source: "/healthz",
            destination: "/api/health",
          },
        ])
        .concat(
          process.env.NEXTAUTH_URL
            ? [
                {
                  source:
                    "/api/typebots/:typebotId/blocks/:blockId/steps/:stepId/sampleResult",
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/getResultExample`,
                },
                {
                  source:
                    "/api/typebots/:typebotId/blocks/:blockId/sampleResult",
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/getResultExample`,
                },
                {
                  source:
                    "/api/typebots/:typebotId/blocks/:blockId/steps/:stepId/unsubscribeWebhook",
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/unsubscribe`,
                },
                {
                  source:
                    "/api/typebots/:typebotId/blocks/:blockId/unsubscribeWebhook",
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/unsubscribe`,
                },
                {
                  source:
                    "/api/typebots/:typebotId/blocks/:blockId/steps/:stepId/subscribeWebhook",
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/subscribe`,
                },
                {
                  source:
                    "/api/typebots/:typebotId/blocks/:blockId/subscribeWebhook",
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/subscribe`,
                },
              ]
            : [],
        ),
    };
  },
};

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(
      nextConfig,
      {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Suppresses source map uploading logs during build
        silent: true,
        release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA + "-viewer",
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
      {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
        tunnelRoute: "/monitoring",

        // Hides source maps from generated client bundles
        hideSourceMaps: true,

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,
      },
    )
  : nextConfig;
