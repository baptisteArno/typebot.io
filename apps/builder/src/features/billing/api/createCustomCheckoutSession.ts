import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from '@typebot.io/prisma'
import Stripe from 'stripe'
import { z } from 'zod'

export const createCustomCheckoutSession = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/billing/subscription/custom-checkout',
      protect: true,
      summary:
        'Create custom checkout session to make a workspace pay for a custom plan',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      email: z.string(),
      workspaceId: z.string(),
      returnUrl: z.string(),
    })
  )
  .output(
    z.object({
      checkoutUrl: z.string(),
    })
  )
  .mutation(
    async ({ input: { email, workspaceId, returnUrl }, ctx: { user } }) => {
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
        include: {
          claimableCustomPlan: true,
        },
      })
      if (
        !workspace?.claimableCustomPlan ||
        workspace.claimableCustomPlan.claimedAt
      )
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Custom plan not found',
        })
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
      })

      const vat =
        workspace.claimableCustomPlan.vatValue &&
        workspace.claimableCustomPlan.vatType
          ? ({
              type: workspace.claimableCustomPlan.vatType,
              value: workspace.claimableCustomPlan.vatValue,
            } as Stripe.CustomerCreateParams.TaxIdDatum)
          : undefined

      const customer = await stripe.customers.create({
        email,
        name: workspace.claimableCustomPlan.companyName ?? workspace.name,
        metadata: { workspaceId },
        tax_id_data: vat ? [vat] : undefined,
      })

      const session = await stripe.checkout.sessions.create({
        success_url: `${returnUrl}?stripe=${Plan.CUSTOM}&success=true`,
        cancel_url: `${returnUrl}?stripe=cancel`,
        allow_promotion_codes: true,
        customer: customer.id,
        customer_update: {
          address: 'auto',
          name: 'never',
        },
        mode: 'subscription',
        metadata: {
          claimableCustomPlanId: workspace.claimableCustomPlan.id,
          userId: user.id,
        },
        currency: workspace.claimableCustomPlan.currency,
        billing_address_collection: 'required',
        automatic_tax: { enabled: true },
        line_items: [
          {
            price_data: {
              currency: workspace.claimableCustomPlan.currency,
              tax_behavior: 'exclusive',
              recurring: {
                interval: workspace.claimableCustomPlan.isYearly
                  ? 'year'
                  : 'month',
              },
              product_data: {
                name: workspace.claimableCustomPlan.name,
                description:
                  workspace.claimableCustomPlan.description ?? undefined,
              },
              unit_amount: workspace.claimableCustomPlan.price * 100,
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: workspace.claimableCustomPlan.currency,
              tax_behavior: 'exclusive',
              recurring: {
                interval: workspace.claimableCustomPlan.isYearly
                  ? 'year'
                  : 'month',
              },
              product_data: {
                name: 'Included chats per month',
              },
              unit_amount: 0,
            },
            quantity: workspace.claimableCustomPlan.chatsLimit,
          },
          {
            price_data: {
              currency: workspace.claimableCustomPlan.currency,
              tax_behavior: 'exclusive',
              recurring: {
                interval: workspace.claimableCustomPlan.isYearly
                  ? 'year'
                  : 'month',
              },
              product_data: {
                name: 'Included storage per month',
              },
              unit_amount: 0,
            },
            quantity: workspace.claimableCustomPlan.storageLimit,
          },
          {
            price_data: {
              currency: workspace.claimableCustomPlan.currency,
              tax_behavior: 'exclusive',
              recurring: {
                interval: workspace.claimableCustomPlan.isYearly
                  ? 'year'
                  : 'month',
              },
              product_data: {
                name: 'Included seats',
              },
              unit_amount: 0,
            },
            quantity: workspace.claimableCustomPlan.seatsLimit,
          },
        ],
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
