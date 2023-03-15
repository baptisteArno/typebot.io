import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceRole } from '@typebot.io/prisma'
import Stripe from 'stripe'
import { z } from 'zod'
import { subscriptionSchema } from '@typebot.io/schemas/features/billing/subscription'

export const getSubscription = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/billing/subscription',
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
      subscription: subscriptionSchema,
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    if (
      !process.env.STRIPE_SECRET_KEY ||
      !process.env.STRIPE_ADDITIONAL_CHATS_PRICE_ID ||
      !process.env.STRIPE_ADDITIONAL_STORAGE_PRICE_ID
    )
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Stripe environment variables are missing',
      })
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
    })
    if (!workspace?.stripeId)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    })
    const subscriptions = await stripe.subscriptions.list({
      customer: workspace.stripeId,
      limit: 1,
    })

    const subscription = subscriptions?.data.shift()

    if (!subscription)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Subscription not found',
      })

    return {
      subscription: {
        additionalChatsIndex:
          subscription?.items.data.find(
            (item) =>
              item.price.id === process.env.STRIPE_ADDITIONAL_CHATS_PRICE_ID
          )?.quantity ?? 0,
        additionalStorageIndex:
          subscription.items.data.find(
            (item) =>
              item.price.id === process.env.STRIPE_ADDITIONAL_STORAGE_PRICE_ID
          )?.quantity ?? 0,
        currency: subscription.currency as 'usd' | 'eur',
      },
    }
  })
