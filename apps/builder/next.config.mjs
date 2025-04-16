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
  process.env.NEXT_PUBLIC_VIEWER_URL =
    `https://${process.env.VERCEL_BRANCH_URL}`.replace(
      process.env.VERCEL_BUILDER_PROJECT_NAME,
      process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME,
    );
  if (process.env.NEXT_PUBLIC_CHAT_API_URL?.includes("{{pr_id}}"))
    process.env.NEXT_PUBLIC_CHAT_API_URL =
      process.env.NEXT_PUBLIC_CHAT_API_URL.replace(
        "{{pr_id}}",
        process.env.VERCEL_GIT_PULL_REQUEST_ID,
      );
};

injectViewerUrlIfVercelPreview(process.env.NEXT_PUBLIC_VIEWER_URL);

configureRuntimeEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    // https://github.com/nextauthjs/next-auth/discussions/9385#discussioncomment-12023012
    "next-auth",
    "@typebot.io/billing",
    "@typebot.io/blocks-bubbles",
  ],
  reactStrictMode: true,
  output: "standalone",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr", "pt", "pt-BR", "de", "ro", "es", "it", "el"],
  },
  serverExternalPackages: ["isolated-vm"],
  outputFileTracingRoot: join(__dirname, "../../"),
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
  headers: async () => {
    return [
      {
        source: "/(.*)?",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return process.env.NEXT_PUBLIC_POSTHOG_KEY
      ? [
          {
            source: "/ingest/:path*",
            destination:
              (process.env.NEXT_PUBLIC_POSTHOG_HOST ??
                "https://app.posthog.com") + "/:path*",
          },
          {
            source: "/healthz",
            destination: "/api/health",
          },
        ]
      : [
          {
            source: "/healthz",
            destination: "/api/health",
          },
        ];
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
