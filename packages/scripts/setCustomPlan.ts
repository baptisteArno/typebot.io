import { Plan, PrismaClient } from '@typebot.io/prisma'
import Stripe from 'stripe'
import { promptAndSetEnvironment } from './utils'

const setCustomPlan = async () => {
  await promptAndSetEnvironment()
  const prisma = new PrismaClient()
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_PRODUCT_ID ||
    !process.env.STRIPE_SUBSCRIPTION_ID ||
    !process.env.WORKSPACE_ID
  )
    throw Error(
      'STRIPE_SECRET_KEY or STRIPE_SUBSCRIPTION_ID or STRIPE_PRODUCT_ID or process.env.WORKSPACE_ID var is missing'
    )
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  })

  const claimablePlan = await prisma.claimableCustomPlan.findFirst({
    where: { workspaceId: process.env.WORKSPACE_ID, claimedAt: null },
  })

  if (!claimablePlan) throw Error('No claimable plan found')

  console.log('Claimable plan found')

  const { items: existingItems } = await stripe.subscriptions.retrieve(
    process.env.STRIPE_SUBSCRIPTION_ID
  )
  if (existingItems.data.length === 0) return

  const planItem = existingItems.data.find(
    (item) => item.plan.product === process.env.STRIPE_PRODUCT_ID
  )

  if (!planItem) throw Error("Couldn't find plan item")

  console.log('Updating subscription...')

  await stripe.subscriptions.update(process.env.STRIPE_SUBSCRIPTION_ID, {
    items: [
      {
        id: planItem.id,
        price_data: {
          currency: 'usd',
          tax_behavior: 'exclusive',
          recurring: { interval: 'month' },
          product: process.env.STRIPE_PRODUCT_ID,
          unit_amount: claimablePlan.price * 100,
        },
      },
      ...existingItems.data
        .filter((item) => item.plan.product !== process.env.STRIPE_PRODUCT_ID)
        .map((item) => ({ id: item.id, deleted: true })),
    ],
  })

  console.log('Subscription updated!')

  console.log('Updating workspace...')

  await prisma.workspace.update({
    where: { id: process.env.WORKSPACE_ID },
    data: {
      plan: Plan.CUSTOM,
      customChatsLimit: claimablePlan.chatsLimit,
      customSeatsLimit: claimablePlan.seatsLimit,
      customStorageLimit: claimablePlan.storageLimit,
    },
  })

  console.log('Workspace updated!')

  console.log('Updating claimable plan...')

  await prisma.claimableCustomPlan.update({
    where: { id: claimablePlan.id },
    data: { claimedAt: new Date() },
  })

  console.log('Claimable plan updated!')
}

setCustomPlan()
