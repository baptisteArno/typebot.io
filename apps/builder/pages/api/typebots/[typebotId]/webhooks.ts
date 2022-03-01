import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { defaultWebhookAttributes } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId as string
    const webhook = await prisma.webhook.create({
      data: { typebotId, ...defaultWebhookAttributes },
    })
    return res.send({ webhook })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)
