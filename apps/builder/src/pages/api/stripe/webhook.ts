import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@typebot.io/lib/api'
import Stripe from 'stripe'
import Cors from 'micro-cors'
import { buffer } from 'micro'
import prisma from '@typebot.io/lib/prisma'
import { Plan, WorkspaceRole } from '@typebot.io/prisma'
import { RequestHandler } from 'next/dist/server/next'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'
import { Settings } from '@typebot.io/schemas'
import { env } from '@typebot.io/env'

if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET)
  throw new Error('STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing')
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

const webhookSecret = env.STRIPE_WEBHOOK_SECRET as string

export const config = {
  api: {
    bodyParser: false,
  },
}

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']

    if (!sig) return res.status(400).send(`stripe-signature is missing`)
    try {
      const event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig.toString(),
        webhookSecret
      )
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          const metadata = session.metadata as unknown as
            | {
                plan: 'STARTER' | 'PRO'
                additionalChats: string
                workspaceId: string
                userId: string
              }
            | { claimableCustomPlanId: string; userId: string }
          if ('plan' in metadata) {
            const { workspaceId, plan, additionalChats } = metadata
            if (!workspaceId || !plan || !additionalChats)
              return res
                .status(500)
                .send({ message: `Couldn't retrieve valid metadata` })
            const workspace = await prisma.workspace.update({
              where: { id: workspaceId },
              data: {
                plan,
                stripeId: session.customer as string,
                additionalChatsIndex: parseInt(additionalChats),
                isQuarantined: false,
              },
              include: {
                members: {
                  select: { user: { select: { id: true } } },
                  where: {
                    role: WorkspaceRole.ADMIN,
                  },
                },
              },
            })

            for (const user of workspace.members.map((member) => member.user)) {
              if (!user?.id) continue
              await sendTelemetryEvents([
                {
                  name: 'Subscription updated',
                  workspaceId,
                  userId: user.id,
                  data: {
                    plan,
                    additionalChatsIndex: parseInt(additionalChats),
                  },
                },
              ])
            }
          } else {
            const { claimableCustomPlanId, userId } = metadata
            if (!claimableCustomPlanId)
              return res
                .status(500)
                .send({ message: `Couldn't retrieve valid metadata` })
            const { workspaceId, chatsLimit, seatsLimit, storageLimit } =
              await prisma.claimableCustomPlan.update({
                where: { id: claimableCustomPlanId },
                data: { claimedAt: new Date() },
              })

            await prisma.workspace.updateMany({
              where: { id: workspaceId },
              data: {
                plan: Plan.CUSTOM,
                stripeId: session.customer as string,
                customChatsLimit: chatsLimit,
                customStorageLimit: storageLimit,
                customSeatsLimit: seatsLimit,
              },
            })

            await sendTelemetryEvents([
              {
                name: 'Subscription updated',
                workspaceId,
                userId,
                data: {
                  plan: Plan.CUSTOM,
                  additionalChatsIndex: 0,
                },
              },
            ])
          }

          return res.status(200).send({ message: 'workspace upgraded in DB' })
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          const { data } = await stripe.subscriptions.list({
            customer: subscription.customer as string,
            limit: 1,
            status: 'active',
          })
          const existingSubscription = data[0] as
            | Stripe.Subscription
            | undefined
          if (existingSubscription)
            return res.send({
              message:
                'An active subscription still exists. Skipping downgrade.',
            })
          const workspace = await prisma.workspace.update({
            where: {
              stripeId: subscription.customer as string,
            },
            data: {
              plan: Plan.FREE,
              additionalChatsIndex: 0,
              customChatsLimit: null,
              customStorageLimit: null,
              customSeatsLimit: null,
            },
            include: {
              members: {
                select: { user: { select: { id: true } } },
                where: {
                  role: WorkspaceRole.ADMIN,
                },
              },
            },
          })

          for (const user of workspace.members.map((member) => member.user)) {
            if (!user?.id) continue
            await sendTelemetryEvents([
              {
                name: 'Subscription updated',
                workspaceId: workspace.id,
                userId: user.id,
                data: {
                  plan: Plan.FREE,
                  additionalChatsIndex: 0,
                },
              },
            ])
          }

          const typebots = await prisma.typebot.findMany({
            where: {
              workspaceId: workspace.id,
              isArchived: { not: true },
            },
            include: { publishedTypebot: true },
          })
          for (const typebot of typebots) {
            const settings = typebot.settings as Settings
            if (settings.general.isBrandingEnabled) continue
            await prisma.typebot.updateMany({
              where: { id: typebot.id },
              data: {
                settings: {
                  ...settings,
                  general: {
                    ...settings.general,
                    isBrandingEnabled: true,
                  },
                },
              },
            })
            const publishedTypebotSettings = typebot.publishedTypebot
              ?.settings as Settings | null
            if (
              !publishedTypebotSettings ||
              publishedTypebotSettings?.general.isBrandingEnabled
            )
              continue
            await prisma.publicTypebot.updateMany({
              where: { id: typebot.id },
              data: {
                settings: {
                  ...publishedTypebotSettings,
                  general: {
                    ...publishedTypebotSettings.general,
                    isBrandingEnabled: true,
                  },
                },
              },
            })
          }
          return res.send({ message: 'workspace downgraded in DB' })
        }
        default: {
          return res.status(304).send({ message: 'event not handled' })
        }
      }
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        console.error(err)
        return res.status(400).send(`Webhook Error: ${err.message}`)
      }
      return res.status(500).send(`Error occured: ${err}`)
    }
  }
  return methodNotAllowed(res)
}

export default cors(webhookHandler as RequestHandler)
