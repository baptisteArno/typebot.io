import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { env } from '@typebot.io/env'
import Stripe from 'stripe'

export const getUsage = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/billing/usage',
      protect: true,
      summary: 'Get current plan usage',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
    })
  )
  .output(z.object({ totalChatsUsed: z.number(), resetsAt: z.date() }))
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      select: {
        stripeId: true,
        plan: true,
        members: {
          select: {
            userId: true,
          },
        },
        typebots: {
          select: { id: true },
        },
      },
    })
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })

    if (
      !env.STRIPE_SECRET_KEY ||
      !workspace.stripeId ||
      (workspace.plan !== 'STARTER' && workspace.plan !== 'PRO')
    ) {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const totalChatsUsed = await prisma.result.count({
        where: {
          typebotId: { in: workspace.typebots.map((typebot) => typebot.id) },
          hasStarted: true,
          createdAt: {
            gte: firstDayOfMonth,
          },
        },
      })

      const firstDayOfNextMonth = new Date(
        firstDayOfMonth.getFullYear(),
        firstDayOfMonth.getMonth() + 1,
        1
      )
      return { totalChatsUsed, resetsAt: firstDayOfNextMonth }
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    })

    const subscriptions = await stripe.subscriptions.list({
      customer: workspace.stripeId,
    })

    const currentSubscription = subscriptions.data
      .filter((sub) => ['past_due', 'active'].includes(sub.status))
      .sort((a, b) => a.created - b.created)
      .shift()

    if (!currentSubscription)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `No subscription found on workspace: ${workspaceId}`,
      })

    const totalChatsUsed = await prisma.result.count({
      where: {
        typebotId: { in: workspace.typebots.map((typebot) => typebot.id) },
        hasStarted: true,
        createdAt: {
          gte: new Date(currentSubscription.current_period_start * 1000),
        },
      },
    })

    return {
      totalChatsUsed,
      resetsAt: new Date(currentSubscription.current_period_end * 1000),
    }
  })
