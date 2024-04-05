import { env } from '@typebot.io/env'
import { TelemetryEvent } from '@typebot.io/schemas/features/telemetry'
import { PostHog } from 'posthog-node'
import ky from 'ky'

export const trackEvents = async (events: TelemetryEvent[]) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) return
  const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
  })

  events.forEach(async (event) => {
    if (event.name === 'User created') {
      client.identify({
        distinctId: event.userId,
        properties: event.data,
      })
      if (env.USER_CREATED_WEBHOOK_URL) {
        try {
          await ky.post(env.USER_CREATED_WEBHOOK_URL, {
            json: {
              email: event.data.email,
              name: event.data.name ? event.data.name.split(' ')[0] : undefined,
            },
          })
        } catch (e) {
          console.error('Failed to call user created webhook', e)
        }
      }
    }
    if (
      event.name === 'Workspace created' ||
      event.name === 'Subscription updated'
    )
      client.groupIdentify({
        groupType: 'workspace',
        groupKey: event.workspaceId,
        properties: event.data,
      })
    if (event.name === 'Typebot created' || event.name === 'Typebot published')
      client.groupIdentify({
        groupType: 'typebot',
        groupKey: event.typebotId,
        properties: { name: event.data.name },
      })
    const groups: { workspace?: string; typebot?: string } = {}
    if ('workspaceId' in event) groups['workspace'] = event.workspaceId
    if ('typebotId' in event) groups['typebot'] = event.typebotId
    client.capture({
      distinctId: event.userId,
      event: event.name,
      properties:
        event.name === 'User updated'
          ? { $set: event.data }
          : event.name === 'User logged in'
          ? {
              $set: {
                lastActivityAt: new Date().toISOString(),
              },
            }
          : 'data' in event
          ? event.data
          : undefined,
      groups,
    })
  })

  await client.shutdownAsync()
}
