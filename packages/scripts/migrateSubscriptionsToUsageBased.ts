import { PrismaClient } from '@typebot.io/prisma'
import { promptAndSetEnvironment } from './utils'
import { Stripe } from 'stripe'
import { createId } from '@paralleldrive/cuid2'

const migrateSubscriptionsToUsageBased = async () => {
  await promptAndSetEnvironment()
  const prisma = new PrismaClient()

  if (
    !process.env.STRIPE_STARTER_CHATS_PRICE_ID ||
    !process.env.STRIPE_PRO_CHATS_PRICE_ID
  )
    throw new Error(
      'Missing STRIPE_STARTER_CHATS_PRICE_ID or STRIPE_PRO_CHATS_PRICE_ID'
    )

  const workspacesWithPaidPlan = await prisma.workspace.findMany({
    where: {
      plan: {
        in: ['PRO', 'STARTER'],
      },
      isSuspended: false,
    },
    select: {
      plan: true,
      name: true,
      id: true,
      stripeId: true,
      isQuarantined: true,
      members: {
        select: {
          user: {
            select: { email: true },
          },
        },
      },
    },
  })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15',
  })

  const todayMidnight = new Date()
  todayMidnight.setUTCHours(0, 0, 0, 0)

  for (const workspace of workspacesWithPaidPlan) {
    console.log(
      'Migrating workspace:',
      workspace.id,
      workspace.name,
      JSON.stringify(workspace.members.map((member) => member.user.email))
    )
    if (!workspace.stripeId) {
      console.log('No stripe ID, skipping...')
      continue
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: workspace.stripeId,
    })

    const currentSubscription = subscriptions.data
      .filter((sub) => ['past_due', 'active'].includes(sub.status))
      .sort((a, b) => a.created - b.created)
      .shift()

    if (!currentSubscription) {
      console.log('No current subscription in workspace:', workspace.id)
      continue
    }

    if (
      !currentSubscription.items.data.find(
        (item) =>
          item.price.id === process.env.STRIPE_STARTER_PRICE_ID ||
          item.price.id === process.env.STRIPE_PRO_PRICE_ID
      )
    ) {
      console.log(
        'Could not find STARTER or PRO plan in items for workspace:',
        workspace.id
      )
      continue
    }

    const subscription = await stripe.subscriptions.update(
      currentSubscription.id,
      {
        items: [
          ...currentSubscription.items.data.flatMap<Stripe.SubscriptionUpdateParams.Item>(
            (item) => {
              if (
                item.price.id === process.env.STRIPE_STARTER_PRICE_ID ||
                item.price.id === process.env.STRIPE_PRO_PRICE_ID
              )
                return {
                  id: item.id,
                  price: item.price.id,
                  quantity: item.quantity,
                }
              if (
                item.price.id === process.env.STRIPE_STARTER_YEARLY_PRICE_ID ||
                item.price.id === process.env.STRIPE_PRO_YEARLY_PRICE_ID
              )
                return [
                  {
                    id: item.id,
                    price: item.price.id,
                    quantity: item.quantity,
                    deleted: true,
                  },
                  {
                    price:
                      workspace.plan === 'STARTER'
                        ? process.env.STRIPE_STARTER_PRICE_ID
                        : process.env.STRIPE_PRO_PRICE_ID,
                    quantity: 1,
                  },
                ]
              return {
                id: item.id,
                price: item.price.id,
                quantity: item.quantity,
                deleted: true,
              }
            }
          ),
          {
            price:
              workspace.plan === 'STARTER'
                ? process.env.STRIPE_STARTER_CHATS_PRICE_ID
                : process.env.STRIPE_PRO_CHATS_PRICE_ID,
          },
        ],
      }
    )

    const totalResults = await prisma.result.count({
      where: {
        typebot: { workspaceId: workspace.id },
        hasStarted: true,
        createdAt: {
          gte: new Date(subscription.current_period_start * 1000),
          lt: todayMidnight,
        },
      },
    })

    if (workspace.plan === 'STARTER' && totalResults >= 4000) {
      console.log(
        'Workspace has more than 4000 chats, automatically upgrading to PRO plan',
        workspace.id
      )
      const currentPlanItemId = subscription?.items.data.find((item) =>
        [
          process.env.STRIPE_STARTER_PRICE_ID,
          process.env.STRIPE_PRO_PRICE_ID,
        ].includes(item.price.id)
      )?.id

      await stripe.subscriptions.update(subscription.id, {
        items: [
          {
            id: currentPlanItemId,
            price: process.env.STRIPE_PRO_PRICE_ID,
            quantity: 1,
          },
        ],
      })

      await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          plan: 'PRO',
        },
      })
    }

    const subscriptionItem = currentSubscription.items.data.find(
      (item) =>
        item.price.id === process.env.STRIPE_STARTER_CHATS_PRICE_ID ||
        item.price.id === process.env.STRIPE_PRO_CHATS_PRICE_ID
    )

    if (!subscriptionItem)
      throw new Error(
        `Could not find subscription item for workspace ${workspace.id}`
      )

    const idempotencyKey = createId()

    console.log('Reporting total results:', totalResults)
    await stripe.subscriptionItems.createUsageRecord(
      subscriptionItem.id,
      {
        quantity: totalResults,
        timestamp: 'now',
      },
      {
        idempotencyKey,
      }
    )

    if (workspace.isQuarantined) {
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          isQuarantined: false,
        },
      })
    }
  }
}

migrateSubscriptionsToUsageBased()
