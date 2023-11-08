import { sendGaEvent } from '@/lib/gtag'
import { GoogleAnalyticsBlock } from '@typebot.io/schemas'

export const executeGoogleAnalyticsBlock = async (
  options: GoogleAnalyticsBlock['options']
) => {
  if (!options?.trackingId) return
  sendGaEvent(options)
}
