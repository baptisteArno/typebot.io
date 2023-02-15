import prisma from '@/lib/prisma'
import { defaultWebhookAttributes, Webhook } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/api'
import { methodNotAllowed, notAuthenticated, notFound } from 'utils/api'
import { getTypebot } from '@/features/typebot/api/utils/getTypebot'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId as string
    const data = req.body.data as Partial<Webhook>
    const typebot = await getTypebot({
      accessLevel: 'write',
      user,
      typebotId,
    })
    if (!typebot) return notFound(res)
    const webhook = await prisma.webhook.create({
      data: { ...defaultWebhookAttributes, ...data, typebotId },
    })
    return res.send({ webhook })
  }
  methodNotAllowed(res)
}

export default handler
