import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'
import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan } from '@typebot.io/prisma'
import { workspaceSchema } from '@typebot.io/schemas'
import Stripe from 'stripe'
import { isDefined } from '@typebot.io/lib'
import { z } from 'zod'
import { getChatsLimit, getStorageLimit } from '@typebot.io/lib/pricing'
import { chatPriceIds, storagePriceIds } from './getSubscription'
import { createCheckoutSessionUrl } from './createCheckoutSession'
import { isAdminWriteWorkspaceForbidden } from '@/features/workspace/helpers/isAdminWriteWorkspaceForbidden'
import { getUsage } from '@typebot.io/lib/api/getUsage'
import { env } from '@typebot.io/env'
import { priceIds } from '@typebot.io/lib/api/pricing'

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
      returnUrl: z.string(),
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
      workspace: workspaceSchema.nullish(),
      checkoutUrl: z.string().nullish(),
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
        returnUrl,
      },
      ctx: { user },
    }) => {
      if (!env.STRIPE_SECRET_KEY)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe environment variables are missing',
        })
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
        },
        select: {
          isQuarantined: true,
          stripeId: true,
          members: {
            select: {
              userId: true,
              role: true,
            },
          },
        },
      })
      if (
        !workspace?.stripeId ||
        isAdminWriteWorkspaceForbidden(workspace, user)
      )
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })
      const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
      })
      const { data } = await stripe.subscriptions.list({
        customer: workspace.stripeId,
        limit: 1,
        status: 'active',
      })
      const subscription = data[0] as Stripe.Subscription | undefined
      const currentPlanItemId = subscription?.items.data.find((item) =>
        [env.STRIPE_STARTER_PRODUCT_ID, env.STRIPE_PRO_PRODUCT_ID].includes(
          item.price.product.toString()
        )
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
          proration_behavior: 'always_invoice',
        })
      } else {
        const checkoutUrl = await createCheckoutSessionUrl(stripe)({
          customerId: workspace.stripeId,
          userId: user.id,
          workspaceId,
          currency,
          plan,
          returnUrl,
          additionalChats,
          additionalStorage,
          isYearly,
        })

        return { checkoutUrl }
      }

      let isQuarantined = workspace.isQuarantined

      if (isQuarantined) {
        const newChatsLimit = getChatsLimit({
          plan,
          additionalChatsIndex: additionalChats,
          customChatsLimit: null,
        })
        const { totalChatsUsed } = await getUsage(prisma)(workspaceId)
        if (totalChatsUsed < newChatsLimit) isQuarantined = false
      }

      const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          plan,
          additionalChatsIndex: additionalChats,
          additionalStorageIndex: additionalStorage,
          isQuarantined,
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
