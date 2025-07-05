import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { invoiceSchema } from '@typebot.io/schemas/features/billing/invoice'

export const listInvoices = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/billing/invoices',
      protect: true,
      summary: 'List invoices',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          '[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)'
        ),
    })
  )
  .output(
    z.object({
      invoices: z.array(invoiceSchema),
    })
  )
