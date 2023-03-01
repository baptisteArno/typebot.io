import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications.',
    'ResizeObserver is not defined',
    "Can't find variable: ResizeObserver",
  ],
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA + '-viewer',
  beforeBreadcrumb(breadcrumb, hint) {
    try {
      if (breadcrumb.category.startsWith('ui')) {
        breadcrumb.message = `${hint.event.target.tagName.toLowerCase()}: ${
          hint.event.target.innerText
        }`
      }
    } catch (e) {
      /* empty */
    }
    return breadcrumb
  },
})
