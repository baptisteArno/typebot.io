import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  ignoreErrors: ['ResizeObserver loop limit exceeded'],
  debug: true,
  beforeSend: (event) => {
    console.log('[SENTRY] beforeSend event:', event)
    return event
  },
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA + '-builder',
})
