import { TRPCError } from '@trpc/server'
import { env } from '@sniper.io/env'
import prisma from '@sniper.io/lib/prisma'
import { User } from '@sniper.io/prisma'
import Stripe from 'stripe'
import { isReadWorkspaceFobidden } from '@sniper.io/db-rules/isReadWorkspaceFobidden'

type Props = {
  workspaceId: string
  user: Pick<User, 'email' | 'id'>
}

export const getUsage = async ({ workspaceId, user }: Props) => {
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
      snipers: {
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
        sniperId: { in: workspace.snipers.map((sniper) => sniper.id) },
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
      sniperId: { in: workspace.snipers.map((sniper) => sniper.id) },
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
}
