import got from 'got'
import { TelemetryEvent } from '@typebot.io/schemas/features/telemetry'
import { isEmpty, isNotEmpty } from '../utils'

export const sendTelemetryEvents = async (events: TelemetryEvent[]) => {
  if (isEmpty(process.env.TELEMETRY_WEBHOOK_URL))
    return { message: 'Telemetry not enabled' }

  try {
    await got.post(process.env.TELEMETRY_WEBHOOK_URL, {
      json: { events },
      headers: {
        authorization: isNotEmpty(process.env.TELEMETRY_WEBHOOK_BEARER_TOKEN)
          ? `Bearer ${process.env.TELEMETRY_WEBHOOK_BEARER_TOKEN}`
          : undefined,
      },
    })
  } catch (err) {
    console.error('Failed to send event', err)
    return {
      message: 'Failed to send event',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }

  return {
    message: 'Event sent',
  }
}
