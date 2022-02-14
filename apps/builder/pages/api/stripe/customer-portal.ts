import { User } from 'db'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'utils'
import Stripe from 'stripe'
import { withSentry } from '@sentry/nextjs'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })
  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })
  const user = session.user as User
  if (!user.stripeId)
    return res.status(401).json({ message: 'Not authenticated' })
  if (req.method === 'GET') {
    if (!process.env.STRIPE_SECRET_KEY)
      throw Error('STRIPE_SECRET_KEY var is missing')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    })
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeId,
      return_url: `${req.headers.origin}/account`,
    })
    res.status(201).redirect(session.url)
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
