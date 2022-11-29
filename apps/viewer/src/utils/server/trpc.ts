import { initTRPC } from '@trpc/server'
import { OpenApiMeta } from 'trpc-openapi'
import superjson from 'superjson'

const t = initTRPC.meta<OpenApiMeta>().create({
  transformer: superjson,
})

export const middleware = t.middleware

export const router = t.router

export const publicProcedure = t.procedure
