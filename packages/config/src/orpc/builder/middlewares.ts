import { oo } from "@orpc/openapi";
import { os as baseOs, ORPCError } from "@orpc/server";
import * as Sentry from "@sentry/nextjs";
import { env } from "@typebot.io/env";
import type { Context } from "./context";

export const os = baseOs.$context<Context>();

const webhookUrlPaths = [
  "builderWhatsAppRouter/previewWebhookProcedure",
  "builderWhatsAppRouter/subscribePreviewWebhook",
  "emailRouter/resendWebhook",
];

const sentryMiddleware = os.middleware(async ({ next, path }) => {
  try {
    return await next();
  } catch (error) {
    if (env.NODE_ENV !== "production") console.error(error);
    if (isUnknownError(error, path.join("/"))) {
      if (error instanceof ORPCError && error.code?.includes("BAD_REQUEST")) {
        Sentry.addBreadcrumb({
          data: {
            orpcErrorData: JSON.stringify(error.data),
          },
        });
      }
      Sentry.captureException(error);
    }
    throw error;
  }
});

const isUnknownError = (error: unknown, path: string) => {
  if (
    error instanceof ORPCError &&
    !error.code?.includes("INTERNAL_SERVER_ERROR") &&
    !webhookUrlPaths.includes(path)
  ) {
    return false;
  }
  return true;
};

const requireAuth = oo.spec(
  os.middleware(async ({ next, context }) => {
    const user = await context.authenticate();
    if (user) {
      return next({
        context: {
          ...context,
          user,
        },
      });
    }
    throw new ORPCError("UNAUTHORIZED", {
      message: "You must be logged in to access this resource",
    });
  }),
  {
    security: [{ bearerAuth: [] }],
  },
);

const needsOptionalAuthenticatedUser = os.middleware(
  async ({ next, context }) => {
    const user = await context.authenticate();
    return next({
      context: {
        ...context,
        user,
      },
    });
  },
);

export const publicProcedure = os.use(sentryMiddleware);

export const publicProcedureWithOptionalUser = publicProcedure.use(
  needsOptionalAuthenticatedUser,
);

export const authenticatedProcedure = publicProcedure.use(requireAuth);
