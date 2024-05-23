import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { subscriptionSchema } from '@typebot.io/schemas/features/billing/subscription'
import { getSubscription as getSubscriptionHandler } from '@typebot.io/billing/api/getSubscription'

export const getSubscription = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/billing/subscription',
      protect: true,
      summary: 'List invoices',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({
      subscription: subscriptionSchema.or(z.null().openapi({ type: 'string' })),
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) =>
    getSubscriptionHandler({ workspaceId, user })
  )
