import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'
import Stripe from 'stripe'
import Cors from 'micro-cors'
import { buffer } from 'micro'
//import prisma from 'libs/prisma'
import { Plan } from 'model'
import { withSentry } from '@sentry/nextjs'

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)
  throw new Error('STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
})

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string

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
          const { metadata } = session
          if (!metadata?.workspaceId || !metadata?.plan)
            return res.status(500).send({ message: `customer_email not found` })
          // await prisma.workspace.update({
          //   where: { id: metadata.workspaceId },
          //   data: {
          //     plan: metadata.plan === 'team' ? Plan.TEAM : Plan.PRO,
          //     stripeId: session.customer as string,
          //   },
          // })
          return res.status(200).send({ message: 'workspace upgraded in DB' })
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          const { metadata } = subscription
          if (!metadata.workspaceId)
            return res.status(500).send(`workspaceId not found`)
          // await prisma.workspace.update({
          //   where: {
          //     id: metadata.workspaceId,
          //   },
          //   data: {
          //     plan: Plan.FREE,
          //   },
          // })
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withSentry(cors(webhookHandler as any))
