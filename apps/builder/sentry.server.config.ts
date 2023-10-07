import * as Sentry from '@sentry/nextjs'
import prisma from '@typebot.io/lib/prisma'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA + '-builder',
  integrations: [
    new Sentry.Integrations.Prisma({
      client: prisma,
    }),
  ],
})
