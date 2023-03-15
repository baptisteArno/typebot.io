import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceRole } from '@typebot.io/prisma'
import Stripe from 'stripe'
import { z } from 'zod'

export const getBillingPortalUrl = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/billing/subscription/portal',
      protect: true,
      summary: 'Get Stripe billing portal URL',
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
      billingPortalUrl: z.string(),
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    if (!process.env.STRIPE_SECRET_KEY)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'STRIPE_SECRET_KEY var is missing',
      })
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
      select: {
        stripeId: true,
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
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: workspace.stripeId,
      return_url: `${process.env.NEXTAUTH_URL}/typebots`,
    })
    return {
      billingPortalUrl: portalSession.url,
    }
  })
