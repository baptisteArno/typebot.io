import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { subscriptionSchema } from '@typebot.io/schemas/features/billing/subscription'

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
