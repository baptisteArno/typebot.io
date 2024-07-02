import { isAdminWriteWorkspaceForbidden } from '@typebot.io/db-rules/isAdminWriteWorkspaceForbidden'
import { env } from '@typebot.io/env'
import prisma from '@typebot.io/lib/prisma'
import { User } from '@typebot.io/prisma'
import Stripe from 'stripe'
import { createCheckoutSessionUrl } from '../helpers/createCheckoutSessionUrl'
import { TRPCError } from '@trpc/server'

type Props = {
  workspaceId: string
  user: Pick<User, 'email' | 'id'>
  returnUrl: string
  email: string
  company: string
  plan: 'STARTER' | 'PRO'
  currency: 'usd' | 'eur'
  vat?: {
    type: string
    value: string
  }
}

export const createCheckoutSession = async ({
  workspaceId,
  user,
  returnUrl,
  email,
  company,
  plan,
  currency,
  vat,
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
