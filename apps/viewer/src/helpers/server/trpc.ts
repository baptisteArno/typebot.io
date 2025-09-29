import { TRPCError, initTRPC } from '@trpc/server'
import { OpenApiMeta } from '@lilyrose2798/trpc-openapi'
import superjson from 'superjson'
import { Context } from './context'
import * as Sentry from '@sentry/nextjs'
import { ZodError } from 'zod'
import { createDatadogLoggerMiddleware } from '@typebot.io/lib/trpc/createDatadogLoggerMiddleware'
import { User } from '@typebot.io/prisma'

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
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: { ...ctx, user: ctx.user as User },
  })
})

const datadogLoggerMiddleware = createDatadogLoggerMiddleware(t, {
  service: 'typebot-viewer',
})
const finalMiddleware = datadogLoggerMiddleware
  .unstable_pipe(sentryMiddleware)
  .unstable_pipe(injectUser)
const authenticatedMiddleware = datadogLoggerMiddleware
  .unstable_pipe(sentryMiddleware)
  .unstable_pipe(isAuthed)

export const middleware = t.middleware

export const router = t.router

export const publicProcedure = t.procedure.use(finalMiddleware)

export const authenticatedProcedure = t.procedure
  .use(authenticatedMiddleware)
  .use(
    t.middleware(({ next, ctx }) =>
      next({ ctx: ctx as Context & { user: User } })
    )
  )
