import * as Sentry from "@sentry/nextjs";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { OpenApiMeta } from "trpc-to-openapi";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";
import { ClientToastError } from "../../lib/ClientToastError";
import type { Context } from "./context";

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          logError:
            error.cause instanceof ClientToastError
              ? error.cause.toToast()
              : null,
          zodError:
            error.cause instanceof ZodError
              ? fromError(error.cause).message
              : null,
        },
      };
    },
  });

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const sentryMiddleware = t.middleware(Sentry.trpcMiddleware());

export const middleware = t.middleware;

export const router = t.router;
export const mergeRouters = t.mergeRouters;

export const publicProcedure = t.procedure.use(sentryMiddleware);

export const authenticatedProcedure = t.procedure
  .use(sentryMiddleware)
  .use(isAuthed);
