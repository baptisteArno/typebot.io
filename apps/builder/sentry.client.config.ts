import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications.",
    "ResizeObserver is not defined",
    "Can't find variable: ResizeObserver",
  ],
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA + "-builder",
});
