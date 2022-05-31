import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'
import Stripe from 'stripe'
import { withSentry } from '@sentry/nextjs'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    if (!process.env.STRIPE_SECRET_KEY)
      throw Error('STRIPE_SECRET_KEY var is missing')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    })
    const { email, currency, plan, workspaceId } =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const session = await stripe.checkout.sessions.create({
      success_url: `${req.headers.origin}/typebots?stripe=success`,
      cancel_url: `${req.headers.origin}/typebots?stripe=cancel`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      customer_email: email,
      mode: 'subscription',
      metadata: { workspaceId, plan },
      line_items: [
        {
          price: getPrice(plan, currency),
          quantity: 1,
        },
      ],
    })
    return res.status(201).send({ sessionId: session.id })
  }
  return methodNotAllowed(res)
}

const getPrice = (plan: 'pro' | 'team', currency: 'eur' | 'usd') => {
  if (plan === 'team')
    return currency === 'eur'
      ? process.env.STRIPE_PRICE_TEAM_EUR_ID
      : process.env.STRIPE_PRICE_TEAM_USD_ID
  return currency === 'eur'
    ? process.env.STRIPE_PRICE_EUR_ID
    : process.env.STRIPE_PRICE_USD_ID
}

export default withSentry(handler)
