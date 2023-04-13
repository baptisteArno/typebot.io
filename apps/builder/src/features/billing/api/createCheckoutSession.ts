import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from '@typebot.io/prisma'
import Stripe from 'stripe'
import { z } from 'zod'
import { parseSubscriptionItems } from '../helpers/parseSubscriptionItems'

export const createCheckoutSession = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/billing/subscription/checkout',
      protect: true,
      summary: 'Create checkout session to create a new subscription',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      email: z.string(),
      company: z.string(),
      workspaceId: z.string(),
      prefilledEmail: z.string().optional(),
      currency: z.enum(['usd', 'eur']),
      plan: z.enum([Plan.STARTER, Plan.PRO]),
      returnUrl: z.string(),
      additionalChats: z.number(),
      additionalStorage: z.number(),
      vat: z
        .object({
          type: z.string(),
          value: z.string(),
        })
        .optional(),
      isYearly: z.boolean(),
    })
  )
  .output(
    z.object({
      checkoutUrl: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        vat,
        email,
        company,
        workspaceId,
        currency,
        plan,
        returnUrl,
        additionalChats,
        additionalStorage,
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
      if (!workspace)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
      })

      await prisma.user.updateMany({
        where: {
          id: user.id,
        },
        data: {
          company,
        },
      })

      const customer = await stripe.customers.create({
        email,
        name: company,
        metadata: { workspaceId },
        tax_id_data: vat
          ? [vat as Stripe.CustomerCreateParams.TaxIdDatum]
          : undefined,
      })

      const session = await stripe.checkout.sessions.create({
        success_url: `${returnUrl}?stripe=${plan}&success=true`,
        cancel_url: `${returnUrl}?stripe=cancel`,
        allow_promotion_codes: true,
        customer: customer.id,
        customer_update: {
          address: 'auto',
          name: 'never',
        },
        mode: 'subscription',
        metadata: {
          workspaceId,
          plan,
          additionalChats,
          additionalStorage,
          userId: user.id,
        },
        currency,
        billing_address_collection: 'required',
        automatic_tax: { enabled: true },
        line_items: parseSubscriptionItems(
          plan,
          additionalChats,
          additionalStorage,
          isYearly
        ),
      })

      if (!session.url)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe checkout session creation failed',
        })

      return {
        checkoutUrl: session.url,
      }
    }
  )
