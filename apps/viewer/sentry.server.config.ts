import * as Sentry from "@sentry/nextjs";
import type { TRPCError } from "@trpc/server";

const ignoreTrpcMessages = [
  "bot is now closed",
  "not found",
  "timeout reached",
];

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend: (event, hint) => {
    const exception = hint.originalException;
    if (isTrpcError(exception)) {
      if (ignoreTrpcMessages.includes(exception.message.toLowerCase()))
        return null;
    }
    return event;
  },
});

const isTrpcError = (err: unknown): err is TRPCError => {
  if (!err || typeof err !== "object") return false;
  return "name" in err && err.name === "TRPCError";
};
