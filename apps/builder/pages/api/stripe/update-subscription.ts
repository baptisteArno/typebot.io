import { withSentry } from '@sentry/nextjs'
import { Plan } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { badRequest, methodNotAllowed } from 'utils'
import { getPrice } from './checkout'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { customerId, currency, plan, workspaceId } =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!process.env.STRIPE_SECRET_KEY)
      throw Error('STRIPE_SECRET_KEY var is missing')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-08-01',
    })
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    })
    const { id, items } = subscriptions.data[0]
    const newPrice = getPrice(plan, currency)
    const oldPrice = subscriptions.data[0].items.data[0].price.id
    if (newPrice === oldPrice) return badRequest(res)
    await stripe.subscriptions.update(id, {
      cancel_at_period_end: false,
      proration_behavior: 'create_prorations',
      items: [
        {
          id: items.data[0].id,
          price: getPrice(plan, currency),
        },
      ],
    })
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        plan: plan === 'team' ? Plan.TEAM : Plan.PRO,
      },
    })
    return res.send({ message: 'success' })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)
