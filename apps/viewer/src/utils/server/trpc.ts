import { initTRPC } from '@trpc/server'
import { OpenApiMeta } from 'trpc-openapi'
import superjson from 'superjson'
import { Context } from './context'

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  transformer: superjson,
})

const injectUser = t.middleware(({ next, ctx }) => {
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

export const middleware = t.middleware

export const router = t.router

export const publicProcedure = t.procedure.use(injectUser)
