import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceRole } from '@typebot.io/prisma'
import Stripe from 'stripe'
import { z } from 'zod'
import { subscriptionSchema } from '@typebot.io/schemas/features/billing/subscription'
import { priceIds } from '@typebot.io/lib/pricing'

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
      subscription: subscriptionSchema.or(z.null()),
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    if (!process.env.STRIPE_SECRET_KEY)
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
      return {
        subscription: null,
      }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    })
    const subscriptions = await stripe.subscriptions.list({
      customer: workspace.stripeId,
      limit: 1,
    })

    const subscription = subscriptions?.data.shift()

    if (!subscription)
      return {
        subscription: null,
      }

    return {
      subscription: {
        isYearly: subscription.items.data.some((item) => {
          return (
            priceIds.STARTER.chats.yearly === item.price.id ||
            priceIds.STARTER.storage.yearly === item.price.id ||
            priceIds.PRO.chats.yearly === item.price.id ||
            priceIds.PRO.storage.yearly === item.price.id
          )
        }),
        currency: subscription.currency as 'usd' | 'eur',
        cancelDate: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : undefined,
      },
    }
  })

export const chatPriceIds = [priceIds.STARTER.chats.monthly]
  .concat(priceIds.STARTER.chats.yearly)
  .concat(priceIds.PRO.chats.monthly)
  .concat(priceIds.PRO.chats.yearly)

export const storagePriceIds = [priceIds.STARTER.storage.monthly]
  .concat(priceIds.STARTER.storage.yearly)
  .concat(priceIds.PRO.storage.monthly)
  .concat(priceIds.PRO.storage.yearly)
