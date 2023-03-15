import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from '@typebot.io/prisma'
import Stripe from 'stripe'
import { z } from 'zod'

export const cancelSubscription = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/billing/subscription',
      protect: true,
      summary: 'Cancel current subscription',
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
      message: z.literal('success'),
    })
  )
  .mutation(async ({ input: { workspaceId }, ctx: { user } }) => {
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
    const currentSubscriptionId = (
      await stripe.subscriptions.list({
        customer: workspace.stripeId,
      })
    ).data.shift()?.id
    if (currentSubscriptionId)
      await stripe.subscriptions.del(currentSubscriptionId)

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        plan: Plan.FREE,
        additionalChatsIndex: 0,
        additionalStorageIndex: 0,
      },
    })

    return { message: 'success' }
  })
