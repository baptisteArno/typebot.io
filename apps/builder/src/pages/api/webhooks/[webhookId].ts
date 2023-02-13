import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/api'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from 'utils/api'
import { getTypebot } from '@/features/typebot/api/utils/getTypebot'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  const webhookId = req.query.webhookId as string
  if (req.method === 'GET') {
    const webhook = await prisma.webhook.findFirst({
      where: {
        id: webhookId,
        typebot: {
          OR: [
            { workspace: { members: { some: { userId: user.id } } } },
            {
              collaborators: {
                some: {
                  userId: user.id,
                },
              },
            },
          ],
        },
      },
    })
    return res.send({ webhook })
  }
  if (req.method === 'PUT') {
    const data = req.body
    if (!('typebotId' in data)) return badRequest(res)
    const typebot = await getTypebot({
      accessLevel: 'write',
      typebotId: data.typebotId,
      user,
    })
    if (!typebot) return forbidden(res)
    const webhook = await prisma.webhook.upsert({
      where: {
        id: webhookId,
      },
      create: data,
      update: data,
    })
    return res.send({ webhook })
  }
  methodNotAllowed(res)
}

export default handler
