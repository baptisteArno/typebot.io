import { TRPCError, initTRPC } from '@trpc/server'
import { Context } from './context'
import { OpenApiMeta } from '@lilyrose2798/trpc-openapi'
import superjson from 'superjson'
import * as Sentry from '@sentry/nextjs'
import { ZodError } from 'zod'
import { createDatadogLoggerMiddleware } from '@typebot.io/lib/trpc/createDatadogLoggerMiddleware'
import { beginRequest } from '@typebot.io/lib'
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

// Tracks active tRPC procedure execution only (business logic time).
// It does not cover raw HTTP socket duration or long-lived streams.
// Good enough for graceful drain decisions; extend at HTTP layer if full request lifecycle is needed.
const gracefulActiveRequestsMiddleware = t.middleware(async ({ next }) => {
  const end = beginRequest()
  try {
    return await next()
  } finally {
    end()
  }
})

const datadogLoggerMiddleware = createDatadogLoggerMiddleware(t, {
  service: 'typebot-builder',
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
    ctx: { user: ctx.user as User },
  })
})

// Ordem: começa a contagem, depois logger/datadog, depois sentry, depois auth/user
const finalMiddleware = gracefulActiveRequestsMiddleware
  .unstable_pipe(datadogLoggerMiddleware)
  .unstable_pipe(sentryMiddleware)
  .unstable_pipe(injectUser)

const authenticatedMiddleware = gracefulActiveRequestsMiddleware
  .unstable_pipe(datadogLoggerMiddleware)
  .unstable_pipe(sentryMiddleware)
  .unstable_pipe(isAuthed)

export const middleware = t.middleware

export const router = t.router
export const mergeRouters = t.mergeRouters

export const publicProcedure = t.procedure.use(finalMiddleware)

export const authenticatedProcedure = t.procedure
  .use(authenticatedMiddleware)
  .use(
    t.middleware(({ next, ctx }) =>
      next({ ctx: ctx as Context & { user: User } })
    )
  )
