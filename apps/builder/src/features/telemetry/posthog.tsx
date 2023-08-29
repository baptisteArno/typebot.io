import { env } from '@typebot.io/env'
import posthog from 'posthog-js'

export const initPostHogIfEnabled = () => {
  if (typeof window === 'undefined') return

  const posthogKey = env.NEXT_PUBLIC_POSTHOG_KEY

  if (!posthogKey) return

  posthog.init(posthogKey, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    },
    capture_pageview: false,
    capture_pageleave: false,
    autocapture: false,
  })
}

export const identifyUser = (userId: string) => {
  if (!posthog.__loaded) return
  posthog.identify(userId)
}

export const isWhatsAppAvailable = () => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY || !posthog) return true
  const isWhatsAppEnabled = posthog.getFeatureFlag('whatsApp', {
    send_event: false,
  })
  if (isWhatsAppEnabled === undefined) return true
  return posthog.__loaded && isWhatsAppEnabled
}

export { posthog }
