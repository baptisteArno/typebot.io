import * as Sentry from "@sentry/nextjs";
import type { TRPCError } from "@trpc/server";

const ignoreTrpcMessages = [
  "potential malicious typebot",
  "typebot not found",
  "workspace not found",
];

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend: (event, hint) => {
    const exception = hint.originalException;
    if (isTrpcError(exception)) {
      if (
        ignoreTrpcMessages.some((message) =>
          exception.message.toLowerCase().includes(message),
        )
      )
        return null;
      if (
        exception.code === "BAD_REQUEST" &&
        exception.cause?.name === "ZodError" &&
        event.contexts?.trpc?.procedure_path === "typebot.importTypebot"
      )
        return null;
      if (
        exception.code === "CONFLICT" &&
        event.contexts?.trpc?.procedure_path === "typebot.updateTypebot"
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
