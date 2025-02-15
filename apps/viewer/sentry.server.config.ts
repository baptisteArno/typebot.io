import * as Sentry from "@sentry/nextjs";
import type { TRPCError } from "@trpc/server";

const ignoreTrpcMessages = [
  "bot is now closed",
  "not found",
  "timeout reached",
  "Missing startParams",
  "need to be authenticated to perform this action",
];

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1,
  beforeSend: (event, hint) => {
    const exception = hint.originalException;
    if (isTrpcError(exception)) {
      if (
        ignoreTrpcMessages.some((message) =>
          exception.message.toLowerCase().includes(message.toLowerCase()),
        )
      )
        return null;
    }
    return event;
  },
});

const isTrpcError = (err: unknown): err is TRPCError => {
  if (!err || typeof err !== "object") return false;
  return "name" in err && err.name === "TRPCError";
};
