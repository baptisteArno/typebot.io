import { oo } from "@orpc/openapi";
import { os as baseOs, ORPCError } from "@orpc/server";
import * as Sentry from "@sentry/nextjs";
import type { Context } from "./context";

export const os = baseOs.$context<Context>().errors({
  BAD_REQUEST: {},
  UNAUTHORIZED: {},
  FORBIDDEN: {},
  NOT_FOUND: {},
  INTERNAL_SERVER_ERROR: {},
});

const webhookUrlPaths = [
  "chatWhatsAppRouter/productionWebhookProcedure",
  "chatWhatsAppRouter/subscribeWebhookProcedure",
  "billingRouter/webhook",
];

const expectedWhatsAppWebhookValidationErrors = [
  {
    code: "UNAUTHORIZED",
    message: "Invalid WhatsApp webhook secret",
  },
  {
    code: "UNAUTHORIZED",
    message: "Invalid WhatsApp webhook signature",
  },
  {
    code: "BAD_REQUEST",
    message: "Invalid WhatsApp webhook payload",
  },
];

const sentryMiddleware = os.middleware(async ({ next, path }) => {
  try {
    return await next();
  } catch (error) {
    console.error(error);
    if (isUnknownError(error, path.join("/"))) {
      if (error instanceof ORPCError) {
        console.log(JSON.stringify(error.cause));
      }
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
  if (isExpectedWhatsAppWebhookValidationError(error, path)) return false;

  if (
    error instanceof ORPCError &&
    !error.code?.includes("INTERNAL_SERVER_ERROR") &&
    !webhookUrlPaths.includes(path)
  ) {
    return false;
  }
  return true;
};

const isExpectedWhatsAppWebhookValidationError = (
  error: unknown,
  path: string,
) =>
  path === "chatWhatsAppRouter/productionWebhookProcedure" &&
  error instanceof ORPCError &&
  expectedWhatsAppWebhookValidationErrors.some(
    (expectedError) =>
      error.code === expectedError.code &&
      error.message === expectedError.message,
  );

const requireAuth = oo.spec(
  os.middleware(async ({ next, context }) => {
    const user = await context.authenticate();
    if (user) {
      Sentry.setUser({ id: user.id });
      return next({
        context: {
          ...context,
          user,
        },
      });
    }
    throw new ORPCError("UNAUTHORIZED", {
      message: "You must be authenticated to access this resource",
    });
  }),
  {
    security: [{ Authorization: [] }],
  },
);

const needsOptionalAuthenticatedUser = os.middleware(
  async ({ next, context }) => {
    const user = await context.authenticate();
    if (user) {
      Sentry.setUser({ id: user.id });
    }
    return next({
      context: {
        ...context,
        user,
      },
    });
  },
);

export const publicProcedure = os.use(sentryMiddleware);

export const procedureWithOptionalUser = publicProcedure.use(
  needsOptionalAuthenticatedUser,
);

export const protectedProcedure = publicProcedure.use(requireAuth);
