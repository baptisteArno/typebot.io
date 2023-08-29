import { eventSchema } from '@typebot.io/schemas/features/telemetry'
import { z } from 'zod'
import { PostHog } from 'posthog-node'
import { TRPCError } from '@trpc/server'
import got from 'got'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { env } from '@typebot.io/env'

// Only used for the cloud version of Typebot. It's the way it processes telemetry events and inject it to thrid-party services.
export const processTelemetryEvent = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/t/process',
      description:
        "Only used for the cloud version of Typebot. It's the way it processes telemetry events and inject it to thrid-party services.",
      tags: ['Telemetry'],
    },
  })
  .input(
    z.object({
      events: z.array(eventSchema),
    })
  )
  .output(
    z.object({
      message: z.literal('Events injected'),
    })
  )
  .mutation(async ({ input: { events }, ctx: { user } }) => {
    if (user.email !== env.ADMIN_EMAIL)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Only app admin can process telemetry events',
      })
    if (!env.NEXT_PUBLIC_POSTHOG_KEY)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Server does not have POSTHOG_API_KEY configured',
      })
    const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_HOST,
    })

    events.forEach(async (event) => {
      if (event.name === 'User created') {
        client.identify({
          distinctId: event.userId,
          properties: event.data,
        })
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
      if (
        event.name === 'Typebot created' ||
        event.name === 'Typebot published'
      )
        client.groupIdentify({
          groupType: 'typebot',
          groupKey: event.typebotId,
          properties: { name: event.data.name },
        })
      if (event.name === 'User created' && env.USER_CREATED_WEBHOOK_URL) {
        await got.post(env.USER_CREATED_WEBHOOK_URL, {
          json: {
            email: event.data.email,
            name: event.data.name ? event.data.name.split(' ')[0] : undefined,
          },
        })
      }
      const groups: { workspace?: string; typebot?: string } = {}
      if ('workspaceId' in event) groups['workspace'] = event.workspaceId
      if ('typebotId' in event) groups['typebot'] = event.typebotId
      client.capture({
        distinctId: event.userId,
        event: event.name,
        properties: event.data,
        groups,
      })
    })

    await client.shutdownAsync()

    return { message: 'Events injected' }
  })
