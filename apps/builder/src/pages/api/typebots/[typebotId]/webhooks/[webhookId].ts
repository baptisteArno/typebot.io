import prisma from '@/lib/prisma'
import { Webhook } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/api'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from 'utils/api'
import { getTypebot } from '@/features/typebot/api/utils/getTypebot'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  const typebotId = req.query.typebotId as string
  const webhookId = req.query.webhookId as string
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebot = getTypebot({
      accessLevel: 'read',
      typebotId,
      user,
    })
    if (!typebot) return notFound(res)
    const webhook = await prisma.webhook.findFirst({
      where: {
        id: webhookId,
        typebotId,
      },
    })
    return res.send({ webhook })
  }
  if (req.method === 'PATCH') {
    const data = req.body.data as Partial<Webhook>
    if (!('typebotId' in data)) return badRequest(res)
    const typebot = await getTypebot({
      accessLevel: 'write',
      typebotId,
      user,
    })
    if (!typebot) return forbidden(res)
    const webhook = await prisma.webhook.update({
      where: {
        id: webhookId,
      },
      data,
    })
    return res.send({ webhook })
  }
  methodNotAllowed(res)
}

export default handler
