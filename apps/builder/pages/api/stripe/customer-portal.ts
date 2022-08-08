import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from 'utils'
import Stripe from 'stripe'
import { withSentry } from '@sentry/nextjs'
import { getAuthenticatedUser } from 'services/api/utils'
import prisma from 'libs/prisma'
import { WorkspaceRole } from 'db'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const workspaceId = req.query.workspaceId as string | undefined
    if (!workspaceId) return badRequest(res)
    if (!process.env.STRIPE_SECRET_KEY)
      throw Error('STRIPE_SECRET_KEY var is missing')
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
    })
    if (!workspace?.stripeId) return forbidden(res)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-08-01',
    })
    const session = await stripe.billingPortal.sessions.create({
      customer: workspace.stripeId,
      return_url: req.headers.referer,
    })
    res.redirect(session.url)
    return
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
