import { TRPCError } from '@trpc/server'
import { isAdminWriteWorkspaceForbidden } from '@typebot.io/db-rules/isAdminWriteWorkspaceForbidden'
import { env } from '@typebot.io/env'
import prisma from '@typebot.io/lib/prisma'
import { Plan, User } from '@typebot.io/prisma'
import Stripe from 'stripe'

type Props = {
  workspaceId: string
  user: Pick<User, 'email' | 'id'>
  returnUrl: string
  email: string
}
export const createCustomCheckoutSession = async ({
  workspaceId,
  user,
  returnUrl,
  email,
}: Props) => {
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
      claimableCustomPlan: true,
      name: true,
      members: {
        select: {
          userId: true,
          role: true,
        },
      },
    },
  })
  if (
    !workspace?.claimableCustomPlan ||
    workspace.claimableCustomPlan.claimedAt ||
    isAdminWriteWorkspaceForbidden(workspace, user)
  )
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Custom plan not found',
    })
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
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

  const customer = workspace.stripeId
    ? await stripe.customers.retrieve(workspace.stripeId)
    : await stripe.customers.create({
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
            interval: workspace.claimableCustomPlan.isYearly ? 'year' : 'month',
          },
          product_data: {
            name: workspace.claimableCustomPlan.name,
            description: workspace.claimableCustomPlan.description ?? undefined,
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
            interval: workspace.claimableCustomPlan.isYearly ? 'year' : 'month',
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
            interval: workspace.claimableCustomPlan.isYearly ? 'year' : 'month',
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
            interval: workspace.claimableCustomPlan.isYearly ? 'year' : 'month',
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
