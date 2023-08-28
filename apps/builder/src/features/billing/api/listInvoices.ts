import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import Stripe from 'stripe'
import { isDefined } from '@typebot.io/lib'
import { z } from 'zod'
import { invoiceSchema } from '@typebot.io/schemas/features/billing/invoice'
import { isAdminWriteWorkspaceForbidden } from '@/features/workspace/helpers/isAdminWriteWorkspaceForbidden'
import { env } from '@typebot.io/env'

export const listInvoices = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/billing/invoices',
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
      invoices: z.array(invoiceSchema),
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    if (!env.STRIPE_SECRET_KEY)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'STRIPE_SECRET_KEY var is missing',
      })
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      select: {
        stripeId: true,
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
    })
    if (!workspace?.stripeId || isAdminWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    })
    const invoices = await stripe.invoices.list({
      customer: workspace.stripeId,
    })
    return {
      invoices: invoices.data
        .filter(
          (invoice) => isDefined(invoice.invoice_pdf) && isDefined(invoice.id)
        )
        .map((i) => ({
          id: i.number as string,
          url: i.invoice_pdf as string,
          amount: i.subtotal,
          currency: i.currency,
          date: i.status_transitions.paid_at,
        })),
    }
  })
