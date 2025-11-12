import { TRPCError, initTRPC } from '@trpc/server'
import { OpenApiMeta } from '@lilyrose2798/trpc-openapi'
import superjson from 'superjson'
import { Context } from './context'
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

// Tracks active tRPC procedure execution only (business logic time).
// It does not include raw HTTP socket lifetime or streaming after resolver returns.
// Sufficient for graceful drain; add HTTP-level middleware if end-to-end timing required.
const gracefulActiveRequestsMiddleware = t.middleware(async ({ next }) => {
  const end = beginRequest()
  try {
    return await next()
  } finally {
    end()
  }
})

const datadogLoggerMiddleware = createDatadogLoggerMiddleware(t, {
  service: 'typebot-viewer',
})
// Ordem: começa a contagem, depois log/datadog, depois sentry, depois auth/user
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

export const publicProcedure = t.procedure.use(finalMiddleware)

export const authenticatedProcedure = t.procedure
  .use(authenticatedMiddleware)
  .use(
    t.middleware(({ next, ctx }) =>
      next({ ctx: ctx as Context & { user: User } })
    )
  )
