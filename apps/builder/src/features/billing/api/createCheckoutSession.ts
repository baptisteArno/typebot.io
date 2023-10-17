import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan } from '@typebot.io/prisma'
import Stripe from 'stripe'
import { z } from 'zod'
import { isAdminWriteWorkspaceForbidden } from '@/features/workspace/helpers/isAdminWriteWorkspaceForbidden'
import { env } from '@typebot.io/env'

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
      currency: z.enum(['usd', 'eur']),
      plan: z.enum([Plan.STARTER, Plan.PRO]),
      returnUrl: z.string(),
      vat: z
        .object({
          type: z.string(),
          value: z.string(),
        })
        .optional(),
    })
  )
  .output(
    z.object({
      checkoutUrl: z.string(),
    })
  )
  .mutation(
    async ({
      input: { vat, email, company, workspaceId, currency, plan, returnUrl },
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
          stripeId: true,
          members: {
            select: {
              userId: true,
              role: true,
            },
          },
        },
      })

      if (!workspace || isAdminWriteWorkspaceForbidden(workspace, user))
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })
      if (workspace.stripeId)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Customer already exists, use updateSubscription endpoint.',
        })

      const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
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

      const checkoutUrl = await createCheckoutSessionUrl(stripe)({
        customerId: customer.id,
        userId: user.id,
        workspaceId,
        currency,
        plan,
        returnUrl,
      })

      if (!checkoutUrl)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe checkout session creation failed',
        })

      return {
        checkoutUrl,
      }
    }
  )

type Props = {
  customerId: string
  workspaceId: string
  currency: 'usd' | 'eur'
  plan: 'STARTER' | 'PRO'
  returnUrl: string
  userId: string
}

export const createCheckoutSessionUrl =
  (stripe: Stripe) =>
  async ({ customerId, workspaceId, currency, plan, returnUrl }: Props) => {
    const session = await stripe.checkout.sessions.create({
      success_url: `${returnUrl}?stripe=${plan}&success=true`,
      cancel_url: `${returnUrl}?stripe=cancel`,
      allow_promotion_codes: true,
      customer: customerId,
      customer_update: {
        address: 'auto',
        name: 'never',
      },
      mode: 'subscription',
      metadata: {
        workspaceId,
        plan,
      },
      currency,
      billing_address_collection: 'required',
      automatic_tax: { enabled: true },
      line_items: [
        {
          price:
            plan === 'STARTER'
              ? env.STRIPE_STARTER_PRICE_ID
              : env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
        {
          price:
            plan === 'STARTER'
              ? env.STRIPE_STARTER_CHATS_PRICE_ID
              : env.STRIPE_PRO_CHATS_PRICE_ID,
        },
      ],
    })

    return session.url
  }
