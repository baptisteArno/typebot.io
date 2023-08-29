import got from 'got'
import { TelemetryEvent } from '@typebot.io/schemas/features/telemetry'
import { env } from '@typebot.io/env'

export const sendTelemetryEvents = async (events: TelemetryEvent[]) => {
  if (events.length === 0) return { message: 'No events to send' }
  if (!env.TELEMETRY_WEBHOOK_URL) return { message: 'Telemetry not enabled' }

  try {
    await got.post(env.TELEMETRY_WEBHOOK_URL, {
      json: { events },
      headers: {
        authorization: env.TELEMETRY_WEBHOOK_BEARER_TOKEN
          ? `Bearer ${env.TELEMETRY_WEBHOOK_BEARER_TOKEN}`
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
