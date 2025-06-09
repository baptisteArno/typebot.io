import { TRPCError, initTRPC } from '@trpc/server'
import { OpenApiMeta } from '@lilyrose2798/trpc-openapi'
import superjson from 'superjson'
import { Context } from './context'
import * as Sentry from '@sentry/nextjs'
import { ZodError } from 'zod'

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
      }
    },
  })

const sentryMiddleware = t.middleware(
  Sentry.Handlers.trpcMiddleware({
    attachRpcInput: true,
  })
)

const injectUser = t.middleware(({ next, ctx }) => {
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

const finalMiddleware = sentryMiddleware.unstable_pipe(injectUser)
const authenticatedMiddleware = sentryMiddleware.unstable_pipe(isAuthed)

export const middleware = t.middleware

export const router = t.router

export const publicProcedure = t.procedure.use(finalMiddleware)

export const authenticatedProcedure = t.procedure.use(authenticatedMiddleware)
