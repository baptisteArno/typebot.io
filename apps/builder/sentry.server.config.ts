import * as Sentry from "@sentry/nextjs";

const crawlersToIgnore = ["Googlebot"];

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend: (event) => {
    const userAgent = event.contexts?.browser?.name;
    if (
      userAgent &&
      typeof userAgent === "string" &&
      crawlersToIgnore.some((crawler) => userAgent.includes(crawler))
    )
      return null;
    return event;
  },
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  enableLogs: true,
});
