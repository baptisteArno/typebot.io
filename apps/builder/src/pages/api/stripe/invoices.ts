import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from 'utils/api'
import Stripe from 'stripe'
import { getAuthenticatedUser } from '@/features/auth/api'
import prisma from '@/lib/prisma'
import { WorkspaceRole } from 'db'

// TODO: Delete
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const stripeId = req.query.stripeId as string | undefined
    if (!stripeId) return badRequest(res)
    if (!process.env.STRIPE_SECRET_KEY)
      throw Error('STRIPE_SECRET_KEY var is missing')
    const workspace = await prisma.workspace.findFirst({
      where: {
        stripeId,
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
    })
    if (!workspace?.stripeId) return forbidden(res)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    })
    const invoices = await stripe.invoices.list({
      customer: workspace.stripeId,
    })
    res.send({
      invoices: invoices.data.map((i) => ({
        id: i.number,
        url: i.invoice_pdf,
        amount: i.subtotal,
        currency: i.currency,
        date: i.status_transitions.paid_at,
      })),
    })
    return
  }
  return methodNotAllowed(res)
}

export default handler
