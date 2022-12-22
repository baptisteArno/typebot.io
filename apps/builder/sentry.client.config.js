// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  ignoreErrors: ['ResizeObserver loop limit exceeded'],
  beforeBreadcrumb(breadcrumb, hint) {
    try {
      if (breadcrumb.category?.startsWith('ui')) {
        breadcrumb.message = `${hint?.event.target.tagName.toLowerCase()}: ${
          hint?.event.target.innerText
        }`
      }
    } catch (e) {
      /* empty */
    }
    return breadcrumb
  },
})
