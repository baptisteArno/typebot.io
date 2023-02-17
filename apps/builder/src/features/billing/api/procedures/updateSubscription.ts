import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from 'db'
import { workspaceSchema } from 'models'
import Stripe from 'stripe'
import { isDefined } from 'utils'
import { z } from 'zod'

export const updateSubscription = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/billing/subscription',
      protect: true,
      summary: 'Update subscription',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      plan: z.enum([Plan.STARTER, Plan.PRO]),
      additionalChats: z.number(),
      additionalStorage: z.number(),
      currency: z.enum(['usd', 'eur']),
    })
  )
  .output(
    z.object({
      workspace: workspaceSchema,
    })
  )
  .mutation(
    async ({
      input: {
        workspaceId,
        plan,
        additionalChats,
        additionalStorage,
        currency,
      },
      ctx: { user },
    }) => {
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
      const { data } = await stripe.subscriptions.list({
        customer: workspace.stripeId,
      })
      const subscription = data[0] as Stripe.Subscription | undefined
      const currentStarterPlanItemId = subscription?.items.data.find(
        (item) => item.price.id === process.env.STRIPE_STARTER_PRICE_ID
      )?.id
      const currentProPlanItemId = subscription?.items.data.find(
        (item) => item.price.id === process.env.STRIPE_PRO_PRICE_ID
      )?.id
      const currentAdditionalChatsItemId = subscription?.items.data.find(
        (item) => item.price.id === process.env.STRIPE_ADDITIONAL_CHATS_PRICE_ID
      )?.id
      const currentAdditionalStorageItemId = subscription?.items.data.find(
        (item) =>
          item.price.id === process.env.STRIPE_ADDITIONAL_STORAGE_PRICE_ID
      )?.id
      const items = [
        {
          id: currentStarterPlanItemId ?? currentProPlanItemId,
          price:
            plan === Plan.STARTER
              ? process.env.STRIPE_STARTER_PRICE_ID
              : process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
        additionalChats === 0 && !currentAdditionalChatsItemId
          ? undefined
          : {
              id: currentAdditionalChatsItemId,
              price: process.env.STRIPE_ADDITIONAL_CHATS_PRICE_ID,
              quantity: additionalChats,
              deleted: subscription ? additionalChats === 0 : undefined,
            },
        additionalStorage === 0 && !currentAdditionalStorageItemId
          ? undefined
          : {
              id: currentAdditionalStorageItemId,
              price: process.env.STRIPE_ADDITIONAL_STORAGE_PRICE_ID,
              quantity: additionalStorage,
              deleted: subscription ? additionalStorage === 0 : undefined,
            },
      ].filter(isDefined)

      if (subscription) {
        await stripe.subscriptions.update(subscription.id, {
          items,
        })
      } else {
        const { data: paymentMethods } = await stripe.paymentMethods.list({
          customer: workspace.stripeId,
        })
        if (paymentMethods.length === 0) {
          throw Error('No payment method found')
        }
        await stripe.subscriptions.create({
          customer: workspace.stripeId,
          items,
          currency,
          default_payment_method: paymentMethods[0].id,
        })
      }

      const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          plan,
          additionalChatsIndex: additionalChats,
          additionalStorageIndex: additionalStorage,
          chatsLimitFirstEmailSentAt: null,
          chatsLimitSecondEmailSentAt: null,
          storageLimitFirstEmailSentAt: null,
          storageLimitSecondEmailSentAt: null,
        },
      })

      return { workspace: updatedWorkspace }
    }
  )
