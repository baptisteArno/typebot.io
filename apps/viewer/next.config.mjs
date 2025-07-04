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
  "/privacy-policy",
  "/terms-of-service",
  "/about",
  "/oss-friends",
  "/business-continuity",
  "/blog",
  "/blog/:slug*",
];

const currentHost = "typebot.io";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@typebot.io/settings"],
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: join(__dirname, "../../"),
  serverExternalPackages: ["isolated-vm"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // TODO: Remove once https://github.com/getsentry/sentry-javascript/issues/8105 is merged and sentry is upgraded
      config.ignoreWarnings = [
        {
          message:
            /require function is used in a way in which dependencies cannot be statically extracted/,
        },
      ];
      return config;
    }

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
        ? [
            {
              source: "/assets/:asset*",
              destination: `${process.env.LANDING_PAGE_URL}/assets/:asset*`,
            },
            {
              source: "/blog-assets/:asset*",
              destination: `${process.env.LANDING_PAGE_URL}/blog-assets/:asset*`,
            },
            {
              source: "/_serverFn/:server*",
              destination: `${process.env.LANDING_PAGE_URL}/_serverFn/:server*`,
            },
            {
              source: "/fonts/:font*",
              destination: `${process.env.LANDING_PAGE_URL}/fonts/:font*`,
            },
            {
              source: "/images/:image*",
              destination: `${process.env.LANDING_PAGE_URL}/images/:image*`,
            },
          ].concat(
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

export default process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      widenClientFileUpload: true,
    })
  : nextConfig;
