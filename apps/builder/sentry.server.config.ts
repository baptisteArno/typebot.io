import * as Sentry from "@sentry/nextjs";
import type { TRPCError } from "@trpc/server";

const ignoreTrpcMessages = [
  "potential malicious typebot",
  "typebot not found",
  "workspace not found",
  "workspace with same name already exists",
  "no typebots found",
];

const crawlersToIgnore = ["Googlebot"];

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend: (event, hint) => {
    const exception = hint.originalException;
    const userAgent = event.contexts?.browser?.name;
    if (
      userAgent &&
      typeof userAgent === "string" &&
      crawlersToIgnore.some((crawler) => userAgent.includes(crawler))
    )
      return null;
    if (isTrpcError(exception)) {
      if (
        ignoreTrpcMessages.some((message) =>
          exception.message.toLowerCase().includes(message.toLowerCase()),
        )
      )
        return null;
      if (exception.cause?.name === "ClientToastError") return null;
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
      if (exception.code === "UNAUTHORIZED") return null;
    }
    return event;
  },
});

const isTrpcError = (err: unknown): err is TRPCError => {
  if (!err || typeof err !== "object") return false;
  return "name" in err && err.name === "TRPCError";
};
