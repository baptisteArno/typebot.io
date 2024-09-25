import * as Sentry from "@sentry/nextjs";
import { TRPCError, initTRPC } from "@trpc/server";
import type { OpenApiMeta } from "@typebot.io/trpc-openapi/types";
import superjson from "superjson";
import { ZodError } from "zod";
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
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

const sentryMiddleware = t.middleware(
  Sentry.Handlers.trpcMiddleware({
    attachRpcInput: true,
  }),
);

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const finalMiddleware = sentryMiddleware.unstable_pipe(isAuthed);

export const middleware = t.middleware;

export const router = t.router;
export const mergeRouters = t.mergeRouters;

export const publicProcedure = t.procedure.use(sentryMiddleware);

export const authenticatedProcedure = t.procedure.use(finalMiddleware);
