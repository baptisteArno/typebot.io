import prisma from '@/lib/prisma'
import { Webhook } from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from '@typebot.io/lib/api'
import { getTypebot } from '@/features/typebot/helpers/getTypebot'
import { omit } from '@typebot.io/lib'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
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
      data: omit(data, 'id', 'typebotId'),
    })
    return res.send({ webhook })
  }
  methodNotAllowed(res)
}

export default handler
