import { oo } from "@orpc/openapi";
import { os as baseOs, ORPCError } from "@orpc/server";
import * as Sentry from "@sentry/nextjs";
import { authenticateByToken, type Context } from "./context";

export const os = baseOs.$context<Context>();

const sentryMiddleware = os.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    console.log(error, isUnknownError(error));
    if (isUnknownError(error)) Sentry.captureException(error);
    throw error;
  }
});

const isUnknownError = (error: unknown) => {
  if (
    error instanceof ORPCError &&
    !error.code?.includes("INTERNAL_SERVER_ERROR")
  ) {
    return false;
  }
  return true;
};

const requireAuth = oo.spec(
  os.middleware(async ({ next, context }) => {
    const user = await authenticateByToken(context.bearerToken);
    if (user) {
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
    security: [{ bearerAuth: [] }],
  },
);

const needsOptionalAuthenticatedUser = os.middleware(
  async ({ next, context }) => {
    const user = await authenticateByToken(context.bearerToken);
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
