import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'
import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from '@typebot.io/prisma'
import { workspaceSchema } from '@typebot.io/schemas'
import Stripe from 'stripe'
import { isDefined } from '@typebot.io/lib'
import { z } from 'zod'
import {
  getChatsLimit,
  getStorageLimit,
  priceIds,
} from '@typebot.io/lib/pricing'
import { chatPriceIds, storagePriceIds } from './getSubscription'

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
      isYearly: z.boolean(),
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
        isYearly,
      },
      ctx: { user },
    }) => {
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
      const currentPlanItemId = subscription?.items.data.find((item) =>
        [
          process.env.STRIPE_STARTER_PRODUCT_ID,
          process.env.STRIPE_PRO_PRODUCT_ID,
        ].includes(item.price.product.toString())
      )?.id
      const currentAdditionalChatsItemId = subscription?.items.data.find(
        (item) => chatPriceIds.includes(item.price.id)
      )?.id
      const currentAdditionalStorageItemId = subscription?.items.data.find(
        (item) => storagePriceIds.includes(item.price.id)
      )?.id
      const frequency = isYearly ? 'yearly' : 'monthly'

      const items = [
        {
          id: currentPlanItemId,
          price: priceIds[plan].base[frequency],
          quantity: 1,
        },
        additionalChats === 0 && !currentAdditionalChatsItemId
          ? undefined
          : {
              id: currentAdditionalChatsItemId,
              price: priceIds[plan].chats[frequency],
              quantity: getChatsLimit({
                plan,
                additionalChatsIndex: additionalChats,
                customChatsLimit: null,
              }),
              deleted: subscription ? additionalChats === 0 : undefined,
            },
        additionalStorage === 0 && !currentAdditionalStorageItemId
          ? undefined
          : {
              id: currentAdditionalStorageItemId,
              price: priceIds[plan].storage[frequency],
              quantity: getStorageLimit({
                plan,
                additionalStorageIndex: additionalStorage,
                customStorageLimit: null,
              }),
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
          automatic_tax: {
            enabled: true,
          },
        })
      }

      const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          plan,
          additionalChatsIndex: additionalChats,
          additionalStorageIndex: additionalStorage,
          isQuarantined: false,
        },
      })

      await sendTelemetryEvents([
        {
          name: 'Subscription updated',
          workspaceId,
          userId: user.id,
          data: {
            plan,
            additionalChatsIndex: additionalChats,
            additionalStorageIndex: additionalStorage,
          },
        },
      ])

      return { workspace: updatedWorkspace }
    }
  )
