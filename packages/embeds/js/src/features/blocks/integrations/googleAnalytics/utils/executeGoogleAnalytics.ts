import { sendGaEvent } from '@/lib/gtag'
import type { GoogleAnalyticsOptions } from '@typebot.io/schemas'

export const executeGoogleAnalyticsBlock = async (
  options: GoogleAnalyticsOptions
) => {
  if (!options?.trackingId) return
  const { default: initGoogleAnalytics } = await import('@/lib/gtag')
  await initGoogleAnalytics(options.trackingId)
  sendGaEvent(options)
}
