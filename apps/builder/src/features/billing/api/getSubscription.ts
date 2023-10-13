import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { subscriptionSchema } from '@typebot.io/schemas/features/billing/subscription'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { env } from '@typebot.io/env'

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
        stripeId: true,
        members: {
          select: {
            userId: true,
          },
        },
      },
    })
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })
    if (!workspace?.stripeId)
      return {
        subscription: null,
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
      return {
        subscription: null,
      }

    return {
      subscription: {
        currentBillingPeriod:
          subscriptionSchema.shape.currentBillingPeriod.parse({
            start: new Date(currentSubscription.current_period_start),
            end: new Date(currentSubscription.current_period_end),
          }),
        status: subscriptionSchema.shape.status.parse(
          currentSubscription.status
        ),
        currency: currentSubscription.currency as 'usd' | 'eur',
        cancelDate: currentSubscription.cancel_at
          ? new Date(currentSubscription.cancel_at * 1000)
          : undefined,
      },
    }
  })
