import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  forbidden,
  isDefined,
  methodNotAllowed,
  notAuthenticated,
} from 'utils'
import Stripe from 'stripe'
import { withSentry } from '@sentry/nextjs'
import { getAuthenticatedUser } from 'services/api/utils'
import prisma from 'libs/prisma'
import { Plan, WorkspaceRole } from 'db'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET')
    return res.send(await getSubscriptionDetails(req, res)(user.id))
  if (req.method === 'POST') {
    const session = await createCheckoutSession(req)
    return res.send({ sessionId: session.id })
  }
  if (req.method === 'PUT') {
    await updateSubscription(req)
    return res.send({ message: 'success' })
  }
  if (req.method === 'DELETE') {
    await cancelSubscription(req, res)(user.id)
    return res.send({ message: 'success' })
  }
  return methodNotAllowed(res)
}

const getSubscriptionDetails =
  (req: NextApiRequest, res: NextApiResponse) => async (userId: string) => {
    const stripeId = req.query.stripeId as string | undefined
    if (!stripeId) return badRequest(res)
    if (!process.env.STRIPE_SECRET_KEY)
      throw Error('STRIPE_SECRET_KEY var is missing')
    const workspace = await prisma.workspace.findFirst({
      where: {
        stripeId,
        members: { some: { userId, role: WorkspaceRole.ADMIN } },
      },
    })
    if (!workspace?.stripeId) return forbidden(res)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-08-01',
    })
    const subscriptions = await stripe.subscriptions.list({
      customer: workspace.stripeId,
      limit: 1,
    })
    return {
      additionalChatsIndex:
        subscriptions.data[0].items.data.find(
          (item) =>
            item.price.id === process.env.STRIPE_ADDITIONAL_CHATS_PRICE_ID
        )?.quantity ?? 0,
      additionalStorageIndex:
        subscriptions.data[0].items.data.find(
          (item) =>
            item.price.id === process.env.STRIPE_ADDITIONAL_STORAGE_PRICE_ID
        )?.quantity ?? 0,
    }
  }

const createCheckoutSession = (req: NextApiRequest) => {
  if (!process.env.STRIPE_SECRET_KEY)
    throw Error('STRIPE_SECRET_KEY var is missing')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-08-01',
  })
  const {
    email,
    currency,
    plan,
    workspaceId,
    href,
    additionalChats,
    additionalStorage,
  } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

  return stripe.checkout.sessions.create({
    success_url: `${href}?stripe=${plan}&success=true`,
    cancel_url: `${href}?stripe=cancel`,
    allow_promotion_codes: true,
    customer_email: email,
    mode: 'subscription',
    metadata: { workspaceId, plan, additionalChats, additionalStorage },
    currency,
    automatic_tax: { enabled: true },
    line_items: parseSubscriptionItems(
      plan,
      additionalChats,
      additionalStorage
    ),
  })
}

const updateSubscription = async (req: NextApiRequest) => {
  const { customerId, plan, workspaceId, additionalChats, additionalStorage } =
    (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as {
      customerId: string
      workspaceId: string
      additionalChats: number
      additionalStorage: number
      plan: 'STARTER' | 'PRO'
    }
  if (!process.env.STRIPE_SECRET_KEY)
    throw Error('STRIPE_SECRET_KEY var is missing')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-08-01',
  })
  const { data } = await stripe.subscriptions.list({
    customer: customerId,
  })
  const subscription = data[0]
  const currentStarterPlanItemId = subscription.items.data.find(
    (item) => item.price.id === process.env.STRIPE_STARTER_PRICE_ID
  )?.id
  const currentProPlanItemId = subscription.items.data.find(
    (item) => item.price.id === process.env.STRIPE_PRO_PRICE_ID
  )?.id
  const currentAdditionalChatsItemId = subscription.items.data.find(
    (item) => item.price.id === process.env.STRIPE_ADDITIONAL_CHATS_PRICE_ID
  )?.id
  const currentAdditionalStorageItemId = subscription.items.data.find(
    (item) => item.price.id === process.env.STRIPE_ADDITIONAL_STORAGE_PRICE_ID
  )?.id
  const items = [
    {
      id: currentStarterPlanItemId ?? currentProPlanItemId,
      price:
        plan === Plan.STARTER
          ? process.env.STRIPE_STARTER_PRICE_ID
          : process.env.STRIPE_PRO_PRICE_ID,
      quantity: 1,
    },
    currentAdditionalChatsItemId
      ? {
          id: currentAdditionalChatsItemId,
          price: process.env.STRIPE_ADDITIONAL_CHATS_PRICE_ID,
          quantity: additionalChats,
          deleted: additionalChats === 0,
        }
      : undefined,
    currentAdditionalStorageItemId
      ? {
          id: currentAdditionalStorageItemId,
          price: process.env.STRIPE_ADDITIONAL_STORAGE_PRICE_ID,
          quantity: additionalStorage,
          deleted: additionalStorage === 0,
        }
      : undefined,
  ].filter(isDefined)
  console.log(items)
  await stripe.subscriptions.update(subscription.id, {
    items,
  })
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      plan,
      additionalChatsIndex: additionalChats,
      additionalStorageIndex: additionalStorage,
    },
  })
}

const cancelSubscription =
  (req: NextApiRequest, res: NextApiResponse) => async (userId: string) => {
    console.log(req.query.stripeId, userId)
    const stripeId = req.query.stripeId as string | undefined
    if (!stripeId) return badRequest(res)
    if (!process.env.STRIPE_SECRET_KEY)
      throw Error('STRIPE_SECRET_KEY var is missing')
    const workspace = await prisma.workspace.findFirst({
      where: {
        stripeId,
        members: { some: { userId, role: WorkspaceRole.ADMIN } },
      },
    })
    if (!workspace?.stripeId) return forbidden(res)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-08-01',
    })
    const existingSubscription = await stripe.subscriptions.list({
      customer: workspace.stripeId,
    })
    console.log('yes')
    await stripe.subscriptions.del(existingSubscription.data[0].id)
    console.log('deleted')
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        plan: Plan.FREE,
        additionalChatsIndex: 0,
        additionalStorageIndex: 0,
      },
    })
  }

const parseSubscriptionItems = (
  plan: Plan,
  additionalChats: number,
  additionalStorage: number
) =>
  [
    {
      price:
        plan === Plan.STARTER
          ? process.env.STRIPE_STARTER_PRICE_ID
          : process.env.STRIPE_PRO_PRICE_ID,
      quantity: 1,
    },
  ]
    .concat(
      additionalChats > 0
        ? [
            {
              price: process.env.STRIPE_ADDITIONAL_CHATS_PRICE_ID,
              quantity: additionalChats,
            },
          ]
        : []
    )
    .concat(
      additionalStorage > 0
        ? [
            {
              price: process.env.STRIPE_ADDITIONAL_STORAGE_PRICE_ID,
              quantity: additionalStorage,
            },
          ]
        : []
    )

export default withSentry(handler)
