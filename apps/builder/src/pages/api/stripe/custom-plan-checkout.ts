import { Plan } from '@typebot.io/prisma'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import Stripe from 'stripe'
import { methodNotAllowed, notAuthenticated } from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const session = await createCheckoutSession(user.id)
    if (!session?.url) return res.redirect('/typebots')
    return res.redirect(session.url)
  }

  return methodNotAllowed(res)
}

const createCheckoutSession = async (userId: string) => {
  if (!process.env.STRIPE_SECRET_KEY)
    throw Error('STRIPE_SECRET_KEY var is missing')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  })

  const claimableCustomPlan = await prisma.claimableCustomPlan.findFirst({
    where: { workspace: { members: { some: { userId } } } },
  })

  if (!claimableCustomPlan) return null

  return stripe.checkout.sessions.create({
    success_url: `${process.env.NEXTAUTH_URL}/typebots?stripe=${Plan.CUSTOM}&success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/typebots?stripe=cancel`,
    mode: 'subscription',
    metadata: {
      claimableCustomPlanId: claimableCustomPlan.id,
      userId,
    },
    currency: claimableCustomPlan.currency,
    automatic_tax: { enabled: true },
    line_items: [
      {
        price_data: {
          currency: claimableCustomPlan.currency,
          tax_behavior: 'exclusive',
          recurring: { interval: 'month' },
          product_data: {
            name: claimableCustomPlan.name,
            description: claimableCustomPlan.description ?? undefined,
          },
          unit_amount: claimableCustomPlan.price * 100,
        },
        quantity: 1,
      },
    ],
  })
}

export default handler
