import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'
import Stripe from 'stripe'
import Cors from 'micro-cors'
import { buffer } from 'micro'
import prisma from 'libs/prisma'
import { Plan } from 'db'
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
          const { customer_email } = session
          if (!customer_email)
            return res.status(500).send(`customer_email not found`)
          await prisma.user.update({
            where: { email: customer_email },
            data: { plan: Plan.PRO, stripeId: session.customer as string },
          })
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          await prisma.user.update({
            where: {
              stripeId: subscription.customer as string,
            },
            data: {
              plan: Plan.FREE,
            },
          })
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err)
        return res.status(400).send(`Webhook Error: ${err.message}`)
      }
    }
  }
  return methodNotAllowed(res)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withSentry(cors(webhookHandler as any))
